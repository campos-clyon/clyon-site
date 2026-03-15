import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import * as jose from "jose";
import { and, desc, eq, isNull } from "drizzle-orm";

import { getDb, getSimulatorSettings, upsertSimulatorSetting } from "@/lib/db";
import { defaultSimulatorSettings } from "@/lib/simulator-settings";
import { colaboradores, registrosHoras } from "../../../../../drizzle/schema";

const JWT_SECRET = process.env.JWT_SECRET || "clyon-secret-2026";
const LISBON_TIMEZONE = "Europe/Lisbon";

type JwtPayload = { id: number; nome: string; isAdmin: number };
type RouteContext = { params: Promise<{ path: string[] }> };

async function verifyToken(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

async function generateToken(payload: Record<string, unknown>) {
  const secretKey = new TextEncoder().encode(JWT_SECRET);
  return new jose.SignJWT(payload as jose.JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(secretKey);
}

function parseTimeToMinutes(value?: string | null) {
  if (!value) return 0;
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
  return hours * 60 + minutes;
}

function calculateWorkedHours(
  horaEntrada?: string | null,
  horaSaida?: string | null,
  horaPausa?: string | null,
) {
  if (!horaEntrada || !horaSaida) return 0;
  const totalMinutes = parseTimeToMinutes(horaSaida) - parseTimeToMinutes(horaEntrada);
  const pauseMinutes = parseTimeToMinutes(horaPausa);
  return Math.max(0, Number(((totalMinutes - pauseMinutes) / 60).toFixed(2)));
}

function toIsoDate(input?: string | null) {
  if (!input) return new Date();
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function getLisbonDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: LISBON_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value || "";

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: get("weekday"),
  };
}

function createLisbonDateAtMidnight(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
}

function formatLisbonDate(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: LISBON_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getIsoWeekNumber(date: Date) {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getLisbonPeriodAnchors() {
  const nowParts = getLisbonDateParts();
  const today = createLisbonDateAtMidnight(nowParts.year, nowParts.month, nowParts.day);
  const weekdayMap: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };
  const weekday = weekdayMap[nowParts.weekday] || 1;

  const weekStart = new Date(today);
  weekStart.setUTCDate(today.getUTCDate() - (weekday - 1));

  const monthStart = createLisbonDateAtMidnight(nowParts.year, nowParts.month, 1);
  const fifteenDaysStart = new Date(today);
  fifteenDaysStart.setUTCDate(today.getUTCDate() - 15);

  return { today, weekStart, monthStart, fifteenDaysStart };
}

async function loadAdminDataset(db: Awaited<ReturnType<typeof getDb>>) {
  if (!db) return { colaboradores: [] };

  const team = await db.select().from(colaboradores);
  const allRecords = await db.select().from(registrosHoras).orderBy(desc(registrosHoras.data));

  const { weekStart, monthStart, fifteenDaysStart } = getLisbonPeriodAnchors();

  const calcPeriod = (records: typeof allRecords) => {
    const hours = records.reduce((sum, item) => sum + parseFloat(item.horasTrabalhadas || "0"), 0);
    const value = records.reduce((sum, item) => sum + parseFloat(item.valorTotal || "0"), 0);
    const jobs = records.reduce((sum, item) => sum + (item.numeroTrabalhos || 0), 0);

    return {
      horas: hours.toFixed(2),
      valor: value.toFixed(2),
      trabalhos: jobs,
    };
  };

  return {
    colaboradores: team.map((member) => {
      const memberRecords = allRecords.filter((record) => record.colaboradorId === member.id);
      return {
        id: member.id,
        nome: member.nome,
        funcao: member.funcao,
        valorHora: member.valorHora,
        isAdmin: member.isAdmin,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
        registros: memberRecords.map((record) => ({
          id: record.id,
          colaboradorId: record.colaboradorId,
          data: record.data?.toISOString() || "",
          horaEntrada: record.horaEntrada,
          horaPausa: record.horaPausa,
          horaSaida: record.horaSaida,
          numeroTrabalhos: record.numeroTrabalhos || 0,
          horasTrabalhadas: record.horasTrabalhadas || "0",
          valorTotal: record.valorTotal || "0",
        })),
        estatisticas: {
          semana: calcPeriod(memberRecords.filter((record) => record.data && record.data >= weekStart)),
          ultimos15Dias: calcPeriod(memberRecords.filter((record) => record.data && record.data >= fifteenDaysStart)),
          mes: calcPeriod(memberRecords.filter((record) => record.data && record.data >= monthStart)),
        },
      };
    }),
  };
}

async function handleRequest(req: NextRequest, path: string[]) {
  const route = path.join("/");
  const db = await getDb();
  if (!db) {
    return NextResponse.json({ error: "Base de dados indisponivel." }, { status: 500 });
  }

  if (route === "login" && req.method === "POST") {
    const { nome, senha } = await req.json();
    if (!nome || !senha) {
      return NextResponse.json({ error: "Nome e palavra-passe sao obrigatorios." }, { status: 400 });
    }

    const [colaborador] = await db
      .select()
      .from(colaboradores)
      .where(eq(colaboradores.nome, String(nome).toUpperCase()));

    if (!colaborador) {
      return NextResponse.json({ error: "Colaborador nao encontrado." }, { status: 401 });
    }

    const passwordMatches = await bcrypt.compare(String(senha), colaborador.senha);
    if (!passwordMatches) {
      return NextResponse.json({ error: "Palavra-passe incorreta." }, { status: 401 });
    }

    const token = await generateToken({
      id: colaborador.id,
      nome: colaborador.nome,
      funcao: colaborador.funcao,
      isAdmin: colaborador.isAdmin,
    });

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
  }

  const auth = await verifyToken(req);
  if (!auth) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  if (route === "registrar-horas" && req.method === "POST") {
    const body = await req.json();
    const [openRecord] = await db
      .select()
      .from(registrosHoras)
      .where(and(eq(registrosHoras.colaboradorId, auth.id), isNull(registrosHoras.horaSaida)))
      .orderBy(desc(registrosHoras.data));

    if (openRecord) {
      return NextResponse.json(
        { error: "Existe um dia anterior por fechar. Termine o registo em aberto antes de iniciar outro." },
        { status: 400 },
      );
    }

    const [member] = await db.select().from(colaboradores).where(eq(colaboradores.id, auth.id));

    const workedHours = calculateWorkedHours(body.horaEntrada, body.horaSaida, body.horaPausa);
    const totalValue = workedHours * parseFloat(String(member?.valorHora || 0));

    await db.insert(registrosHoras).values({
      colaboradorId: auth.id,
      data: toIsoDate(body.data),
      horaEntrada: String(body.horaEntrada || ""),
      horaPausa: body.horaPausa || null,
      horaSaida: body.horaSaida || null,
      numeroTrabalhos: parseInt(String(body.numeroTrabalhos || 0), 10) || 0,
      horasTrabalhadas: workedHours.toFixed(2),
      valorTotal: totalValue.toFixed(2),
    });

    return NextResponse.json({ success: true, horasTrabalhadas: workedHours, valorTotal: totalValue });
  }

  if (route === "estatisticas" && req.method === "GET") {
    const allRecords = await db
      .select()
      .from(registrosHoras)
      .where(eq(registrosHoras.colaboradorId, auth.id))
      .orderBy(desc(registrosHoras.data));

    const { today, weekStart, monthStart, fifteenDaysStart } = getLisbonPeriodAnchors();
    const todayLabel = formatLisbonDate(today);
    const currentWeek = getIsoWeekNumber(today);

    const calcPeriod = (records: typeof allRecords) => {
      const hours = records.reduce((sum, item) => sum + parseFloat(item.horasTrabalhadas || "0"), 0);
      const value = records.reduce((sum, item) => sum + parseFloat(item.valorTotal || "0"), 0);
      const jobs = records.reduce((sum, item) => sum + (item.numeroTrabalhos || 0), 0);
      return {
        horas: hours.toFixed(1),
        valor: value.toFixed(2),
        trabalhos: jobs,
        dias: new Set(records.map((item) => item.data?.toISOString().split("T")[0])).size,
      };
    };

    return NextResponse.json({
      hoje: {
        ...calcPeriod(allRecords.filter((item) => item.data && formatLisbonDate(new Date(item.data)) === todayLabel)),
        periodo: `${todayLabel} - hoje`,
      },
      semana: {
        ...calcPeriod(allRecords.filter((item) => item.data && item.data >= weekStart)),
        periodo: `Semana ${currentWeek}`,
      },
      mes: calcPeriod(allRecords.filter((item) => item.data && item.data >= monthStart)),
      ultimos15Dias: calcPeriod(allRecords.filter((item) => item.data && item.data >= fifteenDaysStart)),
      registros: allRecords.slice(0, 20).map((item) => ({
        ...item,
        dataFormatada: item.data
          ? new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(item.data))
          : null,
      })),
    });
  }

  if (route === "registro-em-aberto" && req.method === "GET") {
    const [openRecord] = await db
      .select()
      .from(registrosHoras)
      .where(and(eq(registrosHoras.colaboradorId, auth.id), isNull(registrosHoras.horaSaida)))
      .orderBy(desc(registrosHoras.data));

    return NextResponse.json({ registro: openRecord || null });
  }

  if (route.startsWith("atualizar-registro/") && req.method === "PUT") {
    const id = parseInt(route.split("/")[1], 10);
    const body = await req.json();
    const [record] = await db.select().from(registrosHoras).where(eq(registrosHoras.id, id));
    if (!record) {
      return NextResponse.json({ error: "Registo nao encontrado." }, { status: 404 });
    }

    const [member] = await db.select().from(colaboradores).where(eq(colaboradores.id, auth.id));
    const nextEntrada = body.horaEntrada ?? record.horaEntrada;
    const nextSaida = body.horaSaida ?? record.horaSaida;
    const nextPausa =
      body.horaPausa !== undefined
        ? body.horaPausa || "00:00"
        : nextSaida && !record.horaPausa
          ? "00:00"
          : record.horaPausa;
    const workedHours = calculateWorkedHours(nextEntrada, nextSaida, nextPausa);
    const totalValue = workedHours * parseFloat(String(member?.valorHora || 0));

    await db
      .update(registrosHoras)
      .set({
        horaEntrada: nextEntrada,
        horaPausa: nextPausa || null,
        horaSaida: nextSaida || null,
        numeroTrabalhos: parseInt(String(body.numeroTrabalhos ?? record.numeroTrabalhos ?? 0), 10) || 0,
        horasTrabalhadas: workedHours.toFixed(2),
        valorTotal: totalValue.toFixed(2),
      })
      .where(eq(registrosHoras.id, id));
    return NextResponse.json({ success: true });
  }

  if (route.startsWith("registros/") && req.method === "PUT") {
    if (!auth.isAdmin) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const id = parseInt(route.split("/")[1], 10);
    const body = await req.json();

    const [record] = await db.select().from(registrosHoras).where(eq(registrosHoras.id, id));
    if (!record) {
      return NextResponse.json({ error: "Registo nao encontrado." }, { status: 404 });
    }

    const [member] = await db.select().from(colaboradores).where(eq(colaboradores.id, record.colaboradorId));
    const nextHourRate =
      body.valorHora !== undefined && body.valorHora !== null && body.valorHora !== ""
        ? Number(body.valorHora)
        : parseFloat(String(member?.valorHora || 0));
    if (body.valorHora !== undefined && body.valorHora !== null && body.valorHora !== "") {
      await db
        .update(colaboradores)
        .set({ valorHora: nextHourRate.toFixed(2) })
        .where(eq(colaboradores.id, record.colaboradorId));
    }

    const updatedEntrada = body.horaEntrada ?? record.horaEntrada;
    const updatedPausa = body.horaPausa ?? record.horaPausa;
    const updatedSaida = body.horaSaida ?? record.horaSaida;
    const workedHours = calculateWorkedHours(updatedEntrada, updatedSaida, updatedPausa);
    const computedValue = Number((workedHours * nextHourRate).toFixed(2));
    const finalValue =
      body.valorTotal !== undefined && body.valorTotal !== null && body.valorTotal !== ""
        ? Number(body.valorTotal)
        : computedValue;

    await db
      .update(registrosHoras)
      .set({
        data: body.data ? toIsoDate(body.data) : record.data,
        horaEntrada: updatedEntrada,
        horaPausa: updatedPausa || null,
        horaSaida: updatedSaida || null,
        numeroTrabalhos: parseInt(String(body.numeroTrabalhos ?? record.numeroTrabalhos ?? 0), 10) || 0,
        horasTrabalhadas: workedHours.toFixed(2),
        valorTotal: finalValue.toFixed(2),
      })
      .where(eq(registrosHoras.id, id));

    return NextResponse.json({ success: true });
  }

  if (route.startsWith("registros/") && req.method === "DELETE") {
    if (!auth.isAdmin) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }
    const id = parseInt(route.split("/")[1], 10);
    await db.delete(registrosHoras).where(eq(registrosHoras.id, id));
    return NextResponse.json({ success: true });
  }

  if (route === "alterar-senha" && req.method === "POST") {
    const { senhaAtual, novaSenha } = await req.json();
    const [member] = await db.select().from(colaboradores).where(eq(colaboradores.id, auth.id));
    if (!member) {
      return NextResponse.json({ error: "Colaborador nao encontrado." }, { status: 404 });
    }

    const passwordMatches = await bcrypt.compare(String(senhaAtual), member.senha);
    if (!passwordMatches) {
      return NextResponse.json({ error: "Palavra-passe atual incorreta." }, { status: 400 });
    }

    const newPasswordHash = await bcrypt.hash(String(novaSenha), 10);
    await db.update(colaboradores).set({ senha: newPasswordHash }).where(eq(colaboradores.id, auth.id));
    return NextResponse.json({ success: true });
  }

  if (route === "admin/todos" && req.method === "GET") {
    if (!auth.isAdmin) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }
    return NextResponse.json(await loadAdminDataset(db));
  }

  if (route === "admin/settings/simulador" && req.method === "GET") {
    if (!auth.isAdmin) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }
    const settings = await getSimulatorSettings();
    return NextResponse.json({
      settings: settings.map((item) => ({
        key: item.key,
        label: item.label,
        category: item.category,
        unit: item.unit,
        value: item.value,
        description: item.description,
      })),
    });
  }

  if (route === "admin/settings/simulador" && req.method === "PUT") {
    if (!auth.isAdmin) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const body = await req.json();
    const definition = defaultSimulatorSettings.find((item) => item.key === body.key);
    if (!definition) {
      return NextResponse.json({ error: "Configuracao invalida." }, { status: 400 });
    }

    const parsedValue = Number(body.value);
    if (!Number.isFinite(parsedValue)) {
      return NextResponse.json({ error: "Valor invalido." }, { status: 400 });
    }

    await upsertSimulatorSetting({
      key: definition.key,
      label: definition.label,
      category: definition.category,
      unit: definition.unit,
      value: parsedValue.toFixed(2),
      description: definition.description,
    });

    return NextResponse.json({ success: true });
  }

  if (route === "criar" && req.method === "POST") {
    if (!auth.isAdmin) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const { nome, senha, funcao, valorHora, isAdmin } = await req.json();
    const passwordHash = await bcrypt.hash(String(senha), 10);

    await db.insert(colaboradores).values({
      nome: String(nome).toUpperCase(),
      senha: passwordHash,
      funcao,
      valorHora: String(parseFloat(String(valorHora))),
      isAdmin: isAdmin ? 1 : 0,
    });

    return NextResponse.json({ success: true });
  }

  if (route.match(/^\d+\/editar$/) && req.method === "PUT") {
    if (!auth.isAdmin) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const id = parseInt(route.split("/")[0], 10);
    const body = await req.json();
    const payload = { ...body } as Record<string, unknown>;

    if (payload.senha) {
      payload.senha = await bcrypt.hash(String(payload.senha), 10);
    } else {
      delete payload.senha;
    }

    await db.update(colaboradores).set(payload).where(eq(colaboradores.id, id));
    return NextResponse.json({ success: true });
  }

  if (route.match(/^\d+\/deletar$/) && req.method === "DELETE") {
    if (!auth.isAdmin) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const id = parseInt(route.split("/")[0], 10);
    await db.delete(colaboradores).where(eq(colaboradores.id, id));
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Rota nao encontrada." }, { status: 404 });
}

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
