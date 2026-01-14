/**
 * Tipos Compartilhados do Sistema
 * 
 * Centraliza todas as definições de tipos para garantir consistência
 * e facilitar manutenção. Segue princípio DRY.
 */

// ========== Tipos Base ==========

export type ID = number;

export type Timestamp = Date;

export type Currency = string; // Formato: "1000.50"

export type Percentage = string; // Formato: "15.5"

export type CNPJ = string; // Formato: "00.000.000/0000-00"

export type CPF = string; // Formato: "000.000.000-00"

export type MonthYear = string; // Formato: "YYYY-MM"

export type ISODate = string; // Formato: "YYYY-MM-DD"

// ========== Enums ==========

export enum EmpresaStatus {
  ABERTO = "Aberto",
  FECHADO = "Fechado",
  SUSPENSO = "Suspenso",
}

export enum RegimeTributario {
  SIMPLES_NACIONAL = "Simples Nacional",
  LUCRO_PRESUMIDO = "Lucro Presumido",
  LUCRO_REAL = "Lucro Real",
  MEI = "MEI",
}

export enum ContaTipo {
  PAGAR = "Pagar",
  RECEBER = "Receber",
}

export enum ContaStatus {
  PENDENTE = "Pendente",
  PAGO = "Pago",
  ATRASADO = "Atrasado",
}

export enum ContaPrioridade {
  BAIXA = "Baixa",
  MEDIA = "Media",
  ALTA = "Alta",
}

export enum FuncionarioStatus {
  CONTRATADO = "Contratado",
  DEMITIDO = "Demitido",
  AFASTADO = "Afastado",
}

export enum TipoContrato {
  CLT = "CLT",
  PJ = "PJ",
  ESTAGIO = "Estágio",
  TEMPORARIO = "Temporário",
}

export enum FluxoCaixaTipo {
  ENTRADA = "Entrada",
  SAIDA = "Saida",
}

export enum ImpostoTipo {
  ICMS = "ICMS",
  ISS = "ISS",
  PIS = "PIS",
  COFINS = "COFINS",
  IRPJ = "IRPJ",
  CSLL = "CSLL",
  SIMPLES_NACIONAL = "Simples Nacional",
  OUTROS = "Outros",
}

export enum AlertaTipo {
  CONTA_VENCIDA = "Conta Vencida",
  IMPOSTO_PROXIMO = "Imposto Próximo",
  KPI_FORA_META = "KPI Fora da Meta",
  FLUXO_NEGATIVO = "Fluxo Negativo",
}

export enum AlertaPrioridade {
  BAIXA = "Baixa",
  MEDIA = "Media",
  ALTA = "Alta",
  CRITICA = "Crítica",
}

// ========== Entidades ==========

export interface BaseEntity {
  id: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Empresa extends BaseEntity {
  cnpj: CNPJ;
  razaoSocial: string | null;
  nomeFantasia: string | null;
  capitalSocial: Currency | null;
  cnae: string | null;
  regimeTributario: RegimeTributario | null;
  enderecoCompleto: string | null;
  cidade: string | null;
  estado: string | null;
  responsavelLegal: string | null;
  telefone: string | null;
  email: string | null;
  dataAbertura: Timestamp | null;
  status: EmpresaStatus;
}

export interface KPI extends BaseEntity {
  empresaId: ID | null;
  mesAno: MonthYear;
  faturamentoBruto: Currency;
  impostos: Currency;
  custosFixos: Currency;
  custosVariaveis: Currency;
  faturamentoLiquido?: Currency;
  lucroBruto?: Currency;
  margemLucro?: Percentage;
}

export interface Conta extends BaseEntity {
  empresaId: ID | null;
  tipo: ContaTipo;
  descricao: string;
  categoria: string;
  valor: Currency;
  dataVencimento: ISODate;
  status: ContaStatus;
  prioridade: ContaPrioridade | null;
  metodoPagamento: string | null;
  observacoes: string | null;
}

export interface Funcionario extends BaseEntity {
  empresaId: ID | null;
  nome: string;
  cpf: CPF;
  cargo: string;
  tipoContrato: TipoContrato | null;
  salarioBase: Currency;
  beneficios: Currency;
  dataAdmissao: ISODate;
  status: FuncionarioStatus;
}

export interface FluxoCaixa extends BaseEntity {
  empresaId: ID | null;
  data: ISODate;
  tipo: FluxoCaixaTipo;
  descricao: string | null;
  categoria: string;
  valor: Currency;
}

export interface Imposto extends BaseEntity {
  empresaId: ID | null;
  mesAno: MonthYear;
  tipo: ImpostoTipo;
  baseCalculo: Currency;
  aliquota: Percentage;
  valorCalculado?: Currency;
  vencimento: ISODate;
}

export interface Alerta extends BaseEntity {
  empresaId: ID | null;
  tipo: AlertaTipo;
  titulo: string;
  descricao: string | null;
  prioridade: AlertaPrioridade;
  dataAlerta: ISODate;
  resolvido: boolean;
}

// ========== DTOs (Data Transfer Objects) ==========

export interface CreateEmpresaDTO {
  cnpj: CNPJ;
  razaoSocial?: string;
  nomeFantasia?: string;
  capitalSocial?: Currency;
  cnae?: string;
  regimeTributario?: RegimeTributario;
  enderecoCompleto?: string;
  cidade?: string;
  estado?: string;
  responsavelLegal?: string;
  telefone?: string;
  email?: string;
  dataAbertura?: ISODate;
  status?: EmpresaStatus;
}

export interface UpdateEmpresaDTO extends Partial<CreateEmpresaDTO> {}

// ========== Response Types ==========

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ========== Validation Result ==========

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ========== CNPJ Consulta ==========

export interface CNPJData {
  cnpj: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  dataAbertura?: string;
  situacao?: string;
  endereco?: string;
  municipio?: string;
  uf?: string;
  telefone?: string;
  email?: string;
  capitalSocial?: string;
  cnae?: string;
}
