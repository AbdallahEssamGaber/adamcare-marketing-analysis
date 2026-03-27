const TIKTOK_BASE_URL = 'https://open.tiktokapis.com/v2';

export async function fetchTikTokPosts() {
  const token = process.env.TIKTOK_ACCESS_TOKEN;
  if (!token) throw new Error('TIKTOK_ACCESS_TOKEN not set');

  const url = `${TIKTOK_BASE_URL}/video/list/?fields=id,title,create_time,share_url,like_count,comment_count,share_count,view_count`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ max_count: 100 }),
  });

  if (!res.ok) throw new Error(`TikTok API error: ${res.status}`);
  const { data } = await res.json();

  const posts = (data?.videos || []).map((video) => ({
    platform: 'tiktok',
    post_id: video.id,
    caption: video.title || '',
    posted_at: new Date(video.create_time * 1000).toISOString(),
    views: video.view_count || 0,
    reach: video.view_count || 0,
    likes: video.like_count || 0,
    comments: video.comment_count || 0,
    shares: video.share_count || 0,
    saves: 0,
    link: video.share_url,
  }));

  return posts;
}
