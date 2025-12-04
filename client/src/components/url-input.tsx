import { useState, useRef, useEffect } from "react";
import { Search, X, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
  recentSites?: string[];
}

const popularSites = [
  { name: "Poki", url: "https://poki.com" },
  { name: "CrazyGames", url: "https://www.crazygames.com" },
  { name: "Miniclip", url: "https://www.miniclip.com" },
  { name: "Armor Games", url: "https://armorgames.com" },
  { name: "Kongregate", url: "https://www.kongregate.com" },
];

export function UrlInput({ onSubmit, isLoading, recentSites = [] }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    let finalUrl = url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }
    onSubmit(finalUrl);
  };

  const handleQuickSite = (siteUrl: string) => {
    setUrl(siteUrl);
    onSubmit(siteUrl);
  };

  const clearInput = () => {
    setUrl("");
    inputRef.current?.focus();
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Enter a URL to browse through proxy..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-14 pl-12 pr-24 text-lg"
            data-testid="input-url"
            disabled={isLoading}
          />
          {url && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute right-14"
              onClick={clearInput}
              data-testid="button-clear-url"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="submit"
            size="icon"
            className="absolute right-2"
            disabled={!url.trim() || isLoading}
            data-testid="button-go"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowRight className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Quick access:</span>
        {popularSites.map((site) => (
          <Badge
            key={site.name}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => handleQuickSite(site.url)}
            data-testid={`badge-site-${site.name.toLowerCase().replace(/\s/g, "-")}`}
          >
            {site.name}
          </Badge>
        ))}
      </div>

      {recentSites.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Recent:</span>
          {recentSites.slice(0, 5).map((site, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer"
              onClick={() => handleQuickSite(site)}
              data-testid={`badge-recent-${index}`}
            >
              {new URL(site).hostname}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
