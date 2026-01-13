/**
 * Hook customizado para operações CRUD (DRY)
 * 
 * Elimina repetição de código em múltiplos componentes
 * Princípios aplicados:
 * - DRY: Lógica reutilizável de CRUD
 * - SRP: Responsabilidade única de gerenciar estado CRUD
 */

import { useState } from "react";
import { toast } from "sonner";

export interface CRUDOperations<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  selectedItem: T | null;
  isDialogOpen: boolean;
  isEditMode: boolean;
  
  // Actions
  setItems: (items: T[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  openCreateDialog: () => void;
  openEditDialog: (item: T) => void;
  closeDialog: () => void;
  handleSuccess: (message: string) => void;
  handleError: (error: any, operation: string) => void;
}

/**
 * Hook genérico para operações CRUD
 * DRY: Elimina código duplicado em componentes de listagem/formulário
 */
export function useCRUD<T>(): CRUDOperations<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const openCreateDialog = () => {
    setSelectedItem(null);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: T) => {
    setSelectedItem(item);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedItem(null);
    setIsEditMode(false);
  };

  const handleSuccess = (message: string) => {
    toast.success(message);
    closeDialog();
  };

  const handleError = (error: any, operation: string) => {
    const errorMessage = error?.message || `Erro ao ${operation}`;
    setError(errorMessage);
    toast.error(errorMessage);
  };

  return {
    items,
    loading,
    error,
    selectedItem,
    isDialogOpen,
    isEditMode,
    setItems,
    setLoading,
    setError,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    handleSuccess,
    handleError,
  };
}

/**
 * Hook para gerenciar estado de formulários (DRY)
 */
export function useFormState<T extends Record<string, any>>(initialState: T) {
  const [formData, setFormData] = useState<T>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const updateField = (field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo ao editar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const setFieldError = (field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const reset = () => {
    setFormData(initialState);
    setErrors({});
  };

  const validate = (rules: Partial<Record<keyof T, (value: any) => string | undefined>>) => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const field in rules) {
      const rule = rules[field];
      if (rule) {
        const error = rule(formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  return {
    formData,
    errors,
    updateField,
    setFieldError,
    reset,
    validate,
    setFormData,
  };
}
