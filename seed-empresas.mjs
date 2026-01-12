import mysql from "mysql2/promise";
import fs from "fs";

const empresasData = JSON.parse(fs.readFileSync("/tmp/empresas_import.json", "utf-8"));

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log(`Importando ${empresasData.length} empresas...`);

for (const empresa of empresasData) {
  try {
    await connection.execute(
      `INSERT INTO empresas (razaoSocial, nomeFantasia, cnpj, capitalSocial, cnae, regimeTributario, enderecoCompleto, cidade, estado, responsavelLegal, telefone, email, dataAbertura, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        empresa.razaoSocial,
        empresa.nomeFantasia,
        empresa.cnpj,
        empresa.capitalSocial,
        empresa.cnae,
        empresa.regimeTributario,
        empresa.enderecoCompleto,
        empresa.cidade,
        empresa.estado,
        empresa.responsavelLegal,
        empresa.telefone,
        empresa.email,
        empresa.dataAbertura,
        empresa.status || 'Aberto'
      ]
    );
    console.log(`✓ ${empresa.nomeFantasia || empresa.razaoSocial}`);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log(`⊘ ${empresa.nomeFantasia || empresa.razaoSocial} (já existe)`);
    } else {
      console.error(`✗ Erro ao importar ${empresa.nomeFantasia}:`, error.message);
    }
  }
}

await connection.end();
console.log("\n✅ Importação concluída!");
