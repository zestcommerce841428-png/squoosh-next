/**
 * Google Analytics 4 Helper Functions
 * Client-side event tracking with type safety
 */

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window === 'undefined' || !GA_TRACKING_ID) return;
  
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', GA_TRACKING_ID, {
    page_path: window.location.pathname,
  });
};

// Page view tracking
export const pageview = (url: string) => {
  if (typeof window === 'undefined' || !GA_TRACKING_ID) return;
  
  (window as any).gtag?.('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// Custom event tracking
export const event = (action: string, params?: Record<string, any>) => {
  if (typeof window === 'undefined' || !GA_TRACKING_ID) return;
  
  (window as any).gtag?.('event', action, params);
};

// Predefined events for Squoosh Next
export const trackImageCompression = (params: {
  originalSize: number;
  compressedSize: number;
  format: string;
  quality: number;
  savings: number;
}) => {
  event('image_compression', {
    event_category: 'Compression',
    original_size: params.originalSize,
    compressed_size: params.compressedSize,
    output_format: params.format,
    quality: params.quality,
    savings_percent: params.savings,
  });
};

export const trackBatchCompression = (params: {
  fileCount: number;
  totalOriginalSize: number;
  totalCompressedSize: number;
  format: string;
}) => {
  event('batch_compression', {
    event_category: 'Batch',
    file_count: params.fileCount,
    total_original_size: params.totalOriginalSize,
    total_compressed_size: params.totalCompressedSize,
    output_format: params.format,
  });
};

export const trackFormatConversion = (params: {
  inputFormat: string;
  outputFormat: string;
  fileSize: number;
}) => {
  event('format_conversion', {
    event_category: 'Conversion',
    input_format: params.inputFormat,
    output_format: params.outputFormat,
    file_size: params.fileSize,
  });
};

export const trackFeatureUsage = (featureName: string, params?: Record<string, any>) => {
  event('feature_usage', {
    event_category: 'Feature',
    feature_name: featureName,
    ...params,
  });
};

export const trackDownload = (params: {
  format: string;
  fileSize: number;
  compressionRatio: number;
}) => {
  event('file_download', {
    event_category: 'Download',
    format: params.format,
    file_size: params.fileSize,
    compression_ratio: params.compressionRatio,
  });
};

export const trackError = (errorMessage: string, errorContext?: string) => {
  event('error', {
    event_category: 'Error',
    error_message: errorMessage,
    error_context: errorContext,
  });
};

// Extend Window interface for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
