/**
 * Normaliza uma string para comparação, removendo acentos, pontuação extra
 * e normalizando espaços e maiúsculas/minúsculas.
 */
export function normalizeForMatch(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[“”‘’"]/g, '"')
    .replace(/[^\p{L}\p{N}\s]/gu, " ") // remove pontuação mantendo letras e números
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Interface para o resultado da validação de evidência
 */
export interface EvidenceValidationResult {
  ok: boolean;
  matched: string[];
  reasons: string[];
}

/**
 * Verifica se as citações de evidência fornecidas pela IA têm suporte no contexto.
 * Suporta match estrito (substring) e fallback fuzzy (overlap de tokens).
 */
export function evidenceQuotesAreSupported(params: {
  contextText: string;
  evidenceQuotes: string[];
  minQuotes?: number;        // Mínimo de citações válidas necessárias (default 1)
  minQuoteLen?: number;      // Tamanho mínimo para uma citação ser considerada (default 12)
  minTokenOverlap?: number;  // Overlap mínimo para match fuzzy (default 0.55)
  minTokensForFuzzy?: number; // Mínimo de tokens para considerar fuzzy (default 6)
}): EvidenceValidationResult {
  const {
    contextText,
    evidenceQuotes,
    minQuotes = 1,
    minQuoteLen = 12,
    minTokenOverlap = 0.55,
    minTokensForFuzzy = 6,
  } = params;

  const reasons: string[] = [];
  const matched: string[] = [];
  let maxOverlapFound = 0;

  // 1. Sanidade Básica
  if (!contextText?.trim()) {
    return { ok: false, matched, reasons: ["empty_context"] };
  }
  if (!Array.isArray(evidenceQuotes) || evidenceQuotes.length === 0) {
    return { ok: false, matched, reasons: ["no_quotes"] };
  }

  const ctxN = normalizeForMatch(contextText);
  // Dividir o contexto em segmentos (linhas/chunks) para evitar tokens espalhados
  const ctxSegments = ctxN.split("\n").map(s => s.trim()).filter(s => s.length > 5);

  // 2. Processar cada citação
  for (const q of evidenceQuotes) {
    const qRaw = String(q || "").trim();
    if (qRaw.length < minQuoteLen) {
      reasons.push(`quote_too_short: "${qRaw.slice(0, 20)}..."`);
      continue;
    }

    const qN = normalizeForMatch(qRaw);

    // Estratégia A: Substring Estrita (Melhor Fidelidade)
    if (qN && ctxN.includes(qN)) {
      matched.push(qRaw);
      continue;
    }

    // Estratégia B: Fuzzy Segment Overlap (Janela Deslizante por Segmento)
    const qTokens = qN.split(" ").filter(t => t.length >= 3);
    if (qTokens.length < minTokensForFuzzy) {
      reasons.push(`no_strict_match: "${qRaw.slice(0, 20)}..." (tokens=${qTokens.length} < ${minTokensForFuzzy})`);
      continue;
    }

    const qTokenSet = new Set(qTokens);
    let bestSegmentOverlap = 0;

    for (const seg of ctxSegments) {
      const segTokens = new Set(seg.split(" ").filter(t => t.length >= 3));
      let hits = 0;
      for (const t of qTokenSet) {
        if (segTokens.has(t)) hits++;
      }
      const overlap = hits / qTokenSet.size;
      if (overlap > bestSegmentOverlap) bestSegmentOverlap = overlap;
    }

    if (bestSegmentOverlap > maxOverlapFound) maxOverlapFound = bestSegmentOverlap;

    if (bestSegmentOverlap >= minTokenOverlap) {
      matched.push(qRaw);
    } else {
      reasons.push(`fuzzy_overlap_max=${bestSegmentOverlap.toFixed(2)} for "${qRaw.slice(0, 20)}..."`);
    }
  }

  // 3. Verificação Final
  if (matched.length < minQuotes) {
    if (reasons.length === 0) reasons.push("insufficient_supported_quotes");
  }

  return {
    ok: matched.length >= minQuotes,
    matched,
    reasons: Array.from(new Set(reasons)) // Deduplicar motivos
  };
}
