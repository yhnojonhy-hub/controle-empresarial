/**
 * Testes para CNPJService (TDD)
 * 
 * Testa princípios SOLID:
 * - SRP: Service tem única responsabilidade
 * - OCP: Pode adicionar novos providers
 * - DIP: Aceita providers injetados
 */

import { describe, expect, it, vi } from "vitest";
import { CNPJService, type CNPJProvider } from "./cnpj.service";

describe("CNPJService", () => {
  describe("consultar", () => {
    it("deve consultar CNPJ com sucesso usando primeiro provider", async () => {
      const mockProvider: CNPJProvider = {
        name: "MockProvider",
        consultar: vi.fn().mockResolvedValue({
          cnpj: "12.345.678/0001-90",
          razaoSocial: "Empresa Teste",
          nomeFantasia: "Teste LTDA",
          status: "Aberto",
        }),
      };

      const service = new CNPJService([mockProvider]);
      const result = await service.consultar("12.345.678/0001-90");

      expect(result).toBeDefined();
      expect(result.cnpj).toBe("12.345.678/0001-90");
      expect(result.razaoSocial).toBe("Empresa Teste");
      expect(mockProvider.consultar).toHaveBeenCalledWith("12345678000190");
    });

    it("deve tentar próximo provider se primeiro falhar (DRY com loop)", async () => {
      const failProvider: CNPJProvider = {
        name: "FailProvider",
        consultar: vi.fn().mockRejectedValue(new Error("Provider falhou")),
      };

      const successProvider: CNPJProvider = {
        name: "SuccessProvider",
        consultar: vi.fn().mockResolvedValue({
          cnpj: "12.345.678/0001-90",
          razaoSocial: "Empresa Teste",
        }),
      };

      const service = new CNPJService([failProvider, successProvider]);
      const result = await service.consultar("12.345.678/0001-90");

      expect(result).toBeDefined();
      expect(failProvider.consultar).toHaveBeenCalled();
      expect(successProvider.consultar).toHaveBeenCalled();
    });

    it("deve lançar erro se todos providers falharem", async () => {
      const failProvider1: CNPJProvider = {
        name: "FailProvider1",
        consultar: vi.fn().mockRejectedValue(new Error("Falha 1")),
      };

      const failProvider2: CNPJProvider = {
        name: "FailProvider2",
        consultar: vi.fn().mockRejectedValue(new Error("Falha 2")),
      };

      const service = new CNPJService([failProvider1, failProvider2]);

      await expect(service.consultar("12.345.678/0001-90")).rejects.toThrow(
        "Não foi possível consultar o CNPJ em nenhum provider"
      );
    });

    it("deve limpar CNPJ removendo caracteres especiais", async () => {
      const mockProvider: CNPJProvider = {
        name: "MockProvider",
        consultar: vi.fn().mockResolvedValue({
          cnpj: "12345678000190",
        }),
      };

      const service = new CNPJService([mockProvider]);
      await service.consultar("12.345.678/0001-90");

      expect(mockProvider.consultar).toHaveBeenCalledWith("12345678000190");
    });
  });

  describe("addProvider (OCP: Aberto para extensão)", () => {
    it("deve permitir adicionar novo provider dinamicamente", async () => {
      const service = new CNPJService([]);

      const newProvider: CNPJProvider = {
        name: "NewProvider",
        consultar: vi.fn().mockResolvedValue({
          cnpj: "12345678000190",
        }),
      };

      service.addProvider(newProvider);
      const result = await service.consultar("12.345.678/0001-90");

      expect(result).toBeDefined();
      expect(newProvider.consultar).toHaveBeenCalled();
    });
  });
});
