/**
 * Testes para date-converter helper (TDD)
 */

import { describe, expect, it } from "vitest";
import {
  parseDate,
  convertDateFields,
  formatDateBR,
  formatDateISO,
} from "./date-converter";

describe("date-converter", () => {
  describe("parseDate", () => {
    it("deve converter string ISO para Date", () => {
      const result = parseDate("2024-01-15");
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(0); // Janeiro = 0
      // Aceitar variação de timezone (14 ou 15)
      expect([14, 15]).toContain(result?.getDate());
    });

    it("deve converter formato brasileiro DD/MM/YYYY para Date", () => {
      const result = parseDate("15/01/2024");
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(0);
      expect(result?.getDate()).toBe(15);
    });

    it("deve retornar null para string vazia", () => {
      expect(parseDate("")).toBeNull();
      expect(parseDate(null)).toBeNull();
      expect(parseDate(undefined)).toBeNull();
    });

    it("deve retornar null para string inválida", () => {
      expect(parseDate("invalid-date")).toBeNull();
    });
  });

  describe("convertDateFields", () => {
    it("deve converter múltiplos campos de data", () => {
      const input = {
        nome: "Teste",
        dataAbertura: "2024-01-15",
        dataFechamento: "2024-12-31",
      };

      const result = convertDateFields(input, ["dataAbertura", "dataFechamento"]);

      expect(result.nome).toBe("Teste");
      expect(result.dataAbertura).toBeInstanceOf(Date);
      expect(result.dataFechamento).toBeInstanceOf(Date);
    });

    it("deve manter campos não-data inalterados", () => {
      const input = {
        nome: "Teste",
        idade: 25,
        dataAbertura: "2024-01-15",
      };

      const result = convertDateFields(input, ["dataAbertura"]);

      expect(result.nome).toBe("Teste");
      expect(result.idade).toBe(25);
    });
  });

  describe("formatDateBR", () => {
    it("deve formatar Date para formato brasileiro", () => {
      const date = new Date(2024, 0, 15); // 15 de janeiro de 2024
      const result = formatDateBR(date);
      expect(result).toBe("15/01/2024");
    });

    it("deve formatar string ISO para formato brasileiro", () => {
      const result = formatDateBR("2024-01-15");
      // Aceitar variação de timezone
      expect(result).toMatch(/1[45]\/01\/2024/);
    });

    it("deve retornar '-' para valores nulos", () => {
      expect(formatDateBR(null)).toBe("-");
      expect(formatDateBR(undefined)).toBe("-");
    });
  });

  describe("formatDateISO", () => {
    it("deve formatar Date para string ISO", () => {
      const date = new Date(2024, 0, 15);
      const result = formatDateISO(date);
      // Aceitar variação de timezone
      expect(result).toMatch(/2024-01-1[45]/);
    });

    it("deve retornar null para valores nulos", () => {
      expect(formatDateISO(null)).toBeNull();
      expect(formatDateISO(undefined)).toBeNull();
    });
  });
});
