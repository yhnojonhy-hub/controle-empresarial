/**
 * tRPC Router para Contas Bancárias
 * Gerencia operações de CRUD e consolidação de saldos
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as dbBancarias from "./db-bancarias";
import { logger } from "./logger";

export const contasBancariasRouter = router({
  /**
   * Listar todas as contas bancárias
   */
  list: protectedProcedure.query(async () => {
    try {
      const contas = await dbBancarias.getContasBancarias();
      return contas;
    } catch (error) {
      logger.error("Erro ao listar contas bancárias", { error });
      throw error;
    }
  }),

  /**
   * Listar contas bancárias de uma empresa específica
   */
  listPorEmpresa: protectedProcedure
    .input(z.object({ empresaId: z.number() }))
    .query(async ({ input }) => {
      try {
        const contas = await dbBancarias.getContasBancariasPorEmpresa(input.empresaId);
        return contas;
      } catch (error) {
        logger.error("Erro ao listar contas bancárias por empresa", { error, empresaId: input.empresaId });
        throw error;
      }
    }),

  /**
   * Criar nova conta bancária
   */
  create: protectedProcedure
    .input(
      z.object({
        empresaId: z.number(),
        nomeConta: z.string().min(3),
        banco: z.string().min(2),
        agencia: z.string().min(4),
        conta: z.string().min(5),
        tipo: z.enum(["PJ", "PF"]).default("PJ"),
        saldoAtual: z.union([z.string(), z.number()]).transform(Number),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const conta = await dbBancarias.createContaBancaria({
          ...input,
          saldoAtual: input.saldoAtual.toString(),
          saldoAnterior: input.saldoAtual.toString(),
        });
        logger.info("Conta bancária criada via tRPC", { contaId: conta.id });
        return conta;
      } catch (error) {
        logger.error("Erro ao criar conta bancária via tRPC", { error, input });
        throw error;
      }
    }),

  /**
   * Atualizar conta bancária
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        nomeConta: z.string().min(3).optional(),
        banco: z.string().min(2).optional(),
        agencia: z.string().min(4).optional(),
        conta: z.string().min(5).optional(),
        tipo: z.enum(["PJ", "PF"]).optional(),
        saldoAtual: z.union([z.string(), z.number()]).transform(Number).optional(),
        status: z.enum(["Ativa", "Inativa", "Encerrada"]).optional(),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, ...data } = input;
        const updateData: any = { ...data };
        
        if (data.saldoAtual !== undefined) {
          updateData.saldoAtual = data.saldoAtual.toString();
        }
        
        await dbBancarias.updateContaBancaria(id, updateData);
        logger.info("Conta bancária atualizada via tRPC", { contaId: id });
        return { success: true };
      } catch (error) {
        logger.error("Erro ao atualizar conta bancária via tRPC", { error, input });
        throw error;
      }
    }),

  /**
   * Deletar conta bancária
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await dbBancarias.deleteContaBancaria(input.id);
        logger.info("Conta bancária deletada via tRPC", { contaId: input.id });
        return { success: true };
      } catch (error) {
        logger.error("Erro ao deletar conta bancária via tRPC", { error, contaId: input.id });
        throw error;
      }
    }),

  /**
   * Obter saldos consolidados por empresa
   */
  saldosPorEmpresa: protectedProcedure.query(async () => {
    try {
      const saldos = await dbBancarias.getSaldosPorEmpresa();
      return saldos;
    } catch (error) {
      logger.error("Erro ao obter saldos por empresa", { error });
      throw error;
    }
  }),

  /**
   * Obter saldo geral consolidado
   */
  saldoGeral: protectedProcedure.query(async () => {
    try {
      const saldo = await dbBancarias.getSaldoGeral();
      return saldo;
    } catch (error) {
      logger.error("Erro ao obter saldo geral", { error });
      throw error;
    }
  }),

  /**
   * Obter variação de saldo
   */
  variacaoSaldo: protectedProcedure.query(async () => {
    try {
      const variacao = await dbBancarias.getVariacaoSaldo();
      return variacao;
    } catch (error) {
      logger.error("Erro ao obter variação de saldo", { error });
      throw error;
    }
  }),
});
