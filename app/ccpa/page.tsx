import { Container, Typography, Box, Stack, Card, Grid, Chip, Divider } from '@mui/material';

export const metadata = {
  title: 'CCPA Compliance - Squoosh Next',
  description: 'Squoosh Next California Consumer Privacy Act (CCPA) compliance statement. Learn about your California privacy rights and how we protect your personal information.',
};

const CA_RIGHTS = [
  {
    right: 'Right to Know',
    description: 'You have the right to know what categories of personal information we collect about you, the purposes for which it is used, and whether it is disclosed or sold. See the disclosure table below for full details.',
  },
  {
    right: 'Right to Delete',
    description: 'You have the right to request deletion of personal information we have collected from you. Because Squoosh Next stores no personal information on our servers, there is no server-side data to delete. Clear your browser\'s local storage to remove any locally held preferences.',
  },
  {
    right: 'Right to Opt-Out of Sale',
    description: 'You have the right to opt out of the sale of your personal information. Squoosh Next does not sell personal information to data brokers, advertisers, or third parties. Google Adsense may use advertising cookies, which you can opt out of through Google\'s Ad Settings.',
  },
  {
    right: 'Right to Non-Discrimination',
    description: 'We will not discriminate against you for exercising your CCPA rights. All features of Squoosh Next are available to all users regardless of whether they have exercised privacy rights.',
  },
  {
    right: 'Right to Correct (CPRA)',
    description: 'Under the California Privacy Rights Act (CPRA), you have the right to correct inaccurate personal information. Browser local storage preferences can be modified directly through your browser\'s developer tools.',
  },
  {
    right: 'Right to Limit Use of Sensitive Personal Information (CPRA)',
    description: 'Squoosh Next does not collect sensitive personal information as defined by the CPRA (e.g., Social Security numbers, financial data, biometric data, precise geolocation). Image EXIF data is processed exclusively on your local device and never transmitted to our servers.',
  },
];

const DATA_TABLE = [
  { category: 'Identifiers', examples: 'IP address (anonymized, via Google Analytics)', collected: 'Yes (anonymized)', sold: 'No', purpose: 'Aggregate analytics' },
  { category: 'Internet Activity', examples: 'Pages visited, session duration, browser type', collected: 'Yes (anonymized)', sold: 'No', purpose: 'Aggregate analytics' },
  { category: 'Image / Media Files', examples: 'Photos, graphics, design files', collected: 'No — local only', sold: 'No', purpose: 'Client-side compression' },
  { category: 'Geolocation', examples: 'Country-level region (Google Analytics)', collected: 'Yes (country only)', sold: 'No', purpose: 'Aggregate analytics' },
  { category: 'Contact Data', examples: 'Name, email (contact form)', collected: 'Yes (when submitted)', sold: 'No', purpose: 'Responding to inquiries' },
  { category: 'Advertising Data', examples: 'Cookie-based ad signals (Google Adsense)', collected: 'Third-party', sold: 'No', purpose: 'Ad personalization (opt-out available)' },
];

export default function CCPAPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ mb: 6 }}>
        <Chip label="California Civil Code § 1798.100 et seq." variant="outlined" color="primary" sx={{ mb: 2, fontWeight: 700 }} />
        <Typography variant="h2" component="h1" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: '-0.5px' }}>
          CCPA Compliance
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
          California Consumer Privacy Act — Privacy Rights Statement
        </Typography>
        <Typography variant="caption" color="text.secondary">Effective Date: June 12, 2026</Typography>
      </Box>

      <Card sx={{ p: 4, mb: 5, bgcolor: 'success.main', color: 'white' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>We Do Not Sell Your Personal Information</Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.8, opacity: 0.95 }}>
          Squoosh Next has never sold, and does not sell, personal information to third parties, data brokers, or advertising networks. Your image files are never transmitted to our servers. Under CCPA Section 1798.120, you have the right to opt out of the sale of personal information — but there is nothing to opt out of at Squoosh Next.
        </Typography>
      </Card>

      {/* Applicability */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Who This Statement Applies To</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
          This CCPA Privacy Statement applies to California residents who use Squoosh Next and supplements our general Privacy Policy. The CCPA grants California consumers specific rights regarding their personal information, as defined under California Civil Code Section 1798.100 et seq. and expanded by the California Privacy Rights Act (CPRA, effective January 2023).
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
          Even if you are not a California resident, the same protections described here apply to your use of the Application, reflecting our commitment to global privacy standards.
        </Typography>
      </Box>

      <Divider sx={{ mb: 6 }} />

      {/* Data Collection Disclosure Table */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Personal Information Disclosure (CCPA Section 1798.110)</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
          The following table discloses the categories of personal information collected in the past 12 months, whether it is sold, and the business purpose for collection:
        </Typography>
        <Stack spacing={2}>
          {DATA_TABLE.map((row) => (
            <Card key={row.category} variant="outlined" sx={{ p: 3 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{row.category}</Typography>
                <Stack direction="row" spacing={1}>
                  <Chip label={row.collected} size="small" color={row.collected === 'No — local only' ? 'success' : 'default'} sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                  <Chip label={`Sold: ${row.sold}`} size="small" color="success" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                </Stack>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                <strong>Examples:</strong> {row.examples}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Purpose:</strong> {row.purpose}
              </Typography>
            </Card>
          ))}
        </Stack>
      </Box>

      <Divider sx={{ mb: 6 }} />

      {/* California Rights */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Your California Privacy Rights</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          As a California consumer, you have the following rights under the CCPA and CPRA:
        </Typography>
        <Grid container spacing={3}>
          {CA_RIGHTS.map((item) => (
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

      {/* How to Submit a Request */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>How to Submit a Privacy Request</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
          To exercise your CCPA rights, submit a verifiable consumer request by contacting us using the information below. We will respond within 45 days. If we need additional time (up to 90 days total), we will notify you in writing of the extension and the reason.
        </Typography>
        <Card variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={1}>
            <Typography variant="body1"><strong>Data Controller:</strong> Naushad Alam, Zest Tech Solution</Typography>
            <Typography variant="body1"><strong>Email:</strong> contact@zestcommerce.in</Typography>
            <Typography variant="body1"><strong>WhatsApp:</strong> +91 7492068998</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
              Please include "CCPA Privacy Request" in your subject line and specify which right(s) you wish to exercise. We may ask you to verify your identity to protect the security of your information.
            </Typography>
          </Stack>
        </Card>
      </Box>

      <Card variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>Authorized Agents</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
          You may designate an authorized agent to submit CCPA requests on your behalf. We will require written proof of the agent's authorization and may verify your identity directly before processing the request.
        </Typography>
      </Card>
    </Container>
  );
}
