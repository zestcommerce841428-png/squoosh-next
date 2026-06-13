'use client';

import { useState, useEffect, useRef, useMemo, use, useCallback } from 'react';
import {
  Container, Typography, Box, Card, Grid, Button, Stack, TextField, Slider,
  FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch, Chip,
  Alert, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableRow,
  Tabs, Tab, CircularProgress,
} from '@mui/material';
import Link from 'next/link';
import { FEATURES_DATA, type FeatureItem } from '../../features/features-data';
import {
  ACCEPT_STRING,
  NATIVE_CODEC_FORMATS,
  CUSTOM_ENCODER_FORMATS,
  ALL_EXPORT_FORMATS,
  EXT_BY_VALUE,
  hasQualityControl,
  isLosslessFormat,
} from '../../constants/imageFormats';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function bytesToLabel(b: number) {
  if (!b) return '0 B';
  const u = ['B', 'KB', 'MB'];
  const e = Math.min(Math.floor(Math.log(b) / Math.log(1024)), 2);
  return `${(b / 1024 ** e).toFixed(1)} ${u[e]}`;
}

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : { r: 0, g: 0, b: 0 };
}

function getLuminance(r: number, g: number, b: number) {
  const a = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }) {
  const l1 = getLuminance(c1.r, c1.g, c1.b);
  const l2 = getLuminance(c2.r, c2.g, c2.b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// BMP encoder
function createBMPBlob(canvas: HTMLCanvasElement): Blob {
  const ctx = canvas.getContext('2d')!;
  const { width: W, height: H } = canvas;
  const data = ctx.getImageData(0, 0, W, H).data;
  const rowSize = Math.floor((24 * W + 31) / 32) * 4;
  const buf = new ArrayBuffer(54 + rowSize * H);
  const v = new DataView(buf);
  v.setUint16(0, 0x4d42, true); v.setUint32(2, buf.byteLength, true); v.setUint32(10, 54, true);
  v.setUint32(14, 40, true); v.setInt32(18, W, true); v.setInt32(22, -H, true);
  v.setUint16(26, 1, true); v.setUint16(28, 24, true); v.setUint32(34, rowSize * H, true);
  let off = 54;
  for (let y = 0; y < H; y++) {
    const row = y * W * 4;
    for (let x = 0; x < W; x++) { const i = row + x * 4; v.setUint8(off++, data[i+2]); v.setUint8(off++, data[i+1]); v.setUint8(off++, data[i]); }
    for (let p = 0; p < rowSize - W * 3; p++) v.setUint8(off++, 0);
  }
  return new Blob([buf], { type: 'image/bmp' });
}

// SVG wrapper
function createSVGBlob(canvas: HTMLCanvasElement): Blob {
  const url = canvas.toDataURL('image/png');
  return new Blob([`<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><image href="${url}" width="${canvas.width}" height="${canvas.height}"/></svg>`], { type: 'image/svg+xml' });
}

// ASCII art
function canvasToASCII(canvas: HTMLCanvasElement): string {
  const cols = 80; const rows = Math.round((canvas.height / canvas.width) * cols * 0.5);
  const tmp = document.createElement('canvas'); tmp.width = cols; tmp.height = rows;
  const tc = tmp.getContext('2d')!; tc.drawImage(canvas, 0, 0, cols, rows);
  const d = tc.getImageData(0, 0, cols, rows).data;
  const chars = '@#S%?*+;:,. ';
  let out = '';
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      const b = 0.2126 * d[i] + 0.7152 * d[i+1] + 0.0722 * d[i+2];
      out += chars[Math.floor((b / 255) * (chars.length - 1))];
    }
    out += '\n';
  }
  return out;
}

// ─── Archetype Classifier ────────────────────────────────────────────────────

type Archetype =
  | 'compress' | 'converter' | 'resize' | 'crop' | 'rotate'
  | 'adjuster' | 'convolution' | 'cinematic' | 'vignette'
  | 'watermark' | 'border' | 'pixelate' | 'dither' | 'channel'
  | 'histogram' | 'metadata' | 'ascii' | 'background'
  | 'icongen' | 'collage' | 'palette' | 'meme' | 'beautifier' | 'polaroid'
  | 'fallback';

function getArchetype(name: string): Archetype {
  const n = name.toLowerCase();
  if (n.includes('polaroid')) return 'polaroid';
  if (n.includes('meme') || n.includes('caption text') || n.includes('caption')) return 'meme';
  if (n.includes('beautifier') || n.includes('screenshot') || (n.includes('mockup') && !n.includes('product'))) return 'beautifier';
  if (n.includes('dominant color') || n.includes('palette') || n.includes('brand color') || n.includes('color extract') || n.includes('color swatch')) return 'palette';
  if (n.includes('compress') || n.includes('optim') || n.includes('reduce size') || n.includes('lossless') || n.includes('lossy')) return 'compress';
  if (n.includes(' to ') || n.includes('convert') || n.includes('ico icon') || n.includes('export format') || n.includes('heic') || n.includes('tiff') || n.includes('bmp') || n.includes('svg')) return 'converter';
  if (n.includes('favicon') || n.includes('icon set') || n.includes('app icon') || n.includes('multi-size')) return 'icongen';
  if (n.includes('resize') || n.includes('scale') || n.includes('dimension') || n.includes('resolution') || n.includes('upscal') || n.includes('downscal')) return 'resize';
  if (n.includes('crop') || n.includes('trim') || n.includes('aspect ratio')) return 'crop';
  if (n.includes('rotat') || n.includes('flip') || n.includes('mirror') || n.includes('orient')) return 'rotate';
  if (n.includes('grayscale') || n.includes('black and white') || n.includes('monochrome') || n.includes('desaturate')) return 'adjuster';
  if (n.includes('brightness') || n.includes('contrast') || n.includes('saturation') || n.includes('hue') || n.includes('gamma') || n.includes('exposure') || n.includes('vibrance') || n.includes('highlight') || n.includes('shadow') || n.includes('sepia') || n.includes('tint') || n.includes('temperature') || n.includes('color adjust') || n.includes('tone')) return 'adjuster';
  if (n.includes('blur') || n.includes('sharpen') || n.includes('edge detect') || n.includes('emboss') || n.includes('smooth') || n.includes('unsharp')) return 'convolution';
  if (n.includes('cinematic') || n.includes('lut') || n.includes('film look') || n.includes('color grade') || n.includes('warm') || n.includes('cool') || n.includes('vintage') || n.includes('retro') || n.includes('cyberpunk')) return 'cinematic';
  if (n.includes('vignette') || n.includes('noise') || n.includes('grain') || n.includes('glitch')) return 'vignette';
  if (n.includes('watermark') || n.includes('stamp') || n.includes('logo overlay') || n.includes('signature')) return 'watermark';
  if (n.includes('border') || n.includes('frame') || n.includes('outline') || n.includes('mat') || n.includes('padding')) return 'border';
  if (n.includes('pixelat') || n.includes('mosaic') || n.includes('pixel art')) return 'pixelate';
  if (n.includes('dither') || n.includes('quantiz') || n.includes('palette reduc') || n.includes('posterize')) return 'dither';
  if (n.includes('channel') || n.includes('rgb split') || n.includes('cmyk') || n.includes('alpha')) return 'channel';
  if (n.includes('histogram') || n.includes('analytics') || n.includes('quality analys') || n.includes('ssim') || n.includes('psnr') || n.includes('pixel stat')) return 'histogram';
  if (n.includes('metadata') || n.includes('exif') || n.includes('iptc') || n.includes('strip') || n.includes('copyright embed') || n.includes('geotag')) return 'metadata';
  if (n.includes('ascii') || n.includes('text art') || n.includes('character art')) return 'ascii';
  if (n.includes('background') || n.includes('remove bg') || n.includes('transparent bg') || n.includes('bg remov')) return 'background';
  if (n.includes('collage') || n.includes('grid') || n.includes('tile') || n.includes('contact sheet')) return 'collage';
  return 'fallback';
}

// ─── Canvas Rendering Engine ─────────────────────────────────────────────────

