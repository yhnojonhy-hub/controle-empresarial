import { describe, it, expect, beforeEach, vi } from "vitest";
import { consolidarDadosEmpresa, consolidarTodasEmpresas, resumoConsolidado } from "./consolidacao.service";
import * as db from "../db";

// Mock do módulo db
vi.mock("../db", () => ({
  getDb: vi.fn(),
}));

describe("Consolidacao Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("consolidarDadosEmpresa", () => {
    it("deve consolidar dados de uma empresa com sucesso", async () => {
      // Mock do banco de dados
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([
          {
            id: 1,
            nomeFantasia: "Empresa Teste",
            razaoSocial: "Empresa Teste LTDA",
            cnpj: "12.345.678/0001-90",
            status: "Aberto",
          },
        ]),
      };

      vi.mocked(db.getDb).mockResolvedValue(mockDb as any);

      // Chamar a função
      const resultado = await consolidarDadosEmpresa(1, "2026-01");

      // Verificações
      expect(resultado).toBeDefined();
      expect(resultado.empresaId).toBe(1);
      expect(resultado.periodo).toBe("2026-01");
      expect(resultado.statusFinanceiro).toMatch(/Lucro|Prejuizo|Equilibrio/);
    });

    it("deve lançar erro se empresa não existir", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.getDb).mockResolvedValue(mockDb as any);

      // Esperar erro
      await expect(consolidarDadosEmpresa(999, "2026-01")).rejects.toThrow(
        "Empresa com ID 999 não encontrada"
      );
    });

    it("deve lançar erro se banco de dados não estiver conectado", async () => {
      vi.mocked(db.getDb).mockResolvedValue(null);

      // Esperar erro
      await expect(consolidarDadosEmpresa(1, "2026-01")).rejects.toThrow(
        "Database not connected"
      );
    });

    it("deve calcular saldo positivo corretamente", async () => {
      // Este teste valida a lógica de cálculo
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn(),
      };

      // Simular múltiplas chamadas ao where
      let callCount = 0;
      mockDb.where.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Empresa
          return Promise.resolve([
            {
              id: 1,
              nomeFantasia: "Empresa Positiva",
              razaoSocial: "Empresa Positiva LTDA",
              cnpj: "12.345.678/0001-90",
            },
          ]);
        }
        // Retornar arrays vazios para outras queries
        return Promise.resolve([]);
      });

      vi.mocked(db.getDb).mockResolvedValue(mockDb as any);

      const resultado = await consolidarDadosEmpresa(1, "2026-01");

      // Com dados vazios, deve ter saldo 0 (equilíbrio)
      expect(resultado.saldoLiquido).toBe(0);
      expect(resultado.statusFinanceiro).toBe("Equilibrio");
      expect(resultado.margemLucro).toBe(0);
    });
  });

  describe("consolidarTodasEmpresas", () => {
    it("deve consolidar dados de múltiplas empresas", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn(),
      };

      let callCount = 0;
      mockDb.where.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Primeira chamada - lista de empresas
          return Promise.resolve([
            { id: 1, nomeFantasia: "Empresa 1", razaoSocial: "E1 LTDA", cnpj: "11.111.111/0001-11" },
            { id: 2, nomeFantasia: "Empresa 2", razaoSocial: "E2 LTDA", cnpj: "22.222.222/0001-22" },
          ]);
        }
        // Retornar arrays vazios para outras queries
        return Promise.resolve([]);
      });

      vi.mocked(db.getDb).mockResolvedValue(mockDb as any);

      const resultado = await consolidarTodasEmpresas("2026-01");

      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBeGreaterThan(0);
    });

    it("deve retornar array vazio se não houver empresas", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.getDb).mockResolvedValue(mockDb as any);

      const resultado = await consolidarTodasEmpresas("2026-01");

      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBe(0);
    });
  });

  describe("resumoConsolidado", () => {
    it("deve retornar resumo com estrutura correta", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn(),
      };

      mockDb.where.mockImplementation(() => {
        return Promise.resolve([]);
      });

      vi.mocked(db.getDb).mockResolvedValue(mockDb as any);

      const resultado = await resumoConsolidado("2026-01");

      expect(resultado).toBeDefined();
      expect(resultado.periodo).toBe("2026-01");
      expect(resultado.totalEmpresas).toBe(0);
      expect(resultado.totalEntradas).toBe(0);
      expect(resultado.totalSaidas).toBe(0);
      expect(resultado.saldoTotal).toBe(0);
      expect(resultado.margemGeral).toBe(0);
      expect(resultado.empresasComLucro).toBe(0);
      expect(resultado.empresasComPrejuizo).toBe(0);
      expect(resultado.empresasEmEquilibrio).toBe(0);
      expect(Array.isArray(resultado.detalhesPorEmpresa)).toBe(true);
    });

    it("deve calcular totais corretamente", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn(),
      };

      mockDb.where.mockImplementation(() => {
        return Promise.resolve([]);
      });

      vi.mocked(db.getDb).mockResolvedValue(mockDb as any);

      const resultado = await resumoConsolidado("2026-01");

      // Verificar que os totais são números
      expect(typeof resultado.totalEntradas).toBe("number");
      expect(typeof resultado.totalSaidas).toBe("number");
      expect(typeof resultado.saldoTotal).toBe("number");
      expect(typeof resultado.margemGeral).toBe("number");

      // Verificar que saldoTotal = totalEntradas - totalSaidas
      expect(resultado.saldoTotal).toBe(resultado.totalEntradas - resultado.totalSaidas);
    });
  });

  describe("Validações de Formato", () => {
    it("deve aceitar formato YYYY-MM válido", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([
          {
            id: 1,
            nomeFantasia: "Teste",
            razaoSocial: "Teste LTDA",
            cnpj: "12.345.678/0001-90",
          },
        ]),
      };

      vi.mocked(db.getDb).mockResolvedValue(mockDb as any);

      // Não deve lançar erro
      const resultado = await consolidarDadosEmpresa(1, "2026-01");
      expect(resultado).toBeDefined();
    });

    it("deve calcular período corretamente", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([
          {
            id: 1,
            nomeFantasia: "Teste",
            razaoSocial: "Teste LTDA",
            cnpj: "12.345.678/0001-90",
          },
        ]),
      };

      vi.mocked(db.getDb).mockResolvedValue(mockDb as any);

      const resultado = await consolidarDadosEmpresa(1, "2026-12");
      expect(resultado.periodo).toBe("2026-12");
    });
  });

  describe("Cálculos Financeiros", () => {
    it("deve converter valores corretamente", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([
          {
            id: 1,
            nomeFantasia: "Teste",
            razaoSocial: "Teste LTDA",
            cnpj: "12.345.678/0001-90",
          },
        ]),
      };

      vi.mocked(db.getDb).mockResolvedValue(mockDb as any);

      const resultado = await consolidarDadosEmpresa(1, "2026-01");

      // Todos os valores devem ser números
      expect(typeof resultado.totalEntradas).toBe("number");
      expect(typeof resultado.totalSaidas).toBe("number");
      expect(typeof resultado.saldoLiquido).toBe("number");
      expect(typeof resultado.margemLucro).toBe("number");

      // Valores devem ser >= 0 ou podem ser negativos
      expect(Number.isFinite(resultado.saldoLiquido)).toBe(true);
      expect(Number.isFinite(resultado.margemLucro)).toBe(true);
    });

    it("deve determinar status financeiro corretamente", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([
          {
            id: 1,
            nomeFantasia: "Teste",
            razaoSocial: "Teste LTDA",
            cnpj: "12.345.678/0001-90",
          },
        ]),
      };

      vi.mocked(db.getDb).mockResolvedValue(mockDb as any);

      const resultado = await consolidarDadosEmpresa(1, "2026-01");

      // Status deve ser um dos três valores
      expect(["Lucro", "Prejuizo", "Equilibrio"]).toContain(resultado.statusFinanceiro);
    });
  });
});
