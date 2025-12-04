import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fetchProxiedContent } from "./proxy";
import { getGameRecommendations } from "./openai";
import { insertSavedSiteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/proxy", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "URL is required" });
      }

      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: "Invalid URL format" });
      }

      const result = await fetchProxiedContent(url);

      if (result.error) {
        return res.status(result.status).json({ 
          error: result.error,
          url: result.url,
          responseTime: result.responseTime 
        });
      }

      res.json({
        content: result.content,
        url: result.url,
        title: result.title,
        responseTime: result.responseTime,
      });
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Proxy error" 
      });
    }
  });

  app.get("/api/sites", async (req, res) => {
    try {
      const sites = await storage.getSavedSites();
      res.json(sites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch saved sites" });
    }
  });

  app.post("/api/sites", async (req, res) => {
    try {
      const data = insertSavedSiteSchema.parse(req.body);
      const site = await storage.createSavedSite(data);
      res.status(201).json(site);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to save site" });
    }
  });

  app.patch("/api/sites/:id/favorite", async (req, res) => {
    try {
      const { id } = req.params;
      const site = await storage.getSavedSite(id);
      
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }

      const updated = await storage.updateSavedSite(id, { 
        isFavorite: !site.isFavorite 
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update site" });
    }
  });

  app.delete("/api/sites/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSavedSite(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Site not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete site" });
    }
  });

  app.delete("/api/sites/all", async (req, res) => {
    try {
      await storage.deleteAllSavedSites();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete all sites" });
    }
  });

  app.get("/api/history", async (req, res) => {
    try {
      const history = await storage.getBrowsingHistory();
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.get("/api/history/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const urls = await storage.getRecentUrls(limit);
      res.json(urls);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent URLs" });
    }
  });

  app.delete("/api/history", async (req, res) => {
    try {
      await storage.clearBrowsingHistory();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to clear history" });
    }
  });

  app.get("/api/logs", async (req, res) => {
    try {
      const logs = await storage.getProxyLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  app.delete("/api/logs", async (req, res) => {
    try {
      await storage.clearProxyLogs();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to clear logs" });
    }
  });

  app.get("/api/recommendations", async (req, res) => {
    try {
      const recentUrls = await storage.getRecentUrls(10);
      const recommendations = await getGameRecommendations(recentUrls);
      res.json(recommendations);
    } catch (error) {
      console.error("Recommendations error:", error);
      const { getFallbackRecommendations } = await import("./openai");
      res.json(getFallbackRecommendations());
    }
  });

  app.post("/api/recommendations/refresh", async (req, res) => {
    try {
      const recentUrls = await storage.getRecentUrls(10);
      const recommendations = await getGameRecommendations(recentUrls);
      res.json(recommendations);
    } catch (error) {
      console.error("Refresh recommendations error:", error);
      const { getFallbackRecommendations } = await import("./openai");
      res.json(getFallbackRecommendations());
    }
  });

  return httpServer;
}
