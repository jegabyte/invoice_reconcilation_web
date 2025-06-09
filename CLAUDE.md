# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run TypeScript type checking
npm run type-check

# Run ESLint
npm run lint
```

## Architecture Overview

This is a React + TypeScript invoice reconciliation application built with Vite and using Firebase as the backend. The codebase follows a feature-based architecture with clear separation of concerns:

### Key Technologies
- **React 18** with TypeScript for type safety
- **Vite** as the build tool (configured to run on port 3000)
- **Redux Toolkit** for state management with slices pattern
- **Firebase** for authentication, database (Firestore), and file storage
- **Tailwind CSS** for styling with custom primary color palette
- **React Router v6** for routing with protected routes

### Project Structure
- `src/components/` - Feature-based UI components (auth, invoices, vendors, rules, etc.)
- `src/pages/` - Route-based page containers
- `src/services/` - Business logic layer with Firebase and API services
- `src/hooks/` - Custom React hooks for Firebase operations (useAuth, useFirestore, useInvoices, etc.)
- `src/store/` - Redux store with feature slices (auth, invoice, ui, vendor)
- `src/config/` - Configuration including Firebase setup
- `src/types/` - TypeScript type definitions organized by domain

### Development Workflow
1. The app uses absolute imports with `@/` aliased to `./src/`
2. Firebase configuration is loaded from environment variables (REACT_APP_FIREBASE_*)
3. Authentication is required for most routes via ProtectedRoute component
4. Real-time data synchronization is handled through Firestore listeners in custom hooks

### Firebase Collections
The app uses these main Firestore collections:
- `vendors` - Vendor/partner information
- `invoices` - Invoice records with status tracking
- `line_items` - Individual invoice line items
- `validation_rules` - Custom validation rules per vendor
- `users` - User profiles with role-based access

### State Management Pattern
Redux Toolkit slices handle different domains:
- `auth.slice.ts` - User authentication state
- `invoice.slice.ts` - Invoice data and operations
- `vendor.slice.ts` - Vendor management
- `ui.slice.ts` - UI state (loading, errors, etc.)