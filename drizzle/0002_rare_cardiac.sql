CREATE TABLE "consent_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consent_id" uuid NOT NULL,
	"statistics" boolean NOT NULL,
	"version" integer NOT NULL,
	"source" text NOT NULL,
	"page" text,
	"ip_masked" text,
	"location" text,
	"device" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "consent_records_created_idx" ON "consent_records" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "consent_records_consent_idx" ON "consent_records" USING btree ("consent_id");