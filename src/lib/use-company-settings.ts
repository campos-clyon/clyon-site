import { useEffect, useState } from "react";
import {
  BUSINESS_PHONE,
  BUSINESS_EMAIL,
  BUSINESS_NAME,
} from "@/lib/seo-data";

interface CompanySettings {
  phone: string;
  email: string;
  name: string;
  sector: string;
  portal: string;
}

// Cache in memory para evitar múltiplas requisições
let settingsCache: CompanySettings | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export async function getCompanySettings(): Promise<CompanySettings> {
  const now = Date.now();
  if (settingsCache && now - cacheTimestamp < CACHE_TTL) {
    return settingsCache;
  }

  try {
    const res = await fetch("/api/admin/company-settings", {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${process.env.INTERNAL_API_KEY || ""}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      settingsCache = {
        phone: data.phone || BUSINESS_PHONE,
        email: data.email || BUSINESS_EMAIL,
        name: data.name || BUSINESS_NAME,
        sector: data.sector || "Recolha de móveis e serviços de transporte",
        portal: data.portal || "clyon.pt",
      };
      cacheTimestamp = now;
      return settingsCache;
    }
  } catch (err) {
    console.error("[getCompanySettings] Error:", err);
  }

  // Fallback to constants
  return {
    phone: BUSINESS_PHONE,
    email: BUSINESS_EMAIL,
    name: BUSINESS_NAME,
    sector: "Recolha de móveis e serviços de transporte",
    portal: "clyon.pt",
  };
}

export function useCompanySettings() {
  const [settings, setSettings] = useState<CompanySettings>({
    phone: BUSINESS_PHONE,
    email: BUSINESS_EMAIL,
    name: BUSINESS_NAME,
    sector: "Recolha de móveis e serviços de transporte",
    portal: "clyon.pt",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getCompanySettings();
      setSettings(data);
      setLoading(false);
    };

    fetchSettings();
  }, []);

  return { ...settings, loading };
}
