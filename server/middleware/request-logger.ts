/**
 * Middleware de Rastreamento de Requisições
 * 
 * Gera ID único para cada requisição e loga automaticamente:
 * - Início da requisição (método, URL, IP)
 * - Fim da requisição (status code, tempo de resposta)
 * - Erros durante processamento
 */

import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import logger from "../logger";

// ========== Tipos ==========

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
    }
  }
}

// ========== Gerador de Request ID ==========

/**
 * Gera ID único para requisição
 */
function generateRequestId(): string {
  return randomUUID();
}

/**
 * Extrai IP real do cliente (considerando proxies)
 */
function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    (req.headers["x-real-ip"] as string) ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

// ========== Middleware Principal ==========

/**
 * Middleware que adiciona request ID e loga requisições
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // Gera ID único para requisição
  req.requestId = generateRequestId();
  req.startTime = Date.now();

  // Extrai informações da requisição
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "unknown";

  // Log de início da requisição
  logger.http(`${method} ${url}`, {
    requestId: req.requestId,
    method,
    url,
    ip,
    userAgent,
    query: req.query,
    body: sanitizeBody(req.body),
  });

  // Intercepta resposta para logar fim da requisição
  const originalSend = res.send;
  res.send = function (data: any) {
    // Calcula tempo de resposta
    const duration = Date.now() - (req.startTime || 0);
    const statusCode = res.statusCode;

    // Determina nível de log baseado no status code
    const logLevel = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "http";

    // Log de fim da requisição
    logger[logLevel](`${method} ${url} ${statusCode} - ${duration}ms`, {
      requestId: req.requestId,
      method,
      url,
      statusCode,
      duration,
      ip,
    });

    // Chama send original
    return originalSend.call(this, data);
  };

  next();
}

// ========== Sanitização ==========

/**
 * Sanitiza body da requisição para não logar dados sensíveis
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== "object") {
    return body;
  }

  const sensitiveFields = ["password", "senha", "token", "secret", "apiKey", "api_key"];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = "***REDACTED***";
    }
  }

  return sanitized;
}

// ========== Middleware de Erro ==========

/**
 * Middleware de erro que loga exceções não tratadas
 */
export function errorLogger(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error("Unhandled error in request", err, {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    body: sanitizeBody(req.body),
    query: req.query,
  });

  next(err);
}

// ========== Exports ==========

export default requestLogger;
