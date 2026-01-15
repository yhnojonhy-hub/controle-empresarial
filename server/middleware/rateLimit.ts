import rateLimit from 'express-rate-limit';

/**
 * Rate limiter para APIs públicas
 * 100 requisições por minuto por IP
 */
export const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100,
  message: 'Muitas requisições de seu IP, tente novamente em um minuto',
  standardHeaders: true, // Retorna informações de rate limit nos headers
  legacyHeaders: false,
  skip: (req) => {
    // Não aplicar rate limit em health checks
    return req.path === '/health';
  },
});

/**
 * Rate limiter mais restritivo para endpoints sensíveis
 * 20 requisições por minuto por IP
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20,
  message: 'Muitas tentativas, tente novamente em um minuto',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para login
 * 5 tentativas por 15 minutos por IP
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  message: 'Muitas tentativas de login, tente novamente em 15 minutos',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Não contar requisições bem-sucedidas
});

/**
 * Rate limiter por usuário autenticado
 * 1000 requisições por hora por usuário
 */
export const userLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 1000,
  message: 'Limite de requisições excedido, tente novamente em uma hora',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Usar ID do usuário se autenticado, caso contrário usar IP
    return (req as any).user?.id?.toString() || req.ip || 'unknown';
  },
});
