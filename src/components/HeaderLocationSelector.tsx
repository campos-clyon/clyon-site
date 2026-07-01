'use client';

import React, { useState } from 'react';
import { useLocation } from '@/contexts/LocationContext';
import LocationModal from './LocationModal';

export default function HeaderLocationSelector() {
  const { location, isLoading } = useLocation();
  const [showModal, setShowModal] = useState(false);

  if (isLoading) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-sm text-slate-700"
        title="Alterar localização de entrega"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="hidden sm:inline text-slate-600">
          {location ? (
            <span className="font-medium text-slate-900">{location.city}</span>
          ) : (
            <span>Selecionar localização</span>
          )}
        </span>
      </button>

      {showModal && <LocationModal onClose={() => setShowModal(false)} />}
    </>
  );
}
