'use client';

import React, { useState } from 'react';
import { X, MapPin, Loader2 } from 'lucide-react';
import { useLocation, CustomerLocation } from '@/contexts/LocationContext';
import { checkCoverage } from '@/lib/coverage';
import AddressAutocomplete from '@/app/simulador/components/AddressAutocomplete';

interface LocationModalProps {
  onClose: () => void;
}

export default function LocationModal({ onClose }: LocationModalProps) {
  const { location, setLocation } = useLocation();
  const [tempAddress, setTempAddress] = useState(location?.formattedAddress ?? '');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const coverage = location
    ? checkCoverage({ city: location.city, countryCode: location.countryCode })
    : null;

  // Mostrar aviso "fora de área" quando temos localização e não está coberta
  const showOutOfArea = Boolean(location && coverage && !coverage.covered);

  const handleSelectAddress = (addressData: CustomerLocation) => {
    setLocation({ ...addressData, source: 'manual', isApproximate: false });
    if (addressData.formattedAddress) {
      setTempAddress(addressData.formattedAddress);
    }
    setGpsError(null);
  };

  const handleUseGPS = async () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocalização não suportada no seu navegador');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
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
            setLocation({
              formattedAddress: data.formattedAddress,
              city: data.city,
              postalCode: data.postalCode,
              lat: data.lat,
              lng: data.lng,
              label: data.city,
              source: 'gps',
              isApproximate: false,
            });
            setTempAddress(data.formattedAddress);
            setGpsError(null);
          } else {
            setGpsError(data.message || 'Erro ao obter endereço');
          }
        } catch (err) {
          console.error('[LocationModal GPS] Erro:', err);
          setGpsError(err instanceof Error ? err.message : 'Erro ao processar localização');
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        setGpsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError('Permissão de localização negada');
        } else if (error.code === error.TIMEOUT) {
          setGpsError('Tempo esgotado ao obter localização');
        } else {
          setGpsError('Erro ao obter localização');
        }
      },
      { timeout: 10000, enableHighAccuracy: false },
    );
  };

  const handleSave = () => {
    onClose();
  };

  // Fora de área: limpar campo para o utilizador tentar outra morada (não fecha)
  const handleTryAnother = () => {
    setTempAddress('');
    setGpsError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-cyan-600" />
            <h2 className="text-lg font-semibold text-slate-900">A tua localização</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 transition hover:text-slate-600"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {showOutOfArea ? (
          /* Aviso fora de cobertura (estilo Oscar) */
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              Ainda não estamos na tua área… mas em breve!
            </p>
            <p className="mt-1.5 text-sm text-amber-800">
              Estamos a crescer rapidamente e esperamos estar na tua área em breve.
              Enquanto isso, experimenta procurar noutra localização.
            </p>
          </div>
        ) : (
          <p className="mb-5 text-sm leading-relaxed text-slate-600">
            Insere o teu endereço, cidade ou código postal para que possamos mostrar os
            serviços disponíveis e os preços atualizados na tua área.
          </p>
        )}

        {/* Autocomplete de morada */}
        <div className="mb-4">
          <AddressAutocomplete
            value={tempAddress}
            onChange={setTempAddress}
            onSelect={handleSelectAddress}
            placeholder="Endereço, cidade ou código postal..."
          />
        </div>

        {/* Botão GPS */}
        <button
          onClick={handleUseGPS}
          disabled={gpsLoading}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {gpsLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              A obter localização...
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4" />
              Usar localização atual
            </>
          )}
        </button>

        {/* Erro GPS */}
        {gpsError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{gpsError}</p>
          </div>
        )}

        {/* Localização atual */}
        {location && !gpsError && (
          <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Localização atual</p>
            <p className="mt-0.5 text-sm font-medium text-slate-800">
              {location.formattedAddress || location.label || location.city}
            </p>
            {location.isApproximate && (
              <p className="mt-1 text-xs text-slate-400">
                Localização aproximada — escolhe uma morada exata para um orçamento preciso.
              </p>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-3">
          {showOutOfArea && (
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Continuar a explorar
            </button>
          )}
          <button
            onClick={showOutOfArea ? handleTryAnother : handleSave}
            className="flex-1 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-700"
          >
            {showOutOfArea ? 'Experimenta outra localização' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
