import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mysql = require('mysql2/promise');

const DATABASE_URL = process.env.DATABASE_URL;

async function seedData() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    console.log('🌱 Iniciando seed de dados...');
    
    // 1. Criar KPIs para empresas existentes
    console.log('📊 Criando KPIs...');
    const kpis = [
      { empresaId: 1, mesAno: '2026-01', faturamentoBruto: '500000', impostos: '75000', custosFixos: '150000', custosVariaveis: '100000' },
      { empresaId: 1, mesAno: '2025-12', faturamentoBruto: '480000', impostos: '72000', custosFixos: '150000', custosVariaveis: '95000' },
      { empresaId: 2, mesAno: '2026-01', faturamentoBruto: '350000', impostos: '52500', custosFixos: '100000', custosVariaveis: '80000' },
      { empresaId: 3, mesAno: '2026-01', faturamentoBruto: '280000', impostos: '42000', custosFixos: '80000', custosVariaveis: '60000' },
    ];
    
    for (const kpi of kpis) {
      await connection.execute(
        `INSERT INTO indicadores_kpi (empresaId, mesAno, faturamentoBruto, impostos, custosFixos, custosVariaveis, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [kpi.empresaId, kpi.mesAno, kpi.faturamentoBruto, kpi.impostos, kpi.custosFixos, kpi.custosVariaveis]
      );
    }
    console.log(`✅ ${kpis.length} KPIs criados`);
    
    // 2. Criar Contas a Pagar/Receber
    console.log('💰 Criando Contas...');
    const contas = [
      { tipo: 'Pagar', empresaId: 1, descricao: 'Aluguel escritório', categoria: 'Infraestrutura', valor: '15000', vencimento: '2026-02-05', status: 'Pendente', prioridade: 'Alta' },
      { tipo: 'Pagar', empresaId: 1, descricao: 'Fornecedor TI', categoria: 'Tecnologia', valor: '8500', vencimento: '2026-01-25', status: 'Pendente', prioridade: 'Media' },
      { tipo: 'Receber', empresaId: 1, descricao: 'Cliente XYZ', categoria: 'Serviços', valor: '50000', vencimento: '2026-01-30', status: 'Pendente', prioridade: 'Alta' },
      { tipo: 'Pagar', empresaId: 2, descricao: 'Folha de pagamento', categoria: 'Pessoal', valor: '120000', vencimento: '2026-02-01', status: 'Pendente', prioridade: 'Alta' },
      { tipo: 'Receber', empresaId: 2, descricao: 'Projeto ABC', categoria: 'Projetos', valor: '75000', vencimento: '2026-01-20', status: 'Pago', prioridade: 'Media' },
    ];
    
    for (const conta of contas) {
      await connection.execute(
        `INSERT INTO contas (tipo, empresaId, descricao, categoria, valor, vencimento, status, prioridade, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [conta.tipo, conta.empresaId, conta.descricao, conta.categoria, conta.valor, conta.vencimento, conta.status, conta.prioridade]
      );
    }
    console.log(`✅ ${contas.length} Contas criadas`);
    
    // 3. Criar Funcionários
    console.log('👥 Criando Funcionários...');
    const funcionarios = [
      { nome: 'João Silva', cpf: '12345678901', cargo: 'Desenvolvedor Senior', tipoContrato: 'CLT', salarioBase: '12000', beneficios: '2500', status: 'Contratado' },
      { nome: 'Maria Santos', cpf: '98765432109', cargo: 'Gerente de Projetos', tipoContrato: 'CLT', salarioBase: '15000', beneficios: '3000', status: 'Contratado' },
      { nome: 'Pedro Oliveira', cpf: '45678912301', cargo: 'Designer UX', tipoContrato: 'PJ', salarioBase: '8000', beneficios: '0', status: 'Contratado' },
      { nome: 'Ana Costa', cpf: '78912345602', cargo: 'Analista Financeiro', tipoContrato: 'CLT', salarioBase: '9000', beneficios: '1800', status: 'Contratado' },
      { nome: 'Carlos Ferreira', cpf: '32165498703', cargo: 'Estagiário', tipoContrato: 'Estagiario', salarioBase: '2000', beneficios: '400', status: 'Contratado' },
    ];
    
    for (const func of funcionarios) {
      await connection.execute(
        `INSERT INTO funcionarios (nome, cpf, cargo, tipoContrato, salarioBase, beneficios, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [func.nome, func.cpf, func.cargo, func.tipoContrato, func.salarioBase, func.beneficios, func.status]
      );
    }
    console.log(`✅ ${funcionarios.length} Funcionários criados`);
    
    // 4. Criar Fluxo de Caixa (sem campo saldo)
    console.log('💵 Criando Fluxo de Caixa...');
    const fluxoCaixa = [
      { data: '2026-01-05', tipo: 'Entrada', descricao: 'Recebimento Cliente A', categoria: 'Vendas', valor: '50000' },
      { data: '2026-01-10', tipo: 'Saida', descricao: 'Pagamento Fornecedores', categoria: 'Operacional', valor: '15000' },
      { data: '2026-01-15', tipo: 'Entrada', descricao: 'Recebimento Cliente B', categoria: 'Vendas', valor: '30000' },
      { data: '2026-01-20', tipo: 'Saida', descricao: 'Folha de Pagamento', categoria: 'Pessoal', valor: '45000' },
    ];
    
    for (const fluxo of fluxoCaixa) {
      await connection.execute(
        `INSERT INTO fluxo_caixa (data, tipo, descricao, categoria, valor, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [fluxo.data, fluxo.tipo, fluxo.descricao, fluxo.categoria, fluxo.valor]
      );
    }
    console.log(`✅ ${fluxoCaixa.length} registros de Fluxo de Caixa criados`);
    
    // 5. Criar Impostos
    console.log('📋 Criando Impostos...');
    const impostos = [
      { empresaId: 1, tipoImposto: 'ICMS', baseCalculo: '500000', aliquota: '0.18', valor: '90000', vencimento: '2026-02-10', status: 'Pendente' },
      { empresaId: 1, tipoImposto: 'PIS', baseCalculo: '500000', aliquota: '0.0165', valor: '8250', vencimento: '2026-02-15', status: 'Pendente' },
      { empresaId: 1, tipoImposto: 'COFINS', baseCalculo: '500000', aliquota: '0.076', valor: '38000', vencimento: '2026-02-15', status: 'Pendente' },
      { empresaId: 2, tipoImposto: 'ICMS', baseCalculo: '350000', aliquota: '0.18', valor: '63000', vencimento: '2026-02-10', status: 'Pendente' },
    ];
    
    for (const imposto of impostos) {
      await connection.execute(
        `INSERT INTO impostos (empresaId, tipoImposto, baseCalculo, aliquota, valor, vencimento, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [imposto.empresaId, imposto.tipoImposto, imposto.baseCalculo, imposto.aliquota, imposto.valor, imposto.vencimento, imposto.status]
      );
    }
    console.log(`✅ ${impostos.length} Impostos criados`);
    
    // 6. Criar Alertas
    console.log('🔔 Criando Alertas...');
    const alertas = [
      { tipo: 'Vencimento', mensagem: 'Conta "Aluguel escritório" vence em 7 dias', prioridade: 'Alta', lido: false },
      { tipo: 'Vencimento', mensagem: 'Conta "Fornecedor TI" vence em 3 dias', prioridade: 'Media', lido: false },
      { tipo: 'Margem', mensagem: 'Margem de lucro abaixo de 20% em Janeiro/2026', prioridade: 'Alta', lido: false },
      { tipo: 'Saldo', mensagem: 'Saldo em caixa abaixo de R$ 30.000', prioridade: 'Media', lido: true },
    ];
    
    for (const alerta of alertas) {
      await connection.execute(
        `INSERT INTO alertas (tipo, mensagem, prioridade, lido, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [alerta.tipo, alerta.mensagem, alerta.prioridade, alerta.lido]
      );
    }
    console.log(`✅ ${alertas.length} Alertas criados`);
    
    console.log('\n🎉 Seed completo! Todos os dados de exemplo foram criados com sucesso.');
    
  } catch (error) {
    console.error('❌ Erro ao criar dados:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedData().catch(console.error);
