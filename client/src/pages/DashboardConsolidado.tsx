import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DashboardConsolidado() {
  const [activeTab, setActiveTab] = useState("consolidado");
  const [mesAno, setMesAno] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  });
  const [selectedEmpresa, setSelectedEmpresa] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "Todos" | "Lucro" | "Prejuizo" | "Equilibrio"
  >("Todos");

  // Buscar dados consolidados
  const {
    data: resumo,
    isLoading,
    error,
  } = trpc.dashboard.resumoConsolidado.useQuery(
    { mesAno },
    { enabled: !!mesAno }
  );

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const formatarPercentual = (valor: number) => {
    return `${valor.toFixed(2)}%`;
  };

  const getMesNome = (mesAno: string) => {
    const [ano, mes] = mesAno.split("-");
    const data = new Date(parseInt(ano), parseInt(mes) - 1);
    return format(data, "MMMM 'de' yyyy", { locale: ptBR });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-gray-600">Carregando dados consolidados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Erro ao Carregar Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Dashboard Consolidado
        </h1>
        <p className="text-slate-600">
          Visão integrada do desempenho financeiro de todas as empresas
        </p>
      </div>

      {/* Seletor de Período */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Selecionar Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mês/Ano
              </label>
              <Input
                type="month"
                value={mesAno}
                onChange={e => setMesAno(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <div className="text-sm text-slate-600">{getMesNome(mesAno)}</div>
          </div>
        </CardContent>
      </Card>

      {resumo && (
        <>
          {/* Resumo Geral */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total de Entradas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Total de Entradas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatarMoeda(resumo.totalEntradas)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {resumo.detalhesPorEmpresa.length} empresa(s)
                </p>
              </CardContent>
            </Card>

            {/* Total de Saídas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Total de Saídas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatarMoeda(resumo.totalSaidas)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Custos consolidados
                </p>
              </CardContent>
            </Card>

            {/* Saldo Total */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  Saldo Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${resumo.saldoTotal >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatarMoeda(resumo.saldoTotal)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Margem: {formatarPercentual(resumo.margemGeral)}
                </p>
              </CardContent>
            </Card>

            {/* Status Geral */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Status Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Com Lucro:</span>
                    <Badge className="bg-green-100 text-green-800">
                      {resumo.empresasComLucro}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                      Com Prejuízo:
                    </span>
                    <Badge className="bg-red-100 text-red-800">
                      {resumo.empresasComPrejuizo}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                      Em Equilíbrio:
                    </span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {resumo.empresasEmEquilibrio}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Empresas */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por Empresa</CardTitle>
              <CardDescription>
                Análise financeira detalhada de cada empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">
                        Empresa
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">
                        Entradas
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">
                        Saídas
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">
                        Saldo
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">
                        Margem
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumo.detalhesPorEmpresa.map(empresa => (
                      <tr
                        key={empresa.empresaId}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-slate-900">
                              {empresa.nomeFantasia}
                            </p>
                            <p className="text-xs text-slate-500">
                              {empresa.cnpj}
                            </p>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-green-600 font-medium">
                          {formatarMoeda(empresa.totalEntradas)}
                        </td>
                        <td className="text-right py-3 px-4 text-red-600 font-medium">
                          {formatarMoeda(empresa.totalSaidas)}
                        </td>
                        <td
                          className={`text-right py-3 px-4 font-bold ${empresa.saldoLiquido >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatarMoeda(empresa.saldoLiquido)}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span
                            className={`font-medium ${empresa.margemLucro >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatarPercentual(empresa.margemLucro)}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          {empresa.statusFinanceiro === "Lucro" && (
                            <Badge className="bg-green-100 text-green-800 flex items-center justify-center gap-1 w-fit mx-auto">
                              <CheckCircle className="h-3 w-3" />
                              Lucro
                            </Badge>
                          )}
                          {empresa.statusFinanceiro === "Prejuizo" && (
                            <Badge className="bg-red-100 text-red-800 flex items-center justify-center gap-1 w-fit mx-auto">
                              <AlertCircle className="h-3 w-3" />
                              Prejuízo
                            </Badge>
                          )}
                          {empresa.statusFinanceiro === "Equilibrio" && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Equilíbrio
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Detalhes de Entradas e Saídas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Composição de Entradas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Composição de Entradas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resumo.detalhesPorEmpresa.map(empresa => (
                    <div
                      key={`entradas-${empresa.empresaId}`}
                      className="space-y-2"
                    >
                      <p className="font-medium text-slate-900">
                        {empresa.nomeFantasia}
                      </p>
                      <div className="ml-4 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Contas a Receber:
                          </span>
                          <span className="font-medium">
                            {formatarMoeda(empresa.totalContasReceber)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Fluxo de Caixa:
                          </span>
                          <span className="font-medium">
                            {formatarMoeda(empresa.totalFluxoEntradas)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Faturamento (KPI):
                          </span>
                          <span className="font-medium">
                            {formatarMoeda(empresa.totalKpisFaturamento)}
                          </span>
                        </div>
                        <div className="border-t pt-1 flex justify-between font-bold text-green-600">
                          <span>Total:</span>
                          <span>{formatarMoeda(empresa.totalEntradas)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Composição de Saídas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Composição de Saídas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resumo.detalhesPorEmpresa.map(empresa => (
                    <div
                      key={`saidas-${empresa.empresaId}`}
                      className="space-y-2"
                    >
                      <p className="font-medium text-slate-900">
                        {empresa.nomeFantasia}
                      </p>
                      <div className="ml-4 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Contas a Pagar:
                          </span>
                          <span className="font-medium">
                            {formatarMoeda(empresa.totalContasPagar)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Fluxo de Caixa:
                          </span>
                          <span className="font-medium">
                            {formatarMoeda(empresa.totalFluxoSaidas)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Custos Fixos:</span>
                          <span className="font-medium">
                            {formatarMoeda(empresa.totalCustosFixos)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Custos Variáveis:
                          </span>
                          <span className="font-medium">
                            {formatarMoeda(empresa.totalCustosVariaveis)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Impostos:</span>
                          <span className="font-medium">
                            {formatarMoeda(empresa.totalImpostos)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Salários:</span>
                          <span className="font-medium">
                            {formatarMoeda(empresa.totalCustosFuncionarios)}
                          </span>
                        </div>
                        <div className="border-t pt-1 flex justify-between font-bold text-red-600">
                          <span>Total:</span>
                          <span>{formatarMoeda(empresa.totalSaidas)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
