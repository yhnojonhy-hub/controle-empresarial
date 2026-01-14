/**
 * Logger Centralizado
 * 
 * Interface limpa para logging em toda a aplicação.
 * Usa Winston internamente mas expõe API simplificada.
 */

import winston from "winston";
import { loggerConfig, LogLevel } from "./config";

// ========== Contexto de Log ==========

export interface LogContext {
  requestId?: string;
  userId?: number;
  userEmail?: string;
  context?: string;
  [key: string]: any;
}

// ========== Classe Logger ==========

class Logger {
  private winston: winston.Logger;

  constructor() {
    this.winston = winston.createLogger(loggerConfig);
  }

  /**
   * Log de erro
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    const meta = this.buildMeta(context, error);
    this.winston.error(message, meta);
  }

  /**
   * Log de aviso
   */
  warn(message: string, context?: LogContext) {
    const meta = this.buildMeta(context);
    this.winston.warn(message, meta);
  }

  /**
   * Log informativo
   */
  info(message: string, context?: LogContext) {
    const meta = this.buildMeta(context);
    this.winston.info(message, meta);
  }

  /**
   * Log de requisição HTTP
   */
  http(message: string, context?: LogContext) {
    const meta = this.buildMeta(context);
    this.winston.http(message, meta);
  }

  /**
   * Log de debug
   */
  debug(message: string, context?: LogContext) {
    const meta = this.buildMeta(context);
    this.winston.debug(message, meta);
  }

  /**
   * Log de auditoria (operações importantes)
   */
  audit(action: string, entity: string, entityId: number | string, context?: LogContext) {
    const meta = this.buildMeta({
      ...context,
      action,
      entity,
      entityId,
      audit: true,
    });
    this.winston.info(`[AUDIT] ${action} ${entity} ${entityId}`, meta);
  }

  /**
   * Log de performance
   */
  performance(operation: string, durationMs: number, context?: LogContext) {
    const meta = this.buildMeta({
      ...context,
      operation,
      durationMs,
      performance: true,
    });
    
    // Avisa se operação demorou muito
    const level = durationMs > 1000 ? "warn" : "info";
    this.winston.log(level, `[PERFORMANCE] ${operation} took ${durationMs}ms`, meta);
  }

  /**
   * Constrói metadados do log
   */
  private buildMeta(context?: LogContext, error?: Error | unknown): Record<string, any> {
    const meta: Record<string, any> = {};

    // Adiciona contexto
    if (context) {
      Object.assign(meta, context);
    }

    // Adiciona erro se houver
    if (error) {
      if (error instanceof Error) {
        meta.error = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };
      } else {
        meta.error = String(error);
      }
    }

    return meta;
  }

  /**
   * Cria logger filho com contexto fixo
   */
  child(defaultContext: LogContext): Logger {
    const childLogger = new Logger();
    const originalBuildMeta = childLogger.buildMeta.bind(childLogger);
    
    childLogger.buildMeta = (context?: LogContext, error?: Error | unknown) => {
      return originalBuildMeta({ ...defaultContext, ...context }, error);
    };
    
    return childLogger;
  }
}

// ========== Instância Global ==========

export const logger = new Logger();

// ========== Exports ==========

export type { LogContext };
export default logger;
