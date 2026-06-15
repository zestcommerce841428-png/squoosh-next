'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container, Card, Stack, TextField, Button, Typography, Alert, Box, Avatar, Divider,
  CircularProgress, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent,
  DialogActions, Tabs, Tab, IconButton, MenuItem, LinearProgress, Chip, Snackbar,
} from '@mui/material';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/AuthProvider';

type Profile = Record<string, any>;

interface FieldDef { key: string; label: string; type?: string; select?: string[]; full?: boolean; multiline?: boolean; }

const GROUPS: { id: string; label: string; icon: string; fields: FieldDef[] }[] = [
  {
    id: 'personal', label: 'Personal', icon: '👤',
    fields: [
      { key: 'first_name', label: 'First name' },
      { key: 'last_name', label: 'Last name' },
      { key: 'display_name', label: 'Display name' },
      { key: 'username', label: 'Username' },
      { key: 'phone', label: 'Phone' },
      { key: 'date_of_birth', label: 'Date of birth', type: 'date' },
      { key: 'gender', label: 'Gender', select: ['', 'Male', 'Female', 'Non-binary', 'Prefer not to say'] },
      { key: 'bio', label: 'Bio', full: true, multiline: true },
    ],
  },
  {
    id: 'address', label: 'Address', icon: '📍',
    fields: [
      { key: 'address_line1', label: 'Address line 1', full: true },
      { key: 'address_line2', label: 'Address line 2', full: true },
      { key: 'city', label: 'City' },
      { key: 'state', label: 'State / Province' },
      { key: 'postal_code', label: 'Postal code' },
      { key: 'country', label: 'Country' },
    ],
  },
  {
    id: 'work', label: 'Professional', icon: '💼',
    fields: [
      { key: 'company', label: 'Company' },
      { key: 'job_title', label: 'Job title' },
      { key: 'website', label: 'Website', full: true },
    ],
  },
  {
    id: 'social', label: 'Social', icon: '🔗',
    fields: [
      { key: 'twitter', label: 'Twitter / X' },
      { key: 'github', label: 'GitHub' },
      { key: 'linkedin', label: 'LinkedIn' },
      { key: 'instagram', label: 'Instagram' },
    ],
  },
  {
    id: 'prefs', label: 'Preferences', icon: '⚙️',
    fields: [
      { key: 'language', label: 'Language', select: ['en', 'hi', 'es', 'fr', 'de', 'ar', 'zh'] },
      { key: 'timezone', label: 'Timezone' },
      { key: 'theme', label: 'Theme', select: ['system', 'light', 'dark'] },
      { key: 'backup_email', label: 'Backup email', type: 'email', full: true },
    ],
  },
];

