import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LoadingButton, LoadingButtonState } from "@/components/LoadingButton";

export interface CRUDField {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "email" | "tel";
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: any;
  step?: string;
  rows?: number;
}

export interface CRUDConfig {
  title: string;
  description: string;
  createButtonLabel?: string;
  createDialogTitle?: string;
  editDialogTitle?: string;
  fields: CRUDField[];
  onCreateSubmit: (data: Record<string, any>) => void;
  onUpdateSubmit: (id: number, data: Record<string, any>) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  items: Array<Record<string, any>>;
  renderItem?: (item: Record<string, any>, onEdit: (item: any) => void, onDelete: (id: number) => void) => ReactNode;
  renderTable?: (items: Record<string, any>[], onEdit: (item: any) => void, onDelete: (id: number) => void) => ReactNode;
  emptyMessage?: string;
  icon?: React.ReactNode;
}

export default function GenericCRUDPage({
  title,
  description,
  createButtonLabel = "Novo Registro",
  createDialogTitle = "Criar Registro",
  editDialogTitle = "Editar Registro",
  fields,
  onCreateSubmit,
  onUpdateSubmit,
  onDelete,
  isLoading = false,
  isCreating = false,
  isUpdating = false,
  isDeleting = false,
  items = [],
  renderItem,
  renderTable,
  emptyMessage = "Nenhum registro encontrado",
  icon,
}: CRUDConfig) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [createButtonState, setCreateButtonState] = useState<LoadingButtonState>('idle');
  const [updateButtonState, setUpdateButtonState] = useState<LoadingButtonState>('idle');

  const handleEdit = (item: any) => {
    const editData: Record<string, any> = { ...item };
    fields.forEach((field) => {
      if (field.type === "date" && editData[field.name]) {
        editData[field.name] = new Date(editData[field.name]).toISOString().split("T")[0];
      }
    });
    setEditingItem(editData);
    setEditOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const data: Record<string, any> = {};

    fields.forEach((field) => {
      const input = formElement.elements.namedItem(field.name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      if (input) {
        data[field.name] = input.value;
      }
    });

    onCreateSubmit(data);
    setFormData({});
    setDialogOpen(false);
  };

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const data: Record<string, any> = {};

    fields.forEach((field) => {
      const input = formElement.elements.namedItem(field.name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      if (input) {
        data[field.name] = input.value;
      }
    });

    onUpdateSubmit(editingItem.id, data);
    setEditOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este registro?")) {
      onDelete(id);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {icon && <div className="text-3xl">{icon}</div>}
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={isCreating}>
              <Plus className="mr-2 h-4 w-4" />
              {createButtonLabel}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{createDialogTitle}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="text-sm font-medium">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === "select" ? (
                    <select
                      name={field.name}
                      required={field.required}
                      defaultValue={field.defaultValue || ""}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="">{field.placeholder || "Selecione..."}</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      required={field.required}
                      placeholder={field.placeholder}
                      rows={field.rows || 3}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      required={field.required}
                      placeholder={field.placeholder}
                      step={field.step}
                      defaultValue={field.defaultValue || ""}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  )}
                </div>
              ))}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <LoadingButton
                  type="submit"
                  state={createButtonState}
                  successMessage="Criado com sucesso!"
                  errorMessage="Erro ao criar"
                  onStateChange={setCreateButtonState}
                >
                  Salvar
                </LoadingButton>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editDialogTitle}</DialogTitle>
            <DialogDescription>Atualize as informações do registro</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              {fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="text-sm font-medium">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === "select" ? (
                    <select
                      name={field.name}
                      required={field.required}
                      defaultValue={editingItem[field.name] || ""}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="">{field.placeholder || "Selecione..."}</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      required={field.required}
                      placeholder={field.placeholder}
                      rows={field.rows || 3}
                      defaultValue={editingItem[field.name] || ""}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      required={field.required}
                      placeholder={field.placeholder}
                      step={field.step}
                      defaultValue={editingItem[field.name] || ""}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  )}
                </div>
              ))}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Cancelar
                </Button>
                <LoadingButton
                  type="submit"
                  state={updateButtonState}
                  successMessage="Atualizado com sucesso!"
                  errorMessage="Erro ao atualizar"
                  onStateChange={setUpdateButtonState}
                >
                  Atualizar
                </LoadingButton>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Total de {items.length} registro(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{emptyMessage}</div>
          ) : renderTable ? (
            renderTable(items, handleEdit, handleDelete)
          ) : renderItem ? (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id}>{renderItem(item, handleEdit, handleDelete)}</div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Nenhum renderizador fornecido</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
