import { useCallback, useState } from "react";
import { useToasts } from "@/context/ToastContext";

export function useSync(onSynced) {
  const [syncing, setSyncing] = useState(false);
  const toasts = useToasts();

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toasts.error(data.error || "Sync failed");
      } else {
        toasts.success(data.message || "Sync complete");
        if (onSynced) await onSynced();
      }
    } catch (err) {
      toasts.error(err.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  }, [onSynced, toasts]);

  return { sync, syncing };
}
