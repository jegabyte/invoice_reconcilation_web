export interface ValidationEvidence {
    ruleId: string;
    ruleName: string;
    ruleType: 'HARD' | 'SOFT';
    field: string;
    operator: string;
    expectedValue: any;
    actualValue: any;
    passed: boolean;
    severity: 'ERROR' | 'WARNING' | 'INFO';
    message: string;
    details?: string;
    timestamp: Date;
}

export interface ValidationResult {
    id: string;
    lineItemId: string;
    invoiceId: string;
    ruleId: string;
    ruleName: string;
    ruleType: 'HARD' | 'SOFT';
    passed: boolean;
    evidence: ValidationEvidence;
    createdAt: Date;
}

export interface LineItemValidation {
    lineItemId: string;
    overallStatus: 'PASSED' | 'WARNING' | 'FAILED';
    totalRules: number;
    passedRules: number;
    failedRules: number;
    warnings: number;
    hardErrors: number;
    softErrors: number;
    validationResults: ValidationResult[];
    validatedAt: Date;
}

export interface ValidationSummary {
    invoiceId: string;
    totalLineItems: number;
    validatedLineItems: number;
    passedLineItems: number;
    failedLineItems: number;
    warningLineItems: number;
    totalRulesApplied: number;
    totalRulesPassed: number;
    totalRulesFailed: number;
    criticalErrors: number;
    warnings: number;
    validationCompletedAt?: Date;
}