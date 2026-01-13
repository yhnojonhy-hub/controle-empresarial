# Controle Empresarial - TODO

## Estrutura de Dados e Banco
- [x] Criar tabela de empresas com campos completos
- [x] Criar tabela de indicadores KPI
- [x] Criar tabela de contas a pagar/receber
- [x] Criar tabela de funcionários
- [x] Criar tabela de fluxo de caixa
- [x] Criar tabela de impostos
- [x] Criar tabela de documentos/anexos
- [x] Migrar dados da planilha Excel para o banco

## Integração com APIs Externas
- [x] Integrar API de consulta CNPJ (BrasilAPI ou ReceitaWS)
- [x] Implementar busca automática de dados por CNPJ
- [x] Configurar storage S3 para upload de documentos

## Formulários e Cadastros
- [x] Formulário de cadastro de empresas com busca CNPJ
- [ ] Formulário de indicadores KPI com cálculos automáticos
- [ ] Formulário de contas a pagar/receber
- [ ] Formulário de funcionários com cálculo de custo total
- [ ] Formulário de fluxo de caixa
- [ ] Formulário de impostos com cálculo automático
- [ ] Sistema de upload de documentos vinculados

## Dashboard CEO
- [x] Criar layout do dashboard executivo
- [x] Indicador de faturamento do mês em tempo real
- [x] Indicador de total de despesas
- [x] Indicador de lucro/prejuízo consolidado
- [x] Indicador de saldo em caixa
- [x] Indicador de funcionários ativos
- [ ] Gráficos de evolução temporal
- [ ] Comparativo entre empresas

## Cálculos Automáticos
- [x] Faturamento líquido = Faturamento bruto - Impostos
- [x] Lucro/Prejuízo = Faturamento líquido - Custos fixos - Custos variáveis
- [x] Margem (%) = (Lucro/Prejuízo / Faturamento bruto) × 100
- [x] Custo total funcionário = Salário base + Benefícios
- [x] Valor imposto = Base de cálculo × Alíquota
- [x] Saldo acumulado no fluxo de caixa

## Sistema de Alertas
- [x] Alertas de vencimento próximo (contas a pagar/receber)
- [x] Alertas de margem negativa
- [x] Alertas de saldo em caixa baixo
- [x] Alertas de novos registros importantes
- [ ] Configuração de thresholds personalizáveis
- [x] Notificações ao CEO via sistema interno

## Chatbot IA
- [x] Integrar LLM para análise de dados financeiros
- [x] Implementar interface de chat
- [x] Consultas sobre desempenho de empresas
- [x] Análise de principais despesas
- [x] Geração de insights automáticos
- [x] Respostas contextualizadas com dados reais

## Exportação para Excel
- [ ] Exportar dados de empresas
- [ ] Exportar indicadores KPI com fórmulas
- [ ] Exportar contas a pagar/receber
- [ ] Exportar funcionários
- [ ] Exportar fluxo de caixa
- [ ] Exportar impostos
- [ ] Manter formatação e fórmulas Excel

## Preenchimento Automático
- [ ] Ao selecionar empresa, preencher dados cadastrais
- [ ] Ao digitar CNPJ, buscar e preencher dados automaticamente
- [ ] Sugestões baseadas em histórico

## Autenticação e Controle de Acesso
- [x] Sistema de login via Manus OAuth
- [x] Controle de acesso multi-usuário
- [x] Perfis de usuário (CEO, gerente, operacional)

## Testes e Validações
- [ ] Testes unitários dos cálculos financeiros
- [ ] Testes de integração com API CNPJ
- [ ] Testes de upload de documentos
- [ ] Testes do chatbot IA
- [ ] Validação de exportação Excel


## Bugs Reportados
- [x] Corrigir carregamento de dados das empresas (não está puxando dados)
- [x] Verificar e corrigir importação de dados da planilha Excel


## Deploy e Versionamento
- [x] Fazer push do código para GitHub (https://github.com/yhnojonhy-hub/controle-empresarial.git)


## Refatoração SOLID e TDD
- [x] Criar camada de serviços (Service Layer) separando lógica de negócio
- [x] Criar camada de repositórios (Repository Pattern) para acesso a dados
- [x] Aplicar princípio Single Responsibility (SRP) nos routers
- [x] Aplicar princípio Dependency Inversion (DIP) com injeção de dependências
- [x] Eliminar código duplicado usando loops e funções reutilizáveis
- [x] Criar testes unitários para cada serviço (TDD)
- [x] Refatorar componentes frontend eliminando repetições
- [x] Criar hooks customizados reutilizáveis


## Correções TypeScript
- [x] Corrigir erro de tipo dataAbertura (string → Date)
- [x] Implementar conversão automática em routers
- [x] Validar correção com testes
