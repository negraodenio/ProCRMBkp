"use server";

import { createClient } from "@/lib/supabase/server";
import { startOfMonth, subMonths, endOfMonth, format } from "date-fns";

export async function getReportsData() {
  const supabase = await createClient();

  // 1. Get User/Org Context
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Não autorizado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) throw new Error("Organização não encontrada");

  const orgId = profile.organization_id;

  // 2. Fetch Sales Data (Last 6 Months)
  const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
  const { data: deals } = await supabase
    .from("deals")
    .select("value, created_at, status")
    .eq("organization_id", orgId)
    .eq("status", "won")
    .gte("created_at", sixMonthsAgo.toISOString());

  const salesData = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i);
    const monthName = format(monthDate, "MMM");
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    const monthValue = deals
      ?.filter(d => {
        const date = new Date(d.created_at);
        return date >= monthStart && date <= monthEnd;
      })
      .reduce((sum, d) => sum + Number(d.value || 0), 0) || 0;

    salesData.push({ month: monthName, value: monthValue });
  }

  // 3. Fetch Lead Sources
  const { data: contacts } = await supabase
    .from("contacts")
    .select("source")
    .eq("organization_id", orgId);

  const sourcesMap: Record<string, number> = {};
  contacts?.forEach(c => {
    const source = c.source || "Outros";
    sourcesMap[source] = (sourcesMap[source] || 0) + 1;
  });

  const leadSources = Object.entries(sourcesMap).map(([name, count]) => ({
    name,
    value: Math.round((count / (contacts?.length || 1)) * 100),
    color: getSourceColor(name)
  }));

  // 4. Calculate KPIs
  const totalLeads = contacts?.length || 0;
  const { data: allDeals } = await supabase
    .from("deals")
    .select("status, value")
    .eq("organization_id", orgId);

  const wonDeals = allDeals?.filter(d => d.status === "won") || [];
  const conversionRate = totalLeads > 0 ? (wonDeals.length / totalLeads) * 100 : 0;
  const avgTicket = wonDeals.length > 0
    ? wonDeals.reduce((sum, d) => sum + Number(d.value || 0), 0) / wonDeals.length
    : 0;

  return {
    salesData,
    leadSources: leadSources.length > 0 ? leadSources : [
      { name: "Sem Dados", value: 100, color: "#cbd5e1" }
    ],
    stats: {
      totalLeads,
      conversionRate,
      avgTicket
    }
  };
}

function getSourceColor(source: string): string {
  const colors: Record<string, string> = {
    "WhatsApp": "#22c55e",
    "Site": "#3b82f6",
    "Instagram": "#f97316",
    "Indicação": "#eab308",
    "Facebook": "#1877f2",
    "Google": "#ea4335",
    "Outros": "#94a3b8"
  };
  return colors[source] || colors["Outros"];
}
