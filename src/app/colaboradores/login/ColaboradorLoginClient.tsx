"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, Users, Clock } from "lucide-react";

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
      localStorage.setItem("colaborador_isAdmin", String(data.colaborador.isAdmin));

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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        {/* Painel de marca / valor */}
        <div className="relative hidden overflow-hidden rounded-[36px] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-12 lg:flex lg:flex-col lg:justify-between lg:self-stretch">
          {/* brilho de acento */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl"
          />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              <ShieldCheck className="h-4 w-4" />
              Portal interno
            </div>
            <h1 className="mt-8 max-w-[12ch] text-balance text-5xl font-bold leading-[1.05] tracking-tight text-white">
              Entrada segura para a equipa CLYON.
            </h1>
            <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-slate-400">
              Aceda ao painel de colaborador para registos, consulta e gestão interna.
              Esta área não é indexada e é reservada à operação da equipa.
            </p>
          </div>

          <ul className="relative mt-10 space-y-4">
            <li className="flex items-center gap-3 text-sm text-slate-300">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 text-cyan-300">
                <Users className="h-5 w-5" />
              </span>
              Gestão de equipa e funções operacionais
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-300">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 text-cyan-300">
                <Clock className="h-5 w-5" />
              </span>
              Registo de horários e turnos em tempo real
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-300">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 text-cyan-300">
                <LockKeyhole className="h-5 w-5" />
              </span>
              Acesso protegido e credenciais encriptadas
            </li>
          </ul>
        </div>

        {/* Cartão de login */}
        <div className="mx-auto w-full max-w-md">
          {/* badge interno só para mobile */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300 lg:hidden">
            <ShieldCheck className="h-4 w-4" />
            Portal interno
          </div>

          <div className="rounded-[32px] border border-slate-800 bg-slate-900/60 p-8 shadow-[0_40px_120px_-40px_rgba(8,145,178,0.45)] backdrop-blur sm:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
              <LockKeyhole className="h-6 w-6" />
            </div>

            <h2 className="mt-6 text-3xl font-bold text-white">Portal do colaborador</h2>
            <p className="mt-3 text-base leading-relaxed text-slate-400">
              Entre com as suas credenciais para aceder ao sistema interno.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="nome" className="mb-2 block text-sm font-semibold text-slate-200">
                  Nome
                </label>
                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="Digite o seu nome"
                  autoComplete="username"
                />
              </div>

              <div>
                <label htmlFor="senha" className="mb-2 block text-sm font-semibold text-slate-200">
                  Palavra-passe
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(event) => setSenha(event.target.value)}
                    className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 pr-14 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    placeholder="Digite a sua palavra-passe"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-cyan-300"
                    aria-label={mostrarSenha ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
                  >
                    {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-cyan-500 px-6 text-base font-semibold text-slate-950 shadow-[0_18px_40px_-18px_rgba(6,182,212,0.8)] transition hover:-translate-y-0.5 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "A entrar..." : "Entrar"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>
            </form>

            <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
              <LockKeyhole className="h-3.5 w-3.5" />
              Ligação segura e encriptada
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
