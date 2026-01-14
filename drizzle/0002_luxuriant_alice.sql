CREATE TABLE `contas_bancarias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`nomeConta` varchar(255) NOT NULL,
	`banco` varchar(100) NOT NULL,
	`agencia` varchar(20) NOT NULL,
	`conta` varchar(30) NOT NULL,
	`tipo` enum('PJ','PF') NOT NULL DEFAULT 'PJ',
	`saldoAtual` decimal(15,2) NOT NULL DEFAULT '0',
	`saldoAnterior` decimal(15,2) NOT NULL DEFAULT '0',
	`dataAtualizacao` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`status` enum('Ativa','Inativa','Encerrada') NOT NULL DEFAULT 'Ativa',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contas_bancarias_id` PRIMARY KEY(`id`)
);
