import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, TrendingUp, TrendingDown, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

export default function FluxoCaixa() {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editingFluxo, setEditingFluxo] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: fluxos, isLoading } = trpc.financeiro.fluxoCaixa.list.useQuery();

  const createFluxo = trpc.financeiro.fluxoCaixa.create.useMutation({
    onSuccess: () => {
      utils.financeiro.fluxoCaixa.list.invalidate();
      setOpen(false);
      setFormData({});
      toast.success("Movimentação cadastrada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar movimentação: " + error.message);
    },
  });

  const updateFluxo = trpc.financeiro.fluxoCaixa.update.useMutation({
    onSuccess: () => {
      utils.financeiro.fluxoCaixa.list.invalidate();
      setEditOpen(false);
      setEditingFluxo(null);
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

  const handleEdit = (fluxo: any) => {
    setEditingFluxo({
      ...fluxo,
      data: fluxo.data ? new Date(fluxo.data).toISOString().split('T')[0] : "",
    });
    setEditOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFluxo.mutate(formData);
  };

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateFluxo.mutate({
      id: editingFluxo.id,
      data: {
        data: formData.get("data") as string,
        tipo: formData.get("tipo") as any,
        descricao: formData.get("descricao") as string,
        categoria: formData.get("categoria") as string,
        valor: formData.get("valor") as string,
      },
    });
  };

  const handleDelete = (id: number, descricao: string) => {
    if (window.confirm(`Tem certeza que deseja deletar "${descricao}"?`)) {
      deleteFluxo.mutate({ id });
    }
  };

  const totalEntradas = fluxos?.filter(f => f.tipo === "Entrada").reduce((acc, f) => acc + parseFloat(f.valor || "0"), 0) || 0;
  const totalSaidas = fluxos?.filter(f => f.tipo === "Saida").reduce((acc, f) => acc + parseFloat(f.valor || "0"), 0) || 0;
  const saldo = totalEntradas - totalSaidas;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">Controle de entradas e saídas financeiras</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Movimentação</DialogTitle>
              <DialogDescription>Registre uma entrada ou saída no fluxo de caixa</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  required
                  value={formData.data || ""}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={formData.tipo || ""} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entrada">Entrada</SelectItem>
                    <SelectItem value="Saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição *</Label>
                <Input
                  id="descricao"
                  required
                  value={formData.descricao || ""}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="categoria">Categoria *</Label>
                <Input
                  id="categoria"
                  required
                  value={formData.categoria || ""}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="Ex: Vendas, Compras, Salários"
                />
              </div>

              <div>
                <Label htmlFor="valor">Valor (R$) *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  required
                  value={formData.valor || ""}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createFluxo.isPending}>
                  {createFluxo.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Salvar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Movimentação</DialogTitle>
            <DialogDescription>Atualize os dados da movimentação financeira</DialogDescription>
          </DialogHeader>
          {editingFluxo && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Input name="data" type="date" required defaultValue={editingFluxo.data} />
                </div>
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select name="tipo" required defaultValue={editingFluxo.tipo}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entrada">Entrada</SelectItem>
                      <SelectItem value="Saida">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Input name="descricao" required defaultValue={editingFluxo.descricao} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select name="categoria" required defaultValue={editingFluxo.categoria}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vendas">Vendas</SelectItem>
                      <SelectItem value="Serviços">Serviços</SelectItem>
                      <SelectItem value="Investimentos">Investimentos</SelectItem>
                      <SelectItem value="Fornecedores">Fornecedores</SelectItem>
                      <SelectItem value="Salários">Salários</SelectItem>
                      <SelectItem value="Impostos">Impostos</SelectItem>
                      <SelectItem value="Despesas Operacionais">Despesas Operacionais</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor *</Label>
                  <Input name="valor" type="number" step="0.01" required defaultValue={editingFluxo.valor} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={updateFluxo.isPending}>
                  {updateFluxo.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Entradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold text-green-600">
                R$ {totalEntradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Saídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <span className="text-2xl font-bold text-red-600">
                R$ {totalSaidas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`text-2xl font-bold ${saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
              R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : fluxos && fluxos.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Movimentações</CardTitle>
            <CardDescription>Total: {fluxos.length} registros</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fluxos.map((fluxo) => (
                  <TableRow key={fluxo.id}>
                    <TableCell>{new Date(fluxo.data).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <Badge variant={fluxo.tipo === "Entrada" ? "default" : "destructive"}>
                        {fluxo.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>{fluxo.descricao}</TableCell>
                    <TableCell>{fluxo.categoria}</TableCell>
                    <TableCell className={`text-right font-medium ${fluxo.tipo === "Entrada" ? "text-green-600" : "text-red-600"}`}>
                      R$ {parseFloat(fluxo.valor || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(fluxo)}
                        >
                          <Pencil className="w-4 h-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(fluxo.id, fluxo.descricao || "Movimentação")}
                          disabled={deleteFluxo.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhuma movimentação registrada</p>
            <Button onClick={() => setOpen(true)} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Movimentação
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
