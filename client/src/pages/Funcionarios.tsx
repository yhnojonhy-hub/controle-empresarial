import { trpc } from "@/lib/trpc";
import GenericCRUDPage, { CRUDField } from "@/components/GenericCRUDPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Funcionarios() {
  const utils = trpc.useUtils();
  const { data: funcionarios = [], isLoading } = trpc.rh.list.useQuery();
  const { data: empresas = [] } = trpc.empresas.list.useQuery();

  const createMutation = trpc.rh.create.useMutation({
    onSuccess: () => {
      utils.rh.list.invalidate();
      toast.success("Funcionário cadastrado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateMutation = trpc.rh.update.useMutation({
    onSuccess: () => {
      utils.rh.list.invalidate();
      toast.success("Funcionário atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteMutation = trpc.rh.delete.useMutation({
    onSuccess: () => {
      utils.rh.list.invalidate();
      toast.success("Funcionário excluído!");
    },
  });

  const fields: CRUDField[] = [
    { name: "nome", label: "Nome", type: "text", required: true },
    { name: "cpf", label: "CPF", type: "text", required: true },
    { name: "cargo", label: "Cargo", type: "text", required: true },
    { name: "salarioBase", label: "Salário Base", type: "number", required: true, step: "0.01" },
    { name: "beneficios", label: "Benefícios", type: "number", step: "0.01" },
    { name: "dataAdmissao", label: "Data de Admissão", type: "date", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "Ativo", label: "Ativo" },
        { value: "Inativo", label: "Inativo" },
      ],
    },
  ];

  const renderTable = (items: any[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 font-semibold">Nome</th>
            <th className="text-left py-3 px-4 font-semibold">CPF</th>
            <th className="text-left py-3 px-4 font-semibold">Cargo</th>
            <th className="text-right py-3 px-4 font-semibold">Salário</th>
            <th className="text-center py-3 px-4 font-semibold">Status</th>
            <th className="text-center py-3 px-4 font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((func) => (
            <tr key={func.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-4 font-medium">{func.nome}</td>
              <td className="py-3 px-4 text-muted-foreground">{func.cpf}</td>
              <td className="py-3 px-4 text-muted-foreground">{func.cargo}</td>
              <td className="py-3 px-4 text-right font-medium">
                R$ {parseFloat(func.salarioBase || "0").toFixed(2)}
              </td>
              <td className="py-3 px-4 text-center">
                <Badge variant={func.status === "Ativo" ? "default" : "secondary"}>{func.status}</Badge>
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
                      if (confirm(`Tem certeza que deseja deletar ${func.nome}?`)) {
                        deleteMutation.mutate({ id: func.id });
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
    <GenericCRUDPage
      title="Funcionários"
      description="Gestão de colaboradores"
      createButtonLabel="Novo Funcionário"
      createDialogTitle="Cadastrar Funcionário"
      editDialogTitle="Editar Funcionário"
      fields={fields}
      onCreateSubmit={(data) => {
        createMutation.mutate(data);
      }}
      onUpdateSubmit={(id, data) => {
        updateMutation.mutate({ id, data });
      }}
      onDelete={(id) => {
        deleteMutation.mutate({ id });
      }}
      isLoading={isLoading}
      isCreating={createMutation.isPending}
      isUpdating={updateMutation.isPending}
      isDeleting={deleteMutation.isPending}
      items={funcionarios}
      renderTable={renderTable}
      emptyMessage="Nenhum funcionário cadastrado"
      icon={<Users className="h-8 w-8 text-purple-600" />}
    />
  );
}
