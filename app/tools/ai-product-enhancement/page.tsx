'use client';

import FilterTool from '@/components/FilterTool';
import { autoLevels, adjust, sharpen } from '@/lib/imageFilters';

export default function AiProductEnhancementPage() {
  return (
    <FilterTool
      title="Product Photo Enhance"
      description="Make e-commerce product shots pop: brighten, boost contrast and saturation, and sharpen edges. Local processing."
      features={['Brighten', 'Punchy Contrast', 'Edge Sharpen', 'No Upload']}
      controls={[
        { key: 'brightness', label: 'Brightness', min: -50, max: 80, default: 12 },
        { key: 'contrast', label: 'Contrast', min: -50, max: 100, default: 20 },
        { key: 'saturation', label: 'Saturation', min: -50, max: 100, default: 18 },
        { key: 'sharpen', label: 'Sharpen', min: 0, max: 100, default: 40, suffix: '%' },
      ]}
      process={(canvas, img, p) => {
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        data = autoLevels(data, 0.3);
        data = adjust(data, p.brightness, p.contrast, p.saturation);
        if (p.sharpen > 0) data = sharpen(data, p.sharpen);
        ctx.putImageData(data, 0, 0);
      }}
    />
  );
}
