import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Users } from "lucide-react";

export default function Funcionarios() {
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const deleteMutation = trpc.funcionarios.delete.useMutation({
    onSuccess: () => {
      toast.success("Funcionário excluído!");
      utils.funcionarios.list.invalidate();
    },
  });

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
                    <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate({ id: func.id })}>
                      Excluir
                    </Button>
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
