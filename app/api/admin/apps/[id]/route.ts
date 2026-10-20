// app/api/admin/apps/[id]/route.ts
// GET single | PUT update | DELETE app

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, createSupabaseServerClient } from '@/lib/supabase-server';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from('apps')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: Admin login required' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  // If activating, stamp published_at
  if (body.status === 'active' && !body.published_at) {
    body.published_at = new Date().toISOString();
  }

  // Clean up any legacy multi-site fields
  delete body.site_referrals;
  delete body.sites_enabled;

  const { data, error } = await supabaseAdmin
    .from('apps')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: Admin login required' }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabaseAdmin.from('apps').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
