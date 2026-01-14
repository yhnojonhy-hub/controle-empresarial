/**
 * RH Router (Recursos Humanos)
 * 
 * Responsabilidade: Gerenciar funcionários e dados de RH
 * Princípios: SRP, DRY, SOLID
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { parseDate } from "../helpers/date-converter";

// ========== Funcionários Router ==========
export const rhRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getFuncionarios();
  }),

  create: protectedProcedure
    .input(z.object({
      nome: z.string(),
      cpf: z.string(),
      cargo: z.string(),
      tipoContrato: z.enum(["CLT", "PJ", "Estagiario", "Temporario"]).optional().default("CLT"),
      salarioBase: z.string(),
      beneficios: z.string().optional().default("0"),
      status: z.enum(["Contratado", "Demitido", "Afastado"]).optional().default("Contratado"),
    }))
    .mutation(async ({ input }) => {
      return await db.createFuncionario(input as any);
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        nome: z.string().optional(),
        cpf: z.string().optional(),
        cargo: z.string().optional(),
        tipoContrato: z.enum(["CLT", "PJ", "Estagiario", "Temporario"]).optional(),
        salarioBase: z.string().optional(),
        beneficios: z.string().optional(),
        status: z.enum(["Contratado", "Demitido", "Afastado"]).optional(),
        dataAdmissao: z.string().optional(),
        dataDesligamento: z.string().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      const { dataAdmissao, dataDesligamento, ...rest } = input.data;
      const dataToUpdate: Partial<any> = rest;
      if (dataAdmissao) dataToUpdate.dataAdmissao = parseDate(dataAdmissao);
      if (dataDesligamento) dataToUpdate.dataDesligamento = parseDate(dataDesligamento);
      return await db.updateFuncionario(input.id, dataToUpdate);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.deleteFuncionario(input.id);
    }),
});
