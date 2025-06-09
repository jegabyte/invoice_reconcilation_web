import { useState, useEffect } from 'react';
import { LineItem } from '@/types/models';
import { ValidationResult } from '@/types/models/validation';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { ValidationEvidence } from './ValidationEvidence';
import { Card } from '@/components/common';
import { FileText, Calendar, User, Home, AlertCircle } from 'lucide-react';
import { ServiceFactory } from '@/services/factory/service-factory';

interface LineItemDetailProps {
    lineItem: LineItem;
    onClose?: () => void;
}

export function LineItemDetail({ lineItem, onClose }: LineItemDetailProps) {
    const [, setValidationResults] = useState<ValidationResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadValidationResults();
    }, [lineItem.id]);

    const loadValidationResults = async () => {
        try {
            setLoading(true);
            const dataService = ServiceFactory.getDataService();
            const results = await dataService.getLineItemValidationResults(lineItem.id);
            setValidationResults(results);
        } catch (error) {
            console.error('Error loading validation results:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusColors: { [key: string]: string } = {
            PASSED: 'bg-green-100 text-green-800',
            WARNING: 'bg-yellow-100 text-yellow-800',
            FAILED: 'bg-red-100 text-red-800',
            DISPUTED: 'bg-red-100 text-red-800'
        };
        return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">Line Item Details</h2>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Validation Status Summary */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Validation Status</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(lineItem.validation.overallStatus || lineItem.validation.status)}`}>
                        {lineItem.validation.overallStatus || lineItem.validation.status}
                    </span>
                </div>
                
                {lineItem.validation.totalRules && (
                    <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{lineItem.validation.totalRules}</div>
                            <div className="text-sm text-gray-500">Total Rules</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{lineItem.validation.passedRules}</div>
                            <div className="text-sm text-gray-500">Passed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{lineItem.validation.warnings}</div>
                            <div className="text-sm text-gray-500">Warnings</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{lineItem.validation.failedRules}</div>
                            <div className="text-sm text-gray-500">Failed</div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Booking Information */}
            <Card title="Booking Information">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Confirmation Number</p>
                                <p className="font-medium">{lineItem.booking.confirmationNumber}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <User className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Guest Name</p>
                                <p className="font-medium">{lineItem.booking.guestName}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <Home className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Property</p>
                                <p className="font-medium">{lineItem.booking.propertyName}</p>
                                <p className="text-sm text-gray-500">Room: {lineItem.booking.roomType}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Check-in</p>
                                <p className="font-medium">{formatDate(lineItem.booking.checkInDate)}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Check-out</p>
                                <p className="font-medium">{formatDate(lineItem.booking.checkOutDate)}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <AlertCircle className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="font-medium">{lineItem.booking.status}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Financial Information */}
            <Card title="Financial Details">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Room Rate</span>
                            <span className="font-medium">{formatCurrency(lineItem.financial.roomRate)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Nights</span>
                            <span className="font-medium">{lineItem.financial.nights}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-medium">{formatCurrency(lineItem.financial.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Taxes</span>
                            <span className="font-medium">{formatCurrency(lineItem.financial.taxes)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Fees</span>
                            <span className="font-medium">{formatCurrency(lineItem.financial.fees)}</span>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total Amount</span>
                            <span className="font-medium text-lg">{formatCurrency(lineItem.financial.totalAmount)}</span>
                        </div>
                        {lineItem.financial.commissionPercentage && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Commission Rate</span>
                                    <span className="font-medium">{lineItem.financial.commissionPercentage}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Commission Amount</span>
                                    <span className="font-medium">{formatCurrency(lineItem.financial.commissionAmount || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Net Amount</span>
                                    <span className="font-medium">{formatCurrency(lineItem.financial.netAmount || 0)}</span>
                                </div>
                            </>
                        )}
                        {lineItem.financial.variance !== undefined && lineItem.financial.variance !== 0 && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Variance</span>
                                <span className={`font-medium ${lineItem.financial.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {formatCurrency(Math.abs(lineItem.financial.variance))} ({lineItem.financial.variancePercentage}%)
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Validation Evidence */}
            <Card>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <ValidationEvidence ruleResults={lineItem.validation.rulesApplied} />
                )}
            </Card>

            {/* Issues */}
            {lineItem.validation.issues && lineItem.validation.issues.length > 0 && (
                <Card title="Validation Issues">
                    <div className="space-y-3">
                        {lineItem.validation.issues.map((issue, index) => (
                            <div key={index} className="border-l-4 border-red-400 bg-red-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-400" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-800">{issue.description}</p>
                                        {issue.field && (
                                            <p className="text-sm text-red-600 mt-1">Field: {issue.field}</p>
                                        )}
                                        {issue.expectedValue !== undefined && (
                                            <p className="text-sm text-red-600 mt-1">
                                                Expected: {JSON.stringify(issue.expectedValue)}, 
                                                Actual: {JSON.stringify(issue.actualValue)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}