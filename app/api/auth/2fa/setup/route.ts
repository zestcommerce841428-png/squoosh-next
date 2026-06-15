import { NextResponse } from 'next/server';
import { generateSecret, generateURI } from 'otplib';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/** Generates a fresh TOTP secret + otpauth URI for the signed-in user. */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const secret = generateSecret();
  const otpauth = generateURI({ issuer: 'Squoosh Next', label: user.email || user.id, secret });

  // Store provisionally; only flip totp_enabled once the user verifies a code.
  await supabase.from('profiles').update({ totp_secret: secret, totp_enabled: false }).eq('id', user.id);

  return NextResponse.json({ secret, otpauth });
}
