import { trpc } from "@/lib/trpc";
import GenericCRUDPage, { CRUDField } from "@/components/GenericCRUDPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, Info, Check, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Alertas() {
  const utils = trpc.useUtils();
  const { data: alertas = [], isLoading } = trpc.alertas.list.useQuery();

  const createMutation = trpc.alertas.create.useMutation({
    onSuccess: () => {
      utils.alertas.list.invalidate();
      toast.success("Alerta criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar alerta: " + error.message);
    },
  });

  const updateMutation = trpc.alertas.update.useMutation({
    onSuccess: () => {
      utils.alertas.list.invalidate();
      toast.success("Alerta atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar alerta: " + error.message);
    },
  });

  const deleteMutation = trpc.alertas.delete.useMutation({
    onSuccess: () => {
      utils.alertas.list.invalidate();
      toast.success("Alerta deletado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao deletar alerta: " + error.message);
    },
  });

  const marcarLidoMutation = trpc.alertas.marcarLido.useMutation({
    onSuccess: () => {
      utils.alertas.list.invalidate();
      toast.success("Alerta marcado como lido!");
    },
  });

  const fields: CRUDField[] = [
    {
      name: "tipo",
      label: "Tipo",
      type: "select",
      required: true,
      options: [
        { value: "Vencimento", label: "Vencimento" },
        { value: "MargemNegativa", label: "Margem Negativa" },
        { value: "SaldoBaixo", label: "Saldo Baixo" },
        { value: "NovoRegistro", label: "Novo Registro" },
      ],
    },
    {
      name: "severidade",
      label: "Severidade",
      type: "select",
      required: true,
      options: [
        { value: "Info", label: "Informativo" },
        { value: "Aviso", label: "Aviso" },
        { value: "Critico", label: "Crítico" },
      ],
    },
    { name: "titulo", label: "Título", type: "text", required: true },
    { name: "mensagem", label: "Mensagem", type: "textarea", required: true, rows: 3 },
    { name: "entidadeTipo", label: "Tipo de Entidade", type: "text" },
    { name: "entidadeId", label: "ID da Entidade", type: "number" },
  ];

  const getSeveridadeIcon = (severidade: string) => {
    switch (severidade) {
      case "Critico":
        return <AlertTriangle className="h-4 w-4" />;
      case "Aviso":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getSeveridadeColor = (severidade: string) => {
    switch (severidade) {
      case "Critico":
        return "destructive";
      case "Aviso":
        return "secondary";
      default:
        return "default";
    }
  };

  const renderTable = (items: any[]) => (
    <div className="space-y-2">
      {items.map((alerta) => (
        <div key={alerta.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getSeveridadeIcon(alerta.severidade)}
                <h3 className="font-semibold">{alerta.titulo}</h3>
                <Badge variant={getSeveridadeColor(alerta.severidade)}>{alerta.severidade}</Badge>
                {alerta.lido && <Badge variant="outline">Lido</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{alerta.mensagem}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Tipo: {alerta.tipo} | {new Date(alerta.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div className="flex gap-2">
              {!alerta.lido && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    marcarLidoMutation.mutate({ id: alerta.id });
                  }}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button size="sm" variant="ghost">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (confirm("Tem certeza que deseja deletar este alerta?")) {
                    deleteMutation.mutate({ id: alerta.id });
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <GenericCRUDPage
      title="Alertas e Notificações"
      description="Gerenciamento de alertas do sistema"
      createButtonLabel="Novo Alerta"
      createDialogTitle="Criar Alerta"
      editDialogTitle="Editar Alerta"
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
      items={alertas}
      renderTable={renderTable}
      emptyMessage="Nenhum alerta registrado"
      icon={<AlertTriangle className="h-8 w-8 text-red-600" />}
    />
  );
}
