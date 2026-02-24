import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase/server";
import { PipelineSelector } from "@/components/pipeline/pipeline-selector";

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
                    <div className="flex items-center justify-between mb-8">
                        <PipelineSelector
                            pipelines={pipelines}
                            currentPipelineId={currentPipeline.id}
                        />
                        <div className="flex items-center gap-2">
                             <div className="flex -space-x-2">
                                <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold">RT</div>
                                <div className="h-8 w-8 rounded-full border-2 border-white bg-cyan-100 flex items-center justify-center text-[10px] font-bold text-cyan-700">+3</div>
                             </div>
                             <button className="text-xs font-bold text-slate-500 ml-2">Minhas negociações</button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-x-auto overflow-y-hidden">
                        <KanbanBoard
                            initialStages={stages || []}
                            initialProposals={proposals || []}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}
