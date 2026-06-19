"use client";

import { useEffect, useRef, useState } from "react";
import type { AddressData } from "../types";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (data: AddressData) => void;
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
  placeholder = "Ex: Rua da Boavista, Lisboa",
  className = "",
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [loaded, setLoaded] = useState(false);

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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!loaded || !inputRef.current) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "pt" },
      fields: ["formatted_address", "address_components", "geometry", "place_id"],
      types: ["address"],
    });

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place) return;

      const getComponent = (type: string) =>
        place.address_components?.find((c) => c.types.includes(type))?.long_name;

      const postalCode = [
        place.address_components?.find((c) => c.types.includes("postal_code"))?.long_name,
        place.address_components?.find((c) => c.types.includes("postal_code_suffix"))?.long_name,
      ]
        .filter(Boolean)
        .join("-");

      const city =
        getComponent("locality") ||
        getComponent("administrative_area_level_2") ||
        getComponent("administrative_area_level_1") ||
        "";

      onSelect({
        formattedAddress: place.formatted_address,
        city,
        postalCode: postalCode || undefined,
        lat: place.geometry?.location?.lat(),
        lng: place.geometry?.location?.lng(),
        placeId: place.place_id,
      });
      onChange(place.formatted_address ?? "");
    });

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [loaded, onChange, onSelect]);

  return (
    <div className={`relative ${className}`}>
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
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#102033] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0487D9]/30 focus:border-[#0487D9] transition-colors`}
      />
    </div>
  );
}
