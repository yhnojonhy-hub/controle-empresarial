/**
 * Application Routers (Refatorado com SOLID + DRY)
 * 
 * Arquitetura modular por domínio:
 * - Empresas: Gestão de empresas
 * - Financeiro: KPIs, Contas, FluxoCaixa, Impostos
 * - RH: Funcionários
 * - Alertas: Notificações
 * - Dashboard: Resumos e dados consolidados
 * - Auth: Autenticação
 * - Chatbot: Interações com IA
 * - ContasBancarias: Contas bancárias e consolidação
 * - System: Sistema (notificações, etc)
 */

import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { authRouter } from "./routers/auth.router";
import { empresasRouter } from "./routers/empresas.router";
import { dashboardRouter } from "./routers/dashboard.router";
import { financeiroRouter } from "./routers/financeiro.router";
import { rhRouter } from "./routers/rh.router";
import { alertasRouter } from "./routers/alertas.router";
import { chatbotRouter } from "./routers/chatbot.router";
import { contasBancariasRouter } from "./routers-bancarias";

// ========== App Router Principal ==========
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  empresas: empresasRouter,
  dashboard: dashboardRouter,
  financeiro: financeiroRouter,
  rh: rhRouter,
  alertas: alertasRouter,
  contasBancarias: contasBancariasRouter,
  chatbot: chatbotRouter,
});

export type AppRouter = typeof appRouter;
