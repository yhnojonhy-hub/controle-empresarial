import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Users, Pencil, Trash2 } from "lucide-react";

export default function Funcionarios() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<any>(null);
  const utils = trpc.useUtils();

  const { data: funcionarios, isLoading } = trpc.funcionarios.list.useQuery();
  const { data: empresas } = trpc.empresas.list.useQuery();

  const createMutation = trpc.funcionarios.create.useMutation({
    onSuccess: () => {
      toast.success("Funcionário cadastrado!");
      utils.funcionarios.list.invalidate();
      setDialogOpen(false);
    },
  });

  const updateMutation = trpc.funcionarios.update.useMutation({
    onSuccess: () => {
      toast.success("Funcionário atualizado com sucesso!");
      utils.funcionarios.list.invalidate();
      setEditOpen(false);
      setEditingFuncionario(null);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteMutation = trpc.funcionarios.delete.useMutation({
    onSuccess: () => {
      toast.success("Funcionário excluído!");
      utils.funcionarios.list.invalidate();
    },
  });

  const handleEdit = (funcionario: any) => {
    setEditingFuncionario({
      ...funcionario,
      dataAdmissao: funcionario.dataAdmissao ? new Date(funcionario.dataAdmissao).toISOString().split('T')[0] : "",
    });
    setEditOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      empresaId: parseInt(formData.get("empresaId") as string),
      nome: formData.get("nome") as string,
      cpf: formData.get("cpf") as string,
      cargo: formData.get("cargo") as string,
      salarioBase: formData.get("salarioBase") as string,
      beneficios: formData.get("beneficios") as string,
      dataAdmissao: formData.get("dataAdmissao") as string,
      status: formData.get("status") as any,
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingFuncionario.id,
      data: {
        empresaId: parseInt(formData.get("empresaId") as string),
        nome: formData.get("nome") as string,
        cpf: formData.get("cpf") as string,
        cargo: formData.get("cargo") as string,
        salarioBase: formData.get("salarioBase") as string,
        beneficios: formData.get("beneficios") as string,
        dataAdmissao: formData.get("dataAdmissao") as string,
        status: formData.get("status") as any,
      },
    });
  };

  if (isLoading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Funcionários</h1>
          <p className="text-muted-foreground">Gestão de colaboradores</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Novo Funcionário</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Cadastrar Funcionário</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Empresa *</Label>
                <Select name="empresaId" required>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {empresas?.map((e) => (
                      <SelectItem key={e.id} value={e.id.toString()}>
                        {e.nomeFantasia || e.razaoSocial}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input name="nome" required />
                </div>
                <div className="space-y-2">
                  <Label>CPF *</Label>
                  <Input name="cpf" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cargo *</Label>
                  <Input name="cargo" required />
                </div>
                <div className="space-y-2">
                  <Label>Data Admissão *</Label>
                  <Input name="dataAdmissao" type="date" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Salário Base *</Label>
                  <Input name="salarioBase" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label>Benefícios</Label>
                  <Input name="beneficios" type="number" step="0.01" defaultValue="0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select name="status" defaultValue="Contratado" required>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Contratado">Contratado</SelectItem>
                    <SelectItem value="Demitido">Demitido</SelectItem>
                    <SelectItem value="Afastado">Afastado</SelectItem>
                  </SelectContent>
                </Select>
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
            <DialogTitle>Editar Funcionário</DialogTitle>
          </DialogHeader>
          {editingFuncionario && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Empresa *</Label>
                <Select name="empresaId" required defaultValue={editingFuncionario.empresaId?.toString()}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {empresas?.map((e) => (
                      <SelectItem key={e.id} value={e.id.toString()}>
                        {e.nomeFantasia || e.razaoSocial}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input name="nome" required defaultValue={editingFuncionario.nome} />
                </div>
                <div className="space-y-2">
                  <Label>CPF *</Label>
                  <Input name="cpf" required defaultValue={editingFuncionario.cpf} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cargo *</Label>
                  <Input name="cargo" required defaultValue={editingFuncionario.cargo} />
                </div>
                <div className="space-y-2">
                  <Label>Data Admissão *</Label>
                  <Input name="dataAdmissao" type="date" required defaultValue={editingFuncionario.dataAdmissao} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Salário Base *</Label>
                  <Input name="salarioBase" type="number" step="0.01" required defaultValue={editingFuncionario.salarioBase} />
                </div>
                <div className="space-y-2">
                  <Label>Benefícios</Label>
                  <Input name="beneficios" type="number" step="0.01" defaultValue={editingFuncionario.beneficios} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select name="status" required defaultValue={editingFuncionario.status}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Contratado">Contratado</SelectItem>
                    <SelectItem value="Demitido">Demitido</SelectItem>
                    <SelectItem value="Afastado">Afastado</SelectItem>
                  </SelectContent>
                </Select>
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
        {funcionarios && funcionarios.length > 0 ? (
          funcionarios.map((func) => {
            const empresa = empresas?.find((e) => e.id === func.empresaId);
            const custoTotal = parseFloat(func.salarioBase) + parseFloat(func.beneficios);
            return (
              <Card key={func.id}>
                <CardHeader>
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>{func.nome}</CardTitle>
                      <CardDescription>{func.cargo} • {empresa?.nomeFantasia || empresa?.razaoSocial}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(func)}>
                        <Pencil className="h-4 w-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: func.id })}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Salário Base:</span>
                      <div className="font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(func.salarioBase))}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Benefícios:</span>
                      <div>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(func.beneficios))}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Custo Total:</span>
                      <div className="font-bold text-blue-600">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(custoTotal)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <div>{func.status}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card><CardContent className="py-12 text-center"><Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><p>Nenhum funcionário cadastrado</p></CardContent></Card>
        )}
      </div>
    </div>
  );
}
