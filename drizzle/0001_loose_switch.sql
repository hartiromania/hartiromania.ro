ALTER TABLE "admin_audit_log" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "admin_audit_log" ADD COLUMN "device" text;--> statement-breakpoint
ALTER TABLE "admin_audit_log" ADD COLUMN "session_id" uuid;