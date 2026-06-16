'use client';

import FilterTool from '@/components/FilterTool';
import { sharpen } from '@/lib/imageFilters';

export default function AiSharpeningPage() {
  return (
    <FilterTool
      title="Sharpen Image"
      description="Bring out fine detail with an adjustable unsharp-mask sharpener. Runs entirely in your browser."
      features={['Unsharp Mask', 'Adjustable Strength', 'No Upload', 'Instant']}
      controls={[{ key: 'amount', label: 'Sharpen amount', min: 0, max: 100, default: 50, suffix: '%' }]}
      process={(canvas, img, p) => {
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.putImageData(sharpen(data, p.amount), 0, 0);
      }}
    />
  );
}
