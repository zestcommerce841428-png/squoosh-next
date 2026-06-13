/**
 * IndexedDB-backed session history.
 * Stores the last 100 compression jobs, surviving page refreshes.
 */

const DB_NAME = 'squoosh-next';
const DB_VERSION = 1;
const STORE = 'history';

export interface HistoryRecord {
  id?: number;
  filename: string;
  originalSize: number;
  compressedSize: number;
  savings: string;         // e.g. "-42.3%"
  format: string;          // e.g. "image/jpeg"
  codec: string;           // e.g. "MozJPEG"
  quality: number;
  width: number;
  height: number;
  timestamp: number;       // Date.now()
  thumbnailDataUrl?: string; // 64×64 preview
}

let _db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    req.onsuccess = () => { _db = req.result; resolve(req.result); };
    req.onerror = () => reject(req.error);
  });
}

export async function addHistoryRecord(record: Omit<HistoryRecord, 'id'>): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).add(record);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
    // Prune to 100 most recent
    tx.oncomplete = () => pruneOldRecords(db);
  });
}

export async function getHistoryRecords(limit = 50): Promise<HistoryRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const idx = tx.objectStore(STORE).index('timestamp');
    const req = idx.openCursor(null, 'prev');
    const results: HistoryRecord[] = [];
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor && results.length < limit) {
        results.push(cursor.value as HistoryRecord);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function clearHistory(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function pruneOldRecords(db: IDBDatabase): Promise<void> {
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const countReq = store.count();
    countReq.onsuccess = () => {
      const excess = countReq.result - 100;
      if (excess <= 0) { resolve(); return; }
      // Delete oldest records
      const idx = store.index('timestamp');
      const cursor = idx.openCursor(null, 'next');
      let deleted = 0;
      cursor.onsuccess = () => {
        const c = cursor.result;
        if (c && deleted < excess) {
          c.delete();
          deleted++;
          c.continue();
        } else {
          resolve();
        }
      };
    };
  });
}

/** Generate a 64×64 thumbnail data URL from a canvas */
export function generateThumbnail(canvas: HTMLCanvasElement): string {
  const thumb = document.createElement('canvas');
  const size = 64;
  thumb.width = size;
  thumb.height = size;
  const ctx = thumb.getContext('2d')!;
  const { width, height } = canvas;
  const scale = Math.min(size / width, size / height);
  const sw = Math.round(width * scale);
  const sh = Math.round(height * scale);
  ctx.drawImage(canvas, (size - sw) / 2, (size - sh) / 2, sw, sh);
  return thumb.toDataURL('image/jpeg', 0.6);
}

/** Export all history as CSV string */
export async function exportHistoryCSV(): Promise<string> {
  const records = await getHistoryRecords(1000);
  const header = 'Timestamp,Filename,Original (bytes),Compressed (bytes),Savings,Format,Codec,Quality,Width,Height';
  const rows = records.map(r =>
    [
      new Date(r.timestamp).toISOString(),
      `"${r.filename}"`,
      r.originalSize,
      r.compressedSize,
      r.savings,
      r.format,
      r.codec,
      r.quality,
      r.width,
      r.height,
    ].join(',')
  );
  return [header, ...rows].join('\n');
}
