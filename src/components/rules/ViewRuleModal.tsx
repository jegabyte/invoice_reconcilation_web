import { Modal, StatusBadge } from '@/components/common';
import { ReconciliationRule } from '@/types/api.types';
import { formatDate } from '@/utils/formatters';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ViewRuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    rule: ReconciliationRule | null;
}

export default function ViewRuleModal({ isOpen, onClose, rule }: ViewRuleModalProps) {
    const [expandedSections, setExpandedSections] = useState({
        basic: true,
        configuration: true,
        businessModel: false,
        actions: true,
        conditions: true,
        metadata: false
    });

    if (!rule) return null;

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections({
            ...expandedSections,
            [section]: !expandedSections[section]
        });
    };

    const getActionLabel = (action: string) => {
        const labels: Record<string, string> = {
            'CONTINUE': 'Continue',
            'DISPUTED': 'Disputed',
            'FLAG_WARNING': 'Flag Warning',
            'FLAG_AS_CANCELLED_PENDING_REFUND': 'Flag as Cancelled Pending Refund',
            'FLAG_FOR_FUTURE_PROCESSING': 'Flag for Future Processing'
        };
        return labels[action] || action;
    };

    const getOperatorLabel = (operator: string) => {
        const labels: Record<string, string> = {
            'EQUALS': 'Equals',
            'NOT_EQUALS': 'Not Equals',
            'GREATER_THAN': 'Greater Than',
            'LESS_THAN': 'Less Than',
            'GREATER_THAN_OR_EQUAL': 'Greater Than or Equal',
            'LESS_THAN_OR_EQUAL': 'Less Than or Equal',
            'CONTAINS': 'Contains',
            'NOT_CONTAINS': 'Not Contains',
            'STARTS_WITH': 'Starts With',
            'ENDS_WITH': 'Ends With',
            'MATCHES_PATTERN': 'Matches Pattern',
            'BEFORE': 'Before',
            'AFTER': 'After',
            'ON': 'On',
            'WITHIN_DAYS': 'Within Days'
        };
        return labels[operator] || operator;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Rule Details" size="lg">
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Basic Information */}
                <div className="bg-gray-50 p-3 rounded-lg">
                    <button
                        type="button"
                        onClick={() => toggleSection('basic')}
                        className="w-full flex items-center justify-between text-left"
                    >
                        <h3 className="text-base font-medium text-gray-900">Basic Information</h3>
                        {expandedSections.basic ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                    </button>

                    {expandedSections.basic && (
                        <div className="mt-3 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Rule ID</label>
                                    <p className="mt-1 text-sm text-gray-900">{rule.ruleId || rule.id}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Rule Name</label>
                                    <p className="mt-1 text-sm text-gray-900">{rule.ruleName}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Description</label>
                                <p className="mt-1 text-sm text-gray-900">{rule.description || 'No description provided'}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Configuration */}
                <div className="bg-gray-50 p-3 rounded-lg">
                    <button
                        type="button"
                        onClick={() => toggleSection('configuration')}
                        className="w-full flex items-center justify-between text-left"
                    >
                        <h3 className="text-base font-medium text-gray-900">Configuration</h3>
                        {expandedSections.configuration ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                    </button>

                    {expandedSections.configuration && (
                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Vendor</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {rule.vendorCode === '*' || !rule.vendorCode ? 'All Vendors' : rule.vendorCode}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Entity Type</label>
                                <p className="mt-1 text-sm text-gray-900">{rule.entityType}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Rule Type</label>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    rule.ruleType === 'HARD'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {rule.ruleType}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Priority</label>
                                <p className="mt-1 text-sm text-gray-900">{rule.priority}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Status</label>
                                <StatusBadge status={rule.isActive ? 'ACTIVE' : 'INACTIVE'} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Version</label>
                                <p className="mt-1 text-sm text-gray-900">{rule.version || 'v1.0'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Effective From</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {rule.effectiveFrom ? formatDate(rule.effectiveFrom) : 'Always'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Effective To</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {rule.effectiveTo ? formatDate(rule.effectiveTo) : 'Always'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Business Model */}
                {rule.businessModel && (
                    <div className="border border-gray-200 rounded-lg">
                        <button
                            type="button"
                            onClick={() => toggleSection('businessModel')}
                            className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-gray-50"
                        >
                            <span className="text-base font-medium text-gray-900">Business Model</span>
                            {expandedSections.businessModel ? (
                                <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                        </button>

                        {expandedSections.businessModel && (
                            <div className="p-3 border-t border-gray-200 space-y-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Type</label>
                                    <p className="mt-1 text-sm text-gray-900">{rule.businessModel.type}</p>
                                </div>
                                {rule.businessModel.commissionPercentage && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Commission %</label>
                                        <p className="mt-1 text-sm text-gray-900">{rule.businessModel.commissionPercentage}%</p>
                                    </div>
                                )}
                                {rule.businessModel.markupPercentage && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Markup %</label>
                                        <p className="mt-1 text-sm text-gray-900">{rule.businessModel.markupPercentage}%</p>
                                    </div>
                                )}
                                {rule.businessModel.profitPercentage && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Profit %</label>
                                        <p className="mt-1 text-sm text-gray-900">{rule.businessModel.profitPercentage}%</p>
                                    </div>
                                )}
                                {rule.businessModel.calculationBase && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Calculation Base</label>
                                        <p className="mt-1 text-sm text-gray-900">{rule.businessModel.calculationBase}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="border border-gray-200 rounded-lg">
                    <button
                        type="button"
                        onClick={() => toggleSection('actions')}
                        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-gray-50"
                    >
                        <span className="text-base font-medium text-gray-900">Actions Configuration</span>
                        {expandedSections.actions ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                    </button>

                    {expandedSections.actions && rule.actions && (
                        <div className="p-3 border-t border-gray-200 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">On Match</label>
                                <p className="mt-1 text-sm text-gray-900">{getActionLabel(rule.actions.onMatch)}</p>
                                {rule.actions.disputeType && rule.actions.onMatch === 'DISPUTED' && (
                                    <p className="mt-1 text-xs text-gray-600">Dispute Type: {rule.actions.disputeType}</p>
                                )}
                                {rule.actions.warningType && rule.actions.onMatch === 'FLAG_WARNING' && (
                                    <p className="mt-1 text-xs text-gray-600">Warning Type: {rule.actions.warningType}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">On Mismatch</label>
                                <p className="mt-1 text-sm text-gray-900">{getActionLabel(rule.actions.onMismatch)}</p>
                                {rule.actions.disputeType && rule.actions.onMismatch === 'DISPUTED' && (
                                    <p className="mt-1 text-xs text-gray-600">Dispute Type: {rule.actions.disputeType}</p>
                                )}
                                {rule.actions.warningType && rule.actions.onMismatch === 'FLAG_WARNING' && (
                                    <p className="mt-1 text-xs text-gray-600">Warning Type: {rule.actions.warningType}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Conditions */}
                <div className="border border-gray-200 rounded-lg">
                    <button
                        type="button"
                        onClick={() => toggleSection('conditions')}
                        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-gray-50"
                    >
                        <span className="text-base font-medium text-gray-900">
                            Conditions ({rule.conditions?.length || 0})
                        </span>
                        {expandedSections.conditions ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                    </button>

                    {expandedSections.conditions && rule.conditions && (
                        <div className="p-3 border-t border-gray-200 space-y-3">
                            {rule.conditions.map((condition, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-3">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                                        Condition #{index + 1}
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-500">Type:</span>
                                            <span className="ml-2 text-gray-900">{condition.type}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-500">Operator:</span>
                                            <span className="ml-2 text-gray-900">{getOperatorLabel(condition.operator)}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-500">Invoice Field:</span>
                                            <span className="ml-2 text-gray-900">{condition.invoiceField}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-500">OMS Field:</span>
                                            <span className="ml-2 text-gray-900">{condition.omsField}</span>
                                        </div>
                                        {condition.value && (
                                            <div>
                                                <span className="font-medium text-gray-500">Value:</span>
                                                <span className="ml-2 text-gray-900">{condition.value}</span>
                                            </div>
                                        )}
                                        {condition.configuration && Object.keys(condition.configuration).length > 0 && (
                                            <div>
                                                <span className="font-medium text-gray-500">Configuration:</span>
                                                <pre className="mt-1 text-xs bg-gray-50 p-2 rounded">
                                                    {JSON.stringify(condition.configuration, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Metadata */}
                <div className="border border-gray-200 rounded-lg">
                    <button
                        type="button"
                        onClick={() => toggleSection('metadata')}
                        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-gray-50"
                    >
                        <span className="text-base font-medium text-gray-900">Metadata</span>
                        {expandedSections.metadata ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                    </button>

                    {expandedSections.metadata && (
                        <div className="p-3 border-t border-gray-200 space-y-2">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Created At</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {rule.createdAt ? formatDate(rule.createdAt) : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Updated At</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {rule.updatedAt ? formatDate(rule.updatedAt) : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Usage Count</label>
                                    <p className="mt-1 text-sm text-gray-900">{rule.usageCount || 0} times</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Last Used</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {rule.lastUsed ? formatDate(rule.lastUsed) : 'Never'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-3 flex justify-end">
                <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
}
