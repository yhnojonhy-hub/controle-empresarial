import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Calculator, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

export default function Impostos() {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editingImposto, setEditingImposto] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: impostos, isLoading } = trpc.financeiro.impostos.list.useQuery();
  const { data: empresas } = trpc.empresas.list.useQuery();

  const createImposto = trpc.financeiro.impostos.create.useMutation({
    onSuccess: () => {
      utils.financeiro.impostos.list.invalidate();
      setOpen(false);
      setFormData({});
      toast.success("Imposto cadastrado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar imposto: " + error.message);
    },
  });

  const updateImposto = trpc.financeiro.impostos.update.useMutation({
    onSuccess: () => {
      utils.financeiro.impostos.list.invalidate();
      setEditOpen(false);
      setEditingImposto(null);
      toast.success("Imposto atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar imposto: " + error.message);
    },
  });

  const deleteImposto = trpc.financeiro.impostos.delete.useMutation({
    onSuccess: () => {
      utils.financeiro.impostos.list.invalidate();
      toast.success("Imposto deletado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao deletar imposto: " + error.message);
    },
  });

  const handleEdit = (imposto: any) => {
    setEditingImposto({
      ...imposto,
      mesAno: imposto.mesAno,
      vencimento: imposto.vencimento ? new Date(imposto.vencimento).toISOString().split('T')[0] : "",
    });
    setEditOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createImposto.mutate(formData);
  };

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateImposto.mutate({
      id: editingImposto.id,
      data: {
        empresaId: parseInt(formData.get("empresaId") as string),
        mesAno: formData.get("mesAno") as string,
        tipo: formData.get("tipo") as string,
        baseCalculo: formData.get("baseCalculo") as string,
        aliquota: formData.get("aliquota") as string,
        vencimento: formData.get("vencimento") as string,
      },
    });
  };

  const handleDelete = (id: number, tipo: string) => {
    if (window.confirm(`Tem certeza que deseja deletar o imposto "${tipo}"?`)) {
      deleteImposto.mutate({ id });
    }
  };

  const calcularValor = (baseCalculo: string, aliquota: string) => {
    const base = parseFloat(baseCalculo || "0");
    const aliq = parseFloat(aliquota || "0") / 100;
    return base * aliq;
  };

  const totalImpostos = impostos?.reduce((acc, imp) => {
    const valor = calcularValor(imp.baseCalculo || "0", imp.aliquota || "0");
    return acc + valor;
  }, 0) || 0;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Impostos</h1>
          <p className="text-muted-foreground">Gestão de tributos e obrigações fiscais</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Imposto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Imposto</DialogTitle>
              <DialogDescription>Registre um imposto ou tributo</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="empresaId">Empresa *</Label>
                <Select value={formData.empresaId?.toString() || ""} onValueChange={(value) => setFormData({ ...formData, empresaId: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas?.map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id.toString()}>
                        {empresa.nomeFantasia || empresa.razaoSocial}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mesAno">Mês/Ano</Label>
                <Input
                  id="mesAno"
                  type="month"
                  value={formData.mesAno || ""}
                  onChange={(e) => setFormData({ ...formData, mesAno: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo de Imposto *</Label>
                <Input
                  id="tipo"
                  required
                  value={formData.tipo || ""}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  placeholder="Ex: ICMS, PIS, COFINS, IRPJ"
                />
              </div>

              <div>
                <Label htmlFor="baseCalculo">Base de Cálculo (R$) *</Label>
                <Input
                  id="baseCalculo"
                  type="number"
                  step="0.01"
                  required
                  value={formData.baseCalculo || ""}
                  onChange={(e) => setFormData({ ...formData, baseCalculo: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="aliquota">Alíquota (%) *</Label>
                <Input
                  id="aliquota"
                  type="number"
                  step="0.01"
                  required
                  value={formData.aliquota || ""}
                  onChange={(e) => setFormData({ ...formData, aliquota: e.target.value })}
                />
              </div>

              {formData.baseCalculo && formData.aliquota && (
                <div className="p-3 bg-muted rounded-md">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Valor Calculado: R$ {calcularValor(formData.baseCalculo, formData.aliquota).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="vencimento">Vencimento *</Label>
                <Input
                  id="vencimento"
                  type="date"
                  required
                  value={formData.vencimento || ""}
                  onChange={(e) => setFormData({ ...formData, vencimento: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createImposto.isPending}>
                  {createImposto.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
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
            <DialogTitle>Editar Imposto</DialogTitle>
            <DialogDescription>Atualize os dados do imposto</DialogDescription>
          </DialogHeader>
          {editingImposto && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-empresaId">Empresa *</Label>
                <Select name="empresaId" required defaultValue={editingImposto.empresaId?.toString()}>
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
                <div>
                  <Label htmlFor="edit-mesAno">Mês/Ano *</Label>
                  <Input
                    id="edit-mesAno"
                    name="mesAno"
                    type="month"
                    required
                    defaultValue={editingImposto.mesAno}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-tipo">Tipo de Imposto *</Label>
                  <Select name="tipo" required defaultValue={editingImposto.tipo}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ICMS">ICMS</SelectItem>
                      <SelectItem value="ISS">ISS</SelectItem>
                      <SelectItem value="PIS">PIS</SelectItem>
                      <SelectItem value="COFINS">COFINS</SelectItem>
                      <SelectItem value="IRPJ">IRPJ</SelectItem>
                      <SelectItem value="CSLL">CSLL</SelectItem>
                      <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-baseCalculo">Base de Cálculo *</Label>
                  <Input
                    id="edit-baseCalculo"
                    name="baseCalculo"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingImposto.baseCalculo}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-aliquota">Alíquota (%) *</Label>
                  <Input
                    id="edit-aliquota"
                    name="aliquota"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingImposto.aliquota}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-vencimento">Vencimento *</Label>
                <Input
                  id="edit-vencimento"
                  name="vencimento"
                  type="date"
                  required
                  defaultValue={editingImposto.vencimento}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateImposto.isPending}>
                  {updateImposto.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Salvar Alterações
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total de Impostos</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-bold text-red-600">
            R$ {totalImpostos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : impostos && impostos.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Impostos Cadastrados</CardTitle>
            <CardDescription>Total: {impostos.length} registros</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mês/Ano</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Base Cálculo</TableHead>
                  <TableHead className="text-right">Alíquota</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {impostos.map((imposto) => {
                  const valor = calcularValor(imposto.baseCalculo || "0", imposto.aliquota || "0");
                  return (
                    <TableRow key={imposto.id}>
                      <TableCell>{imposto.mesAno}</TableCell>
                      <TableCell className="font-medium">{imposto.tipoImposto}</TableCell>
                      <TableCell className="text-right">
                        R$ {parseFloat(imposto.baseCalculo || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">{imposto.aliquota}%</TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        R$ {valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{new Date(imposto.vencimento).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(imposto)}
                          >
                            <Pencil className="w-4 h-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(imposto.id, imposto.tipoImposto || "Imposto")}
                            disabled={deleteImposto.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum imposto cadastrado</p>
            <Button onClick={() => setOpen(true)} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Imposto
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
