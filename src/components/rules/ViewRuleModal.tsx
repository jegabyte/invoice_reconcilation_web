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
                                    <p className="mt-1 text-sm text-gray-900">{rule.id}</p>
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
                                <label className="block text-sm font-medium text-gray-500">Vendor Code</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {(rule as any).vendorCode || rule.vendorId || 'GLOBAL'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Vendor ID</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {rule.vendorId === '*' || !rule.vendorId ? 'All Vendors' : rule.vendorId}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Entity Type</label>
                                <p className="mt-1 text-sm text-gray-900">{(rule as any).entityType || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Category</label>
                                <p className="mt-1 text-sm text-gray-900">{rule.category}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Rule Type (API)</label>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    (rule as any).apiRuleType === 'HARD'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {(rule as any).apiRuleType || rule.ruleType}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Internal Type</label>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    rule.ruleType === 'VALIDATION'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-blue-100 text-blue-800'
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
                                <p className="mt-1 text-sm text-gray-900">{(rule as any).version || 'v1.0'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Always Use Latest</label>
                                <p className="mt-1 text-sm text-gray-900">{(rule as any).alwaysUseLatest ? 'Yes' : 'No'}</p>
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
                                    {rule.effectiveTo ? formatDate(rule.effectiveTo) : 'Never'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tolerance Settings */}
                {rule.tolerance && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <h3 className="text-base font-medium text-gray-900 mb-3">Tolerance Settings</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Type</label>
                                <p className="mt-1 text-sm text-gray-900">{rule.tolerance.type}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Value</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {rule.tolerance.type === 'PERCENTAGE' ? `${rule.tolerance.value}%` : rule.tolerance.value}
                                </p>
                            </div>
                        </div>
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

                    {expandedSections.actions && rule.actions && rule.actions.length > 0 && (
                        <div className="p-3 border-t border-gray-200 space-y-3">
                            {rule.actions.map((action, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-3">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                                        Action #{index + 1}
                                    </h4>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="font-medium text-gray-500 text-sm">Type:</span>
                                            <span className="ml-2 text-gray-900 text-sm">{action.type}</span>
                                        </div>
                                        {action.parameters && Object.keys(action.parameters).length > 0 && (
                                            <div>
                                                <span className="font-medium text-gray-500 text-sm">Parameters:</span>
                                                <div className="mt-1 bg-gray-50 p-2 rounded space-y-1">
                                                    {Object.entries(action.parameters).map(([key, value]) => (
                                                        <div key={key} className="text-xs">
                                                            <span className="font-medium text-gray-600">{key}:</span>
                                                            <span className="ml-2 text-gray-900">{String(value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
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
                                            <span className="font-medium text-gray-500">Field:</span>
                                            <span className="ml-2 text-gray-900">{condition.field}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-500">Operator:</span>
                                            <span className="ml-2 text-gray-900">{getOperatorLabel(condition.operator)}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-500">Data Type:</span>
                                            <span className="ml-2 text-gray-900">{condition.dataType}</span>
                                        </div>
                                        {condition.value && (
                                            <div>
                                                <span className="font-medium text-gray-500">Value:</span>
                                                {typeof condition.value === 'object' ? (
                                                    <div className="mt-1 bg-gray-50 p-2 rounded text-xs">
                                                        {Object.entries(condition.value).map(([key, val]) => (
                                                            <div key={key}>
                                                                <span className="font-medium text-gray-600">{key}:</span>
                                                                <span className="ml-2 text-gray-900">
                                                                    {Array.isArray(val) ? val.join(', ') : String(val)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="ml-2 text-gray-900">{String(condition.value)}</span>
                                                )}
                                            </div>
                                        )}
                                        {condition.caseSensitive !== undefined && (
                                            <div>
                                                <span className="font-medium text-gray-500">Case Sensitive:</span>
                                                <span className="ml-2 text-gray-900">{condition.caseSensitive ? 'Yes' : 'No'}</span>
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
                                    <label className="block text-sm font-medium text-gray-500">Created By</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {rule.createdBy || 'System'}
                                    </p>
                                </div>
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Source</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {(rule as any).metadata?.source || 'API'}
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