const ALL_KEYS = GROUPS.flatMap((g) => g.fields.map((f) => f.key));

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [profile, setProfile] = useState<Profile>({});
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ t: 'success' | 'error'; m: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [totp, setTotp] = useState<{ otpauth: string; secret: string } | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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

  const completeness = useMemo(() => {
    const filled = ALL_KEYS.filter((k) => profile[k] && String(profile[k]).trim()).length;
    return Math.round((filled / ALL_KEYS.length) * 100);
  }, [profile]);

  const initials = useMemo(() => {
    const n = (profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}` || profile.email || '').trim();
    return n ? n.split(/\s+/).slice(0, 2).map((s: string) => s[0]?.toUpperCase()).join('') : '?';
  }, [profile]);

  const set = (k: string, v: any) => setProfile((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!user) return;
    setSaving(true); setMsg(null);
    const { totp_secret, created_at, updated_at, role, ...editable } = profile;
    const { error } = await supabase.from('profiles').update(editable).eq('id', user.id);
    if (error) setMsg({ t: 'error', m: error.message });
    else setToast('Profile saved');
    setSaving(false);
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    setUploadingPhoto(true); setMsg(null);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/profile/avatar', { method: 'POST', body: fd });
    const data = await res.json();
    setUploadingPhoto(false);
    if (!res.ok) { setMsg({ t: 'error', m: data.error || 'Upload failed.' }); return; }
    set('avatar_url', data.url);
    setToast('Photo updated');
  };

  const removeAvatar = async () => {
    if (!user) return;
    await fetch('/api/profile/avatar', { method: 'DELETE' });
    set('avatar_url', null);
    setToast('Photo removed');
  };

  const changePassword = async () => {
    if (newPassword.length < 8) { setMsg({ t: 'error', m: 'Password must be 8+ characters.' }); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setMsg({ t: 'error', m: error.message });
    else { setToast('Password changed'); setNewPassword(''); }
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
    setToast(data.enabled ? '2FA enabled' : '2FA disabled');
  };

  const deleteAccount = async () => {
    const res = await fetch('/api/account/delete', { method: 'POST' });
    if (res.ok) { await signOut(); router.replace('/'); }
    else setMsg({ t: 'error', m: 'Could not delete account.' });
  };

  if (loading || loadingProfile) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress /></Box>;
  }

  const securityTab = tab === GROUPS.length;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      {/* ---------- Header banner ---------- */}
      <Card sx={{ overflow: 'hidden', mb: 3 }}>
        <Box sx={{ height: { xs: 88, sm: 120 }, background: 'linear-gradient(120deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)' }} />
        <Box sx={{ px: { xs: 2, sm: 4 }, pb: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'center', sm: 'flex-end' }} sx={{ mt: { xs: -6, sm: -7 } }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={profile.avatar_url || undefined}
                sx={{ width: { xs: 96, sm: 120 }, height: { xs: 96, sm: 120 }, border: '4px solid', borderColor: 'background.paper', fontSize: 36, bgcolor: 'primary.main', boxShadow: 3 }}
              >
                {initials}
              </Avatar>
              <IconButton
                component="label"
                size="small"
                disabled={uploadingPhoto}
                sx={{ position: 'absolute', bottom: 4, right: 4, bgcolor: 'background.paper', boxShadow: 2, '&:hover': { bgcolor: 'background.paper' } }}
              >
                {uploadingPhoto ? <CircularProgress size={16} /> : '📷'}
                <input hidden type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
              </IconButton>
            </Box>
            <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' }, pb: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Your Profile'}
              </Typography>
              <Typography variant="body2" color="text.secondary">{profile.email || user?.email}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }} flexWrap="wrap" useFlexGap>
                {profile.totp_enabled && <Chip size="small" color="success" label="2FA on" />}
                {profile.avatar_url && <Button size="small" color="inherit" onClick={removeAvatar}>Remove photo</Button>}
              </Stack>
            </Box>
            <Box sx={{ minWidth: 140, width: { xs: '100%', sm: 'auto' }, pb: 1 }}>
              <Typography variant="caption" color="text.secondary">Profile {completeness}% complete</Typography>
              <LinearProgress variant="determinate" value={completeness} sx={{ height: 8, borderRadius: 4, mt: 0.5 }} />
            </Box>
          </Stack>
        </Box>
      </Card>

      {msg && <Alert severity={msg.t} sx={{ mb: 2 }} onClose={() => setMsg(null)}>{msg.m}</Alert>}

      {/* ---------- Tabs ---------- */}
      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}>
          {GROUPS.map((g) => <Tab key={g.id} label={g.label} icon={<span>{g.icon}</span>} iconPosition="start" sx={{ minHeight: 56 }} />)}
          <Tab label="Security" icon={<span>🔒</span>} iconPosition="start" sx={{ minHeight: 56 }} />
        </Tabs>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {!securityTab && (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                {GROUPS[tab].fields.map((f) => (
                  <TextField
                    key={f.key}
                    label={f.label}
                    fullWidth
                    size="small"
                    select={!!f.select}
                    multiline={f.multiline}
                    minRows={f.multiline ? 3 : undefined}
                    type={f.type || 'text'}
                    InputLabelProps={f.type === 'date' ? { shrink: true } : undefined}
                    value={profile[f.key] ?? ''}
                    onChange={(e) => set(f.key, e.target.value)}
                    sx={{ gridColumn: f.full ? { sm: '1 / -1' } : undefined }}
                  >
                    {f.select?.map((opt) => <MenuItem key={opt} value={opt}>{opt || '—'}</MenuItem>)}
                  </TextField>
                ))}
              </Box>

              {GROUPS[tab].id === 'prefs' && (
                <Stack direction="row" spacing={3} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
                  <FormControlLabel control={<Switch checked={!!profile.newsletter} onChange={(e) => set('newsletter', e.target.checked)} />} label="Newsletter" />
                  <FormControlLabel control={<Switch checked={!!profile.marketing_opt_in} onChange={(e) => set('marketing_opt_in', e.target.checked)} />} label="Marketing emails" />
                </Stack>
              )}

              <Divider sx={{ my: 3 }} />
              <Stack direction="row" justifyContent="flex-end">
                <Button variant="contained" onClick={save} disabled={saving} sx={{ minWidth: 140 }}>
                  {saving ? 'Saving…' : 'Save changes'}
                </Button>
              </Stack>
            </>
          )}

          {securityTab && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Change password</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                  <TextField label="New password" type="password" size="small" fullWidth value={newPassword} onChange={(e) => setNewPassword(e.target.value)} helperText="Min 8 characters" />
                  <Button variant="outlined" onClick={changePassword} disabled={!newPassword} sx={{ minWidth: 160, alignSelf: { xs: 'stretch', sm: 'flex-start' } }}>Update password</Button>
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Two-factor authentication</Typography>
                  <Chip size="small" color={profile.totp_enabled ? 'success' : 'default'} label={profile.totp_enabled ? 'Enabled' : 'Off'} />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Add a time-based code from an authenticator app (Google Authenticator, Authy) as a second step.
                </Typography>
                {profile.totp_enabled ? (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                    <TextField label="Code to disable" size="small" value={totpCode} onChange={(e) => setTotpCode(e.target.value)} />
                    <Button color="error" variant="outlined" onClick={() => confirmTotp(true)}>Disable 2FA</Button>
                  </Stack>
                ) : totp ? (
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>Add this key to your authenticator app, then enter the 6-digit code:</Typography>
                    <Box sx={{ fontFamily: 'monospace', fontSize: 13, bgcolor: 'action.hover', p: 1.5, borderRadius: 1, wordBreak: 'break-all', mb: 2 }}>{totp.secret}</Box>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField label="6-digit code" size="small" value={totpCode} onChange={(e) => setTotpCode(e.target.value)} />
                      <Button variant="contained" onClick={() => confirmTotp(false)}>Verify & enable</Button>
                    </Stack>
                  </Card>
                ) : (
                  <Button variant="outlined" onClick={startTotp}>Set up 2FA</Button>
                )}
              </Box>

              <Divider />

              <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'error.main', backgroundColor: (t) => t.palette.mode === 'dark' ? 'rgba(211,47,47,0.08)' : 'rgba(211,47,47,0.04)' }}>
                <Typography variant="subtitle1" color="error" sx={{ fontWeight: 700 }}>Delete account</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                  Permanently delete your account, profile and uploaded photos. This cannot be undone.
                </Typography>
                <Button color="error" variant="contained" onClick={() => setDeleteOpen(true)}>Delete my account</Button>
              </Box>
            </Stack>
          )}
        </Box>
      </Card>

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Button color="inherit" onClick={() => signOut().then(() => router.replace('/'))}>Sign out</Button>
      </Box>

      {/* ---------- Delete confirmation ---------- */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete account?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This permanently removes your account and all associated data. Type <strong>DELETE</strong> to confirm.
          </Typography>
          <TextField fullWidth size="small" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="DELETE" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" disabled={deleteConfirm !== 'DELETE'} onClick={deleteAccount}>Delete forever</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={2500} onClose={() => setToast(null)} message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Container>
  );
}
