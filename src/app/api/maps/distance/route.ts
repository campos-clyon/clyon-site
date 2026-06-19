import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseGoogleDurationToSeconds(duration: string): number {
  // Routes API devolve ex: "1680s"
  return Number(duration.replace("s", ""));
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}min` : `${hours}h`;
}

// ---------------------------------------------------------------------------
// Resposta amigável reutilizável
// ---------------------------------------------------------------------------

const FRIENDLY_ERROR = NextResponse.json(
  {
    ok: false,
    customerMessage:
      "Não foi possível calcular a distância agora. A equipa CLYON confirma manualmente.",
  },
  { status: 503 }
);

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export const revalidate = 0;

export async function POST(request: NextRequest) {
  // 1. Chave de servidor — NUNCA usar NEXT_PUBLIC_ no backend
  const key = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!key) {
    console.error("[maps/distance] GOOGLE_MAPS_SERVER_API_KEY não configurada.");
    return FRIENDLY_ERROR;
  }

  // 2. Origem: coordenadas da base CLYON (preferencial) ou endereço
  const baseLat = process.env.CLYON_BASE_LAT ? Number(process.env.CLYON_BASE_LAT) : null;
  const baseLng = process.env.CLYON_BASE_LNG ? Number(process.env.CLYON_BASE_LNG) : null;
  const baseAddress = process.env.CLYON_BASE_ADDRESS ?? "Fernão Ferro, Seixal, Portugal";

  const originPayload =
    baseLat !== null && baseLng !== null
      ? { location: { latLng: { latitude: baseLat, longitude: baseLng } } }
      : { address: baseAddress };

  // 3. Destino: coordenadas (preferencial) ou endereço formatado
  let body: { destination?: { formattedAddress?: string; lat?: number; lng?: number; placeId?: string } };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, customerMessage: "Payload inválido." }, { status: 400 });
  }

  const dest = body.destination;
  if (!dest || (!dest.lat && !dest.formattedAddress)) {
    return NextResponse.json({ ok: false, customerMessage: "Destino em falta." }, { status: 400 });
  }

  const destinationPayload =
    dest.lat && dest.lng
      ? { location: { latLng: { latitude: dest.lat, longitude: dest.lng } } }
      : { address: dest.formattedAddress! };

  // 4. Chamada à Google Routes API
  try {
    const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "routes.distanceMeters,routes.duration,routes.localizedValues",
      },
      body: JSON.stringify({
        origin: originPayload,
        destination: destinationPayload,
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
        languageCode: "pt-PT",
        regionCode: "PT",
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[maps/distance] Routes API HTTP error:", res.status, errBody);
      return FRIENDLY_ERROR;
    }

    const data = await res.json();
    const route = data.routes?.[0];

    if (!route || !route.distanceMeters || !route.duration) {
      console.error("[maps/distance] Routes API sem rota válida:", JSON.stringify(data));
      return FRIENDLY_ERROR;
    }

    const distanceMeters: number = route.distanceMeters;
    const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
    const durationSeconds = parseGoogleDurationToSeconds(String(route.duration));
    const durationText = formatDuration(durationSeconds);

    return NextResponse.json({
      ok: true,
      distanceMeters,
      distanceKm,
      durationSeconds,
      durationText,
      origin: {
        address: baseAddress,
        lat: baseLat,
        lng: baseLng,
      },
      destination: {
        formattedAddress: dest.formattedAddress,
        lat: dest.lat,
        lng: dest.lng,
        placeId: dest.placeId,
      },
    });
  } catch (err) {
    console.error("[maps/distance] Erro inesperado:", err);
    return FRIENDLY_ERROR;
  }
}
