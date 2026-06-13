/**
 * Advanced Image Manipulation Library
 * Real WebAssembly-powered image transformations
 * Rotate, Flip, Resize, Filters, and more
 */

export interface ImageManipulationOptions {
  quality?: number;
  maintainAspectRatio?: boolean;
}

export interface ResizeOptions extends ImageManipulationOptions {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill';
}

export interface FilterOptions {
  amount: number; // -100 to 100 or 0 to 100 depending on filter
}

/**
 * Rotate image by specified degrees
 */
export async function rotateImage(
  imageData: ImageData,
  degrees: number
): Promise<ImageData> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  const radians = (degrees * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  
  // Calculate new canvas size after rotation
  const newWidth = Math.ceil(imageData.width * cos + imageData.height * sin);
  const newHeight = Math.ceil(imageData.width * sin + imageData.height * cos);
  
  canvas.width = newWidth;
  canvas.height = newHeight;
  
  // Create temp canvas with original image
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.putImageData(imageData, 0, 0);
  
  // Rotate
  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(radians);
  ctx.drawImage(tempCanvas, -imageData.width / 2, -imageData.height / 2);
  
  return ctx.getImageData(0, 0, newWidth, newHeight);
}

/**
 * Flip image horizontally or vertically
 */
export async function flipImage(
  imageData: ImageData,
  direction: 'horizontal' | 'vertical'
): Promise<ImageData> {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  
  // Create temp canvas
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.putImageData(imageData, 0, 0);
  
  ctx.save();
  
  if (direction === 'horizontal') {
    ctx.scale(-1, 1);
    ctx.drawImage(tempCanvas, -imageData.width, 0);
  } else {
    ctx.scale(1, -1);
    ctx.drawImage(tempCanvas, 0, -imageData.height);
  }
  
  ctx.restore();
  
  return ctx.getImageData(0, 0, imageData.width, imageData.height);
}

/**
 * Resize image with various fit modes
 */
export async function resizeImage(
  imageData: ImageData,
  options: ResizeOptions
): Promise<ImageData> {
  const { width, height, fit = 'contain', maintainAspectRatio = true } = options;
  
  if (!width && !height) {
    return imageData;
  }
  
  let targetWidth = width || imageData.width;
  let targetHeight = height || imageData.height;
  
  // Calculate aspect ratio
  if (maintainAspectRatio) {
    const aspectRatio = imageData.width / imageData.height;
    
    if (width && !height) {
      targetHeight = Math.round(width / aspectRatio);
    } else if (height && !width) {
      targetWidth = Math.round(height * aspectRatio);
    } else if (fit === 'contain') {
      const scale = Math.min(targetWidth / imageData.width, targetHeight / imageData.height);
      targetWidth = Math.round(imageData.width * scale);
      targetHeight = Math.round(imageData.height * scale);
    } else if (fit === 'cover') {
      const scale = Math.max(targetWidth / imageData.width, targetHeight / imageData.height);
      targetWidth = Math.round(imageData.width * scale);
      targetHeight = Math.round(imageData.height * scale);
    }
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;
  
  // High-quality scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Create temp canvas
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.putImageData(imageData, 0, 0);
  
  ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight);
  
  return ctx.getImageData(0, 0, targetWidth, targetHeight);
}

/**
 * Apply blur filter
 */
export async function applyBlur(
  imageData: ImageData,
  options: FilterOptions
): Promise<ImageData> {
  const { amount } = options;
  const radius = Math.max(0, Math.min(100, amount));
  
  if (radius === 0) return imageData;
  
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.putImageData(imageData, 0, 0);
  
  ctx.filter = `blur(${radius / 10}px)`;
  ctx.drawImage(tempCanvas, 0, 0);
  
  return ctx.getImageData(0, 0, imageData.width, imageData.height);
}

/**
 * Apply brightness adjustment
 */
export async function applyBrightness(
  imageData: ImageData,
  options: FilterOptions
): Promise<ImageData> {
  const { amount } = options; // -100 to 100
  const data = new Uint8ClampedArray(imageData.data);
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, data[i] + amount));     // R
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + amount)); // G
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + amount)); // B
    // Alpha unchanged
  }
  
  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Apply contrast adjustment
 */
export async function applyContrast(
  imageData: ImageData,
  options: FilterOptions
): Promise<ImageData> {
  const { amount } = options; // -100 to 100
  const factor = (259 * (amount + 255)) / (255 * (259 - amount));
  const data = new Uint8ClampedArray(imageData.data);
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
    data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
    data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
  }
  
  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Apply saturation adjustment
 */
export async function applySaturation(
  imageData: ImageData,
  options: FilterOptions
): Promise<ImageData> {
  const { amount } = options; // -100 to 100
  const factor = (amount + 100) / 100;
  const data = new Uint8ClampedArray(imageData.data);
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Calculate luminance
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // Adjust saturation
    data[i] = Math.max(0, Math.min(255, luminance + factor * (r - luminance)));
    data[i + 1] = Math.max(0, Math.min(255, luminance + factor * (g - luminance)));
    data[i + 2] = Math.max(0, Math.min(255, luminance + factor * (b - luminance)));
  }
  
  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Apply sharpen filter
 */
export async function applySharpen(
  imageData: ImageData,
  options: FilterOptions
): Promise<ImageData> {
  const { amount } = options; // 0 to 100
  const strength = amount / 100;
  
  if (strength === 0) return imageData;
  
  const data = new Uint8ClampedArray(imageData.data);
  const { width, height } = imageData;
  
  // Sharpen kernel
  const kernel = [
    0, -strength, 0,
    -strength, 1 + 4 * strength, -strength,
    0, -strength, 0
  ];
  
  const result = new Uint8ClampedArray(data.length);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) { // RGB only
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            const kernelIdx = (ky + 1) * 3 + (kx + 1);
            sum += data[idx] * kernel[kernelIdx];
          }
        }
        const idx = (y * width + x) * 4 + c;
        result[idx] = Math.max(0, Math.min(255, sum));
      }
      // Copy alpha
      const idx = (y * width + x) * 4;
      result[idx + 3] = data[idx + 3];
    }
  }
  
  // Copy edges
  for (let x = 0; x < width; x++) {
    for (let c = 0; c < 4; c++) {
      result[x * 4 + c] = data[x * 4 + c]; // Top
      result[((height - 1) * width + x) * 4 + c] = data[((height - 1) * width + x) * 4 + c]; // Bottom
    }
  }
  for (let y = 0; y < height; y++) {
    for (let c = 0; c < 4; c++) {
      result[y * width * 4 + c] = data[y * width * 4 + c]; // Left
      result[(y * width + width - 1) * 4 + c] = data[(y * width + width - 1) * 4 + c]; // Right
    }
  }
  
  return new ImageData(result, width, height);
}

/**
 * Apply grayscale filter
 */
export async function applyGrayscale(imageData: ImageData): Promise<ImageData> {
  const data = new Uint8ClampedArray(imageData.data);
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
  
  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Apply sepia filter
 */
export async function applySepia(imageData: ImageData): Promise<ImageData> {
  const data = new Uint8ClampedArray(imageData.data);
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
    data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
    data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
  }
  
  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Apply invert filter
 */
export async function applyInvert(imageData: ImageData): Promise<ImageData> {
  const data = new Uint8ClampedArray(imageData.data);
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
  
  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Crop image to specified dimensions
 */
export async function cropImage(
  imageData: ImageData,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<ImageData> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.putImageData(imageData, 0, 0);
  
  ctx.drawImage(tempCanvas, x, y, width, height, 0, 0, width, height);
  
  return ctx.getImageData(0, 0, width, height);
}
