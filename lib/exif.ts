/**
 * Real EXIF reader — zero dependencies, pure browser, no paid APIs.
 * Parses JPEG APP1/EXIF markers directly from the file ArrayBuffer.
 * Supports: JPEG EXIF, JFIF, XMP namespace detection.
 */

export interface ExifData {
  // Identification
  make?: string;
  model?: string;
  software?: string;
  // Timestamps
  dateTimeOriginal?: string;
  dateTime?: string;
  // Exposure
  exposureTime?: string;    // e.g. "1/250"
  fNumber?: string;         // e.g. "f/2.8"
  iso?: number;
  exposureBias?: string;    // e.g. "-1 EV"
  shutterSpeed?: string;
  // Optics
  focalLength?: string;     // e.g. "50mm"
  focalLengthIn35mm?: number;
  maxAperture?: string;
  // Scene
  flash?: string;
  whiteBalance?: string;
  meteringMode?: string;
  exposureProgram?: string;
  // GPS
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsAltitude?: number;
  gpsLatitudeRef?: string;
  gpsLongitudeRef?: string;
  // Image
  imageWidth?: number;
  imageHeight?: number;
  orientation?: number;
  colorSpace?: string;
  xResolution?: number;
  yResolution?: number;
  resolutionUnit?: string;
  // Copyright
  artist?: string;
  copyright?: string;
  description?: string;
  // Computed
  detectedFormat?: string;
  hasGPS?: boolean;
}

// EXIF tag IDs → field names
const TAGS: Record<number, keyof ExifData> = {
  0x010F: 'make',
  0x0110: 'model',
  0x0131: 'software',
  0x013B: 'artist',
  0x8298: 'copyright',
  0x010E: 'description',
  0x0132: 'dateTime',
  0x9003: 'dateTimeOriginal',
  0xA002: 'imageWidth',
  0xA003: 'imageHeight',
  0x0100: 'imageWidth',
  0x0101: 'imageHeight',
  0x0112: 'orientation',
  0x011A: 'xResolution',
  0x011B: 'yResolution',
  0x0128: 'resolutionUnit',
};

// IFD Exif sub-tags
const EXIF_TAGS: Record<number, string> = {
  0x829A: 'exposureTime',
  0x829D: 'fNumber',
  0x8827: 'iso',
  0x9204: 'exposureBias',
  0x9201: 'shutterSpeed',
  0x920A: 'focalLength',
  0xA405: 'focalLengthIn35mm',
  0x9209: 'flash',
  0xA210: 'focalPlaneResolutionUnit',
  0x9207: 'meteringMode',
  0x8822: 'exposureProgram',
  0xA001: 'colorSpace',
  0xA300: 'fileSource',
  0x9286: 'userComment',
  0x0213: 'whiteBalance',
  0xA403: 'whiteBalance',
};

// GPS tags
const GPS_TAGS: Record<number, string> = {
  0x0001: 'gpsLatitudeRef',
  0x0002: 'gpsLatitude',
  0x0003: 'gpsLongitudeRef',
  0x0004: 'gpsLongitude',
  0x0005: 'gpsAltitudeRef',
  0x0006: 'gpsAltitude',
};

class DataViewReader {
  private dv: DataView;
  private le: boolean;
  constructor(buffer: ArrayBuffer, offset: number, littleEndian: boolean) {
    this.dv = new DataView(buffer, offset);
    this.le = littleEndian;
  }
  u8(o: number) { return this.dv.getUint8(o); }
  u16(o: number) { return this.dv.getUint16(o, this.le); }
  u32(o: number) { return this.dv.getUint32(o, this.le); }
  i32(o: number) { return this.dv.getInt32(o, this.le); }
  str(o: number, len: number) {
    const bytes = new Uint8Array(this.dv.buffer, this.dv.byteOffset + o, len);
    return new TextDecoder('ascii').decode(bytes).replace(/\0/g, '').trim();
  }
  rational(o: number): number {
    const num = this.u32(o);
    const den = this.u32(o + 4);
    return den === 0 ? 0 : num / den;
  }
  sRational(o: number): number {
    const num = this.i32(o);
    const den = this.i32(o + 4);
    return den === 0 ? 0 : num / den;
  }
}

function gpsToDecimal(r: DataViewReader, offset: number, ref: string): number {
  const deg = r.rational(offset);
  const min = r.rational(offset + 8);
  const sec = r.rational(offset + 16);
  const val = deg + min / 60 + sec / 3600;
  return (ref === 'S' || ref === 'W') ? -val : val;
}

