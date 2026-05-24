import { supabase } from "@/lib/supabase";
import { requireSession } from "@/lib/auth";

export default async function handler(req, res) {
  if (req.method !== "GET") {
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
    const { data: allPosts, error: allError } = await supabase
      .from("posts")
      .select("posted_at")
      .order("posted_at", { ascending: false });

    if (allError) throw allError;

    const monthSet = new Set();
    for (const p of allPosts) {
      const d = new Date(p.posted_at);
      monthSet.add(`${d.getFullYear()}-${d.getMonth() + 1}`);
    }
    const availableMonths = Array.from(monthSet)
      .map((m) => {
        const [year, month] = m.split("-").map(Number);
        return { year, month };
      })
      .sort((a, b) => b.year - a.year || b.month - a.month);

    const { year, month } = req.query;
    if (year && month) {
      const start = new Date(Number(year), Number(month) - 1, 1).toISOString();
      const end = new Date(Number(year), Number(month), 1).toISOString();

      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select("*")
        .gte("posted_at", start)
        .lt("posted_at", end)
        .order("posted_at", { ascending: false });

      if (postsError) throw postsError;

      return res.status(200).json({ posts, availableMonths });
    }

    return res.status(200).json({ posts: [], availableMonths });
  } catch (err) {
    console.error("Posts fetch error:", err);
    return res
      .status(500)
      .json({ error: "Failed to fetch posts", details: err.message });
  }
}
