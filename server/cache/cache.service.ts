/**
 * Cache Service - Suporta Redis ou In-Memory
 * 
 * Implementa cache com TTL para:
 * - Empresas (1 hora)
 * - Saldos consolidados (15 minutos)
 * - Indicadores KPI (30 minutos)
 * - Alertas (5 minutos)
 */

import { logger } from '../logger';

export type CacheKey = 
  | 'empresas'
  | 'saldos-consolidados'
  | 'indicadores-kpi'
  | 'alertas'
  | `empresa-${number}`
  | `contas-${number}`
  | `saldos-${number}`;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Cache em memória (fallback quando Redis não está disponível)
 */
class InMemoryCache {
  private store = new Map<CacheKey, CacheEntry<any>>();

  async get<T>(key: CacheKey): Promise<T | null> {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set<T>(key: CacheKey, value: T, ttlSeconds: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async delete(key: CacheKey): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async getOrSet<T>(
    key: CacheKey,
    fetcher: () => Promise<T>,
    ttlSeconds: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) {
      logger.debug(`Cache HIT: ${key}`);
      return cached;
    }

    logger.debug(`Cache MISS: ${key}, fetching...`);
    const value = await fetcher();
    await this.set(key, value, ttlSeconds);
    return value;
  }
}

/**
 * Cache Service - Interface unificada
 */
class CacheService {
  private backend: InMemoryCache;

  constructor() {
    this.backend = new InMemoryCache();
    logger.info('Cache Service initialized (In-Memory mode)');
  }

  /**
   * Buscar valor do cache
   */
  async get<T>(key: CacheKey): Promise<T | null> {
    try {
      return await this.backend.get<T>(key);
    } catch (error) {
      logger.error(`Cache GET error for ${key}:`, error);
      return null;
    }
  }

  /**
   * Salvar valor no cache
   */
  async set<T>(key: CacheKey, value: T, ttlSeconds: number = 3600): Promise<void> {
    try {
      await this.backend.set(key, value, ttlSeconds);
      logger.debug(`Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
      logger.error(`Cache SET error for ${key}:`, error);
    }
  }

  /**
   * Deletar valor do cache
   */
  async delete(key: CacheKey): Promise<void> {
    try {
      await this.backend.delete(key);
      logger.debug(`Cache DELETE: ${key}`);
    } catch (error) {
      logger.error(`Cache DELETE error for ${key}:`, error);
    }
  }

  /**
   * Limpar todo o cache
   */
  async clear(): Promise<void> {
    try {
      await this.backend.clear();
      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Cache CLEAR error:', error);
    }
  }

  /**
   * Buscar do cache ou executar fetcher
   */
  async getOrSet<T>(
    key: CacheKey,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 3600
  ): Promise<T> {
    try {
      return await this.backend.getOrSet(key, fetcher, ttlSeconds);
    } catch (error) {
      logger.error(`Cache getOrSet error for ${key}:`, error);
      // Fallback: executar fetcher sem cache
      return await fetcher();
    }
  }

  /**
   * Invalidar cache relacionado (útil após mutações)
   */
  async invalidatePattern(pattern: string): Promise<void> {
    logger.debug(`Invalidating cache pattern: ${pattern}`);
    // Implementação simplificada - em produção usar Redis KEYS
    // Por enquanto, apenas log
  }
}

// Singleton
export const cacheService = new CacheService();

// Presets de TTL
export const CACHE_TTL = {
  EMPRESAS: 3600,           // 1 hora
  SALDOS: 900,              // 15 minutos
  INDICADORES: 1800,        // 30 minutos
  ALERTAS: 300,             // 5 minutos
  CONTAS: 600,              // 10 minutos
  RECONCILIACAO: 1200,      // 20 minutos
} as const;
