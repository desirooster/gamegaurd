import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Shield, Search, Trash2, Filter, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogEntry } from "@/components/log-entry";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ProxyLog } from "@shared/schema";

export default function Logs() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "success" | "error">("all");

  const { data: logs = [], isLoading } = useQuery<ProxyLog[]>({
    queryKey: ["/api/logs"],
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/logs");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      toast({
        title: "Logs cleared",
        description: "All proxy logs have been removed",
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

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.url.toLowerCase().includes(search.toLowerCase());
    const isSuccess = log.status >= 200 && log.status < 400;
    const matchesFilter =
      filter === "all" ||
      (filter === "success" && isSuccess) ||
      (filter === "error" && !isSuccess);
    return matchesSearch && matchesFilter;
  });

  const successCount = logs.filter((l) => l.status >= 200 && l.status < 400).length;
  const errorCount = logs.filter((l) => l.status < 200 || l.status >= 400).length;

  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-rajdhani text-2xl font-bold">Proxy Logs</h1>
          <p className="text-sm text-muted-foreground">
            {logs.length} total requests ({successCount} successful, {errorCount} failed)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-logs"
            />
          </div>

          <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "success" | "error")}>
            <TabsList>
              <TabsTrigger value="all" data-testid="tab-all-logs">
                All
              </TabsTrigger>
              <TabsTrigger value="success" data-testid="tab-success">
                <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                Success
              </TabsTrigger>
              <TabsTrigger value="error" data-testid="tab-error">
                <XCircle className="mr-1 h-4 w-4 text-destructive" />
                Errors
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {logs.length > 0 && (
            <Button
              variant="outline"
              onClick={() => clearMutation.mutate()}
              disabled={clearMutation.isPending}
              data-testid="button-clear-logs"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <EmptyState
          icon={Shield}
          title={search || filter !== "all" ? "No matching logs" : "No proxy logs yet"}
          description={
            search || filter !== "all"
              ? "Try a different search or filter"
              : "Request logs will appear here as you browse"
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredLogs.map((log) => (
            <LogEntry key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}
