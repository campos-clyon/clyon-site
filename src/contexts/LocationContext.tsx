'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AddressData } from '@/app/simulador/types';

// CustomerLocation estende AddressData com informação de origem
export interface CustomerLocation extends AddressData {
  source?: 'manual' | 'gps' | 'account'; // origem da localização
}

interface LocationContextType {
  location: CustomerLocation | null;
  setLocation: (location: CustomerLocation | null) => void;
  isLoading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const STORAGE_KEY = 'clyon_customer_location';
const PERMISSION_DENIED_KEY = 'clyon_location_permission_denied';

async function reverseGeocode(lat: number, lng: number): Promise<CustomerLocation | null> {
  try {
    const response = await fetch('/api/address/reverse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng }),
    });

    if (!response.ok) throw new Error('Reverse geocoding failed');
    
    const data = await response.json();
    if (data.ok) {
      return {
        formattedAddress: data.formattedAddress,
        city: data.city,
        postalCode: data.postalCode,
        lat: data.lat,
        lng: data.lng,
        source: 'gps',
      };
    }
  } catch (err) {
    console.error('[LocationContext] Erro no reverse geocoding:', err);
  }
  return null;
}

function requestLocationFromGPS(onLocationFound: (location: CustomerLocation) => void) {
  if (!navigator.geolocation) {
    console.log('[LocationContext] Geolocation não suportado');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      const location = await reverseGeocode(latitude, longitude);
      if (location) {
        console.log('[LocationContext] Localização obtida via GPS:', location);
        onLocationFound(location);
      }
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        console.log('[LocationContext] Permissão de localização negada');
        localStorage.setItem(PERMISSION_DENIED_KEY, 'true');
      }
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<CustomerLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar do localStorage e tentar auto-detectar localização
  useEffect(() => {
    async function initializeLocation() {
      try {
        // 1. Verificar localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setLocationState(parsed);
          setIsLoading(false);
          return;
        }

        // 2. Se não houver localização e permissão não foi negada, tentar GPS
        const permissionDenied = localStorage.getItem(PERMISSION_DENIED_KEY) === 'true';
        if (!permissionDenied) {
          console.log('[LocationContext] Tentando obter localização via GPS');
          
          let gpsCompleted = false;
          
          requestLocationFromGPS((location) => {
            setLocationState(location);
            setIsLoading(false);
            gpsCompleted = true;
          });

          // Timeout: se GPS não responder em 3s, considerar como não disponível
          setTimeout(() => {
            if (!gpsCompleted) {
              setIsLoading(false);
            }
          }, 3000);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[LocationContext] Erro na inicialização:', err);
        setIsLoading(false);
      }
    }

    initializeLocation();
  }, []);

  // Guardar no localStorage quando mudar
  const setLocation = (newLocation: CustomerLocation | null) => {
    setLocationState(newLocation);
    try {
      if (newLocation) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newLocation));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.error('[LocationContext] Erro ao guardar no localStorage:', err);
    }
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, isLoading }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation deve ser usado dentro de LocationProvider');
  }
  return context;
}
