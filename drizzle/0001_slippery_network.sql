CREATE TABLE `alertas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` enum('Vencimento','MargemNegativa','SaldoBaixo','NovoRegistro') NOT NULL,
	`severidade` enum('Info','Aviso','Critico') NOT NULL DEFAULT 'Info',
	`titulo` varchar(255) NOT NULL,
	`mensagem` text NOT NULL,
	`entidadeTipo` varchar(50),
	`entidadeId` int,
	`lido` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alertas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` enum('Pagar','Receber') NOT NULL,
	`empresaId` int,
	`descricao` text NOT NULL,
	`categoria` varchar(100),
	`valor` decimal(15,2) NOT NULL,
	`vencimento` date NOT NULL,
	`status` enum('Pendente','Pago','Recebido','Atrasado','Cancelado') NOT NULL DEFAULT 'Pendente',
	`prioridade` enum('Baixa','Media','Alta') NOT NULL DEFAULT 'Media',
	`dataPagamento` date,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`tamanho` int NOT NULL,
	`fileKey` text NOT NULL,
	`url` text NOT NULL,
	`entidadeTipo` enum('Empresa','Conta','Funcionario','FluxoCaixa','Imposto') NOT NULL,
	`entidadeId` int NOT NULL,
	`descricao` text,
	`uploadedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `empresas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`razaoSocial` text,
	`nomeFantasia` varchar(255),
	`cnpj` varchar(18) NOT NULL,
	`capitalSocial` decimal(15,2),
	`cnae` text,
	`regimeTributario` varchar(100),
	`enderecoCompleto` text,
	`cidade` varchar(100),
	`estado` varchar(50),
	`responsavelLegal` varchar(255),
	`telefone` varchar(20),
	`email` varchar(320),
	`dataAbertura` date,
	`status` enum('Aberto','Fechado','Suspenso') NOT NULL DEFAULT 'Aberto',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `empresas_id` PRIMARY KEY(`id`),
	CONSTRAINT `empresas_cnpj_unique` UNIQUE(`cnpj`)
);
--> statement-breakpoint
CREATE TABLE `fluxo_caixa` (
	`id` int AUTO_INCREMENT NOT NULL,
	`data` date NOT NULL,
	`tipo` enum('Entrada','Saida') NOT NULL,
	`empresaId` int,
	`descricao` text NOT NULL,
	`categoria` varchar(100),
	`valor` decimal(15,2) NOT NULL,
	`metodoPagamento` varchar(50),
	`referencia` varchar(100),
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fluxo_caixa_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funcionarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cpf` varchar(14) NOT NULL,
	`empresaId` int,
	`cargo` varchar(100),
	`tipoContrato` enum('CLT','PJ','Estagiario','Temporario') NOT NULL,
	`salarioBase` decimal(15,2) NOT NULL,
	`beneficios` decimal(15,2) NOT NULL DEFAULT '0',
	`dataAdmissao` date,
	`diaPagamento` int,
	`status` enum('Contratado','Demitido','Afastado','Ferias') NOT NULL DEFAULT 'Contratado',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `funcionarios_id` PRIMARY KEY(`id`),
	CONSTRAINT `funcionarios_cpf_unique` UNIQUE(`cpf`)
);
--> statement-breakpoint
CREATE TABLE `impostos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`tipoImposto` varchar(50) NOT NULL,
	`mesAno` varchar(7) NOT NULL,
	`baseCalculo` decimal(15,2) NOT NULL,
	`aliquota` decimal(5,2) NOT NULL,
	`vencimento` date NOT NULL,
	`status` enum('Pendente','Pago','Atrasado') NOT NULL DEFAULT 'Pendente',
	`dataPagamento` date,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `impostos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `indicadores_kpi` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`mesAno` varchar(7) NOT NULL,
	`faturamentoBruto` decimal(15,2) NOT NULL DEFAULT '0',
	`impostos` decimal(15,2) NOT NULL DEFAULT '0',
	`custosFixos` decimal(15,2) NOT NULL DEFAULT '0',
	`custosVariaveis` decimal(15,2) NOT NULL DEFAULT '0',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `indicadores_kpi_id` PRIMARY KEY(`id`)
);
