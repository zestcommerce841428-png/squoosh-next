'use client';

import { useEffect } from 'react';
import { Box } from '@mui/material';

interface AdSenseProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
  responsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdSense({
  slot,
  format = 'auto',
  style = {},
  responsive = true,
  className = '',
}: AdSenseProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  // Only show ads in production
  if (process.env.NODE_ENV !== 'production') {
    return (
      <Box
        sx={{
          minHeight: 250,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          border: '2px dashed',
          borderColor: 'grey.300',
          borderRadius: 1,
          p: 2,
          ...style,
        }}
        className={className}
      >
        <span style={{ color: '#999', fontSize: '14px' }}>Ad Space (Dev Mode)</span>
      </Box>
    );
  }

  return (
    <Box className={className} sx={{ minHeight: 250, ...style }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-9966398482073679"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      ></ins>
    </Box>
  );
}

// Pre-configured ad components for common placements
export function HeaderAd() {
  return (
    <AdSense
      slot="1234567890" // Replace with your actual slot ID
      format="horizontal"
      style={{ minHeight: 90 }}
    />
  );
}

export function SidebarAd() {
  return (
    <AdSense
      slot="2345678901" // Replace with your actual slot ID
      format="vertical"
      style={{ minHeight: 600 }}
    />
  );
}

export function InArticleAd() {
  return (
    <AdSense
      slot="3456789012" // Replace with your actual slot ID
      format="fluid"
      style={{ minHeight: 250 }}
    />
  );
}

export function FooterAd() {
  return (
    <AdSense
      slot="4567890123" // Replace with your actual slot ID
      format="horizontal"
      style={{ minHeight: 90 }}
    />
  );
}
