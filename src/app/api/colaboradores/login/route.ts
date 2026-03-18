import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import * as jose from "jose";

import { getColaboradorByNome, getDb } from "@/lib/db";
import { ENV } from "@/lib/env";

const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

export async function POST(req: NextRequest) {
  try {
    const { nome, senha } = await req.json();
    const nomeNormalizado = typeof nome === "string" ? nome.trim().toUpperCase() : "";
    const senhaNormalizada = typeof senha === "string" ? senha : "";

    if (!nomeNormalizado || !senhaNormalizada) {
      return NextResponse.json({ error: "Nome e senha são obrigatórios" }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      console.error("[Colaborador Login] DATABASE_URL not configured");
      return NextResponse.json(
        { error: "Área interna indisponível. Verifique a configuração da base de dados." },
        { status: 503 },
      );
    }

    const colaborador = await getColaboradorByNome(nomeNormalizado);
    if (!colaborador) {
      return NextResponse.json({ error: "Colaborador não encontrado" }, { status: 401 });
    }

    if (!colaborador.senha || !BCRYPT_HASH_REGEX.test(colaborador.senha)) {
      console.error("[Colaborador Login] Invalid password hash", {
        colaboradorId: colaborador.id,
        nome: colaborador.nome,
      });
      return NextResponse.json(
        { error: "As credenciais deste colaborador precisam de ser repostas." },
        { status: 500 },
      );
    }

    let senhaValida = false;
    try {
      senhaValida = await bcrypt.compare(senhaNormalizada, colaborador.senha);
    } catch (error) {
      console.error("[Colaborador Login] Password compare failed", error);
      return NextResponse.json(
        { error: "As credenciais deste colaborador precisam de ser repostas." },
        { status: 500 },
      );
    }

    if (!senhaValida) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
    }

    const secretKey = new TextEncoder().encode(ENV.cookieSecret || "colaborador_secret");
    const token = await new jose.SignJWT({
      id: colaborador.id,
      nome: colaborador.nome,
      funcao: colaborador.funcao,
      isAdmin: colaborador.isAdmin,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(secretKey);

    return NextResponse.json({
      token,
      colaborador: {
        id: colaborador.id,
        nome: colaborador.nome,
        funcao: colaborador.funcao,
        valorHora: colaborador.valorHora,
        isAdmin: colaborador.isAdmin,
      },
    });
  } catch (error) {
    console.error("[Colaborador Login]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
