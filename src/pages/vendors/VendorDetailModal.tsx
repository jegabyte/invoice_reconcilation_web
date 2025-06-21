import { Modal } from '@/components/common';
import { VendorConfiguration } from '@/types/api.types';
import { formatDate } from '@/utils/formatters';
import { ChevronDown, ChevronUp, Edit2, Save, X } from 'lucide-react';
import { useState } from 'react';

interface VendorDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    vendor: VendorConfiguration | null;
    onEdit?: (vendor: VendorConfiguration) => void;
    onUpdate?: (vendorId: string, updates: Partial<VendorConfiguration>) => Promise<void>;
}

export default function VendorDetailModal({ 
    isOpen, 
    onClose, 
    vendor, 
    onEdit,
    onUpdate 
}: VendorDetailModalProps) {
    const [expandedSections, setExpandedSections] = useState({
        basic: true,
        integration: true,
        extraction: true,
        reconciliation: true,
        invoice: true,
        contacts: true,
        metadata: false
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editedVendor, setEditedVendor] = useState<VendorConfiguration | null>(null);
    const [saving, setSaving] = useState(false);

    if (!vendor) return null;

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections({
            ...expandedSections,
            [section]: !expandedSections[section]
        });
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditedVendor({ ...vendor });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedVendor(null);
    };

    const handleSave = async () => {
        if (!editedVendor || !vendor.id || !onUpdate) return;
        
        setSaving(true);
        try {
            await onUpdate(vendor.id, editedVendor);
            setIsEditing(false);
            setEditedVendor(null);
        } catch (error) {
            console.error('Error updating vendor:', error);
        } finally {
            setSaving(false);
        }
    };

    const updateField = (path: string, value: any) => {
        if (!editedVendor) return;
        
        const keys = path.split('.');
        const updated = { ...editedVendor };
        let current: any = updated;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        setEditedVendor(updated);
    };

    const displayVendor = isEditing ? editedVendor! : vendor;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Vendor Details" size="xl">
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Header Actions */}
                <div className="flex justify-between items-center pb-3 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">{vendor.vendorName}</h2>
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                >
                                    <Save className="h-4 w-4 mr-1" />
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleEdit}
                                className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                <Edit2 className="h-4 w-4 mr-1" />
                                Edit
                            </button>
                        )}
                    </div>
                </div>

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
                                    <label className="block text-sm font-medium text-gray-500">Vendor Code</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={displayVendor.vendorCode}
                                            onChange={(e) => updateField('vendorCode', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-900">{displayVendor.vendorCode}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Status</label>
                                    {isEditing ? (
                                        <select
                                            value={displayVendor.isActive ? 'active' : 'inactive'}
                                            onChange={(e) => updateField('isActive', e.target.value === 'active')}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    ) : (
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            displayVendor.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {displayVendor.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Vendor Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={displayVendor.vendorName}
                                        onChange={(e) => updateField('vendorName', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                ) : (
                                    <p className="mt-1 text-sm text-gray-900">{displayVendor.vendorName}</p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Type</label>
                                    {isEditing ? (
                                        <select
                                            value={displayVendor.vendorType}
                                            onChange={(e) => updateField('vendorType', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        >
                                            <option value="OTA">OTA</option>
                                            <option value="DIRECT">Direct</option>
                                            <option value="CHANNEL_MANAGER">Channel Manager</option>
                                            <option value="GDS">GDS</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    ) : (
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {displayVendor.vendorType}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Business Model</label>
                                    {isEditing ? (
                                        <select
                                            value={displayVendor.businessModel || 'NET_RATE'}
                                            onChange={(e) => updateField('businessModel', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        >
                                            <option value="NET_RATE">Net Rate</option>
                                            <option value="COMMISSION">Commission</option>
                                            <option value="SELL_RATE">Sell Rate</option>
                                            <option value="PROFIT_SHARING">Profit Sharing</option>
                                            <option value="MIXED">Mixed</option>
                                        </select>
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-900">{displayVendor.businessModel || 'NET_RATE'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Integration Settings */}
                <div className="bg-gray-50 p-3 rounded-lg">
                    <button
                        type="button"
                        onClick={() => toggleSection('integration')}
                        className="w-full flex items-center justify-between text-left"
                    >
                        <h3 className="text-base font-medium text-gray-900">Integration Settings</h3>
                        {expandedSections.integration ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                    </button>

                    {expandedSections.integration && displayVendor.integrationSettings && (
                        <div className="mt-3 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">ID Prefix</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={displayVendor.integrationSettings.idPrefix || ''}
                                            onChange={(e) => updateField('integrationSettings.idPrefix', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-900">{displayVendor.integrationSettings.idPrefix || 'N/A'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">ID Field</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={displayVendor.integrationSettings.idField || ''}
                                            onChange={(e) => updateField('integrationSettings.idField', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-900">{displayVendor.integrationSettings.idField || 'N/A'}</p>
                                    )}
                                </div>
                            </div>
                            {displayVendor.integrationSettings.defaultTolerances && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-2">Default Tolerances</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400">Rate Tolerance (%)</label>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={displayVendor.integrationSettings.defaultTolerances.rate || 0}
                                                    onChange={(e) => updateField('integrationSettings.defaultTolerances.rate', parseFloat(e.target.value))}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                />
                                            ) : (
                                                <p className="mt-1 text-sm text-gray-900">{displayVendor.integrationSettings.defaultTolerances.rate}%</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400">Tax Tolerance (%)</label>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={displayVendor.integrationSettings.defaultTolerances.tax || 0}
                                                    onChange={(e) => updateField('integrationSettings.defaultTolerances.tax', parseFloat(e.target.value))}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                />
                                            ) : (
                                                <p className="mt-1 text-sm text-gray-900">{displayVendor.integrationSettings.defaultTolerances.tax}%</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Extraction Settings */}
                <div className="bg-gray-50 p-3 rounded-lg">
                    <button
                        type="button"
                        onClick={() => toggleSection('extraction')}
                        className="w-full flex items-center justify-between text-left"
                    >
                        <h3 className="text-base font-medium text-gray-900">Extraction Settings</h3>
                        {expandedSections.extraction ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                    </button>

                    {expandedSections.extraction && displayVendor.extractionSettings && (
                        <div className="mt-3 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Template ID</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={displayVendor.extractionSettings.templateId || ''}
                                            onChange={(e) => updateField('extractionSettings.templateId', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-900">{displayVendor.extractionSettings.templateId}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Extraction Model</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={displayVendor.extractionSettings.extractionModel || ''}
                                            onChange={(e) => updateField('extractionSettings.extractionModel', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-900">{displayVendor.extractionSettings.extractionModel}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Confidence Threshold</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            value={displayVendor.extractionSettings.confidenceThreshold || 0}
                                            onChange={(e) => updateField('extractionSettings.confidenceThreshold', parseFloat(e.target.value))}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-900">{(displayVendor.extractionSettings.confidenceThreshold * 100).toFixed(0)}%</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Manual Review</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            value={displayVendor.extractionSettings.manualReviewThreshold || 0}
                                            onChange={(e) => updateField('extractionSettings.manualReviewThreshold', parseFloat(e.target.value))}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-900">{(displayVendor.extractionSettings.manualReviewThreshold * 100).toFixed(0)}%</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Auto Review</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            value={displayVendor.extractionSettings.autoReviewThreshold || 0}
                                            onChange={(e) => updateField('extractionSettings.autoReviewThreshold', parseFloat(e.target.value))}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-900">{(displayVendor.extractionSettings.autoReviewThreshold * 100).toFixed(0)}%</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Reconciliation Settings */}
                <div className="bg-gray-50 p-3 rounded-lg">
                    <button
                        type="button"
                        onClick={() => toggleSection('reconciliation')}
                        className="w-full flex items-center justify-between text-left"
                    >
                        <h3 className="text-base font-medium text-gray-900">Reconciliation Settings</h3>
                        {expandedSections.reconciliation ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                    </button>

                    {expandedSections.reconciliation && displayVendor.reconciliationSettings && (
                        <div className="mt-3 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Auto Approval</label>
                                    {isEditing ? (
                                        <select
                                            value={displayVendor.reconciliationSettings.allowAutoApproval ? 'true' : 'false'}
                                            onChange={(e) => updateField('reconciliationSettings.allowAutoApproval', e.target.value === 'true')}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        >
                                            <option value="true">Enabled</option>
                                            <option value="false">Disabled</option>
                                        </select>
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-900">
                                            {displayVendor.reconciliationSettings.allowAutoApproval ? 'Enabled' : 'Disabled'}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Auto Approval Threshold (%)</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={displayVendor.reconciliationSettings.autoApprovalThreshold || 0}
                                            onChange={(e) => updateField('reconciliationSettings.autoApprovalThreshold', parseFloat(e.target.value))}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-900">
                                            {displayVendor.reconciliationSettings.autoApprovalThreshold}%
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Hold Threshold (%)</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={displayVendor.reconciliationSettings.holdThreshold || 0}
                                            onChange={(e) => updateField('reconciliationSettings.holdThreshold', parseFloat(e.target.value))}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-900">
                                            {displayVendor.reconciliationSettings.holdThreshold}%
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Future Booking (days)</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={displayVendor.reconciliationSettings.futureBookingThreshold || 0}
                                            onChange={(e) => updateField('reconciliationSettings.futureBookingThreshold', parseInt(e.target.value))}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-900">
                                            {displayVendor.reconciliationSettings.futureBookingThreshold} days
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Refund Days</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={displayVendor.reconciliationSettings.cancelledBookingRefundDays || 0}
                                            onChange={(e) => updateField('reconciliationSettings.cancelledBookingRefundDays', parseInt(e.target.value))}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-900">
                                            {displayVendor.reconciliationSettings.cancelledBookingRefundDays} days
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Invoice Settings */}
                <div className="bg-gray-50 p-3 rounded-lg">
                    <button
                        type="button"
                        onClick={() => toggleSection('invoice')}
                        className="w-full flex items-center justify-between text-left"
                    >
                        <h3 className="text-base font-medium text-gray-900">Invoice Settings</h3>
                        {expandedSections.invoice ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                    </button>

                    {expandedSections.invoice && displayVendor.invoiceSettings && (
                        <div className="mt-3 space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Currency</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={displayVendor.invoiceSettings.currencyCode || ''}
                                            onChange={(e) => updateField('invoiceSettings.currencyCode', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-900">{displayVendor.invoiceSettings.currencyCode}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Frequency</label>
                                    {isEditing ? (
                                        <select
                                            value={displayVendor.invoiceSettings.invoiceFrequency || ''}
                                            onChange={(e) => updateField('invoiceSettings.invoiceFrequency', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        >
                                            <option value="DAILY">Daily</option>
                                            <option value="WEEKLY">Weekly</option>
                                            <option value="MONTHLY">Monthly</option>
                                        </select>
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-900">{displayVendor.invoiceSettings.invoiceFrequency}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Formats</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {Array.isArray(displayVendor.invoiceSettings.invoiceFormats) 
                                            ? displayVendor.invoiceSettings.invoiceFormats.join(', ') 
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Contacts */}
                {displayVendor.contacts && displayVendor.contacts.length > 0 && (
                    <div className="border border-gray-200 rounded-lg">
                        <button
                            type="button"
                            onClick={() => toggleSection('contacts')}
                            className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-gray-50"
                        >
                            <span className="text-base font-medium text-gray-900">
                                Contacts ({displayVendor.contacts.length})
                            </span>
                            {expandedSections.contacts ? (
                                <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                        </button>

                        {expandedSections.contacts && (
                            <div className="p-3 border-t border-gray-200 space-y-3">
                                {displayVendor.contacts.map((contact, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900">{contact.name}</h4>
                                                <p className="text-sm text-gray-600">{contact.role}</p>
                                            </div>
                                            {contact.isPrimary && (
                                                <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    Primary
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-2 space-y-1 text-sm">
                                            <p><span className="font-medium text-gray-500">Email:</span> {contact.email}</p>
                                            {contact.phone && (
                                                <p><span className="font-medium text-gray-500">Phone:</span> {contact.phone}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

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
                                        {vendor.createdAt ? formatDate(new Date(vendor.createdAt)) : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Updated At</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {vendor.updatedAt ? formatDate(new Date(vendor.updatedAt)) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            {vendor.createdBy && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Created By</label>
                                    <p className="mt-1 text-sm text-gray-900">{vendor.createdBy}</p>
                                </div>
                            )}
                            {vendor.updatedBy && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Updated By</label>
                                    <p className="mt-1 text-sm text-gray-900">{vendor.updatedBy}</p>
                                </div>
                            )}
                            {vendor.metadata && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Additional Metadata</label>
                                    <pre className="mt-1 text-xs text-gray-900 bg-gray-100 p-2 rounded overflow-x-auto">
                                        {JSON.stringify(vendor.metadata, null, 2)}
                                    </pre>
                                </div>
                            )}
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