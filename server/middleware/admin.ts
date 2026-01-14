import { TRPCError } from "@trpc/server";
import { middleware } from "../_core/trpc";

/**
 * Middleware que verifica se o usuário autenticado possui role de administrador
 * Lança erro FORBIDDEN se o usuário não for admin
 */
export const adminMiddleware = middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Você precisa estar autenticado para acessar este recurso",
    });
  }

  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso negado. Apenas administradores podem realizar esta ação",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Garantir que user está presente
    },
  });
});