interface RenderParams {
  archetype: Archetype;
  // adjuster
  brightness: number; contrast: number; saturation: number; sepia: number; grayscale: number; gamma: number;
  // convolution
  convKernel: string;
  // cinematic
  cinematicPreset: string;
  // vignette
  vigStrength: number; noiseAmt: number;
  // resize
  resW: number; resH: number;
  // crop
  cropL: number; cropR: number; cropT: number; cropB: number;
  // rotate
  rotation: number; flipH: boolean; flipV: boolean;
  // watermark
  wmText: string; wmColor: string; wmSize: number; wmOpacity: number; wmAlign: string;
  // border
  brdWidth: number; brdColor: string; brdRadius: number;
  // pixelate
  pixSize: number;
  // dither
  ditherType: string;
  // channel
  channelMode: string;
  // converter
  convertFmt: string; convertQuality: number;
  // compress
  compQuality: number; compFmt: string;
  // meme
  memeTop: string; memeBottom: string; memeFontSize: number; memeTextColor: string; memeStroke: string;
  // beautifier
  bPadding: number; bRadius: number; bShadow: number; bGradient: string;
  // polaroid
  pText: string; pSepia: number; pNoise: number; pVignette: number;
  // background
  bgColor: string; bgThreshold: number; bgFeather: number; bgTransparent: boolean;
  // icongen sizes: string
  iconSizes: string[];
  // collage
  collageRows: number; collageCols: number; collageGap: number; collageBg: string;
}

