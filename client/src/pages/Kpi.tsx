import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, TrendingUp, DollarSign, Percent, Pencil, Trash2 } from "lucide-react";

export default function Kpi() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<any>(null);
  const utils = trpc.useUtils();

  // Queries
  const { data: kpis, isLoading } = trpc.financeiro.kpis.list.useQuery();
  const { data: empresas } = trpc.empresas.list.useQuery();

  // Mutations
  const createMutation = trpc.financeiro.kpis.create.useMutation({
    onSuccess: () => {
      toast.success("KPI registrado com sucesso!");
      utils.financeiro.kpis.list.invalidate();
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Erro ao registrar KPI: ${error.message}`);
    },
  });

  const updateMutation = trpc.financeiro.kpis.update.useMutation({
    onSuccess: () => {
      toast.success("KPI atualizado com sucesso!");
      utils.financeiro.kpis.list.invalidate();
      setEditOpen(false);
      setEditingKpi(null);
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar KPI: ${error.message}`);
    },
  });

  const deleteMutation = trpc.financeiro.kpis.delete.useMutation({
    onSuccess: () => {
      toast.success("KPI excluído com sucesso!");
      utils.financeiro.kpis.list.invalidate();
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir KPI: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createMutation.mutate({
      empresaId: parseInt(formData.get("empresaId") as string),
      mesAno: formData.get("mesAno") as string,
      faturamentoBruto: formData.get("faturamentoBruto") as string,
      impostos: formData.get("impostos") as string,
      custosFixos: formData.get("custosFixos") as string,
      custosVariaveis: formData.get("custosVariaveis") as string,
    });
  };

  const handleEdit = (kpi: any) => {
    setEditingKpi(kpi);
    setEditOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    updateMutation.mutate({
      id: editingKpi.id,
      data: {
        empresaId: parseInt(formData.get("empresaId") as string),
        mesAno: formData.get("mesAno") as string,
        faturamentoBruto: formData.get("faturamentoBruto") as string,
        impostos: formData.get("impostos") as string,
        custosFixos: formData.get("custosFixos") as string,
        custosVariaveis: formData.get("custosVariaveis") as string,
      },
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este KPI?")) {
      deleteMutation.mutate({ id });
    }
  };

  // Cálculos automáticos
  const calcularIndicadores = (kpi: any) => {
    const faturamentoBruto = parseFloat(kpi.faturamentoBruto) || 0;
    const impostos = parseFloat(kpi.impostos) || 0;
    const custosFixos = parseFloat(kpi.custosFixos) || 0;
    const custosVariaveis = parseFloat(kpi.custosVariaveis) || 0;

    const faturamentoLiquido = faturamentoBruto - impostos;
    const lucro = faturamentoLiquido - custosFixos - custosVariaveis;
    const margem = faturamentoBruto > 0 ? (lucro / faturamentoBruto) * 100 : 0;

    return { faturamentoLiquido, lucro, margem };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Indicadores KPI</h1>
          <p className="text-muted-foreground">Métricas financeiras por empresa e período</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo KPI
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Indicadores KPI</DialogTitle>
              <DialogDescription>
                Preencha os dados financeiros do período. Os cálculos serão feitos automaticamente.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="empresaId">Empresa *</Label>
                  <Select name="empresaId" required>
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

                <div className="space-y-2">
                  <Label htmlFor="mesAno">Mês/Ano *</Label>
                  <Input
                    id="mesAno"
                    name="mesAno"
                    type="month"
                    required
                    placeholder="YYYY-MM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="faturamentoBruto">Faturamento Bruto *</Label>
                  <Input
                    id="faturamentoBruto"
                    name="faturamentoBruto"
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="impostos">Impostos *</Label>
                  <Input
                    id="impostos"
                    name="impostos"
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="custosFixos">Custos Fixos *</Label>
                  <Input
                    id="custosFixos"
                    name="custosFixos"
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custosVariaveis">Custos Variáveis *</Label>
                  <Input
                    id="custosVariaveis"
                    name="custosVariaveis"
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  placeholder="Observações sobre o período..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Salvando..." : "Salvar KPI"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Indicadores KPI</DialogTitle>
            <DialogDescription>
              Atualize os dados financeiros do período.
            </DialogDescription>
          </DialogHeader>

          {editingKpi && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-empresaId">Empresa *</Label>
                  <Select name="empresaId" required defaultValue={editingKpi.empresaId?.toString()}>
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

                <div className="space-y-2">
                  <Label htmlFor="edit-mesAno">Mês/Ano *</Label>
                  <Input
                    id="edit-mesAno"
                    name="mesAno"
                    type="month"
                    required
                    defaultValue={editingKpi.mesAno}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-faturamentoBruto">Faturamento Bruto *</Label>
                  <Input
                    id="edit-faturamentoBruto"
                    name="faturamentoBruto"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingKpi.faturamentoBruto}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-impostos">Impostos *</Label>
                  <Input
                    id="edit-impostos"
                    name="impostos"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingKpi.impostos}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-custosFixos">Custos Fixos *</Label>
                  <Input
                    id="edit-custosFixos"
                    name="custosFixos"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingKpi.custosFixos}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-custosVariaveis">Custos Variáveis *</Label>
                  <Input
                    id="edit-custosVariaveis"
                    name="custosVariaveis"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingKpi.custosVariaveis}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Lista de KPIs */}
      <div className="grid gap-4">
        {kpis && kpis.length > 0 ? (
          kpis.map((kpi) => {
            const { faturamentoLiquido, lucro, margem } = calcularIndicadores(kpi);
            const empresa = empresas?.find((e) => e.id === kpi.empresaId);

            return (
              <Card key={kpi.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{empresa?.nomeFantasia || empresa?.razaoSocial}</CardTitle>
                      <CardDescription>
                        Período: {new Date(kpi.mesAno + "-01").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(kpi)}
                      >
                        <Pencil className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(kpi.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Faturamento Bruto */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        Faturamento Bruto
                      </div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(parseFloat(kpi.faturamentoBruto))}
                      </div>
                    </div>

                    {/* Faturamento Líquido */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        Faturamento Líquido
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(faturamentoLiquido)}
                      </div>
                    </div>

                    {/* Lucro/Prejuízo */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        Lucro/Prejuízo
                      </div>
                      <div className={`text-2xl font-bold ${lucro >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(lucro)}
                      </div>
                    </div>

                    {/* Margem */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Percent className="h-4 w-4" />
                        Margem
                      </div>
                      <div className={`text-2xl font-bold ${margem >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {margem.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Detalhes */}
                  <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Impostos:</span>
                      <div className="font-medium">{formatCurrency(parseFloat(kpi.impostos))}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Custos Fixos:</span>
                      <div className="font-medium">{formatCurrency(parseFloat(kpi.custosFixos))}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Custos Variáveis:</span>
                      <div className="font-medium">{formatCurrency(parseFloat(kpi.custosVariaveis))}</div>
                    </div>
                  </div>

                  {kpi.observacoes && (
                    <div className="mt-4 pt-4 border-t">
                      <span className="text-sm text-muted-foreground">Observações:</span>
                      <p className="text-sm mt-1">{kpi.observacoes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhum KPI registrado</p>
              <p className="text-sm text-muted-foreground">Clique em "Novo KPI" para começar</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
