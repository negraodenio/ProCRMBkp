import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function PipelinePage() {
    const supabase = await createClient();

    // 1. Get Default Pipeline
    const { data: pipeline } = await supabase
        .from('pipelines')
        .select('id')
        .eq('is_default', true)
        .single();

    if (!pipeline) {
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

    // 2. Get Stages
    const { data: stages } = await supabase
        .from('stages')
        .select('*')
        .eq('pipeline_id', pipeline.id)
        .order('order', { ascending: true });

    // 3. Get Deals
    const { data: deals } = await supabase
        .from('deals')
        .select('*')
        .in('stage_id', (stages || []).map(s => s.id));

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <Header />
                <main className="flex-1 p-6 bg-slate-50 dark:bg-background">
                    <div className="space-y-4 mb-6">
                        <h1 className="text-3xl font-bold">Pipeline de Vendas</h1>
                        <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 rounded-lg p-3 flex items-center gap-2">
                            <span className="text-blue-500">📋</span>
                            <span className="text-blue-700 dark:text-blue-300 text-sm">
                                Arraste os cards entre as colunas para atualizar o status automaticamente
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-x-auto overflow-y-hidden">
                        <KanbanBoard
                            initialStages={stages || []}
                            initialDeals={deals || []}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}
