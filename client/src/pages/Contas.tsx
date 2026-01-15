import { useState } from "react";
import { trpc } from "@/lib/trpc";
import GenericCRUDPage, { CRUDField } from "@/components/GenericCRUDPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Contas() {
  const [activeTab, setActiveTab] = useState("contas-pagar-receber");
  const utils = trpc.useUtils();

  // Queries
  const { data: contas = [], isLoading: contasLoading } = trpc.financeiro.contas.list.useQuery();
  const { data: empresas = [] } = trpc.empresas.list.useQuery();
  const { data: contasBancarias = [], isLoading: bancariasLoading } = trpc.contasBancarias?.list.useQuery() || { data: [], isLoading: false };

  // Mutations - Contas a Pagar/Receber
  const createMutation = trpc.financeiro.contas.create.useMutation({
    onSuccess: () => {
      utils.financeiro.contas.list.invalidate();
      toast.success("Conta registrada com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateMutation = trpc.financeiro.contas.update.useMutation({
    onSuccess: () => {
      utils.financeiro.contas.list.invalidate();
      toast.success("Conta atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteMutation = trpc.financeiro.contas.delete.useMutation({
    onSuccess: () => {
      utils.financeiro.contas.list.invalidate();
      toast.success("Conta excluída!");
    },
  });

  // Mutations - Contas Bancárias
  const createBancariaMutation = trpc.contasBancarias?.create.useMutation({
    onSuccess: () => {
      utils.contasBancarias.list.invalidate();
      toast.success("Conta bancária criada com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateBancariaMutation = trpc.contasBancarias?.update.useMutation({
    onSuccess: () => {
      utils.contasBancarias.list.invalidate();
      toast.success("Conta bancária atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteBancariaMutation = trpc.contasBancarias?.delete.useMutation({
    onSuccess: () => {
      utils.contasBancarias.list.invalidate();
      toast.success("Conta bancária excluída!");
    },
  });

  // Fields para Contas a Pagar/Receber
  const fieldsContas: CRUDField[] = [
    {
      name: "empresaId",
      label: "Empresa",
      type: "select",
      required: true,
      options: empresas.map((e) => ({ value: e.id.toString(), label: e.nomeFantasia || e.razaoSocial })),
    },
    {
      name: "tipo",
      label: "Tipo",
      type: "select",
      required: true,
      options: [
        { value: "Pagar", label: "A Pagar" },
        { value: "Receber", label: "A Receber" },
      ],
    },
    { name: "descricao", label: "Descrição", type: "text", required: true },
    { name: "categoria", label: "Categoria", type: "text" },
    { name: "valor", label: "Valor", type: "number", required: true, step: "0.01" },
    { name: "vencimento", label: "Vencimento", type: "date", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "Pendente", label: "Pendente" },
        { value: "Pago", label: "Pago" },
        { value: "Atrasado", label: "Atrasado" },
      ],
    },
    { name: "metodoPagamento", label: "Método de Pagamento", type: "text" },
    { name: "observacoes", label: "Observações", type: "textarea", rows: 2 },
  ];

  // Fields para Contas Bancárias
  const fieldsBancarias: CRUDField[] = [
    { name: "banco", label: "Banco", type: "text", required: true },
    { name: "agencia", label: "Agência", type: "text", required: true },
    { name: "conta", label: "Número da Conta", type: "text", required: true },
    {
      name: "tipo",
      label: "Tipo de Conta",
      type: "select",
      required: true,
      options: [
        { value: "Corrente", label: "Corrente" },
        { value: "Poupança", label: "Poupança" },
        { value: "Investimento", label: "Investimento" },
      ],
    },
    { name: "saldo", label: "Saldo", type: "number", required: true, step: "0.01" },
    { name: "titularConta", label: "Titular da Conta", type: "text" },
  ];

  // Render table para Contas
  const renderTableContas = (items: any[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 font-semibold">Empresa</th>
            <th className="text-left py-3 px-4 font-semibold">Tipo</th>
            <th className="text-left py-3 px-4 font-semibold">Descrição</th>
            <th className="text-right py-3 px-4 font-semibold">Valor</th>
            <th className="text-left py-3 px-4 font-semibold">Vencimento</th>
            <th className="text-center py-3 px-4 font-semibold">Status</th>
            <th className="text-center py-3 px-4 font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((conta) => {
            const empresa = empresas.find((e) => e.id === conta.empresaId);
            const vencimento = new Date(conta.vencimento);
            const hoje = new Date();
            const atrasado = vencimento < hoje && conta.status !== "Pago";

            return (
              <tr key={conta.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 font-medium">{empresa?.nomeFantasia || "N/A"}</td>
                <td className="py-3 px-4">
                  <Badge variant={conta.tipo === "Pagar" ? "destructive" : "default"}>{conta.tipo}</Badge>
                </td>
                <td className="py-3 px-4">{conta.descricao}</td>
                <td className="py-3 px-4 text-right font-bold">R$ {parseFloat(conta.valor || "0").toFixed(2)}</td>
                <td className="py-3 px-4">{vencimento.toLocaleDateString("pt-BR")}</td>
                <td className="py-3 px-4 text-center">
                  <Badge variant={atrasado ? "destructive" : conta.status === "Pago" ? "default" : "secondary"}>
                    {atrasado ? "Atrasado" : conta.status}
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
                        if (confirm(`Tem certeza que deseja deletar "${conta.descricao}"?`)) {
                          deleteMutation.mutate({ id: conta.id });
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

  // Render table para Contas Bancárias
  const renderTableBancarias = (items: any[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 font-semibold">Banco</th>
            <th className="text-left py-3 px-4 font-semibold">Agência</th>
            <th className="text-left py-3 px-4 font-semibold">Conta</th>
            <th className="text-left py-3 px-4 font-semibold">Tipo</th>
            <th className="text-right py-3 px-4 font-semibold">Saldo</th>
            <th className="text-left py-3 px-4 font-semibold">Titular</th>
            <th className="text-center py-3 px-4 font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((conta) => (
            <tr key={conta.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-4 font-medium">{conta.banco}</td>
              <td className="py-3 px-4">{conta.agencia}</td>
              <td className="py-3 px-4">{conta.conta}</td>
              <td className="py-3 px-4">
                <Badge variant="outline">{conta.tipo}</Badge>
              </td>
              <td className={`py-3 px-4 text-right font-bold ${parseFloat(conta.saldo || "0") >= 0 ? "text-green-600" : "text-red-600"}`}>
                R$ {parseFloat(conta.saldo || "0").toFixed(2)}
              </td>
              <td className="py-3 px-4 text-muted-foreground">{conta.titularConta || "-"}</td>
              <td className="py-3 px-4 text-center">
                <div className="flex justify-center gap-2">
                  <Button size="sm" variant="ghost">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Tem certeza que deseja deletar a conta ${conta.conta}?`)) {
                        deleteBancariaMutation.mutate({ id: conta.id });
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
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contas</h1>
          <p className="text-muted-foreground">Gestão de contas a pagar/receber e contas bancárias</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="contas-pagar-receber">Contas a Pagar/Receber</TabsTrigger>
          <TabsTrigger value="contas-bancarias">Contas Bancárias</TabsTrigger>
        </TabsList>

        <TabsContent value="contas-pagar-receber" className="space-y-4">
          <GenericCRUDPage
            title="Contas a Pagar/Receber"
            description="Gestão de contas a pagar e receber"
            createButtonLabel="Nova Conta"
            createDialogTitle="Registrar Conta"
            editDialogTitle="Editar Conta"
            fields={fieldsContas}
            onCreateSubmit={(data) => {
              createMutation.mutate({
                empresaId: parseInt(data.empresaId),
                tipo: data.tipo,
                descricao: data.descricao,
                categoria: data.categoria,
                valor: data.valor,
                vencimento: data.vencimento,
                status: data.status,
                metodoPagamento: data.metodoPagamento,
                observacoes: data.observacoes,
              });
            }}
            onUpdateSubmit={(id, data) => {
              updateMutation.mutate({
                id,
                data: {
                  empresaId: parseInt(data.empresaId),
                  tipo: data.tipo,
                  descricao: data.descricao,
                  categoria: data.categoria,
                  valor: data.valor,
                  vencimento: data.vencimento,
                  status: data.status,
                  metodoPagamento: data.metodoPagamento,
                  observacoes: data.observacoes,
                },
              });
            }}
            onDelete={(id) => {
              deleteMutation.mutate({ id });
            }}
            isLoading={contasLoading}
            isCreating={createMutation.isPending}
            isUpdating={updateMutation.isPending}
            isDeleting={deleteMutation.isPending}
            items={contas}
            renderTable={renderTableContas}
            emptyMessage="Nenhuma conta registrada"
            icon={<CreditCard className="h-8 w-8 text-blue-600" />}
          />
        </TabsContent>

        <TabsContent value="contas-bancarias" className="space-y-4">
          <GenericCRUDPage
            title="Contas Bancárias"
            description="Gestão de contas bancárias"
            createButtonLabel="Nova Conta Bancária"
            createDialogTitle="Registrar Conta Bancária"
            editDialogTitle="Editar Conta Bancária"
            fields={fieldsBancarias}
            onCreateSubmit={(data) => {
              createBancariaMutation?.mutate(data);
            }}
            onUpdateSubmit={(id, data) => {
              updateBancariaMutation?.mutate({ id, data });
            }}
            onDelete={(id) => {
              deleteBancariaMutation?.mutate({ id });
            }}
            isLoading={bancariasLoading}
            isCreating={createBancariaMutation?.isPending}
            isUpdating={updateBancariaMutation?.isPending}
            isDeleting={deleteBancariaMutation?.isPending}
            items={contasBancarias}
            renderTable={renderTableBancarias}
            emptyMessage="Nenhuma conta bancária registrada"
            icon={<CreditCard className="h-8 w-8 text-green-600" />}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
