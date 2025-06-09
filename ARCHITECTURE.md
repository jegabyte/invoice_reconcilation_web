# Architecture Documentation

## Overview

This invoice reconciliation system is built with a clean architecture that separates concerns and allows for easy switching between different backend implementations.

## Key Design Principles

1. **Dependency Inversion**: Components depend on interfaces, not concrete implementations
2. **Single Responsibility**: Each module has a single, well-defined purpose
3. **Configuration-driven**: Behavior controlled through environment variables
4. **Type Safety**: Full TypeScript coverage for better developer experience
5. **Mock-first Development**: Built with mock services for rapid development

## Service Layer Architecture

### Interface-based Design

All services implement interfaces defined in `src/services/interfaces/`:

```typescript
// IAuthService - Authentication operations
interface IAuthService {
    signIn(data: SignInData): Promise<User>;
    signOut(): Promise<void>;
    // ... other auth methods
}

// IDataService - Data operations
interface IDataService {
    getInvoices(filters?: InvoiceFilters): Promise<Invoice[]>;
    getLineItemValidationResults(lineItemId: string): Promise<ValidationResult[]>;
    // ... other data methods
}
```

### Service Factory Pattern

The `ServiceFactory` in `src/services/factory/service-factory.ts` returns the appropriate implementation based on configuration:

```typescript
class ServiceFactory {
    static getAuthService(): IAuthService {
        if (AppConfig.features.useMockData) {
            return new MockAuthServiceAdapter();
        } else {
            return new FirebaseAuthServiceAdapter();
        }
    }
}
```

### Mock Services

Mock implementations in `src/services/mock/`:
- `MockAuthService`: Handles authentication with test users
- `MockDataService`: Provides realistic sample data with relationships
- Includes simulated delays and validation rule execution

## Data Models

### Core Models (`src/types/models/index.ts`)

1. **Invoice**: Main invoice record with financial data and processing status
2. **LineItem**: Individual line items with booking and financial details
3. **Vendor**: Vendor configuration including business model and processing rules
4. **ValidationRule**: Business rules for validation with conditions and actions
5. **User**: User profiles with roles and permissions

### Validation Models (`src/types/models/validation.ts`)

1. **ValidationEvidence**: Detailed evidence for each rule execution
2. **ValidationResult**: Results of validation with pass/fail status
3. **LineItemValidation**: Aggregated validation status for line items

## State Management

Uses Redux Toolkit with the following slices:

1. **auth.slice.ts**: Authentication state and user management
2. **invoice.slice.ts**: Invoice data and operations
3. **vendor.slice.ts**: Vendor management
4. **ui.slice.ts**: UI state (loading, errors, modals)

## Component Architecture

### Layout Components
- `MainLayout`: Protected route wrapper with navigation
- `AuthLayout`: Public route wrapper for auth pages

### Feature Components
- `ValidationEvidence`: Displays validation rule results with evidence
- `LineItemDetail`: Shows line item details with validation results
- `InvoiceList`: Paginated invoice listing with filters
- `VendorList`: Vendor management interface

### Common Components
- `Card`: Reusable card container
- `MetricCard`: Dashboard metric display
- `Button`, `Input`, `Select`: Form components

## Hook Architecture

Custom hooks provide business logic abstraction:

1. **useAuth**: Authentication operations and user state
2. **useInvoices**: Invoice CRUD operations with real-time updates
3. **useVendors**: Vendor management
4. **useRules**: Validation rule management
5. **useFirestore**: Generic Firestore operations

## Configuration System

### Environment Variables

All client-side configuration uses `VITE_` prefix:
- Feature flags (mock data, Firebase, real-time)
- Service configuration (API URLs, timeouts)
- Business rules (currencies, tolerances)
- UI settings (pagination, date formats)

### Application Configuration

Centralized in `src/config/app.config.ts`:
```typescript
export const AppConfig = {
    environment: import.meta.env.VITE_ENVIRONMENT,
    features: {
        useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
        // ... other features
    },
    // ... other config sections
};
```

## Validation Rule Engine

### Rule Types

1. **HARD Rules**: Must pass for validation to succeed
2. **SOFT Rules**: Generate warnings but don't block processing

### Rule Conditions

- String matching (exact, contains, pattern)
- Numeric comparison (equals, range, tolerance)
- Date validation (range, format)
- Business logic (commission calculation, duplicate check)

### Evidence Tracking

Each rule execution produces evidence:
- Input/output values
- Operator and comparison details
- Pass/fail reasoning
- Timestamp and context

## Security Considerations

1. **Authentication**: Handled by service layer (Mock or Firebase)
2. **Authorization**: Role-based access control in components
3. **Data Validation**: Client and server-side validation
4. **Environment Security**: Sensitive data in environment variables

## Performance Optimizations

1. **Lazy Loading**: Routes loaded on demand
2. **Memoization**: Complex calculations cached
3. **Pagination**: Large datasets paginated
4. **Debouncing**: Search and filter inputs debounced
5. **Virtual Scrolling**: (Future) For large lists

## Testing Strategy

1. **Unit Tests**: Service methods and utilities
2. **Integration Tests**: Hook and service integration
3. **Component Tests**: UI component behavior
4. **E2E Tests**: Full user workflows

## Deployment Architecture

### Development
- Vite dev server with hot module replacement
- Mock services for rapid development
- Source maps for debugging

### Production
- Static build deployed to CDN/hosting
- Environment-specific configuration
- Optional Firebase backend
- Docker containerization support

## Future Extensibility

### Adding New Backends

1. Create service implementations
2. Update service factory
3. Add configuration options
4. No component changes needed

### Adding New Features

1. Define types/interfaces
2. Implement service methods
3. Create hooks for business logic
4. Build UI components
5. Add to routing

### Scaling Considerations

1. **Horizontal Scaling**: Stateless design allows multiple instances
2. **Caching**: Add Redis/CDN for performance
3. **Queue Processing**: Background jobs for heavy operations
4. **Microservices**: Split into smaller services as needed