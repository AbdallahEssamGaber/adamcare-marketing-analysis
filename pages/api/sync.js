import { fetchInstagramPosts } from "@/lib/instagram";
import { MOCK_POSTS } from "@/lib/mockData";
import { supabase } from "@/lib/supabase";
import { fetchTikTokPosts } from "@/lib/tiktok";

const USE_MOCK =
  !process.env.NEXT_PUBLIC_SECRET_KEY ||
  process.env.NEXT_PUBLIC_SECRET_KEY === "https://your-project.supabase.co";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  await refreshInstagramToken();

  // Check secret key
  const { key } = req.body;
  if (key !== process.env.SECRET_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Mock mode — return mock data directly
  if (USE_MOCK) {
    return res.status(200).json({
      success: true,
      mock: true,
      synced: MOCK_POSTS.length,
      message: `Mock mode: ${MOCK_POSTS.length} posts available`,
    });
  }

  try {
    // Fetch from both platforms in parallel
    const [instagramPosts, tiktokPosts] = await Promise.all([
      fetchInstagramPosts().catch((err) => {
        console.error("Instagram fetch failed:", err.message);
        return [];
      }),
      fetchTikTokPosts().catch((err) => {
        console.error("TikTok fetch failed:", err.message);
        return [];
      }),
    ]);

    const allPosts = [...instagramPosts, ...tiktokPosts];

    if (allPosts.length === 0) {
      return res.status(200).json({
        success: true,
        synced: 0,
        message: "No posts fetched from either platform",
      });
    }

    // Upsert into Supabase
    const { error } = await supabase.from("posts").upsert(
      allPosts.map((p) => ({
        ...p,
        synced_at: new Date().toISOString(),
      })),
      { onConflict: "post_id,platform" },
    );

    if (error) throw error;

    return res.status(200).json({
      success: true,
      synced: allPosts.length,
      message: `Synced ${instagramPosts.length} Instagram + ${tiktokPosts.length} TikTok posts`,
    });
  } catch (err) {
    console.error("Sync error:", err);
    return res.status(500).json({ error: "Sync failed", details: err.message });
  }
}

async function refreshInstagramToken() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const url = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&fb_exchange_token=${token}`;

  const res = await fetch(url);
  const json = await res.json();

  if (json.access_token) {
    // Log it so you can update .env manually if needed
    console.log("Refreshed IG token:", json.access_token.slice(0, 20) + "...");
    // Update in-memory for this request
    process.env.INSTAGRAM_ACCESS_TOKEN = json.access_token;
  }
}
