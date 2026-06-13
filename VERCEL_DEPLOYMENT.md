# 🚀 Vercel Deployment Guide with Environment Variables

## Step-by-Step: Deploy Squoosh Next to Vercel

---

## 📋 REQUIRED ENVIRONMENT VARIABLES FOR VERCEL

### ⚠️ IMPORTANT: Add These in Vercel Dashboard (NOT GitHub)

When deploying to Vercel, you need to add these environment variables in the Vercel project settings:

```env
# Application Environment Variables
NEXT_PUBLIC_GA_ID=G-H59FHPJ2FB
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Le9b8QsAAAAAOGQw66yHhmke1x0HnjbCjGZmHjW
RECAPTCHA_SECRET_KEY=6Le9b8QsAAAAADYeBeZmXxisb0IK_911h2bBr27-
NEXT_PUBLIC_SITE_URL=https://zesttechsolution.cloud
HOSTINGER_SMTP_HOST=smtp.hostinger.com
HOSTINGER_SMTP_PORT=465
HOSTINGER_SMTP_USER=contact@zestcommerce.in
HOSTINGER_SMTP_PASS=Alija@2025
```

**Note:** You do NOT need `VERCEL_TOKEN`, `VERCEL_ORG_ID`, or `VERCEL_PROJECT_ID` for manual deployment through Vercel dashboard. These are only needed for GitHub Actions CI/CD (which is optional).

---

## 🎯 DEPLOYMENT STEPS

### Option 1: Deploy via Vercel Dashboard (Recommended - No GitHub Required)

#### Step 1: Prepare Project (1 minute)

```bash
cd "C:\Users\anony\Downloads\squoosh-dev\squoosh-dev"

# Make sure build works locally
npm run build
```

#### Step 2: Go to Vercel (2 minutes)

