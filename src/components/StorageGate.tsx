import { useEffect, useState, type ReactNode } from 'react';
import { hydrateStorage } from '@/lib/idbStore';
import { Hotel } from 'lucide-react';

export function StorageGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hydrateStorage()
      .then(() => setReady(true))
      .catch((e) => setError(e?.message ?? 'Failed to load local database'));
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <p className="text-destructive font-medium">Storage error</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Hotel className="h-8 w-8 animate-pulse text-primary" />
          <p className="text-sm">Loading your data…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
