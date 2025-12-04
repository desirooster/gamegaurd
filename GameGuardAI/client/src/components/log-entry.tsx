import { CheckCircle, XCircle, Clock, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProxyLog } from "@shared/schema";

interface LogEntryProps {
  log: ProxyLog;
}

export function LogEntry({ log }: LogEntryProps) {
  const isSuccess = log.status >= 200 && log.status < 400;
  const hostname = (() => {
    try {
      return new URL(log.url).hostname;
    } catch {
      return log.url;
    }
  })();

  const formatTime = (date: Date | string | null) => {
    if (!date) return "Unknown";
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div className="flex items-center gap-4 rounded-md border p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
        {isSuccess ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-destructive" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="truncate font-medium">{hostname}</span>
        </div>
        <p className="truncate text-sm text-muted-foreground">{log.url}</p>
        {log.error && (
          <p className="mt-1 text-xs text-destructive">{log.error}</p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <Badge variant={isSuccess ? "secondary" : "destructive"}>
          {log.status}
        </Badge>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatTime(log.timestamp)}</span>
        </div>
        {log.responseTime && (
          <span className="text-xs text-muted-foreground">
            {log.responseTime}ms
          </span>
        )}
      </div>
    </div>
  );
}
