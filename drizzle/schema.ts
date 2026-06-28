import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, tinyint } from "drizzle-orm/mysql-core";

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
  senha: text('senha').notNull(),
  funcao: mysqlEnum('funcao', ['motorista', 'ajudante', 'admin', 'assistente']).notNull(),
  valorHora: decimal('valorHora', { precision: 6, scale: 2 }).default('0.00'), // null para assistentes
  valorDiaria: decimal('valorDiaria', { precision: 6, scale: 2 }), // opcional para motoristas/ajudantes
  isAdmin: int('isAdmin').notNull().default(0),
  // Modelo de pagamento
  paymentModel: mysqlEnum('paymentModel', ['hourly', 'daily', 'commission', 'none']).default('hourly'),
  // Campos de comissão (para assistentes)
  commissionType: mysqlEnum('commissionType', ['profit_percent', 'gross_percent', 'fixed_per_closed_request', 'none']),
  commissionPercent: decimal('commissionPercent', { precision: 5, scale: 2 }),
  commissionFixedAmount: decimal('commissionFixedAmount', { precision: 8, scale: 2 }),
  commissionNotes: text('commissionNotes'),
  // Flags operacionais
  canReceiveSimulatorRequests: tinyint('canReceiveSimulatorRequests').default(0),
  participatesInTimeTracking: tinyint('participatesInTimeTracking').default(1),
  active: tinyint('active').notNull().default(1),
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

export const simulatorSettings = mysqlTable("simulatorSettings", {
  key: varchar("key", { length: 120 }).primaryKey(),
  label: varchar("label", { length: 160 }).notNull(),
  category: varchar("category", { length: 40 }).notNull(),
  unit: varchar("unit", { length: 24 }).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const galleryMedia = mysqlTable("galleryMedia", {
  id: varchar("id", { length: 120 }).primaryKey(),
  section: varchar("section", { length: 32 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  alt: varchar("alt", { length: 220 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  order: int("order").notNull().default(1),
  isActive: int("isActive").notNull().default(1),
  projectKey: varchar("projectKey", { length: 160 }),
  phase: varchar("phase", { length: 24 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Colaborador = typeof colaboradores.$inferSelect;
export type InsertColaborador = typeof colaboradores.$inferInsert;
export type RegistroHoras = typeof registrosHoras.$inferSelect;
export type InsertRegistroHoras = typeof registrosHoras.$inferInsert;
export type SimulatorSetting = typeof simulatorSettings.$inferSelect;
export type InsertSimulatorSetting = typeof simulatorSettings.$inferInsert;
export type GalleryMedia = typeof galleryMedia.$inferSelect;
export type InsertGalleryMedia = typeof galleryMedia.$inferInsert;

// ─── SimulatorOrders (gerido com raw SQL — só os tipos aqui) ─────────────────

export type OrderStatus =
  | "pendente"
  | "sem_assistente"
  | "atribuido"
  | "em_analise"
  | "precisa_info"
  | "estimativa_pronta"
  | "presencial_recomendado"
  | "aprovado"
  | "enviado_cliente"
  | "confirmado"
  | "em_execucao"
  | "concluido"
  | "cancelado"
  | "rejeitado";

export type OrderPriority = "baixa" | "normal" | "alta" | "urgente";

export interface OrderHistoryEntry {
  type: string;
  by?: { id: number; nome: string; role: string } | null;
  message: string;
  createdAt: string;
}

export interface SimulatorOrder {
  id: number;
  serviceType?: string | null;
  description?: string | null;
  filesJson?: string | null;
  address?: string | null;
  city?: string | null;
  floor?: string | null;
  hasElevator?: string | null;
  parkingDistance?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  urgency?: string | null;
  estimateMin?: string | null;
  estimateMax?: string | null;
  estimateTotal?: string | null;
  estimateJson?: string | null;
  distanceKm?: string | null;
  distanceText?: string | null;
  status: OrderStatus;
  priority?: OrderPriority | null;
  notasInternas?: string | null;
  precoFinal?: string | null;
  precoFinalIva?: string | null;
  mensagemCliente?: string | null;
  assignedToId?: number | null;
  assignedToName?: string | null;
  assignedAt?: Date | null;
  chatJson?: string | null;
  historyJson?: string | null;
  reviewJson?: string | null;
  colaboradorId?: number | null;
  dataAgendada?: Date | null;
  viewedAt?: Date | null;
  /** Full raw form data JSON — stores originAddress, destinationAddress, originAccess, destinationAccess, movingDistance, etc. */
  rawOrderJson?: string | null;
  /** Timestamp when an assistant accepted this order from the general queue */
  acceptedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertSimulatorOrder {
  serviceType?: string | null;
  description?: string | null;
  filesJson?: string | null;
  address?: string | null;
  city?: string | null;
  floor?: string | null;
  hasElevator?: string | null;
  parkingDistance?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  urgency?: string | null;
  estimateMin?: string | null;
  estimateMax?: string | null;
  estimateTotal?: string | null;
  estimateJson?: string | null;
  distanceKm?: string | null;
  distanceText?: string | null;
  status?: OrderStatus;
  priority?: OrderPriority | null;
  notasInternas?: string | null;
  precoFinal?: string | null;
  precoFinalIva?: string | null;
  mensagemCliente?: string | null;
  assignedToId?: number | null;
  assignedToName?: string | null;
  assignedAt?: Date | null;
  chatJson?: string | null;
  historyJson?: string | null;
  reviewJson?: string | null;
  colaboradorId?: number | null;
  dataAgendada?: Date | null;
  rawOrderJson?: string | null;
  acceptedAt?: Date | null;
}
