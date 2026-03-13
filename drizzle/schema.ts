import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabela de colaboradores
export const colaboradores = mysqlTable('colaboradores', {
  id: int('id').autoincrement().primaryKey(),
  nome: varchar('nome', { length: 100 }).notNull().unique(),
  senha: text('senha').notNull(), // Hash da senha
  funcao: mysqlEnum('funcao', ['motorista', 'ajudante', 'admin']).notNull(),
  valorHora: decimal('valorHora', { precision: 5, scale: 2 }).notNull(), // 8.00 ou 7.00
  isAdmin: int('isAdmin').notNull().default(0), // 0 = false, 1 = true
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

// Tabela de registros de horas
export const registrosHoras = mysqlTable('registrosHoras', {
  id: int('id').autoincrement().primaryKey(),
  colaboradorId: int('colaboradorId').notNull(),
  data: timestamp('data').notNull(),
  horaEntrada: varchar('horaEntrada', { length: 5 }).notNull(), // HH:MM
  horaPausa: varchar('horaPausa', { length: 5 }), // HH:MM (opcional)
  horaSaida: varchar('horaSaida', { length: 5 }), // HH:MM (opcional)
  numeroTrabalhos: int('numeroTrabalhos').notNull().default(0),
  horasTrabalhadas: varchar('horasTrabalhadas', { length: 10 }).notNull(),
  valorTotal: varchar('valorTotal', { length: 10 }).notNull(),
  sincronizadoSheets: int('sincronizadoSheets').notNull().default(0),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Colaborador = typeof colaboradores.$inferSelect;
export type InsertColaborador = typeof colaboradores.$inferInsert;
export type RegistroHoras = typeof registrosHoras.$inferSelect;
export type InsertRegistroHoras = typeof registrosHoras.$inferInsert;