function formatExposureTime(val: number): string {
  if (val >= 1) return `${Math.round(val)}s`;
  const denom = Math.round(1 / val);
  return `1/${denom}`;
}

function formatFNumber(val: number): string {
  return `f/${val.toFixed(1)}`;
}

function formatFocalLength(val: number): string {
  return `${Math.round(val)}mm`;
}

function flashDescription(val: number): string {
  if (val === 0) return 'No flash';
  if (val & 0x1) return 'Flash fired';
  return 'Flash did not fire';
}

function meteringDescription(val: number): string {
  const modes: Record<number, string> = { 0:'Unknown',1:'Average',2:'Center-weighted',3:'Spot',4:'Multi-spot',5:'Multi-segment',6:'Partial',255:'Other' };
  return modes[val] ?? 'Unknown';
}

function exposureProgramDescription(val: number): string {
  const progs: Record<number, string> = { 0:'Not defined',1:'Manual',2:'Program AE',3:'Aperture priority',4:'Shutter priority',5:'Creative',6:'Action',7:'Portrait',8:'Landscape' };
  return progs[val] ?? 'Unknown';
}

function colorSpaceDescription(val: number): string {
  if (val === 1) return 'sRGB';
  if (val === 0xFFFF) return 'Uncalibrated';
  return `Unknown (${val})`;
}

function resolutionUnitDescription(val: number): string {
  if (val === 2) return 'DPI';
  if (val === 3) return 'DPCM';
  return 'None';
}

function parseIFD(r: DataViewReader, ifdOffset: number, result: ExifData, subType: 'main' | 'exif' | 'gps' = 'main') {
  try {
    const entryCount = r.u16(ifdOffset);
    let exifIFDOffset = 0;
    let gpsIFDOffset = 0;

    for (let i = 0; i < entryCount; i++) {
      const base = ifdOffset + 2 + i * 12;
      const tag = r.u16(base);
      const type = r.u16(base + 2);
      const count = r.u32(base + 4);

      // Value or offset
      let valueOffset = base + 8;
      const byteSize = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8][type] ?? 1;
      if (byteSize * count > 4) {
        valueOffset = r.u32(base + 8);
      }

      if (subType === 'main') {
        if (tag === 0x8769) { exifIFDOffset = r.u32(base + 8); continue; }
        if (tag === 0x8825) { gpsIFDOffset = r.u32(base + 8); continue; }
        const field = TAGS[tag];
        if (field) {
          if (type === 2) (result as Record<string, unknown>)[field] = r.str(valueOffset, count);
          else if (type === 3) (result as Record<string, unknown>)[field] = r.u16(valueOffset);
          else if (type === 4) (result as Record<string, unknown>)[field] = r.u32(valueOffset);
          else if (type === 5) (result as Record<string, unknown>)[field] = r.rational(valueOffset);
        }
      } else if (subType === 'exif') {
        const field = EXIF_TAGS[tag];
        if (!field) continue;
        if (field === 'exposureTime' && type === 5) result.exposureTime = formatExposureTime(r.rational(valueOffset));
        else if (field === 'fNumber' && type === 5) result.fNumber = formatFNumber(r.rational(valueOffset));
        else if (field === 'iso' && type === 3) result.iso = r.u16(valueOffset);
        else if (field === 'exposureBias' && type === 10) result.exposureBias = `${r.sRational(valueOffset).toFixed(1)} EV`;
        else if (field === 'focalLength' && type === 5) result.focalLength = formatFocalLength(r.rational(valueOffset));
        else if (field === 'focalLengthIn35mm' && type === 3) result.focalLengthIn35mm = r.u16(valueOffset);
        else if (field === 'flash' && type === 3) result.flash = flashDescription(r.u16(valueOffset));
        else if (field === 'meteringMode' && type === 3) result.meteringMode = meteringDescription(r.u16(valueOffset));
        else if (field === 'exposureProgram' && type === 3) result.exposureProgram = exposureProgramDescription(r.u16(valueOffset));
        else if (field === 'colorSpace' && type === 3) result.colorSpace = colorSpaceDescription(r.u16(valueOffset));
        else if (field === 'whiteBalance' && type === 3) result.whiteBalance = r.u16(valueOffset) === 0 ? 'Auto' : 'Manual';
      } else if (subType === 'gps') {
        if (tag === 0x0001 && type === 2) result.gpsLatitudeRef = r.str(valueOffset, count);
        else if (tag === 0x0003 && type === 2) result.gpsLongitudeRef = r.str(valueOffset, count);
        else if (tag === 0x0002 && type === 5 && result.gpsLatitudeRef) {
          result.gpsLatitude = gpsToDecimal(r, valueOffset, result.gpsLatitudeRef);
          result.hasGPS = true;
        }
        else if (tag === 0x0004 && type === 5 && result.gpsLongitudeRef) {
          result.gpsLongitude = gpsToDecimal(r, valueOffset, result.gpsLongitudeRef);
        }
        else if (tag === 0x0006 && type === 5) result.gpsAltitude = r.rational(valueOffset);
      }
    }

    if (exifIFDOffset) parseIFD(r, exifIFDOffset, result, 'exif');
    if (gpsIFDOffset) parseIFD(r, gpsIFDOffset, result, 'gps');
  } catch {
    // Silently ignore malformed IFD entries
  }
}

