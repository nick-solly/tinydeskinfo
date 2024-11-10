// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  pgTableCreator,
  text,
  timestamp,
  integer,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `tinydeskinfo_${name}`);

export const videos = createTable("video", {
  id: varchar("id", { length: 11 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").default(""),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
  viewCount: integer("view_count").notNull().default(0),
  likeCount: integer("like_count").notNull().default(0),
  favouriteCount: integer("favourite_count").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  duration: integer("duration").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});
