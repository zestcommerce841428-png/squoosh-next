/**
 * Reusable Tool Component Library
 * Shared components for all image tools
 */
'use client';

import { ReactNode, useEffect } from 'react';
import { Box, Button, Container, Typography, Paper, Stack, Chip } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import { executeReCaptcha } from '@/lib/recaptcha';
import { useAuth } from '@/lib/supabase/AuthProvider';

/**
 * Soft auth gate: tool pages are public (good for SEO), but performing an
 * action (upload / process) requires sign-in. Returns a guard that runs the
 * action when authenticated, otherwise sends the user to login and back.
 */
function useActionGuard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  return (proceed: () => void) => {
    if (loading) return;
    if (!user) {
      router.push(`/auth/login?next=${encodeURIComponent(pathname || '/')}`);
      return;
    }
    proceed();
  };
}

interface ToolLayoutProps {
  title: string;
  description: string;
  features: string[];
  children: ReactNode;
}

export function ToolLayout({ title, description, features, children }: ToolLayoutProps) {
  // Passive reCAPTCHA v3 scoring for every tool page (no-op until keys are set).
  useEffect(() => {
    const action = 'tool_' + title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    executeReCaptcha(action).catch(() => {});
  }, [title]);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1.5, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 3, md: 4 }, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.6rem', sm: '2.2rem', md: '3rem' },
            lineHeight: 1.15,
            background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 700, mx: 'auto', mb: 2, fontSize: { xs: '0.9rem', sm: '1rem' }, px: { xs: 1, sm: 0 } }}
        >
          {description}
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
          {features.map((feature, i) => (
            <Chip key={i} label={`✓ ${feature}`} size="small" sx={{ mb: 0.5 }} />
          ))}
        </Stack>
      </Box>

      {/* Tool Content */}
      {children}
    </Container>
  );
}

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
}

export function UploadArea({ onFileSelect, accept = 'image/*', maxSize = 10 }: UploadAreaProps) {
  const guard = useActionGuard();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) guard(() => onFileSelect(file));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) guard(() => onFileSelect(file));
  };

  return (
    <Paper
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      sx={{
        p: { xs: 3, sm: 4, md: 6 },
        textAlign: 'center',
        border: '2px dashed',
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'border-color .2s, background-color .2s',
        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
      }}
    >
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto' }}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
      <Typography variant="h5" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
        Upload Image
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Drag & drop or click to browse (Max {maxSize}MB)
      </Typography>
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: 'none' }}
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button variant="contained" component="span">
          Choose File
        </Button>
      </label>
    </Paper>
  );
}

interface PreviewAreaProps {
  imageUrl: string | null;
  height?: number;
}

export function PreviewArea({ imageUrl, height }: PreviewAreaProps) {
  if (!imageUrl) return null;

  return (
    <Paper sx={{ p: { xs: 1, sm: 2 } }}>
      <Box
        sx={{
          width: '100%',
          height: height ?? { xs: 260, sm: 380, md: 500 },
          bgcolor: 'action.hover',
          borderRadius: 1,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'repeating-conic-gradient(#e0e0e0 0% 25%, transparent 0% 50%) 50% / 20px 20px',
        }}
      >
        <img
          src={imageUrl}
          alt="Preview"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>
    </Paper>
  );
}

interface ActionButtonsProps {
  onReset: () => void;
  onProcess?: () => void;
  onDownload?: () => void;
  processing?: boolean;
  processed?: boolean;
}

export function ActionButtons({
  onReset,
  onProcess,
  onDownload,
  processing = false,
  processed = false,
}: ActionButtonsProps) {
  const guard = useActionGuard();
  return (
    <Stack direction="row" spacing={2}>
      <Button variant="outlined" onClick={onReset}>
        Reset
      </Button>
      {onProcess && !processed && (
        <Button
          variant="contained"
          onClick={() => guard(onProcess)}
          disabled={processing}
          sx={{ flexGrow: 1 }}
        >
          {processing ? 'Processing...' : 'Process'}
        </Button>
      )}
      {onDownload && processed && (
        <Button variant="contained" onClick={onDownload} sx={{ flexGrow: 1 }}>
          Download
        </Button>
      )}
    </Stack>
  );
}
