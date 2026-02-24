import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  ArrowLeft,
  ChevronRight
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DealHeader } from "@/components/deals/deal-header"
import { DealDetailsPanel } from "@/components/deals/deal-details-panel"
import { DealTabs } from "@/components/deals/deal-tabs"

interface PageProps {
  params: { id: string }
}

export default async function DealDetailPage({ params }: PageProps) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  if (!profile?.organization_id) return redirect("/")

  // Fetch Deal + Companies + Contacts + Stages (The Tripod)
  const { data: deal, error } = await supabase
    .from("deals")
    .select(`
      *,
      stages (*),
      pipelines (name),
      companies (*),
      contacts (*)
    `)
    .eq("id", params.id)
    .eq("organization_id", profile.organization_id)
    .single()

  if (error || !deal) {
    console.error("Deal fetch error:", error)
    return notFound()
  }

  // Get all stages for this pipeline to show progress bar
  const { data: allStages } = await supabase
    .from("stages")
    .select("*")
    .eq("pipeline_id", deal.pipeline_id)
    .order("order", { ascending: true })

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-64">
        <Header />

        {/* Deal Header - Stage Progress */}
        <div className="bg-white border-b px-6 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Link href="/pipeline" className="hover:text-primary">Negociações</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">{deal.title}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-900">{deal.title}</h1>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {deal.status === 'open' ? 'Em aberto' : deal.status === 'won' ? 'Ganho' : 'Perdido'}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Cancelar</Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Ações</Button>
                </div>
            </div>
        </div>

        {/* Progress Bar Component */}
        <DealHeader currentStageId={deal.stage_id} stages={allStages || []} />

        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left Column: Tripod Panels */}
            <div className="lg:col-span-4 space-y-6">
               <DealDetailsPanel deal={deal} />
            </div>

            {/* Right Column: Interaction Tabs */}
            <div className="lg:col-span-8">
               <DealTabs deal={deal} />
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
