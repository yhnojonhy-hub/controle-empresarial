import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Calculator, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Impostos() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const utils = trpc.useUtils();
  const { data: impostos, isLoading } = trpc.impostos.list.useQuery();
  const { data: empresas } = trpc.empresas.list.useQuery();

  const createImposto = trpc.impostos.create.useMutation({
    onSuccess: () => {
      utils.impostos.list.invalidate();
      setOpen(false);
      setFormData({});
      toast.success("Imposto cadastrado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar imposto: " + error.message);
    },
  });

  const deleteImposto = trpc.impostos.delete.useMutation({
    onSuccess: () => {
      utils.impostos.list.invalidate();
      toast.success("Imposto deletado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao deletar imposto: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createImposto.mutate(formData);
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
                      <TableCell className="font-medium">{imposto.tipo}</TableCell>
                      <TableCell className="text-right">
                        R$ {parseFloat(imposto.baseCalculo || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">{imposto.aliquota}%</TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        R$ {valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{new Date(imposto.vencimento).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(imposto.id, imposto.tipo || "Imposto")}
                          disabled={deleteImposto.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
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
