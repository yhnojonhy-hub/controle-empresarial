/**
 * Constantes Centralizadas do Sistema
 * 
 * Elimina "magic numbers" e "magic strings" espalhados pelo código.
 * Facilita manutenção e configuração.
 */

// ========== Configurações Gerais ==========

export const APP_CONFIG = {
  NAME: "Controle Empresarial",
  VERSION: "1.0.0",
  ENVIRONMENT: process.env.NODE_ENV || "development",
} as const;

// ========== Limites e Paginação ==========

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 10,
} as const;

// ========== Formatos de Data ==========

export const DATE_FORMATS = {
  ISO: "YYYY-MM-DD",
  MONTH_YEAR: "YYYY-MM",
  BR_DATE: "DD/MM/YYYY",
  BR_DATETIME: "DD/MM/YYYY HH:mm:ss",
} as const;

// ========== Validação ==========

export const VALIDATION_LIMITS = {
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 255,
  MIN_DESCRIPTION_LENGTH: 3,
  MAX_DESCRIPTION_LENGTH: 1000,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  CNPJ_LENGTH: 14,
  CPF_LENGTH: 11,
} as const;

// ========== Valores Monetários ==========

export const CURRENCY = {
  SYMBOL: "R$",
  DECIMAL_PLACES: 2,
  MIN_VALUE: 0,
  MAX_VALUE: 999999999.99,
} as const;

// ========== Porcentagens ==========

export const PERCENTAGE = {
  MIN_VALUE: 0,
  MAX_VALUE: 100,
  DECIMAL_PLACES: 2,
} as const;

// ========== Status HTTP ==========

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// ========== Mensagens de Erro Padrão ==========

export const ERROR_MESSAGES = {
  // Genéricos
  INTERNAL_ERROR: "Erro interno do servidor",
  INVALID_INPUT: "Dados de entrada inválidos",
  VALIDATION_FAILED: "Falha na validação dos dados",
  NOT_FOUND: "Registro não encontrado",
  UNAUTHORIZED: "Não autorizado",
  FORBIDDEN: "Acesso negado",

  // Empresa
  EMPRESA_NOT_FOUND: "Empresa não encontrada",
  EMPRESA_ALREADY_EXISTS: "Empresa já cadastrada com este CNPJ",
  INVALID_CNPJ: "CNPJ inválido",
  CNPJ_REQUIRED: "CNPJ é obrigatório",

  // Funcionário
  FUNCIONARIO_NOT_FOUND: "Funcionário não encontrado",
  FUNCIONARIO_ALREADY_EXISTS: "Funcionário já cadastrado com este CPF",
  INVALID_CPF: "CPF inválido",
  CPF_REQUIRED: "CPF é obrigatório",

  // KPI
  KPI_NOT_FOUND: "KPI não encontrado",
  INVALID_MONTH_YEAR: "Mês/Ano inválido",

  // Conta
  CONTA_NOT_FOUND: "Conta não encontrada",
  INVALID_DATE: "Data inválida",
  INVALID_CURRENCY: "Valor monetário inválido",

  // Fluxo de Caixa
  FLUXO_NOT_FOUND: "Movimentação não encontrada",

  // Imposto
  IMPOSTO_NOT_FOUND: "Imposto não encontrado",
  INVALID_PERCENTAGE: "Porcentagem inválida",

  // Alerta
  ALERTA_NOT_FOUND: "Alerta não encontrado",
} as const;

// ========== Mensagens de Sucesso Padrão ==========

