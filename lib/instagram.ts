import { supabase } from "@/lib/supabase";
import { normalizePost, Post } from "@/types/post";

const BASE = "https://graph.facebook.com/v21.0";

async function getToken(): Promise<string> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "instagram_access_token")
    .single();

  if (error || !data?.value) {
    throw new Error("Could not read Instagram token from Supabase settings");
  }
  return data.value as string;
}

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: string;
  timestamp: string;
  permalink: string;
  like_count?: number;
  comments_count?: number;
}

interface InsightValues {
  views?: number;
  reach?: number;
  shares?: number;
  saved?: number;
}

async function fetchInsights(
  mediaId: string,
  token: string,
): Promise<InsightValues> {
  const metrics = "views,reach,shares,saved";
  const url = `${BASE}/${mediaId}/insights?metric=${metrics}&access_token=${token}`;

  try {
    const res = await fetch(url);
    const json = (await res.json()) as {
      data?: Array<{ name: string; value?: number; values?: Array<{ value: number }> }>;
    };
    if (!res.ok || !json.data) return {};
    const result: Record<string, number> = {};
    for (const metric of json.data) {
      result[metric.name] = metric.value ?? metric.values?.[0]?.value ?? 0;
    }
    return result as InsightValues;
  } catch {
    return {};
  }
}

export async function fetchInstagramPosts(): Promise<Post[]> {
  const token = await getToken();
  const igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  if (!igId) throw new Error("INSTAGRAM_BUSINESS_ACCOUNT_ID not set");

  const fields =
    "id,caption,media_type,timestamp,permalink,like_count,comments_count";
  const url = `${BASE}/${igId}/media?fields=${fields}&limit=100&access_token=${token}`;

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(
      `Instagram API error: ${res.status} — ${JSON.stringify(err)}`,
    );
  }
  const { data } = (await res.json()) as { data: InstagramMedia[] };

  const videos = data.filter(
    (p) => p.media_type === "VIDEO" || p.media_type === "REEL",
  );

  const posts = await Promise.all(
    videos.map(async (post) => {
      const insights = await fetchInsights(post.id, token);
      return normalizePost({
        platform: "instagram",
        post_id: post.id,
        caption: post.caption,
        posted_at: post.timestamp,
        views: insights.views,
        reach: insights.reach,
        likes: post.like_count,
        comments: post.comments_count,
        shares: insights.shares,
        saves: insights.saved,
        link: post.permalink,
      });
    }),
  );

  return posts;
}
