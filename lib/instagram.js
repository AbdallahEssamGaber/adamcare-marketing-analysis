import { supabase } from "@/lib/supabase";

const BASE = "https://graph.facebook.com/v21.0";

async function getAndRefreshToken() {
  // Get current token from Supabase
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "instagram_access_token")
    .single();

  if (error || !data)
    throw new Error("Could not read Instagram token from Supabase");
  const token = data.value;

  // Refresh it
  const url = `${BASE}/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&fb_exchange_token=${token}`;
  const res = await fetch(url);
  const json = await res.json();

  if (json.access_token) {
    // Save refreshed token back to Supabase
    await supabase
      .from("settings")
      .update({
        value: json.access_token,
        updated_at: new Date().toISOString(),
      })
      .eq("key", "instagram_access_token");
    return json.access_token;
  }

  // If refresh failed, use existing token
  return token;
}

export async function fetchInstagramPosts() {
  const token = await getAndRefreshToken();
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
  const { data } = await res.json();

  const videos = data.filter(
    (p) => p.media_type === "VIDEO" || p.media_type === "REEL",
  );

  const posts = await Promise.all(
    videos.map(async (post) => {
      const insights = await fetchInsights(post.id, token);
      return {
        platform: "instagram",
        post_id: post.id,
        caption: post.caption || "",
        posted_at: post.timestamp,
        views: insights.views || 0,
        reach: insights.reach || 0,
        likes: post.like_count || 0,
        comments: post.comments_count || 0,
        shares: insights.shares || 0,
        saves: insights.saved || 0,
        link: post.permalink,
      };
    }),
  );

  return posts;
}

async function fetchInsights(mediaId, token) {
  const metrics = "views,reach,shares,saved";
  const url = `${BASE}/${mediaId}/insights?metric=${metrics}&access_token=${token}`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) return {};
    const result = {};
    for (const metric of json.data) {
      result[metric.name] = metric.value ?? metric.values?.[0]?.value ?? 0;
    }
    return result;
  } catch {
    return {};
  }
}
