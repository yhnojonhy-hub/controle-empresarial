import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2, Clock, TrendingDown, BarChart3 } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useRouter } from 'wouter';


interface ItemReconciliacao {
  id: string;
  data: Date;
  tipo: 'Bancário' | 'Conta a Pagar' | 'Conta a Receber';
  descricao: string;
  valor: number;
  saldoBancario: number;
  saldoContabil: number;
  discrepancia: number;
  status: 'Reconciliado' | 'Pendente';
  empresaId: number;
  empresaNome: string;
}

interface ResumoReconciliacao {
  totalSaldoBancario: number;
  totalSaldoContabil: number;
  totalDiscrepancia: number;
  itemsReconciliados: number;
  itemsPendentes: number;
  percentualReconciliacao: number;
}

/**
 * Página de Reconciliação Bancária
 * Exibe tabela de reconciliação cruzando dados bancários com contas a pagar/receber
 * Permite análise de discrepâncias e validação de saldo contábil vs. bancário
 */
export default function Reconciliacao() {
  const { user } = useAuth();
  const navigate = useRouter()[1];
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Reconciliado' | 'Pendente'>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [dataInicio, setDataInicio] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);

  // Dados mock para demonstração
  const mockItems: ItemReconciliacao[] = [
    {
      id: 'banco-1',
      data: new Date('2026-01-14'),
      tipo: 'Bancário',
      descricao: 'Bradesco - Ag: 0001 | Conta: 123456-7',
      valor: 5000,
      saldoBancario: 5000,
      saldoContabil: 4500,
      discrepancia: 500,
      status: 'Pendente',
      empresaId: 1,
      empresaNome: 'Ipe Bank',
    },
    {
      id: 'pagar-1',
      data: new Date('2026-01-10'),
      tipo: 'Conta a Pagar',
      descricao: 'Fornecedor ABC - Nota Fiscal #001',
      valor: -300,
      saldoBancario: 5000,
      saldoContabil: 4500,
      discrepancia: 500,
      status: 'Pendente',
      empresaId: 1,
      empresaNome: 'Ipe Bank',
    },
    {
      id: 'receber-1',
      data: new Date('2026-01-15'),
      tipo: 'Conta a Receber',
      descricao: 'Cliente XYZ - Fatura #2026-001',
      valor: 4800,
      saldoBancario: 5000,
      saldoContabil: 4500,
      discrepancia: 500,
      status: 'Reconciliado',
      empresaId: 1,
      empresaNome: 'Ipe Bank',
    },
  ];

  const mockResumo: ResumoReconciliacao = {
    totalSaldoBancario: 5000,
    totalSaldoContabil: 4500,
    totalDiscrepancia: 500,
    itemsReconciliados: 1,
    itemsPendentes: 2,
    percentualReconciliacao: 33.33,
  };

  // Filtrar itens
  const itemsFiltrados = useMemo(() => {
    return mockItems.filter((item) => {
      const matchEmpresa = !selectedEmpresa || item.empresaId.toString() === selectedEmpresa;
      const matchStatus = statusFilter === 'Todos' || item.status === statusFilter;
      const matchSearch = item.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      return matchEmpresa && matchStatus && matchSearch;
    });
  }, [selectedEmpresa, statusFilter, searchTerm]);

  // Calcular resumo filtrado
  const resumoFiltrado = useMemo(() => {
    const reconciliados = itemsFiltrados.filter((i) => i.status === 'Reconciliado').length;
    const pendentes = itemsFiltrados.filter((i) => i.status === 'Pendente').length;
    const totalSaldoBancario = itemsFiltrados
      .filter((i) => i.tipo === 'Bancário')
      .reduce((sum, item) => sum + item.saldoBancario, 0);
    const totalSaldoContabil = itemsFiltrados.reduce((sum, item) => sum + item.valor, 0);

    return {
      reconciliados,
      pendentes,
      totalSaldoBancario,
      totalSaldoContabil,
      discrepancia: Math.abs(totalSaldoBancario - totalSaldoContabil),
    };
  }, [itemsFiltrados]);

  const getStatusBadge = (status: string) => {
    if (status === 'Reconciliado') {
      return <Badge className="bg-green-100 text-green-800">✓ Reconciliado</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">⏳ Pendente</Badge>;
  };

  const getDiscrepanciaColor = (discrepancia: number) => {
    if (discrepancia === 0) return 'text-green-600';
    if (Math.abs(discrepancia) < 1000) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Reconciliação Bancária</h1>
        <p className="text-gray-600 mt-2">Cruze dados bancários com contas a pagar e receber</p>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Saldo Bancário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {resumoFiltrado.totalSaldoBancario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Saldo Contábil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {resumoFiltrado.totalSaldoContabil.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Discrepância</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getDiscrepanciaColor(resumoFiltrado.discrepancia)}`}>
              R$ {resumoFiltrado.discrepancia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Reconciliados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resumoFiltrado.reconciliados}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{resumoFiltrado.pendentes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Empresa</label>
              <Select value={selectedEmpresa || 'all'} onValueChange={(v) => setSelectedEmpresa(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as empresas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as empresas</SelectItem>
                  <SelectItem value="1">Ipe Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Reconciliado">Reconciliado</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Data Início</label>
              <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>

            <div>
              <label className="text-sm font-medium">Data Fim</label>
              <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Buscar por descrição</label>
            <Input
              placeholder="Digite para buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Reconciliação */}
      <Card>
        <CardHeader>
          <CardTitle>Itens de Reconciliação</CardTitle>
          <CardDescription>{itemsFiltrados.length} itens encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 font-semibold">Data</th>
                  <th className="pb-3 font-semibold">Tipo</th>
                  <th className="pb-3 font-semibold">Descrição</th>
                  <th className="pb-3 font-semibold text-right">Valor</th>
                  <th className="pb-3 font-semibold text-right">Saldo Bancário</th>
                  <th className="pb-3 font-semibold text-right">Saldo Contábil</th>
                  <th className="pb-3 font-semibold text-right">Discrepância</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {itemsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-500">
                      Nenhum item encontrado
                    </td>
                  </tr>
                ) : (
                  itemsFiltrados.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                      <td className="py-3">
                        <Badge variant="outline">{item.tipo}</Badge>
                      </td>
                      <td className="py-3">{item.descricao}</td>
                      <td className="py-3 text-right font-mono">
                        R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-right font-mono">
                        R$ {item.saldoBancario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-right font-mono">
                        R$ {item.saldoContabil.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`py-3 text-right font-mono font-bold ${getDiscrepanciaColor(item.discrepancia)}`}>
                        R$ {item.discrepancia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3">{getStatusBadge(item.status)}</td>
                      <td className="py-3">
                        {item.status === 'Pendente' && (
                          <Button size="sm" variant="outline" onClick={() => console.log('Marcar reconciliado:', item.id)}>
                            Reconciliar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
