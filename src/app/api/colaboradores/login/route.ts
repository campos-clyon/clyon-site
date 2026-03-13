import { NextRequest, NextResponse } from "next/server";
import { getColaboradorByNome } from "@/lib/db";
import * as bcrypt from "bcryptjs";
import * as jose from "jose";
import { ENV } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    const { nome, senha } = await req.json();

    if (!nome || !senha) {
      return NextResponse.json({ error: "Nome e senha s�o obrigat�rios" }, { status: 400 });
    }

    const colaborador = await getColaboradorByNome(nome.toUpperCase());
    if (!colaborador) {
      return NextResponse.json({ error: "Colaborador n�o encontrado" }, { status: 401 });
    }

    const senhaValida = await bcrypt.compare(senha, colaborador.senha);
    if (!senhaValida) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
    }

    // Gerar token JWT para colaborador
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
