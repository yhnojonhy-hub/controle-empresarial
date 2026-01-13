import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";

export default function Impostos() {
  const { data: impostos } = trpc.impostos.list.useQuery();
  
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Impostos</h1>
      <Card>
        <CardContent className="py-12 text-center">
          <p>Página em desenvolvimento</p>
          <p className="text-sm text-muted-foreground mt-2">
            {impostos?.length || 0} registros no banco
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
