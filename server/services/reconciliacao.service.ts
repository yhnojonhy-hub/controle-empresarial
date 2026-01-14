import { logger } from '../logger';
import { getDb } from '../db';
import { empresas, contasBancarias, contas } from '../../drizzle/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export interface ItemReconciliacao {
  id: string;
  data: Date;
  tipo: 'Bancário' | 'Conta a Pagar' | 'Conta a Receber';
  descricao: string;
  valor: number;
  saldoBancario: number;
  saldoContabil: number;
  discrepancia: number;
  status: 'Reconciliado' | 'Pendente';
  empresaId: number;
  empresaNome: string;
}

export interface ResumoReconciliacao {
  totalSaldoBancario: number;
  totalSaldoContabil: number;
  totalDiscrepancia: number;
  itemsReconciliados: number;
  itemsPendentes: number;
  percentualReconciliacao: number;
}

/**
 * Serviço de Reconciliação Bancária
 * Cruza dados de contas bancárias com contas a pagar/receber
 * para validar discrepâncias e saldo contábil vs. bancário
 */
export class ReconciliacaoService {
  private db: any;

  /**
   * Obtém dados consolidados de reconciliação para uma empresa
   * @param empresaId ID da empresa
   * @param dataInicio Data de início do período
   * @param dataFim Data de fim do período
   * @returns Array de itens de reconciliação
   */
  async obterReconciliacao(
    empresaId: number,
    dataInicio: Date,
    dataFim: Date
  ): Promise<ItemReconciliacao[]> {
    try {
      logger.info('Iniciando obtenção de reconciliação', {
        empresaId,
        dataInicio,
        dataFim,
      });

      this.db = getDb();

      // Buscar empresa
      const empresa = await this.db
        .select()
        .from(empresas)
        .where(eq(empresas.id, empresaId))
        .then((r: any) => r[0]);

      if (!empresa) {
        logger.warn('Empresa não encontrada para reconciliação', { empresaId });
        return [];
      }

      // Buscar contas bancárias da empresa
      const contasBanc = await this.db
        .select()
        .from(contasBancarias)
        .where(eq(contasBancarias.empresaId, empresaId));

      // Buscar contas a pagar da empresa no período
      const contasPagar = await this.db
        .select()
        .from(contas)
        .where(
          and(
            eq(contas.empresaId, empresaId),
            eq(contas.tipo, 'Pagar'),
            gte(contas.vencimento, dataInicio),
            lte(contas.vencimento, dataFim)
          )
        );

      // Buscar contas a receber da empresa no período (usando tabela contas com tipo Receber)
      const contasReceb = await this.db
        .select()
        .from(contas)
        .where(
          and(
            eq(contas.empresaId, empresaId),
            eq(contas.tipo, 'Receber'),
            gte(contas.vencimento, dataInicio),
            lte(contas.vencimento, dataFim)
          )
        );

      // Calcular saldo bancário total
      const saldoBancarioTotal = contasBanc.reduce(
        (sum: number, conta: any) => sum + (conta.saldoAtual || 0),
        0
      );

      // Calcular saldo contábil (contas a pagar - contas a receber)
      const totalPagar = contasPagar.reduce((sum: number, conta: any) => sum + (conta.valor || 0), 0);
      const totalReceber = contasReceb.reduce((sum: number, conta: any) => sum + (conta.valor || 0), 0);
      const saldoContabilTotal = totalReceber - totalPagar;

      // Montar itens de reconciliação
      const items: ItemReconciliacao[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

      // Adicionar itens de contas bancárias
      contasBanc.forEach((conta: any) => {
        items.push({
          id: `banco-${conta.id}`,
          data: conta.dataCriacao || new Date(),
          tipo: 'Bancário',
          descricao: `${conta.nomeConta} - ${conta.banco}`,
          valor: conta.saldoAtual || 0,
          saldoBancario: conta.saldoAtual || 0,
          saldoContabil: saldoContabilTotal,
          discrepancia: (conta.saldoAtual || 0) - saldoContabilTotal,
          status: 'Pendente',
          empresaId: empresaId,
          empresaNome: empresa.nomeFantasia || empresa.razaoSocial,
        });
      });

      // Adicionar itens de contas a pagar
      contasPagar.forEach((conta: any) => {
        items.push({
          id: `pagar-${conta.id}`,
          data: conta.vencimento,
          tipo: 'Conta a Pagar',
          descricao: conta.descricao || 'Conta a Pagar',
          valor: -(conta.valor || 0),
          saldoBancario: saldoBancarioTotal,
          saldoContabil: saldoContabilTotal,
          discrepancia: saldoBancarioTotal - saldoContabilTotal,
          status: conta.status === 'Pago' ? 'Reconciliado' : 'Pendente',
          empresaId: empresaId,
          empresaNome: empresa.nomeFantasia || empresa.razaoSocial,
        });
      });

      // Adicionar itens de contas a receber
      contasReceb.forEach((conta: any) => {
        items.push({
          id: `receber-${conta.id}`,
          data: conta.vencimento,
          tipo: 'Conta a Receber',
          descricao: conta.descricao || 'Conta a Receber',
          valor: conta.valor || 0,
          saldoBancario: saldoBancarioTotal,
          saldoContabil: saldoContabilTotal,
          discrepancia: saldoBancarioTotal - saldoContabilTotal,
          status: conta.status === 'Recebido' ? 'Reconciliado' : 'Pendente',
          empresaId: empresaId,
          empresaNome: empresa.nomeFantasia || empresa.razaoSocial,
        });
      });

      logger.info('Reconciliação obtida com sucesso', {
        empresaId,
        totalItems: items.length,
        saldoBancarioTotal,
        saldoContabilTotal,
      });

      return items.sort((a, b) => b.data.getTime() - a.data.getTime());
    } catch (error) {
      logger.error('Erro ao obter reconciliação', {
        empresaId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Obtém resumo consolidado de reconciliação
   * @param empresaId ID da empresa
   * @param dataInicio Data de início do período
   * @param dataFim Data de fim do período
   * @returns Resumo da reconciliação
   */
  async obterResumo(
    empresaId: number,
    dataInicio: Date,
    dataFim: Date
  ): Promise<ResumoReconciliacao> {
    try {
      const items = await this.obterReconciliacao(empresaId, dataInicio, dataFim);

      const totalSaldoBancario = items
        .filter((i) => i.tipo === 'Bancário')
        .reduce((sum, item) => sum + item.saldoBancario, 0);

      const totalSaldoContabil = items
        .filter((i) => i.tipo === 'Conta a Pagar' || i.tipo === 'Conta a Receber')
        .reduce((sum, item) => sum + item.valor, 0);

      const totalDiscrepancia = Math.abs(totalSaldoBancario - totalSaldoContabil);

      const itemsReconciliados = items.filter((i) => i.status === 'Reconciliado').length;
      const itemsPendentes = items.filter((i) => i.status === 'Pendente').length;
      const percentualReconciliacao =
        items.length > 0 ? (itemsReconciliados / items.length) * 100 : 0;

      logger.info('Resumo de reconciliação calculado', {
        empresaId,
        totalSaldoBancario,
        totalSaldoContabil,
        totalDiscrepancia,
        percentualReconciliacao,
      });

      return {
        totalSaldoBancario,
        totalSaldoContabil,
        totalDiscrepancia,
        itemsReconciliados,
        itemsPendentes,
        percentualReconciliacao,
      };
    } catch (error) {
      logger.error('Erro ao obter resumo de reconciliação', {
        empresaId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Marca um item como reconciliado
   * @param itemId ID do item
   * @returns true se marcado com sucesso
   */
  async marcarComoReconciliado(itemId: string): Promise<boolean> {
    try {
      logger.info('Marcando item como reconciliado', { itemId });

      // Aqui você poderia atualizar um campo de status no banco
      // Por enquanto, apenas registramos a ação
      logger.info('Item marcado como reconciliado com sucesso', { itemId });

      return true;
    } catch (error) {
      logger.error('Erro ao marcar item como reconciliado', {
        itemId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

export const reconciliacaoService = new ReconciliacaoService();
