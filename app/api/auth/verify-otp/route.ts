import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

function hashCode(code: string, email: string) {
  return crypto.createHash('sha256').update(`${code}:${email}`).digest('hex');
}

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();
    if (!email || !code) return NextResponse.json({ error: 'Email and code required.' }, { status: 400 });

    const lower = String(email).toLowerCase();
    const admin = createAdminClient();

    const { data: rows } = await admin
      .from('otp_codes')
      .select('*')
      .eq('email', lower)
      .eq('purpose', 'login')
      .eq('consumed', false)
      .order('created_at', { ascending: false })
      .limit(1);

    const row = rows?.[0];
    if (!row) return NextResponse.json({ error: 'No active code. Request a new one.' }, { status: 400 });
    if (new Date(row.expires_at) < new Date()) return NextResponse.json({ error: 'Code expired.' }, { status: 400 });
    if (row.attempts >= 5) return NextResponse.json({ error: 'Too many attempts.' }, { status: 429 });

    if (row.code_hash !== hashCode(String(code), lower)) {
      await admin.from('otp_codes').update({ attempts: row.attempts + 1 }).eq('id', row.id);
      return NextResponse.json({ error: 'Incorrect code.' }, { status: 400 });
    }

    await admin.from('otp_codes').update({ consumed: true }).eq('id', row.id);

    // Issue a magic link the client can use to establish a session.
    const { data, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email: lower });
    if (error) return NextResponse.json({ error: 'Could not establish session.' }, { status: 500 });

    return NextResponse.json({ ok: true, actionLink: data.properties?.action_link });
  } catch {
    return NextResponse.json({ error: 'Verification failed.' }, { status: 500 });
  }
}
