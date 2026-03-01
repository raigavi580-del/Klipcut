import { db } from "./db";
import {
  projects,
  assets,
  timelineItems,
  type Project,
  type InsertProject,
  type Asset,
  type InsertAsset,
  type TimelineItem,
  type InsertTimelineItem,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  
  getAssets(projectId: number): Promise<Asset[]>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  
  getTimelineItems(projectId: number): Promise<TimelineItem[]>;
  createTimelineItem(item: InsertTimelineItem): Promise<TimelineItem>;
  updateTimelineItem(id: number, updates: Partial<InsertTimelineItem>): Promise<TimelineItem>;
  deleteTimelineItem(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async getAssets(projectId: number): Promise<Asset[]> {
    return await db.select().from(assets).where(eq(assets.projectId, projectId));
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    const [newAsset] = await db.insert(assets).values(asset).returning();
    return newAsset;
  }

  async getTimelineItems(projectId: number): Promise<TimelineItem[]> {
    return await db.select().from(timelineItems).where(eq(timelineItems.projectId, projectId));
  }

  async createTimelineItem(item: InsertTimelineItem): Promise<TimelineItem> {
    const [newItem] = await db.insert(timelineItems).values(item).returning();
    return newItem;
  }

  async updateTimelineItem(id: number, updates: Partial<InsertTimelineItem>): Promise<TimelineItem> {
    const [updated] = await db.update(timelineItems)
      .set(updates)
      .where(eq(timelineItems.id, id))
      .returning();
    return updated;
  }

  async deleteTimelineItem(id: number): Promise<void> {
    await db.delete(timelineItems).where(eq(timelineItems.id, id));
  }
}

export const storage = new DatabaseStorage();
