import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("fotos") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Nenhum ficheiro enviado" }, { status: 400 });
    }

    const uploads = await Promise.all(
      files.map(async (file, index) => {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `trabalhos/${Date.now()}-${index}.${ext}`;
        const blob = await put(path, file, { access: "public" });
        return blob.url;
      })
    );

    return NextResponse.json({ urls: uploads });
  } catch (error) {
    console.error("[api/admin/trabalhos/upload POST]", error);
    return NextResponse.json({ error: "Falha no upload das fotos" }, { status: 500 });
  }
}
