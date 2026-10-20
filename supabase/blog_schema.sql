-- Yono Blog Schema for Supabase
-- Run this in your Supabase project SQL Editor if you wish to store blog posts in Supabase DB

CREATE TABLE IF NOT EXISTS public.yono_posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',
  cover_image TEXT,
  author TEXT DEFAULT 'Yono Games Desk',
  category TEXT DEFAULT 'Yono Games Guides',
  status TEXT DEFAULT 'draft',
  ai_generated BOOLEAN DEFAULT true,
  source TEXT DEFAULT 'manual',
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  reading_time_minutes INTEGER DEFAULT 5,
  target_site TEXT DEFAULT 'allyonogames99.com',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- High-performance composite indexes
CREATE INDEX IF NOT EXISTS idx_yono_posts_slug ON public.yono_posts(slug);
CREATE INDEX IF NOT EXISTS idx_yono_posts_status ON public.yono_posts(status);
CREATE INDEX IF NOT EXISTS idx_yono_posts_category ON public.yono_posts(category);
CREATE INDEX IF NOT EXISTS idx_yono_posts_target_site ON public.yono_posts(target_site);
CREATE INDEX IF NOT EXISTS idx_yono_posts_status_created ON public.yono_posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_yono_posts_created_desc ON public.yono_posts(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.yono_posts ENABLE ROW LEVEL SECURITY;

-- Public / Anon: READ-ONLY access to PUBLISHED articles only
DROP POLICY IF EXISTS "Public Read Access" ON public.yono_posts;
CREATE POLICY "Public Read Access"
ON public.yono_posts FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Service Role: Full access for server backend
DROP POLICY IF EXISTS "Service Role Only Full Access" ON public.yono_posts;
CREATE POLICY "Service Role Only Full Access"
ON public.yono_posts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Seed Initial Verified Blog Articles (Safe if already exists)
INSERT INTO public.yono_posts (
  id, slug, title, excerpt, content, cover_image, author, category, status,
  ai_generated, source, seo_title, seo_description, tags, reading_time_minutes,
  target_site, published_at, created_at, updated_at
) VALUES
(
  'post-yono-001',
  'how-to-download-all-yono-games-apk-safe-guide',
  'How to Download All Yono Games APK Safely & Claim ₹1,500 Bonus',
  'Looking for the official Yono apps? Learn how to download verified APKs directly to your Android device, avoid duplicate clones, and claim maximum sign-up bonuses.',
  '<p>Finding genuine, virus-free Yono APKs has become harder than ever with dozens of misleading third-party clones circulating on Telegram and sketchy download portals. You download an app expecting Yono Rummy or Yono 777, only to find fake ads and disabled withdrawals.</p><p>At All Yono Games 99 (allyonogames99.com), we verify every single APK hash directly from game developers before publishing download links. You get genuine APKs, instant OTP login, and automated payouts to your bank account. To get started right away, you can <a href=''/''>Download Official Yono Games APK</a> directly from our homepage.</p><h2>Why Verified Yono Apps Protect Your Winnings</h2><p>When playing real cash games like Teen Patti, Dragon vs Tiger, or Point Rummy, security is non-negotiable. Cloned apps often tamper with RNG probability or lock withdrawal accounts once your balance crosses ₹5,000.</p><p>Official Yono apps feature 128-bit SSL encryption, automated UPI gateways, and instant ₹100 minimum cashout. You never have to wait days or submit Aadhaar card scans just to withdraw your daily profit.</p>',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
  'Yono Games Desk',
  'Yono Games Guides',
  'published',
  true,
  'manual',
  'How to Download All Yono Games APK Safely & Claim ₹1500 Bonus',
  'Complete guide to downloading official Yono Games APKs safely. Get ₹1,500 sign-up bonus, 2-minute UPI cashouts, and avoid fake clones.',
  '["Yono Games", "APK Download", "Rummy", "Teen Patti", "Bonus"]'::jsonb,
  4,
  'allyonogames99.com',
  NOW(),
  NOW(),
  NOW()
),
(
  'post-yono-002',
  'top-5-rummy-tricks-to-win-cash-daily-on-yono',
  'Top 5 Rummy Tricks to Win Real Cash Daily on Yono Apps',
  'Master 13-card Indian rummy with proven mathematical discarding techniques, pure sequence prioritization, and disciplined bankroll allocation.',
  '<p>Most players lose their daily rummy session in the first three turns. They focus on holding high-value picture cards hoping for an unlikely joker, only to get stuck with 60 penalty points when an opponent declares.</p><p>Winning consistently on Yono Rummy isn''t about luck; it''s about minimizing liability while building flexible combinations. If you want to increase your win rate across 10-point and 50-point cash tables, follow these battle-tested strategies.</p><h2>1. Prioritize Pure Sequence Above All Else</h2><p>Without a pure sequence (three or more consecutive cards of the same suit without a joker), any other sets or sequences you build are worth zero points. The very first card you should search for after the deal is your pure sequence anchor.</p>',
  'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1200&q=80',
  'Yono Games Desk',
  'Teen Patti & Rummy',
  'published',
  true,
  'manual',
  'Top 5 Rummy Tricks to Win Real Cash Daily on Yono Apps',
  'Learn top Indian Rummy winning strategies for Yono apps. Cut penalty points, form pure sequences fast, and withdraw daily profits via UPI.',
  '["Yono Rummy", "Rummy Tricks", "Teen Patti", "Cash Games"]'::jsonb,
  5,
  'allyonogames99.com',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

