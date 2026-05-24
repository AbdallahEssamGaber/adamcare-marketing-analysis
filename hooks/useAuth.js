import { useCallback, useEffect, useState } from "react";

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then(({ authenticated }) => setAuthenticated(!!authenticated))
      .catch(() => setAuthenticated(false))
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (key) => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.error || "Invalid key" };
    }
    setAuthenticated(true);
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/logout", { method: "POST" });
    setAuthenticated(false);
  }, []);

  return { authenticated, checking, login, logout };
}
