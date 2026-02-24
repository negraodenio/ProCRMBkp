"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { checkPlanLimit, ActionType } from "@/lib/stripe/limits";
import { PlanLevel } from "@/lib/stripe/plans";
import { useProfile } from "./use-profile";

export function usePlanLimit() {
  const { profile } = useProfile();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [lastCheckMessage, setLastCheckMessage] = useState<string | undefined>();
  const supabase = createClient();

  const checkLimit = useCallback(async (action: ActionType) => {
    if (!profile?.organization_id) return { allowed: true };

    // 1. Fetch real-time usage and plan
    const { data: org } = await supabase
      .from("organizations")
      .select("subscription_plan, ia_tools_used_month")
      .eq("id", profile.organization_id)
      .single();

    if (!org) return { allowed: true };

    const plan = (org.subscription_plan || "free") as PlanLevel;

    // Fetch leads count if needed
    let leadsCount = 0;
    if (action === "create_lead") {
      const { count } = await supabase
        .from("contacts")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", profile.organization_id)
        .eq("type", "lead");
      leadsCount = count || 0;
    }

    // Fetch users count if needed
    let usersCount = 0;
    if (action === "add_user") {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", profile.organization_id);
      usersCount = count || 0;
    }

    const result = checkPlanLimit(
      plan,
      {
        leads_count: leadsCount,
        users_count: usersCount,
        ia_tools_used_month: org.ia_tools_used_month || 0
      },
      action
    );

    if (!result.allowed) {
      setLastCheckMessage(result.message);
      setIsUpgradeModalOpen(true);
    }

    return result;
  }, [profile, supabase]);

  return {
    checkLimit,
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    lastCheckMessage,
    profile,
  };
}
