"use client";

import {
  LayoutDashboard,
  ClipboardList,
  User,
  Receipt,
  Bell,
  Shield,
} from "lucide-react";
import type { Section } from "./types";

const TABS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "visao-geral",    label: "Geral",    icon: LayoutDashboard },
  { id: "pedidos",        label: "Pedidos",  icon: ClipboardList },
  { id: "dados-pessoais", label: "Dados",    icon: User },
  { id: "faturacao",      label: "Fatura",   icon: Receipt },
  { id: "notificacoes",   label: "Notif.",   icon: Bell },
  { id: "seguranca",      label: "Seg.",     icon: Shield },
];

interface Props {
  section: Section;
  onSection: (s: Section) => void;
}

export default function MobileTabs({ section, onSection }: Props) {
  return (
    <div className="sticky top-0 z-10 flex w-full border-b border-slate-100 bg-white">
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = section === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSection(id)}
            className={`flex flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-medium transition border-b-2 ${
              active
                ? "border-[#00B4D8] text-[#0077B6]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
