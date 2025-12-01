CREATE TABLE "lucy_chats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text,
	"gemini_session_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lucy_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text,
	"attachments" jsonb,
	"tool_calls" jsonb,
	"tool_response" jsonb,
	"is_error" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lucy_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"chat_id" uuid,
	"type" text NOT NULL,
	"url" text,
	"storage_key" text,
	"prompt" text,
	"cost" integer NOT NULL,
	"model" text NOT NULL,
	"width" integer,
	"height" integer,
	"duration" integer,
	"mime_type" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lucy_chats" ADD CONSTRAINT "lucy_chats_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lucy_messages" ADD CONSTRAINT "lucy_messages_chat_id_lucy_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."lucy_chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lucy_assets" ADD CONSTRAINT "lucy_assets_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lucy_assets" ADD CONSTRAINT "lucy_assets_chat_id_lucy_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."lucy_chats"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lucy_message_chat_id_idx" ON "lucy_messages" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "lucy_message_created_at_idx" ON "lucy_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "lucy_asset_user_id_idx" ON "lucy_assets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lucy_asset_chat_id_idx" ON "lucy_assets" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "lucy_asset_type_idx" ON "lucy_assets" USING btree ("type");--> statement-breakpoint
CREATE INDEX "lucy_asset_created_at_idx" ON "lucy_assets" USING btree ("created_at");