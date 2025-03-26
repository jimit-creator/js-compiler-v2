import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const codeSnippets = pgTable("code_snippets", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  title: text("title").notNull(),
  language: text("language").notNull().default("javascript"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  shareId: text("share_id").notNull().unique(),
});

export const insertCodeSnippetSchema = createInsertSchema(codeSnippets).pick({
  code: true,
  title: true,
  language: true,
  shareId: true,
});

export type InsertCodeSnippet = z.infer<typeof insertCodeSnippetSchema>;
export type CodeSnippet = typeof codeSnippets.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
