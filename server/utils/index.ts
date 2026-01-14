/**
 * Utilitários Compartilhados
 * 
 * Funções auxiliares reutilizáveis em todo o sistema.
 * Evita duplicação de código (DRY).
 */

import { Currency, Percentage, CNPJ, CPF, ISODate, MonthYear } from "../types";
import { CURRENCY, PERCENTAGE } from "../constants";

// ========== Formatação de Valores Monetários ==========

/**
 * Formata valor monetário para exibição
 * @param value - Valor em string ou número
 * @returns Valor formatado (ex: "R$ 1.000,50")
 */
export function formatCurrency(value: Currency | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(num)) return "R$ 0,00";
  
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

/**
 * Converte valor monetário de string para número
 * @param value - Valor em string
 * @returns Valor numérico
 */
export function parseCurrency(value: Currency): number {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Arredonda valor monetário para 2 casas decimais
 * @param value - Valor a ser arredondado
 * @returns Valor arredondado
 */
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

// ========== Formatação de Porcentagens ==========

/**
 * Formata porcentagem para exibição
 * @param value - Porcentagem em string ou número
 * @returns Porcentagem formatada (ex: "15,50%")
 */
export function formatPercentage(value: Percentage | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(num)) return "0,00%";
  
  return `${num.toFixed(PERCENTAGE.DECIMAL_PLACES).replace(".", ",")}%`;
}

/**
 * Converte porcentagem de string para número
 * @param value - Porcentagem em string
 * @returns Valor numérico
 */
