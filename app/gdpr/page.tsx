import { Container, Typography, Box, Stack, Card, Grid, Chip, Divider } from '@mui/material';

export const metadata = {
  title: 'GDPR Compliance - Squoosh Next',
  description: 'Squoosh Next GDPR compliance statement. Learn how our Privacy by Design architecture guarantees EU General Data Protection Regulation compliance.',
};

const RIGHTS = [
  { right: 'Right of Access (Art. 15)', description: 'You have the right to know what personal data we hold about you. Because Squoosh Next does not collect personal data on our servers, there is nothing stored to access. Any preference data is held exclusively in your own browser\'s local storage.' },
  { right: 'Right to Rectification (Art. 16)', description: 'You can correct any inaccurate data. Local storage preferences can be modified or cleared at any time through your browser settings.' },
  { right: 'Right to Erasure (Art. 17)', description: 'You have the right to have your data deleted. Clear your browser\'s local storage and cookies for this domain to immediately erase all locally stored preferences. No server-side erasure request is necessary because no server-side data exists.' },
  { right: 'Right to Restriction (Art. 18)', description: 'You may restrict processing of your data. Since all processing is local and voluntary, you control it directly — simply stop using the application or clear local storage.' },
  { right: 'Right to Data Portability (Art. 20)', description: 'You have the right to receive your data in a portable format. Browser DevTools (Application → Local Storage) allows you to inspect and export any stored preference keys at any time.' },
  { right: 'Right to Object (Art. 21)', description: 'You may object to data processing. Analytics collection can be blocked using a browser content filter or the Google Analytics Opt-out Add-on. No objection mechanism is required for image processing, as it is inherently local.' },
];

const LAWFUL_BASES = [
  { basis: 'Legitimate Interests', scope: 'Aggregated, anonymized website analytics (Google Analytics) to understand how users navigate the application — no individual profiling.' },
  { basis: 'Consent', scope: 'Advertising personalization via Google Adsense, where applicable based on your browser consent state and regional requirements.' },
  { basis: 'No Basis Required', scope: 'Image processing, format conversion, and compression. These operations never involve personal data reaching our servers — they are purely local operations.' },
];

export default function GDPRPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ mb: 6 }}>
        <Chip label="EU Regulation (2016/679)" variant="outlined" color="primary" sx={{ mb: 2, fontWeight: 700 }} />
        <Typography variant="h2" component="h1" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: '-0.5px' }}>
          GDPR Compliance
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
          General Data Protection Regulation — European Union Statement
        </Typography>
        <Typography variant="caption" color="text.secondary">Effective Date: June 12, 2026</Typography>
      </Box>

      {/* Architecture Statement */}
      <Card sx={{ p: 4, mb: 5, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Privacy by Design — GDPR Article 25</Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.8, opacity: 0.95 }}>
          Squoosh Next is designed from the ground up to minimise personal data processing. Image files, which may contain biometric data (faces), sensitive location data (GPS EXIF), or proprietary commercial content, are processed exclusively on your local device. This architectural choice satisfies the GDPR's data minimisation and privacy by design requirements without requiring any legal workaround.
        </Typography>
      </Card>

      {/* Data Controller */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Data Controller Information</Typography>
        <Card variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={1}>
            <Typography variant="body1"><strong>Controller:</strong> Naushad Alam, trading as Zest Tech Solution</Typography>
            <Typography variant="body1"><strong>Contact Email:</strong> contact@zestcommerce.in</Typography>
            <Typography variant="body1"><strong>WhatsApp:</strong> +91 7492068998</Typography>
            <Typography variant="body1"><strong>Website:</strong> zesttechsolution.cloud</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
              As the Data Controller, Naushad Alam is responsible for determining the purposes and means of any personal data processing associated with this Application. For EU data subject requests, please use the contact details above.
            </Typography>
          </Stack>
        </Card>
      </Box>

      <Divider sx={{ mb: 6 }} />

      {/* What Data We Process */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Personal Data We Process</Typography>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>Data We DO NOT Process (Server-Side)</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              Image files (including any biometric data, GPS coordinates, or identifiable content they contain) are never transmitted to our servers. There is no server-side upload endpoint, no cloud processing queue, and no third-party image analysis API involved in the compression workflow. GDPR does not require consent for data that never reaches us.
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>Analytics Data (Anonymized)</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              Google Analytics 4 collects anonymized session metrics including page views, session duration, general geographic region (country-level), browser type, and device category. IP addresses are anonymized before processing under GA4's data collection model. This data is aggregated and does not identify individual users.
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>Contact Form Data</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              When you submit the contact form, your name, email address, and message content are processed to respond to your inquiry. This data is not stored in any database and is handled exclusively through email communication. reCAPTCHA v3 processes behavioral signals to validate the form submission.
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ mb: 6 }} />

      {/* Lawful Bases */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Lawful Basis for Processing</Typography>
        <Stack spacing={2}>
          {LAWFUL_BASES.map((item) => (
            <Card key={item.basis} variant="outlined" sx={{ p: 3 }}>
              <Chip label={item.basis} color="primary" size="small" sx={{ mb: 1.5, fontWeight: 700 }} />
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {item.scope}
              </Typography>
            </Card>
          ))}
        </Stack>
      </Box>

      <Divider sx={{ mb: 6 }} />

      {/* Data Subject Rights */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Your Rights Under GDPR</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          As a data subject under the GDPR, you have the following rights. Given our privacy-by-design architecture, many of these rights are automatically satisfied.
        </Typography>
        <Grid container spacing={3}>
          {RIGHTS.map((item) => (
            <Grid item xs={12} key={item.right}>
              <Card variant="outlined" sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>{item.right}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {item.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ mb: 6 }} />

      {/* Data Retention */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Data Retention</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
          <strong>Local Storage Preferences:</strong> Retained indefinitely in your browser until you clear site data. No expiry is set by us; retention is controlled by your browser settings.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
          <strong>Analytics Data:</strong> Google Analytics retains event data for 14 months by default, per GA4 standard configuration. This is aggregated and anonymized.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
          <strong>Contact Form Submissions:</strong> Email correspondence is retained for the duration of the inquiry and reasonable follow-up period, not exceeding 12 months.
        </Typography>
      </Box>

      {/* Supervisory Authority */}
      <Card variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>Right to Lodge a Complaint</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
          If you believe your GDPR rights have been violated, you have the right to lodge a complaint with your local Data Protection Authority (DPA). EU residents can find their national DPA at edpb.europa.eu/about-edpb/about-edpb/members_en. We encourage you to contact us first at contact@zestcommerce.in so we can resolve any concerns directly and promptly.
        </Typography>
      </Card>
    </Container>
  );
}
