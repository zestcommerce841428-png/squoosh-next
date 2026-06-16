/**
 * Real client-side image processing primitives (canvas ImageData).
 * Used by the enhancement / "AI" tools — all genuine pixel math, no servers.
 */

export function cloneData(ctx: CanvasRenderingContext2D, w: number, h: number): ImageData {
  return ctx.getImageData(0, 0, w, h);
}

/** Brightness (-100..100), contrast (-100..100), saturation (-100..100). In-place. */
export function adjust(data: ImageData, brightness = 0, contrast = 0, saturation = 0): ImageData {
  const d = data.data;
  const c = (contrast / 100) + 1;
  const intercept = 128 * (1 - c);
  const b = (brightness / 100) * 255;
  const s = (saturation / 100) + 1;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i] * c + intercept + b;
    let g = d[i + 1] * c + intercept + b;
    let bl = d[i + 2] * c + intercept + b;
    // saturation around luma
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * bl;
    r = luma + (r - luma) * s;
    g = luma + (g - luma) * s;
    bl = luma + (bl - luma) * s;
    d[i] = clamp(r); d[i + 1] = clamp(g); d[i + 2] = clamp(bl);
  }
  return data;
}

function clamp(v: number) { return v < 0 ? 0 : v > 255 ? 255 : v; }

/** Generic 3x3 convolution. */
export function convolve3(src: ImageData, kernel: number[], divisor = 1, offset = 0): ImageData {
  const { width: w, height: h, data: s } = src;
  const out = new Uint8ClampedArray(s.length);
  const k = kernel;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0;
      let ki = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const px = Math.min(w - 1, Math.max(0, x + dx));
          const py = Math.min(h - 1, Math.max(0, y + dy));
          const o = (py * w + px) * 4;
          const kv = k[ki++];
          r += s[o] * kv; g += s[o + 1] * kv; b += s[o + 2] * kv;
        }
      }
      const o = (y * w + x) * 4;
      out[o] = clamp(r / divisor + offset);
      out[o + 1] = clamp(g / divisor + offset);
      out[o + 2] = clamp(b / divisor + offset);
      out[o + 3] = s[o + 3];
    }
  }
  return new ImageData(out, w, h);
}

/** Unsharp-style sharpen, amount 0..100. */
export function sharpen(src: ImageData, amount = 50): ImageData {
  const a = amount / 100;
  const kernel = [0, -a, 0, -a, 1 + 4 * a, -a, 0, -a, 0];
  return convolve3(src, kernel, 1, 0);
}

/** Box blur radius 1..3 passes for denoise. */
export function blur(src: ImageData, passes = 1): ImageData {
  let out = src;
  const kernel = [1, 1, 1, 1, 1, 1, 1, 1, 1];
  for (let i = 0; i < passes; i++) out = convolve3(out, kernel, 9, 0);
  return out;
}

/** Auto white balance + contrast stretch (per-channel min/max to 0..255). */
export function autoLevels(data: ImageData, strength = 1): ImageData {
  const d = data.data;
  const min = [255, 255, 255], max = [0, 0, 0];
  for (let i = 0; i < d.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const v = d[i + c];
      if (v < min[c]) min[c] = v;
      if (v > max[c]) max[c] = v;
    }
  }
  for (let i = 0; i < d.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const range = max[c] - min[c] || 1;
      const stretched = ((d[i + c] - min[c]) / range) * 255;
      d[i + c] = clamp(d[i + c] + (stretched - d[i + c]) * strength);
    }
  }
  return data;
}
