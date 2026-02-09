'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropzoneAreaProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
}

export function DropzoneArea({
  onUpload,
  accept = {
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = true
}: DropzoneAreaProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    setErrors([]);

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errorMessages = rejectedFiles.map(({ file, errors }) => {
        const errorMsg = errors.map((e: any) => e.message).join(', ');
        return `${file.name}: ${errorMsg}`;
      });
      setErrors(errorMessages);
      return;
    }

    if (acceptedFiles.length === 0) return;

    setUploading(true);
    try {
      await onUpload(acceptedFiles);
      setUploadedFiles(prev => [...prev, ...acceptedFiles.map(f => f.name)]);

      // Clear success message after 3s
      setTimeout(() => {
        setUploadedFiles([]);
      }, 3000);
    } catch (error) {
      setErrors([`Erro ao fazer upload: ${error}`]);
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer",
          isDragActive
            ? "border-primary bg-primary/10 scale-105 shadow-glow-primary"
            : "border-white/20 hover:border-white/40 hover:bg-white/5",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} />

        <div className="space-y-4">
          {uploading ? (
            <>
              <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">
                Processando documentos...
              </p>
            </>
          ) : uploadedFiles.length > 0 ? (
            <>
              <CheckCircle2 className="h-12 w-12 mx-auto text-success animate-scale-in" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-success">
                  Upload concluído!
                </p>
                {uploadedFiles.map((filename, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    ✓ {filename}
                  </p>
                ))}
              </div>
            </>
          ) : (
            <>
              <Upload className={cn(
                "h-12 w-12 mx-auto transition-transform",
                isDragActive && "scale-110 text-primary"
              )} />
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  {isDragActive ? (
                    "⬆️ Solte os arquivos aqui"
                  ) : (
                    "Arraste documentos aqui"
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF • TXT • DOCX • Máx {(maxSize / 1024 / 1024).toFixed(0)}MB
                </p>
              </div>
            </>
          )}
        </div>

        {/* Animação de fundo ao arrastar */}
        {isDragActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg animate-pulse -z-10" />
        )}
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="glass-card p-4 border-l-4 border-destructive animate-slide-in">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              {errors.map((error, i) => (
                <p key={i} className="text-sm text-destructive">
                  {error}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
