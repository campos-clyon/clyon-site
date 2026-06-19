"use client";

import type { OrderData } from "../types";

const SERVICE_LABELS: Record<string, string> = {
  recolha_moveis: "Recolha de móveis",
  recolha_monos: "Recolha de monos",
  recolha_entulho: "Recolha de entulho",
  esvaziamento_casa: "Esvaziamento de casa",
  esvaziamento_apartamento: "Esvaziamento de apartamento",
  mudanca: "Mudança",
  outro: "Outro serviço",
};

const ELEVATOR_LABELS: Record<string, string> = {
  yes: "Sim, funciona",
  small: "Sim, mas é pequeno",
  no: "Não tem elevador",
  unknown: "Não sei",
};

const PARKING_LABELS: Record<string, string> = {
  door: "Sim, mesmo à porta",
  under_20m: "Sim, até 20 metros",
  over_30m: "Mais de 30 metros",
  difficult: "Estacionamento difícil",
  unknown: "Não sei",
};

const URGENCY_LABELS: Record<string, string> = {
  no: "Sem urgência",
  today: "Hoje",
  tomorrow: "Amanhã",
  this_week: "Esta semana",
  flexible: "Flexível",
};

interface SummaryRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  status: "pending" | "filled" | "in_progress";
}

function SummaryRow({ icon, label, value, status }: SummaryRowProps) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[#F1F5F9] last:border-0">
      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#94A3B8]">{label}</p>
        {value && <p className="text-sm font-medium text-[#102033] truncate">{value}</p>}
      </div>
      <div className="flex-shrink-0">
        {status === "filled" && (
          <div className="w-5 h-5 rounded-full bg-[#22C55E] flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {status === "in_progress" && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706]">
            Em curso
          </span>
        )}
        {status === "pending" && (
          <div className="w-4 h-4 rounded-full bg-[#E2E8F0]" />
        )}
      </div>
    </div>
  );
}

interface OrderSummaryCardProps {
  order: OrderData;
  onEdit?: () => void;
}

export default function OrderSummaryCard({ order, onEdit }: OrderSummaryCardProps) {
  const fileCount = order.files?.length ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#102033]">Resumo do pedido</h3>
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-xs text-[#0487D9] hover:text-[#036BB0] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Editar
          </button>
        )}
      </div>

      <div className="px-5 py-1">
        <SummaryRow
          icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
          label="Serviço"
          value={order.serviceType ? SERVICE_LABELS[order.serviceType] : undefined}
          status={order.serviceType ? "filled" : "pending"}
        />
        <SummaryRow
          icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" /></svg>}
          label="Descrição"
          value={order.description ? order.description.slice(0, 40) + (order.description.length > 40 ? "..." : "") : undefined}
          status={order.description ? "filled" : "pending"}
        />
        <SummaryRow
          icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          label="Fotos / Vídeos"
          value={fileCount > 0 ? `${fileCount} ${fileCount === 1 ? "ficheiro" : "ficheiros"} enviados` : undefined}
          status={fileCount > 0 ? "filled" : "pending"}
        />
        <SummaryRow
          icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          label="Morada"
          value={order.address?.formattedAddress ?? order.city}
          status={order.address?.formattedAddress || order.city ? "filled" : "pending"}
        />
        <SummaryRow
          icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
          label="Andar"
          value={order.floor}
          status={order.floor ? "filled" : "pending"}
        />
        <SummaryRow
          icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" strokeWidth={1.5} /><rect x="14" y="3" width="7" height="7" rx="1" strokeWidth={1.5} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.5 10v4m0 0v4m0-4h4m-4 0H3" /></svg>}
          label="Elevador"
          value={order.hasElevator ? ELEVATOR_LABELS[order.hasElevator] : undefined}
          status={order.hasElevator ? "filled" : "pending"}
        />
        <SummaryRow
          icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h8m0 0l-3-3m3 3l-3 3M3 17l3 3 3-3M3 17V7m18 10l-3 3-3-3m3 3V7" /></svg>}
          label="Estacionamento"
          value={order.parkingDistance ? PARKING_LABELS[order.parkingDistance] : undefined}
          status={order.parkingDistance ? "filled" : "pending"}
        />
        <SummaryRow
          icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
          label="Contacto"
          value={order.receiver?.name}
          status={order.receiver?.name && order.receiver?.phone ? "filled" : order.receiver?.name ? "in_progress" : "pending"}
        />
        <SummaryRow
          icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          label="Urgência"
          value={order.urgency ? URGENCY_LABELS[order.urgency] : undefined}
          status={order.urgency ? "filled" : "pending"}
        />
        <SummaryRow
          icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          label="Distância da base"
          value={
            order.distanceStatus === "calculated" && order.distanceFromBase?.distanceKm
              ? `${order.distanceFromBase.distanceKm} km · ${order.distanceFromBase.durationText}`
              : order.distanceStatus === "calculating"
              ? "A calcular..."
              : order.distanceStatus === "error"
              ? "A confirmar manualmente"
              : undefined
          }
          status={
            order.distanceStatus === "calculated"
              ? "filled"
              : order.distanceStatus === "calculating"
              ? "in_progress"
              : "pending"
          }
        />
      </div>
    </div>
  );
}
