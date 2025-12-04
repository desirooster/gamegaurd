import { Shield, ShieldCheck, ShieldAlert, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProxyStatusProps {
  isConnected: boolean;
  isSecure?: boolean;
  responseTime?: number;
}

export function ProxyStatus({ isConnected, isSecure = true, responseTime }: ProxyStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={isConnected ? "default" : "destructive"}
        className="flex items-center gap-1.5"
      >
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3" />
            <span>Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span>Disconnected</span>
          </>
        )}
      </Badge>

      {isConnected && (
        <Badge
          variant={isSecure ? "secondary" : "outline"}
          className="flex items-center gap-1.5"
        >
          {isSecure ? (
            <>
              <ShieldCheck className="h-3 w-3 text-green-500" />
              <span>Secure</span>
            </>
          ) : (
            <>
              <ShieldAlert className="h-3 w-3 text-yellow-500" />
              <span>Not Secure</span>
            </>
          )}
        </Badge>
      )}

      {responseTime !== undefined && responseTime > 0 && (
        <Badge variant="outline" className="text-xs">
          {responseTime}ms
        </Badge>
      )}
    </div>
  );
}
