import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle, Info, AlertCircle, Check, Plus, Pencil, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

type AlertaForm = {
  tipo: "Vencimento" | "MargemNegativa" | "SaldoBaixo" | "NovoRegistro";
  severidade: "Info" | "Aviso" | "Critico";
  titulo: string;
  mensagem: string;
  entidadeTipo?: string;
  entidadeId?: number;
};

export default function Alertas() {
  const utils = trpc.useUtils();
  const { data: alertas, isLoading } = trpc.alertas.list.useQuery();

  // Estados para dialogs
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingAlerta, setEditingAlerta] = useState<any>(null);

  // Estados para formulários
  const [formData, setFormData] = useState<AlertaForm>({
    tipo: "NovoRegistro",
    severidade: "Info",
    titulo: "",
    mensagem: "",
    entidadeTipo: "",
    entidadeId: undefined,
  });

  // Mutations
  const createMutation = trpc.alertas.create.useMutation({
    onSuccess: () => {
      utils.alertas.list.invalidate();
      toast.success("Alerta criado com sucesso!");
      setOpenCreate(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar alerta: " + error.message);
    },
  });

  const updateMutation = trpc.alertas.update.useMutation({
    onSuccess: () => {
      utils.alertas.list.invalidate();
      toast.success("Alerta atualizado com sucesso!");
      setOpenEdit(false);
      setEditingAlerta(null);
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
    onError: (error) => {
      toast.error("Erro ao marcar alerta: " + error.message);
    },
  });

  // Handlers
  const resetForm = () => {
    setFormData({
      tipo: "NovoRegistro",
      severidade: "Info",
      titulo: "",
      mensagem: "",
      entidadeTipo: "",
      entidadeId: undefined,
    });
  };

  const handleCreate = () => {
    if (!formData.titulo || !formData.mensagem) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createMutation.mutate({
      tipo: formData.tipo,
      severidade: formData.severidade,
      titulo: formData.titulo,
      mensagem: formData.mensagem,
      entidadeTipo: formData.entidadeTipo || undefined,
      entidadeId: formData.entidadeId || undefined,
    });
  };

  const handleEdit = (alerta: any) => {
    setEditingAlerta(alerta);
    setFormData({
      tipo: alerta.tipo,
      severidade: alerta.severidade,
      titulo: alerta.titulo,
      mensagem: alerta.mensagem,
      entidadeTipo: alerta.entidadeTipo || "",
      entidadeId: alerta.entidadeId || undefined,
    });
    setOpenEdit(true);
  };

  const handleUpdate = () => {
    if (!formData.titulo || !formData.mensagem) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    updateMutation.mutate({
      id: editingAlerta.id,
      tipo: formData.tipo,
      severidade: formData.severidade,
      titulo: formData.titulo,
      mensagem: formData.mensagem,
      entidadeTipo: formData.entidadeTipo || undefined,
      entidadeId: formData.entidadeId || undefined,
    });
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Tem certeza que deseja excluir este alerta?");
    if (!confirmed) return;
    deleteMutation.mutate({ id });
  };

  const handleMarcarLido = (id: number) => {
    marcarLidoMutation.mutate({ id });
  };

  // Helper functions
  const getSeverityIcon = (severidade: string) => {
    switch (severidade) {
      case "Critico":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "Aviso":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "Info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getSeverityBadge = (severidade: string) => {
    switch (severidade) {
      case "Critico":
        return <Badge variant="destructive">{severidade}</Badge>;
      case "Aviso":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">{severidade}</Badge>;
      case "Info":
        return <Badge variant="secondary">{severidade}</Badge>;
      default:
        return <Badge>{severidade}</Badge>;
    }
  };

  const getTipoBadge = (tipo: string) => {
    const colors: Record<string, string> = {
      Vencimento: "bg-orange-500 hover:bg-orange-600",
      MargemNegativa: "bg-red-500 hover:bg-red-600",
      SaldoBaixo: "bg-yellow-500 hover:bg-yellow-600",
      NovoRegistro: "bg-blue-500 hover:bg-blue-600",
    };
    return <Badge className={colors[tipo] || ""}>{tipo}</Badge>;
  };

  const alertasNaoLidos = alertas?.filter((a) => !a.lido).length || 0;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Alertas do Sistema</h1>
          <p className="text-muted-foreground">Notificações e avisos importantes</p>
        </div>
        <div className="flex items-center gap-4">
          {alertasNaoLidos > 0 && (
            <Badge variant="destructive" className="text-lg px-4 py-2">
              {alertasNaoLidos} não lidos
            </Badge>
          )}
          <Button onClick={() => setOpenCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Alerta
          </Button>
        </div>
      </div>

      {/* Lista de Alertas */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : alertas && alertas.length > 0 ? (
        <div className="space-y-4">
          {alertas.map((alerta) => (
            <Card key={alerta.id} className={!alerta.lido ? "border-l-4 border-l-primary" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(alerta.severidade || "Info")}
                    <div>
                      <CardTitle className="text-lg">{alerta.titulo}</CardTitle>
                      <CardDescription className="mt-1">
                        {new Date(alerta.createdAt).toLocaleString("pt-BR")}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(alerta.severidade || "Info")}
                    {alerta.lido ? (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Lido
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarcarLido(alerta.id)}
                        disabled={marcarLidoMutation.isPending}
                      >
                        {marcarLidoMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Marcar Lido
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(alerta)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(alerta.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">{alerta.mensagem}</p>
                <div className="flex gap-2">
                  {getTipoBadge(alerta.tipo)}
                  {alerta.entidadeTipo && (
                    <Badge variant="outline">
                      {alerta.entidadeTipo} #{alerta.entidadeId}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Info className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum alerta no momento</p>
            <p className="text-sm text-muted-foreground mt-2">
              Clique em "Novo Alerta" para criar um
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Criação */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Alerta</DialogTitle>
            <DialogDescription>Crie um novo alerta para o sistema</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vencimento">Vencimento</SelectItem>
                    <SelectItem value="MargemNegativa">Margem Negativa</SelectItem>
                    <SelectItem value="SaldoBaixo">Saldo Baixo</SelectItem>
                    <SelectItem value="NovoRegistro">Novo Registro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="severidade">Severidade *</Label>
                <Select
                  value={formData.severidade}
                  onValueChange={(value: any) => setFormData({ ...formData, severidade: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Info">Info</SelectItem>
                    <SelectItem value="Aviso">Aviso</SelectItem>
                    <SelectItem value="Critico">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Conta a vencer em 3 dias"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mensagem">Mensagem *</Label>
              <Textarea
                id="mensagem"
                value={formData.mensagem}
                onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                placeholder="Descreva o alerta..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entidadeTipo">Entidade (opcional)</Label>
                <Input
                  id="entidadeTipo"
                  value={formData.entidadeTipo}
                  onChange={(e) => setFormData({ ...formData, entidadeTipo: e.target.value })}
                  placeholder="Ex: Conta, Empresa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entidadeId">ID da Entidade (opcional)</Label>
                <Input
                  id="entidadeId"
                  type="number"
                  value={formData.entidadeId || ""}
                  onChange={(e) => setFormData({ ...formData, entidadeId: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Ex: 123"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Alerta"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Alerta</DialogTitle>
            <DialogDescription>Atualize as informações do alerta</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vencimento">Vencimento</SelectItem>
                    <SelectItem value="MargemNegativa">Margem Negativa</SelectItem>
                    <SelectItem value="SaldoBaixo">Saldo Baixo</SelectItem>
                    <SelectItem value="NovoRegistro">Novo Registro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-severidade">Severidade *</Label>
                <Select
                  value={formData.severidade}
                  onValueChange={(value: any) => setFormData({ ...formData, severidade: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Info">Info</SelectItem>
                    <SelectItem value="Aviso">Aviso</SelectItem>
                    <SelectItem value="Critico">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-titulo">Título *</Label>
              <Input
                id="edit-titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-mensagem">Mensagem *</Label>
              <Textarea
                id="edit-mensagem"
                value={formData.mensagem}
                onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-entidadeTipo">Entidade (opcional)</Label>
                <Input
                  id="edit-entidadeTipo"
                  value={formData.entidadeTipo}
                  onChange={(e) => setFormData({ ...formData, entidadeTipo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-entidadeId">ID da Entidade (opcional)</Label>
                <Input
                  id="edit-entidadeId"
                  type="number"
                  value={formData.entidadeId || ""}
                  onChange={(e) => setFormData({ ...formData, entidadeId: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
