'use client';

import FilterTool from '@/components/FilterTool';
import { autoLevels, adjust } from '@/lib/imageFilters';

export default function AiColorCorrectionPage() {
  return (
    <FilterTool
      title="Color Correction"
      description="Auto white-balance and contrast-stretch your photo, with fine temperature and saturation control. Local processing."
      features={['Auto White Balance', 'Contrast Stretch', 'Saturation', 'No Upload']}
      controls={[
        { key: 'auto', label: 'Auto-levels strength', min: 0, max: 100, default: 60, suffix: '%' },
        { key: 'saturation', label: 'Saturation', min: -100, max: 100, default: 10 },
      ]}
      process={(canvas, img, p) => {
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        data = autoLevels(data, p.auto / 100);
        data = adjust(data, 0, 0, p.saturation);
        ctx.putImageData(data, 0, 0);
      }}
    />
  );
}
