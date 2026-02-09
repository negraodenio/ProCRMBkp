'use client';

import { useState } from 'react';
import { PersonalitySelector } from '@/components/ui/personality-selector';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { PERSONALITY_PRESETS, PersonalityType } from '@/lib/bot-personalities';
import { updateBotSettings } from './actions';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

interface PersonalityTabProps {
  botSettings: any;
  organizationId: string;
}

export function PersonalityTab({ botSettings: initialSettings, organizationId }: PersonalityTabProps) {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    personality_preset: initialSettings?.personality_preset || 'friendly',
    temperature: initialSettings?.temperature || 0.6,
    max_tokens: initialSettings?.max_tokens || 200,
    auto_reply_enabled: initialSettings?.auto_reply_enabled ?? true,
    language: initialSettings?.language || 'pt-BR',
    use_emojis: initialSettings?.use_emojis ?? true,
    mention_name: initialSettings?.mention_name ?? true,
    custom_instructions: initialSettings?.custom_instructions || '',
    business_hours_only: initialSettings?.business_hours_only ?? false,
  });

  const currentPreset = PERSONALITY_PRESETS[settings.personality_preset as PersonalityType];

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBotSettings(organizationId, settings);
      toast.success('🎉 Personalidade salva com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  // Preview message baseado na personalidade
  const getPreviewMessage = () => {
    const name = "Cliente";

    switch (settings.personality_preset) {
      case 'enthusiastic':
        return `Olá! 🎉 Que ótimo ter você aqui! Como posso te ajudar hoje? Estou super empolgado para atender você! ✨`;
      case 'friendly':
        return `Olá! 😊 Que bom falar com você! Como posso te ajudar?`;
      case 'neutral':
        return `Olá. Como posso ajudar?`;
      case 'formal':
        return `Bom dia. Em que posso ser útil ao senhor/senhora?`;
      case 'casual':
        return `E aí! 😎 Tá precisando de ajuda com algo?`;
      case 'technical':
        return `Saudações. Por favor, descreva o problema ou questão técnica que você está enfrentando.`;
      default:
        return `Olá! ${settings.use_emojis ? '😊' : ''} Como posso ajudar?`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Personality Presets */}
      <div className="glass-card p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">🎭 Tom de Voz</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Escolha como seu robô deve se comunicar com os clientes
          </p>
        </div>

        <PersonalitySelector
          selected={settings.personality_preset as PersonalityType}
          onChange={(preset) => setSettings({ ...settings, personality_preset: preset })}
        />

        {/* Description of selected preset */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{currentPreset.emoji} {currentPreset.name}:</strong>
            {' '}{currentPreset.system_prompt.substring(0, 150)}...
          </p>
        </div>
      </div>

      {/* Advanced Controls */}
      <div className="glass-card p-6 space-y-6">
        <h2 className="text-xl font-semibold">⚙️ Configurações Avançadas</h2>

        {/* Temperature */}
        <div className="space-y-3">
          <div>
            <Label>Criatividade (Temperatura)</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Controla o quão criativa e variada serão as respostas
            </p>
          </div>

          <div className="space-y-2">
            <Slider
              value={[settings.temperature]}
              onValueChange={([value]) => setSettings({ ...settings, temperature: value })}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Consistente</span>
              <span className="font-semibold text-primary">
                {settings.temperature.toFixed(1)}
              </span>
              <span>Criativo</span>
            </div>
          </div>
        </div>

        {/* Max Tokens */}
        <div className="space-y-3">
          <div>
            <Label>Comprimento das Respostas</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Tamanho médio das mensagens do robô
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setSettings({ ...settings, max_tokens: 100 })}
              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                settings.max_tokens === 100
                  ? 'border-primary bg-primary/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="text-sm font-medium">Curto</div>
              <div className="text-xs text-muted-foreground">~100 tokens</div>
            </button>
            <button
              onClick={() => setSettings({ ...settings, max_tokens: 200 })}
              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                settings.max_tokens === 200
                  ? 'border-primary bg-primary/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="text-sm font-medium">Médio</div>
              <div className="text-xs text-muted-foreground">~200 tokens</div>
            </button>
            <button
              onClick={() => setSettings({ ...settings, max_tokens: 400 })}
              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                settings.max_tokens === 400
                  ? 'border-primary bg-primary/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="text-sm font-medium">Longo</div>
              <div className="text-xs text-muted-foreground">~400 tokens</div>
            </button>
          </div>
        </div>

        {/* Custom Instructions */}
        <div className="space-y-3">
          <div>
            <Label>Instruções Personalizadas</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Adicione regras específicas para o seu robô seguir
            </p>
          </div>

          <Textarea
            value={settings.custom_instructions}
            onChange={(e) => setSettings({ ...settings, custom_instructions: e.target.value })}
            placeholder="Ex: Sempre mencione o prazo de entrega. Nunca fale sobre preços, redirecione para consultor."
            className="min-h-[120px] input-modern"
          />
        </div>

        {/* Switches */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <Label>Resposta Automática</Label>
              <p className="text-xs text-muted-foreground">
                Bot responde mensagens automaticamente
              </p>
            </div>
            <Switch
              checked={settings.auto_reply_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, auto_reply_enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Usar Emojis</Label>
              <p className="text-xs text-muted-foreground">
                Permite uso de emojis nas respostas
              </p>
            </div>
            <Switch
              checked={settings.use_emojis}
              onCheckedChange={(checked) => setSettings({ ...settings, use_emojis: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Mencionar Nome do Cliente</Label>
              <p className="text-xs text-muted-foreground">
                Usar nome do contato nas conversas
              </p>
            </div>
            <Switch
              checked={settings.mention_name}
              onCheckedChange={(checked) => setSettings({ ...settings, mention_name: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Apenas Horário Comercial</Label>
              <p className="text-xs text-muted-foreground">
                Responder apenas em horário de trabalho (9h-18h)
              </p>
            </div>
            <Switch
              checked={settings.business_hours_only}
              onCheckedChange={(checked) => setSettings({ ...settings, business_hours_only: checked })}
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-xl font-semibold">💬 Preview da Resposta</h2>
        <p className="text-sm text-muted-foreground">
          Veja como o robô vai responder com essas configurações:
        </p>

        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-6 rounded-lg border border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
              🤖
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-foreground">
                {getPreviewMessage()}
              </p>
              <p className="text-xs text-muted-foreground">
                Temperatura: {settings.temperature.toFixed(1)} •
                {settings.use_emojis ? ' Emojis ativados' : ' Sem emojis'} •
                {settings.auto_reply_enabled ? ' Auto-reply ON' : ' Auto-reply OFF'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <Button
        className="gradient-primary w-full shadow-glow-primary"
        size="lg"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="h-5 w-5 mr-2" />
            💾 Salvar Configurações
          </>
        )}
      </Button>
    </div>
  );
}
