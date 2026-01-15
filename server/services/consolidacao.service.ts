import { getDb } from "../db";
import { empresas, contas, fluxoCaixa, funcionarios, impostos, indicadoresKpi } from "../../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

/**
 * Interface para dados consolidados de uma empresa
 */
export interface DadosConsolidadosEmpresa {
  empresaId: number;
  nomeFantasia: string;
  cnpj: string;
  periodo: string; // YYYY-MM
  
  // ENTRADAS
  totalContasReceber: number;
  totalContasReceberRecebidas: number;
  totalFluxoEntradas: number;
  totalKpisFaturamento: number;
  totalEntradas: number;
  
  // SAÍDAS
  totalContasPagar: number;
  totalContasPagarPagas: number;
  totalFluxoSaidas: number;
  totalCustosFixos: number;
  totalCustosVariaveis: number;
  totalImpostos: number;
  totalCustosFuncionarios: number;
  totalSaidas: number;
  
  // RESULTADO
  saldoLiquido: number;
  statusFinanceiro: "Lucro" | "Prejuizo" | "Equilibrio";
  margemLucro: number; // percentual
  
  // DETALHES
  quantidadeContasReceber: number;
  quantidadeContasPagar: number;
  quantidadeFuncionarios: number;
  quantidadeImpostos: number;
}

/**
 * Converter string/Decimal para number
 */
function toNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value);
  if (value.toNumber) return value.toNumber(); // Decimal.js
  return 0;
}

/**
 * Consolidar dados financeiros de uma empresa para um período específico
 */
export async function consolidarDadosEmpresa(
  empresaId: number,
  mesAno: string // formato YYYY-MM
): Promise<DadosConsolidadosEmpresa> {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");

  // Obter informações da empresa
  const empresaList = await db.select().from(empresas).where(eq(empresas.id, empresaId)).limit(1);
  const empresa = empresaList[0];

  if (!empresa) {
    throw new Error(`Empresa com ID ${empresaId} não encontrada`);
  }

  // Calcular data de início e fim do mês
  const [ano, mes] = mesAno.split("-");
  const dataInicio = new Date(`${ano}-${mes}-01`);
  const dataFim = new Date(parseInt(ano), parseInt(mes), 0);

  // ============ ENTRADAS ============

  // 1. Contas a Receber
  const contasReceber = await db.select().from(contas).where(
    and(
      eq(contas.empresaId, empresaId),
      eq(contas.tipo, "Receber"),
      gte(contas.vencimento, dataInicio),
      lte(contas.vencimento, dataFim)
    )
  );

  const totalContasReceber = contasReceber.reduce(
    (sum: number, c: any) => sum + toNumber(c.valor),
    0
  );

  const totalContasReceberRecebidas = contasReceber
    .filter((c: any) => c.status === "Recebido")
    .reduce((sum: number, c: any) => sum + toNumber(c.valor), 0);

  // 2. Fluxo de Caixa - Entradas
  const fluxoEntradas = await db.select().from(fluxoCaixa).where(
    and(
      eq(fluxoCaixa.empresaId, empresaId),
      eq(fluxoCaixa.tipo, "Entrada"),
      gte(fluxoCaixa.data, dataInicio),
      lte(fluxoCaixa.data, dataFim)
    )
  );

  const totalFluxoEntradas = fluxoEntradas.reduce(
    (sum: number, f: any) => sum + toNumber(f.valor),
    0
  );

  // 3. KPIs - Faturamento Bruto
  const kpis = await db.select().from(indicadoresKpi).where(
    and(
      eq(indicadoresKpi.empresaId, empresaId),
      eq(indicadoresKpi.mesAno, mesAno)
    )
  );

  const totalKpisFaturamento = kpis.reduce(
    (sum: number, k: any) => sum + toNumber(k.faturamentoBruto),
    0
  );

  const totalEntradas = totalContasReceber + totalFluxoEntradas + totalKpisFaturamento;

  // ============ SAÍDAS ============

  // 1. Contas a Pagar
  const contasPagar = await db.select().from(contas).where(
    and(
      eq(contas.empresaId, empresaId),
      eq(contas.tipo, "Pagar"),
      gte(contas.vencimento, dataInicio),
      lte(contas.vencimento, dataFim)
    )
  );

  const totalContasPagar = contasPagar.reduce(
    (sum: number, c: any) => sum + toNumber(c.valor),
    0
  );

  const totalContasPagarPagas = contasPagar
    .filter((c: any) => c.status === "Pago")
    .reduce((sum: number, c: any) => sum + toNumber(c.valor), 0);

  // 2. Fluxo de Caixa - Saídas
  const fluxoSaidas = await db.select().from(fluxoCaixa).where(
    and(
      eq(fluxoCaixa.empresaId, empresaId),
      eq(fluxoCaixa.tipo, "Saida"),
      gte(fluxoCaixa.data, dataInicio),
      lte(fluxoCaixa.data, dataFim)
    )
  );

  const totalFluxoSaidas = fluxoSaidas.reduce(
    (sum: number, f: any) => sum + toNumber(f.valor),
    0
  );

  // 3. Custos Fixos e Variáveis (KPIs)
  const totalCustosFixos = kpis.reduce(
    (sum: number, k: any) => sum + toNumber(k.custosFixos),
    0
  );

  const totalCustosVariaveis = kpis.reduce(
    (sum: number, k: any) => sum + toNumber(k.custosVariaveis),
    0
  );

  // 4. Impostos
  const impostosList = await db.select().from(impostos).where(
    and(
      eq(impostos.empresaId, empresaId),
      eq(impostos.mesAno, mesAno)
    )
  );

  const totalImpostos = impostosList.reduce(
    (sum: number, i: any) => {
      const baseCalculo = toNumber(i.baseCalculo);
      const aliquota = toNumber(i.aliquota);
      return sum + (baseCalculo * aliquota / 100);
    },
    0
  );

  // 5. Custos de Funcionários
  const funcionariosList = await db.select().from(funcionarios).where(
    and(
      eq(funcionarios.empresaId, empresaId),
      eq(funcionarios.status, "Contratado")
    )
  );

  const totalCustosFuncionarios = funcionariosList.reduce(
    (sum: number, f: any) => sum + toNumber(f.salarioBase) + toNumber(f.beneficios),
    0
  );

  const totalSaidas = totalContasPagar + totalFluxoSaidas + totalCustosFixos + 
                      totalCustosVariaveis + totalImpostos + totalCustosFuncionarios;

  // ============ RESULTADO ============
  const saldoLiquido = totalEntradas - totalSaidas;
  const statusFinanceiro =
    saldoLiquido > 0 ? "Lucro" : saldoLiquido < 0 ? "Prejuizo" : "Equilibrio";
  const margemLucro = totalEntradas > 0 ? (saldoLiquido / totalEntradas) * 100 : 0;

  return {
    empresaId,
    nomeFantasia: empresa.nomeFantasia || empresa.razaoSocial || "",
    cnpj: empresa.cnpj,
    periodo: mesAno,
    
    // Entradas
    totalContasReceber,
    totalContasReceberRecebidas,
    totalFluxoEntradas,
    totalKpisFaturamento,
    totalEntradas,
    
    // Saídas
    totalContasPagar,
    totalContasPagarPagas,
    totalFluxoSaidas,
    totalCustosFixos,
    totalCustosVariaveis,
    totalImpostos,
    totalCustosFuncionarios,
    totalSaidas,
    
    // Resultado
    saldoLiquido,
    statusFinanceiro,
    margemLucro,
    
    // Detalhes
    quantidadeContasReceber: contasReceber.length,
    quantidadeContasPagar: contasPagar.length,
    quantidadeFuncionarios: funcionariosList.length,
    quantidadeImpostos: impostosList.length,
  };
}

