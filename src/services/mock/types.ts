// Mock service configuration types
export interface MockConfig {
    enableDelay?: boolean;
    delayMs?: number;
    persistData?: boolean;
    seedData?: boolean;
}

export interface MockStore {
    invoices: Map<string, any>;
    vendors: Map<string, any>;
    lineItems: Map<string, any>;
    rules: Map<string, any>;
    users: Map<string, any>;
    validationResults: Map<string, any>;
}