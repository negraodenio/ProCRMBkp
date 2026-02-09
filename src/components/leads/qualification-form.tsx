'use client';

import { useState, useEffect } from 'react';
import { ScoreCircle } from '@/components/ui/score-circle';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Save, FileText, Info } from 'lucide-react';
import { toast } from 'sonner';
import { saveLeadQualification } from '@/app/leads/qualification/actions';

interface QualificationFormProps {
  leadId: string;
  organizationId: string;
  leadName?: string;
  initialData?: any;
}

export function QualificationForm({ leadId, organizationId, leadName, initialData }: QualificationFormProps) {
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState({
    problem: initialData?.responses?.problem || '',
    urgency: initialData?.responses?.urgency || '0',
    decisor: initialData?.responses?.decisor || '0',
    budget: initialData?.responses?.budget || '0',
    experience: initialData?.responses?.experience || '0',
  });

  const [score, setScore] = useState(0);

  // Lógica de cálculo de Score (Simulação baseada na imagem)
  useEffect(() => {
    const s =
      (parseInt(responses.urgency) || 0) +
      (parseInt(responses.decisor) || 0) +
      (parseInt(responses.budget) || 0) +
      (parseInt(responses.experience) || 0);

    // Adiciona um peso pequeno se tiver preenchido o problema
    const problemBonus = responses.problem.length > 20 ? 10 : 0;

    setScore(Math.min(100, s + problemBonus));
  }, [responses]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveLeadQualification(leadId, organizationId, responses, score);
      toast.success('Qualificação salva com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar qualificação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Area */}
      <Card className="lg:col-span-2 p-6 space-y-8 glass-card">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Formulário de Qualificação</h2>
            <p className="text-xs text-muted-foreground italic">
              Qualificando: {leadName || "Lead sem nome"}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Problema */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              Qual o problema/necessidade em materiais gráficos? *
            </Label>
            <Textarea
              placeholder="Descreva detalhadamente a necessidade do cliente..."
              className="input-modern min-h-[100px]"
              value={responses.problem}
              onChange={(e) => setResponses({ ...responses, problem: e.target.value })}
            />
          </div>

          {/* Urgência */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Há quanto tempo busca solução?</Label>
            <Select
              value={responses.urgency}
              onValueChange={(val) => setResponses({ ...responses, urgency: val })}
            >
              <SelectTrigger className="input-modern">
                <SelectValue placeholder="Selecione a urgência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sem pressa / Pesquisando</SelectItem>
                <SelectItem value="10">De 1 a 3 meses</SelectItem>
                <SelectItem value="20">Imediato (Urgente)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Decisor */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">É o decisor da compra?</Label>
            <RadioGroup
              value={responses.decisor}
              onValueChange={(val) => setResponses({ ...responses, decisor: val })}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                <RadioGroupItem value="20" id="decisor-sim" />
                <Label htmlFor="decisor-sim" className="cursor-pointer">Sim, sou o decisor</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                <RadioGroupItem value="10" id="decisor-nao" />
                <Label htmlFor="decisor-nao" className="cursor-pointer">Não, preciso consultar / Coparticipação</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Orçamento */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Orçamento disponível/estimado</Label>
            <Select
              value={responses.budget}
              onValueChange={(val) => setResponses({ ...responses, budget: val })}
            >
              <SelectTrigger className="input-modern">
                <SelectValue placeholder="Selecione a faixa de orçamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Até R$ 500</SelectItem>
                <SelectItem value="15">De R$ 500 a R$ 2.000</SelectItem>
                <SelectItem value="25">Acima de R$ 2.000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Experiência */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Já trabalhou com gráficos antes?</Label>
            <RadioGroup
              value={responses.experience}
              onValueChange={(val) => setResponses({ ...responses, experience: val })}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                <RadioGroupItem value="25" id="exp-sim" />
                <Label htmlFor="exp-sim" className="cursor-pointer">Sim, regularmente</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                <RadioGroupItem value="10" id="exp-nao" />
                <Label htmlFor="exp-nao" className="cursor-pointer">Não / Raramente</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <Button
          className="w-full gradient-primary shadow-glow-primary h-12"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Calcular e Salvar Score de Qualificação
        </Button>
      </Card>

      {/* Sidebar Score Area */}
      <div className="space-y-6">
        <Card className="p-8 flex flex-col items-center justify-center space-y-12 glass-card h-fit sticky top-24">
          <div className="flex items-center gap-2 text-primary">
            <SparklesIcon className="h-5 w-5" />
            <h3 className="font-bold text-lg">Score de Qualificação</h3>
          </div>

          <ScoreCircle score={score} />

          <div className="w-full space-y-4 pt-6">
            <p className="text-xs text-center text-muted-foreground px-4">
              O score é calculado automaticamente com base nas respostas acima.
            </p>

            <div className="space-y-2 pt-4 border-t border-white/10">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Classificação:</h4>
              <div className="grid gap-2">
                <div className="flex items-center gap-2 text-[10px]">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="font-medium">70-100: Quente</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="font-medium">40-69: Morno</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="font-medium">0-39: Frio</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tip Card */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Leads <strong>Quentes</strong> devem ser priorizados para atendimento imediato.
              Leads <strong>Frios</strong> podem ser nutridos com automações de marketing.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
