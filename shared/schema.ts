import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export type Location = z.infer<typeof locationSchema>;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default('resident'),
});

export const issues = pgTable("issues", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: jsonb("location").notNull(),
  imageUrl: text("image_url"),
  status: text("status").notNull().default('reported'),
  votes: integer("votes").notNull().default(0),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertIssueSchema = createInsertSchema(issues).pick({
  title: true,
  description: true,
  location: true,
  imageUrl: true,
}).extend({
  address: z.string().min(1, "Address is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().min(1, "Image is required"),
  location: locationSchema.refine((data) => data.lat !== 0 && data.lng !== 0, "Location is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type IssueRow = typeof issues.$inferSelect;
export type Issue = Omit<IssueRow, 'location'> & { location: Location };
export type InsertIssue = z.infer<typeof insertIssueSchema>;