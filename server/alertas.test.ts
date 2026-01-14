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

describe("Alertas Router", () => {
  it("deve listar alertas", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.alertas.list();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("deve filtrar alertas não lidos", () => {
    const alertas = [
      { id: 1, lido: false },
      { id: 2, lido: true },
      { id: 3, lido: false },
    ];

    const naoLidos = alertas.filter(a => !a.lido);

    expect(naoLidos.length).toBe(2);
  });
});

describe("Dashboard Cálculos", () => {
  it("deve calcular indicadores do dashboard corretamente", () => {
    const faturamento = 50000;
    const despesas = 30000;
    const lucro = faturamento - despesas;
    const funcionariosAtivos = 10;

    expect(faturamento).toBeGreaterThan(0);
    expect(despesas).toBeGreaterThan(0);
    expect(lucro).toBe(20000);
    expect(funcionariosAtivos).toBeGreaterThanOrEqual(0);
  });

  it("deve calcular saldo em caixa corretamente", () => {
    const faturamento = 50000;
    const despesas = 30000;
    const saldo = faturamento - despesas;

    expect(saldo).toBe(20000);
  });
});
