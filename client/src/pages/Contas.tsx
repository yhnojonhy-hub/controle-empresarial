import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, CreditCard, Calendar, AlertCircle, Pencil, Trash2, DollarSign, Building2, TrendingUp } from "lucide-react";

export default function Contas() {
  const [activeTab, setActiveTab] = useState("contas-pagar-receber");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingConta, setEditingConta] = useState<any>(null);
  const [selectedEmpresa, setSelectedEmpresa] = useState<number | null>(null);
  const [isCreateBancariaOpen, setIsCreateBancariaOpen] = useState(false);
  const [isEditBancariaOpen, setIsEditBancariaOpen] = useState(false);
  const [editingBancaria, setEditingBancaria] = useState<any>(null);
  
  const utils = trpc.useUtils();

  // Queries
  const { data: contas, isLoading } = trpc.financeiro.contas.list.useQuery();
  const { data: empresas } = trpc.empresas.list.useQuery();
  const { data: contasBancarias } = trpc.contasBancarias?.list.useQuery();
  const { data: saldosPorEmpresa } = trpc.contasBancarias?.saldosPorEmpresa.useQuery();
  const { data: saldoGeral } = trpc.contasBancarias?.saldoGeral.useQuery();
  const { data: variacao } = trpc.contasBancarias?.variacaoSaldo.useQuery();

  // Mutations - Contas a Pagar/Receber
  const createMutation = trpc.financeiro.contas.create.useMutation({
    onSuccess: () => {
      toast.success("Conta registrada com sucesso!");
      utils.financeiro.contas.list.invalidate();
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateMutation = trpc.financeiro.contas.update.useMutation({
    onSuccess: () => {
      toast.success("Conta atualizada com sucesso!");
      utils.financeiro.contas.list.invalidate();
      setEditOpen(false);
      setEditingConta(null);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteMutation = trpc.financeiro.contas.delete.useMutation({
    onSuccess: () => {
      toast.success("Conta excluída!");
      utils.financeiro.contas.list.invalidate();
    },
  });

  // Mutations - Contas Bancárias
  const createBancariaMutation = trpc.contasBancarias?.create.useMutation({
    onSuccess: () => {
      toast.success("Conta bancária criada com sucesso!");
      utils.contasBancarias.list.invalidate();
      setIsCreateBancariaOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateBancariaMutation = trpc.contasBancarias?.update.useMutation({
    onSuccess: () => {
      toast.success("Conta bancária atualizada com sucesso!");
      utils.contasBancarias.list.invalidate();
      setIsEditBancariaOpen(false);
      setEditingBancaria(null);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteBancariaMutation = trpc.contasBancarias?.delete.useMutation({
    onSuccess: () => {
      toast.success("Conta bancária excluída!");
      utils.contasBancarias.list.invalidate();
    },
  });

  // Handlers - Contas a Pagar/Receber
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
      vencimento: formData.get("vencimento") as string,
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
        vencimento: formData.get("vencimento") as string,
        status: formData.get("status") as any,
        metodoPagamento: formData.get("metodoPagamento") as string,
        observacoes: formData.get("observacoes") as string,
      },
    });
  };

  // Handlers - Contas Bancárias
  const handleEditBancaria = (conta: any) => {
    setEditingBancaria(conta);
    setIsEditBancariaOpen(true);
  };

  const handleSubmitBancaria = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createBancariaMutation.mutate({
      empresaId: parseInt(formData.get("empresaId") as string),
      nomeConta: formData.get("nomeConta") as string,
      banco: formData.get("banco") as string,
      agencia: formData.get("agencia") as string,
      conta: formData.get("conta") as string,
      tipo: formData.get("tipo") as any,
      saldoAtual: parseFloat(formData.get("saldoAtual") as string),
      observacoes: formData.get("observacoes") as string,
    });
  };

  const handleUpdateBancaria = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateBancariaMutation.mutate({
      id: editingBancaria.id,
      data: {
        empresaId: parseInt(formData.get("empresaId") as string),
        nomeConta: formData.get("nomeConta") as string,
        banco: formData.get("banco") as string,
        agencia: formData.get("agencia") as string,
        conta: formData.get("conta") as string,
        tipo: formData.get("tipo") as any,
        saldoAtual: parseFloat(formData.get("saldoAtual") as string),
        observacoes: formData.get("observacoes") as string,
      },
    });
  };

  const handleDeleteBancaria = (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta conta bancária?")) {
      deleteBancariaMutation.mutate({ id });
    }
  };

  // Filtros
  const contasBancariasFiltradas = useMemo(() => {
    if (!contasBancarias) return [];
    if (!selectedEmpresa) return contasBancarias;
    return contasBancarias.filter((c) => c.empresaId === selectedEmpresa);
  }, [contasBancarias, selectedEmpresa]);

  const saldoTotalFiltrado = useMemo(() => {
    return contasBancariasFiltradas.reduce((acc, conta) => acc + Number(conta.saldoAtual), 0);
  }, [contasBancariasFiltradas]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Contas</h1>
          <p className="text-muted-foreground">Contas a pagar/receber e contas bancárias</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contas-pagar-receber" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Contas a Pagar/Receber
          </TabsTrigger>
          <TabsTrigger value="contas-bancarias" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Contas Bancárias
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Contas a Pagar/Receber */}
        <TabsContent value="contas-pagar-receber" className="space-y-6">
          <div className="flex justify-end">
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
                      <Input name="vencimento" type="date" required />
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
                      <Input name="vencimento" type="date" required defaultValue={editingConta.dataVencimento} />
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
                    <Button type="submit">Atualizar</Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>

          {/* Listagem de Contas */}
          <Card>
            <CardHeader>
              <CardTitle>Contas a Pagar/Receber</CardTitle>
              <CardDescription>Total de {contas?.length || 0} contas</CardDescription>
            </CardHeader>
            <CardContent>
              {!contas || contas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma conta registrada</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {contas.map((conta: any) => (
                    <div key={conta.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{conta.descricao}</h4>
                          <Badge variant={conta.tipo === "Pagar" ? "destructive" : "default"}>
                            {conta.tipo}
                          </Badge>
                          <Badge variant={conta.status === "Pago" ? "secondary" : conta.status === "Atrasado" ? "destructive" : "outline"}>
                            {conta.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{conta.categoria} • Vence em {new Date(conta.dataVencimento).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(conta.valor)}</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(conta)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate({ id: conta.id })}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Contas Bancárias */}
        <TabsContent value="contas-bancarias" className="space-y-6">
          {/* Indicadores */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{formatCurrency(saldoGeral?.saldoTotal || 0)}</div>
                  <DollarSign className="w-8 h-8 text-blue-500 opacity-50" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{saldoGeral?.quantidadeContas || 0} contas ativas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Empresas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{saldoGeral?.quantidadeEmpresas || 0}</div>
                  <Building2 className="w-8 h-8 text-purple-500 opacity-50" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Grupos econômicos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Variação Diária</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className={`text-2xl font-bold ${(variacao?.variacaoDiaria || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(variacao?.variacaoDiaria || 0)}
                  </div>
                  <TrendingUp className={`w-8 h-8 opacity-50 ${(variacao?.variacaoDiaria || 0) >= 0 ? "text-green-500" : "text-red-500"}`} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{variacao?.percentualDiario || 0}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Variação Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className={`text-2xl font-bold ${(variacao?.variacaoMensal || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(variacao?.variacaoMensal || 0)}
                  </div>
                  <TrendingUp className={`w-8 h-8 opacity-50 ${(variacao?.variacaoMensal || 0) >= 0 ? "text-green-500" : "text-red-500"}`} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{variacao?.percentualMensal || 0}%</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Dialog open={isCreateBancariaOpen} onOpenChange={setIsCreateBancariaOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" />Nova Conta Bancária</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Registrar Conta Bancária</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitBancaria} className="space-y-4">
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
                      <Label>Nome da Conta *</Label>
                      <Input name="nomeConta" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Banco *</Label>
                      <Input name="banco" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Agência *</Label>
                      <Input name="agencia" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Conta *</Label>
                      <Input name="conta" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo *</Label>
                      <Select name="tipo" required>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PJ">PJ</SelectItem>
                          <SelectItem value="PF">PF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Saldo Atual *</Label>
                    <Input name="saldoAtual" type="number" step="0.01" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea name="observacoes" rows={3} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateBancariaOpen(false)}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Dialog de Edição Bancária */}
          <Dialog open={isEditBancariaOpen} onOpenChange={setIsEditBancariaOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Conta Bancária</DialogTitle>
              </DialogHeader>
              {editingBancaria && (
                <form onSubmit={handleUpdateBancaria} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Empresa *</Label>
                      <Select name="empresaId" required defaultValue={editingBancaria.empresaId?.toString()}>
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
                      <Label>Nome da Conta *</Label>
                      <Input name="nomeConta" required defaultValue={editingBancaria.nomeConta} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Banco *</Label>
                      <Input name="banco" required defaultValue={editingBancaria.banco} />
                    </div>
                    <div className="space-y-2">
                      <Label>Agência *</Label>
                      <Input name="agencia" required defaultValue={editingBancaria.agencia} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Conta *</Label>
                      <Input name="conta" required defaultValue={editingBancaria.conta} />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo *</Label>
                      <Select name="tipo" required defaultValue={editingBancaria.tipo}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PJ">PJ</SelectItem>
                          <SelectItem value="PF">PF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Saldo Atual *</Label>
                    <Input name="saldoAtual" type="number" step="0.01" required defaultValue={editingBancaria.saldoAtual} />
                  </div>
                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea name="observacoes" rows={3} defaultValue={editingBancaria.observacoes || ""} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditBancariaOpen(false)}>Cancelar</Button>
                    <Button type="submit">Atualizar</Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>

          {/* Consolidação por Empresa */}
          <Card>
            <CardHeader>
              <CardTitle>Consolidação por Empresa</CardTitle>
              <CardDescription>Saldo total de contas por empresa</CardDescription>
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
                {saldosPorEmpresa?.map((item: any) => {
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

          {/* Listagem de Contas Bancárias */}
          <Card>
            <CardHeader>
              <CardTitle>Contas Bancárias {selectedEmpresa && `- ${empresas?.find((e) => e.id === selectedEmpresa)?.nomeFantasia}`}</CardTitle>
              <CardDescription>Saldo total: {formatCurrency(saldoTotalFiltrado)}</CardDescription>
            </CardHeader>
            <CardContent>
              {contasBancariasFiltradas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma conta bancária cadastrada</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {contasBancariasFiltradas.map((conta: any) => (
                    <div key={conta.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex-1">
                        <h4 className="font-semibold">{conta.nomeConta}</h4>
                        <p className="text-sm text-muted-foreground">{conta.banco} • Ag. {conta.agencia} • Conta {conta.conta}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(conta.saldoAtual)}</p>
                          <Badge variant="secondary" className="text-xs">{conta.tipo}</Badge>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleEditBancaria(conta)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteBancaria(conta.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
