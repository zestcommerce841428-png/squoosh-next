// ─── Global Image Format Registry ────────────────────────────────────────────
// Single source of truth for every supported import/export image format.
// Import from here in any tool, compressor, converter, or file picker.

export interface ExportFormat {
  label: string;
  value: string; // 'image/jpeg' | 'custom/xxx' | 'alias/xxx'
  ext: string;
  group: string;
  lossless?: boolean;
  native?: boolean; // browser canvas toBlob supported natively
}

export interface FormatMeta {
  mime: string;
  label: string;
  description: string;
  lossless?: boolean;
}

// ─── Input Format Categories (what we can open / decode) ─────────────────────
export const INPUT_FORMAT_CATEGORIES: Record<string, string[]> = {
  'Web Standard': [
    'jpg', 'jpeg', 'jpe', 'jfif',
    'png', 'apng',
    'gif',
    'webp',
    'avif',
    'svg', 'svgz',
    'bmp', 'dib',
    'ico', 'cur',
  ],
  'Next-Gen Codecs': [
    'jxl',       // JPEG XL
    'heic', 'heif', // Apple HEIC/HEIF
    'avif',      // AV1 Image (also in Web Standard)
    'wp2',       // WebP2 experimental
    'qoi',       // Quite OK Image
    'flif',      // Free Lossless Image Format
    'bpg',       // Better Portable Graphics
    'jpx',       // JPEG 2000 extended
  ],
  'JPEG 2000 Family': [
    'jp2', 'j2k', 'j2c', 'jpf', 'jpx', 'jpm', 'mj2',
  ],
  'JPEG XR / HD Photo': [
    'jxr', 'hdp', 'wdp',
  ],
  'Camera RAW': [
    // Canon
    'cr2', 'cr3', 'crw',
    // Nikon
    'nef', 'nrw',
    // Sony
    'arw', 'sr2', 'srf',
    // Adobe
    'dng',
    // Olympus
    'orf',
    // Panasonic
    'rw2', 'raw',
    // Pentax
    'pef', 'ptx',
    // Fujifilm
    'raf',
    // Samsung
    'srw',
    // Minolta / Konica-Minolta
    'mrw',
    // Kodak
    'erf', 'kdc', 'dcr', 'k25',
    // Leica
    'rwl', 'dng',
    // Hasselblad
    '3fr', 'fff',
    // Phase One
    'iiq',
    // Sigma
    'x3f',
    // Mamiya / Leaf
    'mef', 'mos',
    // Epson
    'erf',
    // Generic
    'rwz',
  ],
  'Vector & Document': [
    'svg', 'svgz',
    'ai',          // Adobe Illustrator
    'eps',         // Encapsulated PostScript
    'pdf',         // Portable Document Format
    'psd', 'psb',  // Photoshop Document
    'indd',        // InDesign
    'cdr',         // CorelDRAW
    'afphoto',     // Affinity Photo
    'afdesign',    // Affinity Designer
    'sketch',      // Sketch
    'xd',          // Adobe XD
    'fig',         // Figma (export)
    'cgm',         // Computer Graphics Metafile
    'emf', 'wmf',  // Windows Metafiles
    'cals',        // CALS Raster
    'dxf', 'dwg',  // AutoCAD
    'plt', 'hpgl', // Plotter formats
  ],
  'HDR & Linear Light': [
    'hdr', 'rgbe', 'xyze',  // Radiance HDR
    'exr',                   // OpenEXR
    'dpx',                   // Digital Picture Exchange
    'cin',                   // Cineon
    'logluv',                // LogLuv TIFF
    'pfm',                   // Portable FloatMap
    'float',                 // Raw float data
  ],
  'Game & GPU Textures': [
    'dds',         // DirectDraw Surface
    'ktx', 'ktx2', // Khronos Texture
    'astc',        // Adaptive Scalable Texture Compression
    'pvr', 'pvrtc',// PowerVR Texture
    'pkm',         // ETC Compressed
    'basis',       // Basis Universal
    'vtf',         // Valve Texture Format
    'crn',         // Crunch compressed DDS
    'atc',         // Adreno Texture Compression
    'etc', 'etc2', // Ericsson Texture Compression
    'tga',         // Truevision TGA (also used in game textures)
  ],
  'Scientific & Medical': [
    'dcm', 'dicom', // DICOM medical imaging
    'fits', 'fit', 'fts', // FITS astronomical
    'hdf', 'h5', 'hdf5',  // HDF scientific
    'nc',           // NetCDF
    'img', 'img.gz',// Generic scientific image
    'mrc',          // MRC electron microscopy
    'nii', 'nii.gz',// NIfTI neuroimaging
    'mnc',          // MINC medical
    'analyze',      // Analyze 7.5
    'raw',          // Raw binary image data
  ],
  'Portable Bitmap (PBM/PGM/PPM)': [
    'pbm',  // Portable Bitmap (black & white)
    'pgm',  // Portable Graymap
    'ppm',  // Portable Pixmap (color)
    'pnm',  // Portable Anymap
    'pam',  // Portable Arbitrary Map
    'pfm',  // Portable FloatMap
    'xbm',  // X11 Bitmap
    'xpm',  // X11 Pixmap
    'xwd',  // X11 Window Dump
  ],
  'TIFF & Variants': [
    'tiff', 'tif',
    'btf',   // Big TIFF
    'geotiff', 'gtiff', // GeoTIFF
    'ptif',  // Pyramid TIFF
    'tf8',   // TIFF 8-bit
    'tf32',  // TIFF 32-bit float
  ],
  'Windows & Legacy': [
    'bmp', 'dib', 'rle',   // Windows Bitmap variants
    'ico', 'cur', 'ani',   // Windows Icons
    'icns',                // Apple Icon Image
    'pcx', 'dcx',          // ZSoft PCX
    'wbmp',                // Wireless Bitmap
    'emf', 'wmf',          // Windows Metafiles
    'msp',                 // Microsoft Paint
    'pict', 'pct',         // Apple PICT
    'sgi', 'rgb', 'rgba', 'bw', 'int', 'inta', // SGI formats
    'sun', 'ras',          // Sun Raster
    'tpic',                // TARGA Picture
  ],
  'Print & Prepress': [
    'tiff', 'tif',
    'eps', 'ps',           // PostScript
    'pdf',
    'psd',
    'dcs',                 // Desktop Color Separation
    'scitex', 'sct',       // Scitex Continuous Tone
    'rad',                 // Radiance scene
  ],
  'Mobile & Embedded': [
    'heic', 'heif',
    'avif',
    'wbmp',                // Wireless Bitmap (WAP)
    'jng',                 // JPEG Network Graphics
    'mng',                 // Multiple-image Network Graphics
    'palm', 'pdb',         // Palm PDB image
    'otb',                 // Nokia OTA Bitmap
    'pix',                 // Alias/Wavefront Pix
  ],
  'Film & Archive': [
    'cin',   // Kodak Cineon
    'dpx',   // Digital Picture Exchange
    'exr',   // OpenEXR
    'tiff',
    'pcd',   // Photo CD (Kodak)
    'fpx',   // FlashPix
    'iff', 'lbm', 'ilbm', 'iff24', // Amiga IFF
    'acorn', // Acorn Sprite
    'art',   // AOL ART
    'fax', 'g3', 'g4',  // FAX formats
  ],
  'Data URI & Encoded': [
    'b64',   // Base64 encoded image
    'datauri',
    'svg',   // SVG (can embed raster)
  ],
  'Exotic & Rare': [
    'ff',    // Farbfeld
    'rgba',  // Raw RGBA
    'yuv',   // YUV raw
    'uyvy',  // UYVY packed YUV
    'vicar', // VICAR NASA image
    'viff',  // Khoros VIFF
    'miff',  // Magick Image File Format
    'mtv',   // MTV ray-tracer output
    'otb',   // Nokia OTA Bitmap
    'p7',    // Xv thumbnail format
    'jbg', 'jbig', 'jbig2', // JBIG bi-level compression
    'pcd',   // Kodak Photo CD
    'acorn', // Acorn sprite
    'iff24', // IFF 24-bit
    'sct',   // Scitex CT
    'nifti', // NIfTI brain scan
    'epdf',  // Encapsulated PDF
  ],
};

