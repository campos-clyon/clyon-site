import { NextRequest, NextResponse } from "next/server";

const CLYON_BASE_ADDRESS =
  process.env.CLYON_BASE_ADDRESS ?? "Fernão Ferro, Seixal, Portugal";

export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Aceitar novo formato { destination: { formattedAddress, lat, lng, placeId } }
    // e formato legado { origin, destination } (string)
    let destinationStr: string;
    if (body.destination && typeof body.destination === "object") {
      const d = body.destination as {
        formattedAddress?: string;
        lat?: number;
        lng?: number;
        placeId?: string;
      };
      if (d.lat && d.lng) {
        destinationStr = `${d.lat},${d.lng}`;
      } else {
        destinationStr = d.formattedAddress ?? "";
      }
    } else {
      destinationStr =
        typeof body.destination === "string" ? body.destination.trim() : "";
    }

    const originStr =
      typeof body.origin === "string" ? body.origin.trim() : CLYON_BASE_ADDRESS;

    if (!destinationStr) {
      return NextResponse.json(
        { ok: false, customerMessage: "Destino em falta." },
        { status: 400 }
      );
    }

    const key =
      process.env.GOOGLE_MAPS_SERVER_API_KEY ??
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!key) {
      return NextResponse.json(
        {
          ok: false,
          customerMessage:
            "Não foi possível calcular a distância agora. A equipa CLYON confirma manualmente.",
        },
        { status: 503 }
      );
    }

    const params = new URLSearchParams({
      origins: originStr,
      destinations: destinationStr,
      mode: "driving",
      language: "pt-PT",
      region: "pt",
      key,
    });

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          customerMessage:
            "Não foi possível calcular a distância agora. A equipa CLYON confirma manualmente.",
        },
        { status: 502 }
      );
    }

    const data = await res.json();
    const element = data.rows?.[0]?.elements?.[0];

    if (data.status !== "OK" || !element || element.status !== "OK") {
      console.error("[maps/distance] Google error:", data.status, element?.status);
      return NextResponse.json(
        {
          ok: false,
          customerMessage:
            "Não foi possível calcular a distância agora. A equipa CLYON confirma manualmente.",
        },
        { status: 502 }
      );
    }

    const distanceMeters: number = element.distance.value;
    const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
    const durationSeconds: number = element.duration.value;
    const durationText: string = element.duration.text;

    return NextResponse.json({
      ok: true,
      distanceMeters,
      distanceKm,
      durationSeconds,
      durationText,
      origin: {
        address: data.origin_addresses?.[0] ?? originStr,
      },
      destination: {
        formattedAddress: data.destination_addresses?.[0] ?? destinationStr,
      },
      // campos legados para compatibilidade
      distanceKm_legacy: distanceKm,
      originAddress: data.origin_addresses?.[0] ?? originStr,
      destinationAddress: data.destination_addresses?.[0] ?? destinationStr,
    });
  } catch (err) {
    console.error("[maps/distance] Erro:", err);
    return NextResponse.json(
      {
        ok: false,
        customerMessage:
          "Não foi possível calcular a distância agora. A equipa CLYON confirma manualmente.",
      },
      { status: 500 }
    );
  }
}
