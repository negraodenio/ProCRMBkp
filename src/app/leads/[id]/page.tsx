import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { redirect } from "next/navigation"
import { getConversationHistory, generateSummary } from "./actions"
import { calculateCloseProbability } from "@/app/automations/actions"
import { AISummary } from "@/components/leads/ai-summary"
import { ConversationTimeline } from "@/components/leads/conversation-timeline"
import { ClosePrediction } from "@/components/leads/close-prediction"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, Building2, Calendar, Sparkles } from "lucide-react"
import Link from "next/link"
import { formatPhoneNumber } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  if (!profile?.organization_id) {
    return redirect("/")
  }

  // Buscar dados do lead
  const { data: lead } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", params.id)
    .eq("organization_id", profile.organization_id)
    .single()

  if (!lead) {
    return redirect("/leads")
  }

  // Buscar deal associado (se houver)
  const { data: deal } = await supabase
    .from("deals")
    .select("*, stages(name)")
    .eq("contact_id", params.id)
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  // Buscar histórico de conversas
  const { conversations, summary } = await getConversationHistory(params.id)

  // Calcular probabilidade de fechamento
  const probability = await calculateCloseProbability(lead, deal)

  // Calcular fatores individuais
  const scoreWeight = lead.score ? (lead.score / 100) * 30 : 0
  const daysSinceContact = lead.last_contact
    ? Math.floor((Date.now() - new Date(lead.last_contact).getTime()) / (1000 * 60 * 60 * 24))
    : 999
  const engagementScore = Math.max(0, 100 - daysSinceContact * 10)
  const engagementWeight = (engagementScore / 100) * 25

  const stageWeights: Record<string, number> = {
    'Novo': 10, 'Contatado': 20, 'Qualificado': 40, 'Proposta': 70, 'Negociação': 85
  }
  const stageName = (deal?.stages as any)?.name || 'Novo'
  const stageScore = stageWeights[stageName] || 10
  const stageWeight = stageScore * 0.25

  const factors = {
    score: lead.score || 0,
    engagement: Math.round(engagementScore),
    stage: Math.round(stageWeight * 4),
    qualified: lead.status === 'qualified'
  }

  const estimatedDays = probability > 50 ? Math.round(30 - (probability / 100) * 20) : undefined

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-64">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/leads">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{lead.name}</h1>
              <p className="text-muted-foreground">{lead.company || 'Sem empresa'}</p>
            </div>
            <Badge className="text-sm">{lead.status || 'Novo'}</Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Coluna Esquerda - Informações do Lead */}
            <div className="space-y-6">
              {/* Informações de Contato */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações de Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {lead.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                        {lead.email}
                      </a>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{formatPhoneNumber(lead.phone)}</span>
                    </div>
                  )}
                  {lead.company && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{lead.company}</span>
                    </div>
                  )}
                  {lead.created_at && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Criado em {format(new Date(lead.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Score */}
              {lead.score !== null && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Score de Qualificação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-bold text-purple-600">{lead.score}</div>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Previsão de Fechamento */}
              <ClosePrediction
                probability={probability}
                estimatedDays={estimatedDays}
                factors={factors}
              />
            </div>

            {/* Coluna Direita - Conversas e IA */}
            <div className="lg:col-span-2 space-y-6">
              {/* Resumo por IA */}
              <AISummary summary={summary} />

              {/* Timeline de Conversas */}
              <Card>
                <CardContent className="p-6">
                  <ConversationTimeline
                    contactId={params.id}
                    organizationId={profile.organization_id}
                    conversations={conversations}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
