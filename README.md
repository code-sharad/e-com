# 🛍️ Global Saanvika E-commerce Platform

A modern, full-featured e-commerce platform built with Next.js 15, React 19, and TypeScript. Features a complete shopping experience with admin dashboard, user authentication, product management, and integrated payment processing.

![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-11.9.0-orange?style=flat-square&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-blue?style=flat-square&logo=tailwindcss)

## ✨ Features

### 🛒 Customer Features
- **Product Catalog**: Browse products by categories with advanced filtering
- **Search & Discovery**: Intelligent search with real-time suggestions
- **Shopping Cart**: Persistent cart with quantity management
- **User Authentication**: Secure login, registration, and profile management
- **Checkout Process**: Streamlined checkout with payment integration
- **Order Tracking**: Complete order history and status tracking
- **Responsive Design**: Optimized for desktop, tablet, and mobile

### 👨‍💼 Admin Features
- **Product Management**: Add, edit, and manage product inventory
- **Order Management**: View and process customer orders
- **Analytics Dashboard**: Sales reports and business insights
- **User Management**: Customer account oversight
- **Content Management**: Category and content administration

### 🔧 Technical Features
- **Modern Stack**: Next.js 15 with App Router and React 19
- **Type Safety**: Full TypeScript implementation
- **Performance**: Optimized images, lazy loading, and code splitting
- **Security**: Environment variable management and secure API routes
- **Payment Integration**: Razorpay payment gateway
- **Real-time Database**: Firebase Firestore for data management
- **Authentication**: Firebase Auth with multiple providers
- **File Storage**: Firebase Storage for images and assets

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17 or later
- npm or yarn package manager
- Firebase account
- Razorpay account (for payments)

### 1. Installation
```bash
# Clone the repository
git clone <repository-url>
cd global-saanvika-ecommerce

# Install dependencies
npm install
```

### 2. Environment Setup
```bash
# Run the interactive setup script
npm run setup

# Or manually copy the environment template
cp .env.example .env.local
```

### 3. Configure Services

#### Firebase Setup
1. Create a new project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication, Firestore, and Storage
3. Copy configuration values to `.env.local`

#### Razorpay Setup
1. Create account at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Generate API keys
3. Add keys to `.env.local`

### 4. Start Development
```bash
# Start the development server
npm run dev

# Open your browser to http://localhost:3000
```

## 📁 Project Structure

```
global-saanvika-ecommerce/
├── 📁 app/                    # Next.js App Router
│   ├── 📁 admin/              # Admin dashboard pages
│   ├── 📁 auth/               # Authentication pages
│   ├── 📁 api/                # API routes
│   ├── 📁 checkout/           # Checkout process
│   ├── 📁 product/            # Product pages
│   └── 📄 layout.tsx          # Root layout
├── 📁 components/             # React components
│   ├── 📁 ui/                 # shadcn/ui components
│   ├── 📄 header.tsx          # Site header
│   ├── 📄 footer.tsx          # Site footer
│   └── ...                    # Other components
├── 📁 lib/                    # Utility libraries
│   ├── 📁 firebase/           # Firebase configuration
│   ├── 📄 utils.ts            # Common utilities
│   └── ...                    # Other utilities
├── 📁 hooks/                  # Custom React hooks
├── 📁 types/                  # TypeScript definitions
├── 📁 public/                 # Static assets
├── 📄 package.json            # Project dependencies
├── 📄 tailwind.config.js      # Tailwind configuration
├── 📄 next.config.js          # Next.js configuration
└── 📄 tsconfig.json           # TypeScript configuration
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # Check TypeScript types

# Setup & Utilities
npm run setup            # Interactive environment setup
npm run setup:validate  # Validate current setup
npm run build:analyze   # Analyze bundle size
npm run clean           # Clean build artifacts
```

### Code Quality Standards

- **TypeScript**: Strict mode with comprehensive type definitions
- **ESLint**: Next.js strict rules with custom configurations
- **Code Style**: Consistent formatting and naming conventions
- **Error Handling**: Proper error boundaries and user feedback
- **Performance**: Optimized images, lazy loading, and efficient re-renders
- **Security**: Environment variables, input validation, and secure API routes

## 🔐 Security Features

- **Environment Variables**: All secrets stored securely
- **Input Validation**: Zod schemas for form validation
- **Authentication**: Firebase Auth with secure session management
- **API Security**: Protected routes and request validation
- **Payment Security**: Server-side payment verification
- **Error Handling**: Secure error messages without sensitive data exposure

## 📊 Performance

### Build Optimization
- **Bundle Size**: ~274 kB first load JS
- **Static Generation**: 17 static pages pre-rendered
- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Automatic route-based code splitting
- **Caching**: Optimized caching strategies

### Core Web Vitals
- **LCP**: Optimized with image preloading
- **FID**: Minimal JavaScript blocking
- **CLS**: Stable layout with proper sizing

## 🚀 Deployment

### Supported Platforms
- **Vercel** (Recommended)
- **Netlify**
- **Firebase Hosting**
- **Docker/Self-hosted**

### Quick Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 📚 Documentation

- [Development Guide](./DEVELOPMENT_GUIDE.md) - Comprehensive development setup
- [Deployment Guide](./DEPLOYMENT.md) - Deployment configurations
- [Code Quality Report](./CODE_QUALITY_FIXES.md) - Applied fixes and improvements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests and linting (`npm run lint && npm run type-check`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Checklist
- [ ] TypeScript types are properly defined
- [ ] ESLint passes without errors
- [ ] All components are responsive
- [ ] Security best practices followed
- [ ] Performance optimizations applied
- [ ] Tests are written and passing

## 📧 Support

For support, email dev@saanvika.com or create an issue in the repository.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful and accessible component library
- [Firebase](https://firebase.google.com/) - Backend-as-a-Service platform
- [Razorpay](https://razorpay.com/) - Payment gateway integration
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

<div align="center">
  <p>Built with ❤️ for Global Saanvika</p>
  <p>
    <a href="https://nextjs.org">
      <img src="https://img.shields.io/badge/Powered%20by-Next.js-black?style=flat-square&logo=next.js" alt="Powered by Next.js" />
    </a>
    <a href="https://react.dev">
      <img src="https://img.shields.io/badge/Built%20with-React%2019-blue?style=flat-square&logo=react" alt="Built with React 19" />
    </a>
    <a href="https://www.typescriptlang.org">
      <img src="https://img.shields.io/badge/Written%20in-TypeScript-blue?style=flat-square&logo=typescript" alt="Written in TypeScript" />
    </a>
  </p>
</div>
