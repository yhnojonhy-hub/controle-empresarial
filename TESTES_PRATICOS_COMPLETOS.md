# Testes Práticos Completos - Sistema de Controle Empresarial

## Data: 2026-01-14
## Testador: Sistema Automatizado

---

## 1. BARRA DE ALERTAS

### Teste 1.1: Visualização de Alertas
- [ ] Verificar se barra de alertas aparece no topo
- [ ] Verificar contador de alertas não lidos
- [ ] Verificar cores de severidade (info, warning, error)
- [ ] Verificar ícones apropriados

### Teste 1.2: Marcar como Lido
- [ ] Clicar em "Marcar como Lido"
- [ ] Verificar se contador diminui
- [ ] Verificar se alerta desaparece da lista de não lidos
- [ ] Verificar toast de confirmação

---

## 2. FORMULÁRIO EMPRESAS

### Teste 2.1: Campos Obrigatórios
- [ ] CNPJ (obrigatório, validação de formato)
- [ ] Razão Social
- [ ] Nome Fantasia
- [ ] Tentar submeter sem CNPJ → deve dar erro

### Teste 2.2: Busca Automática por CNPJ
- [ ] Digitar CNPJ válido: 00.000.000/0001-91
- [ ] Verificar se busca API automaticamente
- [ ] Verificar se preenche Razão Social
- [ ] Verificar se preenche Nome Fantasia

### Teste 2.3: Campos Opcionais
- [ ] Email
- [ ] Telefone
- [ ] Endereço completo
- [ ] Capital Social
- [ ] CNAE
- [ ] Regime Tributário

### Teste 2.4: CRUD Completo
- [ ] Criar nova empresa
- [ ] Visualizar na listagem
- [ ] Deletar empresa
- [ ] Confirmar exclusão

---

## 3. FORMULÁRIO KPI

### Teste 3.1: Campos Obrigatórios
- [ ] Empresa (dropdown)
- [ ] Faturamento Bruto
- [ ] Tentar submeter sem empresa → deve dar erro

### Teste 3.2: Cálculos Automáticos
- [ ] Inserir Faturamento Bruto: 100000
- [ ] Inserir Impostos: 10000
- [ ] Inserir Custos Fixos: 20000
- [ ] Inserir Custos Variáveis: 15000
- [ ] Verificar Faturamento Líquido = 90000
- [ ] Verificar Lucro/Prejuízo = 55000
- [ ] Verificar Margem (%) = 55%

### Teste 3.3: Período
- [ ] Verificar valor padrão (mês atual)
- [ ] Alterar período manualmente
- [ ] Submeter e verificar salvamento

### Teste 3.4: CRUD Completo
- [ ] Criar novo KPI
- [ ] Visualizar na listagem
- [ ] Verificar cálculos na tabela
- [ ] Deletar KPI

---

## 4. FORMULÁRIO CONTAS

### Teste 4.1: Campos Obrigatórios
- [ ] Tipo (Pagar/Receber)
- [ ] Descrição
- [ ] Categoria
- [ ] Valor
- [ ] Tentar submeter sem tipo → deve dar erro

### Teste 4.2: Validação de Vencimento
- [ ] Verificar valor padrão (data atual)
- [ ] Alterar vencimento
- [ ] Verificar formato de data

### Teste 4.3: Status e Prioridade
- [ ] Verificar status padrão: Pendente
- [ ] Verificar prioridade padrão: Media
- [ ] Alterar status para Pago
- [ ] Alterar prioridade para Alta

### Teste 4.4: CRUD Completo
- [ ] Criar conta a pagar
- [ ] Criar conta a receber
- [ ] Visualizar na listagem
- [ ] Deletar conta

---

## 5. FORMULÁRIO FUNCIONÁRIOS

### Teste 5.1: Campos Obrigatórios
- [ ] Empresa (dropdown)
- [ ] Nome
- [ ] CPF
- [ ] Cargo
- [ ] Salário Base
- [ ] Tentar submeter sem nome → deve dar erro

### Teste 5.2: Cálculo de Custo Total
- [ ] Inserir Salário Base: 5000
- [ ] Inserir Benefícios: 1500
- [ ] Verificar Custo Total = 6500

### Teste 5.3: Dados Pessoais
- [ ] Email
- [ ] Telefone
- [ ] Data de Admissão
- [ ] Status (Ativo/Inativo)

### Teste 5.4: CRUD Completo
- [ ] Criar novo funcionário
- [ ] Visualizar na listagem
- [ ] Verificar custo total na tabela
- [ ] Deletar funcionário

---

## 6. FORMULÁRIO FLUXO DE CAIXA

### Teste 6.1: Campos Obrigatórios
- [ ] Tipo (Entrada/Saída)
- [ ] Descrição
- [ ] Categoria
- [ ] Valor
- [ ] Data
- [ ] Tentar submeter sem tipo → deve dar erro

### Teste 6.2: Cálculo de Saldo
- [ ] Criar entrada de R$ 10000
- [ ] Criar saída de R$ 3000
- [ ] Verificar saldo acumulado = 7000

### Teste 6.3: Cards de Resumo
- [ ] Verificar card "Total Entradas"
- [ ] Verificar card "Total Saídas"
- [ ] Verificar card "Saldo Atual"

### Teste 6.4: CRUD Completo
- [ ] Criar entrada
- [ ] Criar saída
- [ ] Visualizar na listagem
- [ ] Deletar registro

---

## 7. FORMULÁRIO IMPOSTOS

### Teste 7.1: Campos Obrigatórios
- [ ] Empresa (dropdown)
- [ ] Tipo de Imposto
- [ ] Base de Cálculo
- [ ] Alíquota (%)
- [ ] Tentar submeter sem empresa → deve dar erro

### Teste 7.2: Cálculo Automático de Valor
- [ ] Inserir Base de Cálculo: 50000
- [ ] Inserir Alíquota: 15
- [ ] Verificar Valor = 7500 (50000 × 0.15)

### Teste 7.3: Período e Vencimento
- [ ] Verificar mês/ano padrão
- [ ] Inserir data de vencimento
- [ ] Verificar status padrão: Pendente

### Teste 7.4: CRUD Completo
- [ ] Criar novo imposto
- [ ] Visualizar na listagem
- [ ] Verificar valor calculado
- [ ] Deletar imposto

---

## 8. PÁGINA ALERTAS

### Teste 8.1: Listagem de Alertas
- [ ] Verificar todos os alertas cadastrados
- [ ] Verificar badges de severidade
- [ ] Verificar descrições
- [ ] Verificar datas

### Teste 8.2: Filtro de Não Lidos
- [ ] Verificar contador de não lidos
- [ ] Verificar destaque visual
- [ ] Marcar como lido
- [ ] Verificar atualização do contador

---

## 9. DASHBOARD CEO

### Teste 9.1: Indicadores
- [ ] Faturamento do Mês (valor correto)
- [ ] Total de Despesas (valor correto)
- [ ] Lucro/Prejuízo (cálculo correto)
- [ ] Saldo em Caixa (valor correto)
- [ ] Funcionários Ativos (contagem correta)

### Teste 9.2: Gráficos
- [ ] Gráfico de Evolução de Faturamento (dados corretos)
- [ ] Gráfico de Despesas por Categoria (distribuição correta)
- [ ] Tooltips funcionando
- [ ] Responsividade

---

## RESUMO DE BUGS ENCONTRADOS

(A ser preenchido durante os testes)

1. 
2. 
3. 

---

## RESULTADO FINAL

- Total de Testes: 0/100
- Testes Passados: 0
- Testes Falhados: 0
- Taxa de Sucesso: 0%

