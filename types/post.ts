export type Platform = "tiktok" | "instagram";

export interface Post {
  platform: Platform;
  post_id: string;
  caption: string;
  posted_at: string;
  views: number;
  /** TikTok: equals `views` — true reach is not exposed by the API. */
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  /** TikTok: always 0 — saves are not exposed by the API. */
  saves: number;
  link: string;
  synced_at?: string;
}

export interface Metrics {
  totalViews: number;
  avgReach: number;
  avgEngagementRate: number;
  totalPosts: number;
}

export interface MonthRef {
  year: number;
  month: number;
}

export interface RawPostFields {
  platform: Platform;
  post_id: string;
  caption?: string | null;
  posted_at: string;
  views?: number;
  reach?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  link?: string;
}

export function normalizePost(raw: RawPostFields): Post {
  return {
    platform: raw.platform,
    post_id: raw.post_id,
    caption: raw.caption ?? "",
    posted_at: raw.posted_at,
    views: raw.views ?? 0,
    reach: raw.reach ?? 0,
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    shares: raw.shares ?? 0,
    saves: raw.saves ?? 0,
    link: raw.link ?? "",
  };
}