1. Visit [vercel.com](https://vercel.com)
2. Click **"Log In"** or **"Sign Up"**
3. Sign in with Email, GitHub, GitLab, or Bitbucket

#### Step 3: Create New Project (2 minutes)

1. Click **"Add New..."** button (top right)
2. Select **"Project"**
3. You'll see options:
   - **Import Git Repository** (if you pushed to GitHub)
   - **Deploy from CLI** (we'll use this)

#### Step 4: Deploy Using Vercel CLI (5 minutes)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

**During deployment, Vercel CLI will ask:**

1. **Set up and deploy?** → Yes
2. **Which scope?** → Select your account
3. **Link to existing project?** → No
4. **What's your project's name?** → `squoosh-next`
5. **In which directory is your code located?** → `./`
6. **Want to override the settings?** → No

**⚠️ IMPORTANT: After CLI deployment, you MUST add environment variables in the dashboard!**

#### Step 5: Add Environment Variables in Vercel Dashboard (5 minutes)

1. **Go to Vercel Dashboard:** [vercel.com/dashboard](https://vercel.com/dashboard)

2. **Select your project:** Click on `squoosh-next`

3. **Go to Settings:** Click **Settings** tab (top navigation)

4. **Navigate to Environment Variables:** 
   - In left sidebar, click **"Environment Variables"**

5. **Add Each Variable:**
   - Click **"Add New"** button
   - For each variable below:

**Variable 1: Google Analytics**
```
Name: NEXT_PUBLIC_GA_ID
Value: G-H59FHPJ2FB
Environment: ☑ Production ☑ Preview ☑ Development
```
Click **"Save"**

**Variable 2: reCAPTCHA Site Key**
```
Name: NEXT_PUBLIC_RECAPTCHA_SITE_KEY
Value: 6Le9b8QsAAAAAOGQw66yHhmke1x0HnjbCjGZmHjW
Environment: ☑ Production ☑ Preview ☑ Development
```
Click **"Save"**

**Variable 3: reCAPTCHA Secret Key**
```
Name: RECAPTCHA_SECRET_KEY
Value: 6Le9b8QsAAAAADYeBeZmXxisb0IK_911h2bBr27-
Environment: ☑ Production ☑ Preview ☑ Development
```
Click **"Save"**

**Variable 4: Site URL**
```
Name: NEXT_PUBLIC_SITE_URL
Value: https://zesttechsolution.cloud
Environment: ☑ Production ☑ Preview ☑ Development
```
Click **"Save"**

**Variable 5: SMTP Host**
```
Name: HOSTINGER_SMTP_HOST
Value: smtp.hostinger.com
Environment: ☑ Production ☑ Preview ☑ Development
```
Click **"Save"**

**Variable 6: SMTP Port**
```
Name: HOSTINGER_SMTP_PORT
Value: 465
Environment: ☑ Production ☑ Preview ☑ Development
```
Click **"Save"**

**Variable 7: SMTP User**
```
Name: HOSTINGER_SMTP_USER
Value: contact@zestcommerce.in
Environment: ☑ Production ☑ Preview ☑ Development
```
Click **"Save"**

**Variable 8: SMTP Password**
```
Name: HOSTINGER_SMTP_PASS
Value: Alija@2025
Environment: ☑ Production ☑ Preview ☑ Development
```
Click **"Save"**

#### Step 6: Redeploy with Environment Variables (2 minutes)

After adding all environment variables:

1. **Go to Deployments tab**
2. **Click the ⋯ (three dots)** on the latest deployment
3. **Click "Redeploy"**
4. **Check "Use existing Build Cache"** (optional)
5. **Click "Redeploy"**

**OR** redeploy from CLI:
```bash
vercel --prod
```

---

## 🌐 Configure Custom Domain

### Step 1: Add Domain in Vercel (2 minutes)

1. In your project, go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter: `zesttechsolution.cloud`
4. Click **"Add"**
5. Vercel will show you DNS records to add

### Step 2: Update DNS at Your Domain Registrar (5 minutes)

Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add:

**A Record (for root domain):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto or 3600
```

**CNAME Record (for www subdomain):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto or 3600
```

### Step 3: Wait for DNS Propagation (10-30 minutes)

- Check status: [dnschecker.org](https://dnschecker.org)
- Vercel will automatically issue SSL certificate
- You'll receive email when domain is active

---

## 🔐 Update reCAPTCHA Domain (2 minutes)

1. Go to [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
2. Click on your site key: `6Le9b8QsAAAAAOGQw66yHhmke1x0HnjbCjGZmHjW`
3. Under "Domains", add:
   ```
   zesttechsolution.cloud
   www.zesttechsolution.cloud
   ```
4. Also add Vercel's preview domain (e.g., `squoosh-next.vercel.app`)
5. Click **"Save"**

---

## ✅ VERIFY DEPLOYMENT

### Check These URLs:

1. **Home Page:**
   ```
   https://zesttechsolution.cloud
   ```

2. **Compression Tool:**
   ```
   https://zesttechsolution.cloud/compress
   ```

3. **Contact Form:**
   ```
   https://zesttechsolution.cloud/contact
   ```

4. **API Endpoint:**
   ```
   https://zesttechsolution.cloud/api/contact
   ```

### Test All Features:

- [ ] Website loads successfully
- [ ] HTTPS certificate is active
- [ ] Language switcher works (top right)
- [ ] Image compression functional
- [ ] Contact form submits successfully
- [ ] Email received at contact@zestcommerce.in
- [ ] Auto-reply received
- [ ] Google Analytics tracking (check Real-Time)
- [ ] Mobile responsive
- [ ] All pages accessible

---

## 📊 Monitor Your Application

### Vercel Dashboard

**URL:** [vercel.com/dashboard](https://vercel.com/dashboard)

**Monitor:**
- **Analytics:** Pageviews, unique visitors
- **Speed Insights:** Core Web Vitals
- **Logs:** Real-time logs, errors
- **Deployments:** History, rollbacks
- **Usage:** Bandwidth, function executions

### Google Analytics

**URL:** [analytics.google.com](https://analytics.google.com)

**Track:**
- Real-time visitors
- User behavior
- Traffic sources
- Custom events (compressions, downloads)
- Geographic data

### Email Inbox

**Check:** contact@zestcommerce.in

**Monitor:**
- Contact form submissions
- User inquiries
- System notifications

---

## 🔄 Update Deployment (When Making Changes)

### Option 1: Redeploy from CLI

```bash
cd "C:\Users\anony\Downloads\squoosh-dev\squoosh-dev"

# Make your changes
# ...

# Redeploy
vercel --prod
```

### Option 2: Connect GitHub (For Auto-Deployment)

If you want automatic deployments on git push:

1. Push your code to GitHub (see main instructions)
2. In Vercel dashboard: Settings → Git
3. Click "Connect Git Repository"
4. Select your repository
5. Click "Connect"

Now every push to `main` branch will auto-deploy!

---

## ⚠️ IMPORTANT NOTES

### Environment Variables

- **Added in Vercel Dashboard:** ✅ This is correct
- **NOT in GitHub:** ✅ Secrets stay secure
- **NOT committed to Git:** ✅ .env.local is gitignored

### Security

- ✅ Never commit `.env.local` to Git
- ✅ Environment variables are encrypted in Vercel
- ✅ Only accessible during build/runtime
- ✅ Not visible in client-side code (except NEXT_PUBLIC_* vars)

### Domains

- ✅ Add both root domain and www subdomain
- ✅ Vercel handles SSL automatically
- ✅ Redirects are configured automatically
- ✅ CDN caching is automatic

---

## 🆘 TROUBLESHOOTING

### Build Fails

**Error:** "Missing environment variables"
**Solution:** Make sure all 8 variables are added in Vercel dashboard, then redeploy

**Error:** "Build timeout"
**Solution:** Increase timeout in Project Settings → General → Build & Development Settings

### Domain Not Working

**Error:** "Domain not found"
**Solution:** 
1. Check DNS records are correct
2. Wait for DNS propagation (up to 48 hours)
3. Use [dnschecker.org](https://dnschecker.org) to verify

### Email Not Sending

**Error:** "SMTP connection failed"
**Solution:**
1. Verify Hostinger email credentials
2. Check SMTP port is 465
3. Ensure email account is active
4. Check Vercel function logs for errors

### reCAPTCHA Errors

**Error:** "reCAPTCHA verification failed"
**Solution:**
1. Add domain in reCAPTCHA admin console
2. Verify site key is correct
3. Check secret key is added in Vercel
4. Wait a few minutes after adding domain

---

## 📞 SUPPORT

**If you need help:**

1. **Check Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
2. **Vercel Support:** [vercel.com/support](https://vercel.com/support)
3. **Project Documentation:** See `DEPLOYMENT.md` in your project
4. **Developer Contact:** Naushad Alam - contact@zestcommerce.in

---

## 🎉 SUCCESS CHECKLIST

After deployment, you should have:

- [ ] ✅ Website live at zesttechsolution.cloud
- [ ] ✅ HTTPS certificate active (green padlock)
- [ ] ✅ All 8 environment variables added in Vercel
- [ ] ✅ Custom domain configured
- [ ] ✅ DNS propagated
- [ ] ✅ reCAPTCHA domain added
- [ ] ✅ Contact form sending emails
- [ ] ✅ Google Analytics tracking
- [ ] ✅ Language switcher working
- [ ] ✅ Image compression functional
- [ ] ✅ Mobile responsive
- [ ] ✅ Lighthouse score 95+

---

## 🚀 DEPLOYMENT COMPLETE!

Your Squoosh Next application is now:

✅ **Live on Production** - zesttechsolution.cloud  
✅ **Secured with HTTPS** - Automatic SSL  
✅ **Globally Distributed** - Edge CDN  
✅ **Fully Functional** - All features working  
✅ **Analytics Enabled** - Tracking visitors  
✅ **Email Integrated** - Contact form active  
✅ **38 Languages** - Global support  
✅ **SEO Optimized** - Search engine ready  
✅ **Mobile Responsive** - All devices  
✅ **Enterprise-Grade** - Professional quality  

**Congratulations! 🎊**

---

**Built with ❤️ by Naushad Alam for Zest Tech Solution**
