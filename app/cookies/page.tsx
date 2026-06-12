import { Container, Typography, Box, Stack, Card, Chip, Divider, Grid } from '@mui/material';

export const metadata = {
  title: 'Cookie Policy - Squoosh Next',
  description: 'Read the complete Squoosh Next Cookie Policy. Learn how we use browser local storage, session storage, and third-party cookies for analytics and advertising.',
};

const COOKIE_TABLE = [
  {
    name: 'squoosh-theme',
    type: 'Local Storage (Preference)',
    provider: 'Squoosh Next (First-Party)',
    purpose: 'Stores your selected color theme (light/dark/custom preset) so the application remembers your preference across sessions.',
    expiry: 'Persistent (until cleared)',
    necessary: true,
  },
  {
    name: 'squoosh-font-size',
    type: 'Local Storage (Preference)',
    provider: 'Squoosh Next (First-Party)',
    purpose: 'Stores your configured base font size from the accessibility dashboard.',
    expiry: 'Persistent (until cleared)',
    necessary: true,
  },
  {
    name: 'squoosh-accessibility',
    type: 'Local Storage (Preference)',
    provider: 'Squoosh Next (First-Party)',
    purpose: 'Stores accessibility panel settings including contrast filters, motion preferences, and cursor aids.',
    expiry: 'Persistent (until cleared)',
    necessary: true,
  },
  {
    name: '_ga, _ga_*',
    type: 'Cookie (Analytics)',
    provider: 'Google Analytics (Third-Party)',
    purpose: 'Distinguishes individual users for aggregate analytics. Used to calculate session counts, user counts, and behavioural metrics.',
    expiry: '2 years',
    necessary: false,
  },
  {
    name: '_gid',
    type: 'Cookie (Analytics)',
    provider: 'Google Analytics (Third-Party)',
    purpose: 'Distinguishes users for a single analytics session. Expires after 24 hours.',
    expiry: '24 hours',
    necessary: false,
  },
  {
    name: 'CONSENT, SOCS',
    type: 'Cookie (Consent Management)',
    provider: 'Google (Third-Party)',
    purpose: 'Records your consent choices for Google advertising and analytics cookies.',
    expiry: '13 months',
    necessary: false,
  },
  {
    name: '__Secure-3PAPISID, __Secure-3PSID',
    type: 'Cookie (Advertising)',
    provider: 'Google Adsense (Third-Party)',
    purpose: 'Used by Google to build a profile of your interests and show you relevant advertisements on other sites.',
    expiry: '2 years',
    necessary: false,
  },
  {
    name: 'grecaptcha',
    type: 'Cookie (Security)',
    provider: 'Google reCAPTCHA (Third-Party)',
    purpose: 'Used to verify that form submissions are made by humans, not automated bots. Only active on the /contact page.',
    expiry: 'Session',
    necessary: false,
  },
];

export default function CookiesPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ mb: 6 }}>
        <Chip label="Legal Document" variant="outlined" sx={{ mb: 2, fontWeight: 700 }} />
        <Typography variant="h2" component="h1" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: '-0.5px' }}>
          Cookie Policy
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Typography variant="caption" color="text.secondary">Last Updated: June 12, 2026</Typography>
          <Typography variant="caption" color="text.secondary">Effective Date: June 12, 2026</Typography>
        </Stack>
      </Box>

      {/* Intro */}
      <Stack spacing={4} sx={{ mb: 6 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>1. What Are Cookies and Local Storage?</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
            Cookies are small text files placed on your device by websites you visit. They are used to make websites work efficiently and to provide information to website owners. Local Storage is a similar browser mechanism that stores key-value pairs locally on your device, unlike cookies it is not transmitted with HTTP requests.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            Squoosh Next uses both browser Local Storage (for first-party preferences) and third-party cookies (via Google services for analytics, advertising, and security). This policy explains each in detail.
          </Typography>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>2. Strictly Necessary Storage</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
            Squoosh Next writes the following items to your browser's Local Storage. These are strictly necessary for the application to function correctly according to your preferences. They do not track you, are never transmitted to external servers, and contain no personally identifiable information.
          </Typography>
          <Stack spacing={2}>
            {COOKIE_TABLE.filter(c => c.necessary).map((cookie) => (
              <Card key={cookie.name} variant="outlined" sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>{cookie.name}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip label="Necessary" color="success" size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                    <Chip label={cookie.provider} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.65rem' }} />
                  </Stack>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 0.5 }}>
                  {cookie.purpose}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>Expiry:</strong> {cookie.expiry} &bull; <strong>Type:</strong> {cookie.type}
                </Typography>
              </Card>
            ))}
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>3. Third-Party Cookies</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
            The following third-party cookies are set by Google services integrated into Squoosh Next. These cookies are governed by Google's Privacy Policy and Cookie Policy. You can manage or opt out of these cookies using the controls described in Section 5.
          </Typography>
          <Stack spacing={2}>
            {COOKIE_TABLE.filter(c => !c.necessary).map((cookie) => (
              <Card key={cookie.name} variant="outlined" sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: 'monospace', wordBreak: 'break-all' }}>{cookie.name}</Typography>
                  <Stack direction="row" spacing={1} flexShrink={0} sx={{ ml: 1 }}>
                    <Chip label="Third-Party" color="warning" size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                  </Stack>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 0.5 }}>
                  <strong>Provider:</strong> {cookie.provider}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 0.5 }}>
                  {cookie.purpose}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>Expiry:</strong> {cookie.expiry} &bull; <strong>Type:</strong> {cookie.type}
                </Typography>
              </Card>
            ))}
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>4. Cookies We Do NOT Use</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
            Squoosh Next does not use the following types of cookies or tracking technologies:
          </Typography>
          <Grid container spacing={2}>
            {['Session recording cookies', 'Heatmap or mouse tracking cookies', 'A/B testing cookies', 'Social media tracking pixels', 'Cross-site tracking identifiers', 'Fingerprinting scripts'].map((item) => (
              <Grid item xs={12} sm={6} key={item}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary">{item}</Typography>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>5. How to Manage Cookies</Typography>
          <Stack spacing={2}>
            <Card variant="outlined" sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Browser Settings</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                All major browsers allow you to control cookies through their settings. You can block all cookies, delete existing cookies, or configure exceptions. Note that blocking strictly necessary Local Storage items may impair application functionality (e.g., theme preferences will not be saved).
              </Typography>
            </Card>
            <Card variant="outlined" sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Google Analytics Opt-Out</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Install the Google Analytics Opt-out Browser Add-on (available for Chrome, Firefox, Safari, and Edge) to prevent your data from being included in Google Analytics reports across all websites.
              </Typography>
            </Card>
            <Card variant="outlined" sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Google Ad Personalization</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Visit Google's Ad Settings (adssettings.google.com) to opt out of personalized advertising. You can also opt out through the Network Advertising Initiative at optout.networkadvertising.org.
              </Typography>
            </Card>
            <Card variant="outlined" sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Clear Local Storage</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                To remove all Squoosh Next first-party preferences, open your browser DevTools (F12), navigate to Application → Local Storage → this domain, and delete all entries. Alternatively, use your browser's "Clear Site Data" option.
              </Typography>
            </Card>
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>6. Contact</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            If you have questions about our cookie practices, please contact Naushad Alam at contact@zestcommerce.in or via WhatsApp at +91 7492068998. We aim to respond to cookie-related inquiries within 5 business days.
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
}
