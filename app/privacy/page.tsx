import { Container, Typography, Box, Stack, Card, Divider, Chip } from '@mui/material';

export const metadata = {
  title: 'Privacy Policy - Squoosh Next',
  description: 'Read the complete Squoosh Next Privacy Policy. Learn how we protect your data with our 100% client-side, serverless image compression architecture.',
};

const SECTIONS = [
  {
    title: '1. Overview and Architecture',
    content: `Squoosh Next is engineered as a fully client-side web application. All image compression, format conversion, resizing, editing, and metadata operations execute entirely within your browser using WebAssembly modules and the HTML5 Canvas API. No image file data, pixel data, or binary content is transmitted to any external server, cloud storage bucket, or third-party API at any point during the compression workflow. This architecture is Privacy by Design at the infrastructure level — your files physically cannot leave your device during processing because there is no server-side upload endpoint.`,
  },
  {
    title: '2. Data We Do Not Collect',
    content: `We do not collect, process, store, or transmit the following categories of data:\n\n• Your image files, pixel data, or binary content\n• EXIF metadata embedded in your photos (GPS coordinates, camera models, timestamps)\n• File names, file paths, or directory structures\n• Compression settings or configuration choices you apply\n• Output image data or processed results\n• Browser fingerprinting data or unique device identifiers\n• IP-level geo-location data beyond standard CDN routing`,
  },
  {
    title: '3. Browser Local Storage',
    content: `Squoosh Next writes a small number of preference keys to your browser's localStorage. These keys store UI state such as your selected color theme (e.g., "dark" or "light"), font size preferences, and accessibility panel configurations. This data never leaves your device, is not associated with any account, and can be removed at any time by clearing your browser's site data for this domain.`,
  },
  {
    title: '4. Google Analytics',
    content: `We use Google Analytics (GA4) to collect aggregated, anonymized usage metrics. This includes standard web analytics such as page views, session duration, browser type, and device category. Google Analytics does not receive your image files. We do not enable User-ID linking or cross-site tracking. You may opt out of Google Analytics collection by installing the official Google Analytics Opt-out Browser Add-on, or by using a browser with a content blocker that filters analytics scripts.`,
  },
  {
    title: '5. Google Adsense',
    content: `Squoosh Next may display advertisements served by Google Adsense. Google uses cookies and similar technologies to serve relevant ads based on your general browsing history. For information about Google's advertising privacy practices and how to manage ad personalization, please review the Google Privacy & Terms documentation at policies.google.com. You can opt out of personalized advertising through Google's Ad Settings.`,
  },
  {
    title: '6. Google reCAPTCHA v3',
    content: `Our contact form integrates Google reCAPTCHA v3 to prevent automated spam submissions. reCAPTCHA collects hardware and software information (such as device and application data) to distinguish humans from bots. This data is sent to Google and processed under Google's Privacy Policy. No reCAPTCHA data collection occurs on pages other than the contact form.`,
  },
  {
    title: '7. Third-Party CDN and Hosting',
    content: `Squoosh Next is hosted on Vercel's global Edge Network. When you visit this application, Vercel's infrastructure processes your HTTP request to serve the static application bundle. Vercel may log standard server-side metadata such as request timestamps, HTTP status codes, and geographic region data for operational purposes. These logs are governed by Vercel's Privacy Policy and are not shared with us in personally identifiable form.`,
  },
  {
    title: '8. Security',
    content: `The application is served exclusively over HTTPS with TLS encryption. WebAssembly execution contexts are sandboxed within your browser's security model. We do not operate any user authentication system, meaning there are no accounts, passwords, or session tokens associated with Squoosh Next usage. The absence of server-side image processing eliminates an entire class of server-side security vulnerabilities.`,
  },
  {
    title: '9. Children\'s Privacy',
    content: `Squoosh Next is a general-purpose developer and design tool. We do not knowingly collect any information from children under the age of 13. The application does not contain age-gating, user registration, or any mechanism by which we could identify or collect data from minors.`,
  },
  {
    title: '10. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time to reflect changes in legal requirements, third-party service terms, or application features. The "Last Updated" date at the top of this document indicates when the most recent revision was made. Continued use of the application after a policy update constitutes acceptance of the revised terms.`,
  },
  {
    title: '11. Contact',
    content: `If you have questions, concerns, or requests related to this Privacy Policy or your data rights, please contact:\n\nNaushad Alam — Lead Developer & Founder, Zest Tech Solution\nEmail: contact@zestcommerce.in\nWhatsApp: +91 7492068998\nWebsite: zesttechsolution.cloud`,
  },
];

export default function PrivacyPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ mb: 6 }}>
        <Chip label="Legal Document" variant="outlined" sx={{ mb: 2, fontWeight: 700 }} />
        <Typography variant="h2" component="h1" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: '-0.5px' }}>
          Privacy Policy
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Typography variant="caption" color="text.secondary">Last Updated: June 12, 2026</Typography>
          <Typography variant="caption" color="text.secondary">Effective Date: June 12, 2026</Typography>
          <Typography variant="caption" color="text.secondary">Jurisdiction: Global</Typography>
        </Stack>
      </Box>

      <Card sx={{ p: 4, mb: 5, bgcolor: 'success.main', color: 'white' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Zero Image Upload Policy</Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.7, opacity: 0.95 }}>
          Your image files are never uploaded to any server. All processing occurs locally in your browser using WebAssembly. Squoosh Next has no server-side upload endpoints — this is an architectural guarantee, not just a policy statement.
        </Typography>
      </Card>

      <Stack spacing={5}>
        {SECTIONS.map((section, idx) => (
          <Box key={idx}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
              {section.title}
            </Typography>
            {section.content.split('\n\n').map((paragraph, pIdx) => (
              paragraph.startsWith('•') ? (
                <Box key={pIdx} component="ul" sx={{ pl: 3, mt: 1, mb: 1 }}>
                  {paragraph.split('\n').map((line, lIdx) => (
                    <Typography key={lIdx} component="li" variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 0.5 }}>
                      {line.replace('• ', '')}
                    </Typography>
                  ))}
                </Box>
              ) : (
                <Typography key={pIdx} variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 1, whiteSpace: 'pre-line' }}>
                  {paragraph}
                </Typography>
              )
            ))}
            {idx < SECTIONS.length - 1 && <Divider sx={{ mt: 4 }} />}
          </Box>
        ))}
      </Stack>
    </Container>
  );
}
