import { useMemo } from "react";
import { weekIndex } from "@/lib/formatting";

function computeMetrics(posts) {
  if (posts.length === 0) {
    return { totalViews: 0, avgReach: 0, avgEngagementRate: 0, totalPosts: 0 };
  }
  const totalViews = posts.reduce((s, p) => s + p.views, 0);
  const avgReach = Math.round(
    posts.reduce((s, p) => s + p.reach, 0) / posts.length,
  );
  const totalEngagement = posts.reduce(
    (s, p) => s + p.likes + p.comments + p.shares + p.saves,
    0,
  );
  const avgEngagementRate =
    totalViews > 0
      ? Number(((totalEngagement / totalViews) * 100).toFixed(2))
      : 0;
  return { totalViews, avgReach, avgEngagementRate, totalPosts: posts.length };
}

export function useMetrics(posts, prevPosts) {
  const metrics = useMemo(() => computeMetrics(posts), [posts]);
  const prevMetrics = useMemo(
    () => (prevPosts.length === 0 ? null : computeMetrics(prevPosts)),
    [prevPosts],
  );

  const weeklyData = useMemo(() => {
    const weeks = [0, 1, 2, 3].map((i) => ({
      week: `Week ${i + 1}`,
      tiktok: 0,
      instagram: 0,
    }));
    posts.forEach((p) => {
      const idx = weekIndex(new Date(p.posted_at).getDate());
      if (p.platform === "tiktok") weeks[idx].tiktok += p.views;
      else weeks[idx].instagram += p.views;
    });
    return weeks;
  }, [posts]);

  const engagementData = useMemo(() => {
    const tt = posts.filter((p) => p.platform === "tiktok");
    const ig = posts.filter((p) => p.platform === "instagram");
    const sum = (arr, key) => arr.reduce((s, p) => s + p[key], 0);
    return ["likes", "comments", "shares", "saves"].map((key) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      tiktok: sum(tt, key),
      instagram: sum(ig, key),
    }));
  }, [posts]);

  const platformSplit = useMemo(() => {
    const ttViews = posts
      .filter((p) => p.platform === "tiktok")
      .reduce((s, p) => s + p.views, 0);
    const igViews = posts
      .filter((p) => p.platform === "instagram")
      .reduce((s, p) => s + p.views, 0);
    return [
      { name: "TikTok", value: ttViews },
      { name: "Instagram", value: igViews },
    ];
  }, [posts]);

  const topPosts = useMemo(
    () => [...posts].sort((a, b) => b.views - a.views).slice(0, 5),
    [posts],
  );

  return {
    metrics,
    prevMetrics,
    weeklyData,
    engagementData,
    platformSplit,
    topPosts,
  };
}
