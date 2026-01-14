/**
 * Alertas Router
 * 
 * Responsabilidade: Gerenciar alertas e notificações
 * Princípios: SRP, DRY, SOLID
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

// ========== Alertas Router ==========
export const alertasRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getAlertas();
  }),

  naoLidos: protectedProcedure.query(async () => {
    const alertas = await db.getAlertas();
    return alertas.filter(a => !a.lido);
  }),

  create: protectedProcedure
    .input(z.object({
      tipo: z.enum(["Vencimento", "MargemNegativa", "SaldoBaixo", "NovoRegistro"]),
      severidade: z.enum(["Info", "Aviso", "Critico"]),
      titulo: z.string().min(3),
      mensagem: z.string().min(3),
      entidadeTipo: z.string().optional(),
      entidadeId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      return await db.createAlerta(input);
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      tipo: z.enum(["Vencimento", "MargemNegativa", "SaldoBaixo", "NovoRegistro"]).optional(),
      severidade: z.enum(["Info", "Aviso", "Critico"]).optional(),
      titulo: z.string().min(3).optional(),
      mensagem: z.string().min(3).optional(),
      entidadeTipo: z.string().optional(),
      entidadeId: z.number().optional(),
      lido: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db.updateAlerta(id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteAlerta(input.id);
      return { success: true };
    }),

  marcarLido: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.updateAlerta(input.id, { lido: true });
    }),

  verificarAutomaticos: protectedProcedure
    .mutation(async () => {
      const { executarVerificacaoCompleta } = await import("../services/alert-automation.service");
      const resultado = await executarVerificacaoCompleta();
      return resultado;
    }),
});
