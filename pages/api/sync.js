import { fetchInstagramPosts } from "@/lib/instagram";
import { supabase } from "@/lib/supabase";
import { fetchTikTokPosts } from "@/lib/tiktok";
import { requireSession } from "@/lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!requireSession(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!supabase) {
    return res
      .status(503)
      .json({ error: "Supabase not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing)" });
  }

  try {
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
