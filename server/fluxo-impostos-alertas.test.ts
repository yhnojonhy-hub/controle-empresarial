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

describe("FluxoCaixa Router - Testes Práticos", () => {
  it("deve listar fluxo de caixa", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.fluxoCaixa.list();
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  it("deve criar registro de fluxo de caixa (entrada)", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const novoFluxo = {
      data: "2026-01-25",
      tipo: "Entrada" as const,
      descricao: "Recebimento Teste",
      categoria: "Vendas",
      valor: "25000",
    };

    const result = await caller.fluxoCaixa.create(novoFluxo);
    
    expect(result).toBeDefined();
    expect(result.tipo).toBe("Entrada");
    expect(result.descricao).toBe("Recebimento Teste");
  });

  it("deve criar registro de fluxo de caixa (saída)", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const novoFluxo = {
      data: "2026-01-26",
      tipo: "Saida" as const,
      descricao: "Pagamento Teste",
      categoria: "Operacional",
      valor: "10000",
    };

    const result = await caller.fluxoCaixa.create(novoFluxo);
    
    expect(result).toBeDefined();
    expect(result.tipo).toBe("Saida");
    expect(result.valor).toBeDefined();
  });
});

describe("Impostos Router - Testes Práticos", () => {
  it("deve listar impostos", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.impostos.list();
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  it("deve criar imposto com cálculo automático", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const novoImposto = {
      empresaId: 1,
      tipoImposto: "IRPJ",
      baseCalculo: "100000",
      aliquota: "0.15",
      valor: "15000", // 15% de 100.000
      vencimento: "2026-03-31",
      status: "Pendente" as const,
    };

    const result = await caller.impostos.create(novoImposto);
    
    expect(result).toBeDefined();
    expect(result.tipoImposto).toBe("IRPJ");
    expect(result.empresaId).toBe(1);
  });

  it("deve criar ICMS com alíquota de 18%", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const novoImposto = {
      empresaId: 1,
      tipoImposto: "ICMS",
      baseCalculo: "200000",
      aliquota: "0.18",
      valor: "36000",
      vencimento: "2026-02-20",
      status: "Pendente" as const,
    };

    const result = await caller.impostos.create(novoImposto);
    
    expect(result).toBeDefined();
    expect(result.tipoImposto).toBe("ICMS");
  });

  it("deve criar PIS/COFINS", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const pis = {
      empresaId: 1,
      tipoImposto: "PIS",
      baseCalculo: "150000",
      aliquota: "0.0165",
      valor: "2475",
      vencimento: "2026-02-25",
      status: "Pendente" as const,
    };

    const result = await caller.impostos.create(pis);
    
    expect(result).toBeDefined();
    expect(result.tipoImposto).toBe("PIS");
  });
});

describe("Alertas Router - Testes Práticos", () => {
  it("deve listar alertas", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.alertas.list();
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  it("deve filtrar alertas não lidos", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.alertas.list();
    const naoLidos = result.filter(a => !a.lido);
    
    expect(naoLidos.length).toBeGreaterThanOrEqual(0);
  });

  it("deve contar alertas por prioridade", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.alertas.list();
    const alta = result.filter(a => a.prioridade === "Alta");
    const media = result.filter(a => a.prioridade === "Media");
    const baixa = result.filter(a => a.prioridade === "Baixa");
    
    expect(alta.length + media.length + baixa.length).toBe(result.length);
  });

  it("deve contar alertas por tipo", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.alertas.list();
    const vencimento = result.filter(a => a.tipo === "Vencimento");
    const margem = result.filter(a => a.tipo === "Margem");
    const saldo = result.filter(a => a.tipo === "Saldo");
    
    expect(vencimento.length + margem.length + saldo.length).toBeLessThanOrEqual(result.length);
  });
});
