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

describe("empresas.list", () => {
  it("deve retornar lista de empresas", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.empresas.list();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    
    if (result.length > 0) {
      const empresa = result[0];
      expect(empresa).toHaveProperty("id");
      expect(empresa).toHaveProperty("cnpj");
      expect(empresa).toHaveProperty("nomeFantasia");
    }
  });

  it("deve ter pelo menos 7 empresas importadas", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.empresas.list();

    expect(result.length).toBeGreaterThanOrEqual(7);
  });

  it("deve incluir Ipe Bank nas empresas", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.empresas.list();

    const ipeBank = result.find(e => e.nomeFantasia === "Ipe Bank");
    expect(ipeBank).toBeDefined();
    expect(ipeBank?.cnpj).toBe("42.458.704/0001-52");
  });
});
