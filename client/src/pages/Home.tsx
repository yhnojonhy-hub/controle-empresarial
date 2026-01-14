import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, 
  TrendingUp, 
  CreditCard, 
  Users, 
  ArrowUpDown, 
  FileText, 
  Bell,
  DollarSign,
  TrendingDown,
  Wallet,
  UserCheck
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: dashboard } = trpc.dashboard.summary.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const menuItems = [
    {
      title: "Empresas",
      description: "Cadastro e gestão de empresas",
      icon: Building2,
      href: "/empresas",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Indicadores KPI",
      description: "Métricas e indicadores financeiros",
      icon: TrendingUp,
      href: "/kpis",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Contas",
      description: "Contas a pagar e receber",
      icon: CreditCard,
      href: "/contas",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Funcionários",
      description: "Gestão de colaboradores",
      icon: Users,
      href: "/funcionarios",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Fluxo de Caixa",
      description: "Controle de entradas e saídas",
      icon: ArrowUpDown,
      href: "/fluxo-caixa",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
    {
      title: "Impostos",
      description: "Gestão tributária",
      icon: FileText,
      href: "/impostos",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Alertas",
      description: "Notificações e avisos",
      icon: Bell,
      href: "/alertas",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Controle Empresarial</h1>
              <p className="text-sm text-slate-600">Sistema de Gestão Nível CEO</p>
            </div>
            {isAuthenticated && user && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-600">{user.role === "admin" ? "Administrador" : "Usuário"}</p>
                </div>
                {user.role === "admin" && (
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                    Admin
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Dashboard CEO */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-900">Dashboard CEO</h2>
            <p className="text-slate-600">Visão geral executiva do desempenho empresarial em tempo real</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  Faturamento do Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                    dashboard?.faturamentoMes || 0
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Total de Despesas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                    dashboard?.totalDespesas || 0
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Lucro/Prejuízo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(dashboard?.lucroPrejuizo || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                    dashboard?.lucroPrejuizo || 0
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-purple-600" />
                  Saldo em Caixa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                    dashboard?.saldoCaixa || 0
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-orange-600" />
                  Funcionários Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {dashboard?.funcionariosAtivos || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visão Geral Financeira */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Visão Geral Financeira</CardTitle>
                <CardDescription>Resumo consolidado do período atual</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Faturamento Bruto</span>
                  <span className="font-bold">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      dashboard?.faturamentoMes || 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">(-) Despesas</span>
                  <span className="font-bold text-red-600">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      dashboard?.totalDespesas || 0
                    )}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Resultado Líquido</span>
                    <span className={`text-lg font-bold ${(dashboard?.lucroPrejuizo || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                        dashboard?.lucroPrejuizo || 0
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Acesse as principais funcionalidades</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/empresas">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="mr-2 h-4 w-4" />
                    Cadastrar Empresa
                  </Button>
                </Link>
                <Link href="/kpis">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Registrar KPI
                  </Button>
                </Link>
                <Link href="/contas">
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Lançar Conta
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Menu de Navegação */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Módulos do Sistema</h2>
            <p className="text-slate-600">Acesse todas as funcionalidades disponíveis</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className={`${item.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
