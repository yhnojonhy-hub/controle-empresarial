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


## Páginas Frontend
- [x] Remover página Chatbot e rota correspondente
- [x] Criar página completa de KPI com formulário e listagem
- [x] Criar página completa de Contas (a pagar/receber) com formulário e listagem
- [x] Criar página completa de Funcionários com formulário e listagem
- [x] Criar página completa de Fluxo de Caixa com formulário e listagem
- [x] Criar página completa de Impostos com formulário e listagem
- [x] Criar página completa de Alertas com listagem e configurações


## Melhorias de Navegação e Segurança
- [x] Implementar menu completo de navegação na página Home
- [x] Adicionar cards de acesso rápido para todas as páginas
- [x] Implementar sistema de login para administradores
- [x] Adicionar middleware de proteção de rotas administrativas
- [x] Criar página de login com autenticação
- [x] Implementar verificação de permissões no frontend

## Testes de Páginas
- [x] Criar testes para página KPI (CRUD e cálculos)
- [x] Criar testes para página Contas (CRUD e validações)
- [x] Criar testes para página Funcionários (CRUD e cálculo de custo)
- [x] Criar testes para página Fluxo de Caixa
- [x] Criar testes para página Impostos
- [x] Criar testes para página Alertas (listagem e status)
- [x] Validar todos os testes passando (100%)


## Correções de Bugs
- [x] Criar router dashboard.summary para resolver erro na Home
- [x] Implementar cálculos de indicadores em tempo real
- [x] Testar correção com usuário autenticado


## Testes Completos de Páginas
- [x] Criar testes completos para FluxoCaixa router (CRUD + cálculo de saldo)
- [x] Criar testes completos para Impostos router (CRUD + cálculo de valor)
- [x] Expandir testes de KPI (create, update, delete, cálculos)
- [x] Expandir testes de Contas (create, update, delete, alertas)
- [x] Expandir testes de Funcionários (create, update, delete)
- [x] Criar testes de integração para fluxos completos
- [x] Validar cobertura de testes em 100% dos routers


## Correções de Formulários
- [x] Corrigir validação do campo periodo no formulário KPI
- [x] Tornar campos opcionais ou adicionar valores padrão
- [x] Testar criação de KPI com todos os campos

- [x] Corrigir validação do campo vencimento no formulário Contas


## Testes e Melhorias de Formulários
- [x] Testar formulário de Empresas (campos obrigatórios e CNPJ)
- [x] Testar formulário de Funcionários (CPF e valores)
- [x] Testar formulário de Fluxo de Caixa
- [x] Testar formulário de Impostos
- [x] Corrigir validações encontradas em todos os formulários
- [ ] Adicionar date pickers para campos de data
- [ ] Implementar validação de valores numéricos positivos
- [x] Criar script de dados de exemplo (seed data)
- [x] Popular banco com dados de demonstração


## Testes Práticos e Melhorias de UI
- [x] Criar testes práticos para Fluxo de Caixa (CRUD completo)
- [x] Criar testes práticos para Impostos (CRUD completo)
- [x] Criar testes práticos para Alertas (listagem e marcar como lido)
- [x] Adicionar botão de deletar empresas no painel
- [x] Testar delete de empresas com confirmação


## Correções de Procedures
- [x] Adicionar procedure delete no router KPIs
- [x] Adicionar procedure delete em todos os routers faltantes (Contas, Funcionários, FluxoCaixa, Impostos)


## Melhorias de UI e Funcionalidades
- [ ] Adicionar botões de editar em todas as listagens (Empresas, KPI, Contas, Funcionários, FluxoCaixa, Impostos)
- [ ] Criar modals/dialogs de edição com formulários preenchidos
- [ ] Implementar procedure update em todos os routers
- [ ] Adicionar gráficos no Dashboard com Recharts
- [ ] Gráfico de evolução mensal de faturamento
- [ ] Gráfico de comparativo entre empresas
- [ ] Gráfico de despesas por categoria
- [ ] Criar filtros nas listagens (busca, data, empresa, status, categoria)
- [ ] Implementar campo de busca global em cada página

## Testes Práticos de Páginas
- [x] Testar página Fluxo de Caixa (adicionar entradas e saídas)
- [x] Testar página Fluxo de Caixa (remover registros)
- [x] Testar página Impostos (adicionar impostos com cálculos)
- [x] Testar página Impostos (remover registros)
- [x] Testar página Alertas (visualizar alertas)
- [x] Testar página Alertas (marcar como lido)
- [x] Validar todos os campos obrigatórios
- [x] Validar cálculos automáticos


## Correções e Melhorias Finais
- [x] Corrigir página Alertas (não está funcionando)
- [x] Verificar router alertas.marcarComoLido
- [ ] Adicionar botões de editar em KPI
- [ ] Adicionar botões de editar em Contas
- [ ] Adicionar botões de editar em Funcionários
- [ ] Adicionar botões de editar em FluxoCaixa
- [ ] Adicionar botões de editar em Impostos
- [x] Implementar gráfico de evolução de faturamento no Dashboard
- [x] Implementar gráfico de despesas por categoria no Dashboard
- [x] Implementar gráfico de lucro/prejuízo mensal no Dashboard
- [ ] Adicionar filtros de busca em todas as listagens
- [ ] Adicionar filtros de data nas listagens
- [ ] Adicionar filtros de empresa nas listagens
- [ ] Fazer push final para GitHub


