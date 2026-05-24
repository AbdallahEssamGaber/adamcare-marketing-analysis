import { useCallback, useEffect, useState } from "react";
import { previousMonth } from "@/lib/formatting";

export function usePosts(enabled) {
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [posts, setPosts] = useState([]);
  const [prevPosts, setPrevPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const loadMonths = useCallback(async () => {
    const res = await fetch("/api/posts");
    const { availableMonths: months } = await res.json();
    setAvailableMonths(months || []);
    if (months && months.length > 0) {
      setSelectedMonth((curr) => curr ?? months[0]);
    }
    return months || [];
  }, []);

  useEffect(() => {
    if (!enabled) return;
    loadMonths().catch(() => {});
  }, [enabled, loadMonths]);

  useEffect(() => {
    if (!selectedMonth) return;
    setPostsLoading(true);
    fetch(`/api/posts?year=${selectedMonth.year}&month=${selectedMonth.month}`)
      .then((r) => r.json())
      .then(({ posts }) => setPosts(posts || []))
      .catch(() => setPosts([]))
      .finally(() => setPostsLoading(false));
  }, [selectedMonth]);

  useEffect(() => {
    if (!selectedMonth) return;
    const { year, month } = previousMonth(selectedMonth);
    fetch(`/api/posts?year=${year}&month=${month}`)
      .then((r) => r.json())
      .then(({ posts }) => setPrevPosts(posts || []))
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
