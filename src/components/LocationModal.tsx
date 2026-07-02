'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, MapPin, Loader2, Navigation, Search } from 'lucide-react';
import { useLocation, CustomerLocation } from '@/contexts/LocationContext';
import { checkCoverage } from '@/lib/coverage';
import LocationMap from '@/components/LocationMap';

interface LocationModalProps {
  onClose: () => void;
}

interface Prediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export default function LocationModal({ onClose }: LocationModalProps) {
  const { location, setLocation } = useLocation();
  const [query, setQuery] = useState(location?.formattedAddress ?? '');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [searching, setSearching] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const coverage = location
    ? checkCoverage({ city: location.city, countryCode: location.countryCode })
    : null;
  const showOutOfArea = Boolean(location && coverage && !coverage.covered);

  // ── Pesquisa de moradas via Google Places ──────────────────────────────
  const fetchPredictions = useCallback(async (input: string) => {
    if (input.trim().length < 3) {
      setPredictions([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch('/api/maps/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      setPredictions(data.predictions ?? []);
    } catch (err) {
      console.error('[LocationModal] Erro na pesquisa:', err);
      setPredictions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(value), 300);
  };

  // ── Selecionar sugestão → obter detalhes (lat/lng) ─────────────────────
  const handleSelectPrediction = async (prediction: Prediction) => {
    setQuery(prediction.description);
    setPredictions([]);
    setSelecting(true);
    setError(null);

    try {
      const res = await fetch('/api/maps/place-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId: prediction.placeId }),
      });
      const data = await res.json();

      if (data.ok) {
        setLocation({
          formattedAddress: data.formattedAddress || prediction.description,
          city: data.city,
          postalCode: data.postalCode,
          countryCode: data.countryCode,
          lat: data.lat,
          lng: data.lng,
          label: data.city || prediction.mainText,
          source: 'manual',
          isApproximate: false,
        });
      } else {
        setError('Não foi possível obter os detalhes desta morada.');
      }
    } catch (err) {
      console.error('[LocationModal] Erro nos detalhes:', err);
      setError('Não foi possível obter os detalhes desta morada.');
    } finally {
      setSelecting(false);
    }
  };

  // ── GPS ────────────────────────────────────────────────────────────────
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada no seu navegador');
      return;
    }
    setGpsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch('/api/address/reverse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: latitude, lng: longitude }),
          });
          const data = await res.json();
          if (data.ok) {
            localStorage.removeItem('clyon_location_permission_denied');
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
            setQuery(data.formattedAddress);
          } else {
            setError(data.message || 'Erro ao obter endereço');
          }
        } catch (err) {
          console.error('[LocationModal] GPS erro:', err);
          setError('Erro ao processar localização');
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError('Permissão de localização negada');
        } else if (err.code === err.TIMEOUT) {
          setError('Tempo esgotado ao obter localização');
        } else {
          setError('Erro ao obter localização');
        }
      },
      { timeout: 10000, enableHighAccuracy: false },
    );
  };

  const handleClear = () => {
    setQuery('');
    setPredictions([]);
    setError(null);
  };

  // Fechar dropdown ao carregar Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <MapPin className="h-5 w-5 text-cyan-600" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">A tua localização</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Insere o teu endereço para veres serviços e preços na tua área.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corpo: duas colunas no desktop */}
        <div className="grid gap-0 md:grid-cols-2">
          {/* Coluna esquerda: pesquisa */}
          <div className="flex flex-col p-6">
            {/* Input de pesquisa */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Endereço, cidade ou código postal..."
                className="w-full rounded-xl border-2 border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 shadow-sm transition focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-600/20"
                autoFocus
              />
              {query && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  aria-label="Limpar"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sugestões / estados */}
            <div className="mt-3 min-h-[220px] flex-1">
              {searching && (
                <div className="flex items-center gap-2 px-1 py-3 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  A procurar moradas...
                </div>
              )}

              {!searching && predictions.length > 0 && (
                <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
                  {predictions.map((p) => (
                    <li key={p.placeId}>
                      <button
                        onClick={() => handleSelectPrediction(p)}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                      >
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-slate-900">
                            {p.mainText}
                          </span>
                          <span className="block truncate text-xs text-slate-500">
                            {p.secondaryText}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!searching &&
                predictions.length === 0 &&
                query.trim().length >= 3 &&
                !selecting &&
                !location && (
                  <p className="px-1 py-3 text-sm text-slate-400">
                    Nenhuma morada encontrada para &quot;{query}&quot;.
                  </p>
                )}

              {/* Localização selecionada */}
              {location && predictions.length === 0 && !searching && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-500">Localização selecionada</p>
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
            </div>

            {/* Botão GPS */}
            <button
              onClick={handleUseGPS}
              disabled={gpsLoading || selecting}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {gpsLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  A obter localização...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 text-cyan-600" />
                  Usar localização atual
                </>
              )}
            </button>

            {error && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {showOutOfArea && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">
                  Ainda não estamos na tua área… mas em breve!
                </p>
                <p className="mt-1.5 text-sm text-amber-800">
                  Estamos a crescer rapidamente. Enquanto isso, experimenta procurar noutra
                  localização.
                </p>
              </div>
            )}
          </div>

          {/* Coluna direita: mapa */}
          <div className="relative min-h-[240px] border-t border-slate-100 md:border-l md:border-t-0">
            <LocationMap
              lat={location?.lat}
              lng={location?.lng}
              className="h-full min-h-[240px] w-full"
            />
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          {showOutOfArea && (
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Continuar a explorar
            </button>
          )}
          <button
            onClick={onClose}
            disabled={selecting}
            className="rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-700 disabled:opacity-50"
          >
            {selecting ? 'A carregar...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
