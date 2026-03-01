import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("Untitled Project"),
  aspectRatio: text("aspect_ratio").notNull().default("9:16"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  type: text("type").notNull(), 
  url: text("url"), 
  name: text("name").notNull(),
  metadata: jsonb("metadata"), 
  createdAt: timestamp("created_at").defaultNow(),
});

export const timelineItems = pgTable("timeline_items", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  assetId: integer("asset_id"), 
  trackId: text("track_id").notNull(), 
  startTime: integer("start_time").notNull(), 
  duration: integer("duration").notNull(), 
  sourceStartTime: integer("source_start_time").default(0), 
  properties: jsonb("properties"), 
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertAssetSchema = createInsertSchema(assets).omit({ id: true, createdAt: true });
export const insertTimelineItemSchema = createInsertSchema(timelineItems).omit({ id: true });

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type TimelineItem = typeof timelineItems.$inferSelect;
export type InsertTimelineItem = z.infer<typeof insertTimelineItemSchema>;

export type CreateProjectRequest = InsertProject;
export type UpdateProjectRequest = Partial<InsertProject>;
export type CreateAssetRequest = InsertAsset;
export type CreateTimelineItemRequest = InsertTimelineItem;
export type UpdateTimelineItemRequest = Partial<InsertTimelineItem>;
