'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container, Card, Stack, TextField, Button, Typography, Alert, Box, Avatar, Divider,
  CircularProgress, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent,
  DialogActions,
} from '@mui/material';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/AuthProvider';

type Profile = Record<string, any>;

const FIELDS: { key: string; label: string }[] = [
  { key: 'first_name', label: 'First name' },
  { key: 'last_name', label: 'Last name' },
  { key: 'display_name', label: 'Display name' },
  { key: 'username', label: 'Username' },
  { key: 'phone', label: 'Phone' },
  { key: 'bio', label: 'Bio' },
  { key: 'address_line1', label: 'Address line 1' },
  { key: 'address_line2', label: 'Address line 2' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'postal_code', label: 'Postal code' },
  { key: 'country', label: 'Country' },
  { key: 'date_of_birth', label: 'Date of birth' },
  { key: 'gender', label: 'Gender' },
  { key: 'company', label: 'Company' },
  { key: 'job_title', label: 'Job title' },
  { key: 'website', label: 'Website' },
  { key: 'twitter', label: 'Twitter' },
  { key: 'github', label: 'GitHub' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'timezone', label: 'Timezone' },
  { key: 'backup_email', label: 'Backup email' },
];

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [profile, setProfile] = useState<Profile>({});
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ t: 'success' | 'error'; m: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [totp, setTotp] = useState<{ otpauth: string; secret: string } | null>(null);
  const [totpCode, setTotpCode] = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login?next=/profile');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      setProfile(data || { id: user.id, email: user.email });
      setLoadingProfile(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const set = (k: string, v: any) => setProfile((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!user) return;
    setSaving(true); setMsg(null);
    const { totp_secret, created_at, updated_at, ...editable } = profile;
    const { error } = await supabase.from('profiles').update(editable).eq('id', user.id);
    setMsg(error ? { t: 'error', m: error.message } : { t: 'success', m: 'Profile saved.' });
    setSaving(false);
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/profile/avatar', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) { setMsg({ t: 'error', m: data.error || 'Upload failed.' }); return; }
    set('avatar_url', data.url);
    setMsg({ t: 'success', m: 'Photo updated.' });
  };

  const removeAvatar = async () => {
    if (!user) return;
    await fetch('/api/profile/avatar', { method: 'DELETE' });
    set('avatar_url', null);
  };

  const changePassword = async () => {
    if (newPassword.length < 8) { setMsg({ t: 'error', m: 'Password must be 8+ characters.' }); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setMsg(error ? { t: 'error', m: error.message } : { t: 'success', m: 'Password changed.' });
    setNewPassword('');
  };

  const startTotp = async () => {
    const res = await fetch('/api/auth/2fa/setup', { method: 'POST' });
    const data = await res.json();
    if (res.ok) setTotp(data); else setMsg({ t: 'error', m: data.error });
  };

  const confirmTotp = async (disable = false) => {
    const res = await fetch('/api/auth/2fa/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: totpCode, disable }),
    });
    const data = await res.json();
    if (!res.ok) { setMsg({ t: 'error', m: data.error }); return; }
    set('totp_enabled', data.enabled);
    setTotp(null); setTotpCode('');
    setMsg({ t: 'success', m: data.enabled ? '2FA enabled.' : '2FA disabled.' });
  };

  const deleteAccount = async () => {
    const res = await fetch('/api/account/delete', { method: 'POST' });
    if (res.ok) { await signOut(); router.replace('/'); }
    else setMsg({ t: 'error', m: 'Could not delete account.' });
  };

  if (loading || loadingProfile) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Your Profile</Typography>
      {msg && <Alert severity={msg.t} sx={{ mb: 3 }} onClose={() => setMsg(null)}>{msg.m}</Alert>}

      <Card sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
          <Avatar src={profile.avatar_url || undefined} sx={{ width: 88, height: 88 }} />
          <Stack spacing={1} direction="row" flexWrap="wrap" useFlexGap>
            <Button variant="outlined" component="label">
              Upload photo
              <input hidden type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
            </Button>
            {profile.avatar_url && <Button color="inherit" onClick={removeAvatar}>Remove</Button>}
          </Stack>
          <Box sx={{ ml: { sm: 'auto' } }}>
            <Typography variant="body2" color="text.secondary">{profile.email || user?.email}</Typography>
          </Box>
        </Stack>
      </Card>

      <Card sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Profile details</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          {FIELDS.map((f) => (
            <TextField
              key={f.key}
              label={f.label}
              fullWidth
              size="small"
              type={f.key === 'date_of_birth' ? 'date' : 'text'}
              InputLabelProps={f.key === 'date_of_birth' ? { shrink: true } : undefined}
              value={profile[f.key] ?? ''}
              onChange={(e) => set(f.key, e.target.value)}
            />
          ))}
        </Box>
        <Stack direction="row" spacing={3} sx={{ mt: 2 }} flexWrap="wrap">
          <FormControlLabel control={<Switch checked={!!profile.newsletter} onChange={(e) => set('newsletter', e.target.checked)} />} label="Newsletter" />
          <FormControlLabel control={<Switch checked={!!profile.marketing_opt_in} onChange={(e) => set('marketing_opt_in', e.target.checked)} />} label="Marketing emails" />
        </Stack>
        <Button variant="contained" sx={{ mt: 2 }} onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </Card>

      <Card sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Security</Typography>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <TextField label="New password" type="password" size="small" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Button variant="outlined" onClick={changePassword} disabled={!newPassword}>Change password</Button>
          </Stack>
          <Divider />
          <Box>
            <Typography variant="subtitle2">Two-factor authentication (TOTP)</Typography>
            {profile.totp_enabled ? (
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                <Alert severity="success" sx={{ py: 0 }}>2FA is enabled</Alert>
                <TextField label="Code to disable" size="small" value={totpCode} onChange={(e) => setTotpCode(e.target.value)} />
                <Button color="error" onClick={() => confirmTotp(true)}>Disable</Button>
              </Stack>
            ) : totp ? (
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Typography variant="body2">Scan this URI in your authenticator app, then enter the code:</Typography>
                <Typography variant="caption" sx={{ wordBreak: 'break-all', bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>{totp.otpauth}</Typography>
                <Stack direction="row" spacing={2}>
                  <TextField label="6-digit code" size="small" value={totpCode} onChange={(e) => setTotpCode(e.target.value)} />
                  <Button variant="contained" onClick={() => confirmTotp(false)}>Enable</Button>
                </Stack>
              </Stack>
            ) : (
              <Button variant="outlined" sx={{ mt: 1 }} onClick={startTotp}>Set up 2FA</Button>
            )}
          </Box>
        </Stack>
      </Card>

      <Card sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'error.main' }}>
        <Typography variant="h6" color="error" sx={{ mb: 1 }}>Danger zone</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Permanently delete your account, profile and uploaded photos. This cannot be undone.
        </Typography>
        <Button color="error" variant="contained" onClick={() => setDeleteOpen(true)}>Delete my account</Button>
      </Card>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete account?</DialogTitle>
        <DialogContent>This permanently removes your account and all associated data.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={deleteAccount}>Delete forever</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
