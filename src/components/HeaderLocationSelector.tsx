'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocation } from '@/contexts/LocationContext';
import LocationModal from './LocationModal';

export default function HeaderLocationSelector() {
  const { location, isLoading } = useLocation();
  const [showModal, setShowModal] = useState(false);

  if (isLoading) {
    return null;
  }

  // Truncar morada a ~25 caracteres + reticências
  const addressDisplay = location && location.formattedAddress
    ? location.formattedAddress.length > 25
      ? location.formattedAddress.substring(0, 22) + "..."
      : location.formattedAddress
    : "Definir localização";

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="group hidden lg:flex h-14 w-[210px] items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-left transition hover:bg-slate-50"
        title="Alterar localização de entrega"
      >
        <div className="min-w-0">
          <div className="text-xs font-medium text-slate-500">
            Localização
          </div>
          <div className="truncate text-sm font-bold text-slate-900">
            {addressDisplay}
          </div>
        </div>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-slate-700" />
      </button>

      {showModal && <LocationModal onClose={() => setShowModal(false)} />}
    </>
  );
}
