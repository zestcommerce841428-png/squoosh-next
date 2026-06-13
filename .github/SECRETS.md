# GitHub Actions Secrets Configuration

## Required Secrets for CI/CD Pipeline

To enable automatic deployments, you need to add these secrets to your GitHub repository.

### How to Add Secrets

1. Go to your GitHub repository
2. Click **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add each of the following secrets

---

## 🔑 Required Secrets

### Vercel Deployment Secrets

#### `VERCEL_TOKEN`
**How to get:**
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it: `GitHub Actions CI/CD`
4. Copy the token
5. Add to GitHub secrets

#### `VERCEL_ORG_ID`
**How to get:**
1. Go to [vercel.com](https://vercel.com)
2. Click your profile > Settings
3. Copy your "Team ID" or "User ID"
4. Add to GitHub secrets

#### `VERCEL_PROJECT_ID`
**How to get:**
1. Go to your project in Vercel dashboard
2. Click Settings
3. Scroll to "Project ID"
4. Copy the ID
5. Add to GitHub secrets

---

### Application Environment Variables

#### `NEXT_PUBLIC_GA_ID`
```
Value: G-H59FHPJ2FB
```
Your Google Analytics Measurement ID

#### `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
```
Value: 6Le9b8QsAAAAAOGQw66yHhmke1x0HnjbCjGZmHjW
```
Your reCAPTCHA Site Key (public)

#### `RECAPTCHA_SECRET_KEY`
```
Value: 6Le9b8QsAAAAADYeBeZmXxisb0IK_911h2bBr27-
```
Your reCAPTCHA Secret Key (private)

---

### Hostinger Email Configuration

#### `HOSTINGER_SMTP_HOST`
```
Value: smtp.hostinger.com
```

#### `HOSTINGER_SMTP_PORT`
```
Value: 465
```

#### `HOSTINGER_SMTP_USER`
```
Value: your-email@zesttechsolution.cloud
```
Your Hostinger email address

**How to get:**
1. Login to Hostinger control panel
2. Go to **Emails** section
3. Create or use existing email account
4. Copy the email address

#### `HOSTINGER_SMTP_PASS`
```
Value: your-email-password
```
Your Hostinger email password

**How to get:**
1. In Hostinger control panel > Emails
2. Create a new email or reset password for existing one
3. Copy the password (store it securely)

---

## 📝 Complete Secrets List

Here's a checklist of all secrets you need to add:

- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`
- [ ] `NEXT_PUBLIC_GA_ID`
- [ ] `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- [ ] `RECAPTCHA_SECRET_KEY`
- [ ] `HOSTINGER_SMTP_HOST`
- [ ] `HOSTINGER_SMTP_PORT`
- [ ] `HOSTINGER_SMTP_USER`
- [ ] `HOSTINGER_SMTP_PASS`

---

## 🚀 Testing the CI/CD Pipeline

After adding all secrets:

### 1. Push to GitHub
```bash
cd "C:\Users\anony\Downloads\squoosh-dev\squoosh-dev"

# Initialize git (if not already done)
git init
git add .
git commit -m "Production-ready with CI/CD"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/squoosh-next.git

# Push to main branch
git push -u origin main
```

### 2. Watch the Workflow
1. Go to your GitHub repository
2. Click **Actions** tab
3. You should see "Deploy to Vercel Production" workflow running
4. It will:
   - ✅ Run quality checks (TypeScript, linting)
   - ✅ Build the application
   - ✅ Deploy to Vercel production
   - ✅ Run Lighthouse performance tests
   - ✅ Notify you of deployment status

### 3. Automatic Deployments
Once configured, every push to `main` branch will:
- Automatically build and test
- Deploy to production
- Run performance audits
- Update deployment status

---

## 🔒 Security Best Practices

### Never Commit Secrets
- ❌ Never commit `.env.local` to Git
- ❌ Never hardcode secrets in code
- ✅ Always use environment variables
- ✅ Use GitHub Secrets for CI/CD

### Rotate Secrets Regularly
- Change passwords every 3-6 months
- Regenerate tokens when team members leave
- Use strong, unique passwords

### Limit Access
- Only give repository access to trusted team members
- Use read-only tokens when possible
- Enable two-factor authentication on all accounts

---

## 🆘 Troubleshooting

### Deployment Fails
1. Check GitHub Actions logs
2. Verify all secrets are added correctly
3. Ensure Vercel project is linked
4. Check build logs for errors

### Email Not Sending
1. Verify SMTP credentials in Hostinger
2. Check email quota hasn't been exceeded
3. Verify port 465 is not blocked
4. Test SMTP connection locally

### reCAPTCHA Errors
1. Verify site key matches domain
2. Check secret key is correct
3. Ensure domain is added in reCAPTCHA admin
4. Verify token is being sent to API

---

## 📞 Support

If you need help configuring GitHub Actions secrets:

**Developer:** Naushad Alam  
**Email:** contact@zestcommerce.in  
**Phone:** +91 74920 68998  

---

## 🎉 Benefits of CI/CD

Once configured, you get:

✅ **Automatic Testing** - Every commit is tested  
✅ **Continuous Deployment** - Instant production updates  
✅ **Performance Monitoring** - Lighthouse scores on every deploy  
✅ **Build Verification** - Catch errors before production  
✅ **Zero Downtime** - Seamless deployments  
✅ **Rollback Support** - Easy to revert if needed  

**Your deployment pipeline is enterprise-grade and production-ready!** 🚀
