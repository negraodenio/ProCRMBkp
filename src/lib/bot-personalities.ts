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
    tone_prompt: "TOM: Entusiasmado e vibrante. Use exclamações. EMOJIS: ✨, 🚀, 🎉.",
    temperature: 0.3,
    max_temperature: 0.5,
    use_emojis: true
  },
  friendly: {
    name: "Amigável",
    emoji: "😊",
    description: "Caloroso mas profissional",
    tone_prompt: "TOM: Cordial, solícito e profissional. EMOJIS: Máximo 1 por vez 😊.",
    temperature: 0.2,
    max_temperature: 0.45,
    use_emojis: true
  },
  neutral: {
    name: "Neutro",
    emoji: "📋",
    description: "Objetivo e direto ao ponto",
    tone_prompt: "TOM: Direto, técnico e conciso. EMOJIS: Proibido 🚫.",
    temperature: 0.1,
    max_temperature: 0.3,
    use_emojis: false
  },
  formal: {
    name: "Formal",
    emoji: "🎓",
    description: "Profissional e polido",
    tone_prompt: "TOM: Respeitoso e polido. Use 'Senhor/Senhora'. EMOJIS: Proibido.",
    temperature: 0.1,
    max_temperature: 0.35,
    use_emojis: false
  },
  casual: {
    name: "Casual",
    emoji: "😎",
    description: "Descontraído e informal",
    tone_prompt: "TOM: Informal e leve. Fale como um parceiro/amigo. EMOJIS: 😎, 👍.",
    temperature: 0.3,
    max_temperature: 0.6,
    use_emojis: true
  },
  technical: {
    name: "Técnico",
    emoji: "🔧",
    description: "Detalhado e preciso",
    tone_prompt: "TOM: Técnico e preciso operacionalmente. Foco em clareza extrema. EMOJIS: 🔧, ⚙️.",
    temperature: 0.05,
    max_temperature: 0.45,
    use_emojis: false
  },
  instruction_follower: {
    name: "Seguidor de Instruções (RAG)",
    emoji: "🤖",
    description: "Só manual, sem inventar",
    tone_prompt: "TOM: Robótico e informativo. Baseado em fatos. EMOJIS: Proibido.",
    temperature: 0.0,
    max_temperature: 0.25,
    use_emojis: false
  },
  consultative_sales: {
    name: "Vendas Consultivas (3 Fases)",
    emoji: "💼",
    description: "Qualifica e fecha próximo passo",
    tone_prompt: "TOM: Consultivo e direcionado para fechamento. 1 pergunta por vez.",
    temperature: 0.2,
    max_temperature: 0.55,
    use_emojis: true
  },
  custom: {
    name: "Customizado",
    emoji: "💬",
    description: "Personalize completamente",
    tone_prompt: "TOM: Conforme instruções da empresa.",
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
 * Novo Contrato: "Prove ou Calar" (JSON Evidence Gating)
 */
export const POLICY_GLOBAL_RAG_JSON = `
REGRAS GLOBAIS (OBRIGATÓRIO):
- Fonte Única: use SOMENTE o conteúdo dentro de <context> para fatos.
- Proibição de Alucinação: Se não houver evidência no <context>, declare que não sabe no JSON.
- Idioma: Responda apenas em pt-BR.

MODO "PROVAR OU CALAR" (JSON SCHEMA):
- Você deve responder APENAS em JSON válido com os seguintes campos:
{
  "answer": "Sua resposta (ou null se não houver evidência)",
  "evidence_quotes": ["trecho_literal_copiado_de_contexto", "..."],
  "next_step": "Pergunta curta ou CTA"
}

REGRAS DE EVIDÊNCIA:
- Se "answer" != null, "evidence_quotes" DEVE conter pelo menos 1 frase copiada LITERALMENTE do <context>.
- Se <context> estiver vazio ou insuficiente, use "answer": null e no "next_step" peça clarificação ou ofereça humano.
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
