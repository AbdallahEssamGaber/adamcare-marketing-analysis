const INSTAGRAM_BASE_URL = 'https://graph.instagram.com/v18.0';

export async function fetchInstagramPosts() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) throw new Error('INSTAGRAM_ACCESS_TOKEN not set');

  const fields = 'id,caption,media_type,timestamp,permalink';
  const url = `${INSTAGRAM_BASE_URL}/me/media?fields=${fields}&access_token=${token}&limit=100`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Instagram API error: ${res.status}`);
  const { data } = await res.json();

  // Filter to VIDEO and REEL only
  const videos = data.filter((p) => p.media_type === 'VIDEO' || p.media_type === 'REEL');

  // Fetch insights for each video
  const posts = await Promise.all(
    videos.map(async (post) => {
      const insights = await fetchInsights(post.id, token);
      return {
        platform: 'instagram',
        post_id: post.id,
        caption: post.caption || '',
        posted_at: post.timestamp,
        views: insights.plays || insights.impressions || 0,
        reach: insights.reach || 0,
        likes: insights.likes || 0,
        comments: insights.comments || 0,
        shares: insights.shares || 0,
        saves: insights.saved || 0,
        link: post.permalink,
      };
    })
  );

  return posts;
}

async function fetchInsights(mediaId, token) {
  const metrics = 'impressions,reach,likes,comments,shares,saved,plays';
  const url = `${INSTAGRAM_BASE_URL}/${mediaId}/insights?metric=${metrics}&access_token=${token}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return {};
    const { data } = await res.json();
    const result = {};
    for (const metric of data) {
      result[metric.name] = metric.values?.[0]?.value || 0;
    }
    return result;
  } catch {
    return {};
  }
}
