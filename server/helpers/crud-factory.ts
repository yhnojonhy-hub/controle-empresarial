/**
 * CRUD Factory
 * 
 * Responsabilidade: Gerar procedures tRPC CRUD automaticamente
 * Princípios aplicados:
 * - DRY: Elimina repetição de código de procedures
 * - Factory Pattern: Cria procedures padronizadas
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import type { BaseService } from "../services/base.service";

export interface CRUDSchemas {
  create: z.ZodType<any>;
  update: z.ZodType<any>;
}

/**
 * Factory que cria router tRPC completo com operações CRUD
 * DRY: Elimina código duplicado em múltiplos routers
 */
export function createCRUDRouter<T>(
  service: BaseService<T>,
  schemas: CRUDSchemas
) {
  return router({
    list: protectedProcedure.query(async () => {
      return await service.getAll();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await service.getById(input.id);
      }),

    create: protectedProcedure
      .input(schemas.create)
      .mutation(async ({ input }) => {
        return await service.create(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: schemas.update,
        })
      )
      .mutation(async ({ input }) => {
        return await service.update(input.id, input.data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await service.delete(input.id);
        return { success: true };
      }),
  });
}

/**
 * Helper para criar schemas Zod comuns
 * DRY: Reutiliza definições de schemas
 */
export const commonSchemas = {
  id: z.number().int().positive(),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
  email: z.string().email(),
  telefone: z.string().optional(),
  status: z.enum(["Aberto", "Fechado", "Suspenso"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  currency: z.number().nonnegative(),
};