// Deduplicate across categories (some formats appear in multiple categories intentionally)
const _seen = new Set<string>();
export const ALL_INPUT_EXTENSIONS: string[] = Object.values(INPUT_FORMAT_CATEGORIES)
  .flat()
  .filter(ext => { if (_seen.has(ext)) return false; _seen.add(ext); return true; });

// HTML file input accept attribute — covers every format + wildcard fallback
export const ACCEPT_STRING: string =
  ALL_INPUT_EXTENSIONS.map(ext => `.${ext}`).join(',') + ',image/*';

// ─── MIME type map ────────────────────────────────────────────────────────────
export const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', jpe: 'image/jpeg', jfif: 'image/jpeg',
  png: 'image/png', apng: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  svg: 'image/svg+xml', svgz: 'image/svg+xml',
  bmp: 'image/bmp', dib: 'image/bmp',
  ico: 'image/x-icon', cur: 'image/x-icon',
  tiff: 'image/tiff', tif: 'image/tiff',
  heic: 'image/heic', heif: 'image/heif',
  jxl: 'image/jxl',
  jxr: 'image/jxr', hdp: 'image/jxr', wdp: 'image/jxr',
  wp2: 'image/webp2',
  qoi: 'image/qoi',
  flif: 'image/flif',
  bpg: 'image/bpg',
  jp2: 'image/jp2', j2k: 'image/jp2', j2c: 'image/jp2',
  jpf: 'image/jpx', jpx: 'image/jpx', jpm: 'image/jpm', mj2: 'video/mj2',
  exr: 'image/x-exr',
  hdr: 'image/x-hdr', rgbe: 'image/x-hdr',
  dpx: 'image/x-dpx', cin: 'image/x-cin',
  psd: 'image/vnd.adobe.photoshop', psb: 'image/vnd.adobe.photoshop',
  pdf: 'application/pdf', eps: 'image/eps', ai: 'application/illustrator',
  tga: 'image/tga', dds: 'image/vnd-ms.dds',
  dcm: 'application/dicom', dicom: 'application/dicom',
  fits: 'image/fits', fit: 'image/fits', fts: 'image/fits',
  pbm: 'image/x-portable-bitmap', pgm: 'image/x-portable-graymap',
  ppm: 'image/x-portable-pixmap', pnm: 'image/x-portable-anymap',
  pam: 'image/x-portable-arbitrarymap', pfm: 'image/x-portable-floatmap',
  xbm: 'image/x-xbitmap', xpm: 'image/x-xpixmap', xwd: 'image/x-xwindowdump',
  cr2: 'image/x-canon-cr2', cr3: 'image/x-canon-cr3',
  nef: 'image/x-nikon-nef', nrw: 'image/x-nikon-nrw',
  arw: 'image/x-sony-arw', sr2: 'image/x-sony-sr2',
  dng: 'image/x-adobe-dng',
  orf: 'image/x-olympus-orf',
  rw2: 'image/x-panasonic-rw2',
  pef: 'image/x-pentax-pef',
  raf: 'image/x-fuji-raf',
  srw: 'image/x-samsung-srw',
  mrw: 'image/x-minolta-mrw',
  erf: 'image/x-epson-erf',
  kdc: 'image/x-kodak-kdc', dcr: 'image/x-kodak-dcr',
  ktx: 'image/ktx', ktx2: 'image/ktx2',
  basis: 'image/x-basis',
  ff: 'image/x-farbfeld',
  sgi: 'image/sgi',
  tpic: 'image/x-tga',
  wbmp: 'image/vnd.wap.wbmp',
  ani: 'application/x-navi-animation',
  icns: 'image/icns',
  pcd: 'image/x-photo-cd',
  mng: 'video/x-mng',
  jng: 'image/x-jng',
  yuv: 'image/yuv', uyvy: 'image/yuv',
  raw: 'image/x-raw',
};

