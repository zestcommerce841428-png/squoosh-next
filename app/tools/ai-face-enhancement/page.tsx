'use client';

import FilterTool from '@/components/FilterTool';
import { blur, adjust } from '@/lib/imageFilters';

export default function AiFaceEnhancementPage() {
  return (
    <FilterTool
      title="Portrait Enhance"
      description="Soften skin and gently brighten portraits with a smoothing + glow pass. Best on close-up photos. Local processing."
      features={['Skin Smoothing', 'Brighten', 'Soft Glow', 'No Upload']}
      controls={[
        { key: 'smooth', label: 'Smoothing', min: 0, max: 3, default: 1 },
        { key: 'brightness', label: 'Brighten', min: 0, max: 60, default: 8 },
      ]}
      process={(canvas, img, p) => {
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (p.smooth > 0) data = blur(data, p.smooth);
        data = adjust(data, p.brightness, 4, 6);
        ctx.putImageData(data, 0, 0);
      }}
    />
  );
}
