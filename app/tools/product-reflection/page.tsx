'use client';

import FilterTool from '@/components/FilterTool';

export default function ProductReflectionPage() {
  return (
    <FilterTool
      title="Product Reflection Generator"
      description="Add a glossy mirror reflection beneath your product image that fades out smoothly. Rendered in your browser."
      features={['Mirror Reflection', 'Adjustable Height', 'Fade Control', 'PNG Export']}
      controls={[
        { key: 'height', label: 'Reflection height', min: 10, max: 80, default: 40, suffix: '%' },
        { key: 'opacity', label: 'Reflection opacity', min: 10, max: 90, default: 50, suffix: '%' },
      ]}
      process={(canvas, img, p) => {
        const rh = Math.round(img.height * (p.height / 100));
        canvas.width = img.width;
        canvas.height = img.height + rh;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        const tmp = document.createElement('canvas');
        tmp.width = img.width; tmp.height = rh;
        const tc = tmp.getContext('2d')!;
        tc.save();
        tc.scale(1, -1);
        tc.drawImage(img, 0, -img.height);     // flipped; top of reflection = bottom of image
        tc.restore();
        tc.globalCompositeOperation = 'destination-in';
        const g = tc.createLinearGradient(0, 0, 0, rh);
        g.addColorStop(0, `rgba(0,0,0,${p.opacity / 100})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        tc.fillStyle = g;
        tc.fillRect(0, 0, img.width, rh);

        ctx.drawImage(tmp, 0, img.height);
      }}
    />
  );
}