/**
 * Consolidar dados de TODAS as empresas para um período
 */
export async function consolidarTodasEmpresas(
  mesAno: string
): Promise<DadosConsolidadosEmpresa[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");

  const empresasList = await db.select().from(empresas).where(eq(empresas.status, "Aberto"));

  const resultados: DadosConsolidadosEmpresa[] = [];

  for (const empresa of empresasList) {
    try {
      const dados = await consolidarDadosEmpresa(empresa.id, mesAno);
      resultados.push(dados);
    } catch (error) {
      console.error(`Erro ao consolidar empresa ${empresa.id}:`, error);
    }
  }

  return resultados;
}

/**
 * Obter resumo consolidado de todas as empresas
 */
export async function resumoConsolidado(mesAno: string) {
  const dados = await consolidarTodasEmpresas(mesAno);

  const totalEntradas = dados.reduce((sum: number, d) => sum + d.totalEntradas, 0);
  const totalSaidas = dados.reduce((sum: number, d) => sum + d.totalSaidas, 0);
  const saldoTotal = totalEntradas - totalSaidas;

  const empresasComLucro = dados.filter((d) => d.statusFinanceiro === "Lucro").length;
  const empresasComPrejuizo = dados.filter((d) => d.statusFinanceiro === "Prejuizo").length;
  const empresasEmEquilibrio = dados.filter((d) => d.statusFinanceiro === "Equilibrio").length;

  return {
    periodo: mesAno,
    totalEmpresas: dados.length,
    totalEntradas,
    totalSaidas,
    saldoTotal,
    margemGeral: totalEntradas > 0 ? (saldoTotal / totalEntradas) * 100 : 0,
    empresasComLucro,
    empresasComPrejuizo,
    empresasEmEquilibrio,
    detalhesPorEmpresa: dados,
  };
}
