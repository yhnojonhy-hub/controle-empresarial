/**
 * Financeiro Router
 * 
 * Responsabilidade: Gerenciar KPIs, Contas, FluxoCaixa e Impostos
 * Princípios: SRP, DRY, SOLID
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { parseDate } from "../helpers/date-converter";

// ========== KPIs Router ==========
const kpisRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getIndicadoresKpi();
  }),

  create: protectedProcedure
    .input(z.object({
      empresaId: z.number(),
      mesAno: z.string().optional().default(new Date().toISOString().slice(0, 7)),
      faturamentoBruto: z.string(),
      impostos: z.string().optional().default("0"),
      custosFixos: z.string().optional().default("0"),
      custosVariaveis: z.string().optional().default("0"),
    }))
    .mutation(async ({ input }) => {
      return await db.createIndicadorKpi(input as any);
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        empresaId: z.number().optional(),
        mesAno: z.string().optional(),
        faturamentoBruto: z.string().optional(),
        impostos: z.string().optional(),
        custosFixos: z.string().optional(),
        custosVariaveis: z.string().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      return await db.updateIndicadorKpi(input.id, input.data as any);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.deleteIndicadorKpi(input.id);
    }),
});

// ========== Contas Router ==========
const contasRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getContas();
  }),

  create: protectedProcedure
    .input(z.object({
      tipo: z.enum(["Pagar", "Receber"]),
      empresaId: z.number().optional(),
      descricao: z.string(),
      categoria: z.string(),
      valor: z.string(),
      vencimento: z.string().optional().default(new Date().toISOString().split('T')[0]),
      status: z.enum(["Pendente", "Pago", "Atrasado", "Cancelado"]).optional().default("Pendente"),
      prioridade: z.enum(["Baixa", "Media", "Alta"]).optional().default("Media"),
    }))
    .mutation(async ({ input }) => {
      const conta = await db.createConta(input as any);
      
      // Verificar vencimento próximo e criar alerta
      const vencimento = new Date(input.vencimento);
      const hoje = new Date();
      const diasRestantes = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diasRestantes <= 7 && diasRestantes >= 0) {
        await db.createAlerta({
          tipo: "Vencimento",
          severidade: diasRestantes <= 3 ? "Critico" : "Aviso",
          titulo: `Conta ${input.tipo} vencendo em ${diasRestantes} dias`,
          mensagem: `${input.descricao} - R$ ${input.valor}`,
          entidadeTipo: "Conta",
          entidadeId: conta.id,
        });
      }
      
      return conta;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        tipo: z.enum(["Pagar", "Receber"]).optional(),
        empresaId: z.number().optional(),
        descricao: z.string().optional(),
        categoria: z.string().optional(),
        valor: z.string().optional(),
        vencimento: z.string().optional(),
        status: z.enum(["Pendente", "Pago", "Atrasado", "Cancelado"]).optional(),
        prioridade: z.enum(["Baixa", "Media", "Alta"]).optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      const { vencimento, ...rest } = input.data;
      const dataToUpdate: Partial<any> = rest;
      if (vencimento) dataToUpdate.vencimento = parseDate(vencimento);
      return await db.updateConta(input.id, dataToUpdate);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.deleteConta(input.id);
    }),
});

// ========== FluxoCaixa Router ==========
const fluxoCaixaRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getFluxoCaixa();
  }),

  create: protectedProcedure
    .input(z.object({
      data: z.string(),
      tipo: z.enum(["Entrada", "Saida"]),
      descricao: z.string(),
      categoria: z.string(),
      valor: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await db.createFluxoCaixa(input as any);
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        data: z.string().optional(),
        tipo: z.enum(["Entrada", "Saida"]).optional(),
        descricao: z.string().optional(),
        categoria: z.string().optional(),
        valor: z.string().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      const { data: dataStr, ...rest } = input.data;
      const dataToUpdate: Partial<any> = rest;
      if (dataStr) dataToUpdate.data = parseDate(dataStr);
      return await db.updateFluxoCaixa(input.id, dataToUpdate);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.deleteFluxoCaixa(input.id);
    }),
});

// ========== Impostos Router ==========
const impostosRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getImpostos();
  }),

  create: protectedProcedure
    .input(z.object({
      empresaId: z.number(),
      mesAno: z.string().optional().default(new Date().toISOString().slice(0, 7)),
      tipo: z.string(),
      baseCalculo: z.string(),
      aliquota: z.string(),
      vencimento: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await db.createImposto(input as any);
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        empresaId: z.number().optional(),
        mesAno: z.string().optional(),
        tipo: z.string().optional(),
        baseCalculo: z.string().optional(),
        aliquota: z.string().optional(),
        vencimento: z.string().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      const { vencimento, ...rest } = input.data;
      const dataToUpdate: Partial<any> = rest;
      if (vencimento) dataToUpdate.vencimento = parseDate(vencimento);
      return await db.updateImposto(input.id, dataToUpdate);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.deleteImposto(input.id);
    }),
});

// ========== Financeiro Router Principal ==========
export const financeiroRouter = router({
  kpis: kpisRouter,
  contas: contasRouter,
  fluxoCaixa: fluxoCaixaRouter,
  impostos: impostosRouter,
});
