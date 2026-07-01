"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AddressData, AddressStatus, DistanceFromBase, DistanceStatus } from "../types";

interface NominatimResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    postcode?: string;
    state?: string;
  };
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (data: AddressData) => void;
  onDistanceCalculated?: (distance: DistanceFromBase, status: DistanceStatus) => void;
  placeholder?: string;
  className?: string;
}

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps?: () => void;
  }
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  onDistanceCalculated,
  placeholder = "Escreva a rua, número e localidade...",
  className = "",
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nominatimAbortRef = useRef<AbortController | null>(null);

  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [addressStatus, setAddressStatus] = useState<AddressStatus>("empty");
  const [distanceStatus, setDistanceStatus] = useState<DistanceStatus>("idle");
  const [distanceResult, setDistanceResult] = useState<DistanceFromBase | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Carregar Google Maps SDK se chave disponível ──────────────────────────
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (process.env.NODE_ENV !== "production") {
      console.log("[AddressAutocomplete] API key disponível:", !!apiKey);
    }
    
    if (!apiKey) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[AddressAutocomplete] Sem API key, usaremos Nominatim");
      }
      return; // sem chave: usamos Nominatim como fallback
    }

    // Verificar se já está carregado
    if (typeof window !== "undefined" && (window as any).google?.maps?.places) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[AddressAutocomplete] Google Maps já estava carregado");
      }
      setGoogleLoaded(true);
      return;
    }

    // Verificar se script já foi criado
    const scriptId = "google-maps-places";
    if (document.getElementById(scriptId)) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[AddressAutocomplete] Script Google Maps já criado, aguardando load");
      }
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("[AddressAutocomplete] Criando script Google Maps com URL:", 
        `https://maps.googleapis.com/maps/api/js?key=${apiKey.slice(0, 10)}...&libraries=places`);
    }

    // Criar script para Google Maps
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=pt&region=PT`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (process.env.NODE_ENV !== "production") {
        console.log("[AddressAutocomplete] Script Google Maps carregou com sucesso");
        console.log("[AddressAutocomplete] window.google.maps.places disponível:", 
          !!(window as any).google?.maps?.places);
      }
      setGoogleLoaded(true);
    };

    script.onerror = () => {
      if (process.env.NODE_ENV !== "production") {
        console.error("[AddressAutocomplete] Erro ao carregar script Google Maps, usando Nominatim");
      }
      // Fallback para Nominatim se Google falhar
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
    };
  }, []);

  // ── Inicializar Google Autocomplete quando SDK estiver pronto ────────────
  useEffect(() => {
    if (!googleLoaded || !inputRef.current) return;

    const google = (window as any).google;
    if (!google?.maps?.places) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "pt" },
      fields: ["formatted_address", "address_components", "geometry", "place_id"],
      types: ["address"],
    });

    autocompleteRef.current = autocomplete;

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete?.getPlace();
      if (!place?.formatted_address) return;

      const getComponent = (type: string) =>
        place.address_components?.find((c: google.maps.GeocoderAddressComponent) => c.types.includes(type))?.long_name;

      const postalParts = [
        place.address_components?.find((c: google.maps.GeocoderAddressComponent) => c.types.includes("postal_code"))?.long_name,
        place.address_components?.find((c: google.maps.GeocoderAddressComponent) => c.types.includes("postal_code_suffix"))?.long_name,
      ].filter(Boolean);

      const city =
        getComponent("locality") ||
        getComponent("administrative_area_level_2") ||
        getComponent("administrative_area_level_1") ||
        "";

      const data: AddressData = {
        formattedAddress: place.formatted_address,
        city,
        postalCode: postalParts.length ? postalParts.join("-") : undefined,
        lat: place.geometry?.location?.lat(),
        lng: place.geometry?.location?.lng(),
        placeId: place.place_id,
      };

      confirmSelection(data, place.formatted_address);
    });

    return () => {
      if (autocompleteRef.current) {
        const google = (window as any).google;
        if (google?.maps?.event) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleLoaded]);

  // ── Fechar dropdown ao tocar/clicar fora ─────────────────────────────────
  useEffect(() => {
    const handleOutside = (e: Event) => {
      const target = e.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        inputRef.current && !inputRef.current.contains(target)
      ) {
        setShowDropdown(false);
      }
    };
    // pointerdown cobre mouse e touch em todos os browsers modernos
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, []);

  // ── Nominatim: buscar sugestões ───────────────────────────────────────────
  const fetchNominatim = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      if (process.env.NODE_ENV !== "production") {
        console.log("[AddressAutocomplete] Query muito curta:", query.length);
      }
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("[AddressAutocomplete] Fetching Nominatim com query:", query);
    }

    // cancelar pedido anterior
    if (nominatimAbortRef.current) nominatimAbortRef.current.abort();
    nominatimAbortRef.current = new AbortController();

    setLoadingSuggestions(true);
    
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", query);
      url.searchParams.set("format", "json");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("countrycodes", "pt");
      url.searchParams.set("limit", "8");
      url.searchParams.set("accept-language", "pt");

      const res = await fetch(url.toString(), {
        headers: { "Accept-Language": "pt-PT,pt;q=0.9" },
        signal: nominatimAbortRef.current.signal,
      });
      const data: NominatimResult[] = await res.json();
      
      if (process.env.NODE_ENV !== "production") {
        console.log("[AddressAutocomplete] Nominatim retornou", data.length, "sugestões");
      }
      
      setSuggestions(data);
      if (data.length > 0) {
        setShowDropdown(true);
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        if (process.env.NODE_ENV !== "production") {
          console.error("[AddressAutocomplete] Erro Nominatim:", err);
        }
        setSuggestions([]);
      }
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const confirmSelection = (data: AddressData, displayText: string) => {
    calculatingRef.current = false; // permitir novo cálculo para nova selecção
    setSelectedAddress(data);
    setAddressStatus("selected");
    setDistanceStatus("idle");
    setDistanceResult(null);
    setSuggestions([]);
    setShowDropdown(false);
    onSelect(data);
    onChange(displayText);
  };

  const handleNominatimSelect = (item: NominatimResult) => {
    const city =
      item.address.city ||
      item.address.town ||
      item.address.village ||
      item.address.municipality ||
      item.address.county ||
      item.address.state ||
      "";

    // Usar apenas a parte relevante do display_name (sem o país no final)
    const parts = item.display_name.split(", ");
    const shortName = parts.slice(0, -1).join(", "); // remove "Portugal"

    const data: AddressData = {
      formattedAddress: shortName || item.display_name,
      city,
      postalCode: item.address.postcode,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      placeId: `nominatim_${item.place_id}`,
    };
    confirmSelection(data, shortName || item.display_name);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onChange(v);

    // reset status se estava selecionado
    if (addressStatus === "selected" || addressStatus === "manual_confirmed") {
      setAddressStatus("typing");
      setSelectedAddress(null);
      setDistanceResult(null);
      setDistanceStatus("idle");
    } else {
      setAddressStatus(v.length > 0 ? "typing" : "empty");
    }

    // Nominatim: sempre fazer fetch (dropdown visual garantido)
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchNominatim(v), 300);
  };

  const handleManualConfirm = () => {
    if (!value.trim()) return;
    const data: AddressData = { formattedAddress: value.trim() };
    confirmSelection(data, value.trim());
    setAddressStatus("manual_confirmed");
  };

  const handleCalculateDistance = async () => {
    if (!selectedAddress) return;
    setDistanceStatus("calculating");
    try {
      const res = await fetch("/api/maps/distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: selectedAddress }),
      });
      const data = await res.json();
      if (data.ok) {
        const result: DistanceFromBase = {
          distanceMeters: data.distanceMeters,
          distanceKm: data.distanceKm,
          durationSeconds: data.durationSeconds,
          durationText: data.durationText,
          calculatedAt: new Date().toISOString(),
        };
        setDistanceResult(result);
        setDistanceStatus("calculated");
        onDistanceCalculated?.(result, "calculated");
      } else {
        setDistanceStatus("error");
        onDistanceCalculated?.({}, "error");
      }
    } catch {
      setDistanceStatus("error");
      onDistanceCalculated?.({}, "error");
    }
  };

  const isAddressReady = addressStatus === "selected" || addressStatus === "manual_confirmed";

  // Coordenadas da base CLYON (Av. Q.ta das Laranjeiras, Fernão Ferro)
  const BASE_LAT = 38.5555;
  const BASE_LNG = -8.9921;

  // Haversine: distância em linha recta entre dois pontos
  function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // Fallback local usando coordenadas do Nominatim + Haversine
  function calculateLocalDistance(addr: AddressData): DistanceFromBase | null {
    if (!addr.lat || !addr.lng) return null;
    const km = Math.round(haversineKm(BASE_LAT, BASE_LNG, addr.lat, addr.lng) * 10) / 10;
    const estimatedMin = Math.round((km / 60) * 60); // ~60km/h médio
    return {
      distanceMeters: Math.round(km * 1000),
      distanceKm: km,
      durationSeconds: estimatedMin * 60,
      durationText: estimatedMin < 60 ? `~${estimatedMin} min` : `~${Math.floor(estimatedMin / 60)}h${estimatedMin % 60 ? ` ${estimatedMin % 60}min` : ""}`,
      calculatedAt: new Date().toISOString(),
      isEstimate: true,
    };
  }

  // Disparar cálculo automático assim que a morada é confirmada.
  const calculatingRef = useRef(false);

  const runDistanceCalculation = useCallback((addr: AddressData) => {
    if (calculatingRef.current) return;
    calculatingRef.current = true;
    setDistanceStatus("calculating");

    fetch("/api/maps/distance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination: addr }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          const result: DistanceFromBase = {
            distanceMeters: data.distanceMeters,
            distanceKm: data.distanceKm,
            durationSeconds: data.durationSeconds,
            durationText: data.durationText,
            calculatedAt: new Date().toISOString(),
          };
          setDistanceResult(result);
          setDistanceStatus("calculated");
          onDistanceCalculated?.(result, "calculated");
        } else {
          // Fallback: Haversine com coordenadas do Nominatim
          const local = calculateLocalDistance(addr);
          if (local) {
            setDistanceResult(local);
            setDistanceStatus("calculated");
            onDistanceCalculated?.(local, "calculated");
          } else {
            setDistanceStatus("error");
            onDistanceCalculated?.({}, "error");
          }
        }
      })
      .catch(() => {
        // Fallback em caso de erro de rede
        const local = calculateLocalDistance(addr);
        if (local) {
          setDistanceResult(local);
          setDistanceStatus("calculated");
          onDistanceCalculated?.(local, "calculated");
        } else {
          setDistanceStatus("error");
          onDistanceCalculated?.({}, "error");
        }
      })
      .finally(() => {
        calculatingRef.current = false;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDistanceCalculated]);

  useEffect(() => {
    if (!isAddressReady || !selectedAddress) return;
    runDistanceCalculation(selectedAddress);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddressReady, selectedAddress]);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Input com dropdown */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
          <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            // Reabrir dropdown ao voltar a focar o campo (mobile: após teclado fechar)
            if (!googleLoaded && suggestions.length > 0) setShowDropdown(true);
          }}
          onInput={(e) => {
            // Garantir compatibilidade com IMEs e teclados Android que não disparam onChange
            const v = (e.target as HTMLInputElement).value;
            if (!googleLoaded && v !== value) {
              if (debounceRef.current) clearTimeout(debounceRef.current);
              debounceRef.current = setTimeout(() => fetchNominatim(v), 350);
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full pl-9 pr-10 py-2 rounded-xl border text-[13px] text-[#102033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0487D9]/30 focus:border-[#0487D9] transition-colors ${
            isAddressReady
              ? "border-[#22C55E] bg-[#F0FDF4]"
              : "border-[#E2E8F0] bg-white"
          }`}
        />

        {/* Spinner ou checkmark */}
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          {loadingSuggestions ? (
            <svg className="w-4 h-4 text-[#94A3B8] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : isAddressReady ? (
            <svg className="w-4 h-4 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : null}
        </div>

        {/* Dropdown de sugestões - SEMPRE mostrar Nominatim quando há sugestões */}
        {suggestions.length > 0 && showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute z-[9999] top-full mt-1 w-full bg-white border border-[#E2E8F0] rounded-xl shadow-xl overflow-hidden max-h-80 overflow-y-auto"
          >
            {suggestions.map((item) => {
              const parts = item.display_name.split(", ");
              const main = parts.slice(0, 2).join(", ");
              const secondary = parts.slice(2, -1).join(", "); // remove "Portugal"
              return (
                <button
                  key={item.place_id}
                  type="button"
                  onPointerDown={(e) => {
                    // Prevenir blur no input antes da seleção — funciona em mouse e touch
                    e.preventDefault();
                    handleNominatimSelect(item);
                  }}
                  className="w-full flex items-start gap-2.5 px-3 py-3 min-h-[44px] hover:bg-[#F8FAFC] active:bg-[#EFF8FF] transition-colors text-left border-b border-[#F1F5F9] last:border-0"
                >
                  <svg className="w-3.5 h-3.5 text-[#94A3B8] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-[#102033] leading-snug truncate">{main}</p>
                    {secondary && (
                      <p className="text-[11px] text-[#64748B] leading-snug truncate">{secondary}</p>
                    )}
                  </div>
                </button>
              );
            })}
            <div className="px-3 py-1.5 bg-[#F8FAFC] border-t border-[#F1F5F9]">
              <p className="text-[10px] text-[#94A3B8]">Sugestoes via OpenStreetMap</p>
            </div>
          </div>
        )}
      </div>

      {/* Badge de morada selecionada */}
      {isAddressReady && (
        <p className="text-[11px] text-[#22C55E] font-medium flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          {addressStatus === "manual_confirmed" ? "Morada confirmada manualmente" : "Morada selecionada"}
        </p>
      )}

      {/* Botão confirmar manualmente (quando o utilizador escreveu mas não selecionou) */}
      {addressStatus === "typing" && value.trim().length >= 5 && !showDropdown && (
        <button
          type="button"
          onClick={handleManualConfirm}
          className="text-[11px] text-[#0487D9] hover:underline"
        >
          Usar esta morada mesmo assim
        </button>
      )}

      {/* Indicador automático enquanto calcula */}
      {distanceStatus === "calculating" && (
        <p className="text-[11px] text-[#0487D9] flex items-center gap-1.5">
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          A calcular distancia da base CLYON...
        </p>
      )}

      {/* Botão forçar cálculo — aparece em erro ou quando ficou idle */}
      {isAddressReady && selectedAddress && (distanceStatus === "error" || distanceStatus === "idle") && (
        <button
          type="button"
          onClick={() => {
            calculatingRef.current = false;
            runDistanceCalculation(selectedAddress);
          }}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#0487D9] hover:text-[#0369a1] transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          {distanceStatus === "error" ? "Recalcular distância da base CLYON" : "Calcular distância da base CLYON"}
        </button>
      )}

      {/* Badge resultado da distância */}
      {distanceStatus === "calculated" && distanceResult && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EFF8FF] border border-[#BAE6FD] text-[12px] font-semibold text-[#0487D9]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            {distanceResult.distanceKm} km{distanceResult.isEstimate ? " (estimativa)" : ""} · {distanceResult.durationText}
          </span>
          <span className="text-[11px] text-[#64748B]">da base CLYON</span>
        </div>
      )}

      {/* Erro de distância */}
      {distanceStatus === "error" && (
        <p className="text-[11px] text-[#F59E0B] flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
          </svg>
          Distancia sera confirmada manualmente pela equipa CLYON.
        </p>
      )}
    </div>
  );
}
