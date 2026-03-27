# foradam.care Analytics

TikTok & Instagram analytics dashboard for the foradam.care team.

## Setup

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```
5. Open http://localhost:3000 and enter your access key

## Environment Variables

| Variable | Description |
|---|---|
| `SECRET_KEY` | Shared access key for the app |
| `NEXT_PUBLIC_SECRET_KEY` | Same key (exposed to client for gate check) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o insights |
| `INSTAGRAM_ACCESS_TOKEN` | Long-lived Instagram Graph API token |
| `TIKTOK_ACCESS_TOKEN` | TikTok Business API access token |

## Mock Mode

The app runs with mock data when Supabase/OpenAI keys are not configured. This is the default for local development.

## Deploy to Vercel

1. Push to a GitHub repo
2. Import in Vercel
3. Add all env variables in Vercel dashboard
4. Deploy from `main` branch

## Stack

- Next.js 14 (Pages Router)
- Supabase (database)
- OpenAI GPT-4o (AI insights)
- Recharts (charts)
- Vercel (hosting)
