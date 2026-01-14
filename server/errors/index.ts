/**
 * Classes de Erro Customizadas
 * 
 * Implementa hierarquia de erros para tratamento consistente
 * e mensagens de erro claras para o usuário.
 */

import { HTTP_STATUS } from "../constants";

// ========== Erro Base ==========

/**
 * Classe base para todos os erros da aplicação
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Mantém stack trace correto
    Error.captureStackTrace(this, this.constructor);
    
    // Define o nome da classe
    this.name = this.constructor.name;
  }
}

// ========== Erros de Validação ==========

/**
 * Erro de validação de dados de entrada
 */
export class ValidationError extends AppError {
  public readonly errors: string[];

  constructor(message: string = "Dados inválidos", errors: string[] = []) {
    super(message, HTTP_STATUS.BAD_REQUEST);
    this.errors = errors;
  }
}

/**
 * Erro de CNPJ inválido
 */
export class InvalidCNPJError extends ValidationError {
  constructor(cnpj?: string) {
    super(
      cnpj ? `CNPJ inválido: ${cnpj}` : "CNPJ inválido",
      ["CNPJ fornecido não é válido"]
    );
  }
}

/**
 * Erro de CPF inválido
 */
export class InvalidCPFError extends ValidationError {
  constructor(cpf?: string) {
    super(
      cpf ? `CPF inválido: ${cpf}` : "CPF inválido",
      ["CPF fornecido não é válido"]
    );
  }
}

/**
 * Erro de email inválido
 */
export class InvalidEmailError extends ValidationError {
  constructor(email?: string) {
    super(
      email ? `Email inválido: ${email}` : "Email inválido",
      ["Email fornecido não é válido"]
    );
  }
}

/**
 * Erro de data inválida
 */
export class InvalidDateError extends ValidationError {
  constructor(date?: string, field?: string) {
    const message = field 
      ? `Data inválida no campo ${field}` 
      : "Data inválida";
    super(message, [date ? `Data fornecida inválida: ${date}` : "Data inválida"]);
  }
}

// ========== Erros de Negócio ==========

/**
 * Erro quando recurso não é encontrado
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: number | string) {
    const message = id 
      ? `${resource} não encontrado(a) com ID: ${id}`
      : `${resource} não encontrado(a)`;
    super(message, HTTP_STATUS.NOT_FOUND);
  }
}

/**
 * Erro quando recurso já existe (conflito)
 */
export class ConflictError extends AppError {
  constructor(resource: string, field?: string, value?: string) {
    const message = field && value
      ? `${resource} já existe com ${field}: ${value}`
      : `${resource} já existe`;
    super(message, HTTP_STATUS.CONFLICT);
  }
}

/**
 * Erro de autorização (não autenticado)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Não autorizado") {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

/**
 * Erro de permissão (autenticado mas sem permissão)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Acesso negado") {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}

// ========== Erros de Banco de Dados ==========

/**
 * Erro de operação no banco de dados
 */
export class DatabaseError extends AppError {
  public readonly originalError?: Error;

  constructor(message: string = "Erro ao acessar banco de dados", originalError?: Error) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, false);
    this.originalError = originalError;
  }
}

/**
 * Erro de constraint do banco de dados
 */
export class DatabaseConstraintError extends DatabaseError {
  constructor(constraint: string, originalError?: Error) {
    super(`Violação de restrição do banco de dados: ${constraint}`, originalError);
  }
}

// ========== Erros de Integração Externa ==========

/**
 * Erro de integração com serviço externo
 */
export class ExternalServiceError extends AppError {
  public readonly service: string;
  public readonly originalError?: Error;

  constructor(service: string, message: string, originalError?: Error) {
    super(`Erro ao integrar com ${service}: ${message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR, false);
    this.service = service;
    this.originalError = originalError;
  }
}

/**
 * Erro de consulta CNPJ
 */
export class CNPJConsultaError extends ExternalServiceError {
  constructor(cnpj: string, originalError?: Error) {
    super("Receita Federal", `Falha ao consultar CNPJ: ${cnpj}`, originalError);
  }
}

// ========== Utilitários de Erro ==========

/**
 * Verifica se erro é operacional (esperado) ou crítico
 * @param error - Erro a ser verificado
 * @returns true se erro é operacional, false se é crítico
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Extrai mensagem de erro de forma segura
 * @param error - Erro ou qualquer valor
 * @returns Mensagem de erro ou mensagem padrão
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Erro desconhecido";
}

/**
 * Extrai código de status HTTP de erro
 * @param error - Erro a ser verificado
 * @returns Código de status HTTP
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }
  return HTTP_STATUS.INTERNAL_SERVER_ERROR;
}

/**
 * Formata erro para resposta da API
 * @param error - Erro a ser formatado
 * @returns Objeto formatado para resposta
 */
export function formatErrorResponse(error: unknown) {
  if (error instanceof ValidationError) {
    return {
      success: false,
      error: error.message,
      errors: error.errors,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      statusCode: error.statusCode,
    };
  }

  // Erro desconhecido - não expor detalhes internos
  return {
    success: false,
    error: "Erro interno do servidor",
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  };
}

/**
 * Logger de erros integrado com Winston
 * @param error - Erro a ser logado
 * @param context - Contexto adicional
 */
export function logError(error: unknown, context?: Record<string, any>) {
  // Import dinâmico para evitar dependência circular
  const logger = require("../logger").default;
  
  const errorMessage = getErrorMessage(error);
  const statusCode = getErrorStatusCode(error);
  const isOperational = error instanceof AppError ? error.isOperational : false;

  // Log com nível apropriado
  if (isOperational) {
    logger.warn(errorMessage, {
      ...context,
      statusCode,
      operational: true,
    });
  } else {
    logger.error(errorMessage, error instanceof Error ? error : undefined, {
      ...context,
      statusCode,
      operational: false,
    });
  }
}
