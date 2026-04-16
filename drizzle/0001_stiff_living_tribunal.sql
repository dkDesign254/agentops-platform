CREATE TABLE `AI_Logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workflowId` varchar(36) NOT NULL,
	`prompt` text NOT NULL,
	`response` text NOT NULL,
	`model` varchar(128) NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `AI_Logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ExecutionLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workflowId` varchar(36) NOT NULL,
	`step` varchar(255) NOT NULL,
	`eventType` enum('intake','routing','execution','ai_call','report','error','completion','webhook_received') NOT NULL,
	`status` enum('success','failure','info') NOT NULL,
	`message` text NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ExecutionLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workflowId` varchar(36) NOT NULL,
	`summary` text NOT NULL,
	`insights` text NOT NULL,
	`risks` text NOT NULL,
	`recommendation` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reports_id` PRIMARY KEY(`id`),
	CONSTRAINT `reports_workflowId_unique` UNIQUE(`workflowId`)
);
--> statement-breakpoint
CREATE TABLE `workflows` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`runtime` enum('make','n8n') NOT NULL,
	`status` enum('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
	`requestedBy` varchar(255) NOT NULL,
	`webhookUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `workflows_id` PRIMARY KEY(`id`)
);
