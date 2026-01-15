/**
 * Dashboard Router
 * 
 * Responsabilidade: Gerenciar dados de dashboard e resumos
 * Princípios: SRP, DRY, SOLID
 */

import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { consolidarDadosEmpresa, consolidarTodasEmpresas, resumoConsolidado } from "../services/consolidacao.service";
import { z } from "zod";

// ========== Dashboard Router ==========
export const dashboardRouter = router({
  getData: protectedProcedure.query(async () => {
    return await db.getDashboardData();
  }),
  
  summary: protectedProcedure.query(async () => {
    const dashboardData = await db.getDashboardData();
    return dashboardData;
  }),

  consolidacaoEmpresa: protectedProcedure
    .input(z.object({
      empresaId: z.number(),
      mesAno: z.string(),
    }))
    .query(async ({ input }) => {
      return await consolidarDadosEmpresa(input.empresaId, input.mesAno);
    }),

  consolidacaoTodasEmpresas: protectedProcedure
    .input(z.object({
      mesAno: z.string(),
    }))
    .query(async ({ input }) => {
      return await consolidarTodasEmpresas(input.mesAno);
    }),

  resumoConsolidado: protectedProcedure
    .input(z.object({
      mesAno: z.string(),
    }))
    .query(async ({ input }) => {
      return await resumoConsolidado(input.mesAno);
    }),
});
