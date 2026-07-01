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

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<CustomerLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar do localStorage na inicialização
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setLocationState(parsed);
      }
    } catch (err) {
      console.error('[LocationContext] Erro ao carregar do localStorage:', err);
    } finally {
      setIsLoading(false);
    }
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
