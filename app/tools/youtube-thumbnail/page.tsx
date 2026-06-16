'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Card, Stack, Alert, Typography, Box, TextField, Button } from '@mui/material';
import { ToolLayout } from '@/components/ToolComponents';
import { useAuth } from '@/lib/supabase/AuthProvider';

const RES = [
  { key: 'maxresdefault', label: 'Max (1280×720)' },
  { key: 'sddefault', label: 'SD (640×480)' },
  { key: 'hqdefault', label: 'HQ (480×360)' },
  { key: 'mqdefault', label: 'Medium (320×180)' },
];

function extractId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/,
    /^([\w-]{11})$/,
  ];
  for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
  return null;
}

export default function YoutubeThumbnailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const grab = () => {
    const id = extractId(url.trim());
    if (!id) { setError('Could not find a YouTube video ID in that URL.'); setVideoId(null); return; }
    setError(null); setVideoId(id);
  };

  const download = async (resKey: string) => {
    if (loading) return;
    if (!user) { router.push(`/auth/login?next=${encodeURIComponent(pathname || '/')}`); return; }
    const src = `https://img.youtube.com/vi/${videoId}/${resKey}.jpg`;
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${videoId}-${resKey}.jpg`;
      a.click();
    } catch {
      window.open(src, '_blank');
    }
  };

  return (
    <ToolLayout
      title="YouTube Thumbnail Downloader"
      description="Paste any YouTube link to grab its thumbnail in every available resolution. Fast and free."
      features={['All Resolutions', 'Shorts & Embeds', 'One-Click Download', 'Instant']}
    >
      <Stack spacing={3} sx={{ maxWidth: 820, mx: 'auto' }}>
        {error && <Alert severity="error">{error}</Alert>}
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="YouTube URL"
              placeholder="https://www.youtube.com/watch?v=…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && grab()}
            />
            <Button variant="contained" onClick={grab} sx={{ px: 4 }}>Get</Button>
          </Stack>
        </Card>

        {videoId && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {RES.map((r) => (
              <Card key={r.key} sx={{ p: 2 }}>
                <Stack spacing={1.5}>
                  <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, overflow: 'hidden', minHeight: 100 }}>
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/${r.key}.jpg`}
                      alt={r.label}
                      style={{ width: '100%', display: 'block' }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.label}</Typography>
                  <Button variant="outlined" onClick={() => download(r.key)}>Download</Button>
                </Stack>
              </Card>
            ))}
          </Box>
        )}
      </Stack>
    </ToolLayout>
  );
}
