import { useState, useEffect } from "react";
import { 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  ArrowLeft, 
  ArrowRight, 
  Home,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProxyViewerProps {
  url: string | null;
  content: string | null;
  isLoading: boolean;
  error: string | null;
  isSaved?: boolean;
  onRefresh: () => void;
  onBack: () => void;
  onForward: () => void;
  onHome: () => void;
  onSave: () => void;
  onFullscreen: () => void;
  onNavigate?: (url: string) => void;
  isFullscreen?: boolean;
}

export function ProxyViewer({
  url,
  content,
  isLoading,
  error,
  isSaved = false,
  onRefresh,
  onBack,
  onForward,
  onHome,
  onSave,
  onFullscreen,
  onNavigate,
  isFullscreen = false,
}: ProxyViewerProps) {
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'proxy-navigate' && event.data?.url && onNavigate) {
        onNavigate(event.data.url);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onNavigate]);

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
    onRefresh();
  };

  if (!url && !isLoading) {
    return (
      <Card className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <ExternalLink className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold">No Site Loaded</h3>
          <p className="mt-2 text-muted-foreground">
            Enter a URL above to browse through the proxy
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b p-2">
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={onBack}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onForward}
            data-testid="button-forward"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isLoading}
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onHome}
            data-testid="button-home"
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md bg-muted px-3 py-1.5">
          <span className="truncate text-sm text-muted-foreground">
            {url || "No URL"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={onSave}
            data-testid="button-save"
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onFullscreen}
            data-testid="button-fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden bg-background">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading content...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Failed to Load</h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  {error}
                </p>
              </div>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {content && !error && (
          <iframe
            key={iframeKey}
            srcDoc={content}
            className="h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            title="Proxied Content"
            data-testid="iframe-proxy"
          />
        )}

        {!content && !isLoading && !error && url && (
          <div className="flex h-full items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        )}
      </div>
    </Card>
  );
}
