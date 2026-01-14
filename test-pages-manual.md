# Testes Práticos Manuais - Fluxo de Caixa, Impostos e Alertas

## ✅ Página: Fluxo de Caixa (/fluxo-caixa)

### Teste 1: Adicionar Entrada
1. Acessar /fluxo-caixa
2. Clicar em "Nova Movimentação"
3. Preencher:
   - Data: 2026-01-15
   - Tipo: Entrada
   - Descrição: Recebimento Cliente A
   - Categoria: Vendas
   - Valor: 15000
4. Clicar em "Salvar"
5. ✅ Verificar se aparece na listagem

### Teste 2: Adicionar Saída
1. Clicar em "Nova Movimentação"
2. Preencher:
   - Data: 2026-01-16
   - Tipo: Saída
   - Descrição: Pagamento Fornecedor
   - Categoria: Compras
   - Valor: 8000
3. Clicar em "Salvar"
4. ✅ Verificar se aparece na listagem

### Teste 3: Remover Registro
1. Localizar registro criado
2. Clicar no botão de deletar (ícone lixeira)
3. Confirmar exclusão
4. ✅ Verificar se foi removido da listagem

---

## ✅ Página: Impostos (/impostos)

### Teste 1: Adicionar ICMS
1. Acessar /impostos
2. Clicar em "Novo Imposto"
3. Preencher:
   - Empresa: Ipe Bank
   - Mês/Ano: 2026-01
   - Tipo: ICMS
   - Base de Cálculo: 100000
   - Alíquota: 18
   - Vencimento: 2026-02-10
4. Clicar em "Salvar"
5. ✅ Verificar cálculo automático: Valor = 100000 * 0.18 = 18000

### Teste 2: Adicionar PIS
1. Clicar em "Novo Imposto"
2. Preencher:
   - Empresa: Index Core
   - Mês/Ano: 2026-01
   - Tipo: PIS
   - Base de Cálculo: 50000
   - Alíquota: 1.65
   - Vencimento: 2026-02-15
3. Clicar em "Salvar"
4. ✅ Verificar cálculo: Valor = 50000 * 0.0165 = 825

### Teste 3: Remover Registro
1. Localizar imposto criado
2. Clicar no botão de deletar
3. Confirmar exclusão
4. ✅ Verificar se foi removido

---

## ✅ Página: Alertas (/alertas)

### Teste 1: Visualizar Alertas
1. Acessar /alertas
2. ✅ Verificar se lista todos os alertas
3. ✅ Verificar badges de severidade (Crítico/Aviso/Info)
4. ✅ Verificar status (Lido/Não Lido)

### Teste 2: Marcar como Lido
1. Localizar alerta não lido
2. Clicar em "Marcar como Lido"
3. ✅ Verificar mudança de status
4. ✅ Verificar atualização visual (badge/cor)

### Teste 3: Filtrar por Tipo
1. Se houver filtro, selecionar tipo específico
2. ✅ Verificar se mostra apenas alertas do tipo selecionado

---

## Resultado Esperado

Todas as operações devem:
- ✅ Salvar dados no banco
- ✅ Atualizar listagem automaticamente
- ✅ Mostrar toast de sucesso/erro
- ✅ Validar campos obrigatórios
- ✅ Calcular valores automaticamente (quando aplicável)
- ✅ Confirmar antes de deletar
- ✅ Remover da listagem após delete

