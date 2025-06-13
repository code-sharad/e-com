# 🛍️ Global Saanvika E-Commerce Platform

A complete full-stack e-commerce solution built with modern web technologies. Features a responsive design, secure authentication, payment integration, and comprehensive admin dashboard.

## 🚀 Live Demo

**Production URL**: https://ecom2405.netlify.app

## ✨ Features

### Customer Features
- 🏠 Modern homepage with hero section and featured products
- 🔍 Advanced search and filtering
- 📱 Responsive product catalog with categories
- 🛒 Shopping cart with real-time updates
- 💳 Secure checkout with Razorpay payment integration
- 👤 User authentication and profile management
- 📦 Order tracking and history
- ⭐ Product reviews and ratings

### Admin Features
- 📊 Comprehensive dashboard with analytics
- 📦 Product management (CRUD operations)
- 🛍️ Order management and tracking
- 👥 Customer management
- 📈 Sales reports and data extraction
- 🖼️ Image upload and management

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes, Firebase Functions
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Payments**: Razorpay
- **Deployment**: Netlify with Next.js Runtime
- **State Management**: React Context API

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Firebase account
- Razorpay account (for payments)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/global-saanvika-ecommerce.git
cd global-saanvika-ecommerce
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase and Razorpay credentials

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🌍 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## 🚀 Deployment

This project is configured for deployment on Netlify with the Next.js Runtime:

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

**Build Command**: `npm run build`
**Publish Directory**: `.next`

## 📁 Project Structure

### App Directory (`/app`)
Contains the Next.js application pages and API routes following the App Router structure.

- `/admin` - Admin panel for managing products, orders, customers, and reports
- `/api` - API routes for server-side functionality
- `/auth` - Authentication-related pages (login, register, forgot password)
- `/cart` - Shopping cart page
- `/category` - Category display pages
- `/checkout` - Checkout process
- `/orders` - Order management and history
- `/product` - Product display pages
- `/profile` - User profile management
- `/search` - Search functionality

### Components Directory (`/components`)
Contains React components organized by feature/function:

- `/admin` - Admin panel components
- `/auth` - Authentication components
- `/cart` - Cart-related components
- `/category` - Category display components
- `/common` - Common UI components (footer, navbar, etc.)
- `/firebase` - Firebase integration components
- `/home` - Homepage components
- `/icons` - Icon components
- `/layout` - Layout components
- `/product` - Product-related components
- `/ui` - UI library components (buttons, cards, etc.)

### Library Directory (`/lib`)
Contains utility functions, services, and helpers:

- `/auth` - Authentication utilities
- `/firebase` - Firebase service modules
- `/services` - Business logic services
- `/utils` - General utility functions

### Public Directory (`/public`)
Contains static assets like images, icons, and manifest files.

### Types Directory (`/types`)
Contains TypeScript type definitions.

### Hooks Directory (`/hooks`)
Contains React custom hooks.

## Setup and Development

1. Clone the repository
2. Run `npm install` to install dependencies
3. Create a `.env.local` file based on `.env.example`
4. Run `npm run dev` to start the development server

## Build and Deployment

- Run `npm run build` to build the application
- Run `npm start` to start the production server

## 📱 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication, Firestore, and Storage
3. Configure security rules
4. Add your web app configuration to environment variables

### Razorpay Setup
1. Create a Razorpay account
2. Get API keys from dashboard
3. Add keys to environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Aniket Bankar**
- Email: bankaraniketk@gmail.com
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Firebase](https://firebase.google.com/) for backend services
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Razorpay](https://razorpay.com/) for payment processing
