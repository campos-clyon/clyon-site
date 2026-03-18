import { NextResponse } from "next/server";

import { listGalleryItems } from "@/lib/work-gallery";

type RouteContext = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";
export const revalidate = 0;

const LONG_CACHE_HEADER = "public, max-age=31536000, immutable";

function decodeDataUrl(value: string) {
  const match = value.match(/^data:(.+?);base64,(.+)$/);

  if (!match) {
    return null;
  }

  const [, contentType, base64] = match;
  return {
    contentType,
    buffer: Buffer.from(base64, "base64"),
  };
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const item = (await listGalleryItems()).find((entry) => entry.id === id && entry.isActive);

  if (!item) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (!item.imageUrl.startsWith("data:image/")) {
    return NextResponse.redirect(new URL(item.imageUrl, request.url), 307);
  }

  const decoded = decodeDataUrl(item.imageUrl);

  if (!decoded) {
    return new NextResponse("Invalid image", { status: 400 });
  }

  return new NextResponse(decoded.buffer, {
    headers: {
      "Content-Type": decoded.contentType,
      "Cache-Control": LONG_CACHE_HEADER,
    },
  });
}
