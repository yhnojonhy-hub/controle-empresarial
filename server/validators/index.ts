/**
 * Validadores Centralizados
 * 
 * Implementa validação robusta de dados seguindo princípios de segurança.
 * Todos os inputs externos DEVEM passar por validação antes de processamento.
 */

import { ValidationResult } from "../types";

// ========== Validação de CNPJ ==========

/**
 * Valida formato e dígitos verificadores de CNPJ
 * @param cnpj - CNPJ com ou sem formatação
 * @returns true se válido, false caso contrário
 */
export function isValidCNPJ(cnpj: string): boolean {
  if (!cnpj) return false;

  // Remove formatação
  const cleaned = cnpj.replace(/[^\d]/g, "");

  // Verifica tamanho
  if (cleaned.length !== 14) return false;

  // Verifica se todos os dígitos são iguais (CNPJ inválido)
  if (/^(\d)\1+$/.test(cleaned)) return false;

  // Validação dos dígitos verificadores
  let size = cleaned.length - 2;
  let numbers = cleaned.substring(0, size);
  const digits = cleaned.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  size = size + 1;
  numbers = cleaned.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(digits.charAt(1));
}

// ========== Validação de CPF ==========

/**
 * Valida formato e dígitos verificadores de CPF
 * @param cpf - CPF com ou sem formatação
 * @returns true se válido, false caso contrário
 */
