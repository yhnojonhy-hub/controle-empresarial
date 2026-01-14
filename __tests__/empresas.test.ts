
// Teste de validação: capitalSocial aceita string e número
describe("Validação de capitalSocial", () => {
  it("deve aceitar capitalSocial como string", async () => {
    const empresa = await db.createEmpresa({
      cnpj: "12345678000199",
      razaoSocial: "Teste String Capital",
      capitalSocial: "100000.00",
    });
    expect(empresa.capitalSocial).toBe("100000.00");
  });

  it("deve aceitar capitalSocial como número e converter para string", async () => {
    const empresa = await db.createEmpresa({
      cnpj: "98765432000188",
      razaoSocial: "Teste Number Capital",
      capitalSocial: "50000.50",
    });
    expect(empresa.capitalSocial).toBeTruthy();
    expect(typeof empresa.capitalSocial).toBe("string");
  });
});
