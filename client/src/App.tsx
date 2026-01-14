import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Empresas from "./pages/Empresas";
import Kpi from "./pages/Kpi";
import Contas from "./pages/Contas";
import Funcionarios from "./pages/Funcionarios";
import FluxoCaixa from "./pages/FluxoCaixa";
import Impostos from "./pages/Impostos";
import Alertas from "./pages/Alertas";
import ControleFinanceiro from "./pages/ControleFinanceiro";
import Reconciliacao from "./pages/Reconciliacao";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/empresas" component={Empresas} />
      <Route path="/kpis" component={Kpi} />
      <Route path="/contas" component={Contas} />
      <Route path="/funcionarios" component={Funcionarios} />
      <Route path="/fluxo-caixa" component={FluxoCaixa} />
      <Route path="/impostos" component={Impostos} />
      <Route path="/alertas" component={Alertas} />
      <Route path="/controle-financeiro" component={ControleFinanceiro} />
      <Route path="/reconciliacao" component={Reconciliacao} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <DashboardLayout>
            <Router />
          </DashboardLayout>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
