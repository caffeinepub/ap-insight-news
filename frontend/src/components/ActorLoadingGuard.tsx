import React, { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import { Loader2, WifiOff, RefreshCw } from "lucide-react";

interface ActorLoadingGuardProps {
  children: React.ReactNode;
}

const TIMEOUT_MS = 15000;

export default function ActorLoadingGuard({ children }: ActorLoadingGuardProps) {
  const { actor, isFetching } = useActor();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isFetching) {
      setTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      setTimedOut(true);
    }, TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isFetching]);

  const handleRetry = () => {
    window.location.reload();
  };

  if (timedOut || (!isFetching && !actor)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center p-6">
          <WifiOff className="h-10 w-10 text-destructive" />
          <h2 className="text-lg font-semibold text-foreground">Unable to connect to backend</h2>
          <p className="text-sm text-muted-foreground">
            {timedOut
              ? "Connection is taking too long. Please check your network and try again."
              : "Could not reach the backend canister. Please check your connection and try again."}
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

  return <>{children}</>;
}
