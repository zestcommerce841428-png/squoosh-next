/**
 * Reusable Tool Component Library
 * Shared components for all 31 image tools
 */

import { ReactNode } from 'react';
import { Box, Button, Container, Typography, Paper, Stack, Chip } from '@mui/material';

interface ToolLayoutProps {
  title: string;
  description: string;
  features: string[];
  children: ReactNode;
}

export function ToolLayout({ title, description, features, children }: ToolLayoutProps) {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', mb: 2 }}>
          {description}
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
          {features.map((feature, i) => (
            <Chip key={i} label={`✓ ${feature}`} size="small" />
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
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <Paper
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      sx={{
        p: 6,
        textAlign: 'center',
        border: '2px dashed',
        borderColor: 'divider',
        cursor: 'pointer',
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

export function PreviewArea({ imageUrl, height = 500 }: PreviewAreaProps) {
  if (!imageUrl) return null;

  return (
    <Paper sx={{ p: 2 }}>
      <Box
        sx={{
          width: '100%',
          height,
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
  return (
    <Stack direction="row" spacing={2}>
      <Button variant="outlined" onClick={onReset}>
        Reset
      </Button>
      {onProcess && !processed && (
        <Button
          variant="contained"
          onClick={onProcess}
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
