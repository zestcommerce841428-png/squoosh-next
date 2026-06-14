'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function AutoExpiryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [expiryTime, setExpiryTime] = useState('1h');
  const [linkGenerated, setLinkGenerated] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) return;
    setFile(selectedFile);
    setOriginalUrl(URL.createObjectURL(selectedFile));
    setLinkGenerated(false);
  };

  const generateLink = () => {
    setLinkGenerated(true);
  };

  return (
    <ToolLayout
      title="Auto File Expiry"
      description="Generate temporary links that automatically expire for secure time-limited sharing"
      features={['Temporary Links', 'Auto Expiration', 'Secure Sharing', 'Cache Management']}
    >
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="caption">
          <strong>Backend Required:</strong> Auto-expiry requires server-side storage with TTL (Time To Live). Can use AWS S3 with lifecycle policies, Redis cache, or custom server logic.
        </Typography>
      </Alert>

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/*" />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={originalUrl || ''} />
          
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">{linkGenerated ? 'Temporary Link Generated' : 'Set Expiry Time'}</Typography>
              
              {!linkGenerated ? (
                <FormControl fullWidth>
                  <InputLabel>Expiry Time</InputLabel>
                  <Select value={expiryTime} onChange={(e) => setExpiryTime(e.target.value)} label="Expiry Time">
                    <MenuItem value="1h">1 Hour</MenuItem>
                    <MenuItem value="6h">6 Hours</MenuItem>
                    <MenuItem value="24h">24 Hours</MenuItem>
                    <MenuItem value="7d">7 Days</MenuItem>
                    <MenuItem value="30d">30 Days</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <>
                  <Alert severity="success">
                    <Typography variant="body2"><strong>Link Generated:</strong> This link will expire in {expiryTime}</Typography>
                  </Alert>
                  <Typography variant="caption" sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    https://example.com/temp/{Math.random().toString(36).substr(2, 9)}?expires={Date.now() + 3600000}
                  </Typography>
                </>
              )}
            </Stack>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => { setFile(null); setOriginalUrl(null); setLinkGenerated(false); }} fullWidth>Reset</Button>
            {!linkGenerated && (
              <Button variant="contained" onClick={generateLink} fullWidth>Generate Temporary Link</Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
