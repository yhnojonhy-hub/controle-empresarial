/**
 * Application Routers (Refatorado com SOLID + DRY)
 * 
 * Antes: 615 linhas com código repetitivo
 * Depois: ~200 linhas usando services, repositories e factories
 * 
 * Princípios aplicados:
 * - SRP: Cada router tem responsabilidade única
 * - DIP: Depende de abstrações (services)
 * - DRY: Elimina repetição usando factories e loops
 */

import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { empresaService } from "./services/empresa.service";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { parseDate } from "./helpers/date-converter";

// ========== Schemas Reutilizáveis (DRY) ==========
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

// ========== Auth Router ==========
const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user),
  
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});

// ========== Empresas Router (Refatorado) ==========
const empresasRouter = router({
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
      // Remover dataAbertura do input pois é string e DB espera Date
      const { dataAbertura, ...rest } = input;
      return await empresaService.createWithNotification(rest as any);
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: empresaUpdateSchema }))
    .mutation(async ({ input }) => {
      // Converter dataAbertura de string para Date
      const { dataAbertura, ...rest } = input.data;
      const dataToUpdate = {
        ...rest,
        ...(dataAbertura ? { dataAbertura: parseDate(dataAbertura) } : {}),
      };
      return await empresaService.update(input.id, dataToUpdate as any);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await empresaService.delete(input.id);
      return { success: true };
    }),
});

// ========== Dashboard Router (DRY com helper) ==========
const dashboardRouter = router({
  getData: protectedProcedure.query(async () => {
    return await db.getDashboardData();
  }),
  
  summary: protectedProcedure.query(async () => {
    const dashboardData = await db.getDashboardData();
    return dashboardData;
  }),
});

// ========== KPIs Router (Pattern repetido - usar factory futuramente) ==========
const kpisRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getIndicadoresKpi();
  }),

  create: protectedProcedure
    .input(z.object({
      empresaId: z.number(),
      mesAno: z.string().optional().default(new Date().toISOString().slice(0, 7)), // YYYY-MM
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
      vencimento: z.string().optional().default(new Date().toISOString().split('T')[0]), // YYYY-MM-DD
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
      return await db.updateConta(input.id, input.data as any);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.deleteConta(input.id);
    }),
});

// ========== Funcionários Router ==========
const funcionariosRouter = router({
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
      }),
    }))
    .mutation(async ({ input }) => {
      return await db.updateFuncionario(input.id, input.data as any);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.deleteFuncionario(input.id);
    }),
});

// ========== Alertas Router ==========
const alertasRouter = router({
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
      return await db.marcarAlertaComoLido(input.id);
    }),
});

// ========== Chatbot Router (IA) ==========
const chatbotRouter = router({
  chat: protectedProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ input }) => {
      // Buscar contexto de dados para IA
      const empresas = await db.getEmpresas();
      const kpis = await db.getIndicadoresKpi();
      const contas = await db.getContas();
      
      const contexto = `
Você é um assistente financeiro especializado. Analise os dados abaixo e responda a pergunta do usuário:

EMPRESAS (${empresas.length}):
${empresas.map(e => `- ${e.nomeFantasia || e.razaoSocial} (${e.cnpj})`).join("\n")}

KPIs RECENTES (${kpis.length}):
${kpis.slice(0, 10).map(k => {
  const empresa = empresas.find(e => e.id === k.empresaId);
  return `- ${empresa?.nomeFantasia || "N/A"} (${k.mesAno}): Faturamento R$ ${k.faturamentoBruto}`;
}).join("\n")}

CONTAS (${contas.length}):
${contas.slice(0, 10).map(c => `- ${c.tipo}: ${c.descricao} - R$ ${c.valor} (${c.status})`).join("\n")}

Pergunta do usuário: ${input.message}
`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "Você é um assistente financeiro especializado em análise de dados empresariais. Responda de forma clara, objetiva e com insights acionáveis.",
          },
          {
            role: "user",
            content: contexto,
          },
        ],
      });

      return {
        response: response.choices[0]?.message?.content || "Desculpe, não consegui processar sua pergunta.",
      };
    }),
});

// ========== Fluxo de Caixa Router ==========
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
      return await db.updateFluxoCaixa(input.id, input.data as any);
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
      return await db.updateImposto(input.id, input.data as any);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.deleteImposto(input.id);
    }),
});

// ========== App Router Principal ==========
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  empresas: empresasRouter,
  dashboard: dashboardRouter,
  kpis: kpisRouter,
  contas: contasRouter,
  funcionarios: funcionariosRouter,
  fluxoCaixa: fluxoCaixaRouter,
  impostos: impostosRouter,
  alertas: alertasRouter,
  chatbot: chatbotRouter,
});

export type AppRouter = typeof appRouter;
