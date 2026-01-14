import { logger } from "../logger";
import * as db from "../db";
// Tipos inline para evitar dependência circular
type TipoAlerta = "NovoRegistro" | "Vencimento" | "MargemNegativa" | "MetaNaoAtingida" | "Sistema";
type SeveridadeAlerta = "Info" | "Aviso" | "Critico";

/**
 * Serviço de Automação de Alertas
 * Responsável por verificar contas vencidas e impostos próximos do vencimento
 * e gerar alertas automáticos no sistema
 */

interface AlertaAutomaticoResult {
  contasVencidas: number;
  impostosProximos: number;
  alertasGerados: number;
  erros: string[];
}

/**
 * Verifica se já existe um alerta para uma entidade específica
 * Para evitar duplicação de alertas
 */
async function alertaJaExiste(
  tipo: TipoAlerta,
  entidadeTipo: string,
  entidadeId: number
): Promise<boolean> {
  try {
    const alertas = await db.getAlertas();
    return alertas.some(
      (a) =>
        a.tipo === tipo &&
        a.entidadeTipo === entidadeTipo &&
        a.entidadeId === entidadeId &&
        !a.lido // Apenas alertas não lidos
    );
  } catch (error) {
    logger.error("Erro ao verificar existência de alerta", { error });
    return false;
  }
}

/**
 * Verifica contas a pagar vencidas e gera alertas
 */
