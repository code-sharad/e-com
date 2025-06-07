# 🚀 Global Saanvika E-commerce Development Guide

## 📋 Project Overview

This is a modern e-commerce platform built with Next.js 15, React 19, TypeScript, and Tailwind CSS. The application features a complete shopping experience with admin panel, user authentication, product management, and payment integration.

## 🛠️ Tech Stack

### Core Technologies
- **Framework**: Next.js 15.2.4 (App Router)
- **Runtime**: React 19 with modern hooks
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: shadcn/ui with Radix UI primitives

### Backend & Services
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Payments**: Razorpay Integration
- **Form Handling**: React Hook Form with Zod validation

### Developer Tools
- **Linting**: ESLint with Next.js strict rules
- **Code Quality**: TypeScript strict mode
- **Build Tool**: Next.js built-in bundler
- **Package Manager**: npm

## 🚦 Getting Started

### Prerequisites
- Node.js 18.17 or later
- npm or yarn package manager
- Firebase project (for backend services)
- Razorpay account (for payments)

### 1. Clone and Install
```bash
git clone <repository-url>
cd global-saanvika-ecommerce
npm install
```

### 2. Environment Setup
Copy the environment template:
```bash
cp .env.example .env.local
```

Fill in your credentials in `.env.local`:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### 3. Firebase Setup
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication, Firestore, and Storage
3. Add your domain to authorized domains
4. Copy the configuration values to your `.env.local`

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Project Structure

```
global-saanvika-ecommerce/
├── app/                      # Next.js App Router pages
│   ├── admin/               # Admin dashboard pages
│   ├── auth/                # Authentication pages
│   ├── api/                 # API routes
│   └── (public)/            # Public pages
├── components/              # Reusable React components
│   ├── ui/                  # shadcn/ui components
│   └── ...                  # Custom components
├── lib/                     # Utility libraries
│   ├── firebase/            # Firebase configuration & helpers
│   └── ...                  # Other utilities
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript type definitions
└── public/                  # Static assets
```

## 🧪 Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Type checking
npx tsc --noEmit
```

## 🔧 Code Quality Standards

### TypeScript
- Strict mode enabled
- All `any` types replaced with proper types
- Comprehensive type definitions for all components
- Error handling with proper type guards

### React Best Practices
- Functional components with hooks
- Proper dependency arrays in useEffect
- Memoization with useCallback/useMemo where needed
- Modern React 19 patterns

### Code Style
- ESLint with Next.js strict rules
- Consistent error handling patterns
- Proper JSX entity escaping
- Image optimization with Next.js Image component

## 🔐 Security Features

### Environment Variables
- All API keys and secrets stored in environment variables
- `.env.example` template provided
- `.gitignore` configured to exclude sensitive files

### Firebase Security
- Proper Firebase service configuration
- Authenticated API routes
- Input validation with Zod schemas

### Payment Security
- Server-side payment verification
- Secure Razorpay integration
- Order validation and confirmation

## 🚀 Deployment

### Build Optimization
The project includes several performance optimizations:
- Next.js Image component for optimized images
- Static page generation where possible
- Bundle analysis and optimization
- Modern JavaScript/TypeScript compilation

### Production Checklist
- [ ] Environment variables configured
- [ ] Firebase services enabled and configured
- [ ] Razorpay payment gateway configured
- [ ] Domain added to Firebase authorized domains
- [ ] SSL certificate configured
- [ ] Build passes all tests
- [ ] Performance audit completed

## 📊 Bundle Analysis

Current build statistics:
- Total bundle size: ~274 kB (with First Load JS)
- Static pages: 17 routes
- Dynamic pages: 5 routes
- API routes: 2 endpoints

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Issues**
   - Check environment variables are set correctly
   - Verify Firebase project configuration
   - Check console for detailed error messages

2. **Build Errors**
   - Run `npm run lint` to check for code issues
   - Verify all dependencies are installed
   - Check TypeScript errors with `npx tsc --noEmit`

3. **Payment Integration**
   - Ensure Razorpay keys are correctly configured
   - Check webhook configurations
   - Verify payment flow in test mode first

### Debug Tools
- Use the Firebase Setup Checker component at `/admin`
- Check browser console for client-side errors
- Use Next.js built-in error reporting

## 🔄 Contributing

### Before Submitting Changes
1. Run `npm run lint` to check code quality
2. Run `npm run build` to ensure build passes
3. Test all modified functionality
4. Update documentation if needed

### Code Review Checklist
- [ ] TypeScript types are properly defined
- [ ] React hooks have correct dependencies
- [ ] Security: No hardcoded secrets
- [ ] Performance: Images optimized
- [ ] Accessibility: Proper JSX entities
- [ ] Tests: All functionality tested

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React 19 Features](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Razorpay Integration Guide](https://razorpay.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 📞 Support

For development support or questions:
1. Check this documentation first
2. Review the `CODE_QUALITY_FIXES.md` file
3. Check Firebase Setup Checker for configuration issues
4. Review console logs for specific error messages

---

**Note**: This project follows modern React and Next.js best practices and is production-ready. All security vulnerabilities have been addressed and code quality standards implemented.
