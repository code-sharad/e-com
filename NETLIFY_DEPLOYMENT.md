# Netlify Deployment Guide

## Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Firebase Project**: Ensure your Firebase project is set up and configured
3. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)

## Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

### 2. Deploy on Netlify

#### Option A: Netlify Dashboard (Recommended)

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "New site from Git"
3. Choose "GitHub" and authorize Netlify
4. Select your repository: `global-saanvika-ecommerce`
5. Configure build settings:
   - **Branch**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
6. Click "Deploy site"

#### Option B: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from your project directory
cd e:\global-saanvika-ecommerce
netlify deploy --build --prod
```

### 3. Configure Environment Variables

In your Netlify site dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add the following variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_actual_measurement_id
NEXT_PUBLIC_RAZORPAY_KEY=your_actual_razorpay_key
RAZORPAY_KEY_SECRET=your_actual_razorpay_secret
NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
NODE_ENV=production
```

### 4. Update Firebase Configuration

1. In Firebase Console, go to **Authentication** → **Settings**
2. Add your Netlify domain to **Authorized domains**:
   - `your-site-name.netlify.app`

3. Update **Firestore Security Rules** if needed to allow your domain

### 5. Configure Custom Domain (Optional)

1. In Netlify dashboard: **Domain settings** → **Custom domains**
2. Add your custom domain
3. Configure DNS settings as instructed
4. Update Firebase authorized domains with your custom domain

## Build Configuration

The project is configured with:

- **Output**: Static export (`next export`)
- **Build directory**: `out`
- **Node version**: 18
- **Redirects**: Configured for SPA routing

## Troubleshooting

### Build Errors

1. **TypeScript errors**: Already ignored in `next.config.mjs`
2. **Environment variables**: Ensure all required variables are set in Netlify
3. **Firebase permissions**: Check Firestore rules and authentication settings

### Runtime Errors

1. **Firebase connection**: Verify environment variables
2. **Razorpay integration**: Ensure keys are correctly set
3. **Routing issues**: Check `netlify.toml` redirects configuration

### Performance Optimization

1. **Image optimization**: Already configured with `unoptimized: true`
2. **Static assets**: Cached for 1 year via headers
3. **Build time**: Consider upgrading to Netlify Pro for faster builds

## Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] Firebase authentication works
- [ ] Product catalog displays
- [ ] Cart functionality works
- [ ] Checkout process completes
- [ ] Admin panel accessible
- [ ] Payment processing works
- [ ] All forms submit successfully
- [ ] Search functionality works
- [ ] Mobile responsiveness
- [ ] SSL certificate active

## Continuous Deployment

Netlify automatically rebuilds your site when you push changes to your GitHub repository's main branch.

To disable auto-deploy:
1. Go to **Site settings** → **Build & deploy**
2. Set **Branch deploys** to "None"

## Support

- [Netlify Documentation](https://docs.netlify.com/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Firebase Hosting vs Netlify](https://firebase.google.com/docs/hosting)
