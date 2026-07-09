// Skip static prerendering since this page may need database access
export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900 px-4 py-12">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-white">404</h1>
          <p className="mt-2 text-xl text-slate-400">Página não encontrada</p>
        </div>

        <p className="mb-8 text-slate-300">
          Desculpa, a página que procura não existe ou foi movida.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 hover:-translate-y-0.5"
          >
            <Home className="h-4 w-4" />
            Voltar ao início
          </Link>
          <Link
            href="/simulador"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white"
          >
            Ir para simulador
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
