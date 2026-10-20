// app/api/admin/apps/route.ts
// GET all apps | POST new app

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, createSupabaseServerClient } from '@/lib/supabase-server';
import slugify from 'slugify';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const targetSite = process.env.NEXT_PUBLIC_SITE_ID || 'allyonogames99';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('apps')
    .select('*', { count: 'exact' })
    .eq('site', targetSite)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);
  if (category) query = query.eq('category', category);
  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [], total: count, page, limit });
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: Admin login required' }, { status: 401 });
  }

  const body = await req.json();

  // Auto-generate slug from name using slugify if not provided
  if (!body.slug && body.name) {
    body.slug = slugify(body.name, { lower: true, strict: true, trim: true });
  }

  // Set target site
  body.site = process.env.NEXT_PUBLIC_SITE_ID || 'allyonogames99';

  // Set published_at if status is active
  if (body.status === 'active' && !body.published_at) {
    body.published_at = new Date().toISOString();
  }

  // Clean up any legacy multi-site fields
  delete body.site_referrals;
  delete body.sites_enabled;

  const { data, error } = await supabaseAdmin
    .from('apps')
    .insert([body])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
