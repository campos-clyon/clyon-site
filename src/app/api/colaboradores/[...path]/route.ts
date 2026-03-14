/**
 * API Route catch-all para colaboradores
 * Usa o router Express existente adaptado para Next.js App Router
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { colaboradores, registrosHoras } from "../../../../../drizzle/schema";
import { eq, and, gte, lte, desc, isNull } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "clyon-secret-2026";

// Helper para verificar token
async function verifyToken(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload as { id: number; nome: string; isAdmin: number };
  } catch {
    return null;
  }
}

// Helper para gerar token
async function generateToken(payload: object) {
  const secretKey = new TextEncoder().encode(JWT_SECRET);
  return new jose.SignJWT(payload as jose.JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(secretKey);
}

async function handleRequest(req: NextRequest, path: string[]) {
  const route = path.join("/");
  const db = await getDb();
  if (!db) return NextResponse.json({ error: "Banco de dados indispon�vel" }, { status: 500 });

  // POST /login
  if (route === "login" && req.method === "POST") {
    const { nome, senha } = await req.json();
    if (!nome || !senha) return NextResponse.json({ error: "Nome e senha s�o obrigat�rios" }, { status: 400 });

    const [colab] = await db.select().from(colaboradores).where(eq(colaboradores.nome, nome.toUpperCase()));
    if (!colab) return NextResponse.json({ error: "Colaborador n�o encontrado" }, { status: 401 });

    const senhaValida = await bcrypt.compare(senha, colab.senha);
    if (!senhaValida) return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });

    const token = await generateToken({ id: colab.id, nome: colab.nome, funcao: colab.funcao, isAdmin: colab.isAdmin });
    return NextResponse.json({
      token,
      colaborador: { id: colab.id, nome: colab.nome, funcao: colab.funcao, valorHora: colab.valorHora, isAdmin: colab.isAdmin },
    });
  }

  // Rotas autenticadas
  const colaborador = await verifyToken(req);
  if (!colaborador) return NextResponse.json({ error: "N�o autorizado" }, { status: 401 });

  // POST /registrar-horas
  if (route === "registrar-horas" && req.method === "POST") {
    const body = await req.json();
    const { data, horaEntrada, horaPausa, horaSaida, numeroTrabalhos } = body;

    const calcHoras = (entrada: string, saida: string, pausa?: string) => {
      const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
      let total = toMin(saida) - toMin(entrada);
      if (pausa) total -= 30; // 30 min de pausa padr�o
      return Math.max(0, total / 60);
    };

    const horasTrabalhadas = horaSaida ? calcHoras(horaEntrada, horaSaida, horaPausa) : 0;
    const [colab] = await db.select().from(colaboradores).where(eq(colaboradores.id, colaborador.id));
    const valorTotal = horasTrabalhadas * (parseFloat(String(colab?.valorHora || 0)));

    await db.insert(registrosHoras).values({
      colaboradorId: colaborador.id,
      data: new Date(data),
      horaEntrada,
      horaPausa: horaPausa || null,
      horaSaida: horaSaida || null,
      horasTrabalhadas: horasTrabalhadas.toFixed(2),
      valorTotal: valorTotal.toFixed(2),
      numeroTrabalhos: parseInt(numeroTrabalhos) || 0,
    });

    return NextResponse.json({ success: true, horasTrabalhadas, valorTotal });
  }

  // GET /estatisticas
  if (route === "estatisticas" && req.method === "GET") {
    const agora = new Date();
    const inicioSemana = new Date(agora);
    inicioSemana.setDate(agora.getDate() - agora.getDay() + 1);
    inicioSemana.setHours(0, 0, 0, 0);

    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const inicio15Dias = new Date(agora);
    inicio15Dias.setDate(agora.getDate() - 15);

    const registros = await db
      .select()
      .from(registrosHoras)
      .where(eq(registrosHoras.colaboradorId, colaborador.id))
      .orderBy(desc(registrosHoras.data));

    const calcEstat = (regs: typeof registros) => {
      const horas = regs.reduce((s, r) => s + parseFloat(r.horasTrabalhadas || "0"), 0);
      const valor = regs.reduce((s, r) => s + parseFloat(r.valorTotal || "0"), 0);
      return {
        horas: horas.toFixed(1),
        valor: valor.toFixed(2),
        trabalhos: regs.reduce((s, r) => s + (r.numeroTrabalhos || 0), 0),
        dias: new Set(regs.map((r) => r.data?.toISOString().split("T")[0])).size,
      };
    };

    const semanaRegs = registros.filter((r) => r.data && r.data >= inicioSemana);
    const mesRegs = registros.filter((r) => r.data && r.data >= inicioMes);
    const ultimos15Regs = registros.filter((r) => r.data && r.data >= inicio15Dias);

    const registrosFormatados = registros.slice(0, 10).map((r) => ({
      ...r,
      dataFormatada: r.data
        ? new Date(r.data).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" })
        : null,
    }));

    return NextResponse.json({
      semana: { ...calcEstat(semanaRegs), periodo: `${inicioSemana.toLocaleDateString("pt-PT")} - hoje` },
      mes: calcEstat(mesRegs),
      ultimos15Dias: calcEstat(ultimos15Regs),
      registros: registrosFormatados,
    });
  }

  // GET /registro-em-aberto
  if (route === "registro-em-aberto" && req.method === "GET") {
    const [aberto] = await db
      .select()
      .from(registrosHoras)
      .where(and(eq(registrosHoras.colaboradorId, colaborador.id), isNull(registrosHoras.horaSaida)))
      .orderBy(desc(registrosHoras.data));
    return NextResponse.json({ registro: aberto || null });
  }

  // PUT /atualizar-registro/:id
  if (route.startsWith("atualizar-registro/") && req.method === "PUT") {
    const id = parseInt(route.split("/")[1]);
    const body = await req.json();
    await db.update(registrosHoras).set(body).where(eq(registrosHoras.id, id));
    return NextResponse.json({ success: true });
  }

  // DELETE /registros/:id
  if (route.startsWith("registros/") && req.method === "DELETE") {
    const id = parseInt(route.split("/")[1]);
    await db.delete(registrosHoras).where(eq(registrosHoras.id, id));
    return NextResponse.json({ success: true });
  }

  // POST /alterar-senha
  if (route === "alterar-senha" && req.method === "POST") {
    const { senhaAtual, novaSenha } = await req.json();
    const [colab] = await db.select().from(colaboradores).where(eq(colaboradores.id, colaborador.id));
    if (!colab) return NextResponse.json({ error: "Colaborador n�o encontrado" }, { status: 404 });

    const senhaValida = await bcrypt.compare(senhaAtual, colab.senha);
    if (!senhaValida) return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    await db.update(colaboradores).set({ senha: novaSenhaHash }).where(eq(colaboradores.id, colaborador.id));
    return NextResponse.json({ success: true });
  }

  // Admin: GET /admin/todos
  if (route === "admin/todos" && req.method === "GET") {
    if (!colaborador.isAdmin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    const todos = await db.select().from(colaboradores);
    const todosRegistros = await db
      .select()
      .from(registrosHoras)
      .orderBy(desc(registrosHoras.data));

    const agora = new Date();
    const inicioSemana = new Date(agora);
    inicioSemana.setDate(agora.getDate() - agora.getDay() + 1);
    inicioSemana.setHours(0, 0, 0, 0);

    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const inicio15Dias = new Date(agora);
    inicio15Dias.setDate(agora.getDate() - 15);

    const calcEstat = (regs: typeof todosRegistros) => {
      const horas = regs.reduce((s, r) => s + parseFloat(r.horasTrabalhadas || "0"), 0);
      const valor = regs.reduce((s, r) => s + parseFloat(r.valorTotal || "0"), 0);
      return {
        horas: horas.toFixed(2),
        valor: valor.toFixed(2),
        trabalhos: regs.reduce((s, r) => s + (r.numeroTrabalhos || 0), 0),
      };
    };

    const colaboradoresComDados = todos.map((item) => {
      const registrosDoColaborador = todosRegistros.filter((registro) => registro.colaboradorId === item.id);
      const semanaRegs = registrosDoColaborador.filter((r) => r.data && r.data >= inicioSemana);
      const mesRegs = registrosDoColaborador.filter((r) => r.data && r.data >= inicioMes);
      const ultimos15Regs = registrosDoColaborador.filter((r) => r.data && r.data >= inicio15Dias);

      return {
        id: item.id,
        nome: item.nome,
        funcao: item.funcao,
        valorHora: item.valorHora,
        isAdmin: item.isAdmin,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        registros: registrosDoColaborador.map((registro) => ({
          id: registro.id,
          data: registro.data?.toISOString() || "",
          horaEntrada: registro.horaEntrada,
          horaPausa: registro.horaPausa,
          horaSaida: registro.horaSaida,
          numeroTrabalhos: registro.numeroTrabalhos || 0,
          horasTrabalhadas: registro.horasTrabalhadas || "0",
          valorTotal: registro.valorTotal || "0",
        })),
        estatisticas: {
          semana: calcEstat(semanaRegs),
          ultimos15Dias: calcEstat(ultimos15Regs),
          mes: calcEstat(mesRegs),
        },
      };
    });

    return NextResponse.json({ colaboradores: colaboradoresComDados });
  }

  // Admin: POST /criar
  if (route === "criar" && req.method === "POST") {
    if (!colaborador.isAdmin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    const { nome, senha, funcao, valorHora, isAdmin: isAdminNew } = await req.json();
    const senhaHash = await bcrypt.hash(senha, 10);
    await db.insert(colaboradores).values({
      nome: nome.toUpperCase(),
      senha: senhaHash,
      funcao,
      valorHora: String(parseFloat(valorHora)),
      isAdmin: isAdminNew ? 1 : 0,
    });
    return NextResponse.json({ success: true });
  }

  // Admin: PUT /:id/editar
  if (route.match(/^\d+\/editar$/) && req.method === "PUT") {
    if (!colaborador.isAdmin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    const id = parseInt(route.split("/")[0]);
    const body = await req.json();
    if (body.senha) body.senha = await bcrypt.hash(body.senha, 10);
    await db.update(colaboradores).set(body).where(eq(colaboradores.id, id));
    return NextResponse.json({ success: true });
  }

  // Admin: DELETE /:id/deletar
  if (route.match(/^\d+\/deletar$/) && req.method === "DELETE") {
    if (!colaborador.isAdmin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    const id = parseInt(route.split("/")[0]);
    await db.delete(colaboradores).where(eq(colaboradores.id, id));
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Rota n�o encontrada" }, { status: 404 });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return handleRequest(req, path);
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return handleRequest(req, path);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return handleRequest(req, path);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return handleRequest(req, path);
}