## Testes Práticos Completos de Todas as Abas
- [x] Testar barra de alertas (visualização, contador, marcar como lido)
- [x] Testar formulário Empresas (todos os campos, validação CNPJ, busca automática)
- [x] Testar formulário KPI (todos os campos, cálculos automáticos de margem e lucro)
- [x] Testar formulário Contas (todos os campos, validação de vencimento, status)
- [x] Testar formulário Funcionários (todos os campos, cálculo de custo total)
- [x] Testar formulário FluxoCaixa (todos os campos, tipos entrada/saída)
- [x] Testar formulário Impostos (todos os campos, cálculo automático de valor)
- [x] Testar operações de deletar em todas as abas
- [x] Testar listagens e visualização de dados em todas as abas
- [x] Documentar todos os bugs encontrados
- [x] Corrigir todos os bugs encontrados


## Implementação de Botões de Edição Inline
- [x] Verificar procedures update existentes em todos os routers
- [x] Implementar procedure update no router KPI
- [x] Implementar procedure update no router Contas
- [x] Implementar procedure update no router Funcionários
- [x] Implementar procedure update no router FluxoCaixa
- [x] Implementar procedure update no router Impostos
- [ ] Implementar procedure update no router Alertas
- [x] Adicionar botão de editar na página Empresas com modal
- [x] Adicionar botão de editar na página KPI com modal
- [ ] Adicionar botão de editar na página Contas com modal (procedures prontos)
- [ ] Adicionar botão de editar na página Funcionários com modal (procedures prontos)
- [ ] Adicionar botão de editar na página FluxoCaixa com modal (procedures prontos)
- [ ] Adicionar botão de editar na página Impostos com modal (procedures prontos)
- [ ] Adicionar botão de editar na página Alertas com modal
- [ ] Criar testes unitários para todos os procedures update
- [ ] Validar funcionalidade de edição em todas as páginas


## Replicação de Padrão de Edição Inline
- [x] Implementar botão Pencil e modal de edição na página Contas
- [x] Implementar botão Pencil e modal de edição na página Funcionários
- [x] Implementar botão Pencil e modal de edição na página FluxoCaixa
- [x] Implementar botão Pencil e modal de edição na página Impostos
- [x] Testar funcionalidade de edição em todas as 4 páginas
- [x] Validar feedback visual e toasts em todas as páginas


## Refatoração Completa do Código (SOLID, DRY, KISS)

### 1. Análise e Planejamento
- [ ] Analisar estrutura atual do projeto
- [ ] Identificar code smells e anti-patterns
- [ ] Mapear dependências e acoplamentos
- [ ] Criar plano de refatoração detalhado

### 2. Arquitetura em Camadas
- [x] Criar camada de Services (lógica de negócio)
- [x] Criar camada de Validators (validação centralizada)
- [x] Criar camada de Types (tipos compartilhados)
- [x] Criar camada de Utils (funções auxiliares)
- [x] Criar camada de Constants (constantes do sistema)
- [x] Criar camada de Errors (classes de erro customizadas)

### 3. Refatoração Backend (routers.ts)
- [ ] Extrair lógica de negócio para Services
- [ ] Aplicar Single Responsibility Principle
- [ ] Padronizar tratamento de erros
- [ ] Implementar validação de entrada
- [ ] Remover código duplicado

### 4. Refatoração Database (db.ts)
- [ ] Aplicar Repository Pattern
- [ ] Centralizar queries SQL
- [ ] Implementar tratamento de erros robusto
- [ ] Adicionar logs estruturados
- [ ] Otimizar queries para performance

### 5. Segurança e Validação
- [ ] Implementar validação de entrada em todos os endpoints
- [ ] Sanitizar dados antes de inserir no banco
- [ ] Validar tipos e formatos (CNPJ, CPF, datas)
- [ ] Implementar rate limiting
- [ ] Adicionar logs de auditoria

### 6. Refatoração Frontend
- [ ] Extrair lógica de formulários para hooks customizados
- [ ] Criar componentes reutilizáveis (FormField, DataTable)
- [ ] Aplicar composição ao invés de herança
- [ ] Padronizar nomenclatura de variáveis
- [ ] Remover código duplicado

### 7. Testes e Documentação
- [ ] Criar testes unitários para Services
- [ ] Criar testes de integração para Routers
- [ ] Documentar APIs com JSDoc
- [ ] Criar README de arquitetura
- [ ] Documentar padrões de código

### 8. Performance e Otimização
- [ ] Otimizar queries do banco de dados
- [ ] Implementar cache quando aplicável
- [ ] Reduzir complexidade ciclomática
- [ ] Otimizar re-renders no frontend
- [ ] Implementar lazy loading
