import { useState } from "react";
import { trpc } from "@/lib/trpc";
import GenericCRUDPage, { CRUDField } from "@/components/GenericCRUDPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Empresas() {
  const utils = trpc.useUtils();
  const { data: empresas = [], isLoading } = trpc.empresas.list.useQuery();
  const consultarCNPJ = trpc.empresas.consultarCNPJ.useMutation();

  const createEmpresa = trpc.empresas.create.useMutation({
    onSuccess: () => {
      utils.empresas.list.invalidate();
      toast.success("Empresa cadastrada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar empresa: " + error.message);
    },
  });

  const updateEmpresa = trpc.empresas.update.useMutation({
    onSuccess: () => {
      utils.empresas.list.invalidate();
      toast.success("Empresa atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar empresa: " + error.message);
    },
  });

  const deleteEmpresa = trpc.empresas.delete.useMutation({
    onSuccess: () => {
      utils.empresas.list.invalidate();
      toast.success("Empresa deletada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao deletar empresa: " + error.message);
    },
  });

  const fields: CRUDField[] = [
    { name: "cnpj", label: "CNPJ", type: "text", required: true, placeholder: "00.000.000/0000-00" },
    { name: "razaoSocial", label: "Razão Social", type: "text", required: true },
    { name: "nomeFantasia", label: "Nome Fantasia", type: "text", required: true },
    { name: "email", label: "Email", type: "email" },
    { name: "telefone", label: "Telefone", type: "tel" },
    { name: "endereco", label: "Endereço", type: "text" },
    { name: "cidade", label: "Cidade", type: "text" },
    { name: "estado", label: "Estado", type: "text" },
    { name: "dataAbertura", label: "Data de Abertura", type: "date" },
  ];

  const renderTable = (items: any[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 font-semibold">Empresa</th>
            <th className="text-left py-3 px-4 font-semibold">CNPJ</th>
            <th className="text-left py-3 px-4 font-semibold">Email</th>
            <th className="text-left py-3 px-4 font-semibold">Telefone</th>
            <th className="text-center py-3 px-4 font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((empresa) => (
            <tr key={empresa.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-4">
                <div>
                  <p className="font-medium">{empresa.nomeFantasia || empresa.razaoSocial}</p>
                  <p className="text-xs text-muted-foreground">{empresa.razaoSocial}</p>
                </div>
              </td>
              <td className="py-3 px-4 text-muted-foreground">{empresa.cnpj}</td>
              <td className="py-3 px-4 text-muted-foreground">{empresa.email || "-"}</td>
              <td className="py-3 px-4 text-muted-foreground">{empresa.telefone || "-"}</td>
              <td className="py-3 px-4 text-center">
                <div className="flex justify-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const editData = {
                        ...empresa,
                        dataAbertura: empresa.dataAbertura ? new Date(empresa.dataAbertura).toISOString().split("T")[0] : "",
                      };
                      // Abrir dialog de edição
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Tem certeza que deseja deletar "${empresa.nomeFantasia || empresa.razaoSocial}"?`)) {
                        deleteEmpresa.mutate({ id: empresa.id });
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
      title="Empresas"
      description="Gestão de empresas do grupo econômico"
      createButtonLabel="Nova Empresa"
      createDialogTitle="Cadastrar Empresa"
      editDialogTitle="Editar Empresa"
      fields={fields}
      onCreateSubmit={(data) => {
        createEmpresa.mutate(data);
      }}
      onUpdateSubmit={(id, data) => {
        const { createdAt, updatedAt, ...cleanData } = data;
        updateEmpresa.mutate({ id, data: cleanData });
      }}
      onDelete={(id) => {
        deleteEmpresa.mutate({ id });
      }}
      isLoading={isLoading}
      isCreating={createEmpresa.isPending}
      isUpdating={updateEmpresa.isPending}
      isDeleting={deleteEmpresa.isPending}
      items={empresas}
      renderTable={renderTable}
      emptyMessage="Nenhuma empresa cadastrada"
      icon={<Building2 className="h-8 w-8 text-blue-600" />}
    />
  );
}
