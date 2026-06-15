import { NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertHuman } from '@/lib/recaptchaVerify';

export const runtime = 'nodejs';

function hashCode(code: string, email: string) {
  return crypto.createHash('sha256').update(`${code}:${email}`).digest('hex');
}

export async function POST(request: Request) {
  try {
    const { email, recaptchaToken } = await request.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }
    if (!(await assertHuman(recaptchaToken, 'login_otp'))) {
      return NextResponse.json({ error: 'Failed verification. Please try again.' }, { status: 403 });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const admin = createAdminClient();
    await admin.from('otp_codes').insert({
      email: email.toLowerCase(),
      code_hash: hashCode(code, email.toLowerCase()),
      purpose: 'login',
      expires_at: expires,
    });

    const host = process.env.HOSTINGER_SMTP_HOST;
    if (host && process.env.HOSTINGER_SMTP_USER) {
      const transporter = nodemailer.createTransport({
        host,
        port: Number(process.env.HOSTINGER_SMTP_PORT || 465),
        secure: Number(process.env.HOSTINGER_SMTP_PORT || 465) === 465,
        auth: { user: process.env.HOSTINGER_SMTP_USER, pass: process.env.HOSTINGER_SMTP_PASS },
      });
      await transporter.sendMail({
        from: `"Squoosh Next" <${process.env.HOSTINGER_SMTP_USER}>`,
        to: email,
        subject: 'Your Squoosh Next login code',
        text: `Your one-time login code is ${code}. It expires in 10 minutes.`,
        html: `<div style="font-family:Arial,sans-serif"><h2>Your login code</h2><p style="font-size:28px;font-weight:bold;letter-spacing:4px">${code}</p><p>This code expires in 10 minutes. If you didn't request it, ignore this email.</p></div>`,
      });
    } else {
      // SMTP not configured yet — log for local dev only.
      console.warn(`[send-otp] SMTP not configured. Code for ${email}: ${code}`);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Could not send code.' }, { status: 500 });
  }
}
