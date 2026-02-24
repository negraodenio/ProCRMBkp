import { PlanLevel, PLANS, getNextPlan } from "./plans";

export interface PlanCheckResult {
  allowed: boolean;
  message?: string;
  upgrade_to?: PlanLevel | null;
}

export type ActionType =
  | "create_lead"
  | "use_ia_tool"
  | "add_user"
  | "whatsapp"
  | "automations"
  | "proposals"
  | "rag_chatbot"
  | "advanced_reports"
  | "api_access";

export function checkPlanLimit(
  plan: PlanLevel,
  usage: { leads_count: number; users_count: number; ia_tools_used_month: number },
  action: ActionType
): PlanCheckResult {
  const currentPlan = PLANS[plan];

  const checks: Record<ActionType, () => PlanCheckResult> = {
    "create_lead": () => {
      if (currentPlan.limits.leads === -1) return { allowed: true };
      if (usage.leads_count >= currentPlan.limits.leads) {
        return {
          allowed: false,
          message: `Limite de ${currentPlan.limits.leads} leads atingido. Faça upgrade.`,
          upgrade_to: getNextPlan(plan)
        };
      }
      return { allowed: true };
    },
    "use_ia_tool": () => {
      if (currentPlan.limits.ia_tools_per_month === -1) return { allowed: true };
      if (usage.ia_tools_used_month >= currentPlan.limits.ia_tools_per_month) {
        return {
          allowed: false,
          message: `Limite de ${currentPlan.limits.ia_tools_per_month} IA Tools/mês atingido. Faça upgrade.`,
          upgrade_to: getNextPlan(plan)
        };
      }
      return { allowed: true };
    },
    "add_user": () => {
      if (currentPlan.limits.users === -1) return { allowed: true };
      if (usage.users_count >= currentPlan.limits.users) {
        return {
          allowed: false,
          message: `Limite de ${currentPlan.limits.users} usuários atingido. Faça upgrade.`,
          upgrade_to: getNextPlan(plan)
        };
      }
      return { allowed: true };
    },
    "whatsapp": () => ({
      allowed: currentPlan.limits.whatsapp,
      message: "WhatsApp disponível a partir do plano Starter.",
      upgrade_to: "starter"
    }),
    "automations": () => ({
      allowed: !!currentPlan.limits.automations,
      message: "Automações disponíveis a partir do plano Starter.",
      upgrade_to: "starter"
    }),
    "proposals": () => ({
      allowed: currentPlan.limits.proposals,
      message: "Propostas digitais disponíveis no plano Pro.",
      upgrade_to: "pro"
    }),
    "rag_chatbot": () => ({
      allowed: currentPlan.limits.rag_chatbot,
      message: "RAG Chatbot disponível no plano Pro.",
      upgrade_to: "pro"
    }),
    "advanced_reports": () => ({
      allowed: currentPlan.limits.advanced_reports,
      message: "Relatórios avançados disponíveis no plano Pro.",
      upgrade_to: "pro"
    }),
    "api_access": () => ({
      allowed: currentPlan.limits.api_access,
      message: "API Access disponível no plano Enterprise.",
      upgrade_to: "enterprise"
    })
  };

  return checks[action] ? checks[action]() : { allowed: true };
}
