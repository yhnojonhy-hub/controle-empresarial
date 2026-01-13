/**
 * Helper para conversão de datas (DRY)
 * 
 * Resolve incompatibilidade entre string (input) e Date (DB)
 */

/**
 * Converte string de data para objeto Date
 * Aceita formatos: YYYY-MM-DD, DD/MM/YYYY, ISO string
 */
export function parseDate(dateString: string | undefined | null): Date | null {
  if (!dateString) return null;

  // Tentar parse direto (ISO string)
  const date = new Date(dateString);
  
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Tentar formato brasileiro DD/MM/YYYY
  const brMatch = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  return null;
}

/**
 * Converte campos de data em um objeto
 * Útil para processar inputs de formulários
 */
export function convertDateFields<T extends Record<string, any>>(
  data: T,
  dateFields: (keyof T)[]
): T {
  const result = { ...data };

  for (const field of dateFields) {
    const value = result[field];
    if (typeof value === "string") {
      result[field] = parseDate(value) as any;
    }
  }

  return result;
}

/**
 * Formata Date para string no formato brasileiro
 */
export function formatDateBR(date: Date | string | null | undefined): string {
  if (!date) return "-";

  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR").format(d);
}

/**
 * Formata Date para string ISO (YYYY-MM-DD)
 */
export function formatDateISO(date: Date | string | null | undefined): string | null {
  if (!date) return null;

  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) return null;

  return d.toISOString().split("T")[0];
}
