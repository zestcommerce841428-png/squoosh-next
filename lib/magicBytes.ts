/**
 * Magic-byte file format detector.
 * Identifies the real image format from the first 32 bytes of the file binary,
 * regardless of file extension or MIME type reported by the OS.
 */

export interface FormatDetection {
  ext: string;
  mime: string;
  label: string;
  confidence: 'certain' | 'probable';
}

const UNKNOWN: FormatDetection = {
  ext: 'bin',
  mime: 'application/octet-stream',
  label: 'Unknown',
  confidence: 'probable',
};

type MagicRule =
  | { offset: number; bytes: number[]; ext: string; mime: string; label: string }
  | { offset: number; bytes: number[]; ext: string; mime: string; label: string; mask?: number[] };

const RULES: MagicRule[] = [
  // ── JPEG ──────────────────────────────────────────────────────────────────
  { offset: 0, bytes: [0xFF, 0xD8, 0xFF], ext: 'jpg', mime: 'image/jpeg', label: 'JPEG' },

  // ── PNG ───────────────────────────────────────────────────────────────────
  { offset: 0, bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], ext: 'png', mime: 'image/png', label: 'PNG' },

  // ── GIF ───────────────────────────────────────────────────────────────────
  { offset: 0, bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], ext: 'gif', mime: 'image/gif', label: 'GIF 87a' },
  { offset: 0, bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], ext: 'gif', mime: 'image/gif', label: 'GIF 89a' },

  // ── WebP ──────────────────────────────────────────────────────────────────
  // RIFF....WEBP
  { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46], ext: '_riff', mime: '_riff', label: '_riff' }, // handled specially below

  // ── BMP ───────────────────────────────────────────────────────────────────
  { offset: 0, bytes: [0x42, 0x4D], ext: 'bmp', mime: 'image/bmp', label: 'BMP' },

  // ── TIFF ──────────────────────────────────────────────────────────────────
  { offset: 0, bytes: [0x49, 0x49, 0x2A, 0x00], ext: 'tiff', mime: 'image/tiff', label: 'TIFF (LE)' },
  { offset: 0, bytes: [0x4D, 0x4D, 0x00, 0x2A], ext: 'tiff', mime: 'image/tiff', label: 'TIFF (BE)' },

  // ── ICO / CUR ─────────────────────────────────────────────────────────────
  { offset: 0, bytes: [0x00, 0x00, 0x01, 0x00], ext: 'ico', mime: 'image/x-icon', label: 'ICO' },
  { offset: 0, bytes: [0x00, 0x00, 0x02, 0x00], ext: 'cur', mime: 'image/x-icon', label: 'CUR' },

  // ── PSD ───────────────────────────────────────────────────────────────────
  { offset: 0, bytes: [0x38, 0x42, 0x50, 0x53], ext: 'psd', mime: 'image/vnd.adobe.photoshop', label: 'Photoshop PSD' },

  // ── PDF ───────────────────────────────────────────────────────────────────
  { offset: 0, bytes: [0x25, 0x50, 0x44, 0x46], ext: 'pdf', mime: 'application/pdf', label: 'PDF' },

  // ── OpenEXR ───────────────────────────────────────────────────────────────
  { offset: 0, bytes: [0x76, 0x2F, 0x31, 0x01], ext: 'exr', mime: 'image/x-exr', label: 'OpenEXR' },

  // ── Radiance HDR ──────────────────────────────────────────────────────────
  { offset: 0, bytes: [0x23, 0x3F, 0x52, 0x41, 0x44, 0x49, 0x41, 0x4E, 0x43, 0x45], ext: 'hdr', mime: 'image/x-hdr', label: 'Radiance HDR' },

  // ── SVG ───────────────────────────────────────────────────────────────────
  { offset: 0, bytes: [0x3C, 0x73, 0x76, 0x67], ext: 'svg', mime: 'image/svg+xml', label: 'SVG' },
  { offset: 0, bytes: [0x3C, 0x3F, 0x78, 0x6D, 0x6C], ext: 'svg', mime: 'image/svg+xml', label: 'SVG (XML)' }, // <?xml

  // ── TGA (no universal magic, detect by footer) ────────────────────────────
  // Handled specially below

  // ── QOI ───────────────────────────────────────────────────────────────────
  { offset: 0, bytes: [0x71, 0x6F, 0x69, 0x66], ext: 'qoi', mime: 'image/qoi', label: 'QOI' },

  // ── FLIF ──────────────────────────────────────────────────────────────────
  { offset: 0, bytes: [0x46, 0x4C, 0x49, 0x46], ext: 'flif', mime: 'image/flif', label: 'FLIF' },

  // ── JXL (JPEG XL) ─────────────────────────────────────────────────────────
  { offset: 0, bytes: [0xFF, 0x0A], ext: 'jxl', mime: 'image/jxl', label: 'JPEG XL (naked)' },
  { offset: 0, bytes: [0x00, 0x00, 0x00, 0x0C, 0x4A, 0x58, 0x4C, 0x20], ext: 'jxl', mime: 'image/jxl', label: 'JPEG XL (ISOBMFF)' },

  // ── Farbfeld ──────────────────────────────────────────────────────────────
  { offset: 0, bytes: [0x66, 0x61, 0x72, 0x62, 0x66, 0x65, 0x6C, 0x64], ext: 'ff', mime: 'image/x-farbfeld', label: 'Farbfeld' },

  // ── PCX ───────────────────────────────────────────────────────────────────
  { offset: 0, bytes: [0x0A], ext: 'pcx', mime: 'image/x-pcx', label: 'PCX' }, // very broad, check more bytes

  // ── SGI ───────────────────────────────────────────────────────────────────
  { offset: 0, bytes: [0x01, 0xDA], ext: 'sgi', mime: 'image/sgi', label: 'SGI' },

  // ── XBM (text format, starts with #define) ────────────────────────────────
  { offset: 0, bytes: [0x23, 0x64, 0x65, 0x66, 0x69, 0x6E, 0x65], ext: 'xbm', mime: 'image/x-xbitmap', label: 'XBM' },

  // ── DDS ───────────────────────────────────────────────────────────────────
  { offset: 0, bytes: [0x44, 0x44, 0x53, 0x20], ext: 'dds', mime: 'image/vnd-ms.dds', label: 'DDS' },

  // ── KTX ───────────────────────────────────────────────────────────────────
  { offset: 0, bytes: [0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A], ext: 'ktx', mime: 'image/ktx', label: 'KTX 1.1' },
  { offset: 0, bytes: [0xAB, 0x4B, 0x54, 0x58, 0x20, 0x32, 0x30, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A], ext: 'ktx2', mime: 'image/ktx2', label: 'KTX 2.0' },

  // ── DICOM ─────────────────────────────────────────────────────────────────
  { offset: 128, bytes: [0x44, 0x49, 0x43, 0x4D], ext: 'dcm', mime: 'application/dicom', label: 'DICOM' },

  // ── JPEG 2000 ─────────────────────────────────────────────────────────────
  { offset: 0, bytes: [0x00, 0x00, 0x00, 0x0C, 0x6A, 0x50, 0x20, 0x20, 0x0D, 0x0A, 0x87, 0x0A], ext: 'jp2', mime: 'image/jp2', label: 'JPEG 2000' },
  { offset: 0, bytes: [0xFF, 0x4F, 0xFF, 0x51], ext: 'j2k', mime: 'image/jp2', label: 'JPEG 2000 Codestream' },

  // ── HEIC / AVIF (ftyp box) ────────────────────────────────────────────────
  // Handled specially below (offset 4-8 is 'ftyp', brand at 8-12)

  // ── PBM / PGM / PPM / PAM ─────────────────────────────────────────────────
  { offset: 0, bytes: [0x50, 0x31, 0x0A], ext: 'pbm', mime: 'image/x-portable-bitmap', label: 'PBM (ASCII)' },
  { offset: 0, bytes: [0x50, 0x34, 0x0A], ext: 'pbm', mime: 'image/x-portable-bitmap', label: 'PBM (binary)' },
  { offset: 0, bytes: [0x50, 0x32, 0x0A], ext: 'pgm', mime: 'image/x-portable-graymap', label: 'PGM (ASCII)' },
  { offset: 0, bytes: [0x50, 0x35, 0x0A], ext: 'pgm', mime: 'image/x-portable-graymap', label: 'PGM (binary)' },
  { offset: 0, bytes: [0x50, 0x33, 0x0A], ext: 'ppm', mime: 'image/x-portable-pixmap', label: 'PPM (ASCII)' },
  { offset: 0, bytes: [0x50, 0x36, 0x0A], ext: 'ppm', mime: 'image/x-portable-pixmap', label: 'PPM (binary)' },
  { offset: 0, bytes: [0x50, 0x37, 0x0A], ext: 'pam', mime: 'image/x-portable-arbitrarymap', label: 'PAM' },
];

