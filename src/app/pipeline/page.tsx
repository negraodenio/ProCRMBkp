import { PipelineView } from "@/components/pipeline/pipeline-view";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function PipelinePage({
    searchParams
}: {
    searchParams: { pipelineId?: string }
}) {
    const supabase = await createClient();

    // 0. Get User Profile for Org Isolation
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    if (!profile?.organization_id) return null;

    // 1. Get ALL Pipelines for this org
    const { data: pipelines } = await supabase
        .from('pipelines')
        .select('id, name, is_default')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: true });

    if (!pipelines || pipelines.length === 0) {
        return (
            <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex flex-1 flex-col md:ml-64">
                    <Header />
                    <main className="flex-1 p-6">
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-yellow-800">
                            Nenhum funil de vendas encontrado. Por favor, contate o administrador.
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    // 2. Select current pipeline
    const currentPipeline = searchParams.pipelineId
        ? pipelines.find(p => p.id === searchParams.pipelineId) || pipelines[0]
        : pipelines.find(p => p.is_default) || pipelines[0];

    // 3. Get Stages for current pipeline
    const { data: stages } = await supabase
        .from('stages')
        .select('*')
        .eq('pipeline_id', currentPipeline.id)
        .order('order', { ascending: true });

    // 4. Get Proposals for THIS ORG & THIS PIPELINE
    const { data: proposals } = await supabase
        .from('proposals')
        .select(`
            *,
            contacts(name, companies(name)),
            deals(id, title)
        `)
        .eq('organization_id', profile.organization_id)
        .eq('pipeline_id', currentPipeline.id);

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <Header />
                <main className="flex-1 p-6 bg-slate-50 dark:bg-background">
                    <PipelineView
                        pipelines={pipelines}
                        currentPipelineId={currentPipeline.id}
                        stages={stages || []}
                        proposals={proposals || []}
                        organizationId={profile.organization_id}
                    />
                </main>
            </div>
        </div>
    );
}