export function isValidCPF(cpf: string): boolean {
  if (!cpf) return false;

  // Remove formatação
  const cleaned = cpf.replace(/[^\d]/g, "");

  // Verifica tamanho
  if (cleaned.length !== 11) return false;

  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1+$/.test(cleaned)) return false;

  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let result = 11 - (sum % 11);
  if (result === 10 || result === 11) result = 0;
  if (result !== parseInt(cleaned.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  result = 11 - (sum % 11);
  if (result === 10 || result === 11) result = 0;
  return result === parseInt(cleaned.charAt(10));
}

// ========== Validação de Email ==========

/**
 * Valida formato de email
 * @param email - Endereço de email
 * @returns true se válido, false caso contrário
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// ========== Validação de Telefone ==========

/**
 * Valida formato de telefone brasileiro
 * @param phone - Telefone com ou sem formatação
 * @returns true se válido, false caso contrário
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[^\d]/g, "");
  // Aceita: 10 dígitos (fixo) ou 11 dígitos (celular)
  return cleaned.length === 10 || cleaned.length === 11;
}

// ========== Validação de Data ==========

/**
 * Valida se string é uma data válida no formato ISO (YYYY-MM-DD)
 * @param dateString - Data em formato ISO
 * @returns true se válida, false caso contrário
 */
export function isValidISODate(dateString: string): boolean {
  if (!dateString) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Valida se string é um mês/ano válido no formato YYYY-MM
 * @param monthYear - Mês/ano em formato YYYY-MM
 * @returns true se válido, false caso contrário
 */
export function isValidMonthYear(monthYear: string): boolean {
  if (!monthYear) return false;
  const regex = /^\d{4}-\d{2}$/;
  if (!regex.test(monthYear)) return false;

  const [year, month] = monthYear.split("-").map(Number);
  return year >= 1900 && year <= 2100 && month >= 1 && month <= 12;
}

// ========== Validação de Valores Monetários ==========

/**
 * Valida se string representa um valor monetário válido
 * @param value - Valor monetário (formato: "1000.50")
 * @returns true se válido, false caso contrário
 */
export function isValidCurrency(value: string): boolean {
  if (!value) return false;
  const regex = /^\d+(\.\d{1,2})?$/;
  return regex.test(value);
}

/**
 * Valida se string representa uma porcentagem válida
 * @param value - Porcentagem (formato: "15.5")
 * @returns true se válida, false caso contrário
 */
export function isValidPercentage(value: string): boolean {
  if (!value) return false;
  const regex = /^\d+(\.\d{1,2})?$/;
  if (!regex.test(value)) return false;

  const num = parseFloat(value);
  return num >= 0 && num <= 100;
}

// ========== Sanitização ==========

/**
 * Remove caracteres especiais perigosos de strings
 * Previne SQL Injection e XSS
 * @param input - String a ser sanitizada
 * @returns String sanitizada
 */
export function sanitizeString(input: string): string {
  if (!input) return "";
  return input
    .trim()
    .replace(/[<>'"]/g, "") // Remove caracteres HTML perigosos
    .replace(/[;]/g, ""); // Remove ponto-e-vírgula (SQL)
}

/**
 * Sanitiza CNPJ removendo formatação
 * @param cnpj - CNPJ com ou sem formatação
 * @returns CNPJ apenas com números
 */
export function sanitizeCNPJ(cnpj: string): string {
  if (!cnpj) return "";
  return cnpj.replace(/[^\d]/g, "");
}

/**
 * Sanitiza CPF removendo formatação
 * @param cpf - CPF com ou sem formatação
 * @returns CPF apenas com números
 */
export function sanitizeCPF(cpf: string): string {
  if (!cpf) return "";
  return cpf.replace(/[^\d]/g, "");
}

// ========== Validação Composta ==========

/**
 * Valida objeto de criação de empresa
 * @param data - Dados da empresa
 * @returns Resultado da validação com lista de erros
 */
export function validateEmpresaData(data: any): ValidationResult {
  const errors: string[] = [];

  // CNPJ obrigatório e válido
  if (!data.cnpj) {
    errors.push("CNPJ é obrigatório");
  } else if (!isValidCNPJ(data.cnpj)) {
    errors.push("CNPJ inválido");
  }

  // Email opcional mas deve ser válido se fornecido
  if (data.email && !isValidEmail(data.email)) {
    errors.push("Email inválido");
  }

  // Telefone opcional mas deve ser válido se fornecido
  if (data.telefone && !isValidPhone(data.telefone)) {
    errors.push("Telefone inválido");
  }

  // Data de abertura opcional mas deve ser válida se fornecida
  if (data.dataAbertura && !isValidISODate(data.dataAbertura)) {
    errors.push("Data de abertura inválida");
  }

  // Capital social opcional mas deve ser válido se fornecido
  if (data.capitalSocial && !isValidCurrency(data.capitalSocial)) {
    errors.push("Capital social inválido");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida objeto de criação de funcionário
 * @param data - Dados do funcionário
 * @returns Resultado da validação com lista de erros
 */
export function validateFuncionarioData(data: any): ValidationResult {
  const errors: string[] = [];

  // Nome obrigatório
  if (!data.nome || data.nome.trim().length < 3) {
    errors.push("Nome é obrigatório e deve ter pelo menos 3 caracteres");
  }

  // CPF obrigatório e válido
  if (!data.cpf) {
    errors.push("CPF é obrigatório");
  } else if (!isValidCPF(data.cpf)) {
    errors.push("CPF inválido");
  }

  // Cargo obrigatório
  if (!data.cargo || data.cargo.trim().length < 2) {
    errors.push("Cargo é obrigatório");
  }

  // Salário obrigatório e válido
  if (!data.salarioBase) {
    errors.push("Salário base é obrigatório");
  } else if (!isValidCurrency(data.salarioBase)) {
    errors.push("Salário base inválido");
  }

  // Data de admissão obrigatória e válida
  if (!data.dataAdmissao) {
    errors.push("Data de admissão é obrigatória");
  } else if (!isValidISODate(data.dataAdmissao)) {
    errors.push("Data de admissão inválida");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida objeto de criação de conta
 * @param data - Dados da conta
 * @returns Resultado da validação com lista de erros
 */
export function validateContaData(data: any): ValidationResult {
  const errors: string[] = [];

  // Descrição obrigatória
  if (!data.descricao || data.descricao.trim().length < 3) {
    errors.push("Descrição é obrigatória e deve ter pelo menos 3 caracteres");
  }

  // Valor obrigatório e válido
  if (!data.valor) {
    errors.push("Valor é obrigatório");
  } else if (!isValidCurrency(data.valor)) {
    errors.push("Valor inválido");
  }

  // Data de vencimento obrigatória e válida
  if (!data.dataVencimento) {
    errors.push("Data de vencimento é obrigatória");
  } else if (!isValidISODate(data.dataVencimento)) {
    errors.push("Data de vencimento inválida");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida objeto de criação de KPI
 * @param data - Dados do KPI
 * @returns Resultado da validação com lista de erros
 */
export function validateKPIData(data: any): ValidationResult {
  const errors: string[] = [];

  // Mês/Ano obrigatório e válido
  if (!data.mesAno) {
    errors.push("Mês/Ano é obrigatório");
  } else if (!isValidMonthYear(data.mesAno)) {
    errors.push("Mês/Ano inválido (formato: YYYY-MM)");
  }

  // Faturamento bruto obrigatório e válido
  if (!data.faturamentoBruto) {
    errors.push("Faturamento bruto é obrigatório");
  } else if (!isValidCurrency(data.faturamentoBruto)) {
    errors.push("Faturamento bruto inválido");
  }

  // Valores opcionais mas devem ser válidos se fornecidos
  const optionalCurrencyFields = ["impostos", "custosFixos", "custosVariaveis"];
  for (const field of optionalCurrencyFields) {
    if (data[field] && !isValidCurrency(data[field])) {
      errors.push(`${field} inválido`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
