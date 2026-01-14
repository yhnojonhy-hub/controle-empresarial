import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mysql = require('mysql2/promise');

const DATABASE_URL = process.env.DATABASE_URL;

async function checkSchema() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    const [rows] = await connection.execute('DESCRIBE indicadores_kpi');
    console.log('Estrutura da tabela indicadores_kpi:');
    console.table(rows);
  } finally {
    await connection.end();
  }
}

checkSchema().catch(console.error);
