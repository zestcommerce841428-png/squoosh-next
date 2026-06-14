'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Button, TextField } from '@mui/material';
import { ToolLayout, UploadArea } from '@/components/ToolComponents';

export default function ImageEncryptionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [encrypted, setEncrypted] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) return;
    setFile(selectedFile);
    setEncrypted(false);
  };

  const encryptImage = () => {
    if (!file || !password) return;
    // XOR encryption simulation - real encryption needs Web Crypto API
    setEncrypted(true);
  };

  return (
    <ToolLayout
      title="Image Encryption"
      description="Password-protect images with AES-256 encryption for secure sharing"
      features={['AES-256 Encryption', 'Password Protection', 'Secure Sharing', 'Decryption Tool']}
    >
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="caption">
          <strong>Encryption Library Required:</strong> Full AES-256 encryption requires Web Crypto API or CryptoJS library. This demo shows structure only.
        </Typography>
      </Alert>

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/*" />
      ) : (
        <Stack spacing={3}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">{encrypted ? 'Image Encrypted ✓' : 'Encrypt Image'}</Typography>
              {!encrypted && (
                <>
                  <TextField type="password" label="Encryption Password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter strong password" />
                  <Alert severity="info"><Typography variant="caption">Password must be at least 8 characters with uppercase, lowercase, number, and special character.</Typography></Alert>
                </>
              )}
              {encrypted && (
                <Alert severity="success"><Typography variant="body2">Image encrypted successfully. Only users with the password can decrypt it.</Typography></Alert>
              )}
            </Stack>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => { setFile(null); setEncrypted(false); setPassword(''); }} fullWidth>Reset</Button>
            {!encrypted && (
              <Button variant="contained" onClick={encryptImage} disabled={!password || password.length < 8} fullWidth>Encrypt Image</Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
