/**
 * Minimal, dependency-free EXIF reader for JPEG (APP1 / TIFF) files.
 * Extracts the most useful tags: camera make/model, lens, exposure,
 * aperture, ISO, focal length, orientation, software, date and GPS.
 *
 * Not exhaustive — covers the common, high-value tags. Runs in the browser.
 */

export interface ExifResult {
  hasExif: boolean;
  tags: Record<string, string>;
  lat?: number;
  lon?: number;
}

const TAGS: Record<number, string> = {
  0x010f: 'Camera Make',
  0x0110: 'Camera Model',
  0x0112: 'Orientation',
  0x0131: 'Software',
  0x0132: 'Date/Time',
  0x829a: 'Exposure Time',
  0x829d: 'F-Number',
  0x8827: 'ISO Speed',
  0x9003: 'Date Taken',
  0x920a: 'Focal Length',
  0xa002: 'Pixel Width',
  0xa003: 'Pixel Height',
  0xa434: 'Lens Model',
  0x8769: 'ExifOffset',
  0x8825: 'GPSInfo',
};

const ORIENTATION: Record<number, string> = {
  1: 'Normal', 2: 'Mirror horizontal', 3: 'Rotate 180°',
  4: 'Mirror vertical', 5: 'Mirror + rotate 270° CW',
  6: 'Rotate 90° CW', 7: 'Mirror + rotate 90° CW', 8: 'Rotate 270° CW',
};

const TYPE_SIZE: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };

export function parseExif(buffer: ArrayBuffer): ExifResult {
  const view = new DataView(buffer);
  const empty: ExifResult = { hasExif: false, tags: {} };
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return empty; // not JPEG

  // Find APP1 (Exif) marker
  let offset = 2;
  let app1 = -1;
  while (offset < view.byteLength - 4) {
    if (view.getUint16(offset) === 0xffe1) { app1 = offset; break; }
    if ((view.getUint16(offset) & 0xff00) !== 0xff00) break;
    offset += 2 + view.getUint16(offset + 2);
  }
  if (app1 < 0) return empty;

  const tiff = app1 + 10; // skip marker(2) + len(2) + "Exif\0\0"(6)
  if (view.getUint32(app1 + 4) !== 0x45786966) return empty; // "Exif"

  const little = view.getUint16(tiff) === 0x4949;
  const u16 = (o: number) => view.getUint16(o, little);
  const u32 = (o: number) => view.getUint32(o, little);
  const s32 = (o: number) => view.getInt32(o, little);

  const tags: Record<string, string> = {};
  let lat: number | undefined, lon: number | undefined;

  const readValue = (entry: number): { type: number; count: number; valueOffset: number } => {
    const type = u16(entry + 2);
    const count = u32(entry + 4);
    const byteLen = (TYPE_SIZE[type] || 1) * count;
    const valueOffset = byteLen <= 4 ? entry + 8 : tiff + u32(entry + 8);
    return { type, count, valueOffset };
  };

  const readString = (off: number, count: number) => {
    let s = '';
    for (let i = 0; i < count; i++) {
      const c = view.getUint8(off + i);
      if (c === 0) break;
      s += String.fromCharCode(c);
    }
    return s.trim();
  };

  const readRational = (off: number) => {
    const num = u32(off), den = u32(off + 4);
    return den ? num / den : 0;
  };

  const parseIFD = (ifdOffset: number, gps = false) => {
    if (ifdOffset + 2 > view.byteLength) return;
    const count = u16(ifdOffset);
    for (let i = 0; i < count; i++) {
      const entry = ifdOffset + 2 + i * 12;
      if (entry + 12 > view.byteLength) return;
      const tag = u16(entry);
      const { type, count: c, valueOffset } = readValue(entry);

      if (!gps && tag === 0x8769) { parseIFD(tiff + u32(entry + 8)); continue; }
      if (!gps && tag === 0x8825) { parseIFD(tiff + u32(entry + 8), true); continue; }

      if (gps) {
        if (tag === 2 || tag === 4) {
          const d = readRational(valueOffset);
          const m = readRational(valueOffset + 8);
          const s = readRational(valueOffset + 16);
          const dec = d + m / 60 + s / 3600;
          if (tag === 2) lat = dec; else lon = dec;
        }
        if (tag === 1) { const ref = readString(valueOffset, c); if (ref === 'S' && lat) lat = -lat; }
        if (tag === 3) { const ref = readString(valueOffset, c); if (ref === 'W' && lon) lon = -lon; }
        continue;
      }

      const name = TAGS[tag];
      if (!name || name === 'ExifOffset' || name === 'GPSInfo') continue;

      let val = '';
      if (type === 2) val = readString(valueOffset, c);
      else if (type === 3) val = String(u16(valueOffset));
      else if (type === 4) val = String(u32(valueOffset));
      else if (type === 5) {
        const r = readRational(valueOffset);
        if (tag === 0x829a) val = r < 1 ? `1/${Math.round(1 / r)} s` : `${r} s`;
        else if (tag === 0x829d) val = `f/${r.toFixed(1)}`;
        else if (tag === 0x920a) val = `${Math.round(r)} mm`;
        else val = String(r);
      } else if (type === 10) {
        val = String(s32(valueOffset) / (s32(valueOffset + 4) || 1));
      } else continue;

      if (tag === 0x0112) val = ORIENTATION[Number(val)] || val;
      if (val) tags[name] = val;
    }
  };

  try {
    parseIFD(tiff + u32(tiff + 4));
  } catch {
    /* tolerate malformed EXIF */
  }

  if (lat !== undefined && lon !== undefined) {
    tags['GPS Latitude'] = lat.toFixed(6);
    tags['GPS Longitude'] = lon.toFixed(6);
  }

  return { hasExif: Object.keys(tags).length > 0, tags, lat, lon };
}
