import { useCallback, useState } from "react";
import { MONTH_NAMES } from "@/lib/constants";

export function useInsights() {
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = useCallback(async ({ posts, metrics, selectedMonth }) => {
    setLoading(true);
    setError("");
    setInsights("");
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posts,
          metrics,
          month: selectedMonth ? MONTH_NAMES[selectedMonth.month] : "",
          year: selectedMonth?.year,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate insights");
      } else {
        setInsights(data.insights || "No insights generated.");
      }
    } catch (err) {
      setError(err.message || "Failed to generate insights");
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => setInsights(""), []);

  return { insights, loading, error, generate, clear };
}
