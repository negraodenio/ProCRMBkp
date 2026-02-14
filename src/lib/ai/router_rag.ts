import { aiChat } from "./client";
import { buildJsonGuardPrompt, safeParseRagJson, ChatMsg } from "./rag_json";
import { evidenceQuotesAreSupported } from "../rag/evidence";

export interface RoutedChatResult {
  text: string;
  model_used: string;
  reason: string;
  raw?: string;
}

export function isOpenEnded(text: string): boolean {
  const s = text.toLowerCase();
  return /(o que tem|que vcs tem|quais|opções|me indica|me indique|recomenda|sugere|cardapio|cardápio|sobremesa|doce|doces|lista|menu)/i.test(s);
}

export function inventoryFromContext(contextText: string): string | null {
  if (!contextText || contextText.length < 50) return null;

  const titles = new Set<string>();
  const lines = contextText.split("\n");

  for (const line of lines) {
    const l = line.trim();
    if (l.includes(">")) {
      const parts = l.split(">").map(p => p.trim()).filter(Boolean);
      const title = parts[parts.length - 1];
      if (title && title.length > 3) titles.add(title);
    }
  }

  const arr = Array.from(titles);
  if (arr.length === 0) return null;

  const top = arr.slice(0, 8).map(t => `• ${t}`).join("\n");
  return `No manual da empresa encontrei estas opções:\n\n${top}\n\nQual desses você gostaria de saber mais detalhes?`;
}