function matchBytes(buf: Uint8Array, offset: number, bytes: number[]): boolean {
  if (offset + bytes.length > buf.length) return false;
  return bytes.every((b, i) => buf[offset + i] === b);
}

function str4(buf: Uint8Array, offset: number): string {
  if (offset + 4 > buf.length) return '';
  return String.fromCharCode(buf[offset], buf[offset + 1], buf[offset + 2], buf[offset + 3]);
}

export async function detectFormat(file: File | Blob): Promise<FormatDetection> {
  // Read first 256 bytes — enough for all magic signatures including DICOM
  const slice = file.slice(0, 256);
  const buf = new Uint8Array(await slice.arrayBuffer());

  // ── HEIC / AVIF / MP4 / MOV ftyp box ──────────────────────────────────────
  if (str4(buf, 4) === 'ftyp') {
    const brand = str4(buf, 8);
    if (['heic', 'heis', 'heix', 'hevc', 'hevx', 'heim', 'hevm', 'hevs', 'mif1'].includes(brand.toLowerCase().trim())) {
      return { ext: 'heic', mime: 'image/heic', label: 'HEIC', confidence: 'certain' };
    }
    if (['avif', 'avis'].includes(brand.toLowerCase().trim())) {
      return { ext: 'avif', mime: 'image/avif', label: 'AVIF', confidence: 'certain' };
    }
    if (brand.trim() === 'jp2 ') {
      return { ext: 'jp2', mime: 'image/jp2', label: 'JPEG 2000', confidence: 'certain' };
    }
  }

  // ── RIFF container: WebP, WAV, AVI ────────────────────────────────────────
  if (matchBytes(buf, 0, [0x52, 0x49, 0x46, 0x46])) {
    if (str4(buf, 8) === 'WEBP') {
      return { ext: 'webp', mime: 'image/webp', label: 'WebP', confidence: 'certain' };
    }
  }

  // ── Standard rules ─────────────────────────────────────────────────────────
  for (const rule of RULES) {
    if (rule.ext.startsWith('_')) continue; // skip internal markers
    if (matchBytes(buf, rule.offset, rule.bytes)) {
      // Extra validation for PCX (too broad)
      if (rule.ext === 'pcx' && buf[1] !== 0x05 && buf[1] !== 0x04 && buf[1] !== 0x03) continue;
      return { ext: rule.ext, mime: rule.mime, label: rule.label, confidence: 'certain' };
    }
  }

  // ── Camera RAW heuristics (TIFF-based) ────────────────────────────────────
  if (matchBytes(buf, 0, [0x49, 0x49, 0x2A, 0x00]) || matchBytes(buf, 0, [0x4D, 0x4D, 0x00, 0x2A])) {
    // All TIFF-based RAW formats start with TIFF magic — use file extension as tiebreak
    if (file instanceof File) {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      const rawExts = ['cr2','cr3','nef','nrw','arw','dng','orf','rw2','pef','raf','srw','mrw','erf','kdc','dcr','rwl','sr2'];
      if (rawExts.includes(ext)) {
        return { ext, mime: `image/x-${ext}`, label: `Camera RAW (${ext.toUpperCase()})`, confidence: 'probable' };
      }
    }
    return { ext: 'tiff', mime: 'image/tiff', label: 'TIFF', confidence: 'certain' };
  }

  // ── TGA detection (by footer "TRUEVISION-XFILE.\0") ──────────────────────
  if (buf.length >= 26) {
    const footer = file.slice(-26);
    const footerBuf = new Uint8Array(await footer.arrayBuffer());
    const sig = 'TRUEVISION-XFILE.\0';
    const sigBytes = sig.split('').map(c => c.charCodeAt(0));
    if (footerBuf.length >= 18 && sigBytes.every((b, i) => footerBuf[footerBuf.length - 18 + i] === b)) {
      return { ext: 'tga', mime: 'image/tga', label: 'TGA', confidence: 'certain' };
    }
  }

  // ── SVG text detection ─────────────────────────────────────────────────────
  const text = new TextDecoder('utf-8', { fatal: false }).decode(buf.slice(0, 64));
  if (text.includes('<svg') || text.includes('<?xml') && text.includes('svg')) {
    return { ext: 'svg', mime: 'image/svg+xml', label: 'SVG', confidence: 'probable' };
  }

  // ── Fallback to file extension ─────────────────────────────────────────────
  if (file instanceof File) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (ext) return { ext, mime: `image/${ext}`, label: ext.toUpperCase(), confidence: 'probable' };
  }

  return UNKNOWN;
}

