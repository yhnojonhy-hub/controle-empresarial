import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function Empresas() {
  const [open, setOpen] = useState(false);
  const [cnpj, setCnpj] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const utils = trpc.useUtils();
  const { data: empresas, isLoading } = trpc.empresas.list.useQuery();
  const consultarCNPJ = trpc.empresas.consultarCNPJ.useMutation();
  const createEmpresa = trpc.empresas.create.useMutation({
    onSuccess: () => {
      utils.empresas.list.invalidate();
      setOpen(false);
      setFormData({});
      setCnpj("");
      toast.success("Empresa cadastrada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar empresa: " + error.message);
    },
  });

  const handleBuscarCNPJ = async () => {
    if (!cnpj) return;
    setBuscando(true);
    try {
      const result = await consultarCNPJ.mutateAsync({ cnpj });
      setFormData(result);
      toast.success("Dados do CNPJ carregados automaticamente!");
    } catch (error: any) {
      toast.error("Erro ao consultar CNPJ: " + error.message);
    } finally {
      setBuscando(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEmpresa.mutate({ ...formData, cnpj });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Empresas</h1>
          <p className="text-muted-foreground mt-2">Cadastro e gerenciamento de empresas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Empresa</DialogTitle>
              <DialogDescription>Busque por CNPJ para preenchimento automático</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <Button type="button" onClick={handleBuscarCNPJ} disabled={buscando}>
                    {buscando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="razaoSocial">Razão Social</Label>
                  <Input
                    id="razaoSocial"
                    value={formData.razaoSocial || ""}
                    onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                  <Input
                    id="nomeFantasia"
                    value={formData.nomeFantasia || ""}
                    onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capitalSocial">Capital Social</Label>
                  <Input
                    id="capitalSocial"
                    type="number"
                    step="0.01"
                    value={formData.capitalSocial || ""}
                    onChange={(e) => setFormData({ ...formData, capitalSocial: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="cnae">CNAE</Label>
                  <Input
                    id="cnae"
                    value={formData.cnae || ""}
                    onChange={(e) => setFormData({ ...formData, cnae: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="regimeTributario">Regime Tributário</Label>
                <Input
                  id="regimeTributario"
                  value={formData.regimeTributario || ""}
                  onChange={(e) => setFormData({ ...formData, regimeTributario: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="enderecoCompleto">Endereço Completo</Label>
                <Input
                  id="enderecoCompleto"
                  value={formData.enderecoCompleto || ""}
                  onChange={(e) => setFormData({ ...formData, enderecoCompleto: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade || ""}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.estado || ""}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="responsavelLegal">Responsável Legal</Label>
                  <Input
                    id="responsavelLegal"
                    value={formData.responsavelLegal || ""}
                    onChange={(e) => setFormData({ ...formData, responsavelLegal: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone || ""}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dataAbertura">Data de Abertura</Label>
                  <Input
                    id="dataAbertura"
                    type="date"
                    value={formData.dataAbertura || ""}
                    onChange={(e) => setFormData({ ...formData, dataAbertura: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createEmpresa.isPending}>
                  {createEmpresa.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Cadastrar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : empresas && empresas.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Empresas Cadastradas</CardTitle>
            <CardDescription>Total: {empresas.length} empresas</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome Fantasia</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Cidade/Estado</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empresas.map((empresa) => (
                  <TableRow key={empresa.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        {empresa.nomeFantasia || empresa.razaoSocial}
                      </div>
                    </TableCell>
                    <TableCell>{empresa.cnpj}</TableCell>
                    <TableCell>{empresa.cidade}/{empresa.estado}</TableCell>
                    <TableCell>{empresa.responsavelLegal}</TableCell>
                    <TableCell>
                      <Badge variant={empresa.status === "Aberto" ? "default" : "secondary"}>
                        {empresa.status}
                      </Badge>
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
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma empresa cadastrada ainda</p>
            <Button onClick={() => setOpen(true)} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Primeira Empresa
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
