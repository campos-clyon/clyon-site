"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { BUSINESS_PHONE } from "@/lib/seo-data";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus =
  | "pendente" | "atribuido" | "em_analise" | "precisa_info"
  | "estimativa_pronta" | "presencial_recomendado" | "aprovado"
  | "enviado_cliente" | "confirmado" | "em_execucao" | "concluido"
  | "cancelado" | "rejeitado";

type OrderPriority = "baixa" | "normal" | "alta" | "urgente";

type HistoryEntry = {
  type: string;
  by?: { id: number; nome: string; role: string } | null;
  message: string;
  createdAt: string;
};

type Order = {
  id: number;
  serviceType?: string | null;
  description?: string | null;
  filesJson?: string | null;
  address?: string | null;
  city?: string | null;
  floor?: string | null;
  hasElevator?: string | null;
  parkingDistance?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  urgency?: string | null;
  estimateTotal?: string | null;
  estimateMin?: string | null;
  estimateMax?: string | null;
  estimateJson?: string | null;
  distanceKm?: string | null;
  distanceText?: string | null;
  status: OrderStatus;
  priority?: OrderPriority | null;
  notasInternas?: string | null;
  precoFinal?: string | null;
  precoFinalIva?: string | null;
  mensagemCliente?: string | null;
  assignedToId?: number | null;
  assignedToName?: string | null;
  assignedAt?: string | null;
  historyJson?: string | null;
  reviewJson?: string | null;
  dataAgendada?: string | null;
  createdAt: string;
  updatedAt: string;
};

type GeminiEstimate = {
  status?: string;
  estimatedPriceWithoutVat?: number | null;
  vatAmount?: number | null;
  estimatedPriceWithVat?: number | null;
  difficultyLevel?: number;
  summary?: string;
  assumptions?: string[];
  missingFields?: string[];
  customerMessage?: string;
  internalNotes?: string[];
};

function parseEstimate(json?: string | null): GeminiEstimate | null {
  try { return json ? JSON.parse(json) : null; } catch { return null; }
}

const DIFFICULTY_LABEL: Record<number, string> = {
  1: "Muito fácil", 2: "Fácil", 3: "Moderado", 4: "Difícil", 5: "Muito difícil",
};
const DIFFICULTY_COLOR: Record<number, string> = {
  1: "text-emerald-400", 2: "text-green-400", 3: "text-amber-400", 4: "text-orange-400", 5: "text-red-400",
};

type Assistant = { id: number; nome: string; funcao: string; isAdmin: number };

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<OrderStatus, { label: string; dot: string; badge: string }> = {
  pendente:               { label: "Pendente",            dot: "bg-amber-400",   badge: "bg-amber-400/10 border-amber-400/30 text-amber-300" },
  atribuido:              { label: "Atribuído",           dot: "bg-sky-400",     badge: "bg-sky-400/10 border-sky-400/30 text-sky-300" },
  em_analise:             { label: "Em análise",          dot: "bg-violet-400",  badge: "bg-violet-400/10 border-violet-400/30 text-violet-300" },
  precisa_info:           { label: "Precisa info",        dot: "bg-orange-400",  badge: "bg-orange-400/10 border-orange-400/30 text-orange-300" },
  estimativa_pronta:      { label: "Estimativa pronta",   dot: "bg-teal-400",    badge: "bg-teal-400/10 border-teal-400/30 text-teal-300" },
  presencial_recomendado: { label: "Presencial rec.",     dot: "bg-indigo-400",  badge: "bg-indigo-400/10 border-indigo-400/30 text-indigo-300" },
  aprovado:               { label: "Aprovado",            dot: "bg-cyan-400",    badge: "bg-cyan-400/10 border-cyan-400/30 text-cyan-300" },
  enviado_cliente:        { label: "Enviado",             dot: "bg-blue-400",    badge: "bg-blue-400/10 border-blue-400/30 text-blue-300" },
  confirmado:             { label: "Confirmado",          dot: "bg-green-400",   badge: "bg-green-400/10 border-green-400/30 text-green-300" },
  em_execucao:            { label: "Em execução",         dot: "bg-lime-400",    badge: "bg-lime-400/10 border-lime-400/30 text-lime-300" },
  concluido:              { label: "Concluído",           dot: "bg-emerald-400", badge: "bg-emerald-400/10 border-emerald-400/30 text-emerald-300" },
  cancelado:              { label: "Cancelado",           dot: "bg-slate-500",   badge: "bg-slate-500/10 border-slate-500/30 text-slate-400" },
  rejeitado:              { label: "Rejeitado",           dot: "bg-red-500",     badge: "bg-red-500/10 border-red-500/30 text-red-400" },
};

