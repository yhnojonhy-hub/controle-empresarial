import { drizzle } from "drizzle-orm/mysql2";
import ExcelJS from "exceljs";
import { empresas, indicadoresKpi, contas, funcionarios } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

async function importarDados() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile("/home/ubuntu/upload/Controle_Empresarial_Nivel_CEO.xlsx");

  // Importar Empresas
  const wsEmpresas = workbook.getWorksheet("Empresas");
  if (wsEmpresas) {
    const rows = [];
    wsEmpresas.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      const data = {
        razaoSocial: row.getCell(2).value?.toString(),
        nomeFantasia: row.getCell(3).value?.toString(),
        cnpj: row.getCell(4).value?.toString(),
        capitalSocial: row.getCell(5).value?.toString(),
        cnae: row.getCell(6).value?.toString(),
        regimeTributario: row.getCell(7).value?.toString(),
        enderecoCompleto: row.getCell(8).value?.toString(),
        cidade: row.getCell(9).value?.toString(),
        estado: row.getCell(10).value?.toString(),
        responsavelLegal: row.getCell(11).value?.toString(),
        telefone: row.getCell(12).value?.toString(),
        email: row.getCell(13).value?.toString(),
        dataAbertura: row.getCell(14).value?.toString(),
        status: row.getCell(15).value?.toString() || "Aberto",
      };
      if (data.cnpj) rows.push(data);
    });
    
    if (rows.length > 0) {
      await db.insert(empresas).values(rows);
      console.log(`✓ ${rows.length} empresas importadas`);
    }
  }

  // Importar Funcionários
  const wsFuncionarios = workbook.getWorksheet("Funcionários");
  if (wsFuncionarios) {
    const rows = [];
    wsFuncionarios.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const data = {
        nome: row.getCell(2).value?.toString(),
        cpf: row.getCell(3).value?.toString(),
        cargo: row.getCell(5).value?.toString(),
        tipoContrato: row.getCell(6).value?.toString() || "PJ",
        salarioBase: row.getCell(7).value?.toString() || "0",
        beneficios: row.getCell(8).value?.toString() || "0",
        status: row.getCell(12).value?.toString() || "Contratado",
      };
      if (data.cpf && data.nome) rows.push(data);
    });
    
    if (rows.length > 0) {
      await db.insert(funcionarios).values(rows);
      console.log(`✓ ${rows.length} funcionários importados`);
    }
  }

  // Importar Contas
  const wsContas = workbook.getWorksheet("Contas a Pagar e Receber");
  if (wsContas) {
    const rows = [];
    wsContas.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const data = {
        tipo: row.getCell(1).value?.toString() === "pagar" ? "Pagar" : "Receber",
        descricao: row.getCell(3).value?.toString() || row.getCell(1).value?.toString(),
        categoria: row.getCell(4).value?.toString(),
        valor: row.getCell(5).value?.toString() || "0",
        vencimento: new Date().toISOString().split("T")[0],
        status: "Pendente",
        prioridade: row.getCell(8).value?.toString() === "alta" ? "Alta" : "Media",
      };
      if (data.descricao) rows.push(data);
    });
    
    if (rows.length > 0) {
      await db.insert(contas).values(rows);
      console.log(`✓ ${rows.length} contas importadas`);
    }
  }

  console.log("✅ Importação concluída!");
}

importarDados().catch(console.error);