export function getMimeType(ext: string): string {
  return MIME_BY_EXT[ext.toLowerCase().replace(/^\./, '')] ?? 'application/octet-stream';
}

export function extFromMime(mime: string): string {
  const entry = Object.entries(MIME_BY_EXT).find(([, m]) => m === mime);
  return entry ? entry[0] : 'bin';
}

export function isFormatSupported(ext: string): boolean {
  return _seen.has(ext.toLowerCase().replace(/^\./, ''));
}

// ─── Codec export formats (native browser + custom encoders) ─────────────────
export const NATIVE_CODEC_FORMATS: ExportFormat[] = [
  { label: 'MozJPEG — High-quality JPEG',      value: 'image/jpeg',  ext: 'jpg',  group: 'Lossy',    native: true  },
  { label: 'OxiPNG — Optimised PNG',            value: 'image/png',   ext: 'png',  group: 'Lossless', native: true, lossless: true },
  { label: 'WebP (libwebp) — Lossy/Lossless',   value: 'image/webp',  ext: 'webp', group: 'Lossy',    native: true  },
  { label: 'AVIF (libaom) — Next-gen codec',    value: 'image/avif',  ext: 'avif', group: 'Lossy'                   },
  { label: 'JPEG XL — Future standard',         value: 'image/jxl',   ext: 'jxl',  group: 'Next-Gen'               },
  { label: 'WebP2 — Experimental (Google)',     value: 'image/wp2',   ext: 'wp2',  group: 'Next-Gen'               },
  { label: 'GIF — 256-colour / animated',       value: 'image/gif',   ext: 'gif',  group: 'Legacy',   native: true  },
];

