import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const savedSites = pgTable("saved_sites", {
  id: varchar("id", { length: 36 }).primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  favicon: text("favicon"),
  category: text("category").default("general"),
  isFavorite: boolean("is_favorite").default(false),
  lastVisited: timestamp("last_visited").defaultNow(),
  visitCount: integer("visit_count").default(1),
});

export const browsingHistory = pgTable("browsing_history", {
  id: varchar("id", { length: 36 }).primaryKey(),
  url: text("url").notNull(),
  title: text("title"),
  visitedAt: timestamp("visited_at").defaultNow(),
  duration: integer("duration").default(0),
});

export const proxyLogs = pgTable("proxy_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  url: text("url").notNull(),
  status: integer("status").notNull(),
  responseTime: integer("response_time"),
  timestamp: timestamp("timestamp").defaultNow(),
  error: text("error"),
});

export const insertSavedSiteSchema = createInsertSchema(savedSites).omit({ id: true, lastVisited: true, visitCount: true });
export const insertBrowsingHistorySchema = createInsertSchema(browsingHistory).omit({ id: true, visitedAt: true });
export const insertProxyLogSchema = createInsertSchema(proxyLogs).omit({ id: true, timestamp: true });

export type InsertSavedSite = z.infer<typeof insertSavedSiteSchema>;
export type SavedSite = typeof savedSites.$inferSelect;

export type InsertBrowsingHistory = z.infer<typeof insertBrowsingHistorySchema>;
export type BrowsingHistory = typeof browsingHistory.$inferSelect;

export type InsertProxyLog = z.infer<typeof insertProxyLogSchema>;
export type ProxyLog = typeof proxyLogs.$inferSelect;

export const gameRecommendationSchema = z.object({
  title: z.string(),
  url: z.string(),
  description: z.string(),
  genre: z.string(),
  reason: z.string(),
});

export type GameRecommendation = z.infer<typeof gameRecommendationSchema>;
