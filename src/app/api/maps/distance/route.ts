import { NextRequest, NextResponse } from "next/server";

import { getMapsApiKey } from "@/lib/maps-config";

export const revalidate = 0;

export async function POST(request: NextRequest) {
  const { origin, destination } = await request.json();

  const originText = typeof origin === "string" ? origin.trim() : "";
  const destinationText =
    typeof destination === "string" ? destination.trim() : "";

  if (!originText || !destinationText) {
    return NextResponse.json(
      { error: "missing_origin_or_destination" },
      { status: 400 },
    );
  }

  const key = getMapsApiKey();
  if (!key) {
    return NextResponse.json(
      { error: "maps_unconfigured" },
      { status: 503 },
    );
  }

  const params = new URLSearchParams({
    origins: originText,
    destinations: destinationText,
    mode: "driving",
    language: "pt-PT",
    region: "pt",
    key,
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    return NextResponse.json({ error: "distance_unavailable" }, { status: 502 });
  }

  const data = await response.json();
  const element = data.rows?.[0]?.elements?.[0];

  if (data.status !== "OK" || !element || element.status !== "OK") {
    return NextResponse.json(
      {
        error:
          element?.status ||
          data.error_message ||
          data.status ||
          "distance_unavailable",
      },
      { status: 502 },
    );
  }

  const distanceKm = Math.round((element.distance.value / 1000) * 10) / 10;

  return NextResponse.json({
    distanceKm,
    originAddress: data.origin_addresses?.[0] ?? originText,
    destinationAddress: data.destination_addresses?.[0] ?? destinationText,
  });
}
