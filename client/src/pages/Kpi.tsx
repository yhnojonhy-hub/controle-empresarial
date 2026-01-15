import { trpc } from "@/lib/trpc";
import GenericCRUDPage, { CRUDField } from "@/components/GenericCRUDPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Kpi() {
  const utils = trpc.useUtils();
  const { data: kpis = [], isLoading } = trpc.financeiro.kpis.list.useQuery();
  const { data: empresas = [] } = trpc.empresas.list.useQuery();

  const createMutation = trpc.financeiro.kpis.create.useMutation({
    onSuccess: () => {
      utils.financeiro.kpis.list.invalidate();
      toast.success("KPI registrado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao registrar KPI: ${error.message}`);
    },
  });

  const updateMutation = trpc.financeiro.kpis.update.useMutation({
    onSuccess: () => {
      utils.financeiro.kpis.list.invalidate();
      toast.success("KPI atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar KPI: ${error.message}`);
    },
  });

  const deleteMutation = trpc.financeiro.kpis.delete.useMutation({
    onSuccess: () => {
      utils.financeiro.kpis.list.invalidate();
      toast.success("KPI excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir KPI: ${error.message}`);
    },
  });

  const fields: CRUDField[] = [
    {
      name: "empresaId",
      label: "Empresa",
      type: "select",
      required: true,
      options: empresas.map((e) => ({ value: e.id.toString(), label: e.nomeFantasia || e.razaoSocial })),
    },
    { name: "mesAno", label: "Mês/Ano", type: "text", required: true, placeholder: "YYYY-MM" },
    { name: "faturamentoBruto", label: "Faturamento Bruto", type: "number", required: true, step: "0.01" },
    { name: "impostos", label: "Impostos", type: "number", required: true, step: "0.01" },
    { name: "custosFixos", label: "Custos Fixos", type: "number", required: true, step: "0.01" },
    { name: "custosVariaveis", label: "Custos Variáveis", type: "number", required: true, step: "0.01" },
  ];

  const calcularIndicadores = (kpi: any) => {
    const faturamento = parseFloat(kpi.faturamentoBruto || "0");
    const impostos = parseFloat(kpi.impostos || "0");
    const custosFixos = parseFloat(kpi.custosFixos || "0");
    const custosVariaveis = parseFloat(kpi.custosVariaveis || "0");
    const lucroLiquido = faturamento - impostos - custosFixos - custosVariaveis;
    const margemLucro = faturamento > 0 ? ((lucroLiquido / faturamento) * 100).toFixed(2) : "0";
    return { lucroLiquido, margemLucro };
  };

  const renderTable = (items: any[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 font-semibold">Empresa</th>
            <th className="text-left py-3 px-4 font-semibold">Período</th>
            <th className="text-right py-3 px-4 font-semibold">Faturamento</th>
            <th className="text-right py-3 px-4 font-semibold">Custos</th>
            <th className="text-right py-3 px-4 font-semibold">Lucro Líquido</th>
            <th className="text-center py-3 px-4 font-semibold">Margem</th>
            <th className="text-center py-3 px-4 font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((kpi) => {
            const empresa = empresas.find((e) => e.id === kpi.empresaId);
            const { lucroLiquido, margemLucro } = calcularIndicadores(kpi);
            const custos = parseFloat(kpi.custosFixos || "0") + parseFloat(kpi.custosVariaveis || "0");
            return (
              <tr key={kpi.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 font-medium">{empresa?.nomeFantasia || "N/A"}</td>
                <td className="py-3 px-4 text-muted-foreground">{kpi.mesAno}</td>
                <td className="py-3 px-4 text-right">R$ {parseFloat(kpi.faturamentoBruto || "0").toFixed(2)}</td>
                <td className="py-3 px-4 text-right">R$ {custos.toFixed(2)}</td>
                <td className={`py-3 px-4 text-right font-bold ${lucroLiquido >= 0 ? "text-green-600" : "text-red-600"}`}>
                  R$ {lucroLiquido.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-center">{margemLucro}%</td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    <Button size="sm" variant="ghost">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja excluir este KPI?")) {
                          deleteMutation.mutate({ id: kpi.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <GenericCRUDPage
      title="KPIs Financeiros"
      description="Indicadores-chave de desempenho financeiro"
      createButtonLabel="Novo KPI"
      createDialogTitle="Registrar KPI"
      editDialogTitle="Editar KPI"
      fields={fields}
      onCreateSubmit={(data) => {
        createMutation.mutate({
          empresaId: parseInt(data.empresaId),
          mesAno: data.mesAno,
          faturamentoBruto: data.faturamentoBruto,
          impostos: data.impostos,
          custosFixos: data.custosFixos,
          custosVariaveis: data.custosVariaveis,
        });
      }}
      onUpdateSubmit={(id, data) => {
        updateMutation.mutate({
          id,
          data: {
            empresaId: parseInt(data.empresaId),
            mesAno: data.mesAno,
            faturamentoBruto: data.faturamentoBruto,
            impostos: data.impostos,
            custosFixos: data.custosFixos,
            custosVariaveis: data.custosVariaveis,
          },
        });
      }}
      onDelete={(id) => {
        deleteMutation.mutate({ id });
      }}
      isLoading={isLoading}
      isCreating={createMutation.isPending}
      isUpdating={updateMutation.isPending}
      isDeleting={deleteMutation.isPending}
      items={kpis}
      renderTable={renderTable}
      emptyMessage="Nenhum KPI registrado"
      icon={<TrendingUp className="h-8 w-8 text-green-600" />}
    />
  );
}
