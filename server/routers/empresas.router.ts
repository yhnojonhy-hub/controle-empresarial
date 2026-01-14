/**
 * Empresas Router
 * 
 * Responsabilidade: Gerenciar CRUD de empresas
 * Princípios: SRP, DRY, SOLID
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { empresaService } from "../services/empresa.service";
import { parseDate } from "../helpers/date-converter";

// ========== Schemas ==========
const empresaCreateSchema = z.object({
  razaoSocial: z.string().optional(),
  nomeFantasia: z.string().optional(),
  cnpj: z.string(),
  capitalSocial: z.union([z.string(), z.number()]).optional().transform(val => val?.toString()),
  cnae: z.string().optional(),
  regimeTributario: z.string().optional(),
  enderecoCompleto: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  responsavelLegal: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().optional(),
  dataAbertura: z.string().optional(),
  status: z.enum(["Aberto", "Fechado", "Suspenso"]).optional(),
});

const empresaUpdateSchema = empresaCreateSchema.partial();

// ========== Router ==========
export const empresasRouter = router({
  list: protectedProcedure.query(async () => {
    return await empresaService.getAll();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await empresaService.getById(input.id);
    }),

  consultarCNPJ: protectedProcedure
    .input(z.object({ cnpj: z.string() }))
    .mutation(async ({ input }) => {
      return await empresaService.consultarCNPJ(input.cnpj);
    }),

  create: protectedProcedure
    .input(empresaCreateSchema)
    .mutation(async ({ input }) => {
      const { dataAbertura, ...rest } = input;
      const dataToCreate: Partial<any> = rest;
      if (dataAbertura) {
        dataToCreate.dataAbertura = parseDate(dataAbertura);
      }
      return await empresaService.createWithNotification(dataToCreate as any);
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: empresaUpdateSchema }))
    .mutation(async ({ input }) => {
      const { dataAbertura, ...rest } = input.data;
      const dataToUpdate: Partial<any> = rest;
      if (dataAbertura) {
        dataToUpdate.dataAbertura = parseDate(dataAbertura);
      }
      return await empresaService.update(input.id, dataToUpdate);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await empresaService.delete(input.id);
      return { success: true };
    }),
});
