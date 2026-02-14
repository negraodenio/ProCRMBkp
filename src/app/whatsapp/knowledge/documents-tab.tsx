'use client';

import { StatsCard } from '@/components/ui/stats-card';
import { DropzoneArea } from '@/components/ui/dropzone-area';
import { DocumentCard } from '@/components/ui/document-card';
import { uploadDocument, deleteDocument, purgeAllDocuments } from './actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentsTabProps {
  documents: Array<{
    id: string;
    filename: string;
    created_at: string;
    count: number;
  }>;
  chunksCount: number;
}

export function DocumentsTab({ documents, chunksCount }: DocumentsTabProps) {
  const router = useRouter();

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadDocument(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success(`${file.name} processado! ${result.count} chunks criados.`);
    }

    router.refresh();
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Tem certeza que deseja excluir o documento "${filename}" e todo o seu conteúdo de treinamento?`)) return;

    try {
      await deleteDocument(filename);
      toast.success('Documento e chunks excluídos com sucesso');
      router.refresh();
    } catch (error) {
      toast.error('Erro ao excluir documento');
    }
  };

  const handlePurge = async () => {
    if (!confirm('ATENÇÃO: Isso excluirá TODOS os documentos e conhecimentos do robô. Esta ação não pode ser desfeita. Deseja continuar?')) return;

    try {
      const result = await purgeAllDocuments();
      if (result.error) throw new Error(result.error);
      toast.success('Base de conhecimento resetada com sucesso');
      router.refresh();
    } catch (error: any) {
      toast.error('Erro ao limpar base: ' + error.message);
    }
  };

  // Calculate total size (mock for now)
  const totalSizeMB = (chunksCount * 2 / 1000).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          icon="📄"
          value={documents.length}
          label="Documentos"
          trend="+2 essa semana"
        />
        <StatsCard
          icon="💾"
          value={`${totalSizeMB}MB`}
          label="Armazenados"
        />
        <StatsCard
          icon="🧩"
          value={chunksCount}
          label="Chunks"
        />
        <StatsCard
          icon="✅"
          value="100%"
          label="Processados"
          className="border-l-4 border-success"
        />
      </div>

      {/* Upload Area */}
      <div>
        <h3 className="text-lg font-semibold mb-4">📤 Enviar Documentos</h3>
        <DropzoneArea onUpload={handleUpload} />
        <p className="text-xs text-muted-foreground mt-3">
          <FileText className="inline h-3 w-3 mr-1" />
          O robô aprenderá com este conteúdo para responder no WhatsApp.
        </p>
      </div>

      {/* Documents List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">📚 Seus Documentos</h3>
          {documents.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePurge}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Limpar Tudo
            </Button>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="glass-card p-12 text-center space-y-4">
            <div className="text-5xl">📚</div>
            <div>
              <h4 className="text-lg font-semibold mb-2">Nenhum documento ainda</h4>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Comece enviando manuais, FAQs ou informações sobre sua empresa para ensinar o robô
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                id={doc.id}
                filename={doc.filename}
                uploadedAt={doc.created_at}
                chunks={doc.count}
                status="processed"
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
