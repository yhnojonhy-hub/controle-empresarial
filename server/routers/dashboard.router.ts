/**
 * Dashboard Router
 * 
 * Responsabilidade: Gerenciar dados de dashboard e resumos
 * Princípios: SRP, DRY, SOLID
 */

import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

// ========== Dashboard Router ==========
export const dashboardRouter = router({
  getData: protectedProcedure.query(async () => {
    return await db.getDashboardData();
  }),
  
  summary: protectedProcedure.query(async () => {
    const dashboardData = await db.getDashboardData();
    return dashboardData;
  }),
});