export const SUCCESS_MESSAGES = {
  CREATED: "Registro criado com sucesso",
  UPDATED: "Registro atualizado com sucesso",
  DELETED: "Registro deletado com sucesso",
  
  EMPRESA_CREATED: "Empresa cadastrada com sucesso",
  EMPRESA_UPDATED: "Empresa atualizada com sucesso",
  EMPRESA_DELETED: "Empresa deletada com sucesso",
  
  FUNCIONARIO_CREATED: "Funcionário cadastrado com sucesso",
  FUNCIONARIO_UPDATED: "Funcionário atualizado com sucesso",
  FUNCIONARIO_DELETED: "Funcionário deletado com sucesso",
  
  KPI_CREATED: "KPI registrado com sucesso",
  KPI_UPDATED: "KPI atualizado com sucesso",
  KPI_DELETED: "KPI deletado com sucesso",
  
  CONTA_CREATED: "Conta cadastrada com sucesso",
  CONTA_UPDATED: "Conta atualizada com sucesso",
  CONTA_DELETED: "Conta deletada com sucesso",
  
  FLUXO_CREATED: "Movimentação registrada com sucesso",
  FLUXO_UPDATED: "Movimentação atualizada com sucesso",
  FLUXO_DELETED: "Movimentação deletada com sucesso",
  
  IMPOSTO_CREATED: "Imposto cadastrado com sucesso",
  IMPOSTO_UPDATED: "Imposto atualizado com sucesso",
  IMPOSTO_DELETED: "Imposto deletado com sucesso",
  
  ALERTA_CREATED: "Alerta criado com sucesso",
  ALERTA_UPDATED: "Alerta atualizado com sucesso",
  ALERTA_DELETED: "Alerta deletado com sucesso",
  ALERTA_RESOLVED: "Alerta resolvido com sucesso",
} as const;

// ========== Categorias de Fluxo de Caixa ==========

export const FLUXO_CATEGORIAS = {
  ENTRADA: [
    "Vendas",
    "Serviços",
    "Investimentos",
    "Empréstimos",
    "Outros",
  ],
  SAIDA: [
    "Fornecedores",
    "Salários",
    "Impostos",
    "Despesas Operacionais",
    "Despesas Administrativas",
    "Outros",
  ],
} as const;

// ========== Categorias de Contas ==========

export const CONTA_CATEGORIAS = {
  PAGAR: [
    "Fornecedores",
    "Salários",
    "Impostos",
    "Aluguel",
    "Energia",
    "Água",
    "Internet",
    "Telefone",
    "Outros",
  ],
  RECEBER: [
    "Vendas",
    "Serviços",
    "Juros",
    "Outros",
  ],
} as const;

// ========== Prioridades ==========

export const PRIORIDADES = ["Baixa", "Media", "Alta", "Crítica"] as const;

// ========== Estados Brasileiros ==========

export const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

// ========== Regimes Tributários ==========

export const REGIMES_TRIBUTARIOS = [
  "Simples Nacional",
  "Lucro Presumido",
  "Lucro Real",
  "MEI",
] as const;

// ========== Tipos de Imposto ==========

export const TIPOS_IMPOSTO = [
  "ICMS",
  "ISS",
  "PIS",
  "COFINS",
  "IRPJ",
  "CSLL",
  "Simples Nacional",
  "Outros",
] as const;

// ========== Tipos de Contrato ==========

export const TIPOS_CONTRATO = [
  "CLT",
  "PJ",
  "Estágio",
  "Temporário",
] as const;

// ========== Configurações de Log ==========

export const LOG_CONFIG = {
  ENABLED: true,
  LEVEL: process.env.LOG_LEVEL || "info",
  INCLUDE_TIMESTAMP: true,
  INCLUDE_CONTEXT: true,
} as const;

// ========== Timeouts e Delays ==========

export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 segundos
  DATABASE_QUERY: 10000, // 10 segundos
  CACHE_TTL: 300, // 5 minutos
} as const;

// ========== Rate Limiting ==========

export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutos
  MAX_REQUESTS: 100, // máximo de requisições por janela
} as const;

// ========== Configurações de Notificação ==========

export const NOTIFICATION_CONFIG = {
  ENABLED: true,
  SEND_ON_CREATE: true,
  SEND_ON_UPDATE: false,
  SEND_ON_DELETE: false,
  SEND_ON_ERROR: true,
} as const;
