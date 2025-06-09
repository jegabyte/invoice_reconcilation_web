# Invoice Reconciliation System

A production-grade web application for automated invoice processing, validation, and reconciliation. Built with React, TypeScript, and designed for easy backend switching between mock data (development) and Firebase (production).

## 🚀 Features

- **Invoice Management**: Upload, process, and track invoices from various vendors
- **Automated Validation**: Apply business rules to validate invoice line items
- **Validation Evidence**: Track detailed evidence for each validation rule applied
- **Dispute Management**: Handle disputes with full audit trail
- **Vendor Management**: Manage vendor configurations and business models
- **Rule Engine**: Configure validation rules per vendor
- **Real-time Updates**: Optional real-time data synchronization
- **Role-based Access**: Control access based on user roles

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Backend Options**: Mock Services or Firebase (Firestore + Auth)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Common/shared components
│   ├── invoices/       # Invoice-related components
│   ├── layout/         # Layout components
│   ├── rules/          # Validation rule components
│   └── vendors/        # Vendor components
├── config/             # Application configuration
│   ├── app.config.ts   # App configuration
│   ├── constants.ts    # Global constants
│   ├── environment.ts  # Environment setup
│   └── firebase.ts     # Firebase configuration
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication hook
│   ├── useFirestore.ts # Firestore operations
│   ├── useInvoices.ts  # Invoice operations
│   ├── useRealtime.ts  # Real-time updates
│   ├── useRules.ts     # Validation rules
│   └── useVendors.ts   # Vendor operations
├── pages/              # Route-based page components
│   ├── auth/           # Login, Register, etc.
│   ├── dashboard/      # Dashboard page
│   ├── invoices/       # Invoice management
│   ├── rules/          # Rules management
│   ├── settings/       # Settings page
│   └── vendors/        # Vendor management
├── services/           # Service layer (ready for Firebase)
│   ├── api/            # API service implementations
│   ├── factory/        # Service factory pattern
│   ├── firebase/       # Firebase services (ready)
│   ├── interfaces/     # Service contracts
│   ├── mock/           # Centralized mock system
│   │   ├── index.ts    # Mock exports
│   │   ├── mock-auth.service.ts
│   │   ├── mock-data.service.ts
│   │   ├── mock-data.ts # Centralized mock data
│   │   └── types.ts    # Mock types
│   └── utils/          # Service utilities
├── store/              # Redux store
│   └── slices/         # Feature slices
├── types/              # TypeScript definitions
│   ├── api/            # API types
│   ├── app/            # App types
│   └── models/         # Data models
└── utils/              # Utility functions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd invoice_reconcilation_web
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment configuration:
```bash
cp .env.example .env
```

4. Configure your environment (see Configuration section below)

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Development Mode (Mock Data)

The application includes a comprehensive mock data system:

- **Test Users**:
  - Admin: `admin@example.com` / `admin123`
  - User: `user@example.com` / `user123`

- **Mock Features**:
  - Pre-populated vendors (Expedia, Booking.com)
  - Sample invoices with various statuses
  - Validation rules with execution history
  - Simulated processing delays
  - Real-time update simulation

## ⚙️ Configuration

### Environment Variables

The application uses environment variables for configuration. All variables must be prefixed with `VITE_` to be accessible in the client.

Key configuration options:

```env
# Feature Flags
VITE_USE_MOCK_DATA=true        # Use mock data instead of Firebase
VITE_ENABLE_FIREBASE=false     # Enable Firebase integration
VITE_ENABLE_REALTIME=false     # Enable real-time updates
VITE_ENABLE_FILE_UPLOAD=true   # Enable file upload functionality

# Firebase Configuration (Required if VITE_ENABLE_FIREBASE=true)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket

# Storage Configuration
VITE_INVOICE_BUCKET=invoices   # Storage bucket for invoices
VITE_DOCUMENT_BUCKET=documents # Storage bucket for documents
VITE_MAX_FILE_SIZE=10485760    # Max file size in bytes (10MB)
VITE_ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png

# Business Rules
VITE_DEFAULT_CURRENCY=USD
VITE_DISPUTE_RESOLUTION_DAYS=30
VITE_VALIDATION_BATCH_SIZE=100
```

See `.env.example` for all available configuration options.

### Switching Between Mock and Firebase

The application uses a service factory pattern to switch between mock and Firebase implementations:

1. **Mock Mode** (default):
   - Set `VITE_USE_MOCK_DATA=true`
   - No Firebase configuration needed
   - Uses in-memory data with simulated delays
   - Perfect for development and testing

2. **Firebase Mode**:
   - Set `VITE_USE_MOCK_DATA=false`
   - Set `VITE_ENABLE_FIREBASE=true`
   - Configure all Firebase environment variables
   - Requires a Firebase project setup

### Service Architecture

The application uses a clean service architecture:

```typescript
// All services follow interfaces for easy swapping
interface IAuthService {
    signIn(data: SignInData): Promise<User>;
    signOut(): Promise<void>;
    // ...
}

interface IDataService {
    getInvoices(filters?: InvoiceFilters): Promise<Invoice[]>;
    getVendors(): Promise<Vendor[]>;
    getRules(): Promise<ValidationRule[]>;
    // ...
}

// ServiceFactory handles implementation selection
class ServiceFactory {
    static getAuthService(): IAuthService {
        return AppConfig.features.useMockData 
            ? new MockAuthService() 
            : new FirebaseAuthService();
    }
    
    static getDataService(): IDataService {
        return AppConfig.features.useMockData
            ? new MockDataService()
            : new FirebaseDataService();
    }
}
```

