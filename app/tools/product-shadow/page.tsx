'use client';

import FilterTool from '@/components/FilterTool';

export default function ProductShadowPage() {
  return (
    <FilterTool
      title="Product Shadow Generator"
      description="Add a realistic drop shadow beneath a product cut-out (transparent PNG works best). Composited in your browser."
      features={['Drop Shadow', 'Blur & Offset', 'Opacity Control', 'Transparent PNG']}
      controls={[
        { key: 'blur', label: 'Shadow blur', min: 0, max: 80, default: 24 },
        { key: 'offsetY', label: 'Vertical offset', min: 0, max: 80, default: 18 },
        { key: 'offsetX', label: 'Horizontal offset', min: -40, max: 40, default: 0 },
        { key: 'opacity', label: 'Shadow opacity', min: 0, max: 100, default: 45, suffix: '%' },
      ]}
      process={(canvas, img, p) => {
        const pad = 80;
        canvas.width = img.width + pad * 2;
        canvas.height = img.height + pad * 2;
        const ctx = canvas.getContext('2d')!;
        ctx.shadowColor = `rgba(0,0,0,${p.opacity / 100})`;
        ctx.shadowBlur = p.blur;
        ctx.shadowOffsetX = p.offsetX;
        ctx.shadowOffsetY = p.offsetY;
        ctx.drawImage(img, pad, pad);          // casts the shadow from the alpha
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
        ctx.drawImage(img, pad, pad);          // crisp product on top
      }}
    />
  );
}
