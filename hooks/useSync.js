import { useCallback, useState } from "react";

export function useSync(onSynced) {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");

  const sync = useCallback(async () => {
    setSyncing(true);
    setMessage("");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Sync failed");
      } else {
        setMessage(data.message || "Sync complete");
        if (onSynced) await onSynced();
      }
    } catch (err) {
      setMessage(err.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  }, [onSynced]);

  return { sync, syncing, message };
}
