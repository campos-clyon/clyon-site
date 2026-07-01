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

  // Resumir morada: mostrar rua resumida + cidade
  const addressDisplay = location && location.formattedAddress
    ? location.formattedAddress.length > 40
      ? location.formattedAddress.substring(0, 37) + "..."
      : location.formattedAddress
    : "Definir localização";

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex flex-col items-start gap-1 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
        title="Alterar localização de entrega"
      >
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Localização
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-slate-900">
            {addressDisplay}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        </div>
      </button>

      {showModal && <LocationModal onClose={() => setShowModal(false)} />}
    </>
  );
}
