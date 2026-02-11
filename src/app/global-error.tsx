"use client";

import { Button } from "@/components/ui/button";
import { AlertOctagon } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 p-4 text-center">
          <div className="mb-6 rounded-full bg-red-100 p-4">
            <AlertOctagon className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Erro Crítico</h2>
          <p className="mb-6 max-w-md text-slate-600">
            Ocorreu um erro irrecuperável. Por favor, recarregue a página.
          </p>
          <Button onClick={() => reset()}>Recarregar Página</Button>
        </div>
      </body>
    </html>
  );
}
