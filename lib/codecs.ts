/**
 * Real WASM codec loader — MozJPEG, WebP, AVIF, JXL, OxiPNG
 * All encoding runs client-side via the WASM modules in /codecs/.
 * Each codec is lazy-loaded once and cached for the session.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EncodeResult {
  data: Uint8Array;
  mimeType: string;
  ext: string;
  sizeBytes: number;
}

export interface CodecOptions {
  quality?: number;       // 0-100
  lossless?: boolean;
  speed?: number;         // codec-specific effort/speed (1-10)
  progressive?: boolean;
  effort?: number;
}

// ─── Module cache ─────────────────────────────────────────────────────────────

const moduleCache = new Map<string, unknown>();

async function loadModule(jsPath: string, wasmPath: string): Promise<unknown> {
  if (moduleCache.has(jsPath)) return moduleCache.get(jsPath)!;

  // Fetch the WASM binary
  const wasmResponse = await fetch(wasmPath);
  const wasmBinary = await wasmResponse.arrayBuffer();

  // Dynamically import the emscripten JS glue
  const factory = (await import(/* webpackIgnore: true */ jsPath)).default;
  const mod = await factory({ wasmBinary });

  moduleCache.set(jsPath, mod);
  return mod;
}

// ─── Pixel data helpers ───────────────────────────────────────────────────────

export function canvasToRGBA(canvas: HTMLCanvasElement): {
  data: Uint8ClampedArray;
  width: number;
  height: number;
} {
  const ctx = canvas.getContext('2d')!;
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  return { data: imageData.data, width, height };
}

// ─── MozJPEG ─────────────────────────────────────────────────────────────────

export async function encodeMozJPEG(
  canvas: HTMLCanvasElement,
  opts: CodecOptions = {},
): Promise<EncodeResult> {
  const quality = opts.quality ?? 75;
  const { data, width, height } = canvasToRGBA(canvas);

  try {
    const mod = await loadModule(
      '/codecs/mozjpeg/enc/mozjpeg_enc.js',
      '/codecs/mozjpeg/enc/mozjpeg_enc.wasm',
    ) as { encode: (d: BufferSource, w: number, h: number, o: object) => Uint8Array };

    const encoded = mod.encode(new Uint8Array(data), width, height, {
      quality,
      baseline: false,
      arithmetic: false,
      progressive: opts.progressive ?? true,
      optimize_coding: true,
      smoothing: 0,
      color_space: 3, // YCbCr
      quant_table: 3,
      trellis_multipass: quality >= 60,
      trellis_opt_zero: quality >= 60,
      trellis_opt_table: quality >= 60,
      trellis_loops: 1,
      auto_subsample: true,
      chroma_subsample: 2,
      separate_chroma_quality: false,
      chroma_quality: quality,
    });

    return { data: encoded, mimeType: 'image/jpeg', ext: 'jpg', sizeBytes: encoded.byteLength };
  } catch {
    // Fallback: canvas.toBlob
    return canvasToBlobFallback(canvas, 'image/jpeg', quality / 100);
  }
}

// ─── WebP ─────────────────────────────────────────────────────────────────────

export async function encodeWebP(
  canvas: HTMLCanvasElement,
  opts: CodecOptions = {},
): Promise<EncodeResult> {
  const quality = opts.quality ?? 75;
  const lossless = opts.lossless ?? false;
  const { data, width, height } = canvasToRGBA(canvas);

  try {
    const mod = await loadModule(
      '/codecs/webp/enc/webp_enc.js',
      '/codecs/webp/enc/webp_enc.wasm',
    ) as { encode: (d: BufferSource, w: number, h: number, o: object) => Uint8Array | null };

    const encoded = mod.encode(new Uint8Array(data), width, height, {
      quality,
      target_size: 0,
      target_PSNR: 0,
      method: 4,
      sns_strength: 50,
      filter_strength: 60,
      filter_sharpness: 0,
      filter_type: 1,
      partitions: 0,
      segments: 4,
      pass: 1,
      show_compressed: 0,
      preprocessing: 0,
      autofilter: 0,
      partition_limit: 0,
      alpha_compression: 1,
      alpha_filtering: 1,
      alpha_quality: 100,
      lossless: lossless ? 1 : 0,
      exact: 0,
      image_hint: 0,
      emulate_jpeg_size: 0,
      thread_level: 0,
      low_memory: 0,
      near_lossless: 100,
      use_delta_palette: 0,
      use_sharp_yuv: 0,
    });

    if (!encoded) throw new Error('WebP encode returned null');
    return { data: encoded, mimeType: 'image/webp', ext: 'webp', sizeBytes: encoded.byteLength };
  } catch {
    return canvasToBlobFallback(canvas, 'image/webp', quality / 100);
  }
}

// ─── AVIF ─────────────────────────────────────────────────────────────────────