export async function verificarContasVencidas(): Promise<{
  verificadas: number;
  alertasGerados: number;
  erros: string[];
}> {
  const erros: string[] = [];
  let alertasGerados = 0;

  try {
    logger.info("Iniciando verificação de contas vencidas");

    // Buscar todas as contas pendentes
    const contas = await db.getContas();
    const contasPendentes = contas.filter((c) => c.status === "Pendente");

    logger.info(`Encontradas ${contasPendentes.length} contas pendentes para verificação`);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    for (const conta of contasPendentes) {
      try {
        const dataVencimento = new Date(conta.vencimento);
        dataVencimento.setHours(0, 0, 0, 0);

        // Verificar se está vencida
        if (dataVencimento < hoje) {
          // Calcular dias de atraso
          const diasAtraso = Math.floor(
            (hoje.getTime() - dataVencimento.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Verificar se já existe alerta para esta conta
          const jaExiste = await alertaJaExiste("Vencimento", "Conta", conta.id);

          if (!jaExiste) {
            // Definir severidade baseada em dias de atraso
            let severidade: SeveridadeAlerta;
            if (diasAtraso >= 8) {
              severidade = "Critico";
            } else if (diasAtraso >= 1) {
              severidade = "Aviso";
            } else {
              severidade = "Info";
            }

            // Buscar nome da empresa
            const empresas = await db.getEmpresas();
            const empresa = empresas.find((e: any) => e.id === conta.empresaId);
            const nomeEmpresa = empresa?.nomeFantasia || empresa?.razaoSocial || "Empresa";

            // Criar alerta
            await db.createAlerta({
              tipo: "Vencimento",
              severidade,
              titulo: `Conta Vencida: ${conta.descricao}`,
              mensagem: `A conta "${conta.descricao}" da empresa ${nomeEmpresa} está vencida há ${diasAtraso} dia(s). Valor: R$ ${Number(conta.valor).toFixed(2)}. Vencimento: ${dataVencimento.toLocaleDateString("pt-BR")}.`,
              entidadeTipo: "Conta",
              entidadeId: conta.id,
              lido: false,
            });

            alertasGerados++;
            logger.info(`Alerta gerado para conta vencida`, {
              contaId: conta.id,
              diasAtraso,
              severidade,
            });
          }
        }
      } catch (error) {
        const mensagem = `Erro ao processar conta ${conta.id}: ${error}`;
        erros.push(mensagem);
        logger.error(mensagem, { error, contaId: conta.id });
      }
    }

    logger.info("Verificação de contas vencidas concluída", {
      verificadas: contasPendentes.length,
      alertasGerados,
      erros: erros.length,
    });

    return {
      verificadas: contasPendentes.length,
      alertasGerados,
      erros,
    };
  } catch (error) {
    const mensagem = `Erro geral na verificação de contas vencidas: ${error}`;
    erros.push(mensagem);
    logger.error(mensagem, { error });
    return { verificadas: 0, alertasGerados: 0, erros };
  }
}

/**
 * Verifica impostos próximos do vencimento e gera alertas
 */
export async function verificarImpostosProximos(): Promise<{
  verificados: number;
  alertasGerados: number;
  erros: string[];
}> {
  const erros: string[] = [];
  let alertasGerados = 0;

  try {
    logger.info("Iniciando verificação de impostos próximos do vencimento");

    // Buscar todos os impostos pendentes
    const impostos = await db.getImpostos();
    const impostosPendentes = impostos.filter((i: any) => i.status === "Pendente");

    logger.info(`Encontrados ${impostosPendentes.length} impostos pendentes para verificação`);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Data limite: 7 dias à frente
    const dataLimite = new Date(hoje);
    dataLimite.setDate(dataLimite.getDate() + 7);

    for (const imposto of impostosPendentes) {
      try {
        const dataVencimento = new Date(imposto.vencimento);
        dataVencimento.setHours(0, 0, 0, 0);

        // Verificar se vence nos próximos 7 dias
        if (dataVencimento >= hoje && dataVencimento <= dataLimite) {
          // Calcular dias restantes
          const diasRestantes = Math.floor(
            (dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Verificar se já existe alerta para este imposto
          const jaExiste = await alertaJaExiste("Vencimento", "Imposto", imposto.id);

          if (!jaExiste) {
            // Definir severidade baseada em dias restantes
            let severidade: SeveridadeAlerta;
            if (diasRestantes <= 2) {
              severidade = "Critico";
            } else if (diasRestantes <= 4) {
              severidade = "Aviso";
            } else {
              severidade = "Info";
            }

            // Buscar nome da empresa
            const empresas = await db.getEmpresas();
            const empresa = empresas.find((e: any) => e.id === imposto.empresaId);
            const nomeEmpresa = empresa?.nomeFantasia || empresa?.razaoSocial || "Empresa";

            // Criar alerta
            await db.createAlerta({
              tipo: "Vencimento",
              severidade,
              titulo: `Imposto Próximo do Vencimento: ${imposto.tipoImposto}`,
              mensagem: `O imposto ${imposto.tipoImposto} da empresa ${nomeEmpresa} vence em ${diasRestantes} dia(s). Base de Cálculo: R$ ${Number(imposto.baseCalculo).toFixed(2)}. Vencimento: ${dataVencimento.toLocaleDateString("pt-BR")}.`,
              entidadeTipo: "Imposto",
              entidadeId: imposto.id,
              lido: false,
            });

            alertasGerados++;
            logger.info(`Alerta gerado para imposto próximo do vencimento`, {
              impostoId: imposto.id,
              diasRestantes,
              severidade,
            });
          }
        }
      } catch (error) {
        const mensagem = `Erro ao processar imposto ${imposto.id}: ${error}`;
        erros.push(mensagem);
        logger.error(mensagem, { error, impostoId: imposto.id });
      }
    }

    logger.info("Verificação de impostos próximos concluída", {
      verificados: impostosPendentes.length,
      alertasGerados,
      erros: erros.length,
    });

    return {
      verificados: impostosPendentes.length,
      alertasGerados,
      erros,
    };
  } catch (error) {
    const mensagem = `Erro geral na verificação de impostos próximos: ${error}`;
    erros.push(mensagem);
    logger.error(mensagem, { error });
    return { verificados: 0, alertasGerados: 0, erros };
  }
}

/**
 * Executa verificação completa de alertas automáticos
 */
export async function executarVerificacaoCompleta(): Promise<AlertaAutomaticoResult> {
  logger.info("=== Iniciando verificação completa de alertas automáticos ===");

  const inicio = Date.now();

  // Verificar contas vencidas
  const resultadoContas = await verificarContasVencidas();

  // Verificar impostos próximos
  const resultadoImpostos = await verificarImpostosProximos();

  const duracao = Date.now() - inicio;

  const resultado: AlertaAutomaticoResult = {
    contasVencidas: resultadoContas.verificadas,
    impostosProximos: resultadoImpostos.verificados,
    alertasGerados: resultadoContas.alertasGerados + resultadoImpostos.alertasGerados,
    erros: [...resultadoContas.erros, ...resultadoImpostos.erros],
  };

  logger.info("=== Verificação completa de alertas automáticos concluída ===", {
    ...resultado,
    duracaoMs: duracao,
  });

  return resultado;
}
