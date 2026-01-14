import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, CreditCard, Calendar, AlertCircle, Pencil, Trash2 } from "lucide-react";

export default function Contas() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingConta, setEditingConta] = useState<any>(null);
  const utils = trpc.useUtils();

  const { data: contas, isLoading } = trpc.contas.list.useQuery();
  const { data: empresas } = trpc.empresas.list.useQuery();

  const createMutation = trpc.contas.create.useMutation({
    onSuccess: () => {
      toast.success("Conta registrada com sucesso!");
      utils.contas.list.invalidate();
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateMutation = trpc.contas.update.useMutation({
    onSuccess: () => {
      toast.success("Conta atualizada com sucesso!");
      utils.contas.list.invalidate();
      setEditOpen(false);
      setEditingConta(null);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteMutation = trpc.contas.delete.useMutation({
    onSuccess: () => {
      toast.success("Conta excluída!");
      utils.contas.list.invalidate();
    },
  });

  const handleEdit = (conta: any) => {
    setEditingConta({
      ...conta,
      dataVencimento: conta.dataVencimento ? new Date(conta.dataVencimento).toISOString().split('T')[0] : "",
    });
    setEditOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      empresaId: parseInt(formData.get("empresaId") as string),
      tipo: formData.get("tipo") as any,
      descricao: formData.get("descricao") as string,
      categoria: formData.get("categoria") as string,
      valor: formData.get("valor") as string,
      dataVencimento: formData.get("dataVencimento") as string,
      status: formData.get("status") as any,
      metodoPagamento: formData.get("metodoPagamento") as string,
      observacoes: formData.get("observacoes") as string,
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingConta.id,
      data: {
        empresaId: parseInt(formData.get("empresaId") as string),
        tipo: formData.get("tipo") as any,
        descricao: formData.get("descricao") as string,
        categoria: formData.get("categoria") as string,
        valor: formData.get("valor") as string,
        dataVencimento: formData.get("dataVencimento") as string,
        status: formData.get("status") as any,
        metodoPagamento: formData.get("metodoPagamento") as string,
        observacoes: formData.get("observacoes") as string,
      },
    });
  };

  if (isLoading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contas a Pagar/Receber</h1>
          <p className="text-muted-foreground">Gestão de contas e pagamentos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Nova Conta</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Conta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Empresa *</Label>
                  <Select name="empresaId" required>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {empresas?.map((e) => (
                        <SelectItem key={e.id} value={e.id.toString()}>
                          {e.nomeFantasia || e.razaoSocial}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select name="tipo" required>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pagar">A Pagar</SelectItem>
                      <SelectItem value="Receber">A Receber</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Input name="descricao" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select name="categoria" required>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fornecedores">Fornecedores</SelectItem>
                      <SelectItem value="Salários">Salários</SelectItem>
                      <SelectItem value="Impostos">Impostos</SelectItem>
                      <SelectItem value="Aluguel">Aluguel</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor *</Label>
                  <Input name="valor" type="number" step="0.01" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vencimento *</Label>
                  <Input name="dataVencimento" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Select name="status" defaultValue="Pendente" required>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Pago">Pago</SelectItem>
                      <SelectItem value="Atrasado">Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Método</Label>
                <Select name="metodoPagamento">
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                    <SelectItem value="Boleto">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea name="observacoes" rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Conta</DialogTitle>
            <DialogDescription>Atualize as informações da conta</DialogDescription>
          </DialogHeader>
          {editingConta && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Empresa *</Label>
                  <Select name="empresaId" required defaultValue={editingConta.empresaId?.toString()}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {empresas?.map((e) => (
                        <SelectItem key={e.id} value={e.id.toString()}>
                          {e.nomeFantasia || e.razaoSocial}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select name="tipo" required defaultValue={editingConta.tipo}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pagar">A Pagar</SelectItem>
                      <SelectItem value="Receber">A Receber</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Input name="descricao" required defaultValue={editingConta.descricao} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select name="categoria" required defaultValue={editingConta.categoria}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fornecedores">Fornecedores</SelectItem>
                      <SelectItem value="Salários">Salários</SelectItem>
                      <SelectItem value="Impostos">Impostos</SelectItem>
                      <SelectItem value="Aluguel">Aluguel</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor *</Label>
                  <Input name="valor" type="number" step="0.01" required defaultValue={editingConta.valor} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vencimento *</Label>
                  <Input name="dataVencimento" type="date" required defaultValue={editingConta.dataVencimento} />
                </div>
                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Select name="status" required defaultValue={editingConta.status}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Pago">Pago</SelectItem>
                      <SelectItem value="Atrasado">Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Método</Label>
                <Select name="metodoPagamento" defaultValue={editingConta.metodoPagamento || ""}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                    <SelectItem value="Boleto">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea name="observacoes" rows={3} defaultValue={editingConta.observacoes || ""} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {contas && contas.length > 0 ? (
          contas.map((conta) => {
            const empresa = empresas?.find((e) => e.id === conta.empresaId);
            return (
              <Card key={conta.id}>
                <CardHeader>
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>{conta.descricao}</CardTitle>
                      <CardDescription>{empresa?.nomeFantasia || empresa?.razaoSocial}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(conta)}>
                        <Pencil className="h-4 w-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: conta.id })}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Valor:</span>
                      <div className="font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(conta.valor))}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Vencimento:</span>
                      <div>{new Date(conta.dataVencimento).toLocaleDateString("pt-BR")}</div>
                    </div>
                    <div>
                      <Badge>{conta.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card><CardContent className="py-12 text-center">Nenhuma conta registrada</CardContent></Card>
        )}
      </div>
    </div>
  );
}
