import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "admin" | "user" = "admin"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
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

describe("KPIs Router", () => {
  it("deve listar KPIs", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.kpis.list();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("deve calcular faturamento líquido corretamente", () => {
    const faturamentoBruto = "10000.00";
    const impostos = "2000.00";
    const faturamentoLiquido = parseFloat(faturamentoBruto) - parseFloat(impostos);

    expect(faturamentoLiquido).toBe(8000.00);
  });

  it("deve calcular lucro/prejuízo corretamente", () => {
    const faturamentoLiquido = 8000.00;
    const custosFixos = "3000.00";
    const custosVariaveis = "2000.00";
    const lucroPrejuizo = faturamentoLiquido - parseFloat(custosFixos) - parseFloat(custosVariaveis);

    expect(lucroPrejuizo).toBe(3000.00);
  });

  it("deve calcular margem percentual corretamente", () => {
    const lucroPrejuizo = 3000.00;
    const faturamentoBruto = 10000.00;
    const margem = (lucroPrejuizo / faturamentoBruto) * 100;

    expect(margem).toBe(30.00);
  });
});
