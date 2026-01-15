import { trpc } from "@/lib/trpc";
import GenericCRUDPage, { CRUDField } from "@/components/GenericCRUDPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calculator, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Impostos() {
  const utils = trpc.useUtils();
  const { data: impostos = [], isLoading } =
    trpc.financeiro.impostos.list.useQuery();
  const { data: empresas = [] } = trpc.empresas.list.useQuery();

  const createImposto = trpc.financeiro.impostos.create.useMutation({
    onSuccess: () => {
      utils.financeiro.impostos.list.invalidate();
      toast.success("Imposto cadastrado com sucesso!");
    },
    onError: error => {
      toast.error("Erro ao cadastrar imposto: " + error.message);
    },
  });

  const updateImposto = trpc.financeiro.impostos.update.useMutation({
    onSuccess: () => {
      utils.financeiro.impostos.list.invalidate();
      toast.success("Imposto atualizado com sucesso!");
    },
    onError: error => {
      toast.error("Erro ao atualizar imposto: " + error.message);
    },
  });

  const deleteImposto = trpc.financeiro.impostos.delete.useMutation({
    onSuccess: () => {
      utils.financeiro.impostos.list.invalidate();
      toast.success("Imposto deletado com sucesso!");
    },
    onError: error => {
      toast.error("Erro ao deletar imposto: " + error.message);
    },
  });

  const fields: CRUDField[] = [
    {
      name: "empresaId",
      label: "Empresa",
      type: "select",
      required: true,
      options: empresas.map(e => ({
        value: e.id.toString(),
        label: e.nomeFantasia || e.razaoSocial,
      })),
    },
    {
      name: "mesAno",
      label: "Mês/Ano",
      type: "text",
      required: true,
      placeholder: "YYYY-MM",
    },
    {
      name: "tipo",
      label: "Tipo de Imposto",
      type: "select",
      required: true,
      options: [
        { value: "ICMS", label: "ICMS" },
        { value: "IPI", label: "IPI" },
        { value: "ISS", label: "ISS" },
        { value: "PIS", label: "PIS" },
        { value: "COFINS", label: "COFINS" },
        { value: "IRPJ", label: "IRPJ" },
        { value: "CSLL", label: "CSLL" },
      ],
    },
    {
      name: "baseCalculo",
      label: "Base de Cálculo",
      type: "number",
      required: true,
      step: "0.01",
    },
    {
      name: "aliquota",
      label: "Alíquota (%)",
      type: "number",
      required: true,
      step: "0.01",
    },
    { name: "vencimento", label: "Vencimento", type: "date", required: true },
  ];

  const calcularValor = (baseCalculo: string, aliquota: string) => {
    const base = parseFloat(baseCalculo || "0");
    const aliq = parseFloat(aliquota || "0") / 100;
    return base * aliq;
  };

  const totalImpostos =
    impostos?.reduce((acc, imp) => {
      const valor = calcularValor(imp.baseCalculo || "0", imp.aliquota || "0");
      return acc + valor;
    }, 0) || 0;

  const renderTable = (items: any[]) => (
    <>
      <div className="mb-6 bg-orange-50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">Total de Impostos</p>
        <p className="text-3xl font-bold text-orange-600">
          R$ {totalImpostos.toFixed(2)}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 font-semibold">Empresa</th>
              <th className="text-left py-3 px-4 font-semibold">Período</th>
              <th className="text-left py-3 px-4 font-semibold">Tipo</th>
              <th className="text-right py-3 px-4 font-semibold">Base</th>
              <th className="text-center py-3 px-4 font-semibold">Alíquota</th>
              <th className="text-right py-3 px-4 font-semibold">Valor</th>
              <th className="text-left py-3 px-4 font-semibold">Vencimento</th>
              <th className="text-center py-3 px-4 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map(imp => {
              const empresa = empresas.find(e => e.id === imp.empresaId);
              const valor = calcularValor(
                imp.baseCalculo || "0",
                imp.aliquota || "0"
              );
              const vencimento = new Date(imp.vencimento);
              const hoje = new Date();
              const vencido = vencimento < hoje;

              return (
                <tr
                  key={imp.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-3 px-4 font-medium">
                    {empresa?.nomeFantasia || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {imp.mesAno}
                  </td>
                  <td className="py-3 px-4">{imp.tipo}</td>
                  <td className="py-3 px-4 text-right">
                    R$ {parseFloat(imp.baseCalculo || "0").toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {parseFloat(imp.aliquota || "0").toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-right font-bold">
                    R$ {valor.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={vencido ? "destructive" : "default"}>
                      {vencimento.toLocaleDateString("pt-BR")}
                    </Badge>
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
                          if (
                            confirm(
                              `Tem certeza que deseja deletar o imposto "${imp.tipo}"?`
                            )
                          ) {
                            deleteImposto.mutate({ id: imp.id });
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
    </>
  );

  return (
    <GenericCRUDPage
      title="Impostos"
      description="Gestão de obrigações tributárias"
      createButtonLabel="Novo Imposto"
      createDialogTitle="Registrar Imposto"
      editDialogTitle="Editar Imposto"
      fields={fields}
      onCreateSubmit={data => {
        createImposto.mutate({
          empresaId: parseInt(data.empresaId),
          mesAno: data.mesAno,
          tipo: data.tipo,
          baseCalculo: data.baseCalculo,
          aliquota: data.aliquota,
          vencimento: data.vencimento,
        });
      }}
      onUpdateSubmit={(id, data) => {
        updateImposto.mutate({
          id,
          data: {
            empresaId: parseInt(data.empresaId),
            mesAno: data.mesAno,
            tipo: data.tipo,
            baseCalculo: data.baseCalculo,
            aliquota: data.aliquota,
            vencimento: data.vencimento,
          },
        });
      }}
      onDelete={id => {
        deleteImposto.mutate({ id });
      }}
      isLoading={isLoading}
      isCreating={createImposto.isPending}
      isUpdating={updateImposto.isPending}
      isDeleting={deleteImposto.isPending}
      items={impostos}
      renderTable={renderTable}
      emptyMessage="Nenhum imposto registrado"
      icon={<Calculator className="h-8 w-8 text-orange-600" />}
    />
  );
}