const ALL_STATUSES: OrderStatus[] = [
  "pendente","atribuido","em_analise","precisa_info","estimativa_pronta",
  "presencial_recomendado","aprovado","enviado_cliente","confirmado",
  "em_execucao","concluido","cancelado","rejeitado",
];

const ALL_PRIORITIES: OrderPriority[] = ["baixa", "normal", "alta", "urgente"];

// ─── Utils ────────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function fmtEur(v?: string | null) {
  if (!v) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : `${n.toFixed(2)}€`;
}
function parseHistory(json?: string | null): HistoryEntry[] {
  try { return json ? JSON.parse(json) : []; } catch { return []; }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG["pendente"];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function InfoTile({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">{label}</p>
      <p className={`mt-1 text-sm font-medium text-slate-200 truncate ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function inputCls(extra = "") {
  return `w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 transition ${extra}`;
}

// ─── ApproveModal ─────────────────────────────────────────────────────────────

function ApproveModal({
  order,
  onClose,
  onApproved,
  authHeader,
}: {
  order: Order;
  onClose: () => void;
  onApproved: (updated: Order) => void;
  authHeader: Record<string, string>;
}) {
  const [precoFinal, setPrecoFinal] = useState(order.precoFinal ?? "");
  const [precoFinalIva, setPrecoFinalIva] = useState(order.precoFinalIva ?? "");
  const [msg, setMsg] = useState(order.mensagemCliente ?? "");
  const [notas, setNotas] = useState(order.notasInternas ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto calc IVA
  useEffect(() => {
    const n = parseFloat(precoFinal);
    if (!isNaN(n) && n > 0 && !precoFinalIva) {
      setPrecoFinalIva((n * 1.23).toFixed(2));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [precoFinal]);

  async function handleApprove() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/pedidos/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          id: order.id,
          precoFinal: parseFloat(precoFinal),
          precoFinalIva: parseFloat(precoFinalIva),
          mensagemCliente: msg,
          notasInternas: notas || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao aprovar");
      onApproved(data.order);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const waNumber = order.contactPhone ? order.contactPhone.replace(/\D/g, "") : BUSINESS_PHONE.replace(/\D/g, "");
  const valorAprovado = precoFinal ? `${parseFloat(precoFinal).toFixed(2)}€ + IVA` : null;
  const waMsg = encodeURIComponent(
    `Olá ${order.contactName ?? "cliente"}, aqui é a CLYON. ` +
    `Analisámos o seu pedido de ${order.serviceType ?? "serviço"}.` +
    (valorAprovado ? ` O valor aprovado é de ${valorAprovado}, considerando os dados enviados.` : "") +
    (msg ? ` ${msg}` : "") +
    ` Caso confirme, podemos avançar com o agendamento.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[28px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(9,20,37,0.99)_0%,rgba(7,15,28,0.99)_100%)] shadow-[0_40px_100px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">Pedido #{order.id}</p>
            <h2 className="mt-0.5 text-xl font-bold text-white">Aprovar pedido</h2>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-400 hover:text-white transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Preço sem IVA (€)">
              <input type="number" step="0.01" min="0" value={precoFinal} onChange={(e) => setPrecoFinal(e.target.value)} placeholder="ex: 200.00" className={inputCls()} />
            </Field>
            <Field label="Preço com IVA 23% (€)">
              <input type="number" step="0.01" min="0" value={precoFinalIva} onChange={(e) => setPrecoFinalIva(e.target.value)} placeholder="ex: 246.00" className={inputCls()} />
            </Field>
          </div>

          <Field label="Mensagem ao cliente">
            <textarea
              rows={4}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="O seu pedido foi aprovado. Confirmaremos a data de execução em breve..."
              className={inputCls("resize-none")}
            />
          </Field>

          <Field label="Notas internas">
            <textarea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Notas para a equipa..." className={inputCls("resize-none")} />
          </Field>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.07] px-6 py-4">
          {order.contactPhone && (
            <a
              href={`https://wa.me/${order.contactPhone.replace(/\D/g, "")}?text=${waMsg}`}
              target="_blank" rel="noreferrer"
              className="flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-400/20 transition"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              Notificar via WhatsApp
            </a>
          )}
          <div className="flex flex-1 justify-end gap-2">
            <button onClick={onClose} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/[0.07] transition">
              Cancelar
            </button>
            <button
              onClick={handleApprove}
              disabled={saving || !precoFinal}
              className="flex items-center gap-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-60 transition"
            >
              {saving ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              )}
              {saving ? "A aprovar..." : "Aprovar pedido"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AssignModal ──────────────────────────────────────────────────────────────

function AssignModal({
  order,
  assistants,
  onClose,
  onAssigned,
  authHeader,
}: {
  order: Order;
  assistants: Assistant[];
  onClose: () => void;
  onAssigned: (updated: Order) => void;
  authHeader: Record<string, string>;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(order.assignedToId ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleAssign() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/pedidos/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ id: order.id, assignedToId: selectedId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atribuir");
      onAssigned(data.order);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-[28px] border border-sky-400/20 bg-[linear-gradient(180deg,rgba(9,20,37,0.99)_0%,rgba(7,15,28,0.99)_100%)] p-6 shadow-[0_40px_100px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Atribuir assistente</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-400 hover:text-white transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-2 mb-5">
          <button
            onClick={() => setSelectedId(null)}
            className={`flex items-center gap-3 w-full rounded-2xl border px-4 py-3 text-sm transition ${
              selectedId === null
                ? "border-sky-400/40 bg-sky-400/10 text-sky-300"
                : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
            Sem atribuição
          </button>
          {assistants.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedId(a.id)}
              className={`flex items-center gap-3 w-full rounded-2xl border px-4 py-3 text-sm transition ${
                selectedId === a.id
                  ? "border-sky-400/40 bg-sky-400/10 text-sky-300"
                  : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]"
              }`}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/[0.07] text-xs font-bold text-slate-200">
                {a.nome.charAt(0).toUpperCase()}
              </span>
              <span className="flex-1 text-left">
                <span className="font-semibold">{a.nome}</span>
                <span className="text-[10px] ml-2 text-slate-500 capitalize">{a.funcao}</span>
              </span>
              {a.isAdmin ? <span className="text-[10px] text-cyan-400 font-bold">Admin</span> : null}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/[0.07] transition">
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-400 py-2.5 text-sm font-bold text-white disabled:opacity-60 transition"
          >
            {saving ? "A guardar..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPedidoDetalheClient({ id }: { id: number }) {
  const { token, ready, user, authHeader } = useAdminAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  // Edit state
  const [editStatus, setEditStatus] = useState<OrderStatus>("pendente");
  const [editPriority, setEditPriority] = useState<OrderPriority>("normal");
  const [editPrecoFinal, setEditPrecoFinal] = useState("");
  const [editPrecoFinalIva, setEditPrecoFinalIva] = useState("");
  const [editNotas, setEditNotas] = useState("");
  const [editDataAgendada, setEditDataAgendada] = useState("");
  const [editContactName, setEditContactName] = useState("");
  const [editContactPhone, setEditContactPhone] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editMensagemCliente, setEditMensagemCliente] = useState("");

  function syncEdit(o: Order) {
    setEditStatus(o.status);
    setEditPriority(o.priority ?? "normal");
    setEditPrecoFinal(o.precoFinal ?? "");
    setEditPrecoFinalIva(o.precoFinalIva ?? "");
    setEditNotas(o.notasInternas ?? "");
    setEditDataAgendada(o.dataAgendada ? new Date(o.dataAgendada).toISOString().slice(0, 16) : "");
    setEditContactName(o.contactName ?? "");
    setEditContactPhone(o.contactPhone ?? "");
    setEditDescription(o.description ?? "");
    setEditMensagemCliente(o.mensagemCliente ?? "");
  }

  const fetch_order = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [rOrder, rAssist] = await Promise.all([
        fetch(`/api/admin/pedidos/${id}`, { headers: authHeader }),
        fetch("/api/admin/assistentes", { headers: authHeader }),
      ]);
      const dOrder = await rOrder.json();
      const dAssist = await rAssist.json();
      if (!rOrder.ok) throw new Error(dOrder.error || "Pedido não encontrado");
      setOrder(dOrder.order);
      syncEdit(dOrder.order);
      setAssistants(dAssist.assistants ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id]);

  useEffect(() => { if (ready) fetch_order(); }, [ready, fetch_order]);

  async function handleSave() {
    if (!order) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/pedidos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          id: order.id,
          status: editStatus,
          priority: editPriority,
          precoFinal: editPrecoFinal || null,
          precoFinalIva: editPrecoFinalIva || null,
          notasInternas: editNotas || null,
          dataAgendada: editDataAgendada || null,
          contactName: editContactName || null,
          contactPhone: editContactPhone || null,
          description: editDescription || null,
          mensagemCliente: editMensagemCliente || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao guardar");
      setOrder(data.order);
      syncEdit(data.order);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const history = parseHistory(order?.historyJson);

  const waPhone = order?.contactPhone?.replace(/\D/g, "") ?? "";
  const waMsgDefault = encodeURIComponent(
    `Olá ${order?.contactName ?? "cliente"}, aqui é a equipa CLYON.\n\nPedido #${order?.id}: ${order?.serviceType ?? "serviço"}\nMorada: ${order?.address ?? order?.city ?? "—"}\n${editMensagemCliente ? "\n" + editMensagemCliente : ""}`
  );

  if (!ready) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <svg className="w-8 h-8 animate-spin text-cyan-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <p className="text-red-400 text-sm">{error}</p>
        <Link href="/admin/pedidos" className="text-sm text-slate-400 underline underline-offset-2">Voltar à lista</Link>
      </div>
    );
  }

  if (!order) return null;

  return (
    <>
      {/* Modals */}
      {showApprove && (
        <ApproveModal
          order={order}
          authHeader={authHeader}
          onClose={() => setShowApprove(false)}
          onApproved={(o) => { setOrder(o); syncEdit(o); setShowApprove(false); }}
        />
      )}
      {showAssign && (
        <AssignModal
          order={order}
          assistants={assistants}
          authHeader={authHeader}
          onClose={() => setShowAssign(false)}
          onAssigned={(o) => { setOrder(o); syncEdit(o); setShowAssign(false); }}
        />
      )}

      <div className="min-h-full px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto">
        {/* Back + header */}
        <div className="mb-6">
          <Link
            href="/admin/pedidos"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 mb-4 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Voltar aos pedidos
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400">Pedido #{order.id}</p>
              <h1 className="text-2xl font-bold text-white mt-0.5">{order.serviceType ?? "Serviço não especificado"}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <StatusBadge status={order.status} />
                {order.assignedToName && (
                  <span className="text-xs text-sky-400">Assistente: {order.assignedToName}</span>
                )}
                <span className="text-[11px] text-slate-600">Criado: {fmt(order.createdAt)}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {waPhone && (
                <a
                  href={`https://wa.me/${waPhone}?text=${waMsgDefault}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-400/20 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  WhatsApp
                </a>
              )}
              <button
                onClick={() => setShowAssign(true)}
                className="flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-400/20 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Atribuir
              </button>
              <button
                onClick={() => setShowApprove(true)}
                className="flex items-center gap-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Aprovar
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-5">

            {/* Info do cliente */}
            <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.02] p-5">
              <h2 className="text-sm font-bold text-white mb-4">Informações do cliente</h2>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                <InfoTile label="Nome" value={order.contactName} />
                <InfoTile label="Telefone" value={order.contactPhone} />
                <InfoTile label="Email" value={order.contactEmail} />
                <InfoTile label="Morada" value={order.address ?? order.city} />
                <InfoTile label="Andar" value={order.floor} />
                <InfoTile label="Elevador" value={order.hasElevator} />
                <InfoTile label="Estacionamento" value={order.parkingDistance} />
                <InfoTile label="Distância" value={order.distanceText} />
                <InfoTile label="Urgência" value={order.urgency} />
              </div>
            </div>

            {/* Descrição */}
            {order.description && (
              <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.02] p-5">
                <h2 className="text-sm font-bold text-white mb-2">Descrição do pedido</h2>
                <p className="text-sm leading-relaxed text-slate-300">{order.description}</p>
              </div>
            )}

            {/* Estimativa */}
            <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.02] p-5">
              <h2 className="text-sm font-bold text-white mb-4">Estimativa do simulador</h2>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                <InfoTile label="Mín" value={fmtEur(order.estimateMin)} />
                <InfoTile label="Máx" value={fmtEur(order.estimateMax)} />
                <InfoTile label="Total est." value={fmtEur(order.estimateTotal)} />
                <InfoTile label="Preço final s/IVA" value={fmtEur(order.precoFinal)} />
                <InfoTile label="Preço final c/IVA" value={fmtEur(order.precoFinalIva)} />
              </div>
            </div>

            {/* Análise Gemini */}
            {(() => {
              const est = parseEstimate(order.estimateJson);
              if (!est) return null;
              const diff = est.difficultyLevel ?? 0;
              return (
                <div className="rounded-[24px] border border-violet-400/20 bg-violet-400/[0.03] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-6 w-6 rounded-xl bg-violet-400/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h2 className="text-sm font-bold text-white">Análise do Gemini</h2>
                    <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-violet-400 border border-violet-400/30 rounded-full px-2 py-0.5">IA</span>
                  </div>

                  <div className="space-y-4">
                    {/* Status + Dificuldade */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Status da análise</p>
                        <p className="mt-1 text-sm font-semibold text-slate-200 capitalize">
                          {est.status === "estimated" ? "Estimativa pronta" : est.status === "onsite_required" ? "Visita necessária" : est.status === "needs_more_info" ? "Mais informação" : est.status ?? "—"}
                        </p>
                      </div>
                      {diff > 0 && (
                        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Nível de dificuldade</p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map((n) => (
                                <div key={n} className={`h-1.5 w-4 rounded-full ${n <= diff ? "bg-violet-400" : "bg-white/10"}`} />
                              ))}
                            </div>
                            <span className={`text-xs font-semibold ${DIFFICULTY_COLOR[diff] ?? "text-slate-300"}`}>
                              {DIFFICULTY_LABEL[diff] ?? diff}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Preços IA */}
                    {(est.estimatedPriceWithoutVat || est.estimatedPriceWithVat) && (
                      <div className="grid grid-cols-3 gap-3">
                        {est.estimatedPriceWithoutVat != null && (
                          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Sem IVA</p>
                            <p className="mt-1 text-sm font-bold text-cyan-400">{est.estimatedPriceWithoutVat.toFixed(2)}€</p>
                          </div>
                        )}
                        {est.vatAmount != null && (
                          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">IVA 23%</p>
                            <p className="mt-1 text-sm font-bold text-slate-300">{est.vatAmount.toFixed(2)}€</p>
                          </div>
                        )}
                        {est.estimatedPriceWithVat != null && (
                          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Com IVA</p>
                            <p className="mt-1 text-sm font-bold text-emerald-400">{est.estimatedPriceWithVat.toFixed(2)}€</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Resumo */}
                    {est.summary && (
                      <div className="rounded-2xl border border-violet-400/10 bg-violet-400/5 px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-400 mb-1.5">Resumo da análise</p>
                        <p className="text-sm leading-relaxed text-slate-300">{est.summary}</p>
                      </div>
                    )}

                    {/* Mensagem ao cliente sugerida */}
                    {est.customerMessage && (
                      <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 mb-1.5">Mensagem sugerida ao cliente</p>
                        <p className="text-sm leading-relaxed text-slate-300">{est.customerMessage}</p>
                      </div>
                    )}

                    {/* Pressupostos */}
                    {est.assumptions && est.assumptions.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Pressupostos considerados</p>
                        <ul className="space-y-1">
                          {est.assumptions.map((a, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Campos em falta */}
                    {est.missingFields && est.missingFields.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-500 mb-2">Campos em falta</p>
                        <ul className="space-y-1">
                          {est.missingFields.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-amber-400">
                              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                              {f.replace(/_/g, " ")}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Notas internas */}
                    {est.internalNotes && est.internalNotes.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Notas internas da IA</p>
                        <ul className="space-y-1">
                          {est.internalNotes.map((n, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-slate-600 flex-shrink-0" />
                              {n}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Edição */}
            <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.02] p-5">
              <h2 className="text-sm font-bold text-white mb-5">Editar pedido</h2>
              <div className="space-y-4">
                {/* Estado */}
                <Field label="Estado">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {ALL_STATUSES.map((s) => {
                      const cfg = STATUS_CFG[s];
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setEditStatus(s)}
                          className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                            editStatus === s
                              ? `${cfg.badge} border-transparent`
                              : "border-white/10 bg-white/[0.03] text-slate-500 hover:bg-white/[0.06]"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${editStatus === s ? cfg.dot : "bg-slate-700"}`} />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* Prioridade */}
                <Field label="Prioridade">
                  <div className="flex gap-2 flex-wrap">
                    {ALL_PRIORITIES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setEditPriority(p)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition ${
                          editPriority === p
                            ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                            : "border-white/10 bg-white/[0.03] text-slate-500 hover:bg-white/[0.06]"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Preços */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Preço final s/IVA (€)">
                    <input type="number" step="0.01" min="0" value={editPrecoFinal} onChange={(e) => setEditPrecoFinal(e.target.value)} placeholder="200.00" className={inputCls()} />
                  </Field>
                  <Field label="Preço final c/IVA (€)">
                    <input type="number" step="0.01" min="0" value={editPrecoFinalIva} onChange={(e) => setEditPrecoFinalIva(e.target.value)} placeholder="246.00" className={inputCls()} />
                  </Field>
                </div>

                {/* Data */}
                <Field label="Data agendada">
                  <input type="datetime-local" value={editDataAgendada} onChange={(e) => setEditDataAgendada(e.target.value)} className={inputCls()} />
                </Field>

                {/* Contacto */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nome do cliente">
                    <input type="text" value={editContactName} onChange={(e) => setEditContactName(e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="Telefone">
                    <input type="text" value={editContactPhone} onChange={(e) => setEditContactPhone(e.target.value)} className={inputCls()} />
                  </Field>
                </div>

                {/* Descrição */}
                <Field label="Descrição do serviço">
                  <textarea rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className={inputCls("resize-none")} />
                </Field>

                {/* Mensagem ao cliente */}
                <Field label="Mensagem ao cliente">
                  <textarea rows={2} value={editMensagemCliente} onChange={(e) => setEditMensagemCliente(e.target.value)} placeholder="Aprovamos o seu pedido..." className={inputCls("resize-none")} />
                </Field>

                {/* Notas internas */}
                <Field label="Notas internas (só admins)">
                  <textarea rows={3} value={editNotas} onChange={(e) => setEditNotas(e.target.value)} placeholder="Notas para a equipa..." className={inputCls("resize-none")} />
                </Field>

                {error && (
                  <div className="flex items-center gap-2 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 py-3 text-sm font-bold text-slate-950 disabled:opacity-60 transition"
                >
                  {saving ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  )}
                  {saving ? "A guardar..." : "Guardar alterações"}
                </button>
              </div>
            </div>
          </div>

          {/* Coluna lateral */}
          <div className="space-y-4">
            {/* Resumo rápido */}
            <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Resumo</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider">Contacto</p>
                  <p className="text-sm font-medium text-slate-200 mt-0.5">{order.contactName ?? "—"}</p>
                  {order.contactPhone && (
                    <a href={`tel:${order.contactPhone}`} className="text-xs text-cyan-400 hover:underline">{order.contactPhone}</a>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider">Assistente</p>
                  <p className="text-sm font-medium text-slate-200 mt-0.5">{order.assignedToName ?? "Não atribuído"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider">Criado em</p>
                  <p className="text-sm text-slate-300 mt-0.5">{fmt(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider">Atualizado</p>
                  <p className="text-sm text-slate-300 mt-0.5">{fmt(order.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Mensagem ao cliente (só leitura se preenchida) */}
            {order.mensagemCliente && (
              <div className="rounded-[24px] border border-cyan-400/10 bg-cyan-400/5 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 mb-2">Mensagem ao cliente</p>
                <p className="text-sm leading-relaxed text-slate-300">{order.mensagemCliente}</p>
                {order.contactPhone && (
                  <a
                    href={`https://wa.me/${order.contactPhone.replace(/\D/g, "")}?text=${encodeURIComponent(order.mensagemCliente)}`}
                    target="_blank" rel="noreferrer"
                    className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    Enviar via WhatsApp
                  </a>
                )}
              </div>
            )}

            {/* Histórico */}
            {history.length > 0 && (
              <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.02] p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Histórico</h3>
                <div className="space-y-3">
                  {history.slice().reverse().map((entry, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex-shrink-0 mt-1 h-5 w-5 rounded-xl bg-white/[0.06] flex items-center justify-center">
                        <span className="text-[8px] font-bold text-slate-400">{entry.type.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-300">{entry.message}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">
                          {entry.by?.nome && <span className="text-slate-500">{entry.by.nome} · </span>}
                          {new Date(entry.createdAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
