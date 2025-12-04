import { Settings as SettingsIcon, Moon, Sun, Monitor, Shield, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/lib/theme";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const clearAllDataMutation = useMutation({
    mutationFn: async () => {
      await Promise.all([
        apiRequest("DELETE", "/api/history"),
        apiRequest("DELETE", "/api/logs"),
        apiRequest("DELETE", "/api/sites/all"),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({
        title: "Data cleared",
        description: "All your data has been removed",
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

  return (
    <div className="flex h-full flex-col gap-6 overflow-auto p-4">
      <div>
        <h1 className="font-rajdhani text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your preferences and data
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how GameProxy looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                data-testid="switch-dark-mode"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy
            </CardTitle>
            <CardDescription>
              Manage your browsing data and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Clear All Data</Label>
                <p className="text-sm text-muted-foreground">
                  Remove all saved sites, history, and logs
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => clearAllDataMutation.mutate()}
                disabled={clearAllDataMutation.isPending}
                data-testid="button-clear-all-data"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              About GameProxy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Version</Label>
                <p className="font-medium">1.0.0</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Features</Label>
                <p className="font-medium">Web Proxy, AI Recommendations, Game Library</p>
              </div>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">
              GameProxy provides secure access to gaming websites through a proxy server,
              with AI-powered recommendations to help you discover new games. Your browsing
              is private and your data stays on your device.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