async function renderToCanvas(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  params: RenderParams
): Promise<void> {
  const { archetype } = params;
  const ctx = canvas.getContext('2d')!;

  if (archetype === 'resize') {
    canvas.width = Math.max(1, params.resW);
    canvas.height = Math.max(1, params.resH);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return;
  }

  if (archetype === 'crop') {
    const srcX = (params.cropL / 100) * img.naturalWidth;
    const srcY = (params.cropT / 100) * img.naturalHeight;
    const srcW = Math.max(1, (1 - (params.cropL + params.cropR) / 100) * img.naturalWidth);
    const srcH = Math.max(1, (1 - (params.cropT + params.cropB) / 100) * img.naturalHeight);
    canvas.width = srcW; canvas.height = srcH;
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
    return;
  }

  if (archetype === 'rotate') {
    const is90 = params.rotation === 90 || params.rotation === 270;
    canvas.width = is90 ? img.naturalHeight : img.naturalWidth;
    canvas.height = is90 ? img.naturalWidth : img.naturalHeight;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((params.rotation * Math.PI) / 180);
    ctx.scale(params.flipH ? -1 : 1, params.flipV ? -1 : 1);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    return;
  }

  // Default: draw image at natural size first
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.save();
  ctx.filter = `brightness(${params.brightness}%) contrast(${params.contrast}%) saturate(${params.saturation}%) sepia(${params.sepia}%) grayscale(${params.grayscale}%)`;
  ctx.drawImage(img, 0, 0);
  ctx.restore();

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;
  const W = canvas.width; const H = canvas.height;

  if (archetype === 'adjuster') {
    if (params.gamma !== 100) {
      const g = params.gamma / 100;
      for (let i = 0; i < d.length; i += 4) {
        d[i] = 255 * Math.pow(d[i] / 255, 1 / g);
        d[i+1] = 255 * Math.pow(d[i+1] / 255, 1 / g);
        d[i+2] = 255 * Math.pow(d[i+2] / 255, 1 / g);
      }
    }
    ctx.putImageData(imgData, 0, 0);
    return;
  }

  if (archetype === 'convolution') {
    const kernels: Record<string, number[]> = {
      blur: [1/9,1/9,1/9,1/9,1/9,1/9,1/9,1/9,1/9],
      sharpen: [0,-1,0,-1,5,-1,0,-1,0],
      edge: [-1,-1,-1,-1,8,-1,-1,-1,-1],
      emboss: [-2,-1,0,-1,1,1,0,1,2],
      unsharp: [-1,-1,-1,-1,9,-1,-1,-1,-1],
    };
    const weights = kernels[params.convKernel] || kernels.blur;
    const src = ctx.getImageData(0, 0, W, H);
    const srcD = src.data;
    const out = ctx.createImageData(W, H);
    const dst = out.data;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const di = (y * W + x) * 4;
        let r = 0, g = 0, b = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const sy = Math.min(H-1, Math.max(0, y+ky));
            const sx = Math.min(W-1, Math.max(0, x+kx));
            const si = (sy*W+sx)*4;
            const w = weights[(ky+1)*3+(kx+1)];
            r += srcD[si]*w; g += srcD[si+1]*w; b += srcD[si+2]*w;
          }
        }
        dst[di] = Math.min(255,Math.max(0,r));
        dst[di+1] = Math.min(255,Math.max(0,g));
        dst[di+2] = Math.min(255,Math.max(0,b));
        dst[di+3] = srcD[di+3];
      }
    }
    ctx.putImageData(out, 0, 0);
    return;
  }

  if (archetype === 'cinematic') {
    for (let i = 0; i < d.length; i += 4) {
      let r = d[i], g = d[i+1], b = d[i+2];
      const p = params.cinematicPreset;
      if (p === 'warm') { r = Math.min(255, r*1.15); g = Math.min(255, g*1.05); b = b*0.82; }
      else if (p === 'cool') { r = r*0.82; g = Math.min(255, g*1.05); b = Math.min(255, b*1.18); }
      else if (p === 'cyberpunk') { r = Math.min(255, r*1.3); g = g*0.7; b = Math.min(255, b*1.4); }
      else if (p === 'vintage') { r = Math.min(255, r*0.88+32); g = Math.min(255, g*0.88+18); b = Math.min(255, b*0.82); }
      else if (p === 'retro') { r = Math.min(255, r*0.95); g = Math.min(255, g*0.82+22); b = Math.min(255, b*0.68+18); }
      else if (p === 'dramatic') { r = r>128?Math.min(255,r*1.3):r*0.7; g = g>128?Math.min(255,g*1.3):g*0.7; b = b>128?Math.min(255,b*1.3):b*0.7; }
      else if (p === 'matte') { r = Math.min(240,r)+15; g = Math.min(240,g)+12; b = Math.min(240,b)+10; }
      else if (p === 'noir') { const lum = 0.299*r+0.587*g+0.114*b; r=g=b= lum>128?Math.min(255,lum*1.2):lum*0.8; }
      d[i] = r; d[i+1] = g; d[i+2] = b;
    }
    ctx.putImageData(imgData, 0, 0);
    return;
  }

  if (archetype === 'vignette') {
    // Vignette
    const cx = W/2, cy = H/2;
    const maxD = Math.sqrt(cx*cx+cy*cy)||1;
    const vs = params.vigStrength/100;
    if (vs > 0) {
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const idx = (y*W+x)*4;
          const dist = Math.sqrt((x-cx)**2+(y-cy)**2);
          const f = 1 - (dist/maxD)*vs;
          d[idx] *= f; d[idx+1] *= f; d[idx+2] *= f;
        }
      }
    }
    // Noise
    const na = params.noiseAmt;
    if (na > 0) {
      for (let i = 0; i < d.length; i += 4) {
        const n = (Math.random()-0.5)*na*2.55;
        d[i] = Math.min(255,Math.max(0,d[i]+n));
        d[i+1] = Math.min(255,Math.max(0,d[i+1]+n));
        d[i+2] = Math.min(255,Math.max(0,d[i+2]+n));
      }
    }
    ctx.putImageData(imgData, 0, 0);
    return;
  }

  if (archetype === 'watermark') {
    ctx.putImageData(imgData, 0, 0);
    if (params.wmText) {
      ctx.save();
      ctx.globalAlpha = params.wmOpacity/100;
      ctx.fillStyle = params.wmColor;
      ctx.font = `bold ${params.wmSize}px sans-serif`;
      ctx.textBaseline = 'top';
      const tw = ctx.measureText(params.wmText).width;
      const a = params.wmAlign;
      let px = 15, py = 15;
      if (a === 'tr') { px = W-tw-15; py = 15; }
      else if (a === 'bl') { px = 15; py = H-params.wmSize-15; }
      else if (a === 'br') { px = W-tw-15; py = H-params.wmSize-15; }
      else if (a === 'center') { px = (W-tw)/2; py = (H-params.wmSize)/2; }
      ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
      ctx.strokeText(params.wmText, px, py);
      ctx.fillText(params.wmText, px, py);
      ctx.restore();
    }
    return;
  }

  if (archetype === 'border') {
    const bw = params.brdWidth;
    canvas.width = W + bw*2; canvas.height = H + bw*2;
    ctx.fillStyle = params.brdColor;
    if (params.brdRadius > 0) {
      const r = params.brdRadius;
      ctx.beginPath();
      ctx.moveTo(r,0); ctx.lineTo(canvas.width-r,0);
      ctx.quadraticCurveTo(canvas.width,0,canvas.width,r);
      ctx.lineTo(canvas.width,canvas.height-r);
      ctx.quadraticCurveTo(canvas.width,canvas.height,canvas.width-r,canvas.height);
      ctx.lineTo(r,canvas.height); ctx.quadraticCurveTo(0,canvas.height,0,canvas.height-r);
      ctx.lineTo(0,r); ctx.quadraticCurveTo(0,0,r,0); ctx.closePath(); ctx.fill();
    } else {
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, bw, bw, W, H);
    return;
  }

  if (archetype === 'pixelate') {
    ctx.putImageData(imgData, 0, 0);
    const ps = Math.max(1, params.pixSize);
    if (ps > 1) {
      const pd = ctx.getImageData(0, 0, W, H);
      const pdd = pd.data;
      for (let y = 0; y < H; y += ps) {
        for (let x = 0; x < W; x += ps) {
          const ri = (y*W+x)*4;
          const [pr,pg,pb,pa] = [pdd[ri],pdd[ri+1],pdd[ri+2],pdd[ri+3]];
          for (let dy = 0; dy < ps && y+dy < H; dy++) {
            for (let dx = 0; dx < ps && x+dx < W; dx++) {
              const pi = ((y+dy)*W+(x+dx))*4;
              pdd[pi]=pr; pdd[pi+1]=pg; pdd[pi+2]=pb; pdd[pi+3]=pa;
            }
          }
        }
      }
      ctx.putImageData(pd, 0, 0);
    }
    return;
  }

  if (archetype === 'dither') {
    ctx.putImageData(imgData, 0, 0);
    const dd = ctx.getImageData(0, 0, W, H);
    const ddd = dd.data;
    if (params.ditherType === 'floyd') {
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const idx = (y*W+x)*4;
          const [or,og,ob] = [ddd[idx],ddd[idx+1],ddd[idx+2]];
          const [nr,ng,nb] = [or<128?0:255, og<128?0:255, ob<128?0:255];
          ddd[idx]=nr; ddd[idx+1]=ng; ddd[idx+2]=nb;
          const spread = (nx: number, ny: number, f: number) => {
            if (nx>=0&&nx<W&&ny>=0&&ny<H) {
              const ni=(ny*W+nx)*4;
              ddd[ni]=Math.min(255,Math.max(0,ddd[ni]+(or-nr)*f));
              ddd[ni+1]=Math.min(255,Math.max(0,ddd[ni+1]+(og-ng)*f));
              ddd[ni+2]=Math.min(255,Math.max(0,ddd[ni+2]+(ob-nb)*f));
            }
          };
          spread(x+1,y,7/16); spread(x-1,y+1,3/16); spread(x,y+1,5/16); spread(x+1,y+1,1/16);
        }
      }
    } else if (params.ditherType === 'ordered') {
      const m = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const idx=(y*W+x)*4;
          const t=(m[y%4][x%4]+0.5)/16*255;
          ddd[idx]=ddd[idx]<t?0:255; ddd[idx+1]=ddd[idx+1]<t?0:255; ddd[idx+2]=ddd[idx+2]<t?0:255;
        }
      }
    } else if (params.ditherType === 'atkinson') {
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const idx=(y*W+x)*4;
          const [or,og,ob]=[ddd[idx],ddd[idx+1],ddd[idx+2]];
          const [nr,ng,nb]=[or<128?0:255,og<128?0:255,ob<128?0:255];
          ddd[idx]=nr; ddd[idx+1]=ng; ddd[idx+2]=nb;
          const sp = (nx: number, ny: number) => {
            if (nx>=0&&nx<W&&ny>=0&&ny<H) {
              const ni=(ny*W+nx)*4;
              ddd[ni]=Math.min(255,Math.max(0,ddd[ni]+(or-nr)/8));
              ddd[ni+1]=Math.min(255,Math.max(0,ddd[ni+1]+(og-ng)/8));
              ddd[ni+2]=Math.min(255,Math.max(0,ddd[ni+2]+(ob-nb)/8));
            }
          };
          sp(x+1,y); sp(x+2,y); sp(x-1,y+1); sp(x,y+1); sp(x+1,y+1); sp(x,y+2);
        }
      }
    }
    ctx.putImageData(dd, 0, 0);
    return;
  }

  if (archetype === 'channel') {
    for (let i = 0; i < d.length; i += 4) {
      const [r,g,b,a]=[d[i],d[i+1],d[i+2],d[i+3]];
      if (params.channelMode === 'red') { d[i+1]=0; d[i+2]=0; }
      else if (params.channelMode === 'green') { d[i]=0; d[i+2]=0; }
      else if (params.channelMode === 'blue') { d[i]=0; d[i+1]=0; }
      else if (params.channelMode === 'alpha') { d[i]=a; d[i+1]=a; d[i+2]=a; d[i+3]=255; }
      else if (params.channelMode === 'lum') { const l=0.299*r+0.587*g+0.114*b; d[i]=d[i+1]=d[i+2]=l; }
      else if (params.channelMode === 'invert') { d[i]=255-r; d[i+1]=255-g; d[i+2]=255-b; }
    }
    ctx.putImageData(imgData, 0, 0);
    return;
  }

  if (archetype === 'background') {
    // Threshold-based background removal with edge feathering
    const bg = hexToRgb(params.bgColor);
    const threshold = params.bgThreshold ?? 230; // 0-255, luminance cutoff
    const feather = params.bgFeather ?? 10;       // px soft edge
    const replaceTransparent = params.bgTransparent ?? false;

    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum >= threshold) {
        if (replaceTransparent) {
          // Feathered alpha: smooth edge around threshold ± feather
          const alpha = feather > 0
            ? Math.max(0, Math.min(1, (lum - threshold) / feather))
            : 1;
          d[i + 3] = Math.round((1 - alpha) * d[i + 3]);
        } else {
          d[i] = bg.r; d[i + 1] = bg.g; d[i + 2] = bg.b; d[i + 3] = 255;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
    return;
  }

  if (archetype === 'palette') {
    ctx.drawImage(img, 0, 0);
    return;
  }

  if (archetype === 'meme') {
    ctx.drawImage(img, 0, 0);
    ctx.textAlign = 'center';
    ctx.miterLimit = 2;
    // Auto-size font to fill ~80% of canvas width if text is too long
    const autoFontSize = (text: string, requestedSize: number): number => {
      ctx.font = `bold ${requestedSize}px Impact, 'Arial Black', sans-serif`;
      const measured = ctx.measureText(text).width;
      if (measured > W * 0.88) return Math.floor(requestedSize * (W * 0.88) / measured);
      return requestedSize;
    };
    const drawMemeText = (text: string, yPos: number, baseline: CanvasTextBaseline) => {
      const fs = autoFontSize(text, params.memeFontSize);
      ctx.font = `bold ${fs}px Impact, 'Arial Black', sans-serif`;
      ctx.textBaseline = baseline;
      ctx.lineWidth = Math.max(4, fs * 0.12);
      ctx.strokeStyle = params.memeStroke;
      ctx.fillStyle = params.memeTextColor;
      ctx.strokeText(text.toUpperCase(), W / 2, yPos);
      ctx.fillText(text.toUpperCase(), W / 2, yPos);
    };
    if (params.memeTop) drawMemeText(params.memeTop, Math.max(params.memeFontSize * 0.4, 12), 'top');
    if (params.memeBottom) drawMemeText(params.memeBottom, H - Math.max(params.memeFontSize * 0.4, 12), 'bottom');
    return;
  }

  if (archetype === 'beautifier') {
    const pad = params.bPadding;
    canvas.width = W + pad*2; canvas.height = H + pad*2;
    const hexes = params.bGradient.match(/#[0-9a-fA-F]{6}/g) || ['#8b5cf6','#ec4899'];
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, hexes[0]); grad.addColorStop(1, hexes[1]||hexes[0]);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.shadowColor='rgba(0,0,0,0.4)'; ctx.shadowBlur=params.bShadow; ctx.shadowOffsetY=8;
    const r = params.bRadius;
    ctx.beginPath();
    ctx.moveTo(pad+r,pad); ctx.lineTo(pad+W-r,pad);
    ctx.quadraticCurveTo(pad+W,pad,pad+W,pad+r);
    ctx.lineTo(pad+W,pad+H-r); ctx.quadraticCurveTo(pad+W,pad+H,pad+W-r,pad+H);
    ctx.lineTo(pad+r,pad+H); ctx.quadraticCurveTo(pad,pad+H,pad,pad+H-r);
    ctx.lineTo(pad,pad+r); ctx.quadraticCurveTo(pad,pad,pad+r,pad); ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, pad, pad, W, H);
    ctx.restore();
    // Browser bar
    ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.fillRect(pad,pad,W,28);
    ['#ff5f56','#ffbd2e','#27c93f'].forEach((c,i) => {
      ctx.fillStyle=c; ctx.beginPath(); ctx.arc(pad+14+i*17,pad+14,5,0,Math.PI*2); ctx.fill();
    });
    return;
  }

  if (archetype === 'polaroid') {
    const bs=40, bb=110;
    canvas.width=W+bs*2; canvas.height=H+bs+bb;
    ctx.fillStyle='#f9f7f0'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle='#e0ddd5'; ctx.lineWidth=1; ctx.strokeRect(0,0,canvas.width,canvas.height);
    const tmp=document.createElement('canvas'); tmp.width=W; tmp.height=H;
    const tc=tmp.getContext('2d')!;
    tc.filter=`sepia(${params.pSepia}%) contrast(108%)`;
    tc.drawImage(img,0,0);
    if (params.pVignette>0) {
      const id=tc.getImageData(0,0,W,H); const dd2=id.data;
      const cx2=W/2,cy2=H/2,md=Math.sqrt(cx2*cx2+cy2*cy2)||1;
      for (let y=0;y<H;y++) for (let x=0;x<W;x++) {
        const idx=(y*W+x)*4;
        const f=1-(Math.sqrt((x-cx2)**2+(y-cy2)**2)/md)*(params.pVignette/100);
        dd2[idx]*=f; dd2[idx+1]*=f; dd2[idx+2]*=f;
      }
      tc.putImageData(id,0,0);
    }
    if (params.pNoise>0) {
      const id2=tc.getImageData(0,0,W,H); const d2=id2.data;
      for (let i=0;i<d2.length;i+=4) {
        const n=(Math.random()-0.5)*params.pNoise*2.55;
        d2[i]=Math.min(255,Math.max(0,d2[i]+n));
        d2[i+1]=Math.min(255,Math.max(0,d2[i+1]+n));
        d2[i+2]=Math.min(255,Math.max(0,d2[i+2]+n));
      }
      tc.putImageData(id2,0,0);
    }
    ctx.drawImage(tmp,bs,bs);
    ctx.fillStyle='#2d3748'; ctx.textAlign='center';
    ctx.font='28px "Comic Sans MS",cursive,sans-serif';
    ctx.fillText(params.pText, canvas.width/2, canvas.height-44);
    return;
  }

  if (archetype === 'icongen') {
    canvas.width=256; canvas.height=256;
    ctx.drawImage(img,0,0,256,256);
    return;
  }

  // metadata, ascii, compress, converter, collage, histogram, fallback
  ctx.drawImage(img, 0, 0);
}

