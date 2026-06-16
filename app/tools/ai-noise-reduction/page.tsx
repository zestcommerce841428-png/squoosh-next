'use client';

import FilterTool from '@/components/FilterTool';
import { blur } from '@/lib/imageFilters';

export default function AiNoiseReductionPage() {
  return (
    <FilterTool
      title="Noise Reduction"
      description="Smooth out grain and sensor noise with a multi-pass denoise filter. 100% client-side."
      features={['Denoise', 'Adjustable Strength', 'No Upload', 'Fast']}
      controls={[{ key: 'passes', label: 'Strength', min: 1, max: 3, default: 1 }]}
      process={(canvas, img, p) => {
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.putImageData(blur(data, p.passes), 0, 0);
      }}
    />
  );
}
