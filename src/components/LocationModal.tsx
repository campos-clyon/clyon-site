'use client';

import React, { useState } from 'react';
import { useLocation, CustomerLocation } from '@/contexts/LocationContext';
import AddressAutocomplete from '@/app/simulador/components/AddressAutocomplete';

interface LocationModalProps {
  onClose: () => void;
}

export default function LocationModal({ onClose }: LocationModalProps) {
  const { location, setLocation } = useLocation();
  const [tempAddress, setTempAddress] = useState(location?.formattedAddress ?? '');

  const handleSelectAddress = (addressData: CustomerLocation) => {
    setLocation(addressData);
    if (addressData.formattedAddress) {
      setTempAddress(addressData.formattedAddress);
    }
  };

  const handleClear = () => {
    setLocation(null);
    setTempAddress('');
  };

  const handleSave = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Localização de Entrega</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Address Input with Autocomplete */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Morada de Entrega
          </label>
          <AddressAutocomplete
            value={tempAddress}
            onChange={setTempAddress}
            onSelect={handleSelectAddress}
            placeholder="Digite a morada..."
          />
        </div>

        {/* Current Location Display */}
        {location && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm font-medium text-slate-700 mb-1">Localização Actual:</p>
            <p className="text-sm text-slate-600">{location.formattedAddress}</p>
            <p className="text-xs text-slate-500 mt-2">{location.postalCode} · {location.city}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {location && (
            <button
              onClick={handleClear}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Limpar
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