// ─── Gradient Presets ────────────────────────────────────────────────────────

const GRADIENTS = [
  { name:'Sunset', style:'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' },
  { name:'Neon', style:'linear-gradient(135deg, #0f0c20 0%, #06b6d4 100%)' },
  { name:'Synthwave', style:'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' },
  { name:'Mint', style:'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  { name:'Dark', style:'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
  { name:'Sakura', style:'linear-gradient(135deg, #f472b6 0%, #fb7185 100%)' },
];

// ─── Page Component ──────────────────────────────────────────────────────────

interface PageProps { params: Promise<{ slug: string }>; }

export default function ToolRunnerPage({ params }: PageProps) {
  const { slug } = use(params);
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [imgDims, setImgDims] = useState<{ w: number; h: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [paletteColors, setPaletteColors] = useState<string[]>([]);
  const [selectedSwatch, setSelectedSwatch] = useState<string | null>(null);
  const [asciiText, setAsciiText] = useState('');
  const [histData, setHistData] = useState<{ r: number[]; g: number[]; b: number[] } | null>(null);
  const histCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [metaPanel, setMetaPanel] = useState<Record<string, string>>({});
  const [exportExt, setExportExt] = useState('png');

  const tool: FeatureItem | null = useMemo(() => FEATURES_DATA.find(f => getSlug(f.name) === slug) || null, [slug]);
  const archetype: Archetype = useMemo(() => tool ? getArchetype(tool.name) : 'fallback', [tool]);

  // ── Per-archetype state ──────────────────────────────────────────────────
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sepia, setSepia] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [gamma, setGamma] = useState(100);
  const [convKernel, setConvKernel] = useState('blur');
  const [cinematicPreset, setCinematicPreset] = useState('warm');
  const [vigStrength, setVigStrength] = useState(40);
  const [noiseAmt, setNoiseAmt] = useState(10);
  const [resW, setResW] = useState(800);
  const [resH, setResH] = useState(600);
  const [lockAR, setLockAR] = useState(true);
  const [cropL, setCropL] = useState(0);
  const [cropR, setCropR] = useState(0);
  const [cropT, setCropT] = useState(0);
  const [cropB, setCropB] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [wmText, setWmText] = useState('© Squoosh Next');
  const [wmColor, setWmColor] = useState('#ffffff');
  const [wmSize, setWmSize] = useState(32);
  const [wmOpacity, setWmOpacity] = useState(70);
  const [wmAlign, setWmAlign] = useState('br');
  const [brdWidth, setBrdWidth] = useState(20);
  const [brdColor, setBrdColor] = useState('#ffffff');
  const [brdRadius, setBrdRadius] = useState(0);
  const [pixSize, setPixSize] = useState(8);
  const [ditherType, setDitherType] = useState('floyd');
  const [channelMode, setChannelMode] = useState('red');
  const [convertFmt, setConvertFmt] = useState('image/png');
  const [convertQuality, setConvertQuality] = useState(85);
  const [compQuality, setCompQuality] = useState(75);
  const [compFmt, setCompFmt] = useState('image/jpeg');
  const [memeTop, setMemeTop] = useState('TOP TEXT');
  const [memeBottom, setMemeBottom] = useState('BOTTOM TEXT');
  const [memeFontSize, setMemeFontSize] = useState(52);
  const [memeTextColor, setMemeTextColor] = useState('#ffffff');
  const [memeStroke, setMemeStroke] = useState('#000000');
  const [bPadding, setBPadding] = useState(60);
  const [bRadius, setBRadius] = useState(16);
  const [bShadow, setBShadow] = useState(30);
  const [bGradient, setBGradient] = useState(GRADIENTS[0].style);
  const [pText, setPText] = useState('Retro Memories');
  const [pSepia, setPSepia] = useState(55);
  const [pNoise, setPNoise] = useState(15);
  const [pVignette, setPVignette] = useState(30);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [bgThreshold, setBgThreshold] = useState(230);
  const [bgFeather, setBgFeather] = useState(10);
  const [bgTransparent, setBgTransparent] = useState(false);

  // Derive export extension from format using global registry
  useEffect(() => {
    const fmt = archetype === 'compress' ? compFmt : convertFmt;
    setExportExt(EXT_BY_VALUE[fmt] ?? 'png');
  }, [compFmt, convertFmt, archetype]);

  const buildParams = useCallback((): RenderParams => ({
    archetype, brightness, contrast, saturation, sepia,
    grayscale: archetype === 'adjuster' && (tool?.name.toLowerCase().includes('grayscale') || tool?.name.toLowerCase().includes('black and white') || tool?.name.toLowerCase().includes('monochrome')) ? 100 : grayscale,
    gamma, convKernel, cinematicPreset, vigStrength, noiseAmt,
    resW, resH, cropL, cropR, cropT, cropB, rotation, flipH, flipV,
    wmText, wmColor, wmSize, wmOpacity, wmAlign,
    brdWidth, brdColor, brdRadius, pixSize, ditherType, channelMode,
    convertFmt, convertQuality, compQuality, compFmt,
    memeTop, memeBottom, memeFontSize, memeTextColor, memeStroke,
    bPadding, bRadius, bShadow, bGradient,
    pText, pSepia, pNoise, pVignette, bgColor, bgThreshold, bgFeather, bgTransparent,
    iconSizes: ['16','32','64','128','256'], collageRows: 2, collageCols: 2, collageGap: 4, collageBg: '#000000',
  }), [archetype, brightness, contrast, saturation, sepia, grayscale, gamma, convKernel, cinematicPreset, vigStrength, noiseAmt, resW, resH, cropL, cropR, cropT, cropB, rotation, flipH, flipV, wmText, wmColor, wmSize, wmOpacity, wmAlign, brdWidth, brdColor, brdRadius, pixSize, ditherType, channelMode, convertFmt, convertQuality, compQuality, compFmt, memeTop, memeBottom, memeFontSize, memeTextColor, memeStroke, bPadding, bRadius, bShadow, bGradient, pText, pSepia, pNoise, pVignette, bgColor, bgThreshold, bgFeather, bgTransparent, tool]);

  const renderPreview = useCallback(async () => {
    if (!originalUrl || !canvasRef.current) return;
    setRendering(true);
    try {
      const img = new Image();
      img.src = originalUrl;
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; });
      const canvas = canvasRef.current;
      const p = buildParams();
      await renderToCanvas(canvas, img, p);

      // Special post-render: palette extraction
      if (archetype === 'palette') {
        const ctx = canvas.getContext('2d')!;
        const d = ctx.getImageData(0, 0, Math.min(100,canvas.width), Math.min(100,canvas.height)).data;
        const counts: Record<string, number> = {};
        for (let i = 0; i < d.length; i += 4) {
          const r = Math.round(d[i]/16)*16, g = Math.round(d[i+1]/16)*16, b = Math.round(d[i+2]/16)*16;
          const hex = `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
          counts[hex] = (counts[hex]||0)+1;
        }
        const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8).map(e=>e[0].toUpperCase());
        setPaletteColors(sorted);
        if (sorted.length && !selectedSwatch) setSelectedSwatch(sorted[0]);
      }

      // ASCII
      if (archetype === 'ascii') {
        setAsciiText(canvasToASCII(canvas));
      }

      // Histogram
      if (archetype === 'histogram') {
        const ctx2 = canvas.getContext('2d')!;
        const id = ctx2.getImageData(0, 0, canvas.width, canvas.height);
        const d2 = id.data;
        const rr = new Array(256).fill(0), gg = new Array(256).fill(0), bb = new Array(256).fill(0);
        for (let i = 0; i < d2.length; i += 4) { rr[d2[i]]++; gg[d2[i+1]]++; bb[d2[i+2]]++; }
        setHistData({ r: rr, g: gg, b: bb });
      }

      // Metadata
      if (archetype === 'metadata' && file) {
        setMetaPanel({
          'Filename': file.name, 'MIME Type': file.type || 'image/unknown',
          'File Size': bytesToLabel(file.size), 'Last Modified': new Date(file.lastModified).toLocaleString(),
          'Canvas Width': `${canvas.width}px`, 'Canvas Height': `${canvas.height}px`,
          'EXIF Strip Status': 'Auto-stripped on export',
          'Color Space': 'sRGB (browser default)', 'Bit Depth': '8-bit RGBA',
          'Aspect Ratio': `${(canvas.width/canvas.height).toFixed(2)}:1`,
        });
      }

      // Export blob
      const doExport = (fmt: string, q: number) => new Promise<void>((res) => {
        if (fmt === 'custom/bmp') { const b = createBMPBlob(canvas); if (exportUrl) URL.revokeObjectURL(exportUrl); setExportUrl(URL.createObjectURL(b)); res(); }
        else if (fmt === 'custom/svg') { const b = createSVGBlob(canvas); if (exportUrl) URL.revokeObjectURL(exportUrl); setExportUrl(URL.createObjectURL(b)); res(); }
        else {
          canvas.toBlob((blob) => {
            if (blob) { if (exportUrl) URL.revokeObjectURL(exportUrl); setExportUrl(URL.createObjectURL(blob)); }
            res();
          }, fmt === 'image/avif' || fmt === 'image/jpeg' || fmt === 'image/webp' ? fmt : 'image/png', q/100);
        }
      });

      if (archetype === 'compress') await doExport(compFmt, compQuality);
      else if (archetype === 'converter') await doExport(convertFmt, convertQuality);
      else await doExport('image/png', 100);

    } catch (e) { console.error(e); }
    setRendering(false);
  }, [originalUrl, buildParams, archetype, file, compFmt, compQuality, convertFmt, convertQuality]);

  // Draw histogram
  useEffect(() => {
    if (!histData || !histCanvasRef.current) return;
    const hc = histCanvasRef.current;
    const ctx = hc.getContext('2d')!;
    const W2 = hc.width, H2 = hc.height;
    ctx.clearRect(0, 0, W2, H2);
    const max = Math.max(...histData.r, ...histData.g, ...histData.b) || 1;
    ctx.globalCompositeOperation = 'screen';
    ([['r','rgba(239,68,68,0.6)'],['g','rgba(34,197,94,0.6)'],['b','rgba(59,130,246,0.6)']] as const).forEach(([ch, col]) => {
      const hist = histData[ch as 'r'|'g'|'b'];
      ctx.beginPath(); ctx.moveTo(0, H2);
      for (let x = 0; x < 256; x++) {
        ctx.lineTo((x/255)*W2, H2-(hist[x]/max)*(H2-4));
      }
      ctx.lineTo(W2,H2); ctx.fillStyle=col; ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
  }, [histData]);

  useEffect(() => {
    if (file) { const u = URL.createObjectURL(file); setOriginalUrl(u); return () => URL.revokeObjectURL(u); }
  }, [file]);

  useEffect(() => {
    if (!imgDims && originalUrl) {
      const img = new Image(); img.src = originalUrl;
      img.onload = () => { setImgDims({ w: img.naturalWidth, h: img.naturalHeight }); setResW(img.naturalWidth); setResH(img.naturalHeight); };
    }
  }, [originalUrl]);

  useEffect(() => { if (originalUrl) renderPreview(); }, [originalUrl, renderPreview]);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    setFile(f); setPaletteColors([]); setSelectedSwatch(null); setAsciiText(''); setHistData(null); setMetaPanel({});
    setImgDims(null);
  };

  if (!tool) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" color="error" gutterBottom>Tool Not Found</Typography>
        <Typography sx={{ mb: 4 }}>The route <code>{slug}</code> does not match any catalog entry.</Typography>
        <Button component={Link} href="/features" variant="contained">Back to Catalog</Button>
      </Container>
    );
  }

  const swatchRgb = selectedSwatch ? hexToRgb(selectedSwatch) : { r: 0, g: 0, b: 0 };
  const contrastW = getContrastRatio(swatchRgb, { r:255,g:255,b:255 });
  const contrastB = getContrastRatio(swatchRgb, { r:0,g:0,b:0 });

  // ─── Control Panels ────────────────────────────────────────────────────────

  const renderControls = () => {
    switch (archetype) {
      case 'adjuster':
        return (
          <Stack spacing={2.5}>
            {[
              ['Brightness', brightness, setBrightness, 50, 150],
              ['Contrast', contrast, setContrast, 50, 150],
              ['Saturation', saturation, setSaturation, 0, 200],
              ['Sepia Tone', sepia, setSepia, 0, 100],
              ['Grayscale', grayscale, setGrayscale, 0, 100],
              ['Gamma', gamma, setGamma, 50, 200],
            ].map(([label, val, setter, min, max]) => (
              <Box key={label as string}>
                <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                  <Typography variant="caption">{label as string}</Typography>
                  <Typography variant="caption" sx={{ fontWeight:700 }}>{val as number}%</Typography>
                </Box>
                <Slider value={val as number} min={min as number} max={max as number} onChange={(_,v)=>(setter as (n:number)=>void)(v as number)} size="small" />
              </Box>
            ))}
          </Stack>
        );

      case 'convolution':
        return (
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Kernel Filter</InputLabel>
              <Select value={convKernel} label="Kernel Filter" onChange={e=>setConvKernel(e.target.value)}>
                <MenuItem value="blur">Box Blur (3×3)</MenuItem>
                <MenuItem value="sharpen">High-Pass Sharpen</MenuItem>
                <MenuItem value="edge">Edge Detection (Laplacian)</MenuItem>
                <MenuItem value="emboss">3D Emboss Relief</MenuItem>
                <MenuItem value="unsharp">Unsharp Mask</MenuItem>
              </Select>
            </FormControl>
            <Alert severity="info" sx={{ fontSize:'0.8rem' }}>
              Convolution filters apply a 3×3 matrix kernel to every pixel. Results update in real time.
            </Alert>
          </Stack>
        );

      case 'cinematic':
        return (
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Color Grade Preset</InputLabel>
              <Select value={cinematicPreset} label="Color Grade Preset" onChange={e=>setCinematicPreset(e.target.value)}>
                <MenuItem value="warm">Warm Sunshine</MenuItem>
                <MenuItem value="cool">Cool Blue Velvet</MenuItem>
                <MenuItem value="cyberpunk">Cyberpunk Neon</MenuItem>
                <MenuItem value="vintage">Vintage Film Grain</MenuItem>
                <MenuItem value="retro">70s Faded Retro</MenuItem>
                <MenuItem value="dramatic">High Contrast Dramatic</MenuItem>
                <MenuItem value="matte">Matte Faded Look</MenuItem>
                <MenuItem value="noir">Noir Black & White</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        );

      case 'vignette':
        return (
          <Stack spacing={2.5}>
            <Box>
              <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                <Typography variant="caption">Vignette Strength</Typography>
                <Typography variant="caption" sx={{ fontWeight:700 }}>{vigStrength}%</Typography>
              </Box>
              <Slider value={vigStrength} min={0} max={100} onChange={(_,v)=>setVigStrength(v as number)} size="small" />
            </Box>
            <Box>
              <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                <Typography variant="caption">Film Noise / Grain</Typography>
                <Typography variant="caption" sx={{ fontWeight:700 }}>{noiseAmt}%</Typography>
              </Box>
              <Slider value={noiseAmt} min={0} max={80} onChange={(_,v)=>setNoiseAmt(v as number)} size="small" />
            </Box>
          </Stack>
        );

      case 'resize':
        return (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5}>
              <TextField label="Width (px)" size="small" type="number" value={resW} onChange={e=>{
                const w=Math.max(1,+e.target.value); setResW(w);
                if (lockAR && imgDims) setResH(Math.round(w/(imgDims.w/imgDims.h)));
              }} fullWidth />
              <TextField label="Height (px)" size="small" type="number" value={resH} onChange={e=>{
                const h=Math.max(1,+e.target.value); setResH(h);
                if (lockAR && imgDims) setResW(Math.round(h*(imgDims.w/imgDims.h)));
              }} fullWidth />
            </Stack>
            <FormControlLabel control={<Switch checked={lockAR} onChange={e=>setLockAR(e.target.checked)} />} label={<Typography variant="caption">Lock Aspect Ratio</Typography>} />
            {imgDims && (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {[0.25,0.5,0.75,1,2].map(f=>(
                  <Button key={f} size="small" variant="outlined" onClick={()=>{setResW(Math.round(imgDims.w*f));setResH(Math.round(imgDims.h*f));}}>
                    {f}×
                  </Button>
                ))}
              </Stack>
            )}
            {imgDims && <Typography variant="caption" color="text.secondary">Original: {imgDims.w}×{imgDims.h}px → Output: {resW}×{resH}px</Typography>}
          </Stack>
        );

      case 'crop':
        return (
          <Stack spacing={2}>
            {([['Left', cropL, setCropL], ['Right', cropR, setCropR], ['Top', cropT, setCropT], ['Bottom', cropB, setCropB]] as const).map(([l,v,s])=>(
              <Box key={l as string}>
                <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                  <Typography variant="caption">Crop {l as string}</Typography>
                  <Typography variant="caption" sx={{ fontWeight:700 }}>{v as number}%</Typography>
                </Box>
                <Slider value={v as number} min={0} max={49} onChange={(_,nv)=>(s as (n:number)=>void)(nv as number)} size="small" />
              </Box>
            ))}
            <Divider />
            <Typography variant="caption" sx={{ fontWeight:700 }}>Aspect Ratio Presets</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {(['1:1','4:3','16:9','3:2'] as const).map(r=>(
                <Button key={r} size="small" variant="outlined" onClick={()=>{
                  if (!imgDims) return;
                  const [aw,ah]=r.split(':').map(Number);
                  const target=aw/ah; const curr=imgDims.w/imgDims.h;
                  if (curr>target){const d=((imgDims.w-imgDims.h*target)/imgDims.w)*100;setCropL(Math.round(d/2));setCropR(Math.round(d/2));setCropT(0);setCropB(0);}
                  else{const d=((imgDims.h-imgDims.w/target)/imgDims.h)*100;setCropT(Math.round(d/2));setCropB(Math.round(d/2));setCropL(0);setCropR(0);}
                }}>{r}</Button>
              ))}
              <Button size="small" variant="outlined" onClick={()=>{setCropL(0);setCropR(0);setCropT(0);setCropB(0);}}>Reset</Button>
            </Stack>
          </Stack>
        );

      case 'rotate':
        return (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button fullWidth variant="outlined" onClick={()=>setRotation(r=>(r+90)%360)}>Rotate 90° CW</Button>
              <Button fullWidth variant="outlined" onClick={()=>setRotation(r=>(r+270)%360)}>Rotate 90° CCW</Button>
              <Button fullWidth variant="outlined" onClick={()=>setRotation(r=>(r+180)%360)}>Rotate 180°</Button>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button fullWidth variant={flipH?'contained':'outlined'} onClick={()=>setFlipH(v=>!v)}>Flip Horizontal</Button>
              <Button fullWidth variant={flipV?'contained':'outlined'} onClick={()=>setFlipV(v=>!v)}>Flip Vertical</Button>
            </Stack>
            <Typography variant="caption" color="text.secondary">Current rotation: {rotation}° | Flip H: {flipH?'On':'Off'} | Flip V: {flipV?'On':'Off'}</Typography>
          </Stack>
        );

      case 'watermark':
        return (
          <Stack spacing={2}>
            <TextField fullWidth label="Watermark Text" size="small" value={wmText} onChange={e=>setWmText(e.target.value)} />
            <TextField fullWidth label="Color (Hex)" size="small" value={wmColor} onChange={e=>setWmColor(e.target.value)} type="color" sx={{ '& input': { height:36 } }} />
            <FormControl fullWidth size="small">
              <InputLabel>Position</InputLabel>
              <Select value={wmAlign} label="Position" onChange={e=>setWmAlign(e.target.value)}>
                <MenuItem value="tl">Top Left</MenuItem>
                <MenuItem value="tr">Top Right</MenuItem>
                <MenuItem value="bl">Bottom Left</MenuItem>
                <MenuItem value="br">Bottom Right</MenuItem>
                <MenuItem value="center">Center</MenuItem>
              </Select>
            </FormControl>
            <Box><Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}><Typography variant="caption">Font Size</Typography><Typography variant="caption" sx={{ fontWeight:700 }}>{wmSize}px</Typography></Box>
              <Slider value={wmSize} min={12} max={120} onChange={(_,v)=>setWmSize(v as number)} size="small" /></Box>
            <Box><Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}><Typography variant="caption">Opacity</Typography><Typography variant="caption" sx={{ fontWeight:700 }}>{wmOpacity}%</Typography></Box>
              <Slider value={wmOpacity} min={10} max={100} onChange={(_,v)=>setWmOpacity(v as number)} size="small" /></Box>
          </Stack>
        );

      case 'border':
        return (
          <Stack spacing={2}>
            <Box><Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}><Typography variant="caption">Border Width</Typography><Typography variant="caption" sx={{ fontWeight:700 }}>{brdWidth}px</Typography></Box>
              <Slider value={brdWidth} min={0} max={100} onChange={(_,v)=>setBrdWidth(v as number)} size="small" /></Box>
            <TextField fullWidth label="Border Color" size="small" value={brdColor} onChange={e=>setBrdColor(e.target.value)} type="color" sx={{ '& input': { height:36 } }} />
            <Box><Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}><Typography variant="caption">Corner Radius</Typography><Typography variant="caption" sx={{ fontWeight:700 }}>{brdRadius}px</Typography></Box>
              <Slider value={brdRadius} min={0} max={60} onChange={(_,v)=>setBrdRadius(v as number)} size="small" /></Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {['#ffffff','#000000','#3b82f6','#f59e0b','#10b981','#ef4444'].map(c=>(
                <Box key={c} onClick={()=>setBrdColor(c)} sx={{ width:28,height:28,borderRadius:1,bgcolor:c,cursor:'pointer',border:brdColor===c?'3px solid #3b82f6':'1px solid rgba(0,0,0,0.2)' }} />
              ))}
            </Stack>
          </Stack>
        );

      case 'pixelate':
        return (
          <Stack spacing={2}>
            <Box><Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}><Typography variant="caption">Block Size (Pixel Size)</Typography><Typography variant="caption" sx={{ fontWeight:700 }}>{pixSize}px</Typography></Box>
              <Slider value={pixSize} min={2} max={80} onChange={(_,v)=>setPixSize(v as number)} size="small" /></Box>
            <Stack direction="row" spacing={1}>
              {[4,8,16,32,64].map(s=>(
                <Button key={s} size="small" variant={pixSize===s?'contained':'outlined'} onClick={()=>setPixSize(s)}>{s}px</Button>
              ))}
            </Stack>
            <Alert severity="info" sx={{ fontSize:'0.8rem' }}>Large pixel blocks create mosaic and pixel-art effects. Use 4–16px for subtle effects.</Alert>
          </Stack>
        );

      case 'dither':
        return (
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Dithering Algorithm</InputLabel>
              <Select value={ditherType} label="Dithering Algorithm" onChange={e=>setDitherType(e.target.value)}>
                <MenuItem value="floyd">Floyd-Steinberg Error Diffusion</MenuItem>
                <MenuItem value="ordered">Ordered 4×4 Bayer Matrix</MenuItem>
                <MenuItem value="atkinson">Atkinson Dithering</MenuItem>
              </Select>
            </FormControl>
            <Alert severity="info" sx={{ fontSize:'0.8rem' }}>Dithering simulates smooth gradients using limited palette colors. Floyd-Steinberg produces the most natural results.</Alert>
          </Stack>
        );

      case 'channel':
        return (
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Channel Mode</InputLabel>
              <Select value={channelMode} label="Channel Mode" onChange={e=>setChannelMode(e.target.value)}>
                <MenuItem value="red">Isolate Red Channel</MenuItem>
                <MenuItem value="green">Isolate Green Channel</MenuItem>
                <MenuItem value="blue">Isolate Blue Channel</MenuItem>
                <MenuItem value="alpha">Alpha Channel (Opacity)</MenuItem>
                <MenuItem value="lum">Luminance (Grayscale)</MenuItem>
                <MenuItem value="invert">Invert All Channels</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        );

      case 'compress':
        return (
          <Stack spacing={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Codec</InputLabel>
              <Select value={compFmt} label="Codec" onChange={e=>setCompFmt(e.target.value)}>
                {[...NATIVE_CODEC_FORMATS, ...CUSTOM_ENCODER_FORMATS.filter(f =>
                  ['custom/bmp','custom/tga','custom/ppm','custom/pgm','custom/ff'].includes(f.value)
                )].map(f => (
                  <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {hasQualityControl(compFmt) && (
              <Box>
                <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                  <Typography variant="caption">Quality</Typography>
                  <Typography variant="caption" sx={{ fontWeight:700 }}>{compQuality}%</Typography>
                </Box>
                <Slider value={compQuality} min={5} max={100} onChange={(_,v)=>setCompQuality(v as number)} size="small" />
              </Box>
            )}
            <Alert severity="success" sx={{ fontSize:'0.8rem' }}>Compression runs entirely in your browser. No files are uploaded to any server.</Alert>
          </Stack>
        );

      case 'converter':
        return (
          <Stack spacing={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Output Format</InputLabel>
              <Select value={convertFmt} label="Output Format" onChange={e=>setConvertFmt(e.target.value)}
                MenuProps={{ PaperProps: { style: { maxHeight: 340 } } }}>
                {ALL_EXPORT_FORMATS.map(f => (
                  <MenuItem key={f.value} value={f.value} sx={{ fontSize:'0.82rem' }}>{f.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {hasQualityControl(convertFmt) && (
              <Box>
                <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                  <Typography variant="caption">Quality</Typography>
                  <Typography variant="caption" sx={{ fontWeight:700 }}>{convertQuality}%</Typography>
                </Box>
                <Slider value={convertQuality} min={5} max={100} onChange={(_,v)=>setConvertQuality(v as number)} size="small" />
              </Box>
            )}
            {isLosslessFormat(convertFmt) && (
              <Alert severity="info" sx={{ fontSize:'0.8rem' }}>Lossless format — quality slider not applicable.</Alert>
            )}
          </Stack>
        );

      case 'icongen':
        return (
          <Stack spacing={2}>
            <Alert severity="info" sx={{ fontSize:'0.8rem' }}>Generates a square 256×256 canvas. Download as PNG and use at any icon size (16, 32, 64, 128, 256).</Alert>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {['16×16','32×32','64×64','128×128','256×256'].map(s=>(
                <Chip key={s} label={s} variant="outlined" size="small" color="primary" sx={{ fontWeight:700 }} />
              ))}
            </Stack>
          </Stack>
        );

      case 'background':
        return (
          <Stack spacing={2}>
            <Alert severity="info" sx={{ fontSize:'0.8rem' }}>
              Threshold-based background removal — removes near-white pixels. Adjust threshold to control sensitivity.
            </Alert>
            <FormControlLabel
              control={<Switch checked={bgTransparent} onChange={e => setBgTransparent(e.target.checked)} size="small" />}
              label="Output Transparent (PNG)"
            />
            {!bgTransparent && (
              <>
                <TextField fullWidth label="Replacement Color" size="small" value={bgColor} onChange={e=>setBgColor(e.target.value)} type="color" sx={{ '& input': { height:36 } }} />
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {['#ffffff','#000000','#f1f5f9','#0f172a'].map(c=>(
                    <Button key={c} size="small" variant="outlined" onClick={()=>setBgColor(c)}>{c}</Button>
                  ))}
                </Stack>
              </>
            )}
            <Typography variant="caption" gutterBottom>Luminance Threshold: {bgThreshold}</Typography>
            <Slider value={bgThreshold} min={100} max={255} step={5} onChange={(_, v) => setBgThreshold(v as number)} size="small" />
            {bgTransparent && (
              <>
                <Typography variant="caption" gutterBottom>Edge Feather: {bgFeather}px</Typography>
                <Slider value={bgFeather} min={0} max={40} step={1} onChange={(_, v) => setBgFeather(v as number)} size="small" />
              </>
            )}
          </Stack>
        );

      case 'palette':
        return (
          <Stack spacing={2}>
            {!file && <Alert severity="info" sx={{ fontSize:'0.8rem' }}>Upload an image to extract its dominant color palette.</Alert>}
            {paletteColors.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight:700 }}>Extracted Swatches ({paletteColors.length})</Typography>
                <Grid container spacing={1}>
                  {paletteColors.map(c=>(
                    <Grid item xs={3} key={c}>
                      <Box onClick={()=>setSelectedSwatch(c)} sx={{ height:48, bgcolor:c, borderRadius:1.5, cursor:'pointer', border:selectedSwatch===c?'3px solid':'1px solid', borderColor:selectedSwatch===c?'primary.main':'divider', '&:hover':{transform:'scale(1.05)'}, transition:'transform 0.15s' }} />
                      <Typography variant="caption" align="center" sx={{ display:'block', mt:0.5, fontSize:'0.65rem', fontWeight:700 }}>{c}</Typography>
                    </Grid>
                  ))}
                </Grid>
                {selectedSwatch && (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        {[['HEX', selectedSwatch], ['RGB', `${swatchRgb.r}, ${swatchRgb.g}, ${swatchRgb.b}`], ['WCAG vs White', `${contrastW.toFixed(1)}:1 ${contrastW>=4.5?'✓':'✗'}`], ['WCAG vs Black', `${contrastB.toFixed(1)}:1 ${contrastB>=4.5?'✓':'✗'}`]].map(([k,v])=>(
                          <TableRow key={k}><TableCell sx={{ fontWeight:600 }}><Typography variant="caption">{k}</Typography></TableCell><TableCell><Typography variant="caption">{v}</Typography></TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}
          </Stack>
        );

      case 'meme':
        return (
          <Stack spacing={2}>
            <TextField fullWidth label="Top Caption" size="small" value={memeTop} onChange={e=>setMemeTop(e.target.value.toUpperCase())} />
            <TextField fullWidth label="Bottom Caption" size="small" value={memeBottom} onChange={e=>setMemeBottom(e.target.value.toUpperCase())} />
            <Box><Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}><Typography variant="caption">Font Size</Typography><Typography variant="caption" sx={{ fontWeight:700 }}>{memeFontSize}px</Typography></Box>
              <Slider value={memeFontSize} min={20} max={120} onChange={(_,v)=>setMemeFontSize(v as number)} size="small" /></Box>
            <Stack direction="row" spacing={1}>
              <TextField fullWidth label="Text Color" size="small" value={memeTextColor} onChange={e=>setMemeTextColor(e.target.value)} type="color" sx={{ '& input':{ height:36 } }} />
              <TextField fullWidth label="Stroke" size="small" value={memeStroke} onChange={e=>setMemeStroke(e.target.value)} type="color" sx={{ '& input':{ height:36 } }} />
            </Stack>
          </Stack>
        );

      case 'beautifier':
        return (
          <Stack spacing={2.5}>
            <Box><Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}><Typography variant="caption">Padding</Typography><Typography variant="caption" sx={{ fontWeight:700 }}>{bPadding}px</Typography></Box>
              <Slider value={bPadding} min={10} max={160} onChange={(_,v)=>setBPadding(v as number)} size="small" /></Box>
            <Box><Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}><Typography variant="caption">Corner Radius</Typography><Typography variant="caption" sx={{ fontWeight:700 }}>{bRadius}px</Typography></Box>
              <Slider value={bRadius} min={0} max={40} onChange={(_,v)=>setBRadius(v as number)} size="small" /></Box>
            <Box><Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}><Typography variant="caption">Drop Shadow</Typography><Typography variant="caption" sx={{ fontWeight:700 }}>{bShadow}px</Typography></Box>
              <Slider value={bShadow} min={0} max={80} onChange={(_,v)=>setBShadow(v as number)} size="small" /></Box>
            <Typography variant="caption" sx={{ fontWeight:700, display:'block', mb:0.5 }}>Background Gradient</Typography>
            <Grid container spacing={1}>
              {GRADIENTS.map(g=>(
                <Grid item xs={4} key={g.name}>
                  <Box onClick={()=>setBGradient(g.style)} sx={{ height:32, background:g.style, borderRadius:1.5, cursor:'pointer', border:bGradient===g.style?'2px solid #3b82f6':'1px solid rgba(0,0,0,0.15)' }} />
                  <Typography variant="caption" align="center" sx={{ display:'block', fontSize:'0.65rem' }}>{g.name}</Typography>
                </Grid>
              ))}
            </Grid>
          </Stack>
        );

      case 'polaroid':
        return (
          <Stack spacing={2.5}>
            <TextField fullWidth label="Handwritten Caption" size="small" value={pText} onChange={e=>setPText(e.target.value)} />
            {[['Sepia Intensity', pSepia, setPSepia, 0, 100], ['Film Noise', pNoise, setPNoise, 0, 50], ['Vignette Depth', pVignette, setPVignette, 0, 80]].map(([l,v,s,mn,mx])=>(
              <Box key={l as string}><Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}><Typography variant="caption">{l as string}</Typography><Typography variant="caption" sx={{ fontWeight:700 }}>{v as number}%</Typography></Box>
                <Slider value={v as number} min={mn as number} max={mx as number} onChange={(_,nv)=>(s as (n:number)=>void)(nv as number)} size="small" /></Box>
            ))}
          </Stack>
        );

      case 'histogram':
        return (
          <Stack spacing={2}>
            <Typography variant="subtitle2" sx={{ fontWeight:700 }}>RGB Histogram Analysis</Typography>
            <Box sx={{ bgcolor:'#090d16', borderRadius:1.5, border:'1px solid', borderColor:'divider', overflow:'hidden' }}>
              <Box component="canvas" ref={histCanvasRef} width={280} height={100} sx={{ width:'100%', height:100, display:'block' }} />
            </Box>
            {file && imgDims && (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    {[['Filename',file.name],['File Size',bytesToLabel(file.size)],['Dimensions',`${imgDims.w}×${imgDims.h}px`],['Megapixels',`${((imgDims.w*imgDims.h)/1e6).toFixed(2)} MP`],['Aspect Ratio',`${(imgDims.w/imgDims.h).toFixed(3)}:1`]].map(([k,v])=>(
                      <TableRow key={k}><TableCell><Typography variant="caption" sx={{ fontWeight:600 }}>{k}</Typography></TableCell><TableCell><Typography variant="caption">{v}</Typography></TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        );

      case 'metadata':
        return (
          <Stack spacing={2}>
            {Object.keys(metaPanel).length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    {Object.entries(metaPanel).map(([k,v])=>(
                      <TableRow key={k}>
                        <TableCell sx={{ fontWeight:700, whiteSpace:'nowrap' }}><Typography variant="caption">{k}</Typography></TableCell>
                        <TableCell><Typography variant="caption" sx={{ wordBreak:'break-all' }}>{v}</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info" sx={{ fontSize:'0.8rem' }}>Upload an image to inspect its metadata and file properties.</Alert>
            )}
          </Stack>
        );

      case 'ascii':
        return (
          <Stack spacing={2}>
            {asciiText ? (
              <>
                <Box sx={{ p:1.5, bgcolor:'#090d16', borderRadius:1.5, maxHeight:300, overflowY:'auto', border:'1px solid', borderColor:'divider' }}>
                  <Box component="pre" sx={{ m:0, fontSize:'0.45rem', lineHeight:1.2, fontFamily:'monospace', color:'#a3e635', whiteSpace:'pre' }}>{asciiText}</Box>
                </Box>
                <Button size="small" variant="outlined" onClick={()=>{
                  const blob = new Blob([asciiText], { type:'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href=url; a.download='ascii-art.txt'; a.click(); URL.revokeObjectURL(url);
                }}>Download ASCII (.txt)</Button>
              </>
            ) : (
              <Alert severity="info" sx={{ fontSize:'0.8rem' }}>Upload an image to generate ASCII art from pixel luminance values.</Alert>
            )}
          </Stack>
        );

      default:
        return (
          <Stack spacing={2}>
            <Alert severity="success" sx={{ fontSize:'0.8rem' }}>
              This tool applies optimized canvas processing. Upload an image to see the result and download the output.
            </Alert>
            <Stack spacing={2}>
              {[['Brightness', brightness, setBrightness, 50, 150], ['Contrast', contrast, setContrast, 50, 150], ['Saturation', saturation, setSaturation, 0, 200]].map(([l,v,s,mn,mx])=>(
                <Box key={l as string}>
                  <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}><Typography variant="caption">{l as string}</Typography><Typography variant="caption" sx={{ fontWeight:700 }}>{v as number}%</Typography></Box>
                  <Slider value={v as number} min={mn as number} max={mx as number} onChange={(_,nv)=>(s as (n:number)=>void)(nv as number)} size="small" />
                </Box>
              ))}
            </Stack>
          </Stack>
        );
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Button component={Link} href="/features" sx={{ mb: 4, fontWeight: 700 }}>&larr; Back to Feature Catalog</Button>

      <Box sx={{ mb: 5 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ mb: 1.5 }}>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>{tool.name}</Typography>
          <Chip label={tool.category} variant="outlined" color="primary" sx={{ fontWeight: 700 }} />
          <Chip label={tool.badge} color="secondary" sx={{ fontWeight: 700 }} />
          <Chip label="100% Client-Side" color="success" sx={{ fontWeight: 700 }} />
        </Stack>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 800 }}>{tool.description}</Typography>
      </Box>

      <Grid container spacing={4}>
        {/* ── Canvas Preview ─────────────────────────────────────────────── */}
        <Grid item xs={12} lg={8}>
          <Paper variant="outlined" sx={{ p: 3, minHeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
            {rendering && (
              <Box sx={{ position:'absolute', top:12, right:12, zIndex:10 }}>
                <CircularProgress size={22} />
              </Box>
            )}

            {file ? (
              <Box sx={{ width:'100%', display:'flex', flexDirection:'column', alignItems:'center' }}>
                {archetype === 'ascii' ? (
                  <Box sx={{ p:2, bgcolor:'#090d16', borderRadius:2, maxWidth:'100%', maxHeight:450, overflowY:'auto', border:'1px solid', borderColor:'divider', width:'100%' }}>
                    <Box component="pre" sx={{ m:0, fontSize:'0.5rem', lineHeight:1.2, fontFamily:'monospace', color:'#a3e635', whiteSpace:'pre' }}>{asciiText || 'Generating…'}</Box>
                  </Box>
                ) : (
                  <Box sx={{ maxWidth:'100%', maxHeight:460, overflow:'hidden', borderRadius:2, boxShadow:'0 8px 30px rgba(0,0,0,0.15)', mb:3 }}>
                    <Box component="canvas" ref={canvasRef} sx={{ maxWidth:'100%', maxHeight:'460px', display:'block' }} />
                  </Box>
                )}
                <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
                  <Button variant="outlined" component="label">
                    Replace Image<input hidden type="file" accept={ACCEPT_STRING} onChange={e=>handleFile(e.target.files?.[0])} />
                  </Button>
                  {archetype !== 'ascii' && archetype !== 'metadata' && archetype !== 'histogram' && archetype !== 'palette' && (
                    <Button variant="contained" component="a" href={exportUrl||'#'} download={`squoosh-${getSlug(tool.name)}.${exportExt}`} disabled={!exportUrl||rendering}>
                      Download Output (.{exportExt})
                    </Button>
                  )}
                </Stack>
              </Box>
            ) : (
              <Box
                onDrop={e=>{ e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                onDragOver={e=>e.preventDefault()}
                sx={{ textAlign:'center', p:4, width:'100%', border:'2px dashed', borderColor:'divider', borderRadius:2, cursor:'pointer', '&:hover':{ borderColor:'primary.main', bgcolor:'action.selected' }, transition:'all 0.2s' }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>Drag & Drop an Image Here</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Load any JPEG, PNG, WebP, AVIF, GIF, BMP, or SVG file to begin using <strong>{tool.name}</strong>.
                </Typography>
                <Button variant="contained" component="label" size="large" sx={{ fontWeight:700, px:4, py:1.5 }}>
                  Select Image File<input hidden type="file" accept={ACCEPT_STRING} onChange={e=>handleFile(e.target.files?.[0])} />
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* ── Controls ───────────────────────────────────────────────────── */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Tool Configuration</Typography>
            {renderControls()}
            {file && (
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button fullWidth variant="outlined" size="small" onClick={renderPreview} disabled={rendering}>
                  {rendering ? 'Rendering…' : 'Apply & Refresh Preview'}
                </Button>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Similar tools */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>More {tool.category} Tools</Typography>
        <Grid container spacing={2}>
          {FEATURES_DATA.filter(f => f.category === tool.category && f.id !== tool.id).slice(0, 6).map(f => (
            <Grid item xs={12} sm={6} md={4} key={f.id}>
              <Card variant="outlined" sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', '&:hover': { borderColor: 'primary.main' }, transition: 'border-color 0.2s' }}>
                <Box>
                  <Chip label={f.badge} size="small" color="primary" variant="outlined" sx={{ mb: 1, fontSize:'0.65rem', fontWeight:700 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>{f.name}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>{f.description}</Typography>
                </Box>
                <Button component={Link} href={`/tools/${getSlug(f.name)}`} size="small" variant="text" sx={{ mt: 1.5, fontWeight: 700, alignSelf: 'flex-start' }}>
                  Open Tool →
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
