import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Users, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const { data: dashboardData, isLoading: loadingDashboard } = trpc.dashboard.getData.useQuery();
  const { data: alertasNaoLidos, isLoading: loadingAlertas } = trpc.alertas.naoLidos.useQuery();

  if (loadingDashboard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    {
      title: "Faturamento do Mês",
      value: `R$ ${dashboardData?.faturamentoMes?.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0,00"}`,
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total de Despesas",
      value: `R$ ${dashboardData?.totalDespesas?.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0,00"}`,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Lucro/Prejuízo",
      value: `R$ ${dashboardData?.lucroPrejuizo?.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0,00"}`,
      icon: dashboardData && dashboardData.lucroPrejuizo >= 0 ? TrendingUp : TrendingDown,
      color: dashboardData && dashboardData.lucroPrejuizo >= 0 ? "text-green-600" : "text-red-600",
      bgColor: dashboardData && dashboardData.lucroPrejuizo >= 0 ? "bg-green-50" : "bg-red-50",
    },
    {
      title: "Saldo em Caixa",
      value: `R$ ${dashboardData?.saldoCaixa?.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0,00"}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Funcionários Ativos",
      value: dashboardData?.funcionariosAtivos || 0,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard CEO</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral executiva do desempenho empresarial em tempo real
        </p>
      </div>

      {/* Alertas Críticos */}
      {!loadingAlertas && alertasNaoLidos && alertasNaoLidos.length > 0 && (
        <div className="space-y-3">
          {alertasNaoLidos.slice(0, 3).map((alerta) => (
            <Alert
              key={alerta.id}
              variant={alerta.severidade === "Critico" ? "destructive" : "default"}
              className="animate-fade-in"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{alerta.titulo}</AlertTitle>
              <AlertDescription>{alerta.mensagem}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumo Rápido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral Financeira</CardTitle>
            <CardDescription>Resumo consolidado do período atual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Faturamento Bruto</span>
              <span className="font-semibold">
                R$ {dashboardData?.faturamentoMes?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">(-) Despesas</span>
              <span className="font-semibold text-red-600">
                R$ {dashboardData?.totalDespesas?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}
              </span>
            </div>
            <div className="border-t pt-4 flex justify-between items-center">
              <span className="font-semibold">Resultado Líquido</span>
              <span className={`font-bold text-lg ${dashboardData && dashboardData.lucroPrejuizo >= 0 ? "text-green-600" : "text-red-600"}`}>
                R$ {dashboardData?.lucroPrejuizo?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesse as principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/empresas"
              className="block p-3 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <div className="font-medium">Cadastrar Empresa</div>
              <div className="text-sm text-muted-foreground">Adicionar nova empresa ao sistema</div>
            </a>
            <a
              href="/kpis"
              className="block p-3 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <div className="font-medium">Registrar KPI</div>
              <div className="text-sm text-muted-foreground">Lançar indicadores financeiros</div>
            </a>
            <a
              href="/chatbot"
              className="block p-3 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <div className="font-medium">Consultar Assistente IA</div>
              <div className="text-sm text-muted-foreground">Análise inteligente de dados</div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
