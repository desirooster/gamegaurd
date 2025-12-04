import { randomUUID } from "crypto";
import type {
  SavedSite,
  InsertSavedSite,
  BrowsingHistory,
  InsertBrowsingHistory,
  ProxyLog,
  InsertProxyLog,
} from "@shared/schema";

export interface IStorage {
  getSavedSites(): Promise<SavedSite[]>;
  getSavedSite(id: string): Promise<SavedSite | undefined>;
  getSavedSiteByUrl(url: string): Promise<SavedSite | undefined>;
  createSavedSite(site: InsertSavedSite): Promise<SavedSite>;
  updateSavedSite(id: string, updates: Partial<SavedSite>): Promise<SavedSite | undefined>;
  deleteSavedSite(id: string): Promise<boolean>;
  deleteAllSavedSites(): Promise<void>;

  getBrowsingHistory(): Promise<BrowsingHistory[]>;
  getRecentUrls(limit?: number): Promise<string[]>;
  createBrowsingHistory(entry: InsertBrowsingHistory): Promise<BrowsingHistory>;
  clearBrowsingHistory(): Promise<void>;

  getProxyLogs(): Promise<ProxyLog[]>;
  createProxyLog(log: InsertProxyLog): Promise<ProxyLog>;
  clearProxyLogs(): Promise<void>;
}

export class MemStorage implements IStorage {
  private savedSites: Map<string, SavedSite>;
  private browsingHistory: Map<string, BrowsingHistory>;
  private proxyLogs: Map<string, ProxyLog>;

  constructor() {
    this.savedSites = new Map();
    this.browsingHistory = new Map();
    this.proxyLogs = new Map();
  }

  async getSavedSites(): Promise<SavedSite[]> {
    return Array.from(this.savedSites.values()).sort((a, b) => {
      const dateA = a.lastVisited ? new Date(a.lastVisited).getTime() : 0;
      const dateB = b.lastVisited ? new Date(b.lastVisited).getTime() : 0;
      return dateB - dateA;
    });
  }

  async getSavedSite(id: string): Promise<SavedSite | undefined> {
    return this.savedSites.get(id);
  }

  async getSavedSiteByUrl(url: string): Promise<SavedSite | undefined> {
    return Array.from(this.savedSites.values()).find((site) => site.url === url);
  }

  async createSavedSite(site: InsertSavedSite): Promise<SavedSite> {
    const existing = await this.getSavedSiteByUrl(site.url);
    if (existing) {
      const updated = {
        ...existing,
        visitCount: (existing.visitCount || 1) + 1,
        lastVisited: new Date(),
      };
      this.savedSites.set(existing.id, updated);
      return updated;
    }

    const id = randomUUID();
    const newSite: SavedSite = {
      id,
      url: site.url,
      title: site.title,
      favicon: site.favicon ?? null,
      category: site.category ?? "general",
      isFavorite: site.isFavorite ?? false,
      lastVisited: new Date(),
      visitCount: 1,
    };
    this.savedSites.set(id, newSite);
    return newSite;
  }

  async updateSavedSite(id: string, updates: Partial<SavedSite>): Promise<SavedSite | undefined> {
    const site = this.savedSites.get(id);
    if (!site) return undefined;

    const updated = { ...site, ...updates };
    this.savedSites.set(id, updated);
    return updated;
  }

  async deleteSavedSite(id: string): Promise<boolean> {
    return this.savedSites.delete(id);
  }

  async deleteAllSavedSites(): Promise<void> {
    this.savedSites.clear();
  }

  async getBrowsingHistory(): Promise<BrowsingHistory[]> {
    return Array.from(this.browsingHistory.values()).sort((a, b) => {
      const dateA = a.visitedAt ? new Date(a.visitedAt).getTime() : 0;
      const dateB = b.visitedAt ? new Date(b.visitedAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async getRecentUrls(limit = 5): Promise<string[]> {
    const history = await this.getBrowsingHistory();
    const seen = new Set<string>();
    const urls: string[] = [];

    for (const entry of history) {
      if (!seen.has(entry.url)) {
        seen.add(entry.url);
        urls.push(entry.url);
        if (urls.length >= limit) break;
      }
    }

    return urls;
  }

  async createBrowsingHistory(entry: InsertBrowsingHistory): Promise<BrowsingHistory> {
    const id = randomUUID();
    const newEntry: BrowsingHistory = {
      id,
      url: entry.url,
      title: entry.title ?? null,
      visitedAt: new Date(),
      duration: entry.duration ?? 0,
    };
    this.browsingHistory.set(id, newEntry);
    return newEntry;
  }

  async clearBrowsingHistory(): Promise<void> {
    this.browsingHistory.clear();
  }

  async getProxyLogs(): Promise<ProxyLog[]> {
    return Array.from(this.proxyLogs.values()).sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return dateB - dateA;
    });
  }

  async createProxyLog(log: InsertProxyLog): Promise<ProxyLog> {
    const id = randomUUID();
    const newLog: ProxyLog = {
      id,
      url: log.url,
      status: log.status,
      responseTime: log.responseTime ?? null,
      timestamp: new Date(),
      error: log.error ?? null,
    };
    this.proxyLogs.set(id, newLog);
    return newLog;
  }

  async clearProxyLogs(): Promise<void> {
    this.proxyLogs.clear();
  }
}

export const storage = new MemStorage();
