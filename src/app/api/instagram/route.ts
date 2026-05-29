import { NextResponse } from "next/server";

interface InstagramMedia {
  id: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp: string;
}

interface InstagramResponse {
  data: InstagramMedia[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

export async function GET() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accessToken) {
    console.error("[v0] INSTAGRAM_ACCESS_TOKEN não está configurado");
    return NextResponse.json(
      { error: "Instagram não configurado" },
      { status: 500 }
    );
  }

  try {
    // Buscar os últimos 12 posts do Instagram
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption,timestamp&limit=12&access_token=${accessToken}`,
      { next: { revalidate: 3600 } } // Cache por 1 hora
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[v0] Erro Instagram API:", errorData);
      return NextResponse.json(
        { error: "Erro ao buscar fotos do Instagram" },
        { status: response.status }
      );
    }

    const data: InstagramResponse = await response.json();

    // Filtrar apenas imagens e carousel (excluir vídeos ou pegar thumbnail)
    const media = data.data.map((item) => ({
      id: item.id,
      type: item.media_type,
      url: item.media_type === "VIDEO" ? item.thumbnail_url : item.media_url,
      permalink: item.permalink,
      caption: item.caption?.slice(0, 100) || "",
      timestamp: item.timestamp,
    }));

    return NextResponse.json({ media });
  } catch (error) {
    console.error("[v0] Erro ao buscar Instagram:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar fotos" },
      { status: 500 }
    );
  }
}
