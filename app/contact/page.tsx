import { Container, Typography, Box, Stack, TextField, Button, Card, Grid } from '@mui/material';

export const metadata = {
  title: 'Contact Us - Squoosh Next',
  description: 'Get in touch with the Squoosh Next support team.',
};

export default function ContactPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
          Contact Support
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Have questions, feature requests, or bug reports? We would love to hear from you.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Send Us a Message</Typography>
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Your Name" variant="outlined" size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email Address" variant="outlined" size="small" />
                </Grid>
              </Grid>
              <TextField fullWidth label="Subject" variant="outlined" size="small" />
              <TextField fullWidth label="Message" variant="outlined" multiline rows={4} />
              <Button variant="contained" color="primary" sx={{ width: 'fit-content', fontWeight: 700 }}>
                Submit Ticket
              </Button>
            </Stack>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Contact Details</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Business Name:</strong> Zest Tech Solution
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Owner:</strong> Naushad Alam
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>WhatsApp / Phone:</strong> +91 7492068998
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Email:</strong> <a href="mailto:contact@zestcommerce.in" style={{ color: 'inherit', textDecoration: 'underline' }}>contact@zestcommerce.in</a>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Website:</strong> <a href="https://zesttechsolution.cloud" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>https://zesttechsolution.cloud</a>
              </Typography>
            </Card>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Client-Side Operation</Typography>
              <Typography variant="body2" color="text.secondary">
                Please note that Squoosh Next runs fully on your device. We do not store or process your images on our servers.
              </Typography>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
