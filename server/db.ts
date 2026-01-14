import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, empresas, InsertEmpresa, Empresa,
  indicadoresKpi, InsertIndicadorKpi, IndicadorKpi,
  contas, InsertConta, Conta,
  funcionarios, InsertFuncionario, Funcionario,
  fluxoCaixa, InsertFluxoCaixa, FluxoCaixa,
  impostos, InsertImposto, Imposto,
  documentos, InsertDocumento, Documento,
  alertas, InsertAlerta, Alerta
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ========== USER OPERATIONS ==========
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ========== EMPRESA OPERATIONS ==========
export async function createEmpresa(data: InsertEmpresa): Promise<Empresa> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(empresas).values(data);
  const inserted = await db.select().from(empresas).where(eq(empresas.id, Number(result[0].insertId))).limit(1);
  return inserted[0]!;
}

export async function getEmpresas(): Promise<Empresa[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(empresas).orderBy(desc(empresas.createdAt));
}

export async function getEmpresaById(id: number): Promise<Empresa | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(empresas).where(eq(empresas.id, id)).limit(1);
  return result[0];
}

export async function getEmpresaByCnpj(cnpj: string): Promise<Empresa | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(empresas).where(eq(empresas.cnpj, cnpj)).limit(1);
  return result[0];
}

export async function updateEmpresa(id: number, data: Partial<InsertEmpresa>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(empresas).set(data).where(eq(empresas.id, id));
}

export async function deleteEmpresa(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(empresas).where(eq(empresas.id, id));
}

// ========== KPI OPERATIONS ==========
export async function createIndicadorKpi(data: InsertIndicadorKpi): Promise<IndicadorKpi> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(indicadoresKpi).values(data);
  const inserted = await db.select().from(indicadoresKpi).where(eq(indicadoresKpi.id, Number(result[0].insertId))).limit(1);
  return inserted[0]!;
}

export async function getIndicadoresKpi(): Promise<IndicadorKpi[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(indicadoresKpi).orderBy(desc(indicadoresKpi.mesAno));
}

export async function getIndicadoresKpiByEmpresa(empresaId: number): Promise<IndicadorKpi[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(indicadoresKpi).where(eq(indicadoresKpi.empresaId, empresaId)).orderBy(desc(indicadoresKpi.mesAno));
}

export async function updateIndicadorKpi(id: number, data: Partial<InsertIndicadorKpi>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(indicadoresKpi).set(data).where(eq(indicadoresKpi.id, id));
}

export async function deleteIndicadorKpi(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(indicadoresKpi).where(eq(indicadoresKpi.id, id));
}

// ========== CONTA OPERATIONS ==========
export async function createConta(data: InsertConta): Promise<Conta> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(contas).values(data);
  const inserted = await db.select().from(contas).where(eq(contas.id, Number(result[0].insertId))).limit(1);
  return inserted[0]!;
}

export async function getContas(): Promise<Conta[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(contas).orderBy(desc(contas.vencimento));
}

export async function getContasPendentes(): Promise<Conta[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(contas).where(eq(contas.status, "Pendente")).orderBy(contas.vencimento);
}

export async function updateConta(id: number, data: Partial<InsertConta>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(contas).set(data).where(eq(contas.id, id));
}

export async function deleteConta(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(contas).where(eq(contas.id, id));
}

// ========== FUNCIONARIO OPERATIONS ==========
export async function createFuncionario(data: InsertFuncionario): Promise<Funcionario> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(funcionarios).values(data);
  const inserted = await db.select().from(funcionarios).where(eq(funcionarios.id, Number(result[0].insertId))).limit(1);
  return inserted[0]!;
}

export async function getFuncionarios(): Promise<Funcionario[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(funcionarios).orderBy(desc(funcionarios.createdAt));
}

export async function getFuncionariosAtivos(): Promise<Funcionario[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(funcionarios).where(eq(funcionarios.status, "Contratado"));
}

export async function updateFuncionario(id: number, data: Partial<InsertFuncionario>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(funcionarios).set(data).where(eq(funcionarios.id, id));
}

export async function deleteFuncionario(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(funcionarios).where(eq(funcionarios.id, id));
}

// ========== FLUXO CAIXA OPERATIONS ==========
export async function createFluxoCaixa(data: InsertFluxoCaixa): Promise<FluxoCaixa> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(fluxoCaixa).values(data);
  const inserted = await db.select().from(fluxoCaixa).where(eq(fluxoCaixa.id, Number(result[0].insertId))).limit(1);
  return inserted[0]!;
}

