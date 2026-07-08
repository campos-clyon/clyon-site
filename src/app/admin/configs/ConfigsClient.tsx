"use client";

import { useState, useEffect } from "react";

export default function ConfigsClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [portal, setPortal] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  // Carregar configurações
  useEffect(() => {
    const loadSettings = async () => {
      if (!token) {
        setError("Sessão expirada");
        return;
      }
      try {
        const res = await fetch("/api/admin/company-settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setPhone(data.phone || "");
        setEmail(data.email || "");
        setName(data.name || "");
        setSector(data.sector || "");
        setPortal(data.portal || "");
      } catch (err: any) {
        setError(err.message || "Erro ao carregar configurações");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/company-settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, email, name, sector, portal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess("Configurações guardadas com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao guardar configurações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <svg className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-400">A carregar configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dados da empresa</h1>
        <p className="mt-1 text-sm text-slate-400">Informações institucionais da CLYON utilizadas no portal e nos documentos gerados.</p>
      </div>

      {/* Mensagens */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-green-300">
          {success}
        </div>
      )}

      {/* Formulário */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <span className="flex items-center gap-2">
                <span className="text-lg">🏢</span> Nome
              </span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-white placeholder-slate-500 transition focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/20"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <span className="flex items-center gap-2">
                <span className="text-lg">✉️</span> Email
              </span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-white placeholder-slate-500 transition focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/20"
            />
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <span className="flex items-center gap-2">
                <span className="text-lg">📱</span> Telefone / WhatsApp
              </span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+351..."
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-white placeholder-slate-500 transition focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/20"
            />
          </div>

          {/* Portal */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <span className="flex items-center gap-2">
                <span className="text-lg">🌐</span> Portal
              </span>
            </label>
            <input
              type="text"
              value={portal}
              onChange={(e) => setPortal(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-white placeholder-slate-500 transition focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/20"
            />
          </div>
        </div>

        {/* Setor (full width) */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <span className="flex items-center gap-2">
              <span className="text-lg">💼</span> Setor
            </span>
          </label>
          <input
            type="text"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-white placeholder-slate-500 transition focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/20"
          />
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-300">
        <p>Para alterar os dados da empresa (nome legal, NIF, morada), contacte o administrador do sistema ou atualize diretamente no código-fonte.</p>
      </div>

      {/* Botão Guardar */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-cyan-400 px-6 py-2.5 font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-50 transition flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              A guardar...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Guardar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
