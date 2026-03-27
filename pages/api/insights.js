import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { posts, metrics, month, year } = req.body;

  if (!posts || !metrics) {
    return res.status(400).json({ error: 'Missing posts or metrics data' });
  }

  // Mock mode — return mock insights if no API key
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-key') {
    return res.status(200).json({
      insights: `Overall, ${month} ${year} was a solid month for foradam.care across both platforms. TikTok drove the majority of views with ${metrics.totalViews.toLocaleString()} total views across ${metrics.totalPosts} posts, while Instagram maintained strong engagement through saves and shares. The average engagement rate of ${metrics.avgEngagementRate}% shows healthy audience interaction, with reach averaging ${metrics.avgReach.toLocaleString()} per post.\n\nThe top-performing content leaned heavily into relatable, problem-solution formats — posts like "Morning skincare routine that changed everything" and "POV: You finally found the right moisturizer" resonated because they tap into the audience's desire for simple, effective solutions. Short-form video with a strong hook in the first 2 seconds consistently outperformed longer or more educational content. Instagram Reels that showed real results or behind-the-scenes moments drove significantly more saves, indicating high purchase intent.\n\nTo repeat this success, keep leading with transformation narratives and specific product callouts rather than generic tips. Avoid overly polished or ad-like content — the data clearly shows that authentic, casual formats perform 2-3x better. Consider doubling down on TikTok reply videos and Instagram carousels with before/after comparisons, as these formats showed the highest share rates this month.`,
    });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const postList = posts
    .map(
      (p) =>
        `- [${p.platform}] "${p.caption}" — Views: ${p.views}, Reach: ${p.reach}, Likes: ${p.likes}, Comments: ${p.comments}, Shares: ${p.shares}, Saves: ${p.saves}`
    )
    .join('\n');

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
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    const insights = completion.choices[0].message.content;
    return res.status(200).json({ insights });
  } catch (err) {
    console.error('OpenAI error:', err);
    return res.status(500).json({ error: 'Failed to generate insights', details: err.message });
  }
}
