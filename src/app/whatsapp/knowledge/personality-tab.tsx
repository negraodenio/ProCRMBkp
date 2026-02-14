'use client';

import { useState } from 'react';
import { PersonalitySelector } from '@/components/ui/personality-selector';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PERSONALITY_PRESETS, PersonalityType } from '@/lib/bot-personalities';
import { updateBotSettings, updateWhatsAppProfile } from './actions';
import { toast } from 'sonner';
import { Loader2, Save, Upload, User, Palette, Settings2, Sparkles, RefreshCw, MessageSquare, Edit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { ChatWidget } from '@/components/widget/chat-widget';

interface PersonalityTabProps {
  botSettings: any;
  organizationId: string;
}

export function PersonalityTab({ botSettings: initialSettings, organizationId }: PersonalityTabProps) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [updatingWhatsapp, setUpdatingWhatsapp] = useState(false);

  const [settings, setSettings] = useState({
    // Basic
    bot_name: initialSettings?.bot_name || 'Agente IA',
    company_name: initialSettings?.company_name || '',
    company_industry: initialSettings?.company_industry || '',
    company_website: initialSettings?.company_website || '',

    // Appearance
    bot_avatar: initialSettings?.bot_avatar || null,
    user_msg_color: initialSettings?.user_msg_color || '#7c3aed', // Primary purple
    agent_msg_color: initialSettings?.agent_msg_color || '#ffffff',
    remove_watermark: initialSettings?.remove_watermark || false,

    // Behavior (Existing)
    personality_preset: initialSettings?.personality_preset || 'friendly',
    temperature: initialSettings?.temperature || 0.6,
    max_tokens: initialSettings?.max_tokens || 200,
    auto_reply_enabled: initialSettings?.auto_reply_enabled ?? true,
    language: initialSettings?.language || 'pt-BR',
    use_emojis: initialSettings?.use_emojis ?? true,
    mention_name: initialSettings?.mention_name ?? true,
    custom_instructions: initialSettings?.custom_instructions || '',
    welcome_message: initialSettings?.welcome_message || '', // New
    business_hours_only: initialSettings?.business_hours_only ?? false,
  });

  const currentPreset = PERSONALITY_PRESETS[settings.personality_preset as PersonalityType] || PERSONALITY_PRESETS.friendly;

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

  const handleUpdateWhatsappProfile = async () => {
      if (!settings.bot_avatar) return;
      setUpdatingWhatsapp(true);
      try {
          const res: any = await updateWhatsAppProfile(organizationId, settings.bot_avatar);
          if (res.error) throw new Error(res.error);
          toast.success("Foto do WhatsApp atualizada!");
      } catch (error: any) {
          toast.error("Erro ao atualizar WhatsApp: " + error.message);
      } finally {
          setUpdatingWhatsapp(false);
      }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      try {
          setUploading(true);
          const file = event.target.files?.[0];
          if (!file) return;

          const supabase = createClient();
          const fileExt = file.name.split('.').pop();
          const fileName = `bot-${organizationId}-${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
              .from('avatars')
              .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
          setSettings(prev => ({ ...prev, bot_avatar: publicUrl }));
          toast.success("Avatar carregado!");
      } catch (error: any) {
          toast.error("Erro ao fazer upload: " + error.message);
      } finally {
          setUploading(false);
      }
  };

  // Preview message baseado na personalidade e configurações
  const getPreviewMessage = () => {
    // Se tiver mensagem de boas vindas customizada e for a primeira interação (simulado)
    if (settings.welcome_message) return settings.welcome_message;

    switch (settings.personality_preset) {
      case 'enthusiastic':
        return `Olá! 🎉 Sou ${settings.bot_name}, da ${settings.company_name || 'empresa'}. Como posso te ajudar hoje?! ✨`;
      case 'friendly':
        return `Olá! 😊 Sou ${settings.bot_name}. Que bom falar com você! Como posso ajudar?`;
      case 'formal':
        return `Olá. Eu sou ${settings.bot_name}. Em que posso ser útil?`;
      default:
        return `Olá! ${settings.use_emojis ? '😊' : ''} Sou ${settings.bot_name}. Como posso ajudar?`;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Settings Column */}
      <div className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="appearance">Visual</TabsTrigger>
                <TabsTrigger value="webchat">Webchat</TabsTrigger>
                <TabsTrigger value="behavior">Cérebro</TabsTrigger>
            </TabsList>

            {/* TAB: BASIC */}
            <TabsContent value="basic" className="space-y-4 mt-4 glass-card p-6">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <User className="h-5 w-5" /> Identidade
                    </h3>
                    <p className="text-sm text-muted-foreground">Quem é o seu agente?</p>
                </div>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <Label>Nome do Agente</Label>
                        <Input
                            value={settings.bot_name}
                            onChange={e => setSettings({...settings, bot_name: e.target.value})}
                            placeholder="Ex: Laura Terroir"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Nome da Empresa</Label>
                        <Input
                            value={settings.company_name}
                            onChange={e => setSettings({...settings, company_name: e.target.value})}
                            placeholder="Ex: Vinhos LTDA"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Setor</Label>
                            <Input
                                value={settings.company_industry}
                                onChange={e => setSettings({...settings, company_industry: e.target.value})}
                                placeholder="Ex: Varejo"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Site</Label>
                            <Input
                                value={settings.company_website}
                                onChange={e => setSettings({...settings, company_website: e.target.value})}
                                placeholder="www.exemplo.com"
                            />
                        </div>
                    </div>
                </div>
            </TabsContent>

            {/* TAB: APPEARANCE */}
            <TabsContent value="appearance" className="space-y-4 mt-4 glass-card p-6">
                 <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Palette className="h-5 w-5" /> Aparência
                    </h3>
                    <p className="text-sm text-muted-foreground">Como seu agente aparece no chat.</p>
                </div>

                <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20 border-2 border-border">
                        <AvatarImage src={settings.bot_avatar || undefined} />
                        <AvatarFallback className="text-xl bg-muted text-foreground">{settings.bot_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="bot-avatar-upload" className="cursor-pointer inline-flex">
                            <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 border rounded-md hover:bg-muted transition-colors text-xs font-medium">
                                {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                                Carregar Imagem
                            </div>
                            <input
                                id="bot-avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                                disabled={uploading}
                            />
                        </Label>
                        <p className="text-[10px] text-muted-foreground">Recomendado: 256x256px</p>

                        {settings.bot_avatar && (
                             <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={handleUpdateWhatsappProfile}
                                disabled={updatingWhatsapp}
                            >
                                {updatingWhatsapp ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                                Atualizar Foto no WhatsApp
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Cor da Mensagem (Usuário)</Label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={settings.user_msg_color}
                                onChange={e => setSettings({...settings, user_msg_color: e.target.value})}
                                className="h-9 w-9 p-1 rounded border cursor-pointer"
                            />
                            <span className="text-xs font-mono">{settings.user_msg_color}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Cor da Mensagem (Agente)</Label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={settings.agent_msg_color}
                                onChange={e => setSettings({...settings, agent_msg_color: e.target.value})}
                                className="h-9 w-9 p-1 rounded border cursor-pointer"
                            />
                            <span className="text-xs font-mono">{settings.agent_msg_color}</span>
                        </div>
                    </div>
                </div>



                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="space-y-0.5">
                        <Label>Remover "Criado com..."</Label>
                        <p className="text-xs text-muted-foreground">White label (apenas Pro)</p>
                    </div>
                    <Switch
                        checked={settings.remove_watermark}
                        onCheckedChange={checked => setSettings({...settings, remove_watermark: checked})}
                    />
                </div>
            </TabsContent>

            {/* TAB: WEBCHAT */}
            <TabsContent value="webchat" className="space-y-4 mt-4 glass-card p-6">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" /> Webchat Widget
                    </h3>
                    <p className="text-sm text-muted-foreground">Compartilhe ou incorpore o chat no seu site.</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Link do Widget</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                readOnly
                                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/widget/${organizationId}`}
                                className="bg-muted/30 font-mono text-xs"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    const url = `${window.location.origin}/widget/${organizationId}`;
                                    navigator.clipboard.writeText(url);
                                    toast.success("Link copiado!");
                                }}
                            >
                                <Settings2 className="h-4 w-4" />
                                <span className="sr-only">Copiar</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    window.open(`/widget/${organizationId}`, '_blank');
                                }}
                            >
                                <Sparkles className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                        <p className="text-xs text-primary font-medium">✨ Dica:</p>
                        <p className="text-xs text-primary/80 mt-1">
                            Você pode usar este link para colocar um botão de chat no seu site, Instagram ou enviar diretamente para seus clientes.
                        </p>
                    </div>
                </div>
            </TabsContent>

            {/* TAB: BEHAVIOR */}
            <TabsContent value="behavior" className="space-y-6 mt-4 glass-card p-6">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="h-5 w-5" /> Comportamento
                    </h3>
                    <p className="text-sm text-muted-foreground">Personalidade e inteligência.</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Tom de Voz</Label>
                        <PersonalitySelector
                            selected={settings.personality_preset as PersonalityType}
                            onChange={(preset) => setSettings({ ...settings, personality_preset: preset })}
                        />
                        <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                            {currentPreset.emoji} {currentPreset.tone_prompt.substring(0, 100)}...
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Mensagem Inicial (Boas Vindas)</Label>
                        <Input
                            value={settings.welcome_message}
                            onChange={e => setSettings({...settings, welcome_message: e.target.value})}
                            placeholder="Ex: Olá, eu sou a Laura! Como posso ajudar?"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Criatividade ({settings.temperature})</Label>
                        <Slider
                            value={[settings.temperature]}
                            onValueChange={([value]) => setSettings({ ...settings, temperature: value })}
                            min={0}
                            max={1}
                            step={0.1}
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Robótica</span>
                            <span>Criativa</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Instruções Adicionais</Label>
                        <Textarea
                            value={settings.custom_instructions}
                            onChange={(e) => setSettings({ ...settings, custom_instructions: e.target.value })}
                            placeholder="Regras específicas de negócio..."
                            className="min-h-[100px]"
                        />
                    </div>
                </div>
            </TabsContent>
        </Tabs>

         {/* Save Button */}
        <Button
            className="w-full"
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
                Salvar Alterações
            </>
            )}
        </Button>
      </div>

      {/* Preview Column */}
      <div className="space-y-6">
        <div className="glass-card p-6 space-y-4 sticky top-6">
            <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-purple-500" /> Preview da Resposta
                </h2>
                <p className="text-sm text-muted-foreground">
                    Veja como o robô vai responder com essas configurações:
                </p>
            </div>

            {/* Simulation Container */}
            <div className="border rounded-xl overflow-hidden bg-background shadow-inner min-h-[500px] flex flex-col relative">
                <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-5 pointer-events-none"></div>

                {/* Live Chat Widget */}
                <div className="flex-1 p-4 bg-muted/40 flex items-center justify-center">
                    <ChatWidget
                        orgId={organizationId}
                        botName={settings.bot_name}
                        botAvatar={settings.bot_avatar}
                        companyName={settings.company_name}
                        colors={{
                            userMsg: settings.user_msg_color,
                            agentMsg: settings.agent_msg_color
                        }}
                        welcomeMessage={settings.welcome_message || getPreviewMessage()}
                        removeWatermark={settings.remove_watermark}
                        overrideSettings={settings}
                    />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
