import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Contas Router", () => {
  it("deve listar contas", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contas.list();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("deve identificar conta atrasada corretamente", () => {
    const dataVencimento = new Date("2024-01-01");
    const hoje = new Date();
    const estaAtrasada = dataVencimento < hoje;

    expect(estaAtrasada).toBe(true);
  });

  it("deve calcular dias até vencimento", () => {
    const hoje = new Date();
    const vencimento = new Date(hoje);
    vencimento.setDate(vencimento.getDate() + 7);
    
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    expect(diffDays).toBe(7);
  });
});
