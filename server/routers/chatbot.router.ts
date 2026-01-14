/**
 * Chatbot Router
 * 
 * Responsabilidade: Gerenciar interações com IA
 * Princípios: SRP, DRY, SOLID
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import * as db from "../db";

// ========== Chatbot Router ==========
export const chatbotRouter = router({
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
