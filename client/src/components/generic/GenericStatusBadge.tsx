/**
 * Componente Genérico de Badge de Status
 * 
 * Padroniza exibição de status com cores e ícones
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';

export type StatusType = 
  | 'ativo' | 'inativo' | 'pendente' | 'concluído'
  | 'sucesso' | 'erro' | 'aviso' | 'info'
  | 'aberto' | 'fechado' | 'suspenso'
  | 'pago' | 'vencido' | 'atrasado';

const statusConfig: Record<StatusType, { label: string; variant: any; color: string }> = {
  ativo: { label: 'Ativo', variant: 'default', color: 'bg-green-100 text-green-800' },
  inativo: { label: 'Inativo', variant: 'secondary', color: 'bg-gray-100 text-gray-800' },
  pendente: { label: 'Pendente', variant: 'outline', color: 'bg-yellow-100 text-yellow-800' },
  concluído: { label: 'Concluído', variant: 'default', color: 'bg-green-100 text-green-800' },
  sucesso: { label: 'Sucesso', variant: 'default', color: 'bg-green-100 text-green-800' },
  erro: { label: 'Erro', variant: 'destructive', color: 'bg-red-100 text-red-800' },
  aviso: { label: 'Aviso', variant: 'outline', color: 'bg-orange-100 text-orange-800' },
  info: { label: 'Info', variant: 'secondary', color: 'bg-blue-100 text-blue-800' },
  aberto: { label: 'Aberto', variant: 'default', color: 'bg-blue-100 text-blue-800' },
  fechado: { label: 'Fechado', variant: 'secondary', color: 'bg-gray-100 text-gray-800' },
  suspenso: { label: 'Suspenso', variant: 'destructive', color: 'bg-red-100 text-red-800' },
  pago: { label: 'Pago', variant: 'default', color: 'bg-green-100 text-green-800' },
  vencido: { label: 'Vencido', variant: 'destructive', color: 'bg-red-100 text-red-800' },
  atrasado: { label: 'Atrasado', variant: 'destructive', color: 'bg-red-100 text-red-800' },
};

export interface GenericStatusBadgeProps {
  status: StatusType | string;
  label?: string;
  customLabel?: string;
}

export function GenericStatusBadge({
  status,
  label,
  customLabel,
}: GenericStatusBadgeProps) {
  const config = statusConfig[status as StatusType];
  const displayLabel = customLabel || label || config?.label || status;

  if (!config) {
    return <Badge variant="outline">{displayLabel}</Badge>;
  }

  return (
    <Badge variant={config.variant} className={config.color}>
      {displayLabel}
    </Badge>
  );
}
