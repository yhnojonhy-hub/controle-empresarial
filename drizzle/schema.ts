import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, date, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
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

/**
 * Empresas - Cadastro completo das empresas gerenciadas
 */
export const empresas = mysqlTable("empresas", {
  id: int("id").autoincrement().primaryKey(),
  razaoSocial: text("razaoSocial"),
  nomeFantasia: varchar("nomeFantasia", { length: 255 }),
  cnpj: varchar("cnpj", { length: 18 }).notNull().unique(),
  capitalSocial: decimal("capitalSocial", { precision: 15, scale: 2 }),
  cnae: text("cnae"),
  regimeTributario: varchar("regimeTributario", { length: 100 }),
  enderecoCompleto: text("enderecoCompleto"),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 50 }),
  responsavelLegal: varchar("responsavelLegal", { length: 255 }),
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  dataAbertura: date("dataAbertura"),
  status: mysqlEnum("status", ["Aberto", "Fechado", "Suspenso"]).default("Aberto").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Empresa = typeof empresas.$inferSelect;
export type InsertEmpresa = typeof empresas.$inferInsert;

/**
 * Indicadores KPI - Métricas financeiras por empresa e período
 */
export const indicadoresKpi = mysqlTable("indicadores_kpi", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  mesAno: varchar("mesAno", { length: 7 }).notNull(), // formato: YYYY-MM
  faturamentoBruto: decimal("faturamentoBruto", { precision: 15, scale: 2 }).notNull().default("0"),
  impostos: decimal("impostos", { precision: 15, scale: 2 }).notNull().default("0"),
  custosFixos: decimal("custosFixos", { precision: 15, scale: 2 }).notNull().default("0"),
  custosVariaveis: decimal("custosVariaveis", { precision: 15, scale: 2 }).notNull().default("0"),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IndicadorKpi = typeof indicadoresKpi.$inferSelect;
export type InsertIndicadorKpi = typeof indicadoresKpi.$inferInsert;

/**
 * Contas a Pagar e Receber
 */
export const contas = mysqlTable("contas", {
  id: int("id").autoincrement().primaryKey(),
  tipo: mysqlEnum("tipo", ["Pagar", "Receber"]).notNull(),
  empresaId: int("empresaId"),
  descricao: text("descricao").notNull(),
  categoria: varchar("categoria", { length: 100 }),
  valor: decimal("valor", { precision: 15, scale: 2 }).notNull(),
  vencimento: date("vencimento").notNull(),
  status: mysqlEnum("status", ["Pendente", "Pago", "Recebido", "Atrasado", "Cancelado"]).default("Pendente").notNull(),
  prioridade: mysqlEnum("prioridade", ["Baixa", "Media", "Alta"]).default("Media").notNull(),
  dataPagamento: date("dataPagamento"),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conta = typeof contas.$inferSelect;
export type InsertConta = typeof contas.$inferInsert;

/**
 * Funcionários
 */
export const funcionarios = mysqlTable("funcionarios", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }).notNull().unique(),
  empresaId: int("empresaId"),
  cargo: varchar("cargo", { length: 100 }),
  tipoContrato: mysqlEnum("tipoContrato", ["CLT", "PJ", "Estagiario", "Temporario"]).notNull(),
  salarioBase: decimal("salarioBase", { precision: 15, scale: 2 }).notNull(),
  beneficios: decimal("beneficios", { precision: 15, scale: 2 }).notNull().default("0"),
  dataAdmissao: date("dataAdmissao"),
  diaPagamento: int("diaPagamento"),
  status: mysqlEnum("status", ["Contratado", "Demitido", "Afastado", "Ferias"]).default("Contratado").notNull(),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Funcionario = typeof funcionarios.$inferSelect;
export type InsertFuncionario = typeof funcionarios.$inferInsert;

/**
 * Fluxo de Caixa
 */
export const fluxoCaixa = mysqlTable("fluxo_caixa", {
  id: int("id").autoincrement().primaryKey(),
  data: date("data").notNull(),
  tipo: mysqlEnum("tipo", ["Entrada", "Saida"]).notNull(),
  empresaId: int("empresaId"),
  descricao: text("descricao").notNull(),
  categoria: varchar("categoria", { length: 100 }),
  valor: decimal("valor", { precision: 15, scale: 2 }).notNull(),
  metodoPagamento: varchar("metodoPagamento", { length: 50 }),
  referencia: varchar("referencia", { length: 100 }),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FluxoCaixa = typeof fluxoCaixa.$inferSelect;
export type InsertFluxoCaixa = typeof fluxoCaixa.$inferInsert;

/**
 * Impostos
 */
export const impostos = mysqlTable("impostos", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  tipoImposto: varchar("tipoImposto", { length: 50 }).notNull(),
  mesAno: varchar("mesAno", { length: 7 }).notNull(), // formato: YYYY-MM
  baseCalculo: decimal("baseCalculo", { precision: 15, scale: 2 }).notNull(),
  aliquota: decimal("aliquota", { precision: 5, scale: 2 }).notNull(),
  vencimento: date("vencimento").notNull(),
  status: mysqlEnum("status", ["Pendente", "Pago", "Atrasado"]).default("Pendente").notNull(),
  dataPagamento: date("dataPagamento"),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Imposto = typeof impostos.$inferSelect;
export type InsertImposto = typeof impostos.$inferInsert;

/**
 * Documentos - Armazenamento de anexos vinculados a entidades
 */
export const documentos = mysqlTable("documentos", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: varchar("tipo", { length: 50 }).notNull(), // tipo MIME
  tamanho: int("tamanho").notNull(), // em bytes
  fileKey: text("fileKey").notNull(), // chave no S3
  url: text("url").notNull(), // URL pública do S3
  entidadeTipo: mysqlEnum("entidadeTipo", ["Empresa", "Conta", "Funcionario", "FluxoCaixa", "Imposto"]).notNull(),
  entidadeId: int("entidadeId").notNull(),
  descricao: text("descricao"),
  uploadedBy: int("uploadedBy").notNull(), // ID do usuário que fez upload
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Documento = typeof documentos.$inferSelect;
export type InsertDocumento = typeof documentos.$inferInsert;

/**
 * Alertas - Sistema de notificações ao CEO
 */
export const alertas = mysqlTable("alertas", {
  id: int("id").autoincrement().primaryKey(),
  tipo: mysqlEnum("tipo", ["Vencimento", "MargemNegativa", "SaldoBaixo", "NovoRegistro"]).notNull(),
  severidade: mysqlEnum("severidade", ["Info", "Aviso", "Critico"]).default("Info").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem").notNull(),
  entidadeTipo: varchar("entidadeTipo", { length: 50 }),
  entidadeId: int("entidadeId"),
  lido: boolean("lido").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alerta = typeof alertas.$inferSelect;
export type InsertAlerta = typeof alertas.$inferInsert;


/**
 * Contas Bancárias PJ - Gestão de contas bancárias por empresa
 */
export const contasBancarias = mysqlTable("contas_bancarias", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  nomeConta: varchar("nomeConta", { length: 255 }).notNull(),
  banco: varchar("banco", { length: 100 }).notNull(),
  agencia: varchar("agencia", { length: 20 }).notNull(),
  conta: varchar("conta", { length: 30 }).notNull(),
  tipo: mysqlEnum("tipo", ["PJ", "PF"]).default("PJ").notNull(),
  saldoAtual: decimal("saldoAtual", { precision: 15, scale: 2 }).notNull().default("0"),
  saldoAnterior: decimal("saldoAnterior", { precision: 15, scale: 2 }).notNull().default("0"),
  dataAtualizacao: timestamp("dataAtualizacao").defaultNow().onUpdateNow().notNull(),
  status: mysqlEnum("status", ["Ativa", "Inativa", "Encerrada"]).default("Ativa").notNull(),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContaBancaria = typeof contasBancarias.$inferSelect;
export type InsertContaBancaria = typeof contasBancarias.$inferInsert;
