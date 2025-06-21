import { useState, useEffect } from 'react';
import { Modal } from '@/components/common';
import { ReconciliationRule } from '@/types/api.types';
import { RuleCondition } from '@/types/models';
import { Plus, Trash2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { ConditionForm } from './ConditionForm';

interface AddRuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rule: Partial<ReconciliationRule>) => void;
    editingRule?: ReconciliationRule | null;
    vendors?: Array<{ id: string; vendorName: string; vendorCode: string }>;
}

export default function AddRuleModal({ isOpen, onClose, onSave, editingRule, vendors }: AddRuleModalProps) {
    const [formData, setFormData] = useState({
        ruleName: '',
        description: '',
        vendorCode: '',
        entityType: 'LINE_ITEM' as 'INVOICE' | 'LINE_ITEM',
        ruleType: 'HARD' as 'HARD' | 'SOFT',
        priority: 1,
        isActive: true,
        effectiveFrom: '',
        effectiveTo: '',
        businessModel: {
            type: '',
            commissionPercentage: '',
            markupPercentage: '',
            profitPercentage: '',
            calculationBase: ''
        },
        actions: {
            onMatch: 'CONTINUE' as any,
            onMatchConfig: {} as any,
            onMismatch: 'CONTINUE' as any,
            onMismatchConfig: {} as any,
            disputeType: undefined as string | undefined,
            warningType: undefined as string | undefined
        },
        conditions: [] as RuleCondition[]
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [expandedSections, setExpandedSections] = useState({
        businessModel: false,
        actions: true,
        conditions: true
    });

    useEffect(() => {
        if (editingRule) {
            // Helper function to format date for datetime-local input
            const formatDateForInput = (timestamp: string | Date | undefined) => {
                if (!timestamp) return '';
                // Convert to Date if needed
                const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
                // Format: yyyy-MM-ddThh:mm
                return date.toISOString().slice(0, 16);
            };

            setFormData({
                ruleName: editingRule.ruleName,
                description: editingRule.description,
                vendorCode: editingRule.vendorCode || '',
                entityType: editingRule.entityType,
                ruleType: editingRule.ruleType,
                priority: editingRule.priority,
                isActive: editingRule.isActive,
                effectiveFrom: formatDateForInput(editingRule.effectiveFrom),
                effectiveTo: formatDateForInput(editingRule.effectiveTo),
                businessModel: editingRule.businessModel ? {
                    type: editingRule.businessModel.type || '',
                    commissionPercentage: editingRule.businessModel.commissionPercentage?.toString() || '',
                    markupPercentage: editingRule.businessModel.markupPercentage?.toString() || '',
                    profitPercentage: editingRule.businessModel.profitPercentage?.toString() || '',
                    calculationBase: editingRule.businessModel.calculationBase || ''
                } : {
                    type: '',
                    commissionPercentage: '',
                    markupPercentage: '',
                    profitPercentage: '',
                    calculationBase: ''
                },
                actions: {
                    onMatch: editingRule.actions?.onMatch || 'CONTINUE',
                    onMatchConfig: {},
                    onMismatch: editingRule.actions?.onMismatch || 'CONTINUE',
                    onMismatchConfig: {},
                    disputeType: editingRule.actions?.disputeType || undefined,
                    warningType: editingRule.actions?.warningType || undefined
                },
                conditions: editingRule.conditions || []
            });
        }
    }, [editingRule]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.ruleName.trim()) {
            newErrors.ruleName = 'Rule name is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (formData.priority < 1 || formData.priority > 1000) {
            newErrors.priority = 'Priority must be between 1 and 1000';
        }

        if (formData.effectiveFrom && formData.effectiveTo) {
            if (new Date(formData.effectiveFrom) > new Date(formData.effectiveTo)) {
                newErrors.effectiveTo = 'Effective To must be after Effective From';
            }
        }

        if (formData.conditions.length === 0) {
            newErrors.conditions = 'At least one condition is required';
        }

        // Validate action configurations
        if (formData.actions.onMatch === 'DISPUTED' && !formData.actions.onMatchConfig.disputeType) {
            newErrors.onMatchDispute = 'Dispute type is required';
        }

        if (formData.actions.onMatch === 'FLAG_WARNING' && !formData.actions.onMatchConfig.warningType) {
            newErrors.onMatchWarning = 'Warning type is required';
        }

        if (formData.actions.onMismatch === 'DISPUTED' && !formData.actions.onMismatchConfig.disputeType) {
            newErrors.onMismatchDispute = 'Dispute type is required';
        }

        if (formData.actions.onMismatch === 'FLAG_WARNING' && !formData.actions.onMismatchConfig.warningType) {
            newErrors.onMismatchWarning = 'Warning type is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            // Generate rule ID if creating new rule
            const ruleId = editingRule?.ruleId ||
                `${formData.vendorCode || 'GEN'}RULE${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;

            // Convert string values to numbers for businessModel
            const businessModel = formData.businessModel.type ? {
                type: formData.businessModel.type as any,
                commissionPercentage: formData.businessModel.commissionPercentage ? parseFloat(formData.businessModel.commissionPercentage) : undefined,
                markupPercentage: formData.businessModel.markupPercentage ? parseFloat(formData.businessModel.markupPercentage) : undefined,
                profitPercentage: formData.businessModel.profitPercentage ? parseFloat(formData.businessModel.profitPercentage) : undefined,
                calculationBase: formData.businessModel.calculationBase as any
            } : undefined;

            // Prepare actions with proper structure
            const actions = {
                onMatch: formData.actions.onMatch,
                onMismatch: formData.actions.onMismatch,
                disputeType: formData.actions.onMatchConfig?.disputeType || formData.actions.onMismatchConfig?.disputeType,
                warningType: formData.actions.onMatchConfig?.warningType || formData.actions.onMismatchConfig?.warningType
            };

            onSave({
                ruleName: formData.ruleName,
                description: formData.description,
                vendorCode: formData.vendorCode,
                vendorId: formData.vendorCode || '*',
                entityType: formData.entityType,
                ruleType: formData.ruleType,
                category: 'CUSTOM',
                priority: formData.priority,
                isActive: formData.isActive,
                ruleId,
                version: editingRule?.version || 'v1.0',
                businessModel,
                actions,
                conditions: formData.conditions,
                effectiveFrom: formData.effectiveFrom || new Date().toISOString(),
                effectiveTo: formData.effectiveTo || null
            });
            onClose();
        }
    };

    const addCondition = () => {
        setFormData({
            ...formData,
            conditions: [
                ...formData.conditions,
                {
                    type: 'EXACT_MATCH' as const,
                    operator: 'EQUALS' as const,
                    invoiceField: '',
                    omsField: '',
                    configuration: {}
                }
            ]
        });
    };

    const updateCondition = (index: number, condition: RuleCondition) => {
        const newConditions = [...formData.conditions];
        newConditions[index] = condition;
        setFormData({ ...formData, conditions: newConditions });
    };

    const removeCondition = (index: number) => {
        setFormData({
            ...formData,
            conditions: formData.conditions.filter((_, i) => i !== index)
        });
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections({
            ...expandedSections,
            [section]: !expandedSections[section]
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingRule ? 'Edit Rule' : 'Create New Rule'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-3">
                {/* Two Column Layout */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-3">
                        {/* Basic Information */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-1.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Basic Information
                            </h3>
                            <div className="space-y-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Rule ID*
                                <Info className="inline h-3 w-3 ml-1 text-gray-400" />
                            </label>
                            <input
                                type="text"
                                value={editingRule?.ruleId || 'Auto-generated'}
                                disabled
                                className="mt-1 block w-full px-2.5 py-1.5 border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Rule Name*
                            </label>
                            <input
                                type="text"
                                value={formData.ruleName}
                                onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
                                className={`mt-1 block w-full px-2.5 py-1.5 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                    errors.ruleName ? 'border-red-300' : ''
                                }`}
                                required
                            />
                            {errors.ruleName && (
                                <p className="mt-1 text-sm text-red-600">{errors.ruleName}</p>
                            )}
                        </div>
                    </div>
                </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Description*
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className={`mt-1 block w-full px-2.5 py-1.5 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                errors.description ? 'border-red-300' : ''
                            }`}
                            rows={2}
                            required
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                    </div>
                        </div>
                    </div>

                {/* Configuration */}
                <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                    <h3 className="text-base font-medium text-gray-900">Configuration</h3>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Vendor*
                            </label>
                            <select
                                value={formData.vendorCode}
                                onChange={(e) => setFormData({ ...formData, vendorCode: e.target.value })}
                                className="mt-1 block w-full px-2.5 py-1.5 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                                <option value="">Select vendor...</option>
                                {vendors && vendors.map(vendor => (
                                    <option key={vendor.id} value={vendor.vendorCode}>
                                        {vendor.vendorName}
                                    </option>
                                ))}
                                <option value="*">GLOBAL (All Vendors)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Entity Type*
                            </label>
                            <select
                                value={formData.entityType}
                                onChange={(e) => setFormData({ ...formData, entityType: e.target.value as any })}
                                className="mt-1 block w-full px-2.5 py-1.5 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                                <option value="INVOICE">Invoice</option>
                                <option value="LINE_ITEM">Line Item</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Rule Type*
                            </label>
                            <select
                                value={formData.ruleType}
                                onChange={(e) => setFormData({ ...formData, ruleType: e.target.value as any })}
                                className="mt-1 block w-full px-2.5 py-1.5 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                                <option value="HARD">Hard</option>
                                <option value="SOFT">Soft</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Priority* (1-1000)
                            </label>
                            <input
                                type="number"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                                className={`mt-1 block w-full px-2.5 py-1.5 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                    errors.priority ? 'border-red-300' : ''
                                }`}
                                min="1"
                                max="1000"
                                required
                            />
                            {errors.priority && (
                                <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Version
                            </label>
                            <input
                                type="text"
                                value={editingRule?.version || 'v1.0'}
                                disabled
                                className="mt-1 block w-full px-2.5 py-1.5 border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 text-sm"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                Active
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Effective From
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.effectiveFrom}
                                onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                                className="mt-1 block w-full px-2.5 py-1.5 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Effective To
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.effectiveTo}
                                onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                                className={`mt-1 block w-full px-2.5 py-1.5 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                    errors.effectiveTo ? 'border-red-300' : ''
                                }`}
                            />
                            {errors.effectiveTo && (
                                <p className="mt-1 text-sm text-red-600">{errors.effectiveTo}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Business Model (Optional) */}
                <div className="border border-gray-200 rounded-lg">
                    <button
                        type="button"
                        onClick={() => toggleSection('businessModel')}
                        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-gray-50"
                    >
                        <span className="text-base font-medium text-gray-900">
                            Business Model (Optional)
                        </span>
                        {expandedSections.businessModel ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                    </button>

                    {expandedSections.businessModel && (
                        <div className="p-3 border-t border-gray-200 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Business Model Type
                                </label>
                                <select
                                    value={formData.businessModel.type}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        businessModel: { ...formData.businessModel, type: e.target.value }
                                    })}
                                    className="mt-1 block w-full px-2.5 py-1.5 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                >
                                    <option value="">None</option>
                                    <option value="NET_RATE">Net Rate</option>
                                    <option value="COMMISSION">Commission</option>
                                    <option value="SELL_RATE">Sell Rate</option>
                                    <option value="PROFIT_SHARING">Profit Sharing</option>
                                </select>
                            </div>

                            {formData.businessModel.type === 'COMMISSION' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Commission %
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.businessModel.commissionPercentage}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            businessModel: { ...formData.businessModel, commissionPercentage: e.target.value }
                                        })}
                                        className="mt-1 block w-full px-2.5 py-1.5 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                    />
                                </div>
                            )}

                            {formData.businessModel.type === 'SELL_RATE' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Markup %
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.businessModel.markupPercentage}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            businessModel: { ...formData.businessModel, markupPercentage: e.target.value }
                                        })}
                                        className="mt-1 block w-full px-2.5 py-1.5 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                    />
                                </div>
                            )}

                            {formData.businessModel.type === 'PROFIT_SHARING' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Profit %
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.businessModel.profitPercentage}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                businessModel: { ...formData.businessModel, profitPercentage: e.target.value }
                                            })}
                                            className="mt-1 block w-full px-2.5 py-1.5 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Calculation Base
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.businessModel.calculationBase}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                businessModel: { ...formData.businessModel, calculationBase: e.target.value }
                                            })}
                                            className="mt-1 block w-full px-2.5 py-1.5 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="e.g., NET_REVENUE"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions Configuration */}
                <div className="border border-gray-200 rounded-lg">
                    <button
                        type="button"
                        onClick={() => toggleSection('actions')}
                        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-gray-50"
                    >
                        <span className="text-base font-medium text-gray-900">
                            Actions Configuration*
                        </span>
                        {expandedSections.actions ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                    </button>

                    {expandedSections.actions && (
                        <div className="p-3 border-t border-gray-200 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    On Match*
                                </label>
                                <select
                                    value={formData.actions.onMatch}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        actions: { ...formData.actions, onMatch: e.target.value as any }
                                    })}
                                    className="mt-1 block w-full px-2.5 py-1.5 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                >
                                    <option value="CONTINUE">Continue</option>
                                    <option value="DISPUTED">Disputed</option>
                                    <option value="FLAG_WARNING">Flag Warning</option>
                                    <option value="FLAG_AS_CANCELLED_PENDING_REFUND">Flag as Cancelled Pending Refund</option>
                                    <option value="FLAG_FOR_FUTURE_PROCESSING">Flag for Future Processing</option>
                                </select>
                            </div>

                            {formData.actions.onMatch === 'DISPUTED' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Dispute Type*
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.actions.onMatchConfig.disputeType || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            actions: {
                                                ...formData.actions,
                                                onMatchConfig: { ...formData.actions.onMatchConfig, disputeType: e.target.value }
                                            }
                                        })}
                                        className={`mt-1 block w-full px-2.5 py-1.5 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                            errors.onMatchDispute ? 'border-red-300' : ''
                                        }`}
                                        placeholder="e.g., RATE_MISMATCH"
                                    />
                                    {errors.onMatchDispute && (
                                        <p className="mt-1 text-sm text-red-600">{errors.onMatchDispute}</p>
                                    )}
                                </div>
                            )}

                            {formData.actions.onMatch === 'FLAG_WARNING' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Warning Type*
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.actions.onMatchConfig.warningType || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            actions: {
                                                ...formData.actions,
                                                onMatchConfig: { ...formData.actions.onMatchConfig, warningType: e.target.value }
                                            }
                                        })}
                                        className={`mt-1 block w-full px-2.5 py-1.5 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                            errors.onMatchWarning ? 'border-red-300' : ''
                                        }`}
                                        placeholder="e.g., MINOR_DISCREPANCY"
                                    />
                                    {errors.onMatchWarning && (
                                        <p className="mt-1 text-sm text-red-600">{errors.onMatchWarning}</p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    On Mismatch*
                                </label>
                                <select
                                    value={formData.actions.onMismatch}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        actions: { ...formData.actions, onMismatch: e.target.value as any }
                                    })}
                                    className="mt-1 block w-full px-2.5 py-1.5 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                >
                                    <option value="CONTINUE">Continue</option>
                                    <option value="DISPUTED">Disputed</option>
                                    <option value="FLAG_WARNING">Flag Warning</option>
                                </select>
                            </div>

                            {formData.actions.onMismatch === 'DISPUTED' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Dispute Type*
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.actions.onMismatchConfig.disputeType || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            actions: {
                                                ...formData.actions,
                                                onMismatchConfig: { ...formData.actions.onMismatchConfig, disputeType: e.target.value }
                                            }
                                        })}
                                        className={`mt-1 block w-full px-2.5 py-1.5 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                            errors.onMismatchDispute ? 'border-red-300' : ''
                                        }`}
                                        placeholder="e.g., BOOKING_NOT_FOUND"
                                    />
                                    {errors.onMismatchDispute && (
                                        <p className="mt-1 text-sm text-red-600">{errors.onMismatchDispute}</p>
                                    )}
                                </div>
                            )}

                            {formData.actions.onMismatch === 'FLAG_WARNING' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Warning Type*
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.actions.onMismatchConfig.warningType || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            actions: {
                                                ...formData.actions,
                                                onMismatchConfig: { ...formData.actions.onMismatchConfig, warningType: e.target.value }
                                            }
                                        })}
                                        className={`mt-1 block w-full px-2.5 py-1.5 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                            errors.onMismatchWarning ? 'border-red-300' : ''
                                        }`}
                                        placeholder="e.g., NEEDS_REVIEW"
                                    />
                                    {errors.onMismatchWarning && (
                                        <p className="mt-1 text-sm text-red-600">{errors.onMismatchWarning}</p>
                                    )}
                                </div>
                            )}
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
                            Conditions* ({formData.conditions.length} {formData.conditions.length === 1 ? 'condition' : 'conditions'})
                        </span>
                        {expandedSections.conditions ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                    </button>

                    {expandedSections.conditions && (
                        <div className="p-3 border-t border-gray-200 space-y-3">
                            {errors.conditions && (
                                <p className="text-sm text-red-600">{errors.conditions}</p>
                            )}

                            {formData.conditions.map((condition, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-medium text-gray-900">
                                            Condition #{index + 1}
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={() => removeCondition(index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <ConditionForm
                                        condition={condition}
                                        onChange={(updated) => updateCondition(index, updated)}
                                    />
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addCondition}
                                className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Condition
                            </button>
                        </div>
                    )}
                </div>

                {/* Form Actions */}
                <div className="pt-3 flex justify-end space-x-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Save as Draft
                    </button>
                    <button
                        type="submit"
                        className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        {editingRule ? 'Update' : 'Save'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