export async function getFluxoCaixa(): Promise<FluxoCaixa[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(fluxoCaixa).orderBy(desc(fluxoCaixa.data));
}

export async function updateFluxoCaixa(id: number, data: Partial<InsertFluxoCaixa>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(fluxoCaixa).set(data).where(eq(fluxoCaixa.id, id));
}

export async function deleteFluxoCaixa(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(fluxoCaixa).where(eq(fluxoCaixa.id, id));
}

// ========== IMPOSTO OPERATIONS ==========
export async function createImposto(data: InsertImposto): Promise<Imposto> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(impostos).values(data);
  const inserted = await db.select().from(impostos).where(eq(impostos.id, Number(result[0].insertId))).limit(1);
  return inserted[0]!;
}

export async function getImpostos(): Promise<Imposto[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(impostos).orderBy(desc(impostos.vencimento));
}

export async function updateImposto(id: number, data: Partial<InsertImposto>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(impostos).set(data).where(eq(impostos.id, id));
}

export async function deleteImposto(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(impostos).where(eq(impostos.id, id));
}

// ========== DOCUMENTO OPERATIONS ==========
export async function createDocumento(data: InsertDocumento): Promise<Documento> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(documentos).values(data);
  const inserted = await db.select().from(documentos).where(eq(documentos.id, Number(result[0].insertId))).limit(1);
  return inserted[0]!;
}

export async function getDocumentosByEntidade(entidadeTipo: string, entidadeId: number): Promise<Documento[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(documentos).where(
    and(
      eq(documentos.entidadeTipo, entidadeTipo as any),
      eq(documentos.entidadeId, entidadeId)
    )
  ).orderBy(desc(documentos.createdAt));
}

export async function deleteDocumento(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(documentos).where(eq(documentos.id, id));
}

// ========== ALERTA OPERATIONS ==========
export async function createAlerta(data: InsertAlerta): Promise<Alerta> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(alertas).values(data);
  const inserted = await db.select().from(alertas).where(eq(alertas.id, Number(result[0].insertId))).limit(1);
  return inserted[0]!;
}

export async function getAlertas(): Promise<Alerta[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(alertas).orderBy(desc(alertas.createdAt));
}

export async function getAlertasNaoLidos(): Promise<Alerta[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(alertas).where(eq(alertas.lido, false)).orderBy(desc(alertas.createdAt));
}

export async function updateAlerta(id: number, data: Partial<InsertAlerta>): Promise<Alerta> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(alertas).set(data).where(eq(alertas.id, id));
  const updated = await db.select().from(alertas).where(eq(alertas.id, id)).limit(1);
  return updated[0]!;
}

export async function marcarAlertaComoLido(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(alertas).set({ lido: true }).where(eq(alertas.id, id));
}

export async function deleteAlerta(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(alertas).where(eq(alertas.id, id));
}

// ========== DASHBOARD OPERATIONS ==========
export async function getDashboardData() {
  const db = await getDb();
  if (!db) return null;

  // Calcular faturamento do mês atual
  const mesAtual = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  const kpisResult = await db.select().from(indicadoresKpi).where(eq(indicadoresKpi.mesAno, mesAtual));
  
  let faturamentoTotal = 0;
  let impostosTotal = 0;
  let custosFixosTotal = 0;
  let custosVariaveisTotal = 0;

  for (const kpi of kpisResult) {
    faturamentoTotal += Number(kpi.faturamentoBruto);
    impostosTotal += Number(kpi.impostos);
    custosFixosTotal += Number(kpi.custosFixos);
    custosVariaveisTotal += Number(kpi.custosVariaveis);
  }

  const faturamentoLiquido = faturamentoTotal - impostosTotal;
  const lucroPrejuizo = faturamentoLiquido - custosFixosTotal - custosVariaveisTotal;

  // Total de despesas (contas a pagar pendentes)
  const contasPagarResult = await db.select().from(contas).where(
    and(
      eq(contas.tipo, "Pagar"),
      eq(contas.status, "Pendente")
    )
  );
  
  const totalDespesas = contasPagarResult.reduce((sum, conta) => sum + Number(conta.valor), 0);

  // Funcionários ativos
  const funcionariosAtivosResult = await getFuncionariosAtivos();
  const funcionariosAtivos = funcionariosAtivosResult.length;

  // Saldo em caixa (simplificado: faturamento - despesas)
  const saldoCaixa = faturamentoTotal - totalDespesas;

  return {
    faturamentoMes: faturamentoTotal,
    totalDespesas,
    lucroPrejuizo,
    saldoCaixa,
    funcionariosAtivos,
  };
}
