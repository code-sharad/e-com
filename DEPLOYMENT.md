# 🚀 Deployment Configuration

## Environment Variables Required

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Razorpay Configuration
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

## Vercel Deployment

### vercel.json
```json
{
  "build": {
    "env": {
      "NEXT_PUBLIC_FIREBASE_API_KEY": "@firebase-api-key",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN": "@firebase-auth-domain",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID": "@firebase-project-id",
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET": "@firebase-storage-bucket",
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID": "@firebase-messaging-sender-id",
      "NEXT_PUBLIC_FIREBASE_APP_ID": "@firebase-app-id",
      "RAZORPAY_KEY_ID": "@razorpay-key-id",
      "RAZORPAY_KEY_SECRET": "@razorpay-key-secret",
      "NEXT_PUBLIC_RAZORPAY_KEY_ID": "@razorpay-public-key"
    }
  }
}
```

### Deployment Commands
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Netlify Deployment

### netlify.toml
```toml
[build]
  publish = ".next"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NEXT_PUBLIC_FIREBASE_API_KEY = "YOUR_API_KEY"
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "YOUR_AUTH_DOMAIN"
  NEXT_PUBLIC_FIREBASE_PROJECT_ID = "YOUR_PROJECT_ID"
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "YOUR_STORAGE_BUCKET"
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "YOUR_SENDER_ID"
  NEXT_PUBLIC_FIREBASE_APP_ID = "YOUR_APP_ID"
  RAZORPAY_KEY_ID = "YOUR_RAZORPAY_KEY_ID"
  RAZORPAY_KEY_SECRET = "YOUR_RAZORPAY_SECRET"
  NEXT_PUBLIC_RAZORPAY_KEY_ID = "YOUR_PUBLIC_RAZORPAY_KEY"
```

## Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY}
      - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
      - NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID}
      - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}
      - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}
      - NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID}
      - RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
      - RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
      - NEXT_PUBLIC_RAZORPAY_KEY_ID=${NEXT_PUBLIC_RAZORPAY_KEY_ID}
    env_file:
      - .env.local
```

## Firebase Hosting

### firebase.json
```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Deploy Commands
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy
npm run build
firebase deploy
```

## Environment Setup Guide

### 1. Firebase Setup
```bash
# Create Firebase project
# Enable Authentication, Firestore, Storage
# Get configuration from Firebase Console
```

### 2. Razorpay Setup
```bash
# Create Razorpay account
# Get API keys from dashboard
# Configure webhooks
```

### 3. Domain Configuration
- Add your production domain to Firebase authorized domains
- Configure Razorpay webhook URLs
- Set up SSL certificates

## Security Checklist

- [ ] All environment variables set
- [ ] Firebase security rules configured
- [ ] Razorpay webhooks secured
- [ ] CORS configured properly
- [ ] HTTPS enabled
- [ ] API rate limiting configured
- [ ] Input validation in place
- [ ] Error handling implemented

## Performance Optimization

- [ ] Images optimized with Next.js Image
- [ ] Static pages generated where possible
- [ ] Bundle size optimized
- [ ] Caching strategies implemented
- [ ] CDN configured for static assets

## Monitoring Setup

### Error Tracking
- Configure error tracking service (Sentry, LogRocket)
- Set up error boundaries
- Monitor API endpoints

### Analytics
- Set up Google Analytics
- Configure conversion tracking
- Monitor user flows

### Performance
- Set up Core Web Vitals monitoring
- Configure performance budgets
- Monitor API response times

## Post-Deployment Testing

1. **Authentication Flow**
   - User registration
   - User login
   - Password reset
   - Profile management

2. **E-commerce Features**
   - Product browsing
   - Cart functionality
   - Checkout process
   - Payment processing
   - Order management

3. **Admin Features**
   - Product management
   - Order management
   - Analytics dashboard
   - User management

4. **Performance Testing**
   - Page load speeds
   - Image optimization
   - Mobile responsiveness
   - SEO optimization
