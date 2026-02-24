export type PlanLevel = 'free' | 'starter' | 'pro' | 'enterprise';

export interface PlanLimits {
  leads: number;
  users: number;
  ia_tools_per_month: number;
  pipeline_visual: boolean;
  dashboard: 'basic' | 'advanced';
  whatsapp: boolean;
  whatsapp_unlimited: boolean;
  automations: boolean | 'basic' | 'unlimited';
  proposals: boolean;
  rag_chatbot: boolean;
  advanced_reports: boolean;
  api_access: boolean;
  white_label: boolean;
  priority_support: boolean;
  sla: boolean;
}

export interface Plan {
  name: string;
  price: number | null;
  currency?: string;
  interval?: string;
  stripe_price_id: string | null;
  popular?: boolean;
  custom?: boolean;
  limits: PlanLimits;
}

export const PLANS: Record<PlanLevel, Plan> = {
  free: {
    name: "Free",
    price: 0,
    stripe_price_id: null,
    limits: {
      leads: 100,
      users: 1,
      ia_tools_per_month: 3,
      pipeline_visual: true,
      dashboard: "basic",
      whatsapp: false,
      whatsapp_unlimited: false,
      automations: false,
      proposals: false,
      rag_chatbot: false,
      advanced_reports: false,
      api_access: false,
      white_label: false,
      priority_support: false,
      sla: false
    }
  },
  starter: {
    name: "Starter",
    price: 29,
    currency: "eur",
    interval: "month",
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER || "price_starter_placeholder",
    limits: {
      leads: 1000,
      users: 2,
      ia_tools_per_month: 50,
      pipeline_visual: true,
      dashboard: "basic",
      whatsapp: true,
      whatsapp_unlimited: false,
      automations: "basic",
      proposals: false,
      rag_chatbot: false,
      advanced_reports: false,
      api_access: false,
      white_label: false,
      priority_support: false,
      sla: false
    }
  },
  pro: {
    name: "Pro",
    price: 79,
    currency: "eur",
    interval: "month",
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || "price_pro_placeholder",
    popular: true,
    limits: {
      leads: 10000,
      users: 10,
      ia_tools_per_month: -1, // ilimitado
      pipeline_visual: true,
      dashboard: "advanced",
      whatsapp: true,
      whatsapp_unlimited: true,
      automations: "unlimited",
      proposals: true,
      rag_chatbot: true,
      advanced_reports: true,
      api_access: false,
      white_label: false,
      priority_support: false,
      sla: false
    }
  },
  enterprise: {
    name: "Enterprise",
    price: null,
    stripe_price_id: null,
    custom: true,
    limits: {
      leads: -1,
      users: -1,
      ia_tools_per_month: -1,
      pipeline_visual: true,
      dashboard: "advanced",
      whatsapp: true,
      whatsapp_unlimited: true,
      automations: "unlimited",
      proposals: true,
      rag_chatbot: true,
      advanced_reports: true,
      api_access: true,
      white_label: true,
      priority_support: true,
      sla: true
    }
  }
};

export function getNextPlan(currentPlan: PlanLevel): PlanLevel | null {
  const order: PlanLevel[] = ["free", "starter", "pro", "enterprise"];
  const idx = order.indexOf(currentPlan);
  return idx < order.length - 1 ? order[idx + 1] : null;
}
