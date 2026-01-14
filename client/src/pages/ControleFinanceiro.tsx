import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { Pencil, Trash2, Plus, TrendingUp, DollarSign, Building2 } from "lucide-react";

interface FormData {
  empresaId: number;
  nomeConta: string;
  banco: string;
  agencia: string;
  conta: string;
  tipo: "PJ" | "PF";
  saldoAtual: number;
  observacoes?: string;
}

export default function ControleFinanceiro() {
  const showToast = (title: string, description: string, variant?: string) => {
    console.log(`[${title}] ${description}`);
  };
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedEmpresa, setSelectedEmpresa] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    empresaId: 0,
    nomeConta: "",
    banco: "",
    agencia: "",
    conta: "",
    tipo: "PJ",
    saldoAtual: 0,
    observacoes: "",
  });

  // Queries
  const { data: empresas } = trpc.empresas.list.useQuery();
  const { data: contas, refetch: refetchContas } = trpc.contasBancarias.list.useQuery();
  const { data: saldosPorEmpresa } = trpc.contasBancarias.saldosPorEmpresa.useQuery();
  const { data: saldoGeral } = trpc.contasBancarias.saldoGeral.useQuery();
  const { data: variacao } = trpc.contasBancarias.variacaoSaldo.useQuery();

  // Mutations
  const createMutation = trpc.contasBancarias.create.useMutation({
    onSuccess: () => {
      showToast("Sucesso", "Conta bancária criada com sucesso!");
      refetchContas();
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      showToast("Erro", error.message, "destructive");
    },
  });

  const updateMutation = trpc.contasBancarias.update.useMutation({
    onSuccess: () => {
      showToast("Sucesso", "Conta bancária atualizada com sucesso!");
      refetchContas();
      setIsEditOpen(false);
      resetForm();
    },
    onError: (error) => {
      showToast("Erro", error.message, "destructive");
    },
  });

  const deleteMutation = trpc.contasBancarias.delete.useMutation({
    onSuccess: () => {
      showToast("Sucesso", "Conta bancária deletada com sucesso!");
      refetchContas();
    },
    onError: (error) => {
      showToast("Erro", error.message, "destructive");
    },
  });

  const resetForm = () => {
    setFormData({
      empresaId: 0,
      nomeConta: "",
      banco: "",
      agencia: "",
      conta: "",
      tipo: "PJ",
      saldoAtual: 0,
      observacoes: "",
    });
    setEditingId(null);
  };

  const handleCreate = () => {
    if (!formData.empresaId || !formData.nomeConta || !formData.banco || !formData.agencia || !formData.conta) {
      showToast("Erro", "Preencha todos os campos obrigatórios!", "destructive");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!editingId) return;
    updateMutation.mutate({
      id: editingId,
      ...formData,
    });
  };

  const handleEdit = (conta: any) => {
    setFormData({
      empresaId: conta.empresaId,
      nomeConta: conta.nomeConta,
      banco: conta.banco,
      agencia: conta.agencia,
      conta: conta.conta,
      tipo: conta.tipo,
      saldoAtual: Number(conta.saldoAtual),
      observacoes: conta.observacoes,
    });
    setEditingId(conta.id);
    setIsEditOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta conta?")) {
      deleteMutation.mutate({ id });
    }
  };

  // Filtrar contas por empresa selecionada
  const contasFiltradas = useMemo(() => {
    if (!contas) return [];
    if (!selectedEmpresa) return contas;
    return contas.filter((c) => c.empresaId === selectedEmpresa);
  }, [contas, selectedEmpresa]);

  // Calcular saldo total das contas filtradas
  const saldoTotalFiltrado = useMemo(() => {
    return contasFiltradas.reduce((acc, conta) => acc + Number(conta.saldoAtual), 0);
  }, [contasFiltradas]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Controle Financeiro Consolidado</h1>
          <p className="text-gray-600 mt-1">Gestão de saldos de contas bancárias PJ</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Conta
        </Button>
      </div>

      {/* Indicadores Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Saldo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatCurrency(saldoGeral?.saldoTotal || 0)}</div>
              <DollarSign className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
            <p className="text-xs text-gray-500 mt-1">{saldoGeral?.quantidadeContas || 0} contas ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Empresas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{saldoGeral?.quantidadeEmpresas || 0}</div>
              <Building2 className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Grupos econômicos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Variação Diária</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${(variacao?.variacaoDiaria || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(variacao?.variacaoDiaria || 0)}
              </div>
              <TrendingUp className={`w-8 h-8 opacity-50 ${(variacao?.variacaoDiaria || 0) >= 0 ? "text-green-500" : "text-red-500"}`} />
            </div>
            <p className="text-xs text-gray-500 mt-1">{variacao?.percentualDiario || 0}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Variação Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${(variacao?.variacaoMensal || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(variacao?.variacaoMensal || 0)}
              </div>
              <TrendingUp className={`w-8 h-8 opacity-50 ${(variacao?.variacaoMensal || 0) >= 0 ? "text-green-500" : "text-red-500"}`} />
            </div>
            <p className="text-xs text-gray-500 mt-1">{variacao?.percentualMensal || 0}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Consolidação por Empresa */}
      <Card>
        <CardHeader>
          <CardTitle>Consolidação por Empresa</CardTitle>
          <CardDescription>Saldo total de contas por empresa do grupo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button
              variant={selectedEmpresa === null ? "default" : "outline"}
              onClick={() => setSelectedEmpresa(null)}
              className="w-full justify-start"
            >
              Todas as Empresas - {formatCurrency(saldoGeral?.saldoTotal || 0)}
            </Button>
            {saldosPorEmpresa?.map((item) => {
              const empresa = empresas?.find((e) => e.id === item.empresaId);
              return (
                <Button
                  key={item.empresaId}
                  variant={selectedEmpresa === item.empresaId ? "default" : "outline"}
                  onClick={() => setSelectedEmpresa(item.empresaId)}
                  className="w-full justify-between"
                >
                  <span>{empresa?.nomeFantasia || empresa?.razaoSocial || "Empresa"}</span>
                  <span className="font-bold">{formatCurrency(item.saldoTotal)}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Listagem de Contas */}
      <Card>
        <CardHeader>
          <CardTitle>Contas Bancárias {selectedEmpresa && `- ${empresas?.find((e) => e.id === selectedEmpresa)?.nomeFantasia}`}</CardTitle>
          <CardDescription>Saldo total: {formatCurrency(saldoTotalFiltrado)}</CardDescription>
        </CardHeader>
        <CardContent>
          {contasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma conta bancária cadastrada</p>
            </div>
          ) : (
            <div className="space-y-2">
              {contasFiltradas.map((conta) => (
                <div
                  key={conta.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{conta.nomeConta}</h4>
                    <p className="text-sm text-gray-600">
                      {conta.banco} - Ag: {conta.agencia} | Conta: {conta.conta}
                    </p>
                    <p className="text-sm text-gray-500">{conta.tipo}</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="text-lg font-bold text-green-600">{formatCurrency(Number(conta.saldoAtual))}</p>
                    <p className="text-xs text-gray-500">
                      {conta.status === "Ativa" ? "✓ Ativa" : "✗ Inativa"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(conta)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(conta.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criação */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Conta Bancária</DialogTitle>
            <DialogDescription>Cadastre uma nova conta bancária PJ</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Empresa *</Label>
              <Select value={String(formData.empresaId)} onValueChange={(v) => setFormData({ ...formData, empresaId: Number(v) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas?.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.nomeFantasia || e.razaoSocial}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Nome da Conta *</Label>
              <Input
                value={formData.nomeConta}
                onChange={(e) => setFormData({ ...formData, nomeConta: e.target.value })}
                placeholder="Ex: Conta Corrente Principal"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Banco *</Label>
                <Input
                  value={formData.banco}
                  onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                  placeholder="Ex: Bradesco"
                />
              </div>
              <div>
                <Label>Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v as "PJ" | "PF" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="PF">PF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Agência *</Label>
                <Input
                  value={formData.agencia}
                  onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                  placeholder="Ex: 1234"
                />
              </div>
              <div>
                <Label>Conta *</Label>
                <Input
                  value={formData.conta}
                  onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                  placeholder="Ex: 123456-7"
                />
              </div>
            </div>

            <div>
              <Label>Saldo Atual (R$) *</Label>
              <Input
                type="number"
                value={formData.saldoAtual}
                onChange={(e) => setFormData({ ...formData, saldoAtual: Number(e.target.value) })}
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Adicione observações sobre a conta..."
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Criando..." : "Criar Conta"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Conta Bancária</DialogTitle>
            <DialogDescription>Atualize os dados da conta bancária</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Empresa *</Label>
              <Select value={String(formData.empresaId)} onValueChange={(v) => setFormData({ ...formData, empresaId: Number(v) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas?.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.nomeFantasia || e.razaoSocial}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Nome da Conta *</Label>
              <Input
                value={formData.nomeConta}
                onChange={(e) => setFormData({ ...formData, nomeConta: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Banco *</Label>
                <Input
                  value={formData.banco}
                  onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                />
              </div>
              <div>
                <Label>Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v as "PJ" | "PF" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="PF">PF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Agência *</Label>
                <Input
                  value={formData.agencia}
                  onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                />
              </div>
              <div>
                <Label>Conta *</Label>
                <Input
                  value={formData.conta}
                  onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Saldo Atual (R$) *</Label>
              <Input
                type="number"
                value={formData.saldoAtual}
                onChange={(e) => setFormData({ ...formData, saldoAtual: Number(e.target.value) })}
                step="0.01"
              />
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Atualizando..." : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
