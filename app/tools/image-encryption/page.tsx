'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Card,
  Stack,
  Alert,
  Typography,
  Button,
  TextField,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

/**
 * Real client-side image encryption using the Web Crypto API.
 *
 * Container format (.zenc):
 *   [ MAGIC "ZESTENC1" (8 bytes) ]
 *   [ salt (16 bytes) ]            -> PBKDF2 salt
 *   [ iv (12 bytes) ]             -> AES-GCM nonce
 *   [ ciphertext (rest) ]        -> AES-256-GCM( metaLen(4) + metaJSON + fileBytes )
 *
 * The key is derived from the password with PBKDF2-SHA256 (210k iterations).
 * Everything runs in the browser; the image never leaves the device.
 */

const MAGIC = new TextEncoder().encode('ZESTENC1'); // 8 bytes
const PBKDF2_ITERATIONS = 210_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

type Mode = 'encrypt' | 'decrypt';

interface PasswordStrength {
  ok: boolean;
  label: string;
  color: 'error' | 'warning' | 'success';
}

function checkStrength(pw: string): PasswordStrength {
  if (pw.length < 8) return { ok: false, label: 'Too short (min 8 chars)', color: 'error' };
  let score = 0;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  if (score <= 2) return { ok: true, label: 'Weak', color: 'error' };
  if (score === 3) return { ok: true, label: 'Fair', color: 'warning' };
  return { ok: true, label: 'Strong', color: 'success' };
}

