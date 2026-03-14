"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LogIn } from "lucide-react";

export default function ColaboradorLoginClient() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/colaboradores/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível iniciar sessão.");
      }

      localStorage.setItem("colaborador_token", data.token);
      localStorage.setItem("colaborador_nome", data.colaborador.nome);
      localStorage.setItem("colaborador_id", String(data.colaborador.id));
      localStorage.setItem("colaborador_isAdmin", String(data.colaborador.isAdmin ?? 0));

      if (data.colaborador.isAdmin) {
        router.push("/colaboradores/admin");
        return;
      }

      router.push("/colaboradores/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível iniciar sessão.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_40%,#f8fafc_100%)]">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="hidden lg:block">
          <div className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">
            Portal interno
          </div>
          <h1 className="mt-5 max-w-[11ch] text-[3.1rem] font-bold leading-[1.02] tracking-tight text-slate-950">
            Entrada segura para a equipa CLYON.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
            Aceda ao painel de colaborador para registos, consulta e gestão interna.
            Esta área não é indexada e é reservada à operação da equipa.
          </p>
        </div>

        <div className="mx-auto w-full max-w-xl rounded-[34px] border border-cyan-100 bg-white p-8 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.18)] lg:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
            <LogIn className="h-6 w-6" />
          </div>

          <h2 className="mt-5 text-3xl font-bold text-slate-950">
            Portal do colaborador
          </h2>
          <p className="mt-3 text-base leading-8 text-slate-600">
            Entre com as suas credenciais para aceder ao sistema interno.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-950">
                Nome
              </label>
              <input
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-base text-slate-950 outline-none transition focus:border-cyan-400"
                placeholder="Digite o seu nome"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-950">
                Palavra-passe
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 pr-14 text-base text-slate-950 outline-none transition focus:border-cyan-400"
                  placeholder="Digite a sua palavra-passe"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
                  aria-label={mostrarSenha ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
                >
                  {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-cyan-500 px-6 text-base font-semibold text-white shadow-[0_18px_40px_-22px_rgba(6,182,212,0.75)] transition hover:-translate-y-0.5 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "A entrar..." : "Entrar"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
