import React from "react";
import { useActor } from "../hooks/useActor";
import { Loader2, WifiOff, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface ActorLoadingGuardProps {
  children: React.ReactNode;
}

export default function ActorLoadingGuard({ children }: ActorLoadingGuardProps) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ["actor"] });
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Connecting to backend…</p>
        </div>
      </div>
    );
  }

  if (!actor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center p-6">
          <WifiOff className="h-10 w-10 text-destructive" />
          <h2 className="text-lg font-semibold text-foreground">Unable to connect to backend</h2>
          <p className="text-sm text-muted-foreground">
            Could not reach the backend canister. Please check your connection and try again.
          </p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
