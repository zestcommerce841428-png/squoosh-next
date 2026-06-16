import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { verifyReCaptchaToken } from '../../../lib/recaptcha';
import { SITE_URL, SITE_DOMAIN } from '../../../lib/siteConfig';

// Rate limiting map (in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Simple rate limiting function
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }

  if (limit.count >= 3) {
    return false; // Max 3 requests per minute
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, email, subject, message, recaptchaToken } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address.' },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA token
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret && recaptchaToken) {
      const isValid = await verifyReCaptchaToken(recaptchaToken, recaptchaSecret);
      
      if (!isValid) {
        return NextResponse.json(
          { error: 'reCAPTCHA verification failed. Please try again.' },
          { status: 400 }
        );
      }
    }

    // Configure Hostinger SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.HOSTINGER_SMTP_HOST || 'smtp.hostinger.com',
      port: parseInt(process.env.HOSTINGER_SMTP_PORT || '465'),
      secure: true, // Use SSL
      auth: {
        user: process.env.HOSTINGER_SMTP_USER,
        pass: process.env.HOSTINGER_SMTP_PASS,
      },
    });

    // Verify transporter configuration
    await transporter.verify();

    // Email to admin (you)
    const adminMailOptions = {
      from: `"Squoosh Next Contact Form" <${process.env.HOSTINGER_SMTP_USER}>`,
      to: process.env.HOSTINGER_SMTP_USER, // Your Hostinger email
      replyTo: email,
      subject: `🔔 New Contact Form Submission: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #667eea; margin-bottom: 5px; display: block; }
            .value { padding: 10px; background: #f5f5f5; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📧 New Contact Form Submission</h2>
              <p>Squoosh Next - Zest Tech Solution</p>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">👤 Name:</span>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <span class="label">✉️ Email:</span>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              <div class="field">
                <span class="label">📋 Subject:</span>
                <div class="value">${subject}</div>
              </div>
              <div class="field">
                <span class="label">💬 Message:</span>
                <div class="value">${message.replace(/\n/g, '<br>')}</div>
              </div>
              <div class="field">
                <span class="label">🌐 IP Address:</span>
                <div class="value">${ip}</div>
              </div>
              <div class="field">
                <span class="label">⏰ Received:</span>
                <div class="value">${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST</div>
              </div>
            </div>
            <div class="footer">
              <p>This email was sent from the contact form at ${SITE_DOMAIN}</p>
              <p>Reply to this email to respond directly to ${email}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Auto-reply email to user
    const userMailOptions = {
      from: `"Naushad Alam - Zest Tech Solution" <${process.env.HOSTINGER_SMTP_USER}>`,
      to: email,
      subject: `✅ We received your message: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You, ${name}!</h1>
              <p>We've received your message</p>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Thank you for reaching out to us through Squoosh Next. We've received your message and will get back to you as soon as possible.</p>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #666;"><strong>Your message:</strong></p>
                <p style="margin: 10px 0 0 0;">${message.replace(/\n/g, '<br>')}</p>
              </div>

              <p>Our typical response time is within 24 hours during business days (Monday-Friday, 9 AM - 6 PM IST).</p>
              
              <p>In the meantime, feel free to explore more features of Squoosh Next:</p>
              <a href="${SITE_URL}/compress" class="button">Start Compressing Images</a>

              <div class="footer">
                <p><strong>Naushad Alam</strong><br>
                Lead Developer & Founder<br>
                Zest Tech Solution</p>
                <p>
                  📧 <a href="mailto:contact@zestcommerce.in">contact@zestcommerce.in</a><br>
                  📱 <a href="tel:+917492068998">+91 74920 68998</a><br>
                  🌐 <a href="${SITE_URL}">${SITE_DOMAIN}</a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions),
    ]);

    return NextResponse.json(
      { 
        success: true,
        message: 'Thank you for your message! We will get back to you soon.' 
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Contact form error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send message. Please try again or email us directly at contact@zestcommerce.in',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