export function parsePercentage(value: Percentage): number {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

// ========== Formatação de CNPJ/CPF ==========

/**
 * Formata CNPJ para exibição
 * @param cnpj - CNPJ com ou sem formatação
 * @returns CNPJ formatado (ex: "00.000.000/0000-00")
 */
export function formatCNPJ(cnpj: CNPJ): string {
  const cleaned = cnpj.replace(/[^\d]/g, "");
  
  if (cleaned.length !== 14) return cnpj;
  
  return cleaned.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

/**
 * Formata CPF para exibição
 * @param cpf - CPF com ou sem formatação
 * @returns CPF formatado (ex: "000.000.000-00")
 */
export function formatCPF(cpf: CPF): string {
  const cleaned = cpf.replace(/[^\d]/g, "");
  
  if (cleaned.length !== 11) return cpf;
  
  return cleaned.replace(
    /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
    "$1.$2.$3-$4"
  );
}

// ========== Formatação de Datas ==========

/**
 * Formata data ISO para formato brasileiro
 * @param date - Data em formato ISO (YYYY-MM-DD)
 * @returns Data formatada (DD/MM/YYYY)
 */
export function formatDateBR(date: ISODate | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return "";
  
  return dateObj.toLocaleDateString("pt-BR");
}

/**
 * Formata data e hora para formato brasileiro
 * @param date - Data/hora
 * @returns Data/hora formatada (DD/MM/YYYY HH:mm:ss)
 */
export function formatDateTimeBR(date: Date): string {
  if (isNaN(date.getTime())) return "";
  
  return date.toLocaleString("pt-BR");
}

/**
 * Converte data ISO para objeto Date
 * @param isoDate - Data em formato ISO
 * @returns Objeto Date
 */
export function parseISODate(isoDate: ISODate): Date {
  return new Date(isoDate);
}

/**
 * Converte objeto Date para string ISO
 * @param date - Objeto Date
 * @returns Data em formato ISO (YYYY-MM-DD)
 */
export function toISODate(date: Date): ISODate {
  return date.toISOString().split("T")[0];
}

/**
 * Formata mês/ano para exibição
 * @param monthYear - Mês/ano em formato YYYY-MM
 * @returns Mês/ano formatado (MM/YYYY)
 */
export function formatMonthYear(monthYear: MonthYear): string {
  const [year, month] = monthYear.split("-");
  return `${month}/${year}`;
}

/**
 * Obtém primeiro dia do mês
 * @param monthYear - Mês/ano em formato YYYY-MM
 * @returns Data do primeiro dia do mês
 */
export function getFirstDayOfMonth(monthYear: MonthYear): Date {
  return new Date(`${monthYear}-01`);
}

/**
 * Obtém último dia do mês
 * @param monthYear - Mês/ano em formato YYYY-MM
 * @returns Data do último dia do mês
 */
export function getLastDayOfMonth(monthYear: MonthYear): Date {
  const [year, month] = monthYear.split("-").map(Number);
  return new Date(year, month, 0);
}

// ========== Cálculos Financeiros ==========

/**
 * Calcula porcentagem de um valor
 * @param value - Valor base
 * @param percentage - Porcentagem a calcular
 * @returns Resultado do cálculo
 */
export function calculatePercentage(value: number, percentage: number): number {
  return roundCurrency((value * percentage) / 100);
}

/**
 * Calcula margem de lucro
 * @param revenue - Receita
 * @param cost - Custo
 * @returns Margem de lucro em porcentagem
 */
export function calculateProfitMargin(revenue: number, cost: number): number {
  if (revenue === 0) return 0;
  return roundCurrency(((revenue - cost) / revenue) * 100);
}

/**
 * Calcula lucro bruto
 * @param revenue - Receita
 * @param cost - Custo
 * @returns Lucro bruto
 */
export function calculateGrossProfit(revenue: number, cost: number): number {
  return roundCurrency(revenue - cost);
}

/**
 * Soma array de valores monetários
 * @param values - Array de valores
 * @returns Soma total
 */
export function sumCurrency(values: (Currency | number)[]): number {
  const sum = values.reduce((acc: number, val) => {
    const num: number = typeof val === "string" ? parseCurrency(val) : val;
    return acc + num;
  }, 0);
  
  return roundCurrency(sum);
}

// ========== Validação de Datas ==========

/**
 * Verifica se data está no passado
 * @param date - Data a verificar
 * @returns true se data está no passado
 */
export function isDateInPast(date: Date): boolean {
  return date < new Date();
}

/**
 * Verifica se data está no futuro
 * @param date - Data a verificar
 * @returns true se data está no futuro
 */
export function isDateInFuture(date: Date): boolean {
  return date > new Date();
}

/**
 * Calcula diferença em dias entre duas datas
 * @param date1 - Primeira data
 * @param date2 - Segunda data
 * @returns Diferença em dias
 */
export function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Adiciona dias a uma data
 * @param date - Data base
 * @param days - Número de dias a adicionar
 * @returns Nova data
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ========== Utilitários de String ==========

/**
 * Capitaliza primeira letra de cada palavra
 * @param text - Texto a capitalizar
 * @returns Texto capitalizado
 */
export function capitalize(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Trunca texto com reticências
 * @param text - Texto a truncar
 * @param maxLength - Tamanho máximo
 * @returns Texto truncado
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Remove acentos de texto
 * @param text - Texto com acentos
 * @returns Texto sem acentos
 */
export function removeAccents(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// ========== Utilitários de Array ==========

/**
 * Agrupa array por chave
 * @param array - Array a agrupar
 * @param key - Chave para agrupamento
 * @returns Objeto com arrays agrupados
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Remove duplicatas de array
 * @param array - Array com possíveis duplicatas
 * @returns Array sem duplicatas
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Ordena array por chave
 * @param array - Array a ordenar
 * @param key - Chave para ordenação
 * @param order - Ordem (asc ou desc)
 * @returns Array ordenado
 */
export function sortBy<T>(array: T[], key: keyof T, order: "asc" | "desc" = "asc"): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
}

// ========== Utilitários de Objeto ==========

/**
 * Remove propriedades undefined/null de objeto
 * @param obj - Objeto a limpar
 * @returns Objeto limpo
 */
export function removeNullish<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value != null)
  ) as Partial<T>;
}

/**
 * Seleciona apenas propriedades específicas de objeto
 * @param obj - Objeto fonte
 * @param keys - Chaves a selecionar
 * @returns Objeto com apenas as chaves selecionadas
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Pick<T, K>);
}

/**
 * Remove propriedades específicas de objeto
 * @param obj - Objeto fonte
 * @param keys - Chaves a remover
 * @returns Objeto sem as chaves especificadas
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

// ========== Utilitários de Delay ==========

/**
 * Aguarda um tempo específico
 * @param ms - Milissegundos a aguardar
 * @returns Promise que resolve após o tempo
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Executa função com retry em caso de falha
 * @param fn - Função a executar
 * @param maxRetries - Número máximo de tentativas
 * @param delayMs - Delay entre tentativas
 * @returns Resultado da função
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await sleep(delayMs);
      }
    }
  }
  
  throw lastError;
}
