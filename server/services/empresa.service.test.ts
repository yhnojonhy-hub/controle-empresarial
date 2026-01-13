/**
 * Testes para EmpresaService (TDD)
 * 
 * Testa princípios SOLID:
 * - SRP: Lógica de negócio isolada
 * - DIP: Usa mocks de dependências
 * - LSP: Estende BaseService corretamente
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { EmpresaService } from "./empresa.service";
import type { EmpresaRepository } from "../repositories/empresa.repository";
import type { CNPJService } from "./cnpj.service";
import type { Empresa } from "../../drizzle/schema";

describe("EmpresaService", () => {
  let mockRepository: EmpresaRepository;
  let mockCNPJService: CNPJService;
  let service: EmpresaService;

  beforeEach(() => {
    // Mock do repository
    mockRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByCNPJ: vi.fn(),
      findByStatus: vi.fn(),
    } as any;

    // Mock do CNPJ service
    mockCNPJService = {
      consultar: vi.fn(),
      addProvider: vi.fn(),
    } as any;

    service = new EmpresaService(mockRepository, mockCNPJService);
  });

  describe("getAll", () => {
    it("deve retornar todas as empresas", async () => {
      const mockEmpresas: Empresa[] = [
        {
          id: 1,
          cnpj: "12.345.678/0001-90",
          razaoSocial: "Empresa 1",
          nomeFantasia: "E1",
          status: "Aberto",
        } as Empresa,
      ];

      vi.mocked(mockRepository.findAll).mockResolvedValue(mockEmpresas);

      const result = await service.getAll();

      expect(result).toEqual(mockEmpresas);
      expect(mockRepository.findAll).toHaveBeenCalledOnce();
    });
  });

  describe("create", () => {
    it("deve criar empresa com CNPJ válido", async () => {
      const mockEmpresa: Empresa = {
        id: 1,
        cnpj: "12.345.678/0001-90",
        razaoSocial: "Empresa Teste",
      } as Empresa;

      vi.mocked(mockRepository.create).mockResolvedValue(mockEmpresa);

      const result = await service.create({
        cnpj: "12.345.678/0001-90",
        razaoSocial: "Empresa Teste",
      });

      expect(result).toEqual(mockEmpresa);
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it("deve lançar erro se CNPJ não for fornecido (validação)", async () => {
      await expect(service.create({ razaoSocial: "Teste" })).rejects.toThrow(
        "CNPJ é obrigatório"
      );
    });

    it("deve lançar erro se CNPJ for inválido", async () => {
      await expect(
        service.create({ cnpj: "123", razaoSocial: "Teste" })
      ).rejects.toThrow("CNPJ inválido");
    });
  });

  describe("consultarCNPJ", () => {
    it("deve consultar CNPJ usando CNPJService (DIP)", async () => {
      const mockData = {
        cnpj: "12.345.678/0001-90",
        razaoSocial: "Empresa Teste",
      };

      vi.mocked(mockCNPJService.consultar).mockResolvedValue(mockData);

      const result = await service.consultarCNPJ("12.345.678/0001-90");

      expect(result).toEqual(mockData);
      expect(mockCNPJService.consultar).toHaveBeenCalledWith("12.345.678/0001-90");
    });
  });

  describe("getByCNPJ", () => {
    it("deve buscar empresa por CNPJ", async () => {
      const mockEmpresa: Empresa = {
        id: 1,
        cnpj: "12.345.678/0001-90",
      } as Empresa;

      vi.mocked(mockRepository.findByCNPJ).mockResolvedValue(mockEmpresa);

      const result = await service.getByCNPJ("12.345.678/0001-90");

      expect(result).toEqual(mockEmpresa);
      expect(mockRepository.findByCNPJ).toHaveBeenCalledWith("12.345.678/0001-90");
    });
  });

  describe("getActive", () => {
    it("deve retornar apenas empresas ativas", async () => {
      const mockEmpresas: Empresa[] = [
        { id: 1, status: "Aberto" } as Empresa,
        { id: 2, status: "Aberto" } as Empresa,
      ];

      vi.mocked(mockRepository.findByStatus).mockResolvedValue(mockEmpresas);

      const result = await service.getActive();

      expect(result).toEqual(mockEmpresas);
      expect(mockRepository.findByStatus).toHaveBeenCalledWith("Aberto");
    });
  });
});
