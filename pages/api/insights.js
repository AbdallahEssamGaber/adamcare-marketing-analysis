import OpenAI from "openai";
import { requireSession } from "@/lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!requireSession(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { posts, metrics, month, year } = req.body;

  if (!posts || !metrics) {
    return res.status(400).json({ error: "Missing posts or metrics data" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: "OPENAI_API_KEY not configured" });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const postList = posts
    .map(
      (p) =>
        `- [${p.platform}] "${p.caption}" — Views: ${p.views}, Reach: ${p.reach}, Likes: ${p.likes}, Comments: ${p.comments}, Shares: ${p.shares}, Saves: ${p.saves}`,
    )
    .join("\n");

  const prompt = `You are a social media analytics expert analyzing content performance for foradam.care, a skincare brand.

Here is the data for ${month} ${year}:

Total Views: ${metrics.totalViews}
Average Reach per Post: ${metrics.avgReach}
Average Engagement Rate: ${metrics.avgEngagementRate}%
Total Posts: ${metrics.totalPosts}

Posts:
${postList}

Respond in exactly 3 paragraphs:
1. Overall summary of the month's performance
2. Why the top content worked — be specific about formats, hooks, and topics
3. What to repeat and what to avoid going forward

Be direct, specific, and actionable. No bullet points. Reference specific posts by name when possible.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    const insights = completion.choices[0].message.content;
    return res.status(200).json({ insights });
  } catch (err) {
    console.error("OpenAI error:", err);
    return res
      .status(500)
      .json({ error: "Failed to generate insights", details: err.message });
  }
}