export async function encodeAVIF(
  canvas: HTMLCanvasElement,
  opts: CodecOptions = {},
): Promise<EncodeResult> {
  const quality = opts.quality ?? 60;
  const { data, width, height } = canvasToRGBA(canvas);

  try {
    const mod = await loadModule(
      '/codecs/avif/enc/avif_enc.js',
      '/codecs/avif/enc/avif_enc.wasm',
    ) as { encode: (d: BufferSource, w: number, h: number, o: object) => Uint8Array | null };

    // AVIF quality is inverted: lower cq = higher quality (0=best, 63=worst)
    const cqLevel = Math.round(((100 - quality) / 100) * 62);

    const encoded = mod.encode(new Uint8Array(data), width, height, {
      quality: cqLevel,
      qualityAlpha: cqLevel,
      denoiseLevel: 0,
      tileRowsLog2: 0,
      tileColsLog2: 0,
      speed: opts.speed ?? 6,
      subsample: 1,
      chromaDeltaQ: false,
      sharpness: 0,
      enableSharpYUV: true,
      tune: 0, // auto
    });

    if (!encoded) throw new Error('AVIF encode returned null');
    return { data: encoded, mimeType: 'image/avif', ext: 'avif', sizeBytes: encoded.byteLength };
  } catch {
    return canvasToBlobFallback(canvas, 'image/avif', quality / 100);
  }
}

// ─── JXL (JPEG XL) ───────────────────────────────────────────────────────────

export async function encodeJXL(
  canvas: HTMLCanvasElement,
  opts: CodecOptions = {},
): Promise<EncodeResult> {
  const quality = opts.quality ?? 75;
  const { data, width, height } = canvasToRGBA(canvas);

  try {
    const mod = await loadModule(
      '/codecs/jxl/enc/jxl_enc.js',
      '/codecs/jxl/enc/jxl_enc.wasm',
    ) as { encode: (d: BufferSource, w: number, h: number, o: object) => Uint8Array | null };

    // JXL distance: 0=lossless, 1=visually lossless, higher=more lossy
    const distance = opts.lossless ? 0 : Math.max(0.1, ((100 - quality) / 100) * 15);

    const encoded = mod.encode(new Uint8Array(data), width, height, {
      effort: opts.effort ?? 7,
      quality: distance,
      progressive_dc: -1,
      ep_input_type: 0,
      lossless_jpeg: 0,
    });

    if (!encoded) throw new Error('JXL encode returned null');
    return { data: encoded, mimeType: 'image/jxl', ext: 'jxl', sizeBytes: encoded.byteLength };
  } catch {
    return canvasToBlobFallback(canvas, 'image/png', undefined);
  }
}

// ─── OxiPNG (Rust WASM) ───────────────────────────────────────────────────────

export async function encodeOxiPNG(
  canvas: HTMLCanvasElement,
  opts: CodecOptions = {},
): Promise<EncodeResult> {
  try {
    // OxiPNG works in two steps: get PNG from canvas, then pass to oxipng for deflate optimisation
    const pngBlob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob(b => (b ? res(b) : rej(new Error('toBlob null'))), 'image/png'),
    );
    const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());

    // Dynamically import the WASM-bindgen module
    // @ts-ignore - Dynamic WASM module import
    const oxipngMod = await import(/* webpackIgnore: true */ '/codecs/oxipng/pkg/squoosh_oxipng.js');
    await oxipngMod.default('/codecs/oxipng/pkg/squoosh_oxipng_bg.wasm');

    const level = opts.effort ?? 2; // 0-6, higher = better compression, slower
    const optimised = oxipngMod.optimise(pngBytes, level, false);
    return { data: optimised, mimeType: 'image/png', ext: 'png', sizeBytes: optimised.byteLength };
  } catch {
    return canvasToBlobFallback(canvas, 'image/png', undefined);
  }
}

// ─── Fallback (native canvas) ─────────────────────────────────────────────────

async function canvasToBlobFallback(
  canvas: HTMLCanvasElement,
  mime: string,
  quality: number | undefined,
): Promise<EncodeResult> {
  const blob = await new Promise<Blob>((res, rej) =>
    canvas.toBlob(b => (b ? res(b) : rej(new Error('toBlob returned null'))), mime, quality),
  );
  const data = new Uint8Array(await blob.arrayBuffer());
  const ext = mime.split('/')[1]?.replace('jpeg', 'jpg') ?? 'bin';
  return { data, mimeType: mime, ext, sizeBytes: data.byteLength };
}

// ─── Unified encode dispatcher ────────────────────────────────────────────────

export async function encodeImage(
  canvas: HTMLCanvasElement,
  format: string,
  opts: CodecOptions = {},
): Promise<EncodeResult> {
  switch (format) {
    case 'image/jpeg': return encodeMozJPEG(canvas, opts);
    case 'image/webp': return encodeWebP(canvas, opts);
    case 'image/avif': return encodeAVIF(canvas, opts);
    case 'image/jxl':  return encodeJXL(canvas, opts);
    case 'image/png':  return encodeOxiPNG(canvas, opts);
    default:           return canvasToBlobFallback(canvas, format.startsWith('image/') ? format : 'image/png', (opts.quality ?? 85) / 100);
  }
}
