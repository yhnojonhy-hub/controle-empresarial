import cron from "node-cron";
import { logger } from "../logger";
import { executarVerificacaoCompleta } from "../services/alert-automation.service";

/**
 * Scheduler de Alertas Automáticos
 * Executa verificação diária de contas vencidas e impostos próximos
 */

let schedulerAtivo = false;

/**
 * Inicializa o scheduler de alertas automáticos
 * Roda diariamente às 8h (horário do servidor)
 */
export function iniciarScheduler() {
  if (schedulerAtivo) {
    logger.warn("Scheduler de alertas já está ativo");
    return;
  }

  // Agendar para rodar todos os dias às 8h
  // Formato cron: segundo minuto hora dia mês dia-da-semana
  // 0 0 8 * * * = às 8:00:00 todos os dias
  const job = cron.schedule("0 0 8 * * *", async () => {
    logger.info("=== Iniciando verificação automática agendada de alertas ===");
    
    try {
      const resultado = await executarVerificacaoCompleta();
      
      logger.info("Verificação automática agendada concluída com sucesso", {
        contasVencidas: resultado.contasVencidas,
        impostosProximos: resultado.impostosProximos,
        alertasGerados: resultado.alertasGerados,
        erros: resultado.erros.length,
      });

      // Se houve erros, logar detalhes
      if (resultado.erros.length > 0) {
        logger.warn("Erros durante verificação automática", {
          erros: resultado.erros,
        });
      }
    } catch (error) {
      logger.error("Erro crítico durante verificação automática agendada", {
        error,
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }, {
    timezone: "America/Sao_Paulo", // Horário de Brasília
  });

  job.start();
  schedulerAtivo = true;

  logger.info("Scheduler de alertas automáticos iniciado", {
    horario: "08:00 (America/Sao_Paulo)",
    frequencia: "Diária",
  });
}

/**
 * Para o scheduler de alertas automáticos
 */
export function pararScheduler() {
  if (!schedulerAtivo) {
    logger.warn("Scheduler de alertas não está ativo");
    return;
  }

  schedulerAtivo = false;
  logger.info("Scheduler de alertas automáticos parado");
}

/**
 * Verifica se o scheduler está ativo
 */
export function schedulerEstaAtivo(): boolean {
  return schedulerAtivo;
}
