import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/** Forwards an image to the Hostinger expire.php endpoint and returns a self-destructing link. */
export async function POST(request: Request) {
  const uploadUrl = process.env.HOSTINGER_UPLOAD_URL;
  const secret = process.env.HOSTINGER_UPLOAD_SECRET;
  if (!uploadUrl || !secret) return NextResponse.json({ error: 'Upload is not configured.' }, { status: 500 });
  const expireUrl = uploadUrl.replace(/upload\.php$/, 'expire.php');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const form = await request.formData();
  const file = form.get('file');
  const ttl = Number(form.get('ttl') || 86400);
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File too large (max 8MB).' }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });

  const outbound = new FormData();
  outbound.append('secret', secret);
  outbound.append('ttl', String(ttl));
  outbound.append('file', file, file.name);

  try {
    const res = await fetch(expireUrl, { method: 'POST', body: outbound });
    const data = await res.json();
    if (!res.ok || !data.url) return NextResponse.json({ error: data.error || 'Upload failed.' }, { status: 502 });
    return NextResponse.json({ url: data.url, ttl });
  } catch {
    return NextResponse.json({ error: 'Could not reach the upload server.' }, { status: 502 });
  }
}