/** Quick synchronous check — reads already-loaded ArrayBuffer */
export function detectFormatSync(buf: Uint8Array): FormatDetection {
  if (matchBytes(buf, 0, [0xFF, 0xD8, 0xFF])) return { ext: 'jpg', mime: 'image/jpeg', label: 'JPEG', confidence: 'certain' };
  if (matchBytes(buf, 0, [0x89, 0x50, 0x4E, 0x47])) return { ext: 'png', mime: 'image/png', label: 'PNG', confidence: 'certain' };
  if (matchBytes(buf, 0, [0x47, 0x49, 0x46])) return { ext: 'gif', mime: 'image/gif', label: 'GIF', confidence: 'certain' };
  if (matchBytes(buf, 0, [0x52, 0x49, 0x46, 0x46]) && str4(buf, 8) === 'WEBP') return { ext: 'webp', mime: 'image/webp', label: 'WebP', confidence: 'certain' };
  if (str4(buf, 4) === 'ftyp') {
    const brand = str4(buf, 8).toLowerCase().trim();
    if (['heic','heis','heix'].includes(brand)) return { ext: 'heic', mime: 'image/heic', label: 'HEIC', confidence: 'certain' };
    if (['avif','avis'].includes(brand)) return { ext: 'avif', mime: 'image/avif', label: 'AVIF', confidence: 'certain' };
  }
  return UNKNOWN;
}
