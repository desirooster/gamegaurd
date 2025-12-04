import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Sparkles, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GameCard } from "@/components/game-card";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { GameRecommendation } from "@shared/schema";

export default function Recommendations() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: recommendations, isLoading, error, refetch } = useQuery<GameRecommendation[]>({
    queryKey: ["/api/recommendations"],
    retry: false,
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/recommendations/refresh");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      toast({
        title: "Recommendations updated",
        description: "Fresh gaming suggestions just for you!",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Failed to refresh",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleOpen = (url: string) => {
    setLocation(`/?url=${encodeURIComponent(url)}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-4 overflow-auto p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    const isApiKeyMissing = error.message?.includes("API key") || error.message?.includes("OPENAI");

    return (
      <div className="flex h-full flex-col gap-4 p-4">
        <h1 className="font-rajdhani text-2xl font-bold">AI Recommendations</h1>
        
        <Card className="flex flex-1 flex-col items-center justify-center">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {isApiKeyMissing ? "OpenAI API Key Required" : "Failed to Load Recommendations"}
              </h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {isApiKeyMissing
                  ? "Please add your OpenAI API key to enable AI-powered game recommendations."
                  : error.message}
              </p>
            </div>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-rajdhani text-2xl font-bold">AI Recommendations</h1>
          <p className="text-sm text-muted-foreground">
            Personalized gaming suggestions based on your browsing history
          </p>
        </div>

        <Button
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
          data-testid="button-refresh-recommendations"
        >
          {refreshMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Get New Suggestions
        </Button>
      </div>

      {!recommendations || recommendations.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No recommendations yet"
          description="Browse some gaming sites first, then come back for personalized suggestions!"
          actionLabel="Start Browsing"
          onAction={() => setLocation("/")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recommendations.map((rec, index) => (
            <GameCard
              key={index}
              recommendation={rec}
              onOpen={handleOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}
