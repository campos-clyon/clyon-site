"use client";

import { useEffect, useRef, useState } from "react";
import type { AddressData, AddressStatus, DistanceFromBase, DistanceStatus } from "../types";

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
  const [loaded, setLoaded] = useState(false);
  const [addressStatus, setAddressStatus] = useState<AddressStatus>("empty");
  const [distanceStatus, setDistanceStatus] = useState<DistanceStatus>("idle");
  const [distanceResult, setDistanceResult] = useState<DistanceFromBase | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);

  // Carregar Google Maps SDK
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    if (typeof window !== "undefined" && window.google?.maps?.places) {
      setLoaded(true);
      return;
    }

    const scriptId = "google-maps-script";
    if (document.getElementById(scriptId)) {
      window.initGoogleMaps = () => setLoaded(true);
      return;
    }

    window.initGoogleMaps = () => setLoaded(true);
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps&language=pt&region=PT`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // Inicializar Autocomplete
  useEffect(() => {
    if (!loaded || !inputRef.current) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "pt" },
      fields: ["formatted_address", "address_components", "geometry", "place_id"],
      types: ["address"],
    });

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place?.formatted_address) return;

      const getComponent = (type: string) =>
        place.address_components?.find((c) => c.types.includes(type))?.long_name;

      const postalCodeParts = [
        place.address_components?.find((c) => c.types.includes("postal_code"))?.long_name,
        place.address_components?.find((c) => c.types.includes("postal_code_suffix"))?.long_name,
      ].filter(Boolean);

      const city =
        getComponent("locality") ||
        getComponent("administrative_area_level_2") ||
        getComponent("administrative_area_level_1") ||
        "";

      const data: AddressData = {
        formattedAddress: place.formatted_address,
        city,
        postalCode: postalCodeParts.length > 0 ? postalCodeParts.join("-") : undefined,
        lat: place.geometry?.location?.lat(),
        lng: place.geometry?.location?.lng(),
        placeId: place.place_id,
      };

      setSelectedAddress(data);
      setAddressStatus("selected");
      setDistanceStatus("idle");
      setDistanceResult(null);
      onSelect(data);
      onChange(place.formatted_address);
    });

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [loaded, onChange, onSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (addressStatus === "selected") {
      setAddressStatus("typing");
      setSelectedAddress(null);
      setDistanceResult(null);
      setDistanceStatus("idle");
    } else if (e.target.value.length > 0) {
      setAddressStatus("typing");
    } else {
      setAddressStatus("empty");
    }
  };

  const handleManualConfirm = () => {
    if (!value.trim()) return;
    const data: AddressData = { formattedAddress: value.trim() };
    setSelectedAddress(data);
    setAddressStatus("manual_confirmed");
    setDistanceStatus("idle");
    setDistanceResult(null);
    onSelect(data);
  };

  const handleCalculateDistance = async () => {
    const addr = selectedAddress;
    if (!addr) return;
    setDistanceStatus("calculating");

    try {
      const res = await fetch("/api/maps/distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: addr }),
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

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Input com ícone */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
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
          placeholder={placeholder}
          className={`w-full pl-9 pr-4 py-2 rounded-xl border text-[13px] text-[#102033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0487D9]/30 focus:border-[#0487D9] transition-colors ${
            addressStatus === "selected" || addressStatus === "manual_confirmed"
              ? "border-[#22C55E] bg-[#F0FDF4]"
              : "border-[#E2E8F0] bg-white"
          }`}
        />
        {isAddressReady && (
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Texto de confirmação manual */}
      {addressStatus === "typing" && value.trim().length >= 5 && (
        <button
          type="button"
          onClick={handleManualConfirm}
          className="text-[11px] text-[#0487D9] hover:underline"
        >
          Usar esta morada mesmo assim
        </button>
      )}

      {/* Badge de estado da morada */}
      {isAddressReady && (
        <p className="text-[11px] text-[#22C55E] font-medium flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          {addressStatus === "manual_confirmed" ? "Morada confirmada manualmente" : "Morada selecionada"}
        </p>
      )}

      {/* Botão calcular distância */}
      {isAddressReady && distanceStatus !== "calculated" && (
        <button
          type="button"
          onClick={handleCalculateDistance}
          disabled={distanceStatus === "calculating"}
          className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg border border-[#0487D9] text-[#0487D9] hover:bg-[#EFF8FF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {distanceStatus === "calculating" ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              A calcular distância...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Calcular distância da base CLYON
            </>
          )}
        </button>
      )}

      {/* Badge resultado da distância */}
      {distanceStatus === "calculated" && distanceResult && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EFF8FF] border border-[#BAE6FD] text-[12px] font-semibold text-[#0487D9]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            {distanceResult.distanceKm} km · {distanceResult.durationText}
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
          Distância será confirmada manualmente pela equipa CLYON.
        </p>
      )}
    </div>
  );
}
