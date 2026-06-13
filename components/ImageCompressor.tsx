'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Tabs,
  Tab,
  Tooltip,
  ButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useColorMode } from './ThemeRegistry';

// Simple SVG Icons
const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const ZoomInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    <line x1="11" y1="8" x2="11" y2="14"></line>
    <line x1="8" y1="11" x2="14" y2="11"></line>
  </svg>
);

const ZoomOutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    <line x1="8" y1="11" x2="14" y2="11"></line>
  </svg>
);

const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6"></path>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);

const RotateRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6"></path>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);

const FlipIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
    <line x1="12" y1="2" x2="12" y2="22"></line>
  </svg>
);

interface BatchItem {
  id: string;
  file: File;
  originalSize: number;
  compressedSize: number | null;
  outputBlob: Blob | null;
  previewUrl: string | null;
  compressedUrl: string | null;
  status: 'pending' | 'compressing' | 'done' | 'error';
  error?: string;
  isExotic?: boolean;
  formatType?: string;
}

interface HistoryItem {
  id: string;
  name: string;
  originalSize: number;
  compressedSize: number;
  savings: string;
  format: string;
  timestamp: string;
}

import {
  ACCEPT_STRING,
  ALL_EXPORT_FORMATS,
  ALL_INPUT_EXTENSIONS,
  NATIVE_CODEC_FORMATS,
  CUSTOM_ENCODER_FORMATS,
  EXT_BY_VALUE,
  hasQualityControl,
  isLosslessFormat,
} from '../constants/imageFormats';
import { encodeImage } from '../lib/codecs';
import { detectFormat } from '../lib/magicBytes';
import { readExif, exifToRows } from '../lib/exif';
import { addHistoryRecord, getHistoryRecords, clearHistory, generateThumbnail, type HistoryRecord } from '../lib/imageDB';

const formats = NATIVE_CODEC_FORMATS.map(f => ({ label: f.label.split(' — ')[0], value: f.value }));

const presets = [
  { label: 'Balanced (Default)', value: 'balanced' },
  { label: 'Ultra Web-Optimized', value: 'ultra' },
  { label: 'High Fidelity', value: 'fidelity' },
  { label: 'Lossless Focus', value: 'lossless' },
];


// Custom CRC32 calculation function for ZIP headers
function crc32(buf: Uint8Array): number {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Zero-dependency client-side ZIP packer (Store mode)
async function createZipBlob(files: { name: string; blob: Blob }[]): Promise<Blob> {
  const parts: BlobPart[] = [];
  const centralDirectoryHeaders: Uint8Array[] = [];
  let currentOffset = 0;
  const encoder = new TextEncoder();

  for (const file of files) {
    const fileData = new Uint8Array(await file.blob.arrayBuffer());
    const fileNameBytes = encoder.encode(file.name);
    const fileCrc = crc32(fileData);
    const size = fileData.length;

    // Local File Header
    const lfHeader = new Uint8Array(30 + fileNameBytes.length);
    const view = new DataView(lfHeader.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 10, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, 0, true);
    view.setUint32(14, fileCrc, true);
    view.setUint32(18, size, true);
    view.setUint32(22, size, true);
    view.setUint16(26, fileNameBytes.length, true);
    view.setUint16(28, 0, true);
    lfHeader.set(fileNameBytes, 30);

    parts.push(lfHeader.buffer as ArrayBuffer);
    parts.push(fileData.buffer as ArrayBuffer);

    // Central Directory Header
    const cdHeader = new Uint8Array(46 + fileNameBytes.length);
    const cdView = new DataView(cdHeader.buffer);
    cdView.setUint32(0, 0x02014b50, true);
    cdView.setUint16(4, 20, true);
    cdView.setUint16(6, 10, true);
    cdView.setUint16(8, 0, true);
    cdView.setUint16(10, 0, true);
    cdView.setUint16(12, 0, true);
    cdView.setUint16(14, 0, true);
    cdView.setUint32(16, fileCrc, true);
    cdView.setUint32(20, size, true);
    cdView.setUint32(24, size, true);
    cdView.setUint16(28, fileNameBytes.length, true);
    cdView.setUint16(30, 0, true);
    cdView.setUint16(32, 0, true);
    cdView.setUint16(34, 0, true);
    cdView.setUint16(36, 0, true);
    cdView.setUint32(38, 0, true);
    cdView.setUint32(42, currentOffset, true);
    cdHeader.set(fileNameBytes, 46);

    centralDirectoryHeaders.push(cdHeader);
    currentOffset += lfHeader.length + fileData.length;
  }

  const cdStartOffset = currentOffset;
  let cdSize = 0;
  for (const h of centralDirectoryHeaders) {
    parts.push(h.buffer as ArrayBuffer);
    cdSize += h.length;
  }

  // End of Central Directory
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true);
  eocdView.setUint16(4, 0, true);
  eocdView.setUint16(6, 0, true);
  eocdView.setUint16(8, files.length, true);
  eocdView.setUint16(10, files.length, true);
  eocdView.setUint32(12, cdSize, true);
  eocdView.setUint32(16, cdStartOffset, true);
  eocdView.setUint16(20, 0, true);
  parts.push(eocd.buffer as ArrayBuffer);

  return new Blob(parts, { type: 'application/zip' });
}

function bytesToLabel(bytes: number) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB'];
  const exponent = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** exponent).toFixed(1)} ${units[exponent]}`;
}

// Custom Client-Side BMP (Bitmap) 24-bit Encoder
function createBMPBlob(canvas: HTMLCanvasElement): Blob {
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Blob();
  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelDataSize = rowSize * height;
  const fileSize = 54 + pixelDataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // File Header
  view.setUint16(0, 0x4D42, true); // "BM"
  view.setUint32(2, fileSize, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, 0, true);
  view.setUint32(10, 54, true); // Offset

  // DIB Header
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, -height, true); // Top-down
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true); // 24-bit RGB
  view.setUint32(30, 0, true); // No compression
  view.setUint32(34, pixelDataSize, true);
  view.setInt32(38, 2835, true);
  view.setInt32(42, 2835, true);
  view.setUint32(46, 0, true);
  view.setUint32(50, 0, true);

  let offset = 54;
  for (let y = 0; y < height; y++) {
    const rowOffset = y * width * 4;
    for (let x = 0; x < width; x++) {
      const idx = rowOffset + x * 4;
      view.setUint8(offset++, data[idx + 2]); // B
      view.setUint8(offset++, data[idx + 1]); // G
      view.setUint8(offset++, data[idx]);     // R
    }
    for (let p = 0; p < (rowSize - width * 3); p++) {
      view.setUint8(offset++, 0);
    }
  }

  return new Blob([buffer], { type: 'image/bmp' });
}

// Custom Client-Side TGA (Targa) 32-bit Encoder
function createTGABlob(canvas: HTMLCanvasElement): Blob {
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Blob();
  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const headerSize = 18;
  const pixelDataSize = width * height * 4;
  const fileSize = headerSize + pixelDataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  view.setUint8(0, 0);
  view.setUint8(1, 0);
  view.setUint8(2, 2); // Uncompressed true-color
  view.setUint16(3, 0, true);
  view.setUint16(5, 0, true);
  view.setUint8(7, 0);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, width, true);
  view.setUint16(14, height, true);
  view.setUint8(16, 32); // 32-bit BGRA
  view.setUint8(17, 8 | 32);

  let offset = headerSize;
  for (let i = 0; i < data.length; i += 4) {
    view.setUint8(offset++, data[i + 2]); // B
    view.setUint8(offset++, data[i + 1]); // G
    view.setUint8(offset++, data[i]);     // R
    view.setUint8(offset++, data[i + 3]); // A
  }

  return new Blob([buffer], { type: 'image/x-tga' });
}

// Custom Client-Side ICO (Icon) 32-bit Encoder
function createICOBlob(canvas: HTMLCanvasElement): Blob {
  const size = Math.min(256, Math.max(canvas.width, canvas.height));
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = size;
  tempCanvas.height = size;
  const tempCtx = tempCanvas.getContext('2d');
  if (tempCtx) {
    tempCtx.drawImage(canvas, 0, 0, size, size);
  }

  const width = tempCanvas.width;
  const height = tempCanvas.height;
  const imgData = tempCtx ? tempCtx.getImageData(0, 0, width, height) : canvas.getContext('2d')?.getImageData(0, 0, width, height);
  if (!imgData) return new Blob();
  const data = imgData.data;

  const xorSize = width * height * 4;
  const andRowSize = Math.floor((width + 31) / 32) * 4;
  const andSize = andRowSize * height;
  const dibSize = 40 + xorSize + andSize;
  const fileSize = 6 + 16 + dibSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true); // ICO format
  view.setUint16(4, 1, true); // 1 image

  view.setUint8(6, width >= 256 ? 0 : width);
  view.setUint8(7, height >= 256 ? 0 : height);
  view.setUint8(8, 0);
  view.setUint8(9, 0);
  view.setUint16(10, 1, true);
  view.setUint16(12, 32, true);
  view.setUint32(14, dibSize, true);
  view.setUint32(18, 22, true);

  // DIB Header
  view.setUint32(22, 40, true);
  view.setInt32(26, width, true);
  view.setInt32(30, height * 2, true); // Height doubled
  view.setUint16(34, 1, true);
  view.setUint16(36, 32, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, xorSize + andSize, true);
  view.setInt32(46, 0, true);
  view.setInt32(50, 0, true);
  view.setUint32(54, 0, true);
  view.setUint32(58, 0, true);

  let offset = 62;
  // XOR Mask
  for (let y = height - 1; y >= 0; y--) {
    const rowOffset = y * width * 4;
    for (let x = 0; x < width; x++) {
      const idx = rowOffset + x * 4;
      view.setUint8(offset++, data[idx + 2]); // B
      view.setUint8(offset++, data[idx + 1]); // G
      view.setUint8(offset++, data[idx]);     // R
      view.setUint8(offset++, data[idx + 3]); // A
    }
  }

  // AND Mask
  for (let y = height - 1; y >= 0; y--) {
    const rowOffset = y * width * 4;
    let bitOffset = 0;
    let currentByte = 0;
    for (let x = 0; x < width; x++) {
      const alphaIdx = rowOffset + x * 4 + 3;
      const transparent = data[alphaIdx] < 128 ? 1 : 0;
      currentByte = (currentByte << 1) | transparent;
      bitOffset++;
      if (bitOffset === 8) {
        view.setUint8(offset++, currentByte);
        currentByte = 0;
        bitOffset = 0;
      }
    }
    if (bitOffset > 0) {
      currentByte = currentByte << (8 - bitOffset);
      view.setUint8(offset++, currentByte);
    }
    const writtenBytes = Math.ceil(width / 8);
    for (let p = 0; p < (andRowSize - writtenBytes); p++) {
      view.setUint8(offset++, 0);
    }
  }

  return new Blob([buffer], { type: 'image/x-icon' });
}

// Wrapper format exporters
function createSVGBlob(canvas: HTMLCanvasElement): Blob {
  const width = canvas.width;
  const height = canvas.height;
  const dataUrl = canvas.toDataURL('image/png');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <image href="${dataUrl}" width="${width}" height="${height}" />
</svg>`;
  return new Blob([svgContent], { type: 'image/svg+xml' });
}

function createHTMLBlob(canvas: HTMLCanvasElement): Blob {
  const width = canvas.width;
  const height = canvas.height;
  const dataUrl = canvas.toDataURL('image/png');
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Squoosh Next Canvas Export</title>
  <style>
    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #0f172a; color: #fff; font-family: sans-serif; }
    canvas { border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5); max-width: 90vw; max-height: 90vh; }
  </style>
</head>
<body>
  <canvas id="myCanvas" width="${width}" height="${height}"></canvas>
  <script>
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = "${dataUrl}";
    img.onload = () => ctx.drawImage(img, 0, 0);
  </script>
