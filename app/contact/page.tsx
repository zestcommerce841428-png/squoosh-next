'use client';

import { useState } from 'react';
import {
  Container, Typography, Box, Stack, TextField, Button, Card, Grid,
  Alert, Chip, CircularProgress, Divider, Paper,
} from '@mui/material';

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface Errors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = 'Name is required.';
  if (!f.email.trim()) e.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email address.';
  if (!f.subject.trim()) e.subject = 'Subject is required.';
  if (f.message.trim().length < 20) e.message = 'Message must be at least 20 characters.';
  return e;
}

const CONTACT_EMAIL = 'contact@zestcommerce.in';

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setStatus('sending');
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    const subject = encodeURIComponent(`[Squoosh Next] ${form.subject}`);
    const a = document.createElement('a');
    a.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => { setStatus('sent'); setForm({ name: '', email: '', subject: '', message: '' }); }, 600);
  };

  const topicPresets = [
    { label: 'Bug Report', subj: 'Bug Report: [describe the issue]', color: '#ef4444' },
    { label: 'Feature Request', subj: 'Feature Request: [describe the feature]', color: '#8b5cf6' },
    { label: 'Enterprise / Licensing', subj: 'Enterprise Inquiry', color: '#0ea5e9' },
    { label: 'General Question', subj: 'General Question: [topic]', color: '#10b981' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Chip label="Open Source — Apache 2.0" variant="outlined" color="primary" sx={{ mb: 2, fontWeight: 700 }} />
        <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, letterSpacing: '-0.5px' }}>
          Get in Touch
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 560, mx: 'auto', lineHeight: 1.7 }}>
          Bug reports, feature ideas, licensing questions, or just want to say hello — we read every message.
        </Typography>
      </Box>

      <Stack direction="row" spacing={1.5} flexWrap="wrap" justifyContent="center" sx={{ mb: 6 }}>
        {topicPresets.map(t => (
          <Button key={t.label} size="small" variant="outlined"
            onClick={() => setForm(prev => ({ ...prev, subject: t.subj }))}
            sx={{ borderColor: t.color, color: t.color, fontWeight: 700, '&:hover': { bgcolor: t.color + '18', borderColor: t.color } }}>
            {t.label}
          </Button>
        ))}
      </Stack>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Send a Message</Typography>

            {status === 'sent' && (
              <Alert severity="success" sx={{ mb: 3 }} onClose={() => setStatus('idle')}>
                Your email client opened with the message pre-filled. If it did not open, email us directly at <strong>{CONTACT_EMAIL}</strong>.
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2.5}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Your Name" size="small" required
                      value={form.name} onChange={handleChange('name')}
                      error={!!errors.name} helperText={errors.name} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Email Address" size="small" required type="email"
                      value={form.email} onChange={handleChange('email')}
                      error={!!errors.email} helperText={errors.email} />
                  </Grid>
                </Grid>
                <TextField fullWidth label="Subject" size="small" required
                  value={form.subject} onChange={handleChange('subject')}
                  error={!!errors.subject} helperText={errors.subject} />
                <TextField fullWidth label="Message" required multiline rows={5}
                  value={form.message} onChange={handleChange('message')}
                  error={!!errors.message} helperText={errors.message || 'Minimum 20 characters'}
                  inputProps={{ minLength: 20 }} />
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button type="submit" variant="contained" color="primary" size="large"
                    disabled={status === 'sending'}
                    sx={{ fontWeight: 700, px: 4 }}
                    startIcon={status === 'sending' ? <CircularProgress size={16} color="inherit" /> : null}>
                    {status === 'sending' ? 'Opening…' : 'Send Message'}
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Opens your email app with the message pre-filled.
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Contact Details</Typography>
              <Stack spacing={1.2}>
                {([
                  ['Business', 'Zest Tech Solution', null],
                  ['Founder', 'Naushad Alam', null],
                  ['WhatsApp', '+91 7492068998', 'https://wa.me/917492068998'],
                  ['Email', CONTACT_EMAIL, `mailto:${CONTACT_EMAIL}`],
                  ['Website', 'zesttechsolution.cloud', 'https://zesttechsolution.cloud'],
                ] as [string, string, string | null][]).map(([k, v, href]) => (
                  <Stack key={k} direction="row" spacing={1.5} alignItems="flex-start">
                    <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 72, color: 'text.secondary', pt: '2px' }}>{k}</Typography>
                    {href ? (
                      <Typography variant="body2" component="a" href={href} target={href.startsWith('mailto') ? undefined : '_blank'} rel="noopener noreferrer"
                        sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{v}</Typography>
                    ) : (
                      <Typography variant="body2">{v}</Typography>
                    )}
                  </Stack>
                ))}
              </Stack>
            </Card>

            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>Response Times</Typography>
              <Stack spacing={1}>
                {([
                  ['Bug Reports', '24–48 hours'],
                  ['Feature Requests', '3–5 business days'],
                  ['Enterprise / Licensing', '1–2 business days'],
                  ['General Questions', '2–3 business days'],
                ] as [string, string][]).map(([t, r]) => (
                  <Stack key={t} direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">{t}</Typography>
                    <Chip label={r} size="small" variant="outlined" sx={{ fontSize: '0.65rem', fontWeight: 700 }} />
                  </Stack>
                ))}
              </Stack>
            </Card>

            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'success.main', color: 'white', border: 'none' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>Privacy First</Typography>
              <Typography variant="caption" sx={{ lineHeight: 1.7 }}>
                All image processing happens on your device. We never receive or store your images.
              </Typography>
            </Paper>

            <Divider />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>GitHub Issues</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                For bugs and feature requests you can also open an issue on the project repository using the Bug Report or Feature Request templates.
              </Typography>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
