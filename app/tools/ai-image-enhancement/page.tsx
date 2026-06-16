'use client';

import FilterTool from '@/components/FilterTool';
import { autoLevels, adjust, sharpen } from '@/lib/imageFilters';

export default function AiImageEnhancementPage() {
  return (
    <FilterTool
      title="Image Enhancement"
      description="One-click enhance: auto-levels, brightness, contrast, saturation and a touch of sharpening. Runs in your browser."
      features={['Auto Enhance', 'Brightness/Contrast', 'Sharpen', 'No Upload']}
      controls={[
        { key: 'brightness', label: 'Brightness', min: -100, max: 100, default: 5 },
        { key: 'contrast', label: 'Contrast', min: -100, max: 100, default: 12 },
        { key: 'saturation', label: 'Saturation', min: -100, max: 100, default: 15 },
        { key: 'sharpen', label: 'Sharpen', min: 0, max: 100, default: 25, suffix: '%' },
      ]}
      process={(canvas, img, p) => {
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        data = autoLevels(data, 0.4);
        data = adjust(data, p.brightness, p.contrast, p.saturation);
        if (p.sharpen > 0) data = sharpen(data, p.sharpen);
        ctx.putImageData(data, 0, 0);
      }}
    />
  );
}
