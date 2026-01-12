import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";

// ========== CNPJ API Integration ==========
async function consultarCNPJ(cnpj: string) {
  const cnpjLimpo = cnpj.replace(/[^\d]/g, "");
  
  try {
    // Tentar BrasilAPI primeiro
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
    if (response.ok) {
      const data = await response.json();
      return {
        razaoSocial: data.razao_social || data.nome_fantasia,
        nomeFantasia: data.nome_fantasia,
        cnpj: data.cnpj,
        capitalSocial: data.capital_social ? parseFloat(data.capital_social) : null,
        cnae: data.cnae_fiscal_descricao,
        enderecoCompleto: `${data.logradouro}, ${data.numero} - ${data.bairro}`,
        cidade: data.municipio,
        estado: data.uf,
        telefone: data.ddd_telefone_1,
        email: data.email,
        dataAbertura: data.data_inicio_atividade,
        status: data.situacao_cadastral === "ATIVA" ? "Aberto" : "Fechado",
      };
    }
  } catch (error) {
    console.warn("BrasilAPI falhou, tentando ReceitaWS...");
  }

  try {
    // Fallback para ReceitaWS
    const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`);
    if (response.ok) {
      const data = await response.json();
      return {
        razaoSocial: data.nome,
        nomeFantasia: data.fantasia,
        cnpj: data.cnpj,
        capitalSocial: data.capital_social ? parseFloat(data.capital_social.replace(/[^\d,]/g, "").replace(",", ".")) : null,
        cnae: data.atividade_principal?.[0]?.text,
        enderecoCompleto: `${data.logradouro}, ${data.numero} - ${data.bairro}`,
        cidade: data.municipio,
        estado: data.uf,
        telefone: data.telefone,
        email: data.email,
        dataAbertura: data.abertura,
        status: data.situacao === "ATIVA" ? "Aberto" : "Fechado",
      };
    }
  } catch (error) {
    console.error("ReceitaWS também falhou:", error);
  }

  throw new Error("Não foi possível consultar o CNPJ");
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ========== EMPRESAS ==========
  empresas: router({
    list: protectedProcedure.query(async () => {
      return await db.getEmpresas();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getEmpresaById(input.id);
      }),

    consultarCNPJ: protectedProcedure
      .input(z.object({ cnpj: z.string() }))
      .mutation(async ({ input }) => {
        return await consultarCNPJ(input.cnpj);
      }),

    create: protectedProcedure
      .input(z.object({
        razaoSocial: z.string().optional(),
        nomeFantasia: z.string().optional(),
        cnpj: z.string(),
        capitalSocial: z.string().optional(),
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
      }))
      .mutation(async ({ input, ctx }) => {
        const empresa = await db.createEmpresa(input as any);
        
        // Criar alerta de novo registro
        await db.createAlerta({
          tipo: "NovoRegistro",
          severidade: "Info",
          titulo: "Nova Empresa Cadastrada",
          mensagem: `A empresa ${input.nomeFantasia || input.razaoSocial} foi cadastrada no sistema.`,
          entidadeTipo: "Empresa",
          entidadeId: empresa.id,
        });

        // Notificar CEO
        await notifyOwner({
          title: "Nova Empresa Cadastrada",
          content: `${input.nomeFantasia || input.razaoSocial} (CNPJ: ${input.cnpj}) foi adicionada ao sistema.`,
        });

        return empresa;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          razaoSocial: z.string().optional(),
          nomeFantasia: z.string().optional(),
          cnpj: z.string().optional(),
          capitalSocial: z.string().optional(),
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
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateEmpresa(input.id, input.data as any);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteEmpresa(input.id);
        return { success: true };
      }),
  }),

  // ========== KPIs ==========
  kpis: router({
    list: protectedProcedure.query(async () => {
      return await db.getIndicadoresKpi();
    }),

    listByEmpresa: protectedProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input }) => {
        return await db.getIndicadoresKpiByEmpresa(input.empresaId);
      }),

    create: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        mesAno: z.string(),
        faturamentoBruto: z.string(),
        impostos: z.string(),
        custosFixos: z.string(),
        custosVariaveis: z.string(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const kpi = await db.createIndicadorKpi(input as any);

        // Verificar margem negativa
        const faturamentoBruto = parseFloat(input.faturamentoBruto);
        const impostos = parseFloat(input.impostos);
        const custosFixos = parseFloat(input.custosFixos);
        const custosVariaveis = parseFloat(input.custosVariaveis);
        const faturamentoLiquido = faturamentoBruto - impostos;
        const lucro = faturamentoLiquido - custosFixos - custosVariaveis;
        const margem = (lucro / faturamentoBruto) * 100;

        if (margem < 0) {
          await db.createAlerta({
            tipo: "MargemNegativa",
            severidade: "Critico",
            titulo: "Margem Negativa Detectada",
            mensagem: `A empresa registrou margem de ${margem.toFixed(2)}% no período ${input.mesAno}.`,
            entidadeTipo: "KPI",
            entidadeId: kpi.id,
          });

          await notifyOwner({
            title: "⚠️ Alerta: Margem Negativa",
            content: `Margem de ${margem.toFixed(2)}% detectada no período ${input.mesAno}. Requer atenção imediata.`,
          });
        }

        return kpi;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          mesAno: z.string().optional(),
          faturamentoBruto: z.string().optional(),
          impostos: z.string().optional(),
          custosFixos: z.string().optional(),
          custosVariaveis: z.string().optional(),
          observacoes: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateIndicadorKpi(input.id, input.data as any);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteIndicadorKpi(input.id);
        return { success: true };
      }),
  }),

  // ========== CONTAS ==========
  contas: router({
    list: protectedProcedure.query(async () => {
      return await db.getContas();
    }),

    pendentes: protectedProcedure.query(async () => {
      return await db.getContasPendentes();
    }),

    create: protectedProcedure
      .input(z.object({
        tipo: z.enum(["Pagar", "Receber"]),
        empresaId: z.number().optional(),
        descricao: z.string(),
        categoria: z.string().optional(),
        valor: z.string(),
        vencimento: z.string(),
        status: z.enum(["Pendente", "Pago", "Recebido", "Atrasado", "Cancelado"]).optional(),
        prioridade: z.enum(["Baixa", "Media", "Alta"]).optional(),
        dataPagamento: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const conta = await db.createConta(input as any);

        // Verificar vencimento próximo (7 dias)
        const vencimento = new Date(input.vencimento);
        const hoje = new Date();
        const diasRestantes = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

        if (diasRestantes <= 7 && diasRestantes >= 0 && input.status !== "Pago" && input.status !== "Recebido") {
          await db.createAlerta({
            tipo: "Vencimento",
            severidade: diasRestantes <= 3 ? "Critico" : "Aviso",
            titulo: "Vencimento Próximo",
            mensagem: `${input.descricao} vence em ${diasRestantes} dias (${input.vencimento}).`,
            entidadeTipo: "Conta",
            entidadeId: conta.id,
          });

          if (diasRestantes <= 3) {
            await notifyOwner({
              title: "🔔 Vencimento Urgente",
              content: `${input.descricao} vence em ${diasRestantes} dias. Valor: R$ ${input.valor}`,
            });
          }
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
          status: z.enum(["Pendente", "Pago", "Recebido", "Atrasado", "Cancelado"]).optional(),
          prioridade: z.enum(["Baixa", "Media", "Alta"]).optional(),
          dataPagamento: z.string().optional(),
          observacoes: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateConta(input.id, input.data as any);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteConta(input.id);
        return { success: true };
      }),
  }),

  // ========== FUNCIONÁRIOS ==========
  funcionarios: router({
    list: protectedProcedure.query(async () => {
      return await db.getFuncionarios();
    }),

    ativos: protectedProcedure.query(async () => {
      return await db.getFuncionariosAtivos();
    }),

    create: protectedProcedure
      .input(z.object({
        nome: z.string(),
        cpf: z.string(),
        empresaId: z.number().optional(),
        cargo: z.string().optional(),
        tipoContrato: z.enum(["CLT", "PJ", "Estagiario", "Temporario"]),
        salarioBase: z.string(),
        beneficios: z.string().optional(),
        dataAdmissao: z.string().optional(),
        diaPagamento: z.number().optional(),
        status: z.enum(["Contratado", "Demitido", "Afastado", "Ferias"]).optional(),
        observacoes: z.string().optional(),
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
          empresaId: z.number().optional(),
          cargo: z.string().optional(),
          tipoContrato: z.enum(["CLT", "PJ", "Estagiario", "Temporario"]).optional(),
          salarioBase: z.string().optional(),
          beneficios: z.string().optional(),
          dataAdmissao: z.string().optional(),
          diaPagamento: z.number().optional(),
          status: z.enum(["Contratado", "Demitido", "Afastado", "Ferias"]).optional(),
          observacoes: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateFuncionario(input.id, input.data as any);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteFuncionario(input.id);
        return { success: true };
      }),
  }),

  // ========== FLUXO DE CAIXA ==========
  fluxoCaixa: router({
    list: protectedProcedure.query(async () => {
      return await db.getFluxoCaixa();
    }),

    create: protectedProcedure
      .input(z.object({
        data: z.string(),
        tipo: z.enum(["Entrada", "Saida"]),
        empresaId: z.number().optional(),
        descricao: z.string(),
        categoria: z.string().optional(),
        valor: z.string(),
        metodoPagamento: z.string().optional(),
        referencia: z.string().optional(),
        observacoes: z.string().optional(),
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
          empresaId: z.number().optional(),
          descricao: z.string().optional(),
          categoria: z.string().optional(),
          valor: z.string().optional(),
          metodoPagamento: z.string().optional(),
          referencia: z.string().optional(),
          observacoes: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateFluxoCaixa(input.id, input.data as any);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteFluxoCaixa(input.id);
        return { success: true };
      }),
  }),

  // ========== IMPOSTOS ==========
  impostos: router({
    list: protectedProcedure.query(async () => {
      return await db.getImpostos();
    }),

    create: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        tipoImposto: z.string(),
        mesAno: z.string(),
        baseCalculo: z.string(),
        aliquota: z.string(),
        vencimento: z.string(),
        status: z.enum(["Pendente", "Pago", "Atrasado"]).optional(),
        dataPagamento: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createImposto(input as any);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          tipoImposto: z.string().optional(),
          mesAno: z.string().optional(),
          baseCalculo: z.string().optional(),
          aliquota: z.string().optional(),
          vencimento: z.string().optional(),
          status: z.enum(["Pendente", "Pago", "Atrasado"]).optional(),
          dataPagamento: z.string().optional(),
          observacoes: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateImposto(input.id, input.data as any);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteImposto(input.id);
        return { success: true };
      }),
  }),

  // ========== DOCUMENTOS ==========
  documentos: router({
    upload: protectedProcedure
      .input(z.object({
        nome: z.string(),
        tipo: z.string(),
        tamanho: z.number(),
        base64: z.string(),
        entidadeTipo: z.enum(["Empresa", "Conta", "Funcionario", "FluxoCaixa", "Imposto"]),
        entidadeId: z.number(),
        descricao: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const fileKey = `documentos/${input.entidadeTipo.toLowerCase()}/${input.entidadeId}/${nanoid()}-${input.nome}`;
        
        const { url } = await storagePut(fileKey, buffer, input.tipo);

        return await db.createDocumento({
          nome: input.nome,
          tipo: input.tipo,
          tamanho: input.tamanho,
          fileKey,
          url,
          entidadeTipo: input.entidadeTipo,
          entidadeId: input.entidadeId,
          descricao: input.descricao,
          uploadedBy: ctx.user.id,
        });
      }),

    listByEntidade: protectedProcedure
      .input(z.object({
        entidadeTipo: z.string(),
        entidadeId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getDocumentosByEntidade(input.entidadeTipo, input.entidadeId);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteDocumento(input.id);
        return { success: true };
      }),
  }),

  // ========== ALERTAS ==========
  alertas: router({
    list: protectedProcedure.query(async () => {
      return await db.getAlertas();
    }),

    naoLidos: protectedProcedure.query(async () => {
      return await db.getAlertasNaoLidos();
    }),

    marcarLido: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.marcarAlertaComoLido(input.id);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAlerta(input.id);
        return { success: true };
      }),
  }),

  // ========== DASHBOARD ==========
  dashboard: router({
    getData: protectedProcedure.query(async () => {
      return await db.getDashboardData();
    }),
  }),

  // ========== CHATBOT IA ==========
  chatbot: router({
    chat: protectedProcedure
      .input(z.object({
        message: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Buscar dados do contexto
        const empresas = await db.getEmpresas();
        const kpis = await db.getIndicadoresKpi();
        const contas = await db.getContas();
        const funcionarios = await db.getFuncionarios();
        const dashboardData = await db.getDashboardData();

        const contexto = `
Você é um assistente financeiro especializado em análise empresarial. Aqui estão os dados atuais:

EMPRESAS CADASTRADAS:
${empresas.map(e => `- ${e.nomeFantasia || e.razaoSocial} (CNPJ: ${e.cnpj})`).join("\n")}

INDICADORES FINANCEIROS:
${JSON.stringify(kpis.slice(0, 10), null, 2)}

DASHBOARD CEO:
- Faturamento do Mês: R$ ${dashboardData?.faturamentoMes?.toFixed(2) || 0}
- Total de Despesas: R$ ${dashboardData?.totalDespesas?.toFixed(2) || 0}
- Lucro/Prejuízo: R$ ${dashboardData?.lucroPrejuizo?.toFixed(2) || 0}
- Saldo em Caixa: R$ ${dashboardData?.saldoCaixa?.toFixed(2) || 0}
- Funcionários Ativos: ${dashboardData?.funcionariosAtivos || 0}

CONTAS PENDENTES:
${contas.filter(c => c.status === "Pendente").slice(0, 5).map(c => `- ${c.descricao}: R$ ${c.valor} (Vencimento: ${c.vencimento})`).join("\n")}

Responda à pergunta do usuário de forma clara, objetiva e com insights acionáveis.
`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: contexto },
            { role: "user", content: input.message },
          ],
        });

        return {
          response: response.choices[0]?.message?.content || "Desculpe, não consegui processar sua pergunta.",
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
