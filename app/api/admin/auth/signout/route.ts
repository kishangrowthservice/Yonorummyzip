// app/api/admin/auth/signout/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_SUPABASE_URL!.replace('supabase.co', 'vercel.app') ?? 'http://localhost:3000'));
}
