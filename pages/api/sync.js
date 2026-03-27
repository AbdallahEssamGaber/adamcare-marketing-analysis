import { supabase } from '@/lib/supabase';
import { fetchInstagramPosts } from '@/lib/instagram';
import { fetchTikTokPosts } from '@/lib/tiktok';
import { MOCK_POSTS } from '@/lib/mockData';

const USE_MOCK = !process.env.SUPABASE_URL || process.env.SUPABASE_URL === 'https://your-project.supabase.co';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check secret key
  const { key } = req.body;
  if (key !== process.env.SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
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
        console.error('Instagram fetch failed:', err.message);
        return [];
      }),
      fetchTikTokPosts().catch((err) => {
        console.error('TikTok fetch failed:', err.message);
        return [];
      }),
    ]);

    const allPosts = [...instagramPosts, ...tiktokPosts];

    if (allPosts.length === 0) {
      return res.status(200).json({
        success: true,
        synced: 0,
        message: 'No posts fetched from either platform',
      });
    }

    // Upsert into Supabase
    const { error } = await supabase.from('posts').upsert(
      allPosts.map((p) => ({
        ...p,
        synced_at: new Date().toISOString(),
      })),
      { onConflict: 'post_id,platform' }
    );

    if (error) throw error;

    return res.status(200).json({
      success: true,
      synced: allPosts.length,
      message: `Synced ${instagramPosts.length} Instagram + ${tiktokPosts.length} TikTok posts`,
    });
  } catch (err) {
    console.error('Sync error:', err);
    return res.status(500).json({ error: 'Sync failed', details: err.message });
  }
}