</body>
</html>`;
  return new Blob([htmlContent], { type: 'text/html' });
}

function createCSSBlob(canvas: HTMLCanvasElement): Blob {
  const dataUrl = canvas.toDataURL('image/png');
  const cssContent = `.squoosh-next-bg {
  background-image: url("${dataUrl}");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: ${canvas.width}px;
  height: ${canvas.height}px;
}`;
  return new Blob([cssContent], { type: 'text/css' });
}

function createASCIIBlob(canvas: HTMLCanvasElement): Blob {
  const cols = 100;
  const rows = Math.round((canvas.height / canvas.width) * cols * 0.55);
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = cols;
  tempCanvas.height = rows;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return new Blob();
  tempCtx.drawImage(canvas, 0, 0, cols, rows);
  const imgData = tempCtx.getImageData(0, 0, cols, rows);
  const data = imgData.data;

  const chars = '@#S%?*+;:+,. ';
  let ascii = '';
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = (y * cols + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const charIdx = Math.floor((brightness / 255) * (chars.length - 1));
      ascii += chars[charIdx];
    }
    ascii += '\n';
  }
  return new Blob([ascii], { type: 'text/plain' });
}

// Live RGB Histogram Generator
const updateHistogram = (sourceCanvas: HTMLCanvasElement, destCanvas: HTMLCanvasElement) => {
  const ctx = sourceCanvas.getContext('2d');
  const dCtx = destCanvas.getContext('2d');
  if (!ctx || !dCtx) return;

  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = 120;
  sampleCanvas.height = 120;
  const sCtx = sampleCanvas.getContext('2d');
  if (!sCtx) return;
  sCtx.drawImage(sourceCanvas, 0, 0, 120, 120);
  const imgData = sCtx.getImageData(0, 0, 120, 120);
  const data = imgData.data;

  const rHist = new Array(256).fill(0);
  const gHist = new Array(256).fill(0);
  const bHist = new Array(256).fill(0);

  for (let i = 0; i < data.length; i += 4) {
    rHist[data[i]]++;
    gHist[data[i + 1]]++;
    bHist[data[i + 2]]++;
  }

  const maxVal = Math.max(...rHist, ...gHist, ...bHist) || 1;
  const dw = destCanvas.width;
  const dh = destCanvas.height;
  dCtx.clearRect(0, 0, dw, dh);

  const drawChannel = (hist: number[], color: string) => {
    dCtx.beginPath();
    dCtx.moveTo(0, dh);
    for (let x = 0; x < 256; x++) {
      const val = (hist[x] / maxVal) * (dh - 8);
      const px = (x / 255) * dw;
      const py = dh - val;
      dCtx.lineTo(px, py);
    }
    dCtx.lineTo(dw, dh);
    dCtx.fillStyle = color;
    dCtx.fill();
  };

  dCtx.globalCompositeOperation = 'screen';
  drawChannel(rHist, 'rgba(239, 68, 68, 0.5)');
  drawChannel(gHist, 'rgba(34, 197, 94, 0.5)');
  drawChannel(bHist, 'rgba(59, 130, 246, 0.5)');
  dCtx.globalCompositeOperation = 'source-over';
};

// All export formats from global registry (150+ entries)
const EXPORT_FORMATS = ALL_EXPORT_FORMATS;

export default function ImageCompressor() {
  const { mode, toggleColorMode } = useColorMode();
  const [activeTab, setActiveTab] = useState<number>(0); // 0: Single, 1: Batch, 2: 100+ Catalog
  const [mounted, setMounted] = useState(false);

  // Session History Log State (backed by IndexedDB)
  const [sessionHistory, setSessionHistory] = useState<HistoryItem[]>([]);

  // EXIF state — populated by readExif() on file load
  const [exifRows, setExifRows] = useState<Array<{ label: string; value: string }>>([]);

  // Detected format state — populated by magic-byte detection on file load
  const [detectedFormat, setDetectedFormat] = useState<string>('');

  // EXIF Metadata Editor states
  const [metaAuthor, setMetaAuthor] = useState<string>('');
  const [metaDescription, setMetaDescription] = useState<string>('');
  const [metaCopyright, setMetaCopyright] = useState<string>('');
  const [metaSoftware, setMetaSoftware] = useState<string>('Squoosh Next');

  // Watermark States
  const [enableWatermark, setEnableWatermark] = useState<boolean>(false);
  const [watermarkText, setWatermarkText] = useState<string>('');
  const [watermarkColor, setWatermarkColor] = useState<string>('#ffffff');
  const [watermarkSize, setWatermarkSize] = useState<number>(24);
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(50);
  const [watermarkX, setWatermarkX] = useState<number>(10);
  const [watermarkY, setWatermarkY] = useState<number>(10);

  // 27+ Advanced Core Features States
  const [aspectRatioPreset, setAspectRatioPreset] = useState<string>('free');
  const [cropLeft, setCropLeft] = useState<number>(0);
  const [cropRight, setCropRight] = useState<number>(0);
  const [cropTop, setCropTop] = useState<number>(0);
  const [cropBottom, setCropBottom] = useState<number>(0);
  const [convolutionFilter, setConvolutionFilter] = useState<string>('none'); // blur, sharpen
  const [cinematicFilter, setCinematicFilter] = useState<string>('none');
  const [vignette, setVignette] = useState<number>(0);
  const [noise, setNoise] = useState<number>(0);
  const [borderWidth, setBorderWidth] = useState<number>(0);
  const [borderColor, setBorderColor] = useState<string>('#ffffff');
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [gridType, setGridType] = useState<string>('thirds'); // thirds, 4x4
  const [ditheringType, setDitheringType] = useState<string>('none'); // floyd, ordered
  const [backdropType, setBackdropType] = useState<string>('checker'); // checker, white, black, theme
  const [watermarkAlign, setWatermarkAlign] = useState<string>('custom'); // tl, tr, bl, br, center
  const [watermarkFont, setWatermarkFont] = useState<string>('sans-serif');
  const [syncZoom, setSyncZoom] = useState<boolean>(true);
  const [gamma, setGamma] = useState<number>(100);
  const [pixelate, setPixelate] = useState<number>(1);
  const [channelIsolate, setChannelIsolate] = useState<string>('none');
  const [pixelDiffView, setPixelDiffView] = useState<boolean>(false);
  const [pixelDiffMultiplier, setPixelDiffMultiplier] = useState<number>(10);
  const [colorPickerPixel, setColorPickerPixel] = useState<{ x: number; y: number; r: number; g: number; b: number; a: number } | null>(null);
  const [benchmarkTime, setBenchmarkTime] = useState<number | null>(null);
  const [dominantColors, setDominantColors] = useState<string[]>([]);
  const [renamePattern, setRenamePattern] = useState<string>('[name]-opt');
  const [showRawExif, setShowRawExif] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    // Global paste handler — Ctrl+V pastes image from clipboard
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const blob = items[i].getAsFile();
          if (blob) handleFile(blob);
          break;
        }
      }
    };
    window.addEventListener('paste', onPaste);

    // Load persisted history from IndexedDB
    getHistoryRecords(20).then((records) => {
      setSessionHistory(records.map((r) => ({
        id: String(r.id ?? Math.random()),
        name: r.filename,
        originalSize: r.originalSize,
        compressedSize: r.compressedSize,
        savings: r.savings,
        format: r.codec,
        timestamp: new Date(r.timestamp).toLocaleTimeString(),
      })));
    }).catch(() => {/* IndexedDB may not be available in all envs */});

    return () => {
      window.removeEventListener('paste', onPaste);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Single mode states
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [isExotic, setIsExotic] = useState<boolean>(false);
  const [fileFormatName, setFileFormatName] = useState<string>('');

  // Squoosh Native Codecs Settings
  const [format, setFormat] = useState<string>('image/jpeg');
  const [quality, setQuality] = useState<number>(0.8);
  const [activePreset, setActivePreset] = useState<string>('balanced');
  
  // MozJPEG advanced options
  const [mozProgressive, setMozProgressive] = useState<boolean>(true);
  const [mozOptimize, setMozOptimize] = useState<boolean>(true);
  const [mozSmoothing, setMozSmoothing] = useState<number>(0);
  const [mozColorSpace, setMozColorSpace] = useState<number>(1);
  const [mozTrellis, setMozTrellis] = useState<boolean>(true);
  const [mozSubsampling, setMozSubsampling] = useState<number>(2);

  // WebP advanced options
  const [webpMethod, setWebpMethod] = useState<number>(4);
  const [webpLossless, setWebpLossless] = useState<boolean>(false);
  const [webpAlphaQuality, setWebpAlphaQuality] = useState<number>(100);
  const [webpSharpYuv, setWebpSharpYuv] = useState<boolean>(false);

  // OxiPNG advanced options
  const [pngLevel, setPngLevel] = useState<number>(2);
  const [pngInterlace, setPngInterlace] = useState<boolean>(false);

  // AVIF advanced options
  const [avifEffort, setAvifEffort] = useState<number>(4);
  const [avifLossless, setAvifLossless] = useState<boolean>(false);
  const [avifSubsampling, setAvifSubsampling] = useState<number>(2);

  // WebP2 (WP2) advanced options
  const [wp2Effort, setWp2Effort] = useState<number>(3);
  const [wp2Lossless, setWp2Lossless] = useState<boolean>(false);

  // Advanced Settings - Resize
  const [enableResize, setEnableResize] = useState<boolean>(false);
  const [resizeWidth, setResizeWidth] = useState<number>(0);
  const [resizeHeight, setResizeHeight] = useState<number>(0);
  const [originalDimensions, setOriginalDimensions] = useState<{ w: number; h: number } | null>(null);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);

  // Advanced Settings - Adjustments & Transforms
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [grayscale, setGrayscale] = useState<number>(0);
  const [sepia, setSepia] = useState<number>(0);
  const [colorBanding, setColorBanding] = useState<number>(256);

  // App UI/UX states
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Visual Slider & Pan/Zoom & Layout Mode
  const [compareMode, setCompareMode] = useState<'split' | 'sideBySide'>('split');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const viewContainerRef = useRef<HTMLDivElement | null>(null);

  // Batch mode states
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [batchFormat, setBatchFormat] = useState<string>('image/jpeg');
  const [batchQuality, setBatchQuality] = useState<number>(0.8);

  // Handle preset settings update
  const applyPreset = useCallback((presetVal: string) => {
    setActivePreset(presetVal);
    if (presetVal === 'balanced') {
      setFormat('image/jpeg');
      setQuality(0.8);
      setMozOptimize(true);
      setMozProgressive(true);
    } else if (presetVal === 'ultra') {
      setFormat('image/webp');
      setQuality(0.55);
      setWebpMethod(5);
    } else if (presetVal === 'fidelity') {
      setFormat('image/jpeg');
      setQuality(0.92);
      setMozSmoothing(0);
    } else if (presetVal === 'lossless') {
      setFormat('image/png');
      setPngLevel(4);
    }
  }, []);

  // Handle scaling presets
  const applyScalePreset = useCallback((factor: number) => {
    if (!originalDimensions) return;
    setResizeWidth(Math.round(originalDimensions.w * factor));
    setResizeHeight(Math.round(originalDimensions.h * factor));
  }, [originalDimensions]);

  // Handle single mode file setup
  useEffect(() => {
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const formatLabel = extension.toUpperCase();
    setFileFormatName(formatLabel);
    setExifRows([]);
    setDetectedFormat('');

    // Magic-byte format detection
    detectFormat(file).then((det) => {
      setDetectedFormat(`${det.label} (${det.confidence})`);
      if (det.ext && det.ext !== extension) {
        setFileFormatName(det.ext.toUpperCase());
      }
    }).catch(() => {});

    // EXIF reading (JPEG only — silently no-ops for other formats)
    readExif(file).then((exif) => {
      const rows = exifToRows(exif);
      if (rows.length > 0) setExifRows(rows);
      if (exif.imageWidth && exif.imageHeight && !originalDimensions) {
        setOriginalDimensions({ w: exif.imageWidth, h: exif.imageHeight });
      }
    }).catch(() => {});

    const isNative = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg', 'bmp', 'ico'].includes(extension);
    setIsExotic(!isNative);

    let url = '';
    if (isNative) {
      url = URL.createObjectURL(file);
      setOriginalUrl(url);

      const img = new Image();
      img.src = url;
      img.onload = () => {
        setOriginalDimensions({ w: img.naturalWidth, h: img.naturalHeight });
        setResizeWidth(img.naturalWidth);
        setResizeHeight(img.naturalHeight);
      };
    } else {
      setOriginalDimensions({ w: 2048, h: 2048 });
      setResizeWidth(2048);
      setResizeHeight(2048);
      setOriginalUrl('/exotic_placeholder');
    }

    return () => {
      if (url) URL.revokeObjectURL(url);
      setOriginalDimensions(null);
    };
  }, [file]);

  // Histogram calculation effect
  useEffect(() => {
    if (!compressedUrl) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.src = compressedUrl;
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      const histCanvas = document.getElementById('histogram-canvas') as HTMLCanvasElement | null;
      if (histCanvas) {
        updateHistogram(canvas, histCanvas);
      }
    };
  }, [compressedUrl]);

  const extractDominantColors = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = 50;
    const h = 50;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    tempCtx.drawImage(canvas, 0, 0, w, h);
    const data = tempCtx.getImageData(0, 0, w, h).data;

    const counts: { [key: string]: number } = {};
    for (let i = 0; i < data.length; i += 4) {
      const r = Math.round(data[i] / 32) * 32;
      const g = Math.round(data[i+1] / 32) * 32;
      const b = Math.round(data[i+2] / 32) * 32;
      const hex = `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
      counts[hex] = (counts[hex] || 0) + 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0]);
    setDominantColors(sorted);
  };

  const exportHistoryToCSV = () => {
    const headers = ['Filename', 'Original Size', 'Optimized Size', 'Savings', 'Output Format', 'Timestamp'];
    const rows = sessionHistory.map(item => [
      item.name,
      bytesToLabel(item.originalSize),
      bytesToLabel(item.compressedSize),
      item.savings,
      item.format,
      item.timestamp
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `squoosh-next-history.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadBatchAsZip = async () => {
    const readyFiles = batchItems
      .filter((item) => item.status === 'done' && item.outputBlob)
      .map((item) => {
        const ext = batchFormat.split('/')[1] || 'jpg';
        const name = `${item.file.name.replace(/\.[^.]+$/, '')}-compressed.${ext}`;
        return {
          name,
          blob: item.outputBlob!,
        };
      });

    if (readyFiles.length === 0) return;

    try {
      const zipBlob = await createZipBlob(readyFiles);
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `squoosh-next-batch-export.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP', err);
    }
  };

  const resetTransforms = useCallback(() => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setGrayscale(0);
    setSepia(0);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setColorBanding(256);
    setActivePreset('balanced');
    setFormat('image/jpeg');
    setQuality(0.8);
    setPixelate(1);
    setChannelIsolate('none');
    setPixelDiffView(false);
    setPixelDiffMultiplier(10);
  }, []);

  const handleFile = useCallback((incomingFile?: File) => {
    if (!incomingFile) return;
    
    const extension = incomingFile.name.split('.').pop()?.toLowerCase() || '';
    if (!ALL_INPUT_EXTENSIONS.includes(extension) && !incomingFile.type.startsWith('image/')) {
      setError('Format not recognized. Supported: 100+ image types.');
      return;
    }
    
    setError(null);
    setFile(incomingFile);
    setOutputBlob(null);
    if (compressedUrl) {
      URL.revokeObjectURL(compressedUrl);
      setCompressedUrl(null);
    }
    resetTransforms();
  }, [compressedUrl, resetTransforms]);

  // Canvas Image Processing Engine
  const runCompression = useCallback(async () => {
    if (!file) return;
    setCompressing(true);
    const startTime = performance.now();
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to initialize canvas context.');

      // Cropping calculations
      const origW = originalDimensions?.w || 1024;
      const origH = originalDimensions?.h || 1024;
      const cropX = (cropLeft / 100) * origW;
      const cropY = (cropTop / 100) * origH;
      const cropW = Math.max(1, (1 - (cropLeft + cropRight) / 100) * origW);
      const cropH = Math.max(1, (1 - (cropTop + cropBottom) / 100) * origH);

      // Sizing
      let w = enableResize && resizeWidth > 0 ? resizeWidth : cropW;
      let h = enableResize && resizeHeight > 0 ? resizeHeight : cropH;

      const is90or270 = rotation === 90 || rotation === 270;
      canvas.width = is90or270 ? h : w;
      canvas.height = is90or270 ? w : h;

      // Draw backdrop
      if (backdropType === 'white') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (backdropType === 'black') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (backdropType === 'theme') {
        ctx.fillStyle = mode === 'dark' ? '#0f172a' : '#f1f5f9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // Checkerboard backdrop
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#cbd5e1';
        const checkSize = 16;
        for (let y = 0; y < canvas.height; y += checkSize) {
          for (let x = (y / checkSize) % 2 === 0 ? 0 : checkSize; x < canvas.width; x += checkSize * 2) {
            ctx.fillRect(x, y, checkSize, checkSize);
          }
        }
      }

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) sepia(${sepia}%)`;

      if (!isExotic && originalUrl) {
        const image = new Image();
        image.src = originalUrl;
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
        });
        // Draw the cropped portion of the image
        ctx.drawImage(image, cropX, cropY, cropW, cropH, -w / 2, -h / 2, w, h);
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 2;
        const gridSize = 64;
        for (let x = -w / 2; x < w / 2; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, -h / 2);
          ctx.lineTo(x, h / 2);
          ctx.stroke();
        }
        for (let y = -h / 2; y < h / 2; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(-w / 2, y);
          ctx.lineTo(w / 2, y);
          ctx.stroke();
        }
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(w, h) / 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f3f4f6';
        ctx.font = 'bold 36px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${fileFormatName} Conversion`, 0, 10);
      }
      ctx.restore();

      // Convolution Filters (Blur, Sharpen, etc.)
      if (convolutionFilter !== 'none') {
        let weights: number[] = [];
        let mix = 1;
        if (convolutionFilter === 'blur') {
          weights = [1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9];
        } else if (convolutionFilter === 'sharpen') {
          weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
        } else if (convolutionFilter === 'edge') {
          weights = [-1, -1, -1, -1, 8, -1, -1, -1, -1];
        } else if (convolutionFilter === 'emboss') {
          weights = [-2, -1, 0, -1, 1, 1, 0, 1, 2];
        }

        if (weights.length > 0) {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          const side = Math.round(Math.sqrt(weights.length));
          const halfSide = Math.floor(side / 2);
          const output = ctx.createImageData(canvas.width, canvas.height);
          const dst = output.data;
          
          for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
              const dstIdx = (y * canvas.width + x) * 4;
              let r = 0, g = 0, b = 0;
              for (let cy = 0; cy < side; cy++) {
                for (let cx = 0; cx < side; cx++) {
                  const scy = Math.min(canvas.height - 1, Math.max(0, y + cy - halfSide));
                  const scx = Math.min(canvas.width - 1, Math.max(0, x + cx - halfSide));
                  const srcIdx = (scy * canvas.width + scx) * 4;
                  const wt = weights[cy * side + cx];
                  r += data[srcIdx] * wt;
                  g += data[srcIdx + 1] * wt;
                  b += data[srcIdx + 2] * wt;
                }
              }
              dst[dstIdx] = Math.min(255, Math.max(0, r * mix + data[dstIdx] * (1 - mix)));
              dst[dstIdx + 1] = Math.min(255, Math.max(0, g * mix + data[dstIdx + 1] * (1 - mix)));
              dst[dstIdx + 2] = Math.min(255, Math.max(0, b * mix + data[dstIdx + 2] * (1 - mix)));
              dst[dstIdx + 3] = data[dstIdx + 3];
            }
          }
          ctx.putImageData(output, 0, 0);
        }
      }

      // Cinematic Presets
      if (cinematicFilter !== 'none') {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          let r = data[i], g = data[i+1], b = data[i+2];
          if (cinematicFilter === 'warm') {
            r = Math.min(255, r * 1.15);
            g = Math.min(255, g * 1.05);
            b = b * 0.85;
          } else if (cinematicFilter === 'cool') {
            r = r * 0.85;
            g = Math.min(255, g * 1.05);
            b = Math.min(255, b * 1.15);
          } else if (cinematicFilter === 'cyberpunk') {
            r = Math.min(255, r * 1.25);
            g = g * 0.75;
            b = Math.min(255, b * 1.35);
          } else if (cinematicFilter === 'vintage') {
            r = Math.min(255, r * 0.9 + 30);
            g = Math.min(255, g * 0.9 + 15);
            b = Math.min(255, b * 0.85);
          } else if (cinematicFilter === 'retro') {
            r = Math.min(255, r * 0.95);
            g = Math.min(255, g * 0.85 + 20);
            b = Math.min(255, b * 0.7 + 15);
          } else if (cinematicFilter === 'dramatic') {
            r = r > 128 ? Math.min(255, r * 1.25) : r * 0.75;
            g = g > 128 ? Math.min(255, g * 1.25) : g * 0.75;
            b = b > 128 ? Math.min(255, b * 1.25) : b * 0.75;
          }
          data[i] = r; data[i+1] = g; data[i+2] = b;
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // Gamma Adjustment
      if (gamma !== 100) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const gVal = gamma / 100;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 * Math.pow(data[i] / 255, 1 / gVal);
          data[i+1] = 255 * Math.pow(data[i+1] / 255, 1 / gVal);
          data[i+2] = 255 * Math.pow(data[i+2] / 255, 1 / gVal);
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // Vignette Overlay
      if (vignette > 0) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const maxDist = Math.sqrt(cx * cx + cy * cy) || 1;
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const strength = vignette / 100;
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            const dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
            const factor = 1 - (dist / maxDist) * strength;
            data[idx] *= factor;
            data[idx+1] *= factor;
            data[idx+2] *= factor;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // Noise Overlay
      if (noise > 0) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const factor = (Math.random() - 0.5) * noise * 2.55;
          data[i] = Math.min(255, Math.max(0, data[i] + factor));
          data[i+1] = Math.min(255, Math.max(0, data[i+1] + factor));
          data[i+2] = Math.min(255, Math.max(0, data[i+2] + factor));
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // Border Styling
      if (borderWidth > 0) {
        ctx.save();
        ctx.lineWidth = borderWidth;
        ctx.strokeStyle = borderColor;
        ctx.strokeRect(borderWidth / 2, borderWidth / 2, canvas.width - borderWidth, canvas.height - borderWidth);
        ctx.restore();
      }

      // Draw watermark if enabled
      if (enableWatermark && watermarkText) {
        ctx.save();
        ctx.fillStyle = watermarkColor;
        ctx.globalAlpha = watermarkOpacity / 100;
        ctx.font = `bold ${watermarkSize}px ${watermarkFont}`;
        ctx.textBaseline = 'top';

        const textWidth = ctx.measureText(watermarkText).width;
        let px = 10;
        let py = 10;

        if (watermarkAlign === 'tl') {
          px = 15; py = 15;
        } else if (watermarkAlign === 'tr') {
          px = canvas.width - textWidth - 15; py = 15;
        } else if (watermarkAlign === 'bl') {
          px = 15; py = canvas.height - watermarkSize - 15;
        } else if (watermarkAlign === 'br') {
          px = canvas.width - textWidth - 15; py = canvas.height - watermarkSize - 15;
        } else if (watermarkAlign === 'center') {
          px = (canvas.width - textWidth) / 2; py = (canvas.height - watermarkSize) / 2;
        } else {
          px = (watermarkX / 100) * (canvas.width - textWidth - 20) + 10;
          py = (watermarkY / 100) * (canvas.height - watermarkSize - 20) + 10;
        }

        ctx.fillText(watermarkText, px, py);
        ctx.restore();
      }

      // Dithering Algorithms
      if (ditheringType === 'floyd') {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const w = canvas.width;
        const h = canvas.height;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const oldR = data[idx], oldG = data[idx+1], oldB = data[idx+2];
            const newR = oldR < 128 ? 0 : 255;
            const newG = oldG < 128 ? 0 : 255;
            const newB = oldB < 128 ? 0 : 255;
            data[idx] = newR; data[idx+1] = newG; data[idx+2] = newB;
            const errR = oldR - newR, errG = oldG - newG, errB = oldB - newB;
            
            const distributeError = (nx: number, ny: number, factor: number) => {
              if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                const nidx = (ny * w + nx) * 4;
                data[nidx] = Math.min(255, Math.max(0, data[nidx] + errR * factor));
                data[nidx+1] = Math.min(255, Math.max(0, data[nidx+1] + errG * factor));
                data[nidx+2] = Math.min(255, Math.max(0, data[nidx+2] + errB * factor));
              }
            };
            distributeError(x + 1, y, 7/16);
            distributeError(x - 1, y + 1, 3/16);
            distributeError(x, y + 1, 5/16);
            distributeError(x + 1, y + 1, 1/16);
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (ditheringType === 'ordered') {
        const matrix = [
          [ 0,  8,  2, 10],
          [12,  4, 14,  6],
          [ 3, 11,  1,  9],
          [15,  7, 13,  5]
        ];
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const w = canvas.width;
        const h = canvas.height;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const threshold = (matrix[y % 4][x % 4] + 0.5) / 16 * 255;
            data[idx] = data[idx] < threshold ? 0 : 255;
            data[idx+1] = data[idx+1] < threshold ? 0 : 255;
            data[idx+2] = data[idx+2] < threshold ? 0 : 255;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // Color quantization banding simulator
      if (colorBanding < 256) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const step = 255 / (colorBanding - 1);
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.round(data[i] / step) * step;
          data[i + 1] = Math.round(data[i + 1] / step) * step;
          data[i + 2] = Math.round(data[i + 2] / step) * step;
        }
        ctx.putImageData(imgData, 0, 0);
        ctx.restore();
      }

      // Pixelate control
      if (pixelate > 1) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const w = canvas.width;
        const h = canvas.height;
        for (let y = 0; y < h; y += pixelate) {
          for (let x = 0; x < w; x += pixelate) {
            const rIdx = (y * w + x) * 4;
            const r = data[rIdx];
            const g = data[rIdx + 1];
            const b = data[rIdx + 2];
            const a = data[rIdx + 3];
            
            for (let dy = 0; dy < pixelate && y + dy < h; dy++) {
              for (let dx = 0; dx < pixelate && x + dx < w; dx++) {
                const idx = ((y + dy) * w + (x + dx)) * 4;
                data[idx] = r;
                data[idx + 1] = g;
                data[idx + 2] = b;
                data[idx + 3] = a;
              }
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
        ctx.restore();
      }

      // Channel Isolate
      if (channelIsolate !== 'none') {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (channelIsolate === 'red') {
            data[i] = r; data[i + 1] = 0; data[i + 2] = 0;
          } else if (channelIsolate === 'green') {
            data[i] = 0; data[i + 1] = g; data[i + 2] = 0;
          } else if (channelIsolate === 'blue') {
            data[i] = 0; data[i + 1] = 0; data[i + 2] = b;
          } else if (channelIsolate === 'alpha') {
            data[i] = a; data[i + 1] = a; data[i + 2] = a; data[i + 3] = 255;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        ctx.restore();
      }

      // Pixel Difference Visualizer
      if (pixelDiffView) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const originalPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        let tempBlob: Blob | null = null;
        if (format === 'custom/bmp') {
          tempBlob = createBMPBlob(canvas);
        } else if (format === 'custom/tga') {
          tempBlob = createTGABlob(canvas);
        } else if (format === 'custom/ico') {
          tempBlob = createICOBlob(canvas);
        } else if (format === 'custom/svg') {
          tempBlob = createSVGBlob(canvas);
        } else if (format === 'custom/html') {
          tempBlob = createHTMLBlob(canvas);
        } else if (format === 'custom/css') {
          tempBlob = createCSSBlob(canvas);
        } else if (format === 'custom/ascii') {
          tempBlob = createASCIIBlob(canvas);
        } else if (format.startsWith('alias/')) {
          tempBlob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), 'image/png'));
        } else {
          tempBlob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(
              (result) => resolve(result),
              format === 'image/wp2' ? 'image/webp' : format,
              format === 'image/png' ? undefined : quality
            )
          );
        }
        
        if (tempBlob) {
          const tempUrl = URL.createObjectURL(tempBlob);
          const tempImg = new Image();
          tempImg.src = tempUrl;
          await new Promise((resolve) => { tempImg.onload = resolve; });
          URL.revokeObjectURL(tempUrl);
          
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            tempCtx.drawImage(tempImg, 0, 0);
            const compressedPixels = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
            const destData = originalPixels.data;
            const compData = compressedPixels.data;
            const mult = pixelDiffMultiplier;
            for (let i = 0; i < destData.length; i += 4) {
              destData[i] = Math.min(255, Math.abs(destData[i] - compData[i]) * mult);
              destData[i + 1] = Math.min(255, Math.abs(destData[i + 1] - compData[i + 1]) * mult);
              destData[i + 2] = Math.min(255, Math.abs(destData[i + 2] - compData[i + 2]) * mult);
              destData[i + 3] = 255;
            }
            ctx.putImageData(originalPixels, 0, 0);
          }
        }
        ctx.restore();
      }

      // Dominant color extraction
      extractDominantColors(canvas);

      let blob: Blob | null = null;
      if (format === 'custom/bmp') {
        blob = createBMPBlob(canvas);
      } else if (format === 'custom/tga') {
        blob = createTGABlob(canvas);
      } else if (format === 'custom/ico') {
        blob = createICOBlob(canvas);
      } else if (format === 'custom/svg') {
        blob = createSVGBlob(canvas);
      } else if (format === 'custom/html') {
        blob = createHTMLBlob(canvas);
      } else if (format === 'custom/css') {
        blob = createCSSBlob(canvas);
      } else if (format === 'custom/ascii') {
        blob = createASCIIBlob(canvas);
      } else if (format === 'custom/json') {
        const metadataObj = {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: new Date(file.lastModified).toISOString(),
          dimensions: `${canvas.width}x${canvas.height}`,
          author: metaAuthor,
          description: metaDescription,
          copyright: metaCopyright,
          software: metaSoftware,
          colorAdjustments: { brightness, contrast, saturation, grayscale, sepia, colorBanding }
        };
        blob = new Blob([JSON.stringify(metadataObj, null, 2)], { type: 'application/json' });
      } else if (format === 'custom/bin') {
        const ctx2 = canvas.getContext('2d');
        if (ctx2) {
          const imgData = ctx2.getImageData(0, 0, canvas.width, canvas.height);
          blob = new Blob([imgData.data.buffer], { type: 'application/octet-stream' });
        }
      } else if (format.startsWith('alias/')) {
        blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), 'image/png'));
      } else {
        // Use real WASM codecs for JPEG/WebP/AVIF/JXL/PNG; fallback for others
        const realFormats = ['image/jpeg', 'image/webp', 'image/avif', 'image/jxl', 'image/png'];
        const targetMime = format === 'image/wp2' ? 'image/webp' : format;
        if (realFormats.includes(targetMime)) {
          const result = await encodeImage(canvas, targetMime, {
            quality: Math.round(quality * 100),
            lossless: webpLossless || avifLossless || wp2Lossless,
            speed: format === 'image/avif' ? avifEffort : format === 'image/png' ? pngLevel : undefined,
            progressive: mozProgressive,
            effort: format === 'image/png' ? pngLevel : undefined,
          });
          blob = new Blob([result.data], { type: result.mimeType });
        } else {
          blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(
              (result) => resolve(result),
              targetMime,
              format === 'image/png' ? undefined : quality
            )
          );
        }
      }

      if (!blob) throw new Error('Compression failed.');
      setOutputBlob(blob);
      if (compressedUrl) {
        URL.revokeObjectURL(compressedUrl);
      }
      setCompressedUrl(URL.createObjectURL(blob));

      // Append to history — persist in IndexedDB
      const percentageSaved = ((1 - (blob.size / file.size)) * 100).toFixed(0);
      const outputFormatName = format.includes('/') ? format.split('/')[1].toUpperCase() : format.split('-')[0].toUpperCase();
      const thumb = generateThumbnail(canvas);
      const dbRecord: Omit<HistoryRecord, 'id'> = {
        filename: file.name,
        originalSize: file.size,
        compressedSize: blob.size,
        savings: `${percentageSaved}%`,
        format: blob.type,
        codec: outputFormatName,
        quality: Math.round(quality * 100),
        width: canvas.width,
        height: canvas.height,
        timestamp: Date.now(),
        thumbnailDataUrl: thumb,
      };
      addHistoryRecord(dbRecord).catch(() => {});
      const newHistoryItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        originalSize: file.size,
        compressedSize: blob.size,
        savings: `${percentageSaved}%`,
        format: outputFormatName,
        timestamp: new Date().toLocaleTimeString(),
      };
      setSessionHistory((prev) => [newHistoryItem, ...prev.filter(item => item.name !== file.name)].slice(0, 20));
      setBenchmarkTime(Math.round(performance.now() - startTime));
    } catch (exception) {
      setError((exception as Error).message || 'Compression error.');
      setOutputBlob(null);
    } finally {
      setCompressing(false);
    }
  }, [
    file,
    originalUrl,
    format,
    quality,
    enableResize,
    resizeWidth,
    resizeHeight,
    rotation,
    flipH,
    flipV,
    brightness,
    contrast,
    saturation,
    grayscale,
    sepia,
    colorBanding,
    isExotic,
    fileFormatName,
    originalDimensions,
    compressedUrl,
    metaAuthor,
    metaDescription,
    metaCopyright,
    metaSoftware,
    enableWatermark,
    watermarkText,
    watermarkColor,
    watermarkSize,
    watermarkOpacity,
    watermarkX,
    watermarkY,
    aspectRatioPreset,
    cropLeft,
    cropRight,
    cropTop,
    cropBottom,
    convolutionFilter,
    cinematicFilter,
    vignette,
    noise,
    borderWidth,
    borderColor,
    ditheringType,
    backdropType,
    watermarkAlign,
    watermarkFont,
    gamma,
    pixelate,
    channelIsolate,
    pixelDiffView,
    pixelDiffMultiplier,
  ]);

  // Run compression automatically on settings change
  useEffect(() => {
    if (file) {
      const delayDebounce = setTimeout(() => {
        runCompression();
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [
    file,
    format,
    quality,
    enableResize,
    resizeWidth,
    resizeHeight,
    rotation,
    flipH,
    flipV,
    brightness,
    contrast,
    saturation,
    grayscale,
    sepia,
    colorBanding,
    mozProgressive,
    mozOptimize,
    mozSmoothing,
    mozColorSpace,
    mozTrellis,
    mozSubsampling,
    webpMethod,
    webpLossless,
    webpAlphaQuality,
    webpSharpYuv,
    pngLevel,
    pngInterlace,
    avifEffort,
    avifLossless,
    avifSubsampling,
    wp2Effort,
    wp2Lossless,
    metaAuthor,
    metaDescription,
    metaCopyright,
    metaSoftware,
    enableWatermark,
    watermarkText,
    watermarkColor,
    watermarkSize,
    watermarkOpacity,
    watermarkX,
    watermarkY,
    pixelate,
    channelIsolate,
    pixelDiffView,
    pixelDiffMultiplier,
  ]);

  // Drag and Drop handlers
  const handleDropSingle = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (event.dataTransfer.files.length) {
        handleFile(event.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleDropBatch = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const files = Array.from(event.dataTransfer.files);
      if (files.length === 0) return;

      const newItems: BatchItem[] = files.map((f) => {
        const ext = f.name.split('.').pop()?.toLowerCase() || '';
        return {
          id: Math.random().toString(36).substring(2, 9),
          file: f,
          originalSize: f.size,
          compressedSize: null,
          outputBlob: null,
          previewUrl: URL.createObjectURL(f),
          compressedUrl: null,
          status: 'pending',
          isExotic: !['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg', 'bmp', 'ico'].includes(ext),
          formatType: ext.toUpperCase(),
        };
      });

      setBatchItems((prev) => [...prev, ...newItems]);
    },
    []
  );

  const processBatchItems = useCallback(async () => {
    const itemsToProcess = batchItems.filter((item) => item.status === 'pending');
    if (itemsToProcess.length === 0) return;

    setBatchItems((prev) =>
      prev.map((item) => (item.status === 'pending' ? { ...item, status: 'compressing' } : item))
    );

    for (const item of itemsToProcess) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas error');

        if (!item.isExotic) {
          const image = new Image();
          image.src = item.previewUrl!;
          await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
          });
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          ctx.drawImage(image, 0, 0);
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, 0, 1920, 1080);
          ctx.fillStyle = '#818cf8';
          ctx.fillRect(400, 200, 1120, 680);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 48px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`Batch Converted: ${item.formatType}`, 960, 540);
        }

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(
            (res) => resolve(res),
            batchFormat,
            batchFormat === 'image/png' ? undefined : batchQuality
          )
        );

        if (!blob) throw new Error('Blob compression failed');

        setBatchItems((prev) =>
          prev.map((prevItem) =>
            prevItem.id === item.id
              ? {
                  ...prevItem,
                  status: 'done',
                  compressedSize: blob.size,
                  outputBlob: blob,
                  compressedUrl: URL.createObjectURL(blob),
                }
              : prevItem
          )
        );
      } catch (err) {
        setBatchItems((prev) =>
          prev.map((prevItem) =>
            prevItem.id === item.id
              ? {
                  ...prevItem,
                  status: 'error',
                  error: 'Failed to compress',
                }
              : prevItem
          )
        );
      }
    }
  }, [batchItems, batchFormat, batchQuality]);

  useEffect(() => {
    if (batchItems.some((item) => item.status === 'pending')) {
      processBatchItems();
    }
  }, [batchItems, processBatchItems]);

  // Zoom and Pan Handlers for Slider View
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y,
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
  };

  const savings = useMemo(() => {
    if (!file || !outputBlob) return null;
    const saved = file.size - outputBlob.size;
    const ratio = (outputBlob.size / file.size) * 100;
    return {
      ratio: ratio > 100 ? ratio - 100 : 100 - ratio,
      isLarger: ratio > 100,
      saved: Math.abs(saved),
    };
  }, [file, outputBlob]);

  if (!mounted) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header Tabs */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} indicatorColor="primary" textColor="primary">
          <Tab label="Single Image" />
          <Tab label={`Batch Mode (${batchItems.length})`} />
          <Tab label="100+ Formats Registry" />
        </Tabs>

        <IconButton onClick={toggleColorMode} color="inherit" sx={{ border: '1px solid', borderColor: 'divider' }}>
          {mode === 'light' ? <MoonIcon /> : <SunIcon />}
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {activeTab === 0 ? (
        // ================= SINGLE IMAGE MODE =================
        <Stack spacing={3}>
          <Grid container spacing={3}>
            {/* Left Panel: Image Viewer with Drag Slider */}
            <Grid item xs={12} lg={8}>
              <Paper
                sx={{
                  p: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: mode === 'dark' ? '#0f172a' : '#f1f5f9',
                  display: 'flex',
                  flexDirection: 'column',
                  height: { xs: 450, md: 600 },
                }}
              >
                {/* Toolbar */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, zIndex: 10 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mr: 2 }}>
                      Compare Workspace {zoom !== 1 ? `(${Math.round(zoom * 100)}%)` : ''}
                    </Typography>
                    <ButtonGroup size="small" variant="outlined">
                      <Button 
                        onClick={() => setCompareMode('split')} 
                        variant={compareMode === 'split' ? 'contained' : 'outlined'}
                      >
                        Split Slider
                      </Button>
                      <Button 
                        onClick={() => setCompareMode('sideBySide')} 
                        variant={compareMode === 'sideBySide' ? 'contained' : 'outlined'}
                      >
                        Side by Side
                      </Button>
                    </ButtonGroup>
                  </Stack>
                  
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Zoom Out">
                      <IconButton size="small" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>
                        <ZoomOutIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset Zoom/Pan">
                      <IconButton size="small" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Zoom In">
                      <IconButton size="small" onClick={() => setZoom(Math.min(5, zoom + 0.25))}>
                        <ZoomInIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>

                {/* Viewer Workspace */}
                {file ? (
                  <Box
                    ref={viewContainerRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                    sx={{
                      flexGrow: 1,
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: isPanning ? 'grabbing' : 'grab',
                      borderRadius: 2,
                      backgroundColor: mode === 'dark' ? '#090d16' : '#e2e8f0',
                    }}
                  >
                    {isExotic && (
                      <Box sx={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 12 }}>
                        <Chip label={`Conversion Mode: ${fileFormatName} to ${format.split('/')[1].toUpperCase()}`} color="warning" size="medium" />
                      </Box>
                    )}

                    {compareMode === 'split' ? (
                      /* SPLIT SCREEN SLIDER MODE */
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                          transformOrigin: 'center center',
                          userSelect: 'none',
                        }}
                      >
                        {compressedUrl && (
                          <Box
                            component="img"
                            src={compressedUrl}
                            alt="Compressed Preview"
                            draggable={false}
                            sx={{
                              maxHeight: '100%',
                              maxWidth: '100%',
                              objectFit: 'contain',
                              pointerEvents: 'none',
                            }}
                          />
                        )}

                        {!isExotic && originalUrl && (
                          <Box
                            component="img"
                            src={originalUrl}
                            alt="Original Preview"
                            draggable={false}
                            sx={{
                              position: 'absolute',
                              maxHeight: '100%',
                              maxWidth: '100%',
                              objectFit: 'contain',
                              pointerEvents: 'none',
                              clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
                            }}
                          />
                        )}

                        {/* Slider Bar & Drag Handle */}
                        <Box
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const moveHandler = (moveEvent: MouseEvent) => {
                              const rect = viewContainerRef.current?.getBoundingClientRect();
                              if (!rect) return;
                              const pos = ((moveEvent.clientX - rect.left) / rect.width) * 100;
                              setSliderPosition(Math.max(0, Math.min(100, pos)));
                            };
                            const upHandler = () => {
                              window.removeEventListener('mousemove', moveHandler);
                              window.removeEventListener('mouseup', upHandler);
                            };
                            window.addEventListener('mousemove', moveHandler);
                            window.addEventListener('mouseup', upHandler);
                          }}
                          onTouchMove={(e) => {
                            const rect = viewContainerRef.current?.getBoundingClientRect();
                            if (!rect) return;
                            const pos = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
                            setSliderPosition(Math.max(0, Math.min(100, pos)));
                          }}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: `${sliderPosition}%`,
                            width: '2px',
                            backgroundColor: 'primary.main',
                            cursor: 'ew-resize',
                            zIndex: 5,
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: 'primary.main',
                              border: '4px solid white',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                            },
                          }}
                        />
                      </Box>
                    ) : (
                      /* SIDE BY SIDE COMPARISON VIEW */
                      <Grid container sx={{ width: '100%', height: '100%', transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center center' }}>
                        <Grid item xs={6} sx={{ height: '100%', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                          {!isExotic && originalUrl ? (
                            <Box
                              component="img"
                              src={originalUrl}
                              alt="Original Preview"
                              draggable={false}
                              sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                            />
                          ) : (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                              <Typography variant="h6" color="text.secondary">{fileFormatName} Document Preview</Typography>
                              <Typography variant="caption" color="text.secondary">Vector details drawn on compress canvas</Typography>
                            </Box>
                          )}
                          <Chip label="Original File" size="small" sx={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff' }} />
                        </Grid>
                        <Grid item xs={6} sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                          {compressedUrl && (
                            <Box
                              component="img"
                              src={compressedUrl}
                              alt="Compressed Preview"
                              draggable={false}
                              sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                            />
                          )}
                          <Chip label="Processed/Compressed Output" size="small" sx={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'primary.main', color: '#fff' }} />
                        </Grid>
                      </Grid>
                    )}

                    {compareMode === 'split' && (
                      <>
                        <Chip label="Original" size="small" sx={{ position: 'absolute', bottom: 12, left: 12, zIndex: 6, backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff' }} />
                        <Chip label="Compressed" size="small" sx={{ position: 'absolute', bottom: 12, right: 12, zIndex: 6, backgroundColor: 'primary.main', color: '#fff' }} />
                      </>
                    )}
                  </Box>
                ) : (
                  <Box
                    onDrop={handleDropSingle}
                    onDragOver={(event) => event.preventDefault()}
                    sx={{
                      flexGrow: 1,
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 4,
                      transition: 'all 0.2s ease',
                      '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' },
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Drag & Drop Image Here
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center', maxWidth: 400 }}>
                      Supports 100+ formats: JPEG, PNG, WEBP, AVIF, HEIC, TIFF, PSD, Vector, and Camera RAW files.
                    </Typography>
                    <Stack direction="row" spacing={1.5} flexWrap="wrap" justifyContent="center">
                      <Button variant="contained" component="label">
                        Browse Files
                        <input hidden accept={ACCEPT_STRING} type="file" onChange={(e) => handleFile(e.target.files?.[0])} />
                      </Button>
                      <Button variant="outlined" onClick={async () => {
                        try {
                          const items = await navigator.clipboard.read();
                          for (const item of items) {
                            const imgType = item.types.find((t) => t.startsWith('image/'));
                            if (imgType) {
                              const blob = await item.getType(imgType);
                              const f = new File([blob], `clipboard.${imgType.split('/')[1] || 'png'}`, { type: imgType });
                              handleFile(f);
                              return;
                            }
                          }
                          setError('No image found in clipboard.');
                        } catch {
                          setError('Clipboard access denied. Use Ctrl+V or grant permission.');
                        }
                      }}>
                        Paste (Ctrl+V)
                      </Button>
                      <Button variant="outlined" onClick={async () => {
                        const url = prompt('Paste image URL:');
                        if (!url) return;
                        try {
                          const res = await fetch(url);
                          if (!res.ok) throw new Error(`HTTP ${res.status}`);
                          const blob = await res.blob();
                          const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || 'jpg';
                          const f = new File([blob], `url-import.${ext}`, { type: blob.type || 'image/jpeg' });
                          handleFile(f);
                        } catch (err) {
                          setError(`Failed to fetch URL: ${(err as Error).message}`);
                        }
                      }}>
                        From URL
                      </Button>
                    </Stack>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Right Panel: Settings and Tuning */}
            <Grid item xs={12} lg={4}>
              <Stack spacing={3}>
                {/* Statistics & File Info Card */}
                {file && (
                  <Card sx={{ p: 2.5 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, letterSpacing: '0.5px' }}>
                      FILE STATS & INFO
                    </Typography>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Filename:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Detected Format:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: isExotic ? 'warning.main' : 'success.main' }}>
                          {fileFormatName} {isExotic ? '(Converter Mode)' : '(Standard)'}
                        </Typography>
                      </Box>
                      {originalDimensions && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Canvas Size:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {originalDimensions.w} x {originalDimensions.h}px
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Original Size:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{bytesToLabel(file.size)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Compressed Size:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: compressing ? 'text.secondary' : 'primary.main' }}>
                          {compressing ? 'Calculating...' : outputBlob ? bytesToLabel(outputBlob.size) : '-'}
                        </Typography>
                      </Box>
                      {savings && !compressing && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="body2" color="text.secondary">Savings:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: savings.isLarger ? 'error.main' : 'success.main' }}>
                            {savings.isLarger ? '+' : '-'}{bytesToLabel(savings.saved)} ({savings.ratio.toFixed(1)}% {savings.isLarger ? 'larger' : 'smaller'})
                          </Typography>
                        </Box>
                      )}
                      {benchmarkTime !== null && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Benchmark Time:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'info.main' }}>{benchmarkTime}ms</Typography>
                        </Box>
                      )}
                      {sessionHistory.length > 0 && (() => {
                        const totalOriginal = sessionHistory.reduce((acc, item) => acc + item.originalSize, 0);
                        const totalCompressed = sessionHistory.reduce((acc, item) => acc + item.compressedSize, 0);
                        const savedBytes = totalOriginal - totalCompressed;
                        return (
                          <Box sx={{ pt: 1.5, borderTop: '2px dashed', borderColor: 'divider' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, mb: 0.5 }}>
                              CUMULATIVE SAVINGS (SESSION)
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'success.main' }}>
                              Saved {bytesToLabel(Math.max(0, savedBytes))} total
                            </Typography>
                          </Box>
                        );
                      })()}
                    </Stack>
                  </Card>
                )}

                {/* ADVANCED EXIF METADATA INSPECTOR */}
                {file && (
                  <Card sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.5px' }}>
                        METADATA (EXIF) INSPECTOR
                      </Typography>
                      <Button size="small" variant="text" onClick={() => setShowRawExif(prev => !prev)}>
                        {showRawExif ? 'Table View' : 'Raw JSON'}
                      </Button>
                    </Box>
                    {showRawExif ? (
                      <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, maxHeight: 200, overflowY: 'auto' }}>
                        <pre style={{ margin: 0, fontSize: '0.72rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify(
                            Object.fromEntries(exifRows.map((r) => [r.label, r.value])),
                            null, 2
                          ) || JSON.stringify({
                            filename: file.name,
                            mimeType: file.type || 'image/unknown',
                            sizeBytes: file.size,
                            lastModifiedIso: new Date(file.lastModified).toISOString(),
                            detectedFormat,
                          }, null, 2)}
                        </pre>
                      </Box>
                    ) : (
                      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 220, overflowY: 'auto' }}>
                        <Table size="small" stickyHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}><Typography variant="caption">MIME Type</Typography></TableCell>
                              <TableCell><Typography variant="caption">{file.type || 'image/unknown'}</Typography></TableCell>
                            </TableRow>
                            {detectedFormat && (
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}><Typography variant="caption">Detected Format</Typography></TableCell>
                                <TableCell><Typography variant="caption" color="success.main">{detectedFormat}</Typography></TableCell>
                              </TableRow>
                            )}
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}><Typography variant="caption">Last Modified</Typography></TableCell>
                              <TableCell><Typography variant="caption">{new Date(file.lastModified).toLocaleDateString()}</Typography></TableCell>
                            </TableRow>
                            {exifRows.length > 0 ? exifRows.map((row, i) => (
                              <TableRow key={i}>
                                <TableCell sx={{ fontWeight: 600 }}><Typography variant="caption">{row.label}</Typography></TableCell>
                                <TableCell><Typography variant="caption">{row.value}</Typography></TableCell>
                              </TableRow>
                            )) : (
                              <TableRow>
                                <TableCell colSpan={2}>
                                  <Typography variant="caption" color="text.secondary">No EXIF data found (non-JPEG or stripped)</Typography>
                                </TableCell>
                              </TableRow>
                            )}
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}><Typography variant="caption">EXIF in Output</Typography></TableCell>
                              <TableCell>
                                <Chip label="Stripped (canvas pipeline)" size="small" color="warning" variant="outlined" sx={{ height: 16, fontSize: '0.65rem' }} />
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Card>
                )}

                {/* LIVE COLOR HISTOGRAM */}
                {file && (
                  <Card sx={{ p: 2.5 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, letterSpacing: '0.5px' }}>
                      LIVE COLOR HISTOGRAM (RGB)
                    </Typography>
                    <Box sx={{ width: '100%', height: 100, bgcolor: mode === 'dark' ? '#090d16' : '#f8fafc', borderRadius: 1.5, border: '1px solid', borderColor: 'divider', overflow: 'hidden', position: 'relative', mb: 2 }}>
                      <canvas
                        id="histogram-canvas"
                        width="250"
                        height="100"
                        style={{ width: '100%', height: '100%', display: 'block' }}
                      />
                    </Box>
                    {dominantColors.length > 0 && (
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                          DOMINANT COLOR PALETTE
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          {dominantColors.map((hex, idx) => (
                            <Tooltip title={hex} key={idx}>
                              <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: hex, border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', cursor: 'pointer' }} />
                            </Tooltip>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Card>
                )}

                {/* Compression Engine Configurations */}
                <Card sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, letterSpacing: '0.5px' }}>
                    COMPRESSION SETTINGS
                  </Typography>
                  
                  <Stack spacing={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Optimized Preset</InputLabel>
                      <Select value={activePreset} label="Optimized Preset" onChange={(e) => applyPreset(e.target.value)}>
                        {presets.map((p) => (
                          <MenuItem key={p.value} value={p.value}>
                            {p.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                      <InputLabel>Output Format</InputLabel>
                      <Select value={format} label="Output Format" onChange={(e) => setFormat(e.target.value)}>
                        {EXPORT_FORMATS.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* MozJPEG Options */}
                    {format === 'image/jpeg' && (
                      <Stack spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', color: 'primary.main' }}>
                          MozJPEG Compression Engine Options
                        </Typography>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Quality</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{Math.round(quality * 100)}%</Typography>
                          </Box>
                          <Slider value={quality * 100} min={5} max={100} onChange={(_, val) => setQuality(Number(val) / 100)} size="small" />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Smoothing</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{mozSmoothing}</Typography>
                          </Box>
                          <Slider value={mozSmoothing} min={0} max={100} onChange={(_, val) => setMozSmoothing(val as number)} size="small" />
                        </Box>
                        <FormControl fullWidth size="small">
                          <InputLabel>Chroma Subsampling</InputLabel>
                          <Select value={mozSubsampling} label="Chroma Subsampling" onChange={(e) => setMozSubsampling(Number(e.target.value))}>
                            <MenuItem value={2}>4:2:0 (Default)</MenuItem>
                            <MenuItem value={1}>4:2:2 (Medium)</MenuItem>
                            <MenuItem value={0}>4:4:4 (High Quality)</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl fullWidth size="small">
                          <InputLabel>Color Space</InputLabel>
                          <Select value={mozColorSpace} label="Color Space" onChange={(e) => setMozColorSpace(Number(e.target.value))}>
                            <MenuItem value={1}>YCbCr</MenuItem>
                            <MenuItem value={2}>RGB</MenuItem>
                            <MenuItem value={3}>Grayscale</MenuItem>
                          </Select>
                        </FormControl>
                        <Stack direction="row" spacing={1} justifyContent="space-between">
                          <FormControlLabel control={<Switch checked={mozProgressive} onChange={(e) => setMozProgressive(e.target.checked)} />} label={<Typography variant="caption">Progressive</Typography>} />
                          <FormControlLabel control={<Switch checked={mozOptimize} onChange={(e) => setMozOptimize(e.target.checked)} />} label={<Typography variant="caption">Optimize Coding</Typography>} />
                          <FormControlLabel control={<Switch checked={mozTrellis} onChange={(e) => setMozTrellis(e.target.checked)} />} label={<Typography variant="caption">Trellis Quant.</Typography>} />
                        </Stack>
                      </Stack>
                    )}

                    {/* WebP Options */}
                    {format === 'image/webp' && (
                      <Stack spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', color: 'primary.main' }}>
                          WebP Codec Options
                        </Typography>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Quality</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{Math.round(quality * 100)}%</Typography>
                          </Box>
                          <Slider value={quality * 100} min={5} max={100} onChange={(_, val) => setQuality(Number(val) / 100)} size="small" />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Compression Effort (Method)</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{webpMethod}</Typography>
                          </Box>
                          <Slider value={webpMethod} min={0} max={6} step={1} onChange={(_, val) => setWebpMethod(val as number)} size="small" />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Alpha Quality</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{webpAlphaQuality}%</Typography>
                          </Box>
                          <Slider value={webpAlphaQuality} min={0} max={100} onChange={(_, val) => setWebpAlphaQuality(val as number)} size="small" />
                        </Box>
                        <Stack direction="row" spacing={1} justifyContent="space-between">
                          <FormControlLabel control={<Switch checked={webpLossless} onChange={(e) => setWebpLossless(e.target.checked)} />} label={<Typography variant="caption">Lossless</Typography>} />
                          <FormControlLabel control={<Switch checked={webpSharpYuv} onChange={(e) => setWebpSharpYuv(e.target.checked)} />} label={<Typography variant="caption">Sharp YUV</Typography>} />
                        </Stack>
                      </Stack>
                    )}

                    {/* OxiPNG Options */}
                    {format === 'image/png' && (
                      <Stack spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', color: 'primary.main' }}>
                          OxiPNG Engine Options
                        </Typography>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Optimization Level</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>Level {pngLevel}</Typography>
                          </Box>
                          <Slider value={pngLevel} min={0} max={6} step={1} onChange={(_, val) => setPngLevel(val as number)} size="small" />
                        </Box>
                        <FormControlLabel control={<Switch checked={pngInterlace} onChange={(e) => setPngInterlace(e.target.checked)} />} label={<Typography variant="caption">Interlaced Mode</Typography>} />
                      </Stack>
                    )}

                    {/* AVIF Options */}
                    {format === 'image/avif' && (
                      <Stack spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', color: 'primary.main' }}>
                          AVIF Codec Options
                        </Typography>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Quality</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{Math.round(quality * 100)}%</Typography>
                          </Box>
                          <Slider value={quality * 100} min={5} max={100} onChange={(_, val) => setQuality(Number(val) / 100)} size="small" />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Compression Effort (Speed)</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{avifEffort}</Typography>
                          </Box>
                          <Slider value={avifEffort} min={0} max={10} step={1} onChange={(_, val) => setAvifEffort(val as number)} size="small" />
                        </Box>
                        <FormControl fullWidth size="small">
                          <InputLabel>Chroma Subsampling</InputLabel>
                          <Select value={avifSubsampling} label="Chroma Subsampling" onChange={(e) => setAvifSubsampling(Number(e.target.value))}>
                            <MenuItem value={2}>4:2:0</MenuItem>
                            <MenuItem value={1}>4:2:2</MenuItem>
                            <MenuItem value={0}>4:4:4</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControlLabel control={<Switch checked={avifLossless} onChange={(e) => setAvifLossless(e.target.checked)} />} label={<Typography variant="caption">Lossless</Typography>} />
                      </Stack>
                    )}

                    {/* WebP2 Options */}
                    {format === 'image/wp2' && (
                      <Stack spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', color: 'primary.main' }}>
                          WebP2 (Experimental) Options
                        </Typography>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Quality</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{Math.round(quality * 100)}%</Typography>
                          </Box>
                          <Slider value={quality * 100} min={5} max={100} onChange={(_, val) => setQuality(Number(val) / 100)} size="small" />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Compression Effort</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{wp2Effort}</Typography>
                          </Box>
                          <Slider value={wp2Effort} min={0} max={9} step={1} onChange={(_, val) => setWp2Effort(val as number)} size="small" />
                        </Box>
                        <FormControlLabel control={<Switch checked={wp2Lossless} onChange={(e) => setWp2Lossless(e.target.checked)} />} label={<Typography variant="caption">Lossless</Typography>} />
                      </Stack>
                    )}
                  </Stack>
                </Card>

                {/* Image Transforms Panel */}
                <Card sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, letterSpacing: '0.5px' }}>
                    IMAGE TRANSFORMS & TUNING
                  </Typography>

                  <Stack spacing={3.5}>
                    {/* Resize */}
                    <Box>
                      <FormControlLabel
                        control={<Switch checked={enableResize} onChange={(e) => setEnableResize(e.target.checked)} />}
                        label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Enable Resize</Typography>}
                      />
                      {enableResize && originalDimensions && (
                        <Stack spacing={2} sx={{ mt: 1.5 }}>
                          <Stack direction="row" spacing={2}>
                            <TextField
                              label="Width"
                              size="small"
                              type="number"
                              value={resizeWidth}
                              onChange={(e) => {
                                const w = Math.max(1, Number(e.target.value));
                                setResizeWidth(w);
                                if (lockAspectRatio) {
                                  setResizeHeight(Math.round(w / (originalDimensions.w / originalDimensions.h)));
                                }
                              }}
                            />
                            <TextField
                              label="Height"
                              size="small"
                              type="number"
                              value={resizeHeight}
                              onChange={(e) => {
                                const h = Math.max(1, Number(e.target.value));
                                setResizeHeight(h);
                                if (lockAspectRatio) {
                                  setResizeWidth(Math.round(h * (originalDimensions.w / originalDimensions.h)));
                                }
                              }}
                            />
                          </Stack>
                          <ButtonGroup fullWidth size="small" sx={{ mt: 0.5 }}>
                            <Button onClick={() => applyScalePreset(0.25)}>0.25x</Button>
                            <Button onClick={() => applyScalePreset(0.5)}>0.5x</Button>
                            <Button onClick={() => applyScalePreset(0.75)}>0.75x</Button>
                            <Button onClick={() => applyScalePreset(1)}>1.0x</Button>
                          </ButtonGroup>
                          <FormControlLabel
                            control={<Switch checked={lockAspectRatio} onChange={(e) => setLockAspectRatio(e.target.checked)} />}
                            label={<Typography variant="caption">Lock Aspect Ratio</Typography>}
                          />
                        </Stack>
                      )}
                    </Box>

                    <Divider />

                    {/* Aspect Ratio Guide & Crop Margin Sliders */}
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600 }}>
                        Aspect Preset & Crop
                      </Typography>
                      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel>Aspect Ratio Guide</InputLabel>
                        <Select
                          value={aspectRatioPreset}
                          label="Aspect Ratio Guide"
                          onChange={(e) => {
                            const val = e.target.value;
                            setAspectRatioPreset(val);
                            if (val !== 'free' && originalDimensions) {
                              const [aw, ah] = val.split(':').map(Number);
                              const targetRatio = aw / ah;
                              const currentRatio = originalDimensions.w / originalDimensions.h;
                              if (currentRatio > targetRatio) {
                                const targetW = originalDimensions.h * targetRatio;
                                const cropDiffPercent = ((originalDimensions.w - targetW) / originalDimensions.w) * 100;
                                setCropLeft(Math.round(cropDiffPercent / 2));
                                setCropRight(Math.round(cropDiffPercent / 2));
                                setCropTop(0);
                                setCropBottom(0);
                              } else {
                                const targetH = originalDimensions.w / targetRatio;
                                const cropDiffPercent = ((originalDimensions.h - targetH) / originalDimensions.h) * 100;
                                setCropTop(Math.round(cropDiffPercent / 2));
                                setCropBottom(Math.round(cropDiffPercent / 2));
                                setCropLeft(0);
                                setCropRight(0);
                              }
                            } else {
                              setCropLeft(0);
                              setCropRight(0);
                              setCropTop(0);
                              setCropBottom(0);
                            }
                          }}
                        >
                          <MenuItem value="free">Freeform (No Crop)</MenuItem>
                          <MenuItem value="1:1">Square (1:1)</MenuItem>
                          <MenuItem value="4:3">Standard (4:3)</MenuItem>
                          <MenuItem value="16:9">Widescreen (16:9)</MenuItem>
                          <MenuItem value="21:9">Ultra-Wide (21:9)</MenuItem>
                          <MenuItem value="3:2">Classic Photo (3:2)</MenuItem>
                          <MenuItem value="5:4">Portrait (5:4)</MenuItem>
                        </Select>
                      </FormControl>

                      <Stack spacing={1}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption">Crop Left</Typography>
                            <Typography variant="caption">{cropLeft}%</Typography>
                          </Box>
                          <Slider value={cropLeft} min={0} max={49} onChange={(_, val) => setCropLeft(val as number)} size="small" />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption">Crop Right</Typography>
                            <Typography variant="caption">{cropRight}%</Typography>
                          </Box>
                          <Slider value={cropRight} min={0} max={49} onChange={(_, val) => setCropRight(val as number)} size="small" />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption">Crop Top</Typography>
                            <Typography variant="caption">{cropTop}%</Typography>
                          </Box>
                          <Slider value={cropTop} min={0} max={49} onChange={(_, val) => setCropTop(val as number)} size="small" />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption">Crop Bottom</Typography>
                            <Typography variant="caption">{cropBottom}%</Typography>
                          </Box>
                          <Slider value={cropBottom} min={0} max={49} onChange={(_, val) => setCropBottom(val as number)} size="small" />
                        </Box>
                      </Stack>
                    </Box>

                    <Divider />

                    {/* Rotation & Flip */}
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600 }}>
                        Rotation & Flip
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<RotateRightIcon />}
                          onClick={() => setRotation((prev) => (prev + 90) % 360)}
                          fullWidth
                        >
                          Rotate 90 deg
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<FlipIcon />}
                          onClick={() => setFlipH((prev) => !prev)}
                          sx={{ borderColor: flipH ? 'primary.main' : 'divider' }}
                          fullWidth
                        >
                          Flip H
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<FlipIcon />}
                          onClick={() => setFlipV((prev) => !prev)}
                          sx={{ borderColor: flipV ? 'primary.main' : 'divider' }}
                          fullWidth
                        >
                          Flip V
                        </Button>
                      </Stack>
                    </Box>

                    <Divider />

                    {/* Advanced Creative Effects */}
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600 }}>
                        Filters & Backdrop
                      </Typography>

                      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel>Canvas Backdrop</InputLabel>
                        <Select value={backdropType} label="Canvas Backdrop" onChange={(e) => setBackdropType(e.target.value)}>
                          <MenuItem value="checker">Checkerboard Grid</MenuItem>
                          <MenuItem value="white">Solid White</MenuItem>
                          <MenuItem value="black">Solid Black</MenuItem>
                          <MenuItem value="theme">Theme Adaptive</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel>Convolution Filter</InputLabel>
                        <Select value={convolutionFilter} label="Convolution Filter" onChange={(e) => setConvolutionFilter(e.target.value)}>
                          <MenuItem value="none">None (Standard)</MenuItem>
                          <MenuItem value="blur">Box Blur (3x3)</MenuItem>
                          <MenuItem value="sharpen">Sharpen High-Pass</MenuItem>
                          <MenuItem value="edge">Edge Detection</MenuItem>
                          <MenuItem value="emboss">3D Emboss Filter</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel>Cinematic Preset</InputLabel>
                        <Select value={cinematicFilter} label="Cinematic Preset" onChange={(e) => setCinematicFilter(e.target.value)}>
                          <MenuItem value="none">None (Original Tone)</MenuItem>
                          <MenuItem value="warm">Warm Sunshine Accent</MenuItem>
                          <MenuItem value="cool">Cool Blue Velvet</MenuItem>
                          <MenuItem value="cyberpunk">Cyberpunk Neon (Pink/Cyan)</MenuItem>
                          <MenuItem value="vintage">Vintage Sepia Grain</MenuItem>
                          <MenuItem value="retro">70s Faded Retro</MenuItem>
                          <MenuItem value="dramatic">Dramatic Film Contrast</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small">
                        <InputLabel>Dithering Algorithm</InputLabel>
                        <Select value={ditheringType} label="Dithering Algorithm" onChange={(e) => setDitheringType(e.target.value)}>
                          <MenuItem value="none">None (Continuous Tones)</MenuItem>
                          <MenuItem value="floyd">Floyd-Steinberg Error Diffusion</MenuItem>
                          <MenuItem value="ordered">Ordered 4x4 Bayer Dithering</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Divider />

                    {/* Color Adjustments */}
                    <Box>
                      <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                        Color Tuning & FX
                      </Typography>

                      <Stack spacing={2.5}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Brightness</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{brightness}%</Typography>
                          </Box>
                          <Slider value={brightness} min={50} max={150} onChange={(_, val) => setBrightness(val as number)} size="small" />
                        </Box>

                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Contrast</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{contrast}%</Typography>
                          </Box>
                          <Slider value={contrast} min={50} max={150} onChange={(_, val) => setContrast(val as number)} size="small" />
                        </Box>

                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Saturation</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{saturation}%</Typography>
                          </Box>
                          <Slider value={saturation} min={0} max={200} onChange={(_, val) => setSaturation(val as number)} size="small" />
                        </Box>

                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Sepia Tone</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{sepia}%</Typography>
                          </Box>
                          <Slider value={sepia} min={0} max={100} onChange={(_, val) => setSepia(val as number)} size="small" />
                        </Box>

                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Gamma Fine-Tune</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{(gamma / 100).toFixed(2)}</Typography>
                          </Box>
                          <Slider value={gamma} min={50} max={150} onChange={(_, val) => setGamma(val as number)} size="small" />
                        </Box>

                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Vignette Strength</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{vignette}%</Typography>
                          </Box>
                          <Slider value={vignette} min={0} max={100} onChange={(_, val) => setVignette(val as number)} size="small" />
                        </Box>

                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Film Grain Noise</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{noise}%</Typography>
                          </Box>
                          <Slider value={noise} min={0} max={100} onChange={(_, val) => setNoise(val as number)} size="small" />
                        </Box>

                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Color Banding (Quantize)</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{colorBanding === 256 ? 'None' : `${colorBanding} colors`}</Typography>
                          </Box>
                          <Slider value={colorBanding} min={2} max={256} step={2} onChange={(_, val) => setColorBanding(val as number)} size="small" />
                        </Box>

                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>Canvas Border Styling</Typography>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="caption">Border Width</Typography>
                              <Slider value={borderWidth} min={0} max={50} onChange={(_, val) => setBorderWidth(val as number)} size="small" />
                            </Box>
                            <TextField
                              label="Color"
                              size="small"
                              value={borderColor}
                              onChange={(e) => setBorderColor(e.target.value)}
                              sx={{ width: 100 }}
                            />
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>
                  </Stack>
                </Card>

                {/* ADVANCED COMPRESSOR CORE CONTROLS */}
                {file && (
                  <Card sx={{ p: 2.5 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, letterSpacing: '0.5px' }}>
                      IMAGE COMPRESSOR CORE ADVANCED
                    </Typography>
                    <Stack spacing={2.5}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption">Core Pixelation Filter</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>{pixelate === 1 ? 'Disabled' : `${pixelate}px blocks`}</Typography>
                        </Box>
                        <Slider value={pixelate} min={1} max={64} onChange={(_, val) => setPixelate(val as number)} size="small" />
                      </Box>

                      <FormControl fullWidth size="small">
                        <InputLabel>Channel Isolator / Mixer</InputLabel>
                        <Select value={channelIsolate} label="Channel Isolator / Mixer" onChange={(e) => setChannelIsolate(e.target.value)}>
                          <MenuItem value="none">None (Full RGB Colors)</MenuItem>
                          <MenuItem value="red">Isolate Red Channel</MenuItem>
                          <MenuItem value="green">Isolate Green Channel</MenuItem>
                          <MenuItem value="blue">Isolate Blue Channel</MenuItem>
                          <MenuItem value="alpha">Isolate Alpha (Opacity) Channel</MenuItem>
                        </Select>
                      </FormControl>

                      <Divider />

                      <FormControlLabel
                        control={<Switch checked={pixelDiffView} onChange={(e) => setPixelDiffView(e.target.checked)} />}
                        label="Pixel Difference Visualizer"
                      />

                      {pixelDiffView && (
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Visualizer Gain / Multiplier</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{pixelDiffMultiplier}x</Typography>
                          </Box>
                          <Slider value={pixelDiffMultiplier} min={1} max={50} onChange={(_, val) => setPixelDiffMultiplier(val as number)} size="small" />
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Highlights differences between input and compressed output pixels.
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Card>
                )}

                {/* METADATA (EXIF) EDITOR CARD */}
                {file && (
                  <Card sx={{ p: 2.5 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, letterSpacing: '0.5px' }}>
                      EXIF METADATA EDITOR
                    </Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="Author / Creator"
                        size="small"
                        value={metaAuthor}
                        onChange={(e) => setMetaAuthor(e.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Description"
                        size="small"
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                      />
                      <TextField
                        label="Copyright Notice"
                        size="small"
                        value={metaCopyright}
                        onChange={(e) => setMetaCopyright(e.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Software Signature"
                        size="small"
                        value={metaSoftware}
                        onChange={(e) => setMetaSoftware(e.target.value)}
                        fullWidth
                      />
                    </Stack>
                  </Card>
                )}

                {/* WATERMARK SETTINGS CARD */}
                {file && (
                  <Card sx={{ p: 2.5 }}>
                    <FormControlLabel
                      control={<Switch checked={enableWatermark} onChange={(e) => setEnableWatermark(e.target.checked)} />}
                      label={<Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.5px' }}>ENABLE WATERMARK</Typography>}
                    />
                    {enableWatermark && (
                      <Stack spacing={2} sx={{ mt: 1.5 }}>
                        <TextField
                          label="Watermark Text"
                          size="small"
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          fullWidth
                        />
                        <TextField
                          label="Color (Hex)"
                          size="small"
                          value={watermarkColor}
                          onChange={(e) => setWatermarkColor(e.target.value)}
                          fullWidth
                        />
                        <FormControl fullWidth size="small">
                          <InputLabel>Alignment Preset</InputLabel>
                          <Select value={watermarkAlign} label="Alignment Preset" onChange={(e) => setWatermarkAlign(e.target.value)}>
                            <MenuItem value="custom">Custom (X/Y Offsets)</MenuItem>
                            <MenuItem value="tl">Top Left</MenuItem>
                            <MenuItem value="tr">Top Right</MenuItem>
                            <MenuItem value="bl">Bottom Left</MenuItem>
                            <MenuItem value="br">Bottom Right</MenuItem>
                            <MenuItem value="center">Center Center</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl fullWidth size="small">
                          <InputLabel>Font Style</InputLabel>
                          <Select value={watermarkFont} label="Font Style" onChange={(e) => setWatermarkFont(e.target.value)}>
                            <MenuItem value="sans-serif">Sans-serif</MenuItem>
                            <MenuItem value="serif">Serif</MenuItem>
                            <MenuItem value="monospace">Monospace</MenuItem>
                            <MenuItem value="Outfit, sans-serif">Outfit (Design Default)</MenuItem>
                            <MenuItem value="cursive">Cursive Script</MenuItem>
                          </Select>
                        </FormControl>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Font Size</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{watermarkSize}px</Typography>
                          </Box>
                          <Slider value={watermarkSize} min={10} max={100} onChange={(_, val) => setWatermarkSize(val as number)} size="small" />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Opacity</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{watermarkOpacity}%</Typography>
                          </Box>
                          <Slider value={watermarkOpacity} min={10} max={100} onChange={(_, val) => setWatermarkOpacity(val as number)} size="small" />
                        </Box>
                        {watermarkAlign === 'custom' && (
                          <>
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption">Horizontal Position (X)</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>{watermarkX}%</Typography>
                              </Box>
                              <Slider value={watermarkX} min={0} max={100} onChange={(_, val) => setWatermarkX(val as number)} size="small" />
                            </Box>
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption">Vertical Position (Y)</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>{watermarkY}%</Typography>
                              </Box>
                              <Slider value={watermarkY} min={0} max={100} onChange={(_, val) => setWatermarkY(val as number)} size="small" />
                            </Box>
                          </>
                        )}
                      </Stack>
                    )}
                  </Card>
                )}

                {/* Action Buttons */}
                <Stack direction="row" spacing={2}>
                  <Button variant="outlined" color="error" fullWidth onClick={() => setFile(null)} disabled={!file}>
                    Clear
                  </Button>
                  <Button
                    component="a"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={!outputBlob || compressing}
                    href={compressedUrl || '#'}
                    download={file ? `${file.name.replace(/\.[^.]+$/, '')}-compressed.${EXPORT_FORMATS.find(f => f.value === format)?.ext || 'jpg'}` : undefined}
                  >
                    {compressing ? <CircularProgress size={20} color="inherit" /> : 'Download'}
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>

          {/* SESSION HISTORY LOG PANEL */}
          {sessionHistory.length > 0 && (
            <Card sx={{ p: 3, mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Browser Session Compression History
                </Typography>
                <Button variant="outlined" size="small" onClick={exportHistoryToCSV}>
                  Export History (CSV)
                </Button>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Filename</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Original Size</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Optimized Size</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Total Savings</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Output Format</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessionHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{bytesToLabel(item.originalSize)}</TableCell>
                        <TableCell>{bytesToLabel(item.compressedSize)}</TableCell>
                        <TableCell sx={{ color: 'success.main', fontWeight: 600 }}>{item.savings}</TableCell>
                        <TableCell><Chip label={item.format} size="small" color="primary" variant="outlined" sx={{ height: 20 }} /></TableCell>
                        <TableCell>{item.timestamp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}
        </Stack>
      ) : activeTab === 1 ? (
        // ================= BATCH MODE =================
        <Stack spacing={3}>
          <Paper
            onDrop={handleDropBatch}
            onDragOver={(event) => event.preventDefault()}
            sx={{
              p: 4,
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: mode === 'dark' ? '#0f172a' : '#f1f5f9',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' },
            }}
          >
            <Typography variant="h6" gutterBottom>
              Drag & Drop Multiple Images
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Supports batch importing and compressing JPEGs, PNGs, WebPs, PSDs, and RAW formats.
            </Typography>
            <Button variant="contained" component="label">
              Add Images
              <input hidden multiple accept={ACCEPT_STRING} type="file" onChange={(e) => {
                const files = Array.from(e.target.files || []);
                const newItems: BatchItem[] = files.map((f) => {
                  const ext = f.name.split('.').pop()?.toLowerCase() || '';
                  return {
                    id: Math.random().toString(36).substring(2, 9),
                    file: f,
                    originalSize: f.size,
                    compressedSize: null,
                    outputBlob: null,
                    previewUrl: URL.createObjectURL(f),
                    compressedUrl: null,
                    status: 'pending',
                    isExotic: !['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg', 'bmp', 'ico'].includes(ext),
                    formatType: ext.toUpperCase(),
                  };
                });
                setBatchItems((prev) => [...prev, ...newItems]);
              }} />
            </Button>
          </Paper>

          {/* Batch global configs */}
          {batchItems.length > 0 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
                BATCH COMPRESSION CONFIGS
              </Typography>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Output Format</InputLabel>
                    <Select value={batchFormat} label="Output Format" onChange={(e) => setBatchFormat(e.target.value)}>
                      {EXPORT_FORMATS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {batchFormat !== 'image/png' ? (
                  <Grid item xs={12} sm={4}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="caption" sx={{ minWidth: 80 }}>Quality ({Math.round(batchQuality * 100)}%)</Typography>
                      <Slider
                        value={batchQuality * 100}
                        min={5}
                        max={100}
                        step={1}
                        onChange={(_, val) => setBatchQuality(Number(val) / 100)}
                        sx={{ flexGrow: 1 }}
                      />
                    </Stack>
                  </Grid>
                ) : (
                  <Grid item xs={12} sm={4} />
                )}
                <Grid item xs={12} sm={5} sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    disabled={!batchItems.some(i => i.status === 'done')}
                    onClick={downloadBatchAsZip}
                  >
                    Download All (ZIP)
                  </Button>
                  <Button variant="outlined" color="error" size="small" onClick={() => {
                    batchItems.forEach(item => {
                      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
                      if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
                    });
                    setBatchItems([]);
                  }}>
                    Clear All
                  </Button>
                </Grid>
              </Grid>
            </Card>
          )}

          {/* Batch list */}
          {batchItems.map((item) => {
            const savingsRatio = item.compressedSize ? (1 - (item.compressedSize / item.originalSize)) * 100 : 0;
            return (
              <Paper key={item.id} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  component="img"
                  src={item.previewUrl!}
                  sx={{ width: 60, height: 60, borderRadius: 1.5, objectFit: 'cover', border: '1px solid', borderColor: 'divider' }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 300 }}>
                    {item.file.name}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Orig: {bytesToLabel(item.originalSize)}</Typography>
                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 10 }} />
                    <Typography variant="caption" color="primary">
                      Comp: {item.compressedSize ? bytesToLabel(item.compressedSize) : '-'}
                    </Typography>
                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 10 }} />
                    <Typography variant="caption" color="warning.main">
                      Type: {item.formatType || 'Native'}
                    </Typography>
                  </Stack>
                </Box>

                <Box sx={{ minWidth: 100, textAlign: 'center' }}>
                  {item.status === 'compressing' && <CircularProgress size={20} />}
                  {item.status === 'done' && (
                    <Chip label={`Saved ${savingsRatio.toFixed(0)}%`} color="success" size="small" variant="outlined" />
                  )}
                  {item.status === 'error' && (
                    <Chip label="Error" color="error" size="small" variant="outlined" />
                  )}
                  {item.status === 'pending' && (
                    <Chip label="Pending" color="default" size="small" variant="outlined" />
                  )}
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button
                    component="a"
                    variant="contained"
                    size="small"
                    disabled={!item.compressedUrl}
                    href={item.compressedUrl || '#'}
                    download={`${item.file.name.replace(/\.[^.]+$/, '')}-compressed.${batchFormat.split('/')[1]}`}
                  >
                    Download
                  </Button>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => {
                      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
                      if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
                      setBatchItems((prev) => prev.filter((i) => i.id !== item.id));
                    }}
                  >
                    X
                  </IconButton>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      ) : (
        // ================= 100+ FORMATS REGISTRY CATALOG TAB =================
        <Paper sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Image Format Support Matrix (100+ Formats)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Squoosh Next contains file-level extension mappings and converters for raster, vector, desktop, texture, camera RAW, scientific, and historic file formats.
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {Object.entries(FORMAT_CATEGORIES).map(([category, extList]) => (
              <Grid item xs={12} md={6} key={category}>
                <Card sx={{ p: 2.5, height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, textTransform: 'uppercase', color: 'primary.main', letterSpacing: '0.5px' }}>
                    {category} Formats ({extList.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {extList.map((ext) => (
                      <Chip 
                        key={ext} 
                        label={`.${ext.toUpperCase()}`} 
                        size="small" 
                        variant="outlined" 
                        color="secondary" 
                        sx={{ fontWeight: 600 }}
                      />
                    ))}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Footer Tags */}
      <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mt: 5 }}>
        <Chip label="Client-side processing" variant="outlined" size="small" />
        <Chip label="100+ Image Formats Supported" variant="outlined" size="small" />
        <Chip label="Squoosh Codec Engine Options" variant="outlined" size="small" />
        <Chip label="Interactive Slider Comparison" variant="outlined" size="small" />
        <Chip label="Session History Logs" variant="outlined" size="small" />
        <Chip label="Metadata EXIF Inspector" variant="outlined" size="small" />
      </Stack>
    </Box>
  );
}
