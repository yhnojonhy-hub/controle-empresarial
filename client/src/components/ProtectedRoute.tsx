import { useAuth } from "@/_core/hooks/useAuth";
import { ReactNode } from "react";
import { Redirect } from "wouter";
import { Card, CardContent } from "./ui/card";
import { AlertCircle, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { getLoginUrl } from "@/const";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <Lock className="h-16 w-16 mx-auto text-slate-400" />
            <h2 className="text-2xl font-bold">Acesso Restrito</h2>
            <p className="text-slate-600">
              Você precisa estar autenticado para acessar esta página.
            </p>
            <Button
              onClick={() => {
                window.location.href = getLoginUrl();
              }}
              className="w-full"
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requireAdmin && user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500" />
            <h2 className="text-2xl font-bold">Acesso Negado</h2>
            <p className="text-slate-600">
              Você não possui permissão para acessar esta página. Apenas
              administradores podem visualizar este conteúdo.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                window.location.href = "/";
              }}
              className="w-full"
            >
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
