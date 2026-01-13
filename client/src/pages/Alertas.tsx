import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Bell } from "lucide-react";

export default function Alertas() {
  const { data: alertas, isLoading } = trpc.alertas.list.useQuery();
  
  if (isLoading) return <div className="p-8">Carregando...</div>;
  
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Alertas</h1>
        <p className="text-muted-foreground">Notificações e avisos importantes</p>
      </div>
      <div className="grid gap-4">
        {alertas && alertas.length > 0 ? (
          alertas.map((alerta) => (
            <Card key={alerta.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <CardTitle>{alerta.titulo}</CardTitle>
                  </div>
                  <Badge variant={alerta.lido ? "secondary" : "default"}>
                    {alerta.lido ? "Lido" : "Novo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{alerta.mensagem}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(alerta.createdAt).toLocaleString("pt-BR")}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p>Nenhum alerta no momento</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
