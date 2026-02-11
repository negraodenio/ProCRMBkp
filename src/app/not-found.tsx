import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <div className="mb-6 rounded-full bg-slate-100 p-4">
        <FileQuestion className="h-10 w-10 text-slate-500" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-slate-900">Página não encontrada</h2>
      <p className="mb-6 max-w-md text-slate-600">
        A página que você está procurando não existe ou foi movida.
      </p>
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/">Voltar ao Início</Link>
        </Button>
      </div>
    </div>
  );
}
