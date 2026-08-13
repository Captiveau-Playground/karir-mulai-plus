CREATE TABLE `app_config` (
	`key` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`value` text NOT NULL,
	`updated_by` text,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `app_config_category_idx` ON `app_config` (`category`);--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text,
	`content` text,
	`category` text DEFAULT 'Career',
	`tag` text DEFAULT 'Artikel',
	`image_url` text,
	`date` text,
	`read_minutes` integer DEFAULT 3,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_by` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_posts_slug_idx` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE TABLE `config_audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text,
	`actor_name` text,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text,
	`before` text,
	`after` text,
	`at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`actor_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `audit_log_entity_idx` ON `config_audit_log` (`entity`,`at`);--> statement-breakpoint
CREATE INDEX `audit_log_actor_idx` ON `config_audit_log` (`actor_id`);