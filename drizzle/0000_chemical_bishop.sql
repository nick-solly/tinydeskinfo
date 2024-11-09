CREATE TABLE IF NOT EXISTS "tinydeskinfo_video" (
	"id" varchar(11) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text DEFAULT '',
	"view_count" integer NOT NULL,
	"like_count" integer NOT NULL,
	"dislike_count" integer NOT NULL,
	"comment_count" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
