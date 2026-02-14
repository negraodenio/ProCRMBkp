/**
 * Contrato JSON para Evidence-Gating (RAG)
 */

export interface ChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface RagJson {
  answer: string | null;
  evidence_quotes: string[];
  next_step: string;
}

/**
 * Constrói o prompt de guarda que força a IA a responder em JSON estrito.
 */
export function buildJsonGuardPrompt(): ChatMsg {
  return {
    role: "system",
    content: [
      "Você deve responder OBRIGATORIAMENTE em JSON válido.",
      "Formato de saída:",
      `{
  "answer": "Sua resposta (ou null se não houver evidência)",
  "evidence_quotes": ["citação literal 1 do contexto", "citação literal 2..."],
  "next_step": "Pergunta curta ou CTA"
}`,
      "REGRAS CRÍTICAS:",
      "1. Se 'answer' for preenchido, você DEVE incluir citações LITERAIS e IDÊNTICAS do <context> em 'evidence_quotes'. Não parafraseie.",
      "2. Se existir uma frase relevante no contexto, copie-a exatamente para 'evidence_quotes'; não reescreva.",
      "3. Se o <context> não suportar a resposta, use 'answer': null.",
      "4. Se 'answer' for null, use 'next_step' para pedir mais detalhes ou oferecer ajuda humana.",
      "5. Proibido qualquer texto fora do bloco JSON."
    ].join("\n")
  };
}

/**
 * Parse seguro do JSON retornado pela IA.
 */
export function safeParseRagJson(s: string): RagJson | null {
  try {
    const cleaned = s.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");
    const o = JSON.parse(cleaned);

    if (!o || typeof o !== "object") return null;

    const next_raw = typeof o.next_step === "string" ? o.next_step.trim() : "";

    return {
      answer: typeof o.answer === "string" ? o.answer.trim() : null,
      evidence_quotes: Array.isArray(o.evidence_quotes) ? o.evidence_quotes.map(String) : [],
      next_step: next_raw || "Como posso ajudar?"
    };
  } catch (e) {
    console.warn("[RAG JSON] Parse failed:", e);
    return null;
  }
}
