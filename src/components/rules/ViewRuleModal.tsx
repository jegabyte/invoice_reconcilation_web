import { Modal, StatusBadge } from '@/components/common';
import { ValidationRule } from '@/types/models';
import { formatDate } from '@/utils/formatters';

interface ViewRuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    rule: ValidationRule | null;
}

export default function ViewRuleModal({ isOpen, onClose, rule }: ViewRuleModalProps) {
    if (!rule) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Rule Details" size="lg">
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Rule Name</h3>
                        <p className="mt-1 text-sm text-gray-900">{rule.ruleName}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        <p className="mt-1">
                            <StatusBadge status={rule.isActive ? 'ACTIVE' : 'INACTIVE'} />
                        </p>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1 text-sm text-gray-900">{rule.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Category</h3>
                        <p className="mt-1 text-sm text-gray-900">{rule.category}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Type</h3>
                        <p className="mt-1 text-sm text-gray-900">{rule.ruleType}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                        <p className="mt-1 text-sm text-gray-900">{rule.priority}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Entity Type</h3>
                        <p className="mt-1 text-sm text-gray-900">{rule.entityType}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Vendor Code</h3>
                        <p className="mt-1 text-sm text-gray-900">{rule.vendorCode || 'All Vendors'}</p>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Conditions</h3>
                    <div className="space-y-2">
                        {rule.conditions.map((condition, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-md">
                                <p className="text-sm text-gray-900">
                                    {condition.type} - {condition.operator}
                                </p>
                                {condition.invoiceField && (
                                    <p className="text-xs text-gray-600 mt-1">
                                        Invoice Field: {condition.invoiceField}
                                    </p>
                                )}
                                {condition.value && (
                                    <p className="text-xs text-gray-600">
                                        Value: {condition.value}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Performance Metrics</h3>
                    <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-md">
                        <div>
                            <p className="text-xs text-gray-600">Execution Count</p>
                            <p className="text-sm font-medium text-gray-900">{rule.metrics.executionCount}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Pass Rate</p>
                            <p className="text-sm font-medium text-gray-900">
                                {rule.metrics.executionCount > 0 
                                    ? `${((rule.metrics.passCount / rule.metrics.executionCount) * 100).toFixed(1)}%`
                                    : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Average Time</p>
                            <p className="text-sm font-medium text-gray-900">{rule.metrics.averageExecutionTimeMs}ms</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Last Executed</p>
                            <p className="text-sm font-medium text-gray-900">
                                {rule.metrics.lastExecuted ? formatDate(rule.metrics.lastExecuted) : 'Never'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-600">Created</p>
                        <p className="text-gray-900">{formatDate(rule.metadata.createdAt)} by {rule.metadata.createdBy}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Last Modified</p>
                        <p className="text-gray-900">{formatDate(rule.metadata.lastModified)} by {rule.metadata.modifiedBy}</p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}