import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { RuleResult } from '@/types/models';
import { formatDate } from '@/utils/formatters';

interface ValidationEvidenceProps {
    ruleResults: RuleResult[];
    className?: string;
}

export function ValidationEvidence({ ruleResults, className = '' }: ValidationEvidenceProps) {
    const getStatusIcon = (result: string) => {
        switch (result) {
            case 'PASSED':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'FAILED':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'WARNING':
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            default:
                return <Info className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (result: string) => {
        switch (result) {
            case 'PASSED':
                return 'bg-green-50 border-green-200';
            case 'FAILED':
                return 'bg-red-50 border-red-200';
            case 'WARNING':
                return 'bg-yellow-50 border-yellow-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const getSeverityBadge = (ruleType: 'HARD' | 'SOFT') => {
        return ruleType === 'HARD' ? (
            <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                Hard Rule
            </span>
        ) : (
            <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                Soft Rule
            </span>
        );
    };

    if (!ruleResults || ruleResults.length === 0) {
        return (
            <div className={`text-center py-8 text-gray-500 ${className}`}>
                No validation results available
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <h3 className="text-lg font-medium text-gray-900">Validation Evidence</h3>
            
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">
                        {ruleResults.filter(r => r.result === 'PASSED').length}
                    </div>
                    <div className="text-sm text-green-600">Rules Passed</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-700">
                        {ruleResults.filter(r => r.result === 'WARNING').length}
                    </div>
                    <div className="text-sm text-yellow-600">Warnings</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-700">
                        {ruleResults.filter(r => r.result === 'FAILED').length}
                    </div>
                    <div className="text-sm text-red-600">Rules Failed</div>
                </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-3">
                {ruleResults.map((rule, index) => (
                    <div
                        key={`${rule.ruleId}-${index}`}
                        className={`border rounded-lg p-4 ${getStatusColor(rule.result)}`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                                {getStatusIcon(rule.result)}
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <h4 className="font-medium text-gray-900">{rule.ruleName}</h4>
                                        {getSeverityBadge(rule.ruleType)}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{rule.message}</p>
                                    
                                    {rule.evidence && (
                                        <div className="mt-3 space-y-2">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-700">Field:</span>{' '}
                                                    <span className="text-gray-600">{rule.field}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Operator:</span>{' '}
                                                    <span className="text-gray-600">{rule.operator}</span>
                                                </div>
                                            </div>
                                            
                                            {rule.expectedValue !== undefined && (
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-medium text-gray-700">Expected:</span>{' '}
                                                        <span className="text-gray-600">
                                                            {JSON.stringify(rule.expectedValue)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-700">Actual:</span>{' '}
                                                        <span className="text-gray-600">
                                                            {JSON.stringify(rule.actualValue)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {rule.evidence.details && (
                                                <div className="text-sm">
                                                    <span className="font-medium text-gray-700">Details:</span>{' '}
                                                    <span className="text-gray-600">{rule.evidence.details}</span>
                                                </div>
                                            )}
                                            
                                            <div className="text-xs text-gray-500 mt-2">
                                                Validated at: {formatDate(rule.evidence.timestamp, 'MMM dd, yyyy HH:mm:ss')}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="text-sm text-gray-500">
                                Rule ID: {rule.ruleId}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}