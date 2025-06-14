import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common';
import { VendorConfiguration } from '@/types/api.types';

interface AddVendorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (vendorData: Omit<VendorConfiguration, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    initialData?: VendorConfiguration;
}

export default function AddVendorModal({ isOpen, onClose, onSubmit, initialData }: AddVendorModalProps) {
    const [formData, setFormData] = useState<Omit<VendorConfiguration, 'id' | 'createdAt' | 'updatedAt'>>({
        vendorCode: '',
        vendorName: '',
        vendorType: 'OTA' as VendorConfiguration['vendorType'],
        isActive: true,
        businessModel: 'COMMISSION' as VendorConfiguration['businessModel'],
        integrationSettings: {
            apiEndpoint: null,
            apiKey: null,
            ftpDetails: null,
            emailSettings: {
                incomingEmail: '',
                supportEmail: ''
            }
        },
        invoiceSettings: {
            defaultCurrency: 'USD',
            invoicePrefix: '',
            dueDays: 30,
            paymentTerms: 'Net 30',
            taxRate: 0
        },
        extractionSettings: {
            templateId: '',
            customFields: [],
            dateFormat: 'MM/DD/YYYY',
            numberFormat: 'en-US'
        },
        reconciliationSettings: {
            autoReconcile: false,
            matchingThreshold: 95,
            defaultRules: [],
            bookingSourceField: 'confirmationNumber',
            amountTolerancePercentage: 1
        },
        contacts: [{
            name: '',
            email: '',
            phone: '',
            role: 'Primary',
            isPrimary: true
        }]
    });

    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                vendorCode: initialData.vendorCode || '',
                vendorName: initialData.vendorName || '',
                vendorType: initialData.vendorType || 'OTA',
                isActive: initialData.isActive ?? true,
                businessModel: initialData.businessModel || 'COMMISSION',
                integrationSettings: initialData.integrationSettings || {
                    apiEndpoint: null,
                    apiKey: null,
                    ftpDetails: null,
                    emailSettings: {
                        incomingEmail: '',
                        supportEmail: ''
                    }
                },
                invoiceSettings: initialData.invoiceSettings || {
                    defaultCurrency: 'USD',
                    invoicePrefix: '',
                    dueDays: 30,
                    paymentTerms: 'Net 30',
                    taxRate: 0
                },
                extractionSettings: initialData.extractionSettings || {
                    templateId: '',
                    customFields: [],
                    dateFormat: 'MM/DD/YYYY',
                    numberFormat: 'en-US'
                },
                reconciliationSettings: {
                    autoReconcile: initialData.reconciliationSettings?.autoReconcile || false,
                    matchingThreshold: initialData.reconciliationSettings?.matchingThreshold 
                        ? initialData.reconciliationSettings.matchingThreshold * 100 
                        : 95,
                    defaultRules: initialData.reconciliationSettings?.defaultRules || [],
                    bookingSourceField: initialData.reconciliationSettings?.bookingSourceField || 'confirmationNumber',
                    amountTolerancePercentage: initialData.reconciliationSettings?.amountTolerancePercentage || 1
                },
                contacts: initialData.contacts || [{
                    name: '',
                    email: '',
                    phone: '',
                    role: 'Primary',
                    isPrimary: true
                }]
            });
        }
    }, [initialData]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.vendorName.trim()) newErrors.vendorName = 'Required';
        if (!formData.vendorCode.trim()) newErrors.vendorCode = 'Required';

        if (formData.contacts[0].name && !formData.contacts[0].email) {
            newErrors.contactEmail = 'Email required';
        }

        if (formData.contacts[0].email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contacts[0].email)) {
            newErrors.contactEmail = 'Invalid email';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const vendorData: Omit<VendorConfiguration, 'id' | 'createdAt' | 'updatedAt'> = {
                ...formData,
                reconciliationSettings: {
                    ...formData.reconciliationSettings,
                    matchingThreshold: formData.reconciliationSettings.matchingThreshold / 100
                },
                contacts: formData.contacts.filter(c => c.name && c.email)
            };

            await onSubmit(vendorData);
            onClose();
        } catch (error) {
            console.error('Error submitting vendor:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => {
            if (field.includes('.')) {
                const [parent, child] = field.split('.');
                return {
                    ...prev,
                    [parent]: {
                        ...(prev as any)[parent],
                        [child]: value
                    }
                };
            }
            return { ...prev, [field]: value };
        });

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'Edit Vendor' : 'Add New Vendor'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Information */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b">Basic Information</h3>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Vendor Code *
                            </label>
                            <input
                                type="text"
                                value={formData.vendorCode}
                                onChange={(e) => handleChange('vendorCode', e.target.value)}
                                className={`block w-full text-sm rounded-md shadow-sm ${
                                    errors.vendorCode ? 'border-red-300' : 'border-gray-300'
                                } focus:border-blue-500 focus:ring-blue-500`}
                                placeholder="VEN001"
                            />
                            {errors.vendorCode && (
                                <p className="mt-0.5 text-xs text-red-600">{errors.vendorCode}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Vendor Name *
                            </label>
                            <input
                                type="text"
                                value={formData.vendorName}
                                onChange={(e) => handleChange('vendorName', e.target.value)}
                                className={`block w-full text-sm rounded-md shadow-sm ${
                                    errors.vendorName ? 'border-red-300' : 'border-gray-300'
                                } focus:border-blue-500 focus:ring-blue-500`}
                                placeholder="Example Vendor"
                            />
                            {errors.vendorName && (
                                <p className="mt-0.5 text-xs text-red-600">{errors.vendorName}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Vendor Type *
                            </label>
                            <select
                                value={formData.vendorType}
                                onChange={(e) => handleChange('vendorType', e.target.value)}
                                className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="OTA">OTA</option>
                                <option value="DIRECT">Direct</option>
                                <option value="CHANNEL_MANAGER">Channel Manager</option>
                                <option value="GDS">GDS</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Business Model *
                            </label>
                            <select
                                value={formData.businessModel}
                                onChange={(e) => handleChange('businessModel', e.target.value)}
                                className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="NET_RATE">Net Rate</option>
                                <option value="COMMISSION">Commission</option>
                                <option value="SELL_RATE">Sell Rate</option>
                                <option value="PROFIT_SHARING">Profit Sharing</option>
                                <option value="MIXED">Mixed</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center text-sm">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => handleChange('isActive', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 mr-2"
                            />
                            <span className="text-gray-700">Active</span>
                        </label>
                    </div>
                </div>

                {/* Extraction Settings */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b">Extraction Settings</h3>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Template ID
                            </label>
                            <input
                                type="text"
                                value={formData.extractionSettings.templateId}
                                onChange={(e) => handleChange('extractionSettings.templateId', e.target.value)}
                                className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="template_001"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Date Format
                            </label>
                            <select
                                value={formData.extractionSettings.dateFormat}
                                onChange={(e) => handleChange('extractionSettings.dateFormat', e.target.value)}
                                className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Reconciliation Settings */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b">Reconciliation Settings</h3>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Matching Threshold (%)
                            </label>
                            <input
                                type="number"
                                value={formData.reconciliationSettings.matchingThreshold}
                                onChange={(e) => handleChange('reconciliationSettings.matchingThreshold', parseInt(e.target.value))}
                                className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                min="0"
                                max="100"
                                placeholder="95"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Amount Tolerance (%)
                            </label>
                            <input
                                type="number"
                                value={formData.reconciliationSettings.amountTolerancePercentage}
                                onChange={(e) => handleChange('reconciliationSettings.amountTolerancePercentage', parseFloat(e.target.value))}
                                className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                min="0"
                                max="100"
                                step="0.1"
                                placeholder="1.0"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center text-sm">
                            <input
                                type="checkbox"
                                checked={formData.reconciliationSettings.autoReconcile}
                                onChange={(e) => handleChange('reconciliationSettings.autoReconcile', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 mr-2"
                            />
                            <span className="text-gray-700">Enable Auto Reconcile</span>
                        </label>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b">Primary Contact</h3>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Contact Name
                            </label>
                            <input
                                type="text"
                                value={formData.contacts[0].name}
                                onChange={(e) => {
                                    const newContacts = [...formData.contacts];
                                    newContacts[0].name = e.target.value;
                                    setFormData(prev => ({ ...prev, contacts: newContacts }));
                                }}
                                className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Contact Email
                            </label>
                            <input
                                type="email"
                                value={formData.contacts[0].email}
                                onChange={(e) => {
                                    const newContacts = [...formData.contacts];
                                    newContacts[0].email = e.target.value;
                                    setFormData(prev => ({ ...prev, contacts: newContacts }));
                                }}
                                className={`block w-full text-sm rounded-md shadow-sm ${
                                    errors.contactEmail ? 'border-red-300' : 'border-gray-300'
                                } focus:border-blue-500 focus:ring-blue-500`}
                                placeholder="john@example.com"
                            />
                            {errors.contactEmail && (
                                <p className="mt-0.5 text-xs text-red-600">{errors.contactEmail}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-2 pt-3 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={submitting}
                    >
                        {submitting ? 'Saving...' : (initialData ? 'Update' : 'Create')} Vendor
                    </button>
                </div>
            </form>
        </Modal>
    );
}
