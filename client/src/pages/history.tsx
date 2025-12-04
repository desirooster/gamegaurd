import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Clock, Search, Trash2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { BrowsingHistory } from "@shared/schema";

export default function History() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const { data: history = [], isLoading } = useQuery<BrowsingHistory[]>({
    queryKey: ["/api/history"],
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/history");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/history/recent"] });
      toast({
        title: "History cleared",
        description: "Your browsing history has been removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOpen = (url: string) => {
    setLocation(`/?url=${encodeURIComponent(url)}`);
  };

  const filteredHistory = history.filter(
    (item) =>
      item.url.toLowerCase().includes(search.toLowerCase()) ||
      (item.title && item.title.toLowerCase().includes(search.toLowerCase()))
  );

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return `Today at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (days === 1) {
      return `Yesterday at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (days < 7) {
      return d.toLocaleDateString([], { weekday: "long", hour: "2-digit", minute: "2-digit" });
    } else {
      return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-rajdhani text-2xl font-bold">Browsing History</h1>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-history"
            />
          </div>

          {history.length > 0 && (
            <Button
              variant="outline"
              onClick={() => clearMutation.mutate()}
              disabled={clearMutation.isPending}
              data-testid="button-clear-history"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <EmptyState
          icon={Clock}
          title={search ? "No matching history" : "No browsing history"}
          description={
            search
              ? "Try a different search term"
              : "Sites you visit through the proxy will appear here"
          }
          actionLabel={!search ? "Start Browsing" : undefined}
          onAction={!search ? () => setLocation("/") : undefined}
        />
      ) : (
        <div className="space-y-2">
          {filteredHistory.map((item) => {
            const hostname = (() => {
              try {
                return new URL(item.url).hostname;
              } catch {
                return item.url;
              }
            })();

            return (
              <Card
                key={item.id}
                className="hover-elevate cursor-pointer overflow-visible transition-transform duration-150"
                onClick={() => handleOpen(item.url)}
                data-testid={`history-item-${item.id}`}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {item.title || hostname}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {item.url}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(item.visitedAt)}
                    </span>
                    <Button size="icon" variant="ghost">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