This pattern ensures:
- Zero code changes in components when switching backends
- Easy testing with mock services
- Clear separation of concerns
- Future-proof architecture

## 🔍 Key Features Explained

### Validation Evidence

Each line item in an invoice goes through multiple validation rules. The system tracks:

- **Rule Applied**: Name and type (HARD/SOFT) of each rule
- **Evidence**: Expected vs actual values, operators used
- **Results**: Pass/Fail/Warning status
- **Details**: Additional context and calculations
- **Timestamps**: When validation occurred

Example validation result:
```json
{
  "ruleId": "rule1",
  "ruleName": "Total Amount Validation",
  "ruleType": "HARD",
  "result": "WARNING",
  "message": "Amount variance exceeds 5% threshold",
  "field": "financial.totalAmount",
  "operator": "IN_RANGE",
  "expectedValue": 340,
  "actualValue": 357,
  "evidence": {
    "passed": false,
    "severity": "WARNING",
    "details": "Tolerance: 5%, Actual variance: 5.0%",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Business Models

The system supports multiple vendor business models:
- **NET_RATE**: Direct net rates
- **COMMISSION**: Commission-based pricing (e.g., 10% of booking)
- **SELL_RATE**: Markup-based pricing
- **PROFIT_SHARING**: Profit sharing arrangements
- **MIXED**: Combination of models

### Validation Rules

Rules can be configured per vendor with conditions such as:
- **Amount Tolerance**: Check if amounts are within acceptable variance
- **Date Validation**: Verify check-in/out dates match
- **Duplicate Detection**: Prevent duplicate invoice processing
- **Commission Calculation**: Verify commission amounts
- **Property Mapping**: Validate property codes
- **Custom Business Logic**: Vendor-specific rules

## 👨‍💻 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

### Adding a New Service Implementation

To add a new backend service (e.g., AWS, custom API):

1. Implement the interfaces in `src/services/interfaces/`
```typescript
// src/services/interfaces/data.interface.ts
export interface IDataService {
    getInvoices(filters?: InvoiceFilters): Promise<Invoice[]>;
    // ... other methods
}
```

2. Create your implementation:
```typescript
// src/services/your-service/data.service.ts
export class YourDataService implements IDataService {
    async getInvoices(filters?: InvoiceFilters) {
        // Your implementation
    }
    // ... implement all interface methods
}
```

3. Update the service factory:
```typescript
// src/services/factory/service-factory.ts
class ServiceFactory {
    static getDataService(): IDataService {
        if (AppConfig.features.useYourService) {
            return new YourDataServiceAdapter();
        }
        // ... existing logic
    }
}
```

4. Add configuration to `app.config.ts`

### State Management

The application uses Redux Toolkit for state management with the following slices:
- `auth`: Authentication state
- `invoice`: Invoice data and operations
- `vendor`: Vendor management
- `ui`: UI state (loading, errors, etc.)

## 🏗️ Firebase Migration

The project is designed for easy migration from mock to Firebase:

### 1. Update Configuration

```typescript
// src/config/app.config.ts
export const AppConfig = {
  features: {
    useMockData: false,  // Switch to Firebase
    enableFirebase: true
  }
};
```

### 2. Database Schema

See [FIRESTORE_SCHEMA.md](./FIRESTORE_SCHEMA.md) for complete schema documentation including:
- Collection structures
- Field definitions
- Indexes
- Security rules
- Migration guide

### 2. Security Rules

Example Firestore security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Authenticated users can read vendors
    match /vendors/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role in ['ADMIN', 'MANAGER'];
    }
    
    // Invoice access based on role
    match /invoices/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role in ['ADMIN', 'MANAGER', 'OPERATOR'];
    }
  }
}
```

## 📦 Deployment

### Production Build

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Environment-specific Builds

Create environment-specific `.env` files:
- `.env.development` - Development environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment

### Docker Deployment

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

## 🏛️ Architecture Decisions

### Service Layer Pattern

The application uses a service layer pattern with interfaces to abstract data access:
- **Flexibility**: Easy switching between different backends
- **Testability**: Mock services for testing
- **Separation of Concerns**: Business logic separated from UI
- **Future-proof**: Can add new backends without changing components

### Mock Service Implementation

The mock service provides:
- Realistic data with proper relationships
- Simulated network delays (300ms default)
- Validation rule execution with evidence
- Real-time update simulation (5-second polling)
- Sample validation results for testing

### Validation Evidence Tracking

Each validation produces detailed evidence:
- Input and output values for transparency
- Rule configuration at execution time
- Pass/fail reasoning with calculations
- Timestamps for audit trails

This provides complete transparency for dispute resolution and compliance.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 💬 Support

For support, please contact the development team or create an issue in the repository.

## 🔮 Future Enhancements

- [ ] Machine Learning for automatic rule generation
- [ ] Advanced analytics dashboard
- [ ] Bulk operations for invoice processing
- [ ] Email notifications for disputes
- [ ] API for third-party integrations
- [ ] Mobile application
- [ ] Export validation reports as PDF
