import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DashboardChartsProps {
  kpisData: any[];
  contasData: any[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function DashboardCharts({
  kpisData,
  contasData,
}: DashboardChartsProps) {
  // Preparar dados para gráfico de evolução de faturamento
  const faturamentoData = kpisData.map(kpi => ({
    mes: kpi.mesAno,
    faturamento: parseFloat(kpi.faturamentoBruto || "0"),
    lucro:
      parseFloat(kpi.faturamentoBruto || "0") -
      parseFloat(kpi.impostos || "0") -
      parseFloat(kpi.custosFixos || "0") -
      parseFloat(kpi.custosVariaveis || "0"),
  }));

  // Preparar dados para gráfico de despesas por categoria
  const despesasPorCategoria = contasData
    .filter(c => c.tipo === "Pagar")
    .reduce(
      (acc, conta) => {
        const categoria = conta.categoria || "Outros";
        if (!acc[categoria]) acc[categoria] = 0;
        acc[categoria] += parseFloat(conta.valor || "0");
        return acc;
      },
      {} as Record<string, number>
    );

  const despesasData = Object.entries(despesasPorCategoria).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Evolução de Faturamento e Lucro</CardTitle>
          <CardDescription>Últimos meses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={faturamentoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip
                formatter={(value: number) =>
                  `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="faturamento"
                stroke="#0088FE"
                name="Faturamento"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="lucro"
                stroke="#00C49F"
                name="Lucro"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Despesas por Categoria</CardTitle>
          <CardDescription>Distribuição de gastos</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={despesasData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={entry => entry.name}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {despesasData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) =>
                  `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
