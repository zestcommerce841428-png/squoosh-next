import { NextResponse } from 'next/server';
import { verify as verifyTotp } from 'otplib';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

/** Verifies a TOTP code and enables/disables 2FA for the signed-in user. */
export async function POST(request: Request) {
  const { code, disable } = await request.json();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  // Read the secret with the admin client (totp_secret is not exposed to the browser).
  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('totp_secret').eq('id', user.id).single();
  if (!profile?.totp_secret) return NextResponse.json({ error: 'Start 2FA setup first.' }, { status: 400 });

  const result = await verifyTotp({ token: String(code), secret: profile.totp_secret });
  if (!result.valid) return NextResponse.json({ error: 'Invalid code.' }, { status: 400 });

  if (disable) {
    await admin.from('profiles').update({ totp_enabled: false, totp_secret: null }).eq('id', user.id);
    return NextResponse.json({ ok: true, enabled: false });
  }

  await admin.from('profiles').update({ totp_enabled: true }).eq('id', user.id);
  return NextResponse.json({ ok: true, enabled: true });
}
