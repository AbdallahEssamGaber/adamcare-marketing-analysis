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
5. Open http://localhost:3000 and enter your access key.

## Environment Variables

| Variable | Description |
|---|---|
| `SECRET_KEY` | Gate password. Server-only — sent over `POST /api/login`. |
| `SESSION_SECRET` | HMAC secret for signed session cookies. Falls back to `SECRET_KEY`. |
| `SUPABASE_URL` | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase key (never expose to the browser). |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o insights. |
| `META_APP_ID` | Meta (Facebook) app ID — used to refresh the Instagram long-lived token. |
| `META_APP_SECRET` | Meta app secret. |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | Instagram business account ID whose media is fetched. |
| `INSTAGRAM_ACCESS_TOKEN` | Initial seed token. Refreshed token is persisted to Supabase `settings`. |
| `TIKTOK_ACCESS_TOKEN` | TikTok Business API access token. |

## Auth Model

- The dashboard is gated by a single shared password (`SECRET_KEY`).
- `POST /api/login` validates the password and sets an `HttpOnly` signed session cookie (`foradam_session`).
- All API routes (`/api/posts`, `/api/sync`, `/api/insights`) require the cookie.
- The password is never exposed to the browser bundle.

## Supabase Schema

### `posts`
Holds normalized posts from all platforms.

```sql
create table posts (
  post_id           text not null,
  platform          text not null,         -- 'tiktok' | 'instagram'
  caption           text,
  posted_at         timestamptz not null,
  views             integer default 0,
  reach             integer default 0,     -- TikTok: equal to views (true reach unavailable)
  likes             integer default 0,
  comments          integer default 0,
  shares            integer default 0,
  saves             integer default 0,     -- TikTok: always 0 (unavailable)
  link              text,
  synced_at         timestamptz,
  primary key (post_id, platform)
);

create index posts_posted_at_idx on posts (posted_at desc);
create index posts_platform_idx  on posts (platform);
```

### `settings`
Key/value store. Currently holds the rotating Instagram access token.

```sql
create table settings (
  key         text primary key,
  value       text,
  updated_at  timestamptz default now()
);

-- seed:
insert into settings (key, value) values ('instagram_access_token', '<your initial long-lived token>');
```

## Deploy to Vercel

1. Push to a GitHub repo
2. Import in Vercel
3. Add all env variables in the Vercel dashboard
4. Deploy from `main`

## Stack

- Next.js 14 (Pages Router)
- TypeScript (`lib/` and `types/`); JavaScript for pages/components
- Supabase (Postgres)
- OpenAI GPT-4o (AI insights)
- Recharts (charts)
- Vercel (hosting)
