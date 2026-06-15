import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function ext(type: string) {
  return ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' } as Record<string, string>)[type] || 'jpg';
}

/**
 * Receives a profile photo, forwards it to the Hostinger upload.php endpoint,
 * and stores the returned public URL on the signed-in user's profile.
 */
export async function POST(request: Request) {
  const uploadUrl = process.env.HOSTINGER_UPLOAD_URL;
  const secret = process.env.HOSTINGER_UPLOAD_SECRET;
  if (!uploadUrl || !secret) {
    return NextResponse.json({ error: 'Hostinger upload is not configured.' }, { status: 500 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File too large (max 8MB).' }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });

  const filename = `${user.id}-${Date.now()}.${ext(file.type)}`;

  // Forward to Hostinger
  const outbound = new FormData();
  outbound.append('secret', secret);
  outbound.append('action', 'upload');
  outbound.append('name', filename);
  outbound.append('file', file, filename);

  let publicUrl: string;
  try {
    const res = await fetch(uploadUrl, { method: 'POST', body: outbound });
    const data = await res.json();
    if (!res.ok || !data.url) {
      return NextResponse.json({ error: data.error || 'Upload failed.' }, { status: 502 });
    }
    publicUrl = data.url;
  } catch {
    return NextResponse.json({ error: 'Could not reach upload server.' }, { status: 502 });
  }

  const { error } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ url: publicUrl });
}

/** Removes the current avatar reference (and tells Hostinger to delete the file). */
export async function DELETE() {
  const uploadUrl = process.env.HOSTINGER_UPLOAD_URL;
  const secret = process.env.HOSTINGER_UPLOAD_SECRET;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();

  if (uploadUrl && secret && profile?.avatar_url) {
    try {
      const name = profile.avatar_url.split('/').pop();
      const body = new FormData();
      body.append('secret', secret);
      body.append('action', 'delete');
      body.append('name', name || '');
      await fetch(uploadUrl, { method: 'POST', body });
    } catch {
      /* best-effort delete */
    }
  }

  await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
  return NextResponse.json({ ok: true });
}
