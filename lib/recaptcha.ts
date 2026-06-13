/**
 * Google reCAPTCHA v3 Helper Functions
 * Invisible CAPTCHA verification for forms
 */

export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

// Load reCAPTCHA script
export const loadReCaptcha = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !RECAPTCHA_SITE_KEY) {
      reject(new Error('reCAPTCHA not configured'));
      return;
    }

    // Check if already loaded
    if ((window as any).grecaptcha) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // Wait for grecaptcha to be ready
      (window as any).grecaptcha.ready(() => {
        resolve();
      });
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load reCAPTCHA'));
    };

    document.head.appendChild(script);
  });
};

// Execute reCAPTCHA verification
export const executeReCaptcha = async (action: string = 'submit'): Promise<string> => {
  if (typeof window === 'undefined' || !RECAPTCHA_SITE_KEY) {
    throw new Error('reCAPTCHA not configured');
  }

  try {
    await loadReCaptcha();
    
    const token = await (window as any).grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
    return token;
  } catch (error) {
    console.error('reCAPTCHA execution failed:', error);
    throw error;
  }
};

// Verify reCAPTCHA token on server-side (API route example)
export const verifyReCaptchaToken = async (token: string, secretKey: string): Promise<{
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}> => {
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('reCAPTCHA verification failed:', error);
    throw error;
  }
};

// Extend Window interface for grecaptcha
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      render: (container: string | HTMLElement, parameters: any) => number;
      reset: (widgetId?: number) => void;
    };
  }
}
