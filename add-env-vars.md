# Add Environment Variables to Vercel

## Option 1: Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/naushad-alam-s-projects1/squoosh-dev/settings/environment-variables

2. Add each variable one by one:

### Variable 1: NEXT_PUBLIC_GA_ID
- **Name:** `NEXT_PUBLIC_GA_ID`
- **Value:** `G-H59FHPJ2FB`
- **Environment:** Production ✓
- **Not sensitive** (public)

### Variable 2: NEXT_PUBLIC_RECAPTCHA_SITE_KEY
- **Name:** `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- **Value:** `6Le9b8QsAAAAAOGQw66yHhmke1x0HnjbCjGZmHjW`
- **Environment:** Production ✓
- **Not sensitive** (public)

### Variable 3: RECAPTCHA_SECRET_KEY
- **Name:** `RECAPTCHA_SECRET_KEY`
- **Value:** `6Le9b8QsAAAAADYeBeZmXxisb0IK_911h2bBr27-`
- **Environment:** Production ✓
- **Sensitive** (secret)

### Variable 4: NEXT_PUBLIC_SITE_URL
- **Name:** `NEXT_PUBLIC_SITE_URL`
- **Value:** `https://zesttechsolution.cloud`
- **Environment:** Production ✓
- **Not sensitive** (public)

### Variable 5: HOSTINGER_SMTP_HOST
- **Name:** `HOSTINGER_SMTP_HOST`
- **Value:** `smtp.hostinger.com`
- **Environment:** Production ✓
- **Not sensitive**

### Variable 6: HOSTINGER_SMTP_PORT
- **Name:** `HOSTINGER_SMTP_PORT`
- **Value:** `465`
- **Environment:** Production ✓
- **Not sensitive**

### Variable 7: HOSTINGER_SMTP_USER
- **Name:** `HOSTINGER_SMTP_USER`
- **Value:** `contact@zestcommerce.in`
- **Environment:** Production ✓
- **Not sensitive**

### Variable 8: HOSTINGER_SMTP_PASS
- **Name:** `HOSTINGER_SMTP_PASS`
- **Value:** `Alija@2025`
- **Environment:** Production ✓
- **Sensitive** (secret)

3. After adding all variables, click **"Redeploy"** to apply them.

---

## Option 2: Via Vercel CLI (Batch Script)

Run this PowerShell script:

```powershell
cd ../Downloads/squoosh-dev/squoosh-dev

# Public variables (not sensitive)
echo "G-H59FHPJ2FB" | vercel env add NEXT_PUBLIC_GA_ID production
echo "6Le9b8QsAAAAAOGQw66yHhmke1x0HnjbCjGZmHjW" | vercel env add NEXT_PUBLIC_RECAPTCHA_SITE_KEY production
echo "https://zesttechsolution.cloud" | vercel env add NEXT_PUBLIC_SITE_URL production
echo "smtp.hostinger.com" | vercel env add HOSTINGER_SMTP_HOST production
echo "465" | vercel env add HOSTINGER_SMTP_PORT production
echo "contact@zestcommerce.in" | vercel env add HOSTINGER_SMTP_USER production

# Sensitive variables
echo "6Le9b8QsAAAAADYeBeZmXxisb0IK_911h2bBr27-" | vercel env add RECAPTCHA_SECRET_KEY production
echo "Alija@2025" | vercel env add HOSTINGER_SMTP_PASS production

# Redeploy to apply changes
vercel --prod
```

---

## Quick Copy-Paste for Dashboard

```
NEXT_PUBLIC_GA_ID=G-H59FHPJ2FB
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Le9b8QsAAAAAOGQw66yHhmke1x0HnjbCjGZmHjW
RECAPTCHA_SECRET_KEY=6Le9b8QsAAAAADYeBeZmXxisb0IK_911h2bBr27-
NEXT_PUBLIC_SITE_URL=https://zesttechsolution.cloud
HOSTINGER_SMTP_HOST=smtp.hostinger.com
HOSTINGER_SMTP_PORT=465
HOSTINGER_SMTP_USER=contact@zestcommerce.in
HOSTINGER_SMTP_PASS=Alija@2025
```

---

## After Adding Variables

Once all environment variables are added, redeploy the project:

```bash
cd ../Downloads/squoosh-dev/squoosh-dev
vercel --prod
```

This will rebuild the application with all the environment variables properly configured.

---

## Verify Configuration

After deployment completes, test these features:

1. **Google Analytics** - Check if GA is tracking visits at https://analytics.google.com
2. **Contact Form** - Submit a message at https://zesttechsolution.cloud/contact
3. **reCAPTCHA** - Verify invisible reCAPTCHA is working on contact form
4. **Email Delivery** - Check if emails are received at contact@zestcommerce.in

Your application is now deployed at:
- **Production URL:** https://zesttechsolution.cloud
- **Vercel Dashboard:** https://vercel.com/naushad-alam-s-projects1/squoosh-dev
