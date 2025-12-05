import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { UrlInput } from "@/components/url-input";
import { ProxyViewer } from "@/components/proxy-viewer";
import { ProxyStatus } from "@/components/proxy-status";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SavedSite } from "@shared/schema";

interface ProxyResponse {
  content: string;
  url: string;
  title: string;
  responseTime: number;
}

export default function Home() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const initialUrlProcessed = useRef(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [proxyContent, setProxyContent] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const { data: savedSites = [] } = useQuery<SavedSite[]>({
    queryKey: ["/api/sites"],
  });

  const { data: recentUrls = [] } = useQuery<string[]>({
    queryKey: ["/api/history/recent"],
  });

  const proxyMutation = useMutation({
    mutationFn: async (url: string): Promise<ProxyResponse> => {
      const response = await apiRequest("POST", "/api/proxy", { url });
      return response.json();
    },
    onSuccess: (data) => {
      setProxyContent(data.content);
      setResponseTime(data.responseTime);
      queryClient.invalidateQueries({ queryKey: ["/api/history/recent"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to load page",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const saveSiteMutation = useMutation({
    mutationFn: async (data: { url: string; title: string }) => {
      const response = await apiRequest("POST", "/api/sites", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      toast({
        title: "Site saved",
        description: "Added to your library",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleNavigate = useCallback((url: string) => {
    setCurrentUrl(url);
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(url);
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);
    proxyMutation.mutate(url);
    if (window.location.search) {
      setLocation("/", { replace: true });
    }
  }, [historyIndex, proxyMutation, setLocation]);

  useEffect(() => {
    if (initialUrlProcessed.current) return;
    
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get("url");
    
    if (urlParam) {
      initialUrlProcessed.current = true;
      handleNavigate(urlParam);
    }
  }, [handleNavigate]);

  const handleBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const url = history[newIndex];
      setCurrentUrl(url);
      proxyMutation.mutate(url);
    }
  }, [historyIndex, history, proxyMutation]);

  const handleForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const url = history[newIndex];
      setCurrentUrl(url);
      proxyMutation.mutate(url);
    }
  }, [historyIndex, history, proxyMutation]);

  const handleRefresh = useCallback(() => {
    if (currentUrl) {
      proxyMutation.mutate(currentUrl);
    }
  }, [currentUrl, proxyMutation]);

  const handleHome = useCallback(() => {
    setCurrentUrl(null);
    setProxyContent(null);
  }, []);

  const handleSave = useCallback(() => {
    if (currentUrl) {
      const title = (() => {
        try {
          return new URL(currentUrl).hostname;
        } catch {
          return currentUrl;
        }
      })();
      saveSiteMutation.mutate({ url: currentUrl, title });
    }
  }, [currentUrl, saveSiteMutation]);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const isSaved = savedSites.some((site) => site.url === currentUrl);

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-rajdhani text-2xl font-bold">Proxy Browser</h1>
        <ProxyStatus
          isConnected={true}
          isSecure={currentUrl?.startsWith("https://") ?? true}
          responseTime={responseTime}
        />
      </div>

      {!isFullscreen && (
        <UrlInput
          onSubmit={handleNavigate}
          isLoading={proxyMutation.isPending}
          recentSites={recentUrls}
        />
      )}

      <ProxyViewer
        url={currentUrl}
        content={proxyContent}
        isLoading={proxyMutation.isPending}
        error={proxyMutation.error?.message || null}
        isSaved={isSaved}
        onRefresh={handleRefresh}
        onBack={handleBack}
        onForward={handleForward}
        onHome={handleHome}
        onSave={handleSave}
        onFullscreen={handleFullscreen}
        onNavigate={handleNavigate}
        isFullscreen={isFullscreen}
      />
    </div>
  );
}
