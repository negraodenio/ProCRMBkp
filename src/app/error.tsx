"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("❌ Application Error:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <div className="mb-6 rounded-full bg-red-100 p-4">
        <AlertTriangle className="h-10 w-10 text-red-600" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-slate-900">Algo deu errado!</h2>
      <p className="mb-6 max-w-md text-slate-600">
        Desculpe, encontramos um erro inesperado. Tente recarregar a página ou voltar para o início.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="outline">
          Tentar Novamente
        </Button>
        <Button onClick={() => window.location.href = "/"} variant="default">
          Voltar ao Início
        </Button>
      </div>
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 w-full max-w-2xl overflow-auto rounded bg-slate-900 p-4 text-left text-xs text-red-400">
          <pre>{error.message}</pre>
          <pre>{error.stack}</pre>
        </div>
      )}
    </div>
  );
}
