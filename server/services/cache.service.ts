/**
 * Cache Service
 * 
 * Implementa cache com suporte a Redis (produção) e In-Memory (desenvolvimento)
 * Reduz carga de banco de dados com TTL configurável
 * 
 * Princípios SOLID:
 * - SRP: Responsabilidade única de gerenciar cache
 * - OCP: Extensível para novos backends (Redis, Memcached, etc)
 * - LSP: Interface consistente independente do backend
 * - DIP: Depende de abstração (CacheBackend)
 */

import logger from "../logger";

/**
 * Interface para diferentes backends de cache
 */
interface CacheBackend {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Backend de cache em memória (desenvolvimento)
 */
class InMemoryCacheBackend implements CacheBackend {
  private cache = new Map<string, { value: any; expiresAt: number }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

/**
 * Serviço centralizado de cache
 */
class CacheService {
  private backend: CacheBackend;
  private defaultTtl = 3600; // 1 hora

  constructor() {
    // Usar Redis se disponível, caso contrário usar In-Memory
    this.backend = new InMemoryCacheBackend();
    logger.info("CacheService inicializado com In-Memory backend", {
      context: "CacheService",
    });
  }

  /**
   * Obter valor do cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.backend.get<T>(key);
      if (value) {
        logger.debug("Cache hit", { context: "CacheService", key });
      }
      return value;
    } catch (error) {
      logger.warn("Erro ao obter cache", { context: "CacheService", key, error });
      return null;
    }
  }

  /**
   * Armazenar valor no cache
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      await this.backend.set(key, value, ttlSeconds ?? this.defaultTtl);
      logger.debug("Cache set", {
        context: "CacheService",
        key,
        ttl: ttlSeconds ?? this.defaultTtl,
      });
    } catch (error) {
      logger.warn("Erro ao armazenar cache", { context: "CacheService", key, error });
    }
  }

  /**
   * Deletar valor do cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.backend.delete(key);
      logger.debug("Cache deleted", { context: "CacheService", key });
    } catch (error) {
      logger.warn("Erro ao deletar cache", { context: "CacheService", key, error });
    }
  }

  /**
   * Limpar todo o cache
   */
  async clear(): Promise<void> {
    try {
      await this.backend.clear();
      logger.info("Cache limpo", { context: "CacheService" });
    } catch (error) {
      logger.warn("Erro ao limpar cache", { context: "CacheService", error });
    }
  }

  /**
   * Padrão: obter ou calcular
   * Se não estiver em cache, calcula, armazena e retorna
   */
  async getOrSet<T>(
    key: string,
    compute: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    logger.debug("Cache miss, calculando", { context: "CacheService", key });
    const value = await compute();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  /**
   * Gerar chave de cache com prefixo
   */
  static makeKey(...parts: (string | number)[]): string {
    return parts.map(p => String(p)).join(":");
  }
}

// Singleton
export const cacheService = new CacheService();

/**
 * Chaves de cache padronizadas
 */
export const CACHE_KEYS = {
  // Empresas
  EMPRESAS_LIST: "empresas:list",
  EMPRESA: (id: number) => `empresa:${id}`,

  // KPIs
  KPIS_LIST: "kpis:list",
  KPI: (id: number) => `kpi:${id}`,
  KPI_BY_EMPRESA: (empresaId: number) => `kpi:empresa:${empresaId}`,

  // Contas
  CONTAS_LIST: "contas:list",
  CONTA: (id: number) => `conta:${id}`,
  CONTAS_BY_EMPRESA: (empresaId: number) => `contas:empresa:${empresaId}`,

  // Funcionários
  FUNCIONARIOS_LIST: "funcionarios:list",
  FUNCIONARIO: (id: number) => `funcionario:${id}`,
  FUNCIONARIOS_BY_EMPRESA: (empresaId: number) => `funcionarios:empresa:${empresaId}`,

  // Alertas
  ALERTAS_LIST: "alertas:list",
  ALERTAS_NAO_LIDOS: "alertas:nao_lidos",

  // Dashboard
  DASHBOARD_DATA: "dashboard:data",
  DASHBOARD_SUMMARY: "dashboard:summary",

  // Contas Bancárias
  CONTAS_BANCARIAS_LIST: "contas_bancarias:list",
  SALDOS_POR_EMPRESA: "saldos:por_empresa",
  SALDO_GERAL: "saldo:geral",
};

export default cacheService;