export async function ragAnswerWithGating(params: {
  systemPrompt: string;
  userText: string;
  chatHistory: ChatMsg[];
  contextText: string;
  temperature: number;
  max_tokens: number;
  primaryModelAlias?: "general" | "balanced" | "fast";
  fallbackModelAlias?: "coding" | "balanced";
  showRaw?: boolean;
}): Promise<RoutedChatResult> {
  const {
    systemPrompt,
    userText,
    chatHistory,
    contextText,
    temperature,
    max_tokens,
    primaryModelAlias = "balanced",
    fallbackModelAlias = "coding",
    showRaw = false
  } = params;

  if (isOpenEnded(userText)) {
    const inventory = inventoryFromContext(contextText);
    if (inventory) {
      return { text: inventory, model_used: "inventory_regex", reason: "open_ended_match" };
    }
  }

  const looksGreeting = /^(oi|ola|olá|bom dia|boa tarde|boa noite|hello|hi|oopa|opa)(\!|\?|\.|\s|$)/i.test(userText.trim());
  if (looksGreeting) {
    return { text: "Como posso ajudar você hoje?", model_used: "regex", reason: "greeting_match" };
  }

  const jsonGuard = buildJsonGuardPrompt();
  const baseMessages: ChatMsg[] = [
    { role: "system", content: systemPrompt },
    ...chatHistory,
    { role: "user", content: userText }
  ];

  async function jsonEvidenceChat(modelAlias: any, temp: number, extraSystem?: string) {
    const messages: ChatMsg[] = extraSystem
      ? [{ role: "system", content: extraSystem }, jsonGuard, ...baseMessages]
      : [jsonGuard, ...baseMessages];

    const raw = await aiChat({
      model: modelAlias,
      messages,
      temperature: temp,
      max_tokens,
      response_format: { type: "json_object" }
    });

    return safeParseRagJson(raw);
  }

  let primaryObj: any = null;

  // Strategy B: Primary Model (Qwen)
  try {
    primaryObj = await jsonEvidenceChat(primaryModelAlias, temperature);
    if (!primaryObj) throw new Error("Primary model return null on safeParseRagJson");

    if (primaryObj.answer) {
      if (evidenceQuotesAreSupported({ contextText, evidenceQuotes: primaryObj.evidence_quotes }).ok) {
        return {
          text: `${primaryObj.answer}\n\n${primaryObj.next_step}`,
          model_used: primaryModelAlias,
          reason: "evidence_validated",
          ...(showRaw ? { raw: JSON.stringify(primaryObj) } : {})
        };
      }
      // Evidence mismatch: devolve next_step (bloqueio) com reason certo
      if (primaryObj.next_step) {
        return {
          text: primaryObj.next_step,
          model_used: primaryModelAlias,
          reason: "evidence_mismatch_blocked_primary",
          ...(showRaw ? { raw: JSON.stringify(primaryObj) } : {})
        };
      }
    }
  } catch (err: any) {
    console.error(`[Router ERROR] Strategy B failed: ${err.message}`, err.stack);
  }

  // Strategy B.2: Primary Retry (Factual Optimization) - Apenas se o primary recusou/falhou
  const looksPricing = /\b(preço|custa|valor)\b/i.test(userText);
  const looksOutOfScope = /\b(receita|bolo|cozinhar)\b/i.test(userText);
  const shouldRetry = contextText && contextText.length > 200 &&
                      !isOpenEnded(userText) &&
                      !looksPricing && !looksOutOfScope &&
                      (!primaryObj || !primaryObj.answer);

  if (shouldRetry) {
    try {
      const retryObj = await jsonEvidenceChat(primaryModelAlias, 0,
        "TENTATIVA EXTRA: Escolha 1 trecho curto e literal do contexto e envie como 'evidence_quotes' sem NENHUMA alteração. Se houver evidência fiel, responda com 'answer' preenchido."
      );

      if (retryObj?.answer) {
        if (evidenceQuotesAreSupported({ contextText, evidenceQuotes: retryObj.evidence_quotes }).ok) {
          return {
            text: `${retryObj.answer}\n\n${retryObj.next_step}`,
            model_used: primaryModelAlias,
            reason: "primary_retry_evidence_validated",
            ...(showRaw ? { raw: JSON.stringify(retryObj) } : {})
          };
        }
      }
      if (retryObj && !retryObj.answer && retryObj.next_step) {
        return {
          text: retryObj.next_step,
          model_used: primaryModelAlias,
          reason: "primary_retry_no_evidence_blocked",
          ...(showRaw ? { raw: JSON.stringify(retryObj) } : {})
        };
      }
    } catch (err: any) {
      console.error(`[Router ERROR] Strategy B.2 failed: ${err.message}`, err.stack);
    }
  }

  // Se o primary recusou e não fizemos retry (ou retry falhou), mas temos um next_step do primary, use-o
  if (primaryObj && !primaryObj.answer && primaryObj.next_step && !shouldRetry) {
    return {
      text: primaryObj.next_step,
      model_used: primaryModelAlias,
      reason: "no_evidence_blocked_primary",
      ...(showRaw ? { raw: JSON.stringify(primaryObj) } : {})
    };
  }

  // Strategy C: Fallback Model (DeepSeek-V3)
  try {
    const obj = await jsonEvidenceChat(fallbackModelAlias, 0.1);
    if (!obj) throw new Error("Fallback model return null on safeParseRagJson");

    if (obj && !obj.answer && obj.next_step) {
      return {
        text: obj.next_step,
        model_used: fallbackModelAlias,
        reason: "no_evidence_blocked_fallback",
        ...(showRaw ? { raw: JSON.stringify(obj) } : {})
      };
    }

    if (obj?.answer) {
      if (evidenceQuotesAreSupported({ contextText, evidenceQuotes: obj.evidence_quotes }).ok) {
        return {
          text: `${obj.answer}\n\n${obj.next_step}`,
          model_used: fallbackModelAlias,
          reason: "fallback_evidence_validated",
          ...(showRaw ? { raw: JSON.stringify(obj) } : {})
        };
      }
      if (obj.next_step) {
        return {
          text: obj.next_step,
          model_used: fallbackModelAlias,
          reason: "evidence_mismatch_blocked_fallback",
          ...(showRaw ? { raw: JSON.stringify(obj) } : {})
        };
      }
    }
  } catch (err: any) {
    console.error(`[Router ERROR] Strategy C failed: ${err.message}`, err.stack);
  }

  return {
    text: "Sinto muito, não encontrei essa informação nos manuais. Pode perguntar de outra forma ou quer falar com um humano?",
    model_used: "blocked",
    reason: "no_supported_answer"
  };
}