async function deriveKey(password: string, salt: BufferSource): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password) as BufferSource,
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function ImageEncryptionPage() {
  const [mode, setMode] = useState<Mode>('encrypt');
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const strength = useMemo(() => (password ? checkStrength(password) : null), [password]);

  const reset = useCallback(() => {
    setFile(null);
    setPassword('');
    setError(null);
    setSuccess(null);
    setBusy(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }, [previewUrl]);

  const handleModeChange = (_: unknown, next: Mode | null) => {
    if (next) {
      setMode(next);
      reset();
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setSuccess(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);

    if (mode === 'encrypt') {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please choose an image file to encrypt.');
        return;
      }
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
    setFile(selectedFile);
  };

  const handleEncrypt = async () => {
    if (!file || !password) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
      const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
      const key = await deriveKey(password, salt);

      const meta = JSON.stringify({ name: file.name, type: file.type, size: file.size });
      const metaBytes = new TextEncoder().encode(meta);
      const fileBytes = new Uint8Array(await file.arrayBuffer());

      const plaintext = new Uint8Array(4 + metaBytes.length + fileBytes.length);
      new DataView(plaintext.buffer).setUint32(0, metaBytes.length, false);
      plaintext.set(metaBytes, 4);
      plaintext.set(fileBytes, 4 + metaBytes.length);

      const ciphertext = new Uint8Array(
        await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, plaintext as BufferSource),
      );

      const out = new Uint8Array(MAGIC.length + SALT_BYTES + IV_BYTES + ciphertext.length);
      let off = 0;
      out.set(MAGIC, off); off += MAGIC.length;
      out.set(salt, off); off += SALT_BYTES;
      out.set(iv, off); off += IV_BYTES;
      out.set(ciphertext, off);

      downloadBlob(new Blob([out as BlobPart], { type: 'application/octet-stream' }), file.name + '.zenc');
      setSuccess(`Encrypted ${formatSize(file.size)} → ${formatSize(out.length)}. Download started. Keep your password safe — it cannot be recovered.`);
    } catch (e) {
      setError('Encryption failed. ' + (e instanceof Error ? e.message : ''));
    } finally {
      setBusy(false);
    }
  };

  const handleDecrypt = async () => {
    if (!file || !password) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    try {
      const buf = new Uint8Array(await file.arrayBuffer());
      const magic = buf.subarray(0, MAGIC.length);
      if (!MAGIC.every((b, i) => magic[i] === b)) {
        throw new Error('Not a valid .zenc file (bad header).');
      }
      let off = MAGIC.length;
      const salt = buf.subarray(off, off + SALT_BYTES); off += SALT_BYTES;
      const iv = buf.subarray(off, off + IV_BYTES); off += IV_BYTES;
      const ciphertext = buf.subarray(off);

      const key = await deriveKey(password, salt);
      let plaintext: Uint8Array;
      try {
        plaintext = new Uint8Array(
          await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, ciphertext as BufferSource),
        );
      } catch {
        throw new Error('Wrong password or corrupted file.');
      }

      const metaLen = new DataView(plaintext.buffer, plaintext.byteOffset, 4).getUint32(0, false);
      const metaBytes = plaintext.subarray(4, 4 + metaLen);
      const meta = JSON.parse(new TextDecoder().decode(metaBytes)) as { name: string; type: string };
      const fileBytes = plaintext.subarray(4 + metaLen);

      const blob = new Blob([fileBytes as BlobPart], { type: meta.type || 'application/octet-stream' });
      if (meta.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(blob));
      }
      downloadBlob(blob, meta.name || 'decrypted-image');
      setSuccess(`Decrypted successfully → ${meta.name}. Download started.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Decryption failed.');
    } finally {
      setBusy(false);
    }
  };

  const canSubmit =
    !!file && !!password && password.length >= 8 && !busy;

  return (
    <ToolLayout
      title="Image Encryption"
      description="Password-protect images with real AES-256-GCM encryption. Files are encrypted and decrypted entirely in your browser — nothing is ever uploaded."
      features={['AES-256-GCM', 'PBKDF2 Key Derivation', '100% Client-Side', 'Encrypt & Decrypt']}
    >
      <Stack spacing={3} sx={{ maxWidth: 720, mx: 'auto' }}>
        <ToggleButtonGroup
          color="primary"
          value={mode}
          exclusive
          onChange={handleModeChange}
          fullWidth
          sx={{ flexWrap: 'wrap' }}
        >
          <ToggleButton value="encrypt">🔒 Encrypt Image</ToggleButton>
          <ToggleButton value="decrypt">🔓 Decrypt (.zenc)</ToggleButton>
        </ToggleButtonGroup>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        {!file ? (
          <UploadArea
            onFileSelect={handleFileSelect}
            accept={mode === 'encrypt' ? 'image/*' : '.zenc,application/octet-stream'}
            maxSize={50}
          />
        ) : (
          <Stack spacing={3}>
            {mode === 'decrypt' && previewUrl && <PreviewArea imageUrl={previewUrl} />}
            {mode === 'encrypt' && previewUrl && <PreviewArea imageUrl={previewUrl} height={320} />}

            <Card sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, wordBreak: 'break-all' }}>
                  {file.name} · {formatSize(file.size)}
                </Typography>

                <TextField
                  type={showPw ? 'text' : 'password'}
                  label={mode === 'encrypt' ? 'Encryption Password' : 'Decryption Password'}
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPw((s) => !s)} edge="end" size="small">
                            {showPw ? '🙈' : '👁️'}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                {mode === 'encrypt' && strength && (
                  <Typography variant="caption" color={`${strength.color}.main`}>
                    Password strength: {strength.label}
                  </Typography>
                )}

                {busy && <LinearProgress />}

                <Alert severity="info">
                  <Typography variant="caption">
                    {mode === 'encrypt'
                      ? 'Your image is encrypted locally with AES-256-GCM. Without the exact password the file cannot be recovered — there is no reset.'
                      : 'Select a .zenc file produced by this tool and enter its password to recover the original image.'}
                  </Typography>
                </Alert>
              </Stack>
            </Card>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant="outlined" onClick={reset} fullWidth disabled={busy}>
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt}
                disabled={!canSubmit}
                fullWidth
              >
                {busy
                  ? mode === 'encrypt' ? 'Encrypting…' : 'Decrypting…'
                  : mode === 'encrypt' ? 'Encrypt & Download' : 'Decrypt & Download'}
              </Button>
            </Stack>
          </Stack>
        )}
      </Stack>
    </ToolLayout>
  );
}
