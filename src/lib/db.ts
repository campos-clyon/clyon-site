import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq, desc } from "drizzle-orm";
import { users, colaboradores, registrosHoras } from "../../drizzle/schema";
import type { InsertUser } from "../../drizzle/schema";

let dbInstance: ReturnType<typeof drizzle<typeof import('../../drizzle/schema')>> | null = null;

export async function getDb() {
  if (!process.env.DATABASE_URL) {
    console.warn("[Database] DATABASE_URL not set");
    return null;
  }
  if (!dbInstance) {
    const pool = mysql.createPool(process.env.DATABASE_URL);
    dbInstance = drizzle(pool) as any;
  }
  return dbInstance;
}

// ─── User helpers ───────────────────────────────────────────────────────────

export async function upsertUser(values: InsertUser) {
  const db = await getDb();
  if (!db) return;
  try {
    const updateSet: Partial<InsertUser> = {
      name: values.name,
      email: values.email,
      loginMethod: values.loginMethod,
      lastSignedIn: new Date(),
    };
    if (values.openId === process.env.OWNER_OPEN_ID) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0] ?? undefined;
}

// ─── Colaboradores helpers ───────────────────────────────────────────────────

export async function getColaboradorByNome(nome: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(colaboradores).where(eq(colaboradores.nome, nome)).limit(1);
  return result[0] ?? undefined;
}

export async function getAllColaboradores() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(colaboradores);
}

export async function createColaborador(data: {
  nome: string;
  senha: string;
  funcao: "motorista" | "ajudante" | "admin";
  valorHora: string;
  isAdmin?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(colaboradores).values(data);
}

export async function updateColaborador(
  id: number,
  data: Partial<{ nome: string; senha: string; funcao: "motorista" | "ajudante" | "admin"; valorHora: string; isAdmin: number }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(colaboradores).set(data).where(eq(colaboradores.id, id));
}

export async function deleteColaborador(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(colaboradores).where(eq(colaboradores.id, id));
}

// ─── Registros de Horas helpers ──────────────────────────────────────────────

function calcularHoras(entrada: string, saida: string, pausa?: string | null): number {
  try {
    const [entH, entM] = entrada.split(":").map(Number);
    const [saiH, saiM] = saida.split(":").map(Number);
    let totalMinutos = saiH * 60 + saiM - (entH * 60 + entM);
    if (pausa) {
      const [pausaH, pausaM] = pausa.split(":").map(Number);
      totalMinutos -= pausaH * 60 + pausaM;
    }
    return Math.max(0, parseFloat((totalMinutos / 60).toFixed(2)));
  } catch {
    return 0;
  }
}

export async function getRegistrosHorasByColaborador(
  colaboradorId: number,
  limit = 50,
  offset = 0
) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select()
    .from(registrosHoras)
    .where(eq(registrosHoras.colaboradorId, colaboradorId))
    .orderBy(desc(registrosHoras.data))
    .limit(limit)
    .offset(offset);

  const colab = await db
    .select()
    .from(colaboradores)
    .where(eq(colaboradores.id, colaboradorId))
    .limit(1);
  const valorHora = colab[0] ? parseFloat(colab[0].valorHora) : 0;

  return result.map((reg) => {
    const horas = reg.horaSaida ? calcularHoras(reg.horaEntrada, reg.horaSaida, reg.horaPausa) : 0;
    const valor = parseFloat((horas * valorHora).toFixed(2));
    return { ...reg, horasTrabalhadas: horas.toFixed(2), valorTotal: valor.toFixed(2) };
  });
}

export async function createRegistroHoras(data: {
  colaboradorId: number;
  data: Date;
  horaEntrada: string;
  horaPausa?: string;
  horaSaida?: string;
  numeroTrabalhos: number;
  horasTrabalhadas: string;
  valorTotal: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(registrosHoras).values({ ...data, sincronizadoSheets: 0 });
}

export async function updateRegistroHoras(
  id: number,
  data: Partial<{
    horaPausa: string;
    horaSaida: string;
    numeroTrabalhos: number;
    horasTrabalhadas: string;
    valorTotal: string;
    sincronizadoSheets: number;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(registrosHoras).set(data).where(eq(registrosHoras.id, id));
}

export async function getTodayRegistroByColaborador(colaboradorId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const result = await db
    .select()
    .from(registrosHoras)
    .where(eq(registrosHoras.colaboradorId, colaboradorId))
    .orderBy(desc(registrosHoras.data))
    .limit(1);

  if (!result[0]) return undefined;
  const regDate = new Date(result[0].data);
  if (regDate >= today && regDate < tomorrow) return result[0];
  return undefined;
}
