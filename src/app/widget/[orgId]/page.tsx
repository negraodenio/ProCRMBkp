import { createServiceRoleClient } from "@/lib/supabase/service-scoped";
import { ChatWidget } from "@/components/widget/chat-widget";
import { Metadata } from "next";

interface WidgetPageProps {
    params: {
        orgId: string;
    };
}

export async function generateMetadata({ params }: WidgetPageProps): Promise<Metadata> {
    const supabase = createServiceRoleClient();
    const { data: org } = await supabase.from("organizations").select("name").eq("id", params.orgId).single();

    return {
        title: org?.name ? `Chat - ${org.name}` : "Webchat",
    };
}

export default async function WidgetPage({ params }: WidgetPageProps) {
    const supabase = createServiceRoleClient();

    // Fetch Organization & Bot Settings
    const { data: org, error } = await supabase
        .from("organizations")
        .select("id, name, bot_settings")
        .eq("id", params.orgId)
        .single();

    if (error || !org) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center space-y-2">
                    <h1 className="text-xl font-bold text-slate-900">Link Inválido</h1>
                    <p className="text-sm text-muted-foreground">Esta organização não foi encontrada.</p>
                </div>
            </div>
        );
    }

    const settings = org.bot_settings || {};

    // Configs
    const botName = settings.bot_name || "Agente IA";
    const botAvatar = settings.bot_avatar || null;
    const companyName = settings.company_name || org.name;
    const colors = {
        userMsg: settings.user_msg_color || "#7c3aed",
        agentMsg: settings.agent_msg_color || "#ffffff"
    };
    const welcomeMessage = settings.welcome_message || "";
    const removeWatermark = settings.remove_watermark || false;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
             {/*
                For specific widget usage (iframe or standalone),
                we might want to allow query params to hide the surrounding "screen"
                and just show the widget full size.
                For now, let's assume valid typical standalone page usage.
             */}
            <ChatWidget
                orgId={org.id}
                botName={botName}
                botAvatar={botAvatar}
                companyName={companyName}
                colors={colors}
                welcomeMessage={welcomeMessage}
                removeWatermark={removeWatermark}
            />
        </div>
    );
}
