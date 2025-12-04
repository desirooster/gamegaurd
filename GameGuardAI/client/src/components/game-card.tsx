import { ExternalLink, Star, Trash2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SavedSite, GameRecommendation } from "@shared/schema";

interface GameCardProps {
  site?: SavedSite;
  recommendation?: GameRecommendation;
  onOpen: (url: string) => void;
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function GameCard({
  site,
  recommendation,
  onOpen,
  onToggleFavorite,
  onDelete,
}: GameCardProps) {
  if (recommendation) {
    return (
      <Card className="group hover-elevate overflow-visible transition-transform duration-150">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold">{recommendation.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {recommendation.description}
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {recommendation.genre}
            </Badge>
          </div>

          <p className="mt-3 text-xs text-muted-foreground italic">
            "{recommendation.reason}"
          </p>

          <Button
            className="mt-4 w-full"
            onClick={() => onOpen(recommendation.url)}
            data-testid={`button-open-${recommendation.title.toLowerCase().replace(/\s/g, "-")}`}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Visit Site
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (site) {
    const hostname = new URL(site.url).hostname;

    return (
      <Card className="group hover-elevate overflow-visible transition-transform duration-150">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
              {site.favicon ? (
                <img
                  src={site.favicon}
                  alt=""
                  className="h-8 w-8"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <span className="text-lg font-bold text-muted-foreground">
                  {site.title.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold">{site.title}</h3>
              <p className="truncate text-sm text-muted-foreground">
                {hostname}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {site.visitCount} visit{site.visitCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {site.category && (
              <Badge variant="outline" className="shrink-0">
                {site.category}
              </Badge>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button
              className="flex-1"
              onClick={() => onOpen(site.url)}
              data-testid={`button-open-site-${site.id}`}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open
            </Button>

            {onToggleFavorite && (
              <Button
                size="icon"
                variant={site.isFavorite ? "default" : "outline"}
                onClick={() => onToggleFavorite(site.id)}
                data-testid={`button-favorite-${site.id}`}
              >
                <Star
                  className={`h-4 w-4 ${site.isFavorite ? "fill-current" : ""}`}
                />
              </Button>
            )}

            {onDelete && (
              <Button
                size="icon"
                variant="outline"
                onClick={() => onDelete(site.id)}
                data-testid={`button-delete-${site.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
