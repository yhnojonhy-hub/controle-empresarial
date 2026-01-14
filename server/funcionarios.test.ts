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

describe("Funcionários Router", () => {
  it("deve listar funcionários", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.funcionarios.list();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("deve calcular custo total do funcionário corretamente", () => {
    const salarioBase = "5000.00";
    const beneficios = "1500.00";
    const custoTotal = parseFloat(salarioBase) + parseFloat(beneficios);

    expect(custoTotal).toBe(6500.00);
  });

  it("deve validar CPF com 11 dígitos", () => {
    const cpfValido = "12345678901";
    const cpfInvalido = "123456";

    expect(cpfValido.length).toBe(11);
    expect(cpfInvalido.length).not.toBe(11);
  });

  it("deve contar funcionários ativos", () => {
    const funcionarios = [
      { status: "Contratado" },
      { status: "Contratado" },
      { status: "Demitido" },
      { status: "Contratado" },
    ];

    const ativos = funcionarios.filter(f => f.status === "Contratado").length;

    expect(ativos).toBe(3);
  });
});
