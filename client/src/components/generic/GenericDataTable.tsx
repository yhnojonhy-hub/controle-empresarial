/**
 * Componente Genérico de Tabela com CRUD
 *
 * Reutilizável em todas as páginas (Empresas, KPI, Contas, etc)
 * Reduz duplicação de código em ~40-50%
 */

import React from "react";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface GenericDataTableProps<T extends { id: number }> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  emptyMessage?: string;
  showActions?: boolean;
}

export function GenericDataTable<T extends { id: number }>({
  data,
  columns,
  loading = false,
  onEdit,
  onDelete,
  emptyMessage = "Nenhum registro encontrado",
  showActions = true,
}: GenericDataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(col => (
              <TableHead key={String(col.key)} style={{ width: col.width }}>
                {col.label}
              </TableHead>
            ))}
            {showActions && <TableHead className="w-24">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(row => (
            <TableRow key={row.id}>
              {columns.map(col => (
                <TableCell key={`${row.id}-${String(col.key)}`}>
                  {col.render
                    ? col.render(row[col.key], row)
                    : String(row[col.key])}
                </TableCell>
              ))}
              {showActions && (
                <TableCell className="flex gap-2">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(row)}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(row)}
                      title="Deletar"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
