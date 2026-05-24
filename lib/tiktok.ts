import { normalizePost, Post } from "@/types/post";

const TIKTOK_BASE_URL = "https://open.tiktokapis.com/v2";

interface TikTokVideo {
  id: string;
  title?: string;
  create_time: number;
  share_url: string;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  view_count?: number;
}

export async function fetchTikTokPosts(): Promise<Post[]> {
  const token = process.env.TIKTOK_ACCESS_TOKEN;
  if (!token) throw new Error("TIKTOK_ACCESS_TOKEN not set");

  const url = `${TIKTOK_BASE_URL}/video/list/?fields=id,title,create_time,share_url,like_count,comment_count,share_count,view_count`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ max_count: 100 }),
  });

  if (!res.ok) throw new Error(`TikTok API error: ${res.status}`);
  const { data } = (await res.json()) as { data?: { videos?: TikTokVideo[] } };

  return (data?.videos ?? []).map((video) =>
    normalizePost({
      platform: "tiktok",
      post_id: video.id,
      caption: video.title,
      posted_at: new Date(video.create_time * 1000).toISOString(),
      views: video.view_count,
      // TikTok doesn't expose true reach — use view_count as an upper-bound proxy.
      reach: video.view_count,
      likes: video.like_count,
      comments: video.comment_count,
      shares: video.share_count,
      saves: 0,
      link: video.share_url,
    }),
  );
}
