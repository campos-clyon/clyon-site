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
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Location] geolocation não suportado');
    }
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('[Location] requesting GPS automatically');
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Location] GPS success', { lat: latitude, lng: longitude });
      }
      const location = await reverseGeocode(latitude, longitude);
      if (location) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[Location] reverse geocoding success', location);
        }
        onLocationFound(location);
      }
    },
    (error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Location] GPS error', error.code, error.message);
      }
      if (error.code === error.PERMISSION_DENIED) {
        localStorage.setItem(PERMISSION_DENIED_KEY, 'true');
        if (process.env.NODE_ENV !== 'production') {
          console.log('[Location] permission denied - saved flag');
        }
      }
    },
    { timeout: 10000, enableHighAccuracy: false }
  );
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<CustomerLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar do localStorage e tentar auto-detectar localização
  useEffect(() => {
    async function initializeLocation() {
      try {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[Location] provider mounted');
        }

        // 1. Verificar localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (process.env.NODE_ENV !== 'production') {
          console.log('[Location] localStorage location:', stored ? JSON.parse(stored) : null);
        }
        
        if (stored) {
          const parsed = JSON.parse(stored);
          setLocationState(parsed);
          setIsLoading(false);
          return;
        }

        // 2. Se não houver localização e permissão não foi negada, tentar GPS
        const permissionDenied = localStorage.getItem(PERMISSION_DENIED_KEY) === 'true';
        if (process.env.NODE_ENV !== 'production') {
          console.log('[Location] permission denied flag:', permissionDenied);
        }
        
        if (!permissionDenied) {
          let gpsCompleted = false;
          
          requestLocationFromGPS((location) => {
            setLocationState(location);
            setIsLoading(false);
            gpsCompleted = true;
          });

          // Timeout: se GPS não responder em 5s, considerar como não disponível
          setTimeout(() => {
            if (!gpsCompleted) {
              if (process.env.NODE_ENV !== 'production') {
                console.log('[Location] GPS timeout - no response');
              }
              setIsLoading(false);
            }
          }, 5000);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[Location] initialization error:', err);
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
