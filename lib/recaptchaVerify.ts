import { verifyReCaptchaToken } from './recaptcha';

/**
 * Server-side reCAPTCHA v3 gate. Returns true when the request looks human.
 * If no secret key is configured, it fails open (returns true) so the app
 * keeps working in development before keys are provisioned.
 */
export async function assertHuman(token: string | undefined | null, expectedAction?: string, minScore = 0.5): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true; // not configured yet
  if (!token) return false;

  try {
    const result = await verifyReCaptchaToken(token, secret);
    if (!result.success) return false;
    if (expectedAction && result.action && result.action !== expectedAction) return false;
    if (typeof result.score === 'number' && result.score < minScore) return false;
    return true;
  } catch {
    return false;
  }
}
