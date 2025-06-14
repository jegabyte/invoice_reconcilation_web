import { Modal } from '@/components/common';
import { VendorConfiguration } from '@/types/api.types';
import { formatDate } from '@/utils/formatters';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ViewVendorModalProps {
    isOpen: boolean;
    onClose: () => void;
    vendor: VendorConfiguration | null;
}

export default function ViewVendorModal({ isOpen, onClose, vendor }: ViewVendorModalProps) {
    const [expandedSections, setExpandedSections] = useState({
        basic: true,
        extraction: true,
        reconciliation: true,
        contacts: true,
        metadata: false
    });

    if (!vendor) return null;

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections({
            ...expandedSections,
            [section]: !expandedSections[section]
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Vendor Details" size="lg">
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
                                    <label className="block text-sm font-medium text-gray-500">Vendor ID</label>
                                    <p className="mt-1 text-sm text-gray-900">{vendor.id}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Vendor Code</label>
                                    <p className="mt-1 text-sm text-gray-900">{vendor.vendorCode}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Vendor Name</label>
                                <p className="mt-1 text-sm text-gray-900">{vendor.vendorName}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Type</label>
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {vendor.vendorType}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Status</label>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        vendor.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {vendor.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Business Model</label>
                                <p className="mt-1 text-sm text-gray-900">{vendor.businessModel}</p>
                            </div>
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

                    {expandedSections.extraction && (
                        <div className="mt-3 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Template ID</label>
                                    <p className="mt-1 text-sm text-gray-900">{vendor.extractionSettings.templateId}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Date Format</label>
                                    <p className="mt-1 text-sm text-gray-900">{vendor.extractionSettings.dateFormat}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Number Format</label>
                                    <p className="mt-1 text-sm text-gray-900">{vendor.extractionSettings.numberFormat}</p>
                                </div>
                            </div>
                            {vendor.extractionSettings.customFields && vendor.extractionSettings.customFields.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-2">Custom Fields</label>
                                    <div className="space-y-1">
                                        {vendor.extractionSettings.customFields.map((field, index) => (
                                            <div key={index} className="bg-gray-100 p-2 rounded text-xs">
                                                <span className="font-medium">{field.fieldName}</span>
                                                <span className="mx-2">•</span>
                                                <span>{field.fieldType}</span>
                                                {field.required && <span className="ml-2 text-red-600">(Required)</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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

                    {expandedSections.reconciliation && (
                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Auto Reconcile</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {vendor.reconciliationSettings.autoReconcile ? 'Enabled' : 'Disabled'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Matching Threshold</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {(vendor.reconciliationSettings.matchingThreshold * 100).toFixed(0)}%
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Amount Tolerance</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {vendor.reconciliationSettings.amountTolerancePercentage}%
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Booking Source Field</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {vendor.reconciliationSettings.bookingSourceField}
                                </p>
                            </div>
                            {vendor.reconciliationSettings.defaultRules && vendor.reconciliationSettings.defaultRules.length > 0 && (
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-500">Default Rules</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {vendor.reconciliationSettings.defaultRules.join(', ')}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Contacts */}
                {vendor.contacts && vendor.contacts.length > 0 && (
                    <div className="border border-gray-200 rounded-lg">
                        <button
                            type="button"
                            onClick={() => toggleSection('contacts')}
                            className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-gray-50"
                        >
                            <span className="text-base font-medium text-gray-900">
                                Contacts ({vendor.contacts.length})
                            </span>
                            {expandedSections.contacts ? (
                                <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                        </button>

                        {expandedSections.contacts && (
                            <div className="p-3 border-t border-gray-200 space-y-3">
                                {vendor.contacts.map((contact, index) => (
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
                                        {formatDate(new Date(vendor.createdAt))}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Updated At</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {formatDate(new Date(vendor.updatedAt))}
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