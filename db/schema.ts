import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations, type InferModel } from "drizzle-orm";

export const thoughts = pgTable("thoughts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  response: text("response"),
  parentId: integer("parent_id").references(() => thoughts.id),
  position: jsonb("position").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const thoughtRelations = relations(thoughts, ({ one }) => ({
  parent: one(thoughts, {
    fields: [thoughts.parentId],
    references: [thoughts.id],
  }),
}));

export const insertThoughtSchema = createInsertSchema(thoughts);
export const selectThoughtSchema = createSelectSchema(thoughts);
export type InsertThought = InferModel<typeof thoughts, "insert">;
export type SelectThought = InferModel<typeof thoughts, "select">;