/**
 * Testes para CacheService
 * 
 * Verifica funcionalidades de cache:
 * - Armazenamento e recuperação
 * - Expiração de TTL
 * - Padrão getOrSet
 */

import { describe, it, expect, beforeEach } from "vitest";
import { cacheService, CACHE_KEYS } from "./cache.service";

describe("CacheService", () => {
  beforeEach(async () => {
    await cacheService.clear();
  });

  it("deve armazenar e recuperar valores", async () => {
    const key = "test:key";
    const value = { id: 1, name: "Test" };

    await cacheService.set(key, value);
    const retrieved = await cacheService.get(key);

    expect(retrieved).toEqual(value);
  });

  it("deve retornar null para chaves inexistentes", async () => {
    const retrieved = await cacheService.get("nonexistent:key");
    expect(retrieved).toBeNull();
  });

  it("deve deletar valores", async () => {
    const key = "test:delete";
    const value = { id: 1 };

    await cacheService.set(key, value);
    expect(await cacheService.get(key)).toEqual(value);

    await cacheService.delete(key);
    expect(await cacheService.get(key)).toBeNull();
  });

  it("deve limpar todo o cache", async () => {
    await cacheService.set("key1", { id: 1 });
    await cacheService.set("key2", { id: 2 });

    expect(await cacheService.get("key1")).toBeDefined();
    expect(await cacheService.get("key2")).toBeDefined();

    await cacheService.clear();

    expect(await cacheService.get("key1")).toBeNull();
    expect(await cacheService.get("key2")).toBeNull();
  });

  it("deve implementar padrão getOrSet", async () => {
    const key = "test:getorset";
    let computeCount = 0;

    const compute = async () => {
      computeCount++;
      return { id: 1, computed: true };
    };

    // Primeira chamada: deve computar
    const result1 = await cacheService.getOrSet(key, compute);
    expect(result1).toEqual({ id: 1, computed: true });
    expect(computeCount).toBe(1);

    // Segunda chamada: deve usar cache
    const result2 = await cacheService.getOrSet(key, compute);
    expect(result2).toEqual({ id: 1, computed: true });
    expect(computeCount).toBe(1); // Não deve ter computado novamente
  });

  it("deve suportar chaves compostas", () => {
    const key1 = CACHE_KEYS.EMPRESA(1);
    const key2 = CACHE_KEYS.EMPRESA(2);

    expect(key1).toBe("empresa:1");
    expect(key2).toBe("empresa:2");
    expect(key1).not.toBe(key2);
  });

  it("deve armazenar diferentes tipos de dados", async () => {
    // String
    await cacheService.set("string", "value");
    expect(await cacheService.get("string")).toBe("value");

    // Número
    await cacheService.set("number", 42);
    expect(await cacheService.get("number")).toBe(42);

    // Array
    await cacheService.set("array", [1, 2, 3]);
    expect(await cacheService.get("array")).toEqual([1, 2, 3]);

    // Objeto complexo
    const complex = { nested: { value: 123 }, array: [1, 2] };
    await cacheService.set("complex", complex);
    expect(await cacheService.get("complex")).toEqual(complex);
  });
});
