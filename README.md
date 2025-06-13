# Global Saanvika E-Commerce

This is the repository for the Global Saanvika E-Commerce platform built with Next.js, Firebase, and Tailwind CSS.

## Project Structure

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
