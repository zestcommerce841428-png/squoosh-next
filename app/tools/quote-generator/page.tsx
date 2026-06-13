'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, TextField, Box, Button, Slider } from '@mui/material';
import { ToolLayout } from '@/components/ToolComponents';

export default function QuoteGeneratorPage() {
  const [quoteUrl, setQuoteUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [quote, setQuote] = useState<string>('The only way to do great work is to love what you do.');
  const [author, setAuthor] = useState<string>('- Steve Jobs');
  const [fontSize, setFontSize] = useState<number>(48);
  const [bgColor, setBgColor] = useState<string>('#1e293b');

  const generateQuote = async () => {
    if (!quote) return;

    setProcessing(true);
    setError(null);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d')!;

      // Background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 1080, 1080);

      // Quote
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `${fontSize}px Georgia`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const words = quote.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      words.forEach(word => {
        const testLine = currentLine + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 900 && currentLine !== '') {
          lines.push(currentLine);
          currentLine = word + ' ';
        } else {
          currentLine = testLine;
        }
      });
      lines.push(currentLine);

      const lineHeight = fontSize * 1.5;
      const totalHeight = lines.length * lineHeight;
      let startY = (1080 - totalHeight) / 2;

      lines.forEach(line => {
        ctx.fillText(line.trim(), 540, startY);
        startY += lineHeight;
      });

      // Author
      if (author) {
        ctx.font = `italic ${fontSize * 0.6}px Georgia`;
        ctx.fillText(author, 540, startY + 80);
      }

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      const url = URL.createObjectURL(blob);
      setQuoteUrl(url);
    } catch (err) {
      setError('Quote generation failed.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadQuote = () => {
    if (!quoteUrl) return;
    const a = document.createElement('a');
    a.href = quoteUrl;
    a.download = 'quote-1080x1080.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setQuoteUrl(null);
    setError(null);
  };

  return (
    <ToolLayout
      title="Quote Generator"
      description="Create beautiful quote graphics for social media with custom fonts and colors"
      features={['Custom Quotes', 'Auto Wrap', 'Beautiful Fonts', 'HD Export']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Stack spacing={3}>
        {quoteUrl && (
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Your Quote (1080×1080)</Typography>
            <img src={quoteUrl} alt="Quote" style={{ width: '100%', height: 'auto' }} />
          </Card>
        )}

        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <TextField
              label="Quote"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Enter your quote..."
            />

            <TextField
              label="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              fullWidth
              placeholder="- Author Name"
            />

            <Box>
              <Typography variant="body2" gutterBottom>
                Font Size: {fontSize}px
              </Typography>
              <Slider
                value={fontSize}
                onChange={(e, val) => setFontSize(val as number)}
                min={24}
                max={80}
                valueLabelDisplay="auto"
              />
            </Box>

            <Box>
              <Typography variant="body2" gutterBottom>Background Color</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  style={{ width: 60, height: 40, cursor: 'pointer', border: 'none' }}
                />
                <Typography variant="body2">{bgColor}</Typography>
              </Stack>
            </Box>
          </Stack>
        </Card>

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={reset} fullWidth>
            Reset
          </Button>
          {!quoteUrl ? (
            <Button variant="contained" onClick={generateQuote} disabled={processing || !quote} fullWidth>
              {processing ? 'Generating...' : 'Generate Quote'}
            </Button>
          ) : (
            <Button variant="contained" color="success" onClick={downloadQuote} fullWidth>
              Download
            </Button>
          )}
        </Stack>
      </Stack>
    </ToolLayout>
  );
}
