/**
 * Database functions for Contas Bancárias (Bank Accounts)
 * Handles CRUD operations and consolidation queries
 */

import { getDb } from "./db";
import { contasBancarias, InsertContaBancaria, ContaBancaria } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

/**
 * Listar todas as contas bancárias
 */
export async function getContasBancarias(): Promise<ContaBancaria[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection not available");
    const contas = await db.select().from(contasBancarias).orderBy(contasBancarias.empresaId);
    logger.info("Contas bancárias recuperadas", { count: contas.length });
    return contas;
  } catch (error) {
    logger.error("Erro ao recuperar contas bancárias", { error });
    throw error;
  }
}

/**
 * Listar contas bancárias de uma empresa específica
 */
export async function getContasBancariasPorEmpresa(empresaId: number): Promise<ContaBancaria[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection not available");
    const contas = await db
      .select()
      .from(contasBancarias)
      .where(eq(contasBancarias.empresaId, empresaId))
      .orderBy(contasBancarias.nomeConta);
    
    logger.info("Contas bancárias da empresa recuperadas", { empresaId, count: contas.length });
    return contas;
  } catch (error) {
    logger.error("Erro ao recuperar contas bancárias da empresa", { error, empresaId });
    throw error;
  }
}

/**
 * Criar nova conta bancária
 */
export async function createContaBancaria(data: InsertContaBancaria): Promise<ContaBancaria> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection not available");
    const [conta] = await db.insert(contasBancarias).values(data).returning();
    logger.info("Conta bancária criada", { contaId: conta.id, empresaId: conta.empresaId });
    return conta;
  } catch (error) {
    logger.error("Erro ao criar conta bancária", { error, data });
    throw error;
  }
}

/**
 * Atualizar conta bancária
 */
export async function updateContaBancaria(
  id: number,
  data: Partial<InsertContaBancaria>
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection not available");
    await db.update(contasBancarias).set(data).where(eq(contasBancarias.id, id));
    logger.info("Conta bancária atualizada", { contaId: id, data });
  } catch (error) {
    logger.error("Erro ao atualizar conta bancária", { error, id, data });
    throw error;
  }
}

/**
 * Deletar conta bancária
 */
export async function deleteContaBancaria(id: number): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection not available");
    await db.delete(contasBancarias).where(eq(contasBancarias.id, id));
    logger.info("Conta bancária deletada", { contaId: id });
  } catch (error) {
    logger.error("Erro ao deletar conta bancária", { error, id });
    throw error;
  }
}

/**
 * Obter saldo consolidado por empresa
 */
export async function getSaldosPorEmpresa(): Promise<
  Array<{ empresaId: number; saldoTotal: number; quantidadeContas: number }>
> {
  try {
    const contas = await getContasBancarias();
    
    const consolidacao = new Map<
      number,
      { empresaId: number; saldoTotal: number; quantidadeContas: number }
    >();

    for (const conta of contas) {
      if (conta.status !== "Ativa") continue;

      const saldoAtual = Number(conta.saldoAtual) || 0;
      const existing = consolidacao.get(conta.empresaId);

      if (existing) {
        consolidacao.set(conta.empresaId, {
          empresaId: conta.empresaId,
          saldoTotal: existing.saldoTotal + saldoAtual,
          quantidadeContas: existing.quantidadeContas + 1,
        });
      } else {
        consolidacao.set(conta.empresaId, {
          empresaId: conta.empresaId,
          saldoTotal: saldoAtual,
          quantidadeContas: 1,
        });
      }
    }

    const resultado = Array.from(consolidacao.values());
    logger.info("Saldos consolidados por empresa", { empresas: resultado.length });
    return resultado;
  } catch (error) {
    logger.error("Erro ao consolidar saldos por empresa", { error });
    throw error;
  }
}

/**
 * Obter saldo geral consolidado (grupo econômico)
 */
export async function getSaldoGeral(): Promise<{
  saldoTotal: number;
  quantidadeContas: number;
  quantidadeEmpresas: number;
}> {
  try {
    const contas = await getContasBancarias();
    
    let saldoTotal = 0;
    let quantidadeContas = 0;
    const empresasSet = new Set<number>();

    for (const conta of contas) {
      if (conta.status !== "Ativa") continue;

      saldoTotal += Number(conta.saldoAtual) || 0;
      quantidadeContas++;
      empresasSet.add(conta.empresaId);
    }

    const resultado = {
      saldoTotal,
      quantidadeContas,
      quantidadeEmpresas: empresasSet.size,
    };

    logger.info("Saldo geral consolidado", resultado);
    return resultado;
  } catch (error) {
    logger.error("Erro ao consolidar saldo geral", { error });
    throw error;
  }
}

/**
 * Obter variação de saldo (diária/mensal)
 */
export async function getVariacaoSaldo(): Promise<{
  variacaoDiaria: number;
  variacaoMensal: number;
  percentualDiario: number;
  percentualMensal: number;
}> {
  try {
    const contas = await getContasBancarias();
    
    let saldoAtualTotal = 0;
    let saldoAnteriorTotal = 0;

    for (const conta of contas) {
      if (conta.status !== "Ativa") continue;

      saldoAtualTotal += Number(conta.saldoAtual) || 0;
      saldoAnteriorTotal += Number(conta.saldoAnterior) || 0;
    }

    const variacaoDiaria = saldoAtualTotal - saldoAnteriorTotal;
    const percentualDiario = saldoAnteriorTotal !== 0 ? (variacaoDiaria / saldoAnteriorTotal) * 100 : 0;

    // Para variação mensal, usamos aproximação (considerando 30 dias)
    const variacaoMensal = variacaoDiaria * 30;
    const percentualMensal = percentualDiario * 30;

    const resultado = {
      variacaoDiaria,
      variacaoMensal,
      percentualDiario: Math.round(percentualDiario * 100) / 100,
      percentualMensal: Math.round(percentualMensal * 100) / 100,
    };

    logger.info("Variação de saldo calculada", resultado);
    return resultado;
  } catch (error) {
    logger.error("Erro ao calcular variação de saldo", { error });
    throw error;
  }
}
