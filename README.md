# EuroTracker 🪙

Track your 2 euro coin collection — standard designs and commemorative editions from all Eurozone countries.

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Supabase** (PostgreSQL + Google OAuth)
- **Drizzle ORM** (type-safe, edge-compatible — better than Prisma for Supabase)
- **shadcn/ui** + Tailwind CSS
- **Deployed on Vercel**

---

## Setup Guide

### 1. Clone & install

```bash
git clone https://github.com/your-username/euro-coins-tracker.git
cd euro-coins-tracker
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **Settings → API** and copy:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. Go to **Settings → Database** and copy:
   - **Transaction pooler** URL (port `6543`) → `DATABASE_URL`
   - **Direct connection** URL (port `5432`) → `DATABASE_DIRECT_URL`

### 3. Enable Google OAuth in Supabase

1. Go to **Authentication → Providers → Google**
2. Enable it and add your Google OAuth credentials
   - Create credentials at [console.cloud.google.com](https://console.cloud.google.com)
   - Authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
3. Add your site URL in **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000` (dev) or your production URL
   - Redirect URL: `http://localhost:3000/auth/callback`

### 4. Configure environment variables

```bash
cp .env.example .env.local
# Fill in the values from Supabase
```

`.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres.xxx:password@pooler.supabase.com:6543/postgres?pgbouncer=true
DATABASE_DIRECT_URL=postgresql://postgres.xxx:password@pooler.supabase.com:5432/postgres
```

### 5. Run database migrations

```bash
npm run db:push
```

### 6. Seed the coin data

```bash
npm run db:seed
```

This seeds ~260 coins (standard + commemorative) from all 23 Eurozone countries.

### 7. Set up Row Level Security (RLS) in Supabase

Run these SQL commands in the **Supabase SQL Editor**:

```sql
-- Enable RLS
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;

-- Users can only see their own collection
CREATE POLICY "Users can view own collection"
  ON user_collections FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can insert into their own collection
CREATE POLICY "Users can insert own collection"
  ON user_collections FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Users can delete from their own collection
CREATE POLICY "Users can delete own collection"
  ON user_collections FOR DELETE
  USING (auth.uid()::text = user_id);

-- coins table is publicly readable
ALTER TABLE coins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coins are publicly readable"
  ON coins FOR SELECT
  USING (true);
```

### 8. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add the environment variables from `.env.local`
4. Set `NEXT_PUBLIC_SITE_URL` to your production URL
5. Update the redirect URL in Supabase Auth settings to include your production URL

---

## Database Schema

```
coins
  id            uuid PK
  country       text
  country_code  text
  year          integer
  type          'standard' | 'commemorative'
  description   text
  image_url     text (nullable)
  sort_order    integer

user_collections
  id        uuid PK
  user_id   text (Supabase auth.users ID)
  coin_id   uuid FK → coins.id
  added_at  timestamptz
  UNIQUE(user_id, coin_id)
```

## Drizzle commands

```bash
npm run db:push      # Push schema changes to Supabase
npm run db:studio    # Open Drizzle Studio (DB GUI)
npm run db:generate  # Generate migration files
npm run db:seed      # Seed coin data
```