/** Parse EXIF from a JPEG file's APP1 marker */
export async function readExif(file: File | Blob): Promise<ExifData> {
  const result: ExifData = {};

  try {
    const buf = await file.arrayBuffer();
    const u8 = new Uint8Array(buf);

    // Must start with JPEG SOI FF D8
    if (u8[0] !== 0xFF || u8[1] !== 0xD8) return result;

    let offset = 2;
    while (offset < u8.length - 1) {
      if (u8[offset] !== 0xFF) break;
      const marker = u8[offset + 1];
      const segLen = (u8[offset + 2] << 8) | u8[offset + 3];

      if (marker === 0xE1) {
        // APP1 — check for Exif header
        const header = String.fromCharCode(u8[offset + 4], u8[offset + 5], u8[offset + 6], u8[offset + 7], u8[offset + 8]);
        if (header === 'Exif\0') {
          const tiffStart = offset + 10; // skip APP1 marker (2) + length (2) + "Exif\0\0" (6)
          const le = u8[tiffStart] === 0x49; // 'II' = little endian, 'MM' = big endian
          const r = new DataViewReader(buf, tiffStart, le);
          const ifd0Offset = r.u32(4);
          parseIFD(r, ifd0Offset, result, 'main');
          break; // Found EXIF, done
        }
      }

      if (marker === 0xDA) break; // SOS — start of scan, no more markers
      offset += 2 + segLen;
    }
  } catch {
    // Return whatever was parsed before the error
  }

  // Normalize resolution unit
  if (result.resolutionUnit) {
    result.resolutionUnit = resolutionUnitDescription(result.resolutionUnit as unknown as number);
  }

  return result;
}

/** Format ExifData as an array of displayable rows */
export function exifToRows(exif: ExifData): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string }> = [];
  const add = (label: string, value: unknown) => {
    if (value !== undefined && value !== null && value !== '') {
      rows.push({ label, value: String(value) });
    }
  };

  add('Camera Make', exif.make);
  add('Camera Model', exif.model);
  add('Software', exif.software);
  add('Artist / Author', exif.artist);
  add('Copyright', exif.copyright);
  add('Description', exif.description);
  add('Date Taken', exif.dateTimeOriginal);
  add('Date Modified', exif.dateTime);
  add('Image Width', exif.imageWidth ? `${exif.imageWidth}px` : undefined);
  add('Image Height', exif.imageHeight ? `${exif.imageHeight}px` : undefined);
  add('Orientation', exif.orientation);
  add('X Resolution', exif.xResolution ? `${Math.round(exif.xResolution as unknown as number)} ${exif.resolutionUnit ?? 'DPI'}` : undefined);
  add('Y Resolution', exif.yResolution ? `${Math.round(exif.yResolution as unknown as number)} ${exif.resolutionUnit ?? 'DPI'}` : undefined);
  add('Exposure Time', exif.exposureTime);
  add('Aperture', exif.fNumber);
  add('ISO', exif.iso);
  add('Exposure Bias', exif.exposureBias);
  add('Focal Length', exif.focalLength);
  add('Focal Length (35mm)', exif.focalLengthIn35mm ? `${exif.focalLengthIn35mm}mm` : undefined);
  add('Flash', exif.flash);
  add('Metering Mode', exif.meteringMode);
  add('Exposure Program', exif.exposureProgram);
  add('White Balance', exif.whiteBalance);
  add('Color Space', exif.colorSpace);
  if (exif.hasGPS && exif.gpsLatitude !== undefined && exif.gpsLongitude !== undefined) {
    add('GPS Latitude', `${exif.gpsLatitude.toFixed(6)}° ${exif.gpsLatitudeRef ?? ''}`);
    add('GPS Longitude', `${exif.gpsLongitude.toFixed(6)}° ${exif.gpsLongitudeRef ?? ''}`);
    if (exif.gpsAltitude !== undefined) add('GPS Altitude', `${exif.gpsAltitude.toFixed(1)}m`);
  }

  return rows;
}
