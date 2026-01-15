import { trpc } from "@/lib/trpc";
import GenericCRUDPage, { CRUDField } from "@/components/GenericCRUDPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function FluxoCaixa() {
  const utils = trpc.useUtils();
  const { data: fluxos = [], isLoading } = trpc.financeiro.fluxoCaixa.list.useQuery();

  const createFluxo = trpc.financeiro.fluxoCaixa.create.useMutation({
    onSuccess: () => {
      utils.financeiro.fluxoCaixa.list.invalidate();
      toast.success("Movimentação cadastrada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar movimentação: " + error.message);
    },
  });

  const updateFluxo = trpc.financeiro.fluxoCaixa.update.useMutation({
    onSuccess: () => {
      utils.financeiro.fluxoCaixa.list.invalidate();
      toast.success("Movimentação atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar movimentação: " + error.message);
    },
  });

  const deleteFluxo = trpc.financeiro.fluxoCaixa.delete.useMutation({
    onSuccess: () => {
      utils.financeiro.fluxoCaixa.list.invalidate();
      toast.success("Movimentação deletada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao deletar movimentação: " + error.message);
    },
  });

  const fields: CRUDField[] = [
    { name: "data", label: "Data", type: "date", required: true },
    {
      name: "tipo",
      label: "Tipo",
      type: "select",
      required: true,
      options: [
        { value: "Entrada", label: "Entrada" },
        { value: "Saida", label: "Saída" },
      ],
    },
    { name: "descricao", label: "Descrição", type: "text", required: true },
    { name: "categoria", label: "Categoria", type: "text" },
    { name: "valor", label: "Valor", type: "number", required: true, step: "0.01" },
  ];

  const totalEntradas = fluxos?.filter((f) => f.tipo === "Entrada").reduce((acc, f) => acc + parseFloat(f.valor || "0"), 0) || 0;
  const totalSaidas = fluxos?.filter((f) => f.tipo === "Saida").reduce((acc, f) => acc + parseFloat(f.valor || "0"), 0) || 0;
  const saldo = totalEntradas - totalSaidas;

  const renderTable = (items: any[]) => (
    <>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Total Entradas</p>
          <p className="text-2xl font-bold text-green-600">R$ {totalEntradas.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Total Saídas</p>
          <p className="text-2xl font-bold text-red-600">R$ {totalSaidas.toFixed(2)}</p>
        </div>
        <div className={`${saldo >= 0 ? "bg-blue-50" : "bg-orange-50"} p-4 rounded-lg`}>
          <p className="text-sm text-muted-foreground">Saldo</p>
          <p className={`text-2xl font-bold ${saldo >= 0 ? "text-blue-600" : "text-orange-600"}`}>R$ {saldo.toFixed(2)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 font-semibold">Data</th>
              <th className="text-left py-3 px-4 font-semibold">Tipo</th>
              <th className="text-left py-3 px-4 font-semibold">Descrição</th>
              <th className="text-left py-3 px-4 font-semibold">Categoria</th>
              <th className="text-right py-3 px-4 font-semibold">Valor</th>
              <th className="text-center py-3 px-4 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((fluxo) => (
              <tr key={fluxo.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">{new Date(fluxo.data).toLocaleDateString("pt-BR")}</td>
                <td className="py-3 px-4">
                  <Badge variant={fluxo.tipo === "Entrada" ? "default" : "destructive"}>
                    {fluxo.tipo === "Entrada" ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {fluxo.tipo}
                  </Badge>
                </td>
                <td className="py-3 px-4">{fluxo.descricao}</td>
                <td className="py-3 px-4 text-muted-foreground">{fluxo.categoria || "-"}</td>
                <td className={`py-3 px-4 text-right font-bold ${fluxo.tipo === "Entrada" ? "text-green-600" : "text-red-600"}`}>
                  {fluxo.tipo === "Entrada" ? "+" : "-"} R$ {parseFloat(fluxo.valor || "0").toFixed(2)}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    <Button size="sm" variant="ghost">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja deletar "${fluxo.descricao}"?`)) {
                          deleteFluxo.mutate({ id: fluxo.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <GenericCRUDPage
      title="Fluxo de Caixa"
      description="Controle de entradas e saídas financeiras"
      createButtonLabel="Nova Movimentação"
      createDialogTitle="Registrar Movimentação"
      editDialogTitle="Editar Movimentação"
      fields={fields}
      onCreateSubmit={(data) => {
        createFluxo.mutate(data);
      }}
      onUpdateSubmit={(id, data) => {
        updateFluxo.mutate({ id, data });
      }}
      onDelete={(id) => {
        deleteFluxo.mutate({ id });
      }}
      isLoading={isLoading}
      isCreating={createFluxo.isPending}
      isUpdating={updateFluxo.isPending}
      isDeleting={deleteFluxo.isPending}
      items={fluxos}
      renderTable={renderTable}
      emptyMessage="Nenhuma movimentação registrada"
      icon={<TrendingUp className="h-8 w-8 text-blue-600" />}
    />
  );
}
