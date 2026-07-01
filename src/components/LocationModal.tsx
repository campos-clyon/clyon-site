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
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const handleSelectAddress = (addressData: CustomerLocation) => {
    setLocation({ ...addressData, source: 'manual' });
    if (addressData.formattedAddress) {
      setTempAddress(addressData.formattedAddress);
    }
    setGpsError(null);
  };

  const handleUseGPS = async () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocalização não suportada no seu browser');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Chamar reverse geocoding API
          const response = await fetch('/api/address/reverse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: latitude, lng: longitude }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erro ao obter endereço');
          }

          const data = await response.json();

          if (data.ok) {
            // Se sucesso, limpar flag de permissão negada
            localStorage.removeItem('clyon_location_permission_denied');
            
            setLocation({
              formattedAddress: data.formattedAddress,
              city: data.city,
              postalCode: data.postalCode,
              lat: data.lat,
              lng: data.lng,
              source: 'gps',
            });
            setTempAddress(data.formattedAddress);
            setGpsError(null);
          } else {
            setGpsError(data.message || 'Erro ao obter endereço');
          }
        } catch (err) {
          console.error('[LocationModal GPS] Erro:', err);
          setGpsError(
            err instanceof Error ? err.message : 'Erro ao processar localização'
          );
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        setGpsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError('Permissão de localização negada');
        } else if (error.code === error.TIMEOUT) {
          setGpsError('Timeout ao obter localização');
        } else {
          setGpsError('Erro ao obter localização');
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const handleClear = () => {
    setLocation(null);
    setTempAddress('');
    setGpsError(null);
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

        {/* GPS Button */}
        <div className="mb-6">
          <button
            onClick={handleUseGPS}
            disabled={gpsLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {gpsLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                A obter localização...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
                </svg>
                Usar localização atual
              </>
            )}
          </button>
        </div>

        {/* GPS Error Display */}
        {gpsError && (
          <div className="mb-6 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">{gpsError}</p>
          </div>
        )}

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
