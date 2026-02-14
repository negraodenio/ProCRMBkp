'use client';

import { FileText, Trash2, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DocumentCardProps {
  id: string;
  filename: string;
  uploadedAt: string;
  chunks: number;
  status?: 'processed' | 'processing' | 'error';
  onDelete?: (id: string) => void;
  onPreview?: (id: string) => void;
  onReprocess?: (id: string) => void;
}

export function DocumentCard({
  id,
  filename,
  uploadedAt,
  chunks,
  status = 'processed',
  onDelete,
  onPreview,
  onReprocess
}: DocumentCardProps) {
  const statusConfig = {
    processed: {
      icon: '✅',
      label: 'Processado',
      className: 'text-success'
    },
    processing: {
      icon: '⏳',
      label: 'Processando',
      className: 'text-warning animate-pulse'
    },
    error: {
      icon: '❌',
      label: 'Erro',
      className: 'text-destructive'
    }
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="glass-card p-4 space-y-3 card-hover group">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <FileText className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{filename}</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className={cn("text-xs flex items-center gap-1", currentStatus.className)}>
              <span>{currentStatus.icon}</span>
              {currentStatus.label}
            </span>
            <span className="text-xs text-muted-foreground">
              há {formatDistanceToNow(new Date(uploadedAt), { locale: ptBR })}
            </span>
            <span className="badge-primary text-xs">
              🧩 {chunks} chunks
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onPreview && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPreview(id)}
            className="h-8 text-xs"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            Preview
          </Button>
        )}
        {onReprocess && status === 'error' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReprocess(id)}
            className="h-8 text-xs text-warning hover:text-warning"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Reprocessar
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(filename)}
            className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Excluir
          </Button>
        )}
      </div>
    </div>
  );
}
