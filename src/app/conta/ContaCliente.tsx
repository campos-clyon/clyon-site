"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { CalendarDays, ArrowRight, ClipboardList, LogOut } from "lucide-react";

interface Pedido {
  id: number;
  serviceType: string;
  address: string | null;
  city: string | null;
  status: string;
  estimateTotal: number | null;
  precoFinal: number | null;
  precoFinalIva: number | null;
  mensagemCliente: string | null;
  createdAt: string;
  scheduledDate: string | null;
  scheduledStartTime: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pendente:        { label: "Novo",         bg: "bg-blue-100",   text: "text-blue-700" },
  em_analise:      { label: "Em análise",   bg: "bg-amber-100",  text: "text-amber-700" },
  aprovado:        { label: "Aprovado",     bg: "bg-cyan-100",   text: "text-cyan-700" },
  agendado:        { label: "Agendado",     bg: "bg-violet-100", text: "text-violet-700" },
  em_curso:        { label: "Em curso",     bg: "bg-orange-100", text: "text-orange-700" },
  concluido:       { label: "Concluído",    bg: "bg-green-100",  text: "text-green-700" },
  cancelado:       { label: "Cancelado",    bg: "bg-slate-100",  text: "text-slate-500" },
  confirmado:      { label: "Confirmado",   bg: "bg-emerald-100","text": "text-emerald-700" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: "bg-slate-100", text: "text-slate-600" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function serviceLabel(type: string) {
  const map: Record<string, string> = {
    recolha_moveis:           "Recolha de Móveis",
    recolha_entulho:          "Recolha de Entulho",
    recolha_monos:            "Recolha de Monos",
    esvaziamento_casa:        "Esvaziamento de Casa",
    esvaziamento_apartamento: "Esvaziamento de Apartamento",
    limpeza_pos_obra:         "Limpeza Pós-Obra",
    limpeza_quintais:         "Limpeza de Quintais",
    mudanca:                  "Mudança",
    recolha_eletrodomesticos: "Recolha de Eletrodomésticos",
  };
  return map[type] ?? type;
}

export default function ContaCliente({
  nome,
  email,
  avatar,
}: {
  nome: string;
  email: string;
  avatar: string | null;
}) {
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    fetch("/api/conta/pedidos")
      .then((r) => r.json())
      .then((d) => {
        if (d.pedidos) setPedidos(d.pedidos);
        else setErro(true);
      })
      .catch(() => setErro(true));
  }, []);

  const primeiroNome = nome.split(" ")[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Saudação */}
      <div className="mb-8 flex items-center gap-4">
        {avatar ? (
          <Image
            src={avatar}
            alt={nome}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full border-2 border-cyan-200 object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-100 text-xl font-bold text-cyan-700">
            {primeiroNome.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Olá, {primeiroNome}!
          </h1>
          <p className="text-sm text-slate-500">{email}</p>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>

      {/* Secção pedidos */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-cyan-600" />
          <h2 className="text-lg font-semibold text-slate-800">Os meus pedidos</h2>
        </div>

        {/* Estado de carregamento */}
        {pedidos === null && !erro && (
          <div className="flex items-center justify-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          </div>
        )}

        {/* Erro */}
        {erro && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Não foi possível carregar os pedidos. Tenta de novo mais tarde.
          </div>
        )}

        {/* Sem pedidos */}
        {pedidos !== null && pedidos.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
            <ClipboardList className="mb-3 h-10 w-10 text-slate-300" />
            <p className="mb-1 text-base font-medium text-slate-700">
              Ainda não tens pedidos.
            </p>
            <p className="mb-6 text-sm text-slate-500">
              Faz um orçamento gratuito e recebe uma proposta em 24h.
            </p>
            <Link
              href="/simulador"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              Pedir orçamento gratuito
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Lista de pedidos */}
        {pedidos && pedidos.length > 0 && (
          <ul className="space-y-3">
            {pedidos.map((p) => {
              const preco = p.precoFinalIva ?? p.precoFinal ?? p.estimateTotal;
              const local = [p.address, p.city].filter(Boolean).join(", ");
              const data = new Date(p.createdAt).toLocaleDateString("pt-PT", {
                day: "2-digit", month: "short", year: "numeric",
              });
              return (
                <li
                  key={p.id}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-slate-200 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-800">
                          {serviceLabel(p.serviceType)}
                        </span>
                        <StatusBadge status={p.status} />
                      </div>
                      {local && (
                        <p className="mt-1 text-sm text-slate-500 truncate">{local}</p>
                      )}
                      {p.mensagemCliente && (
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {p.mensagemCliente}
                        </p>
                      )}
                      {p.scheduledDate && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                          <CalendarDays className="h-3.5 w-3.5 text-cyan-500" />
                          <span>
                            Agendado para{" "}
                            {new Date(p.scheduledDate).toLocaleDateString("pt-PT", {
                              day: "2-digit", month: "long",
                            })}
                            {p.scheduledStartTime ? ` às ${p.scheduledStartTime}` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 text-right">
                      {preco != null && (
                        <span className="text-lg font-bold text-slate-900">
                          {Number(preco).toFixed(2)} €
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{data}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Link para novo pedido */}
      {pedidos && pedidos.length > 0 && (
        <div className="mt-8 text-center">
          <Link
            href="/simulador"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
          >
            Fazer novo pedido
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
