'use client';

import FilterTool from '@/components/FilterTool';
import { sharpen } from '@/lib/imageFilters';

export default function AiUpscalerPage() {
  return (
    <FilterTool
      title="Image Upscaler"
      description="Enlarge images 2×–4× with high-quality smoothing and edge sharpening to keep detail crisp. Processed locally."
      features={['2×–4× Upscale', 'High-Quality Resample', 'Edge Sharpen', 'No Upload']}
      controls={[
        { key: 'scale', label: 'Scale factor', min: 2, max: 4, default: 2, suffix: '×' },
        { key: 'sharpen', label: 'Detail sharpen', min: 0, max: 100, default: 30, suffix: '%' },
      ]}
      process={(canvas, img, p) => {
        canvas.width = Math.round(img.width * p.scale);
        canvas.height = Math.round(img.height * p.scale);
        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        if (p.sharpen > 0) {
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
          ctx.putImageData(sharpen(data, p.sharpen), 0, 0);
        }
      }}
    />
  );
}
