import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.projects.list.path, async (req, res) => {
    const allProjects = await storage.getProjects();
    res.json(allProjects);
  });

  app.get(api.projects.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const project = await storage.getProject(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  });

  app.post(api.projects.create.path, async (req, res) => {
    try {
      const input = api.projects.create.input.parse(req.body);
      const project = await storage.createProject(input);
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.assets.list.path, async (req, res) => {
    const projectId = Number(req.params.projectId);
    const projAssets = await storage.getAssets(projectId);
    res.json(projAssets);
  });

  app.post(api.assets.create.path, async (req, res) => {
    try {
      const projectId = Number(req.params.projectId);
      const inputSchema = api.assets.create.input.extend({
        projectId: z.number()
      });
      const input = inputSchema.parse({ ...req.body, projectId });
      const asset = await storage.createAsset(input);
      res.status(201).json(asset);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.timeline.list.path, async (req, res) => {
    const projectId = Number(req.params.projectId);
    const items = await storage.getTimelineItems(projectId);
    res.json(items);
  });

  app.post(api.timeline.create.path, async (req, res) => {
    try {
      const projectId = Number(req.params.projectId);
      const inputSchema = api.timeline.create.input.extend({
        projectId: z.number()
      });
      const input = inputSchema.parse({ ...req.body, projectId });
      const item = await storage.createTimelineItem(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.timeline.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.timeline.update.input.parse(req.body);
      const updated = await storage.updateTimelineItem(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.timeline.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteTimelineItem(id);
    res.status(204).send();
  });

  // Seed database
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingProjects = await storage.getProjects();
  if (existingProjects.length === 0) {
    const project = await storage.createProject({
      title: "My Awesome TikTok Edit",
      aspectRatio: "9:16"
    });
    
    const asset1 = await storage.createAsset({
      projectId: project.id,
      name: "Skateboarding Trick",
      type: "video",
      url: "https://assets.mixkit.co/videos/preview/mixkit-skater-doing-a-trick-in-a-skatepark-41611-large.mp4"
    });
    
    const asset2 = await storage.createAsset({
      projectId: project.id,
      name: "Chill Lo-Fi Beat",
      type: "audio",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    });

    await storage.createTimelineItem({
      projectId: project.id,
      assetId: asset1.id,
      trackId: "video-1",
      startTime: 0,
      duration: 10,
      sourceStartTime: 0
    });
    
    await storage.createTimelineItem({
      projectId: project.id,
      assetId: asset2.id,
      trackId: "audio-1",
      startTime: 0,
      duration: 10,
      sourceStartTime: 0
    });
  }
}
