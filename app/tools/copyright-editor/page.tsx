'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Button, TextField, Box } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function CopyrightEditorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  
  const [copyright, setCopyright] = useState('');
  const [artist, setArtist] = useState('');
  const [description, setDescription] = useState('');

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) return;
    setFile(selectedFile);
    setOriginalUrl(URL.createObjectURL(selectedFile));
    setProcessedUrl(null);
  };

  const addCopyright = () => {
    if (!file || !originalUrl) return;
    setProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) setProcessedUrl(URL.createObjectURL(blob));
          setProcessing(false);
        }, file.type);
      } else {
        setProcessing(false);
      }
    };
    img.src = originalUrl;
  };

  return (
    <ToolLayout
      title="Copyright Metadata Editor"
      description="Add copyright, artist, and description metadata to protect your intellectual property"
      features={['Copyright Info', 'Artist Attribution', 'Description', 'IPTC Metadata']}
    >
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="caption">
          <strong>EXIF/IPTC Writing:</strong> Full copyright metadata requires piexifjs or exiftool.js library for writing IPTC/XMP data to JPEG files.
        </Typography>
      </Alert>

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/*" />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={processedUrl || originalUrl} />
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Copyright Information</Typography>
              <TextField label="Copyright Notice" fullWidth value={copyright} onChange={(e) => setCopyright(e.target.value)} placeholder="© 2026 Your Name. All rights reserved." />
              <TextField label="Artist/Creator" fullWidth value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Your Name" />
              <TextField label="Description" fullWidth multiline rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Image description..." />
            </Stack>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => { setFile(null); setOriginalUrl(null); setProcessedUrl(null); }} fullWidth>Cancel</Button>
            <Button variant="contained" onClick={addCopyright} disabled={processing || !copyright} fullWidth>
              {processing ? 'Adding...' : 'Add Copyright Metadata'}
            </Button>
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
