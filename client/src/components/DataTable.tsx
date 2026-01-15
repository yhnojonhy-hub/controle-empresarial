/**
 * Componente DataTable Reutilizável (DRY)
 *
 * Elimina repetição de código de tabelas em múltiplas páginas
 * Princípios aplicados:
 * - DRY: Componente genérico reutilizável
 * - SRP: Responsabilidade única de renderizar tabelas
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Loader2 } from "lucide-react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  emptyMessage?: string;
  actions?: boolean;
}

/**
 * Componente genérico de tabela com ações CRUD
 * DRY: Elimina repetição de código de tabelas
 */
export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  loading = false,
  onEdit,
  onDelete,
  emptyMessage = "Nenhum registro encontrado",
  actions = true,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index} style={{ width: column.width }}>
                {column.label}
              </TableHead>
            ))}
            {actions && (onEdit || onDelete) && (
              <TableHead className="text-right">Ações</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(item => (
            <TableRow key={item.id}>
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex}>
                  {column.render
                    ? column.render(item)
                    : String(item[column.key as keyof T] ?? "-")}
                </TableCell>
              ))}
              {actions && (onEdit || onDelete) && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * Helper para criar colunas de forma mais concisa (DRY)
 */
export function createColumn<T>(
  key: keyof T | string,
  label: string,
  render?: (item: T) => React.ReactNode,
  width?: string
): Column<T> {
  return { key, label, render, width };
}

/**
 * Helpers para formatação comum (DRY)
 */
export const formatters = {
  currency: (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  },

  date: (value: string | Date) => {
    const date = typeof value === "string" ? new Date(value) : value;
    return new Intl.DateTimeFormat("pt-BR").format(date);
  },

  status: (value: string) => {
    const colors: Record<string, string> = {
      Aberto: "text-green-600",
      Fechado: "text-red-600",
      Pendente: "text-yellow-600",
      Pago: "text-green-600",
      Atrasado: "text-red-600",
    };

    return (
      <span className={`font-medium ${colors[value] || ""}`}>{value}</span>
    );
  },
};
