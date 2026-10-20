// lib/supabase.ts
// Browser-safe Supabase client & types
// Safe to import in both Client Components ('use client') and Server files

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// ── Browser client (auth sessions, used in Client Components) ──
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export const CURRENT_SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'allyonogames99';

// ── TypeScript type for the apps table ──
export interface AppRecord {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  short_desc?: string;
  category: string;
  tags: string[];
  status: 'active' | 'inactive' | 'coming_soon' | 'archived';
  logo_url?: string;
  banner_url?: string;
  screenshot_urls: string[];
  platform: 'android' | 'ios' | 'both';
  app_version?: string;
  apk_size_mb?: number;
  min_android?: string;
  download_url: string;
  site?: string;
  play_store_url?: string;
  official_site?: string;
  signup_bonus: number;
  referral_bonus: number;
  min_withdrawal?: number;
  max_withdrawal?: number;
  withdrawal_time?: string;
  bonus_type: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  canonical_url?: string;
  rating: number;
  total_downloads: number;
  total_reviews: number;
  is_featured: boolean;
  is_top_rated: boolean;
  sort_order: number;
  publisher_name?: string;
  support_email?: string;
  privacy_policy?: string;
  is_verified: boolean;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}
