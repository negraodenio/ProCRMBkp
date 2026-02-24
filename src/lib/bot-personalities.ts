/**
 * Bot Personality Presets
 * Biblioteca de personalidades pré-configuradas para o bot WhatsApp
 */

export interface PersonalityPreset {
  name: string;
  emoji: string;
  description: string;
  tone_prompt: string;      // Apenas estilo/tom, sem regras de conhecimento
  temperature: number;
  max_temperature: number;  // Clamp de segurança
  use_emojis: boolean;
}

export const PERSONALITY_PRESETS = {
  enthusiastic: {
    name: "Entusiasmado",
    emoji: "🎉",
    description: "Animado e cheio de energia",
    tone_prompt: "TOM: Entusiasmado e vibrante. Seja carismático e use exclamações. EMOJIS: ✨, 🚀, 🎉.",
    temperature: 0.4,
    max_temperature: 0.6,
    use_emojis: true
  },
  friendly: {
    name: "Amigável",
    emoji: "😊",
    description: "Caloroso mas profissional",
    tone_prompt: "TOM: Cordial, solícito e muito prestativo. EMOJIS: Pode usar com moderação 😊, 👍.",
    temperature: 0.3,
    max_temperature: 0.5,
    use_emojis: true
  },
  neutral: {
    name: "Neutro",
    emoji: "📋",
    description: "Objetivo e direto ao ponto",
    tone_prompt: "TOM: Direto, técnico e conciso. Sem rodeios. EMOJIS: Proibido 🚫.",
    temperature: 0.1,
    max_temperature: 0.3,
    use_emojis: false
  },
  formal: {
    name: "Formal",
    emoji: "🎓",
    description: "Profissional e polido",
    tone_prompt: "TOM: Respeitoso e formal. Use 'Senhor/Senhora' tido com elegância. EMOJIS: Proibido.",
    temperature: 0.1,
    max_temperature: 0.4,
    use_emojis: false
  },
  casual: {
    name: "Casual",
    emoji: "😎",
    description: "Descontraído e informal",
    tone_prompt: "TOM: Informal e leve. Fale como um parceiro ou amigo. Gírias leves são ok. EMOJIS: 😎, ✌️, 🙌.",
    temperature: 0.5,
    max_temperature: 0.7,
    use_emojis: true
  },
  technical: {
    name: "Técnico",
    emoji: "🔧",
    description: "Detalhado e preciso",
    tone_prompt: "TOM: Técnico, preciso e focado na resolução de problemas. EMOJIS: 🔧, ⚙️.",
    temperature: 0.1,
    max_temperature: 0.5,
    use_emojis: false
  },
  instruction_follower: {
    name: "Seguidor de Instruções (RAG)",
    emoji: "🤖",
    description: "Baseado no manual, preciso",
    tone_prompt: "TOM: Informativo e útil. Priorize os fatos dos manuais. EMOJIS: 🤖, 📝.",
    temperature: 0.2,
    max_temperature: 0.4,
    use_emojis: false
  },
  consultative_sales: {
    name: "Vendas Consultivas",
    emoji: "💼",
    description: "Ajuda a escolher e fechar",
    tone_prompt: "TOM: Consultivo, empático e focado em entender a dor do cliente para oferecer a solução. 1 pergunta por vez.",
    temperature: 0.3,
    max_temperature: 0.6,
    use_emojis: true
  },
  custom: {
    name: "Customizado",
    emoji: "💬",
    description: "Regras da sua empresa",
    tone_prompt: "TOM: Siga rigorosamente as instruções da empresa.",
    temperature: 0.3,
    max_temperature: 0.7,
    use_emojis: true
  }
} as const;

export type PersonalityType = keyof typeof PERSONALITY_PRESETS;

export function clampTemperature(presetKey: PersonalityType, uiTemp?: number) {
  const p = PERSONALITY_PRESETS[presetKey];
  const t = uiTemp !== undefined ? uiTemp : p.temperature;
  return Math.max(0, Math.min(p.max_temperature, t));
}

/**
 * Novo Contrato: "Inspirado em Fatos" (JSON Evidence Gating)
 */
export const POLICY_GLOBAL_RAG_JSON = `
REGRAS GLOBAIS (SENIOR):
- Fonte de Conhecimento: Use o <context> para responder dúvidas técnicas ou sobre a empresa.
- Naturalidade: Não seja robótico. Responda de forma fluída e humana conforme o TOM escolhido.
- Proibição de Alucinação: Se o <context> não tiver a informação e for algo específico da empresa, use "answer": null.
- Idioma: Responda sempre em pt-BR.

MODO JSON (OBRIGATÓRIO):
- Responda EXCLUSIVAMENTE em JSON válido:
{
  "answer": "Sua resposta natural (ou null se for algo que você REALMENTE não sabe sobre a empresa)",
  "evidence_quotes": ["frase_literal_do_contexto_que_prova_sua_resposta"],
  "next_step": "Pergunta curta para manter o papo ou CTA"
}

REGRAS DE EVIDÊNCIA:
- Se "answer" for preenchido, você DEVE citar o trecho do manual em "evidence_quotes".
- Se o <context> for insuficiente para uma resposta segura sobre a empresa, deixe "answer" como null e peça mais detalhes no "next_step".
`.trim();

/**
 * Build system prompt com técnica Sandwich para máxima adesão
 */
export function buildSystemPrompt(
  presetKey: PersonalityType,
  customInstructions: string,
  context: string,
  contactName: string,
  config: {
    mention_name?: boolean;
    use_emojis?: boolean;
  }
): string {
  const preset = PERSONALITY_PRESETS[presetKey];

  return [
    "### CRITICAL POLICY (START) ###",
    POLICY_GLOBAL_RAG_JSON,
    "",
    `### TONE CONFIGURATION ###\n${preset.tone_prompt}`,
    customInstructions ? `\n### CUSTOM COMPANY RULES ###\n${customInstructions}` : "",
    contactName ? `\n### CUSTOMER INFO ###\nNome do cliente: ${contactName}` : "",
    "",
    "### KNOWLEDGE SOURCE ###",
    "<context>",
    context || "NENHUM CONTEXTO DISPONÍVEL.",
    "</context>",
    "",
    "### FINAL POLICY REMINDER (END) ###",
    POLICY_GLOBAL_RAG_JSON
  ].filter(Boolean).join("\n");
}
