import { evidenceQuotesAreSupported } from "../rag/evidence";
import { POLICY_GLOBAL_RAG_JSON } from "../bot-personalities";

type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

export interface RoutedChatResult {
  text: string;
  model_used: "qwen_primary" | "deepseek_json" | "deepseek_fallback" | "inventory_fallback";
  reason: string;
}

/**
 * Heurística para detectar perguntas abertas ou pedidos de recomendação genéricos.
 */
export function isOpenEndedQuery(text: string): boolean {
  const s = text.toLowerCase();
  return /(o que tem|quais|opções|me indica|me indique|recomenda|sugere|sobremesa|doces|doce|cardápio|menu|lista|novidades)/i.test(s);
}

/**
 * Tenta fazer o parse de JSON de forma segura.
 */
function safeJsonParse(s: string): any | null {
  try {
    // Limpeza básica para lidar com possíveis quebras de linha ou markdown no retorno
    const cleaned = s.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

/**
 * Extrai títulos e itens do contexto para responder perguntas abertas rapidamente.
 */
function fallbackOpenEnded(contextText: string): string | null {
  const titles = new Set<string>();
  // Procura por padrões como [CONTEXTO] ... > Título ou apenas linhas de título
  for (const line of contextText.split("\n")) {
    const l = line.trim();
    if (!l.includes(">")) continue;

    // Tenta pegar a parte após o último '>' que geralmente é o título/item
    const parts = l.split(">").map(x => x.trim()).filter(Boolean);
    const title = parts[parts.length - 1];
    if (title && title.length > 3) titles.add(title);
  }

  const arr = Array.from(titles);
  if (!arr.length) return null;

  // Limita a 8 itens para não poluir o WhatsApp
  const top = arr.slice(0, 8).map(x => `• ${x}`).join("\n");
  return `No manual encontrei estas opções:\n\n${top}\n\nQual desses você gostaria de saber mais detalhes?`;
}

/**
 * Função de roteamento principal.
 */
export async function chatWithRouting(params: {
  aiChat: (p: any) => Promise<string>;
  messages: ChatMsg[];
  contextText: string;
  temperature: number;
  max_tokens: number;
  qwenModel: string;
  deepseekModel: string;
}): Promise<RoutedChatResult> {
  const { aiChat, messages, contextText, temperature, max_tokens, qwenModel, deepseekModel } = params;
  const userMessage = messages[messages.length - 1]?.content || "";

  // 1. Estratégia de Inventário Manual (Regex) para perguntas abertas
  if (isOpenEndedQuery(userMessage) && contextText.length > 100) {
      const inventory = fallbackOpenEnded(contextText);
      if (inventory) {
          return {
              text: inventory,
              model_used: "inventory_fallback",
              reason: "open_ended_regex_match"
          };
      }
  }

  // 2. Primário: DeepSeek JSON Mode (Evidence-Gated)
  // Para RAG de produção, preferimos o modelo que respeita o JSON schema para validar evidência.
  try {
    return await jsonEvidenceChatDeepSeek({
        aiChat,
        messages,
        contextText,
        deepseekModel,
        max_tokens
    });
  } catch (error: any) {
    console.warn("[Router] DeepSeek JSON failed, falling back to Qwen:", error.message);

    // 3. Fallback: Qwen Texto (Legado/Emergência)
    const text = await aiChat({
      messages,
      model: qwenModel,
      temperature,
      max_tokens
    });

    return {
      text,
      model_used: "qwen_primary",
      reason: "deepseek_failed_fallback"
    };
  }
}

/**
 * Força a IA a responder em JSON e valida se as citações existem no contexto.
 */
export async function jsonEvidenceChatDeepSeek(params: {
  aiChat: (p: any) => Promise<string>;
  messages: ChatMsg[];
  contextText: string;
  deepseekModel: string;
  max_tokens: number;
}): Promise<RoutedChatResult> {
  const { aiChat, messages, contextText, deepseekModel, max_tokens } = params;

  const messagesWithJson = [
    { role: "system", content: POLICY_GLOBAL_RAG_JSON },
    ...messages
  ];

  const raw = await aiChat({
    messages: messagesWithJson,
    model: deepseekModel,
    temperature: 0.1, // Quase zero para precisão JSON
    max_tokens,
    response_format: { type: "json_object" }
  });

  const obj = safeJsonParse(raw);

  if (!obj) {
    return {
      text: "Não consegui processar sua solicitação com segurança técnica. Pode reformular?",
      model_used: "deepseek_fallback",
      reason: "invalid_json_format"
    };
  }

  const answer = typeof obj.answer === "string" ? obj.answer.trim() : null;
  const quotes = Array.isArray(obj.evidence_quotes) ? obj.evidence_quotes.map(String) : [];
  const nextStep = typeof obj.next_step === "string" ? obj.next_step.trim() : "Como posso te ajudar?";

  // Validação de Evidência (O Coração do Gating)
  const ev = evidenceQuotesAreSupported({
    contextText,
    evidenceQuotes: quotes,
    minQuotes: 1
  });

  if (answer && ev.ok) {
    return {
      text: `${answer}\n\n${nextStep}`,
      model_used: "deepseek_json",
      reason: "evidence_validated"
    };
  }

  // Se não houver evidência técnica, bloqueamos o conteúdo "alucinado" e enviamos apenas o próximo passo.
  return {
    text: nextStep || "Sinto muito, mas não encontrei essa informação nos manuais da empresa. Posso te ajudar com outra coisa?",
    model_used: "deepseek_json",
    reason: answer ? "evidence_mismatch_blocked" : "no_context_support"
  };
}
