import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Info, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";

export default function Alertas() {
  const utils = trpc.useUtils();
  const { data: alertas, isLoading } = trpc.alertas.list.useQuery();

  const marcarComoLido = trpc.alertas.marcarLido.useMutation({
    onSuccess: () => {
      utils.alertas.list.invalidate();
      toast.success("Alerta marcado como lido!");
    },
    onError: (error) => {
      toast.error("Erro ao marcar alerta: " + error.message);
    },
  });

  const handleMarcarLido = (id: number) => {
    marcarComoLido.mutate({ id });
  };

  const getSeverityIcon = (severidade: string) => {
    switch (severidade) {
      case "Critico":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "Aviso":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "Info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getSeverityBadge = (severidade: string) => {
    switch (severidade) {
      case "Critico":
        return <Badge variant="destructive">{severidade}</Badge>;
      case "Aviso":
        return <Badge className="bg-yellow-500">{severidade}</Badge>;
      case "Info":
        return <Badge variant="secondary">{severidade}</Badge>;
      default:
        return <Badge>{severidade}</Badge>;
    }
  };

  const alertasNaoLidos = alertas?.filter((a) => a.status === "NaoLido").length || 0;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Alertas do Sistema</h1>
          <p className="text-muted-foreground">Notificações e avisos importantes</p>
        </div>
        {alertasNaoLidos > 0 && (
          <Badge variant="destructive" className="text-lg px-4 py-2">
            {alertasNaoLidos} não lidos
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : alertas && alertas.length > 0 ? (
        <div className="space-y-4">
          {alertas.map((alerta) => (
            <Card key={alerta.id} className={alerta.status === "NaoLido" ? "border-l-4 border-l-primary" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(alerta.severidade || "Info")}
                    <div>
                      <CardTitle className="text-lg">{alerta.titulo}</CardTitle>
                      <CardDescription className="mt-1">
                        {new Date(alerta.createdAt).toLocaleString("pt-BR")}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(alerta.severidade || "Info")}
                    {alerta.status === "Lido" ? (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Lido
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarcarLido(alerta.id)}
                        disabled={marcarComoLido.isPending}
                      >
                        {marcarComoLido.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Marcar como Lido"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{alerta.mensagem}</p>
                {alerta.tipo && (
                  <div className="mt-3">
                    <Badge variant="secondary">{alerta.tipo}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Info className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum alerta no momento</p>
            <p className="text-sm text-muted-foreground mt-2">
              Você será notificado quando houver novos alertas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
