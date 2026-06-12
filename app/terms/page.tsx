import { Container, Typography, Box, Stack, Card, Divider, Chip } from '@mui/material';

export const metadata = {
  title: 'Terms of Service - Squoosh Next',
  description: 'Terms of Service for Squoosh Next by Zest Tech Solution. Read the usage terms, license information, and disclaimer for this client-side image compression application.',
};

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using Squoosh Next (the "Application"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please discontinue use of the Application immediately. These Terms apply to all visitors, users, and others who access or use the Application, regardless of jurisdiction or device type.`,
  },
  {
    title: '2. License and Open Source',
    content: `Squoosh Next is released under the Apache License 2.0. You are granted a worldwide, royalty-free, non-exclusive license to use, reproduce, modify, and distribute the software for any lawful purpose, including commercial use, subject to the conditions of the Apache 2.0 License. The embedded WebAssembly codecs (MozJPEG, libwebp, libaom, OxiPNG, libjxl) are licensed under their respective upstream open-source licenses. Full license texts are available in the /codecs directory of the project repository.`,
  },
  {
    title: '3. Permitted Use',
    content: `You may use Squoosh Next to:\n\n• Compress, convert, resize, and edit image files for personal, commercial, or educational purposes\n• Embed or integrate the application into internal toolchains or development workflows\n• Build derivative applications based on the Apache 2.0 licensed source code\n• Process client images as part of professional design, photography, or publishing services\n• Use the application in batch automation pipelines for media asset management`,
  },
  {
    title: '4. Prohibited Use',
    content: `You may not use Squoosh Next to:\n\n• Process, distribute, or publish images that violate applicable law, including copyright infringement, obscene content, or defamatory material\n• Reverse-engineer, decompile, or extract proprietary portions of the application beyond what the Apache 2.0 license permits\n• Use the application as a vehicle for distributing malware, phishing content, or harmful code\n• Scrape, crawl, or systematically extract application data in ways that harm performance for other users\n• Misrepresent the source or authorship of Squoosh Next in commercial redistributions`,
  },
  {
    title: '5. Intellectual Property',
    content: `The Squoosh Next brand, logo, visual design, UI patterns, and marketing content are the intellectual property of Naushad Alam and Zest Tech Solution. The application source code is licensed under Apache 2.0. The name "Squoosh Next" and the "Zest Tech Solution" brand may not be used to endorse or promote derivative products without explicit written permission. Attribution to the original Google Chrome Labs Squoosh project is maintained in all code distributions.`,
  },
  {
    title: '6. Disclaimer of Warranties',
    content: `THE APPLICATION IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY EXPRESS OR IMPLIED WARRANTIES OF ANY KIND, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, OR NON-INFRINGEMENT. THE DEVELOPERS DO NOT WARRANT THAT THE APPLICATION WILL BE ERROR-FREE, UNINTERRUPTED, OR THAT ANY DEFECTS WILL BE CORRECTED. YOUR USE OF THE APPLICATION IS AT YOUR SOLE RISK.`,
  },
  {
    title: '7. Limitation of Liability',
    content: `TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL NAUSHAD ALAM, ZEST TECH SOLUTION, OR THEIR CONTRIBUTORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO USE THE APPLICATION, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, BUSINESS INTERRUPTION, OR LOSS OF REVENUE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.`,
  },
  {
    title: '8. User Responsibility for Content',
    content: `You are solely responsible for the images and content you process using the Application. All image processing occurs locally on your device. You represent and warrant that you have all necessary rights, licenses, and permissions to process any image files you submit to the Application, and that such processing does not infringe the intellectual property rights, privacy rights, or other rights of any third party.`,
  },
  {
    title: '9. Third-Party Services',
    content: `The Application integrates with third-party services including Google Analytics, Google Adsense, Google reCAPTCHA v3, and Vercel hosting infrastructure. Your use of those services is governed by their respective terms of service and privacy policies. We are not responsible for the privacy practices or content of third-party services.`,
  },
  {
    title: '10. Modifications to the Application',
    content: `We reserve the right to modify, suspend, or discontinue the Application or any feature thereof at any time, with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the Application or any part thereof.`,
  },
  {
    title: '11. Modifications to These Terms',
    content: `We reserve the right to revise these Terms at any time. Updated Terms will be posted on this page with a revised "Last Updated" date. Your continued use of the Application following the posting of revised Terms constitutes your acceptance of those changes.`,
  },
  {
    title: '12. Governing Law',
    content: `These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts located in India.`,
  },
  {
    title: '13. Contact Information',
    content: `For questions, licensing inquiries, or legal notices regarding these Terms, please contact:\n\nNaushad Alam — Lead Developer & Founder, Zest Tech Solution\nEmail: contact@zestcommerce.in\nWhatsApp: +91 7492068998\nWebsite: zesttechsolution.cloud`,
  },
];

export default function TermsPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ mb: 6 }}>
        <Chip label="Legal Document" variant="outlined" sx={{ mb: 2, fontWeight: 700 }} />
        <Typography variant="h2" component="h1" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: '-0.5px' }}>
          Terms of Service
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Typography variant="caption" color="text.secondary">Last Updated: June 12, 2026</Typography>
          <Typography variant="caption" color="text.secondary">Effective Date: June 12, 2026</Typography>
          <Typography variant="caption" color="text.secondary">License: Apache 2.0</Typography>
        </Stack>
      </Box>

      <Card sx={{ p: 4, mb: 5, border: '1px solid', borderColor: 'primary.main', bgcolor: 'background.paper' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Summary</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          Squoosh Next is free to use for personal and commercial purposes under the Apache 2.0 license. You are responsible for the content you process. Images never leave your device. Third-party services (Google Analytics, Adsense, reCAPTCHA) are subject to their own terms.
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