export const CUSTOM_ENCODER_FORMATS: ExportFormat[] = [
  { label: 'BMP — Windows Bitmap 24-bit',       value: 'custom/bmp',   ext: 'bmp',  group: 'Legacy'     },
  { label: 'TGA — Truevision Targa 32-bit',     value: 'custom/tga',   ext: 'tga',  group: 'Game/3D'    },
  { label: 'ICO — Multi-res Windows Icon',      value: 'custom/ico',   ext: 'ico',  group: 'System'     },
  { label: 'SVG — Raster-in-Vector wrapper',    value: 'custom/svg',   ext: 'svg',  group: 'Vector'     },
  { label: 'PPM — Portable Pixmap (P6)',        value: 'custom/ppm',   ext: 'ppm',  group: 'Portable'   },
  { label: 'PGM — Portable Graymap (P5)',       value: 'custom/pgm',   ext: 'pgm',  group: 'Portable'   },
  { label: 'FARBFELD — Simple RGBA 16-bit',     value: 'custom/ff',    ext: 'ff',   group: 'Exotic'     },
  { label: 'RAW RGBA — 8-bit binary pixel dump',value: 'custom/bin',   ext: 'bin',  group: 'Raw'        },
  { label: 'Base64 Data URI — inline embed',    value: 'custom/b64',   ext: 'b64',  group: 'Web'        },
  { label: 'HTML Canvas snippet — embed code',  value: 'custom/html',  ext: 'html', group: 'Web'        },
  { label: 'CSS Background rule',               value: 'custom/css',   ext: 'css',  group: 'Web'        },
  { label: 'ASCII Art text',                    value: 'custom/ascii', ext: 'txt',  group: 'Creative'   },
  { label: 'JSON — Image metadata report',      value: 'custom/json',  ext: 'json', group: 'Meta'       },
  { label: 'ZIP — Bundle of all variants',      value: 'custom/zip',   ext: 'zip',  group: 'Bundle'     },
];

// Alias export formats — all recognised input extensions as download aliases
// (the image is re-encoded as PNG internally, saved with alternate extension)
const ALIAS_SKIP = new Set(['jpg','jpeg','jpe','jfif','png','apng','gif','webp','avif','jxl','wp2',
  'bmp','dib','tga','ico','cur','svg','svgz','html','css','txt','json','bin','b64','ppm','pgm','ff','zip']);

export const ALIAS_EXPORT_FORMATS: ExportFormat[] = ALL_INPUT_EXTENSIONS
  .filter(ext => !ALIAS_SKIP.has(ext))
  .map(ext => ({
    label: `${ext.toUpperCase()} — format alias (.${ext})`,
    value: `alias/${ext}`,
    ext,
    group: getCategoryForExt(ext),
  }));

// All export formats combined
export const ALL_EXPORT_FORMATS: ExportFormat[] = [
  ...NATIVE_CODEC_FORMATS,
  ...CUSTOM_ENCODER_FORMATS,
  ...ALIAS_EXPORT_FORMATS,
];

// Helper: find which category an extension belongs to
export function getCategoryForExt(ext: string): string {
  for (const [cat, exts] of Object.entries(INPUT_FORMAT_CATEGORIES)) {
    if ((exts as string[]).includes(ext)) return cat;
  }
  return 'Other';
}

// Grouped for <Select> with <ListSubheader>
export const EXPORT_FORMATS_GROUPED: Array<{ group: string; formats: ExportFormat[] }> = (() => {
  const map = new Map<string, ExportFormat[]>();
  for (const f of ALL_EXPORT_FORMATS) {
    if (!map.has(f.group)) map.set(f.group, []);
    map.get(f.group)!.push(f);
  }
  return Array.from(map.entries()).map(([group, formats]) => ({ group, formats }));
})();

// Mime-value → extension lookup for download handler
export const EXT_BY_VALUE: Record<string, string> = Object.fromEntries(
  ALL_EXPORT_FORMATS.map(f => [f.value, f.ext])
);

// Quick lookup for codec Select dropdowns — just the real codecs
export const CODEC_SELECT_OPTIONS = NATIVE_CODEC_FORMATS.map(f => ({
  label: f.label.split(' — ')[0],  // short label e.g. "MozJPEG"
  value: f.value,
  ext: f.ext,
}));

// Lossless-only check
export function isLosslessFormat(value: string): boolean {
  const f = ALL_EXPORT_FORMATS.find(x => x.value === value);
  return f?.lossless ?? (value === 'image/png' || value === 'custom/bmp' ||
    value === 'custom/ppm' || value === 'custom/pgm' || value === 'custom/ff' ||
    value === 'custom/bin' || value.startsWith('alias/'));
}

// No-quality-slider formats (lossless or binary formats)
export function hasQualityControl(value: string): boolean {
  return !isLosslessFormat(value) &&
    !['custom/svg','custom/html','custom/css','custom/ascii','custom/json',
      'custom/zip','custom/b64','image/gif'].includes(value) &&
    !value.startsWith('alias/');
}
