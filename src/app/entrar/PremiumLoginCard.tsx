"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Props {
  errorMsg?: string | null;
}

export function PremiumLoginCard({ errorMsg }: Props) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // Fetch CSRF token from the default NextAuth endpoint
      const csrfRes = await fetch("/api/auth/csrf");
      const { csrfToken } = await csrfRes.json();

      // Create and submit form with CSRF token (same as signIn() does internally)
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "/api/auth/signin/google";

      const csrfInput = document.createElement("input");
      csrfInput.type = "hidden";
      csrfInput.name = "csrfToken";
      csrfInput.value = csrfToken;
      form.appendChild(csrfInput);

      const callbackInput = document.createElement("input");
      callbackInput.type = "hidden";
      callbackInput.name = "callbackUrl";
      callbackInput.value = "/conta";
      form.appendChild(callbackInput);

      document.body.appendChild(form);
      form.submit();
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md px-4 py-8 sm:p-0">
      {/* Card Container — Premium glassmorphism, mobile optimized */}
      <div className="relative rounded-2xl sm:rounded-[32px] border border-cyan-500/20 bg-slate-900/40 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/10">
        {/* Glow effect */}
        <div className="absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 blur-xl" />

        {/* Logo Section */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <Link href="/" aria-label="Voltar à página inicial">
            <Image
              src="/logo-clyon.png"
              alt="CLYON"
              width={120}
              height={48}
              priority
              className="drop-shadow-lg h-auto w-28 sm:w-[140px]"
            />
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6 sm:mb-8 flex gap-2 rounded-2xl border border-slate-700/50 bg-slate-800/30 p-1">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition-all duration-300 ${
              tab === "login"
                ? "bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setTab("signup")}
            className={`flex-1 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition-all duration-300 ${
              tab === "signup"
                ? "bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Registar
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Heading */}
          <div className="text-center">
            {tab === "login" ? (
              <>
                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">Bem-vindo de volta</h1>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-400">
                  Acede à tua conta CLYON
                </p>
              </>
            ) : (
              <>
                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">Cria a tua conta</h1>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-400">
                  Regista-te e guarda o histórico
                </p>
              </>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 backdrop-blur-sm">
              {errorMsg}
            </div>
          )}

          {/* Google Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-400 px-5 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/50 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-white/10" />

            <div className="relative flex items-center justify-center gap-3">
              {/* Google Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-5 w-5 flex-shrink-0"
              >
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>{isLoading ? "A conectar..." : "Continuar com Google"}</span>
            </div>
          </button>

          {/* Info Text */}
          <p className="text-center text-[11px] sm:text-xs leading-relaxed text-slate-500">
            Ao {tab === "login" ? "entrar" : "registar"} com Google, guardamos apenas os teus pedidos.
          </p>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-900 px-2 text-slate-500">Segurança garantida</span>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center text-xs">
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-1.5 sm:px-2 py-2 sm:py-3 backdrop-blur-sm">
              <div className="text-lg sm:text-xl text-cyan-400 font-semibold">🔒</div>
              <p className="mt-0.5 sm:mt-1 text-slate-400 text-[9px] sm:text-[10px]">Seguro</p>
            </div>
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-1.5 sm:px-2 py-2 sm:py-3 backdrop-blur-sm">
              <div className="text-lg sm:text-xl text-cyan-400 font-semibold">⚡</div>
              <p className="mt-0.5 sm:mt-1 text-slate-400 text-[9px] sm:text-[10px]">Rápido</p>
            </div>
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-1.5 sm:px-2 py-2 sm:py-3 backdrop-blur-sm">
              <div className="text-lg sm:text-xl text-cyan-400 font-semibold">✓</div>
              <p className="mt-0.5 sm:mt-1 text-slate-400 text-[9px] sm:text-[10px]">Simples</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 border-t border-slate-700/50 pt-4 sm:pt-6 text-xs sm:text-sm">
          <span className="text-slate-500 hidden sm:inline">Voltar à página inicial</span>
          <Link
            href="/"
            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors underline-offset-2 hover:underline"
          >
            <span className="hidden sm:inline">aqui</span>
            <span className="inline sm:hidden">← Voltar</span>
          </Link>
        </div>
      </div>

      {/* Decorative corner glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl -z-10" />
    </div>
  );
}
