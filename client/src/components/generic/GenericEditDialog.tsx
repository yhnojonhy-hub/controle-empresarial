/**
 * Componente Genérico de Dialog de Edição
 *
 * Reutilizável para editar qualquer entidade
 */

import React from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface GenericEditDialogProps {
  open: boolean;
  title: string;
  description?: string;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => Promise<void> | void;
  children: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
}

export function GenericEditDialog({
  open,
  title,
  description,
  loading = false,
  onOpenChange,
  onSave,
  children,
  submitLabel = "Salvar",
  cancelLabel = "Cancelar",
}: GenericEditDialogProps) {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave();
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            children
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            {cancelLabel}
          </Button>
          {onSave && (
            <Button onClick={handleSave} disabled={isSaving || loading}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
