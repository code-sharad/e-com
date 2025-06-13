# 🚀 Netlify Deployment Guide for Global Saanvika E-commerce

This guide will help you deploy your Next.js jewelry e-commerce website to Netlify.

## 📋 Prerequisites

- [x] Netlify account ([Sign up here](https://app.netlify.com/signup))
- [x] Git repository (GitHub, GitLab, or Bitbucket)
- [x] Firebase project with web app configured
- [x] Razorpay account with API keys

## 🔧 Quick Deployment Steps

### 1. Test Local Build

First, ensure your project builds successfully locally:

```bash
npm run deploy:netlify
```

This will run our deployment checker script and test the build.

### 2. Push to Git Repository

Ensure your code is pushed to your Git repository:

```bash
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```

### 3. Connect to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Choose your Git provider and repository
4. Select the repository: `global-saanvika-ecommerce`

### 4. Configure Build Settings

Netlify should auto-detect the settings from `netlify.toml`, but verify:

- **Base directory**: (leave empty)
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: `18`

### 5. Set Environment Variables

Go to Site Settings → Environment Variables and add:

#### 🔥 Firebase Configuration
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
```

#### 💳 Razorpay Configuration
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

#### 🛠️ Build Configuration
```
NODE_VERSION=18
NPM_FLAGS=--legacy-peer-deps
NODE_OPTIONS=--max-old-space-size=4096
```

### 6. Deploy

Click "Deploy site" and wait for the build to complete!

## 🌐 Build Configuration Details

The project uses these configurations for optimal Netlify deployment:

### netlify.toml Configuration
- **Runtime**: Next.js with `@netlify/plugin-nextjs`
- **Node Version**: 18
- **Memory**: 4GB for large builds
- **Security Headers**: Comprehensive security configuration
- **Caching**: Optimized static asset caching

### Next.js Configuration
- **Static Export**: Enabled with `trailingSlash: true`
- **Image Optimization**: Configured for Firebase Storage
- **Build Timeout**: Extended to 120 seconds
- **Webpack**: Optimized for serverless deployment

## 🔍 Troubleshooting

### Build Fails with Memory Issues
If you encounter memory errors during build:
1. Increase `NODE_OPTIONS=--max-old-space-size=8192` in environment variables
2. Contact Netlify support for build resource increase

### Firebase Connection Issues
1. Verify all Firebase environment variables are correct
2. Check Firebase console for proper web app configuration
3. Ensure Firebase Authentication and Firestore are enabled

### Razorpay Integration Issues
1. Use test keys for staging deployment
2. Switch to live keys only for production
3. Verify webhook URLs in Razorpay dashboard

### Build Plugin Issues
If `@netlify/plugin-nextjs` causes issues:
1. Remove the plugin from `netlify.toml`
2. Add `output: 'export'` to `next.config.js`
3. Change publish directory to `out`

## 📊 Performance Optimization

The deployment includes:
- **Static Asset Caching**: 1 year cache for immutable assets
- **Security Headers**: Comprehensive security configuration
- **Build Optimization**: Memory and performance optimizations
- **Image Optimization**: Configured for Firebase Storage

## 🔒 Security

- All sensitive keys (like `RAZORPAY_KEY_SECRET`) are server-side only
- Public keys are prefixed with `NEXT_PUBLIC_`
- Security headers protect against common attacks
- HTTPS enforced for all traffic

## 🚀 Post-Deployment

After successful deployment:

1. **Test all functionality**:
   - User registration/login
   - Product browsing
   - Cart functionality
   - Payment processing
   - Admin dashboard

2. **Configure custom domain** (optional):
   - Go to Site Settings → Domain management
   - Add your custom domain
   - Configure DNS settings

3. **Set up monitoring**:
   - Enable Netlify Analytics
   - Configure error reporting
   - Set up uptime monitoring

## 📞 Support

If you encounter issues:
1. Check build logs in Netlify dashboard
2. Review environment variables
3. Test locally with `npm run build`
4. Check [Netlify documentation](https://docs.netlify.com/)

---

🎉 **Congratulations! Your jewelry e-commerce site is now live on Netlify!**

Your customers can now browse and purchase beautiful jewelry pieces with a fast, secure, and reliable shopping experience.
