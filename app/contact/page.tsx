'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Stack,
  Grid,
  Card,
  Link as MuiLink,
  LinearProgress,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { executeReCaptcha } from '../../lib/recaptcha';
import { event } from '../../lib/analytics';
import AdSense, { SidebarAd } from '../../components/AdSense';

// SVG Icons
const MailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const PhoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const MapPinIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  category: string;
  message: string;
  company: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface SubmissionStatus {
  stage: number;
  message: string;
}

const CONTACT_CATEGORIES = [
  'General Inquiry',
  'Technical Support',
  'Feature Request',
  'Bug Report',
  'Partnership',
  'Business Proposal',
  'Media & Press',
  'Other',
];

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: 'General Inquiry',
    message: '',
    company: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>({ stage: 0, message: '' });
  const [charCount, setCharCount] = useState(0);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);

  useEffect(() => {
    setCharCount(formData.message.length);
  }, [formData.message]);

  useEffect(() => {
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailValid(emailRegex.test(formData.email));
    } else {
      setEmailValid(null);
    }
  }, [formData.email]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Name validation
    if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      errors.name = 'Name can only contain letters and spaces';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation (optional but if provided, must be valid)
    if (formData.phone && !/^[\d\s+()-]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Subject validation
    if (formData.subject.length < 5) {
      errors.subject = 'Subject must be at least 5 characters long';
    }

    // Message validation
    if (formData.message.length < 20) {
      errors.message = 'Message must be at least 20 characters long';
    }
    if (formData.message.length > 2000) {
      errors.message = 'Message must not exceed 2000 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the validation errors before submitting');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setSubmissionStatus({ stage: 0, message: '' });

    try {
      // Stage 1: Validating form
      setSubmissionStatus({ stage: 1, message: 'Validating form data...' });
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 2: Verifying reCAPTCHA
      setSubmissionStatus({ stage: 2, message: 'Verifying you are human...' });
      const recaptchaToken = await executeReCaptcha('contact_form');

      // Track form submission attempt
      event('contact_form_submit', {
        event_category: 'Contact',
        event_label: formData.category,
        category: formData.category,
      });

      // Stage 3: Sending email
      setSubmissionStatus({ stage: 3, message: 'Sending your message...' });
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recaptchaToken }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      // Stage 4: Success
      setSubmissionStatus({ stage: 4, message: 'Message sent successfully!' });
      setSuccess(true);
      setFormData({ 
        name: '', 
        email: '', 
        phone: '',
        subject: '', 
        category: 'General Inquiry',
        message: '',
        company: '',
      });

      // Track successful submission
      event('contact_form_success', {
        event_category: 'Contact',
        event_label: formData.category,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again.');
      setSubmissionStatus({ stage: 0, message: '' });
      event('contact_form_error', {
        event_category: 'Contact',
        event_label: err.message || 'Unknown Error',
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgressValue = () => {
    if (submissionStatus.stage === 0) return 0;
    return (submissionStatus.stage / 4) * 100;
  };

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              mb: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Get in Touch
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
            Have questions about Squoosh Next? Need support or want to collaborate? We'd love to hear from you!
          </Typography>
          
          {/* Quick Stats */}
          <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap">
            <Chip icon={<CheckCircleIcon />} label="24/7 Response" color="primary" />
            <Chip icon={<CheckCircleIcon />} label="100% Secure" color="success" />
            <Chip icon={<CheckCircleIcon />} label="GDPR Compliant" color="info" />
          </Stack>
        </Box>

        <Grid container spacing={4}>
          {/* Left Column: Contact Info + Ad */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Contact Information Cards */}
              <Card
                sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MailIcon />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Email Us
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                  For general inquiries and support
                </Typography>
                <MuiLink
                  href="mailto:contact@zestcommerce.in"
                  sx={{ color: 'white', fontWeight: 600, textDecoration: 'none' }}
                >
                  contact@zestcommerce.in
                </MuiLink>
              </Card>

              <Card
                sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PhoneIcon />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Call Us
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                  Available Mon-Fri, 9AM-6PM IST
                </Typography>
                <MuiLink
                  href="tel:+917492068998"
                  sx={{ color: 'white', fontWeight: 600, textDecoration: 'none' }}
                >
                  +91 74920 68998
                </MuiLink>
              </Card>

              <Card
                sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MapPinIcon />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Visit Us
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                  Zest Tech Solution
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  India
                </Typography>
              </Card>

              {/* Sidebar Ad */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <SidebarAd />
              </Box>
            </Stack>
          </Grid>

          {/* Right Column: Contact Form */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Send us a Message
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Fill out the form below and we'll get back to you within 24 hours
              </Typography>

              {/* Submission Progress */}
              {loading && submissionStatus.stage > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Stepper activeStep={submissionStatus.stage - 1} alternativeLabel>
                    <Step><StepLabel>Validate</StepLabel></Step>
                    <Step><StepLabel>Verify</StepLabel></Step>
                    <Step><StepLabel>Send</StepLabel></Step>
                    <Step><StepLabel>Complete</StepLabel></Step>
                  </Stepper>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress variant="determinate" value={getProgressValue()} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {submissionStatus.message}
                    </Typography>
                  </Box>
                </Box>
              )}

              {success && (
                <Alert 
                  severity="success" 
                  sx={{ mb: 3 }} 
                  onClose={() => setSuccess(false)}
                  icon={<CheckCircleIcon />}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Thank you for contacting us!
                  </Typography>
                  <Typography variant="caption">
                    We'll get back to you within 24 hours. Check your email for confirmation.
                  </Typography>
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  {/* Name and Email Row */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name *"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        error={!!validationErrors.name}
                        helperText={validationErrors.name}
                        placeholder="John Doe"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address *"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        error={!!validationErrors.email}
                        helperText={validationErrors.email}
                        placeholder="john@example.com"
                        InputProps={{
                          endAdornment: emailValid !== null && (
                            <InputAdornment position="end">
                              {emailValid ? (
                                <CheckCircleIcon />
                              ) : (
                                <Typography color="error" variant="caption">✗</Typography>
                              )}
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>

                  {/* Phone and Company Row */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={loading}
                        error={!!validationErrors.phone}
                        helperText={validationErrors.phone || 'Optional'}
                        placeholder="+1 (555) 123-4567"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Company / Organization"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        disabled={loading}
                        helperText="Optional"
                        placeholder="Your Company Inc."
                      />
                    </Grid>
                  </Grid>

                  {/* Category Selection */}
                  <FormControl fullWidth>
                    <InputLabel>Inquiry Category *</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      label="Inquiry Category *"
                    >
                      {CONTACT_CATEGORIES.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Subject */}
                  <TextField
                    fullWidth
                    label="Subject *"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    error={!!validationErrors.subject}
                    helperText={validationErrors.subject}
                    placeholder="Brief description of your inquiry"
                  />

                  {/* Message */}
                  <TextField
                    fullWidth
                    label="Message *"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    multiline
                    rows={6}
                    required
                    disabled={loading}
                    error={!!validationErrors.message}
                    helperText={
                      validationErrors.message || 
                      `${charCount}/2000 characters ${charCount < 20 ? '(minimum 20)' : ''}`
                    }
                    placeholder="Please provide details about your inquiry..."
                    InputProps={{
                      sx: { position: 'relative' },
                    }}
                  />

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                      This site is protected by reCAPTCHA and the Google{' '}
                      <MuiLink href="https://policies.google.com/privacy" target="_blank">
                        Privacy Policy
                      </MuiLink>{' '}
                      and{' '}
                      <MuiLink href="https://policies.google.com/terms" target="_blank">
                        Terms of Service
                      </MuiLink>{' '}
                      apply. By submitting this form, you agree to our{' '}
                      <MuiLink href="/privacy" target="_blank">
                        Privacy Policy
                      </MuiLink>.
                    </Typography>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      sx={{
                        py: 1.5,
                        px: 4,
                        fontWeight: 700,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                        },
                      }}
                      endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Box>
                </Stack>
              </form>
            </Paper>

            {/* In-Article Ad (Mobile) */}
            <Box sx={{ mt: 4, display: { xs: 'block', md: 'none' } }}>
              <AdSense 
                slot="3456789012"
                format="fluid"
                style={{ minHeight: 250 }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Additional Info Section */}
        <Box sx={{ mt: 8 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  About Zest Tech Solution
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mb: 2 }}>
                  Founded by <strong>Naushad Alam</strong>, Zest Tech Solution is dedicated to creating innovative web solutions
                  that empower developers and users alike. Squoosh Next is our flagship image compression tool, built with
                  cutting-edge technology to provide the best client-side compression experience.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We believe in privacy-first solutions that respect user data while delivering exceptional performance.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              {/* Footer Ad */}
              <AdSense 
                slot="4567890123"
                format="auto"
                style={{ minHeight: 250 }}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
