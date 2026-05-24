import { useCallback, useEffect, useState } from "react";
import { useToasts } from "@/context/ToastContext";
import { previousMonth } from "@/lib/formatting";

export function usePosts(enabled) {
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [posts, setPosts] = useState([]);
  const [prevPosts, setPrevPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const toasts = useToasts();

  const loadMonths = useCallback(async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (!res.ok) {
        toasts.error(data.error || "Failed to load months");
        return [];
      }
      const months = data.availableMonths || [];
      setAvailableMonths(months);
      if (months.length > 0) {
        setSelectedMonth((curr) => curr ?? months[0]);
      }
      return months;
    } catch (err) {
      toasts.error(err.message || "Failed to load months");
      return [];
    }
  }, [toasts]);

  useEffect(() => {
    if (!enabled) return;
    loadMonths();
  }, [enabled, loadMonths]);

  useEffect(() => {
    if (!selectedMonth) return;
    setPostsLoading(true);
    fetch(`/api/posts?year=${selectedMonth.year}&month=${selectedMonth.month}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          toasts.error(data.error || "Failed to load posts");
          setPosts([]);
        } else {
          setPosts(data.posts || []);
        }
      })
      .catch((err) => {
        toasts.error(err.message || "Failed to load posts");
        setPosts([]);
      })
      .finally(() => setPostsLoading(false));
  }, [selectedMonth, toasts]);

  useEffect(() => {
    if (!selectedMonth) return;
    const { year, month } = previousMonth(selectedMonth);
    fetch(`/api/posts?year=${year}&month=${month}`)
      .then(async (r) => {
        if (!r.ok) {
          setPrevPosts([]);
          return;
        }
        const { posts } = await r.json();
        setPrevPosts(posts || []);
      })
      .catch(() => setPrevPosts([]));
  }, [selectedMonth]);

  return {
    availableMonths,
    selectedMonth,
    setSelectedMonth,
    posts,
    prevPosts,
    postsLoading,
    refresh: loadMonths,
  };
}
