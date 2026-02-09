'use client';

import { StatsCard } from '@/components/ui/stats-card';
import { DropzoneArea } from '@/components/ui/dropzone-area';
import { DocumentCard } from '@/components/ui/document-card';
import { uploadDocument, deleteDocument } from './actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';

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

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return;

    try {
      await deleteDocument(id);
      toast.success('Documento excluído com sucesso');
      router.refresh();
    } catch (error) {
      toast.error('Erro ao excluir documento');
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
        <h3 className="text-lg font-semibold mb-4">📚 Seus Documentos</h3>

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
