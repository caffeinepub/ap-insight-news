import { Loader2, WifiOff } from 'lucide-react';
import { useActor } from '../hooks/useActor';
import { Button } from '@/components/ui/button';

interface ActorLoadingGuardProps {
  children: React.ReactNode;
}

export default function ActorLoadingGuard({ children }: ActorLoadingGuardProps) {
  const { actor, isFetching } = useActor();

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-sans text-sm">Connecting to backend…</p>
      </div>
    );
  }

  if (!actor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
        <WifiOff className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-bold text-foreground">Unable to connect to backend</h2>
        <p className="text-muted-foreground font-sans text-sm max-w-sm">
          The backend service could not be reached. Please check your connection and try again.
        </p>
        <Button onClick={() => window.location.reload()} variant="default">
          Retry
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
