// Mock data for development — 3 months of TikTok + Instagram posts

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const tiktokCaptions = [
  'Morning skincare routine that changed everything',
  'Why this serum is going viral right now',
  'POV: You finally found the right moisturizer',
  'Replying to @user — here\'s my full routine',
  'The product I wish I knew about sooner',
  '3 mistakes you\'re making with your skincare',
  'Dermatologist reacts to my routine',
  'This $12 product replaced my $80 one',
  'Night routine for glowing skin',
  'How I cleared my skin in 30 days',
  'Skin barrier repair — what actually works',
  'Sunscreen myths debunked',
  'The ordinary vs expensive dupes',
  'My holy grail products for 2026',
  'Acne scars fading routine that works',
];

const instagramCaptions = [
  'New drop alert — our hydrating serum is here ✨',
  'Your skin deserves better. Link in bio.',
  'Behind the scenes of our latest shoot',
  'Real results from real people — swipe to see',
  'Sunday reset skincare edition',
  'Meet the ingredient: Niacinamide',
  'Before & after — 4 weeks with our cleanser',
  'Giveaway time! Details below 👇',
  'How to layer your products correctly',
  'Our founder shares her evening routine',
  'SPF is non-negotiable — here\'s why',
  'New packaging, same amazing formula',
  'Your questions answered — skincare Q&A',
  'The science behind our best seller',
  'Weekend vibes with our new body care line',
];

function generatePosts(month, year) {
  const posts = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  // Generate 8-12 TikTok posts per month
  const tiktokCount = randomInt(8, 12);
  for (let i = 0; i < tiktokCount; i++) {
    const day = randomInt(1, daysInMonth);
    const hour = randomInt(8, 20);
    posts.push({
      id: `mock-tt-${year}-${month}-${i}`,
      platform: 'tiktok',
      post_id: `tt_${year}${month}${i}`,
      caption: tiktokCaptions[i % tiktokCaptions.length],
      posted_at: new Date(year, month - 1, day, hour, 0, 0).toISOString(),
      views: randomInt(5000, 150000),
      reach: randomInt(3000, 100000),
      likes: randomInt(200, 8000),
      comments: randomInt(10, 500),
      shares: randomInt(5, 300),
      saves: 0,
      link: `https://www.tiktok.com/@foradamcare/video/${year}${month}${i}`,
      synced_at: new Date().toISOString(),
    });
  }

  // Generate 6-10 Instagram posts per month
  const igCount = randomInt(6, 10);
  for (let i = 0; i < igCount; i++) {
    const day = randomInt(1, daysInMonth);
    const hour = randomInt(9, 19);
    posts.push({
      id: `mock-ig-${year}-${month}-${i}`,
      platform: 'instagram',
      post_id: `ig_${year}${month}${i}`,
      caption: instagramCaptions[i % instagramCaptions.length],
      posted_at: new Date(year, month - 1, day, hour, 0, 0).toISOString(),
      views: randomInt(3000, 80000),
      reach: randomInt(2000, 60000),
      likes: randomInt(100, 5000),
      comments: randomInt(5, 300),
      shares: randomInt(2, 150),
      saves: randomInt(10, 400),
      link: `https://www.instagram.com/reel/mock_${year}${month}${i}`,
      synced_at: new Date().toISOString(),
    });
  }

  return posts;
}

// Seed with deterministic data using a fixed seed approach
let seed = 42;
function seededRandom() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

function seededInt(min, max) {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
}

// Generate 3 months of data with seeded randomness
function generateAllMockData() {
  seed = 42; // Reset seed for consistency
  const allPosts = [];
  const months = [
    { month: 1, year: 2026 },
    { month: 2, year: 2026 },
    { month: 3, year: 2026 },
  ];

  for (const { month, year } of months) {
    const daysInMonth = new Date(year, month, 0).getDate();

    const tiktokCount = seededInt(8, 12);
    for (let i = 0; i < tiktokCount; i++) {
      const day = seededInt(1, daysInMonth);
      const hour = seededInt(8, 20);
      allPosts.push({
        id: `mock-tt-${year}-${month}-${i}`,
        platform: 'tiktok',
        post_id: `tt_${year}${month}${i}`,
        caption: tiktokCaptions[i % tiktokCaptions.length],
        posted_at: new Date(year, month - 1, day, hour, 0, 0).toISOString(),
        views: seededInt(5000, 150000),
        reach: seededInt(3000, 100000),
        likes: seededInt(200, 8000),
        comments: seededInt(10, 500),
        shares: seededInt(5, 300),
        saves: 0,
        link: `https://www.tiktok.com/@foradamcare/video/${year}${month}${i}`,
        synced_at: new Date().toISOString(),
      });
    }

    const igCount = seededInt(6, 10);
    for (let i = 0; i < igCount; i++) {
      const day = seededInt(1, daysInMonth);
      const hour = seededInt(9, 19);
      allPosts.push({
        id: `mock-ig-${year}-${month}-${i}`,
        platform: 'instagram',
        post_id: `ig_${year}${month}${i}`,
        caption: instagramCaptions[i % instagramCaptions.length],
        posted_at: new Date(year, month - 1, day, hour, 0, 0).toISOString(),
        views: seededInt(3000, 80000),
        reach: seededInt(2000, 60000),
        likes: seededInt(100, 5000),
        comments: seededInt(5, 300),
        shares: seededInt(2, 150),
        saves: seededInt(10, 400),
        link: `https://www.instagram.com/reel/mock_${year}${month}${i}`,
        synced_at: new Date().toISOString(),
      });
    }
  }

  return allPosts;
}

export const MOCK_POSTS = generateAllMockData();

export function getMockPostsByMonth(year, month) {
  return MOCK_POSTS.filter((p) => {
    const d = new Date(p.posted_at);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });
}

export function getAvailableMockMonths() {
  const months = new Set();
  for (const p of MOCK_POSTS) {
    const d = new Date(p.posted_at);
    months.add(`${d.getFullYear()}-${d.getMonth() + 1}`);
  }
  return Array.from(months)
    .map((m) => {
      const [year, month] = m.split('-').map(Number);
      return { year, month };
    })
    .sort((a, b) => b.year - a.year || b.month - a.month);
}
