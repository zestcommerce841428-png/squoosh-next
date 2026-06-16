'use client';

import FilterTool from '@/components/FilterTool';
import { blur, autoLevels, adjust, sharpen } from '@/lib/imageFilters';

export default function AiOldPhotoRestorationPage() {
  return (
    <FilterTool
      title="Old Photo Restore"
      description="Revive faded, grainy old photos: denoise, restore contrast and colour, then re-sharpen. Runs in your browser."
      features={['Denoise', 'Restore Contrast', 'Re-sharpen', 'No Upload']}
      controls={[
        { key: 'denoise', label: 'Denoise', min: 0, max: 3, default: 1 },
        { key: 'restore', label: 'Contrast restore', min: 0, max: 100, default: 70, suffix: '%' },
        { key: 'sharpen', label: 'Sharpen', min: 0, max: 100, default: 35, suffix: '%' },
      ]}
      process={(canvas, img, p) => {
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (p.denoise > 0) data = blur(data, p.denoise);
        data = autoLevels(data, p.restore / 100);
        data = adjust(data, 3, 8, 12);
        if (p.sharpen > 0) data = sharpen(data, p.sharpen);
        ctx.putImageData(data, 0, 0);
      }}
    />
  );
}
