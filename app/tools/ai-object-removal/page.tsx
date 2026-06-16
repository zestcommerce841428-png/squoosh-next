'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, Stack, Alert, Typography, Box, Button } from '@mui/material';
import { ToolLayout, UploadArea } from '@/components/ToolComponents';
import { fileToImage, canvasToBlob, downloadBlob, replaceExt } from '@/lib/imageTools';

interface Rect { x: number; y: number; w: number; h: number; }

export default function AiObjectRemovalPage() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ sx: number; sy: number } | null>(null);
  const sel = useRef<Rect | null>(null);
  const baseImage = useRef<ImageData | null>(null);

  const loadToCanvas = useCallback(async (f: File) => {
    const img = await fileToImage(f);
    const canvas = canvasRef.current!;
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    baseImage.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }, []);

  const handleFileSelect = async (f: File) => {
    if (!f.type.startsWith('image/')) { setError('Please choose an image.'); return; }
    setError(null); setFile(f);
    // canvas exists after render; defer
    setTimeout(() => loadToCanvas(f), 0);
  };

  const toCanvasCoords = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const redraw = () => {
    const ctx = canvasRef.current!.getContext('2d')!;
    if (baseImage.current) ctx.putImageData(baseImage.current, 0, 0);
    if (sel.current) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = Math.max(2, canvasRef.current!.width / 300);
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(sel.current.x, sel.current.y, sel.current.w, sel.current.h);
      ctx.setLineDash([]);
    }
  };

  const onDown = (e: React.PointerEvent) => {
    const { x, y } = toCanvasCoords(e);
    drag.current = { sx: x, sy: y };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const { x, y } = toCanvasCoords(e);
    sel.current = {
      x: Math.min(drag.current.sx, x),
      y: Math.min(drag.current.sy, y),
      w: Math.abs(x - drag.current.sx),
      h: Math.abs(y - drag.current.sy),
    };
    redraw();
  };
  const onUp = () => {
    drag.current = null;
    setHasSelection(!!sel.current && sel.current.w > 2 && sel.current.h > 2);
  };

  // Inpaint selection by horizontally interpolating between the pixels just
  // outside the left and right edges of the selection (good for simple/uniform backgrounds).
  const removeSelection = () => {
    const data = baseImage.current;
    const s = sel.current;
    if (!data || !s) return;
    const { width: W, data: d } = data;
    const x0 = Math.max(1, Math.round(s.x));
    const y0 = Math.max(0, Math.round(s.y));
    const x1 = Math.min(W - 2, Math.round(s.x + s.w));
    const y1 = Math.min(data.height - 1, Math.round(s.y + s.h));
    for (let y = y0; y <= y1; y++) {
      const leftO = (y * W + (x0 - 1)) * 4;
      const rightO = (y * W + (x1 + 1)) * 4;
      const span = x1 - x0 || 1;
      for (let x = x0; x <= x1; x++) {
        const t = (x - x0) / span;
        const o = (y * W + x) * 4;
        for (let c = 0; c < 3; c++) d[o + c] = d[leftO + c] * (1 - t) + d[rightO + c] * t;
        d[o + 3] = 255;
      }
    }
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.putImageData(data, 0, 0);
    sel.current = null;
    setHasSelection(false);
  };

  const download = async () => {
    const blob = await canvasToBlob(canvasRef.current!, 'image/png');
    downloadBlob(blob, replaceExt(file!.name, '-removed.png'));
  };

  const reset = () => {
    setFile(null); setError(null); setHasSelection(false);
    sel.current = null; baseImage.current = null;
  };

  return (
    <ToolLayout
      title="Object Remover"
      description="Drag a box over an unwanted object and remove it — the area is filled from its surroundings. Works best on simple/uniform backgrounds. 100% local."
      features={['Drag to Select', 'Content Fill', 'Multiple Removals', 'PNG Export']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          <Alert severity="info">Drag a rectangle over the object you want to remove, then press <strong>Remove selection</strong>. Repeat as needed.</Alert>
          <Box sx={{ textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1, p: 1 }}>
            <canvas
              ref={canvasRef}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerLeave={onUp}
              style={{ maxWidth: '100%', maxHeight: 460, objectFit: 'contain', cursor: 'crosshair', touchAction: 'none' }}
            />
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>Reset</Button>
            <Button variant="contained" onClick={removeSelection} disabled={!hasSelection} fullWidth>Remove selection</Button>
            <Button variant="contained" color="success" onClick={download} fullWidth>Download PNG</Button>
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
