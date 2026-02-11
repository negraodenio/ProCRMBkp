"use server";

import { createClient } from "@/lib/supabase/server";
import { startOfMonth, subMonths, endOfMonth, format, differenceInDays } from "date-fns"; // added differenceInDays for sales cycle if needed
import { ptBR } from "date-fns/locale";

export type DashboardStats = {
  totalRevenue: number;
  activePipeline: number;
  avgTicket: number;
  conversionRate: number;
  totalLeads: number;
  wonDealsCount: number;
  lostDealsCount: number;
  revenueTrend: { date: string; value: number }[];
  salesFunnel: { name: string; value: number; fill: string }[];
  leadSources: { name: string; value: number; fill: string }[];
  leaderboard: { userId: string; name: string; email: string; value: number; deals: number }[];
};

export async function getAdvancedReportsData(
  startDate?: Date,
  endDate?: Date
): Promise<DashboardStats> {
  const supabase = await createClient();

  // 1. Context & Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Não autorizado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) throw new Error("Organização não encontrada");
  const orgId = profile.organization_id;

  // Default date range: Last 30 days if not provided
  const start = startDate || subMonths(new Date(), 1);
  const end = endDate || new Date();

  // 2. Fetch Relevant Deals (Within Range + Open for pipeline)
  // We fetch ALL deals created in range OR closed in range to be accurate.
  // For simplicity in this version, we'll filter by 'created_at' for leads volume
  // and 'updated_at' (proxy for closing) for revenue, or just use a broader query.

  // Let's get ALL deals for the org to calculate funnel correctly,
  // but we can filter the revenue/volume metrics by date.

  const { data: deals } = await supabase
    .from("deals")
    .select(`
      id,
      title,
      value,
      status,
      created_at,
      stage_id,
      user_id,
      contact:contacts(source)
    `)
    .eq("organization_id", orgId);

  // Also get Stages for funnel names
  const { data: stages } = await supabase
    .from("stages")
    .select("id, name, order")
    .eq("pipeline_id", (
        await supabase.from("pipelines").select("id").eq("organization_id", orgId).eq("is_default", true).single()
      ).data?.id
    )
    .order("order");

  if (!deals) return emptyStats();

  // 3. Process Data In-Memory (Efficient enough for < 10k deals)

  // -- Filter by Date Range for "Period Metrics" --
  const dealsInPeriod = deals.filter(d => {
    const dDate = new Date(d.created_at);
    return dDate >= start && dDate <= end;
  });

  const wonInPeriod = deals.filter(d => {
    // Ideally we'd use a 'won_at' field, but 'created_at' or 'updated_at' is what we have.
    // If we use 'updated_at', we need to fetch it. for now, let's use created_at for simplicity
    // OR just assume 'won' deals currently in that status that were created in that period.
    // To be more 'Accounting' accurate we need 'date of sale'.
    // Let's stick to: "Deals Created in Period that are currently Won" for conversion rate
    // AND "Deals Created in Period" for Total Leads.
    const dDate = new Date(d.created_at);
    return dDate >= start && dDate <= end && d.status === "won";
  });

  // -- KPIs --
  const totalRevenue = wonInPeriod.reduce((acc, d) => acc + Number(d.value || 0), 0);

  // Active Pipeline: All open deals regardless of date (money on the table NOW)
  const activePipeline = deals
    .filter(d => d.status !== "won" && d.status !== "lost" && d.status !== "archived")
    .reduce((acc, d) => acc + Number(d.value || 0), 0);

  const wonCount = wonInPeriod.length;
  // Avg Ticket
  const avgTicket = wonCount > 0 ? totalRevenue / wonCount : 0;

  // Conversion Rate (Won / Total Created in Period)
  const totalLeadsInPeriod = dealsInPeriod.length;
  // Note: Total Leads should ideally come from Contacts table if we track leads without deals.
  // But let's assume every Deal = Lead opportunity.
  const conversionRate = totalLeadsInPeriod > 0 ? (wonCount / totalLeadsInPeriod) * 100 : 0;

  // -- Charts --

  // 1. Revenue Trend (Daily or Weekly based on range)
  // Let's do daily aggregation for the range
  const daysDiff = differenceInDays(end, start);
  const revenueMap = new Map<string, number>();

  // Initialize map
  for(let i=0; i<=daysDiff; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const label = format(date, "dd/MM");
    revenueMap.set(label, 0);
  }

  wonInPeriod.forEach(d => {
     const label = format(new Date(d.created_at), "dd/MM"); // Using created_at for trend of "cohort"
     if (revenueMap.has(label)) {
        revenueMap.set(label, (revenueMap.get(label) || 0) + Number(d.value || 0));
     }
  });

  const revenueTrend = Array.from(revenueMap.entries()).map(([date, value]) => ({
      date,
      value
  }));

  // 2. Lead Sources (from dealsInPeriod)
  const sourceMap = new Map<string, number>();
  dealsInPeriod.forEach(d => {
      // @ts-ignore
      const source = d.contact?.source || "Outros";
      sourceMap.set(source, (sourceMap.get(source) || 0) + Number(d.value || 0)); // Weighted by Value? Or Count? Let's do Pipeline Value by Source
  });

  const leadSources = Array.from(sourceMap.entries())
    .map(([name, value], index) => ({
       name,
       value,
       fill: `hsl(var(--chart-${(index % 5) + 1}))`
    }))
    .sort((a,b) => b.value - a.value);

  // 3. Sales Funnel (Snapshot of CURRENT state, not filtered by date)
  // We want to see where ALL CURRENT open deals are.
  const stageMap = new Map<string, number>();

  // Initialize with all stages
  stages?.forEach(s => stageMap.set(s.id, 0));

  deals.forEach(d => {
      // Only count active deals for funnel? Or all? Usually Funnel = Active Pipeline
      if (d.status !== "won" && d.status !== "lost") {
          if (stageMap.has(d.stage_id)) {
              stageMap.set(d.stage_id, (stageMap.get(d.stage_id) || 0) + 1); // Count of deals
          }
      }
  });

  const salesFunnel = (stages || []).map((s, index) => ({
      name: s.name,
      value: stageMap.get(s.id) || 0,
      fill: `hsl(var(--chart-${(index % 5) + 1}))`
  }));

  // 4. Team Leaderboard
  const userSalesMap = new Map<string, { value: number, count: number }>();

  wonInPeriod.forEach(d => {
      // @ts-ignore
      const userId = d.user_id; // Check if this field exists in query
      if (userId) {
         const current = userSalesMap.get(userId) || { value: 0, count: 0 };
         userSalesMap.set(userId, {
             value: current.value + Number(d.value || 0),
             count: current.count + 1
         });
      }
  });

  const userIds = Array.from(userSalesMap.keys());
  const profilesMap = await getProfilesMap(supabase, userIds);

  const leaderboard = Array.from(userSalesMap.entries())
      .map(([userId, stats]) => ({
          userId,
          name: profilesMap[userId]?.name || 'Desconhecido',
          email: profilesMap[userId]?.email || '',
          value: stats.value,
          deals: stats.count
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5


  return {
    totalRevenue,
    activePipeline,
    avgTicket,
    conversionRate,
    totalLeads: totalLeadsInPeriod,
    wonDealsCount: wonCount,
    lostDealsCount: dealsInPeriod.filter(d => d.status === 'lost').length,
    revenueTrend,
    salesFunnel,
    revenueTrend,
    salesFunnel,
    leadSources,
    leaderboard
  };
}

// Helper to fetch profiles
async function getProfilesMap(supabase: any, userIds: string[]) {
    if (userIds.length === 0) return {};
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

    const map: Record<string, { name: string, email: string }> = {};
    profiles?.forEach((p: any) => {
        map[p.id] = { name: p.full_name || p.email || 'Usuário', email: p.email };
    });
    return map;
}

function emptyStats(): DashboardStats {
    return {
        totalRevenue: 0,
        activePipeline: 0,
        avgTicket: 0,
        conversionRate: 0,
        totalLeads: 0,
        wonDealsCount: 0,
        lostDealsCount: 0,
        revenueTrend: [],
        salesFunnel: [],
        leadSources: [],
        leaderboard: []
    }
}

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
