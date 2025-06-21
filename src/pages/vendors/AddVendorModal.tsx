import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common';
import { VendorConfiguration } from '@/types/api.types';
import { APP_CONFIG } from '@/config/app.config';

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
            // Handle both camelCase and snake_case vendor data
            const data = initialData as any;
            setFormData({
                vendorCode: data.vendorCode || data.vendor_code || '',
                vendorName: data.vendorName || data.vendor_name || '',
                vendorType: data.vendorType || data.vendor_type || 'OTA',
                isActive: data.isActive ?? data.is_active ?? true,
                businessModel: data.businessModel || data.business_model || 'COMMISSION',
                integrationSettings: {
                    apiEndpoint: data.integrationSettings?.apiEndpoint || data.integration_settings?.api_endpoint || null,
                    apiKey: data.integrationSettings?.apiKey || data.integration_settings?.api_key || null,
                    ftpDetails: data.integrationSettings?.ftpDetails || data.integration_settings?.ftp_details || null,
                    emailSettings: {
                        incomingEmail: data.integrationSettings?.emailSettings?.incomingEmail || data.integration_settings?.email_settings?.incoming_email || '',
                        supportEmail: data.integrationSettings?.emailSettings?.supportEmail || data.integration_settings?.email_settings?.support_email || ''
                    }
                },
                invoiceSettings: {
                    defaultCurrency: data.invoiceSettings?.defaultCurrency || data.invoice_settings?.currency_code || 'USD',
                    invoicePrefix: data.invoiceSettings?.invoicePrefix || data.invoice_settings?.invoice_prefix || '',
                    dueDays: data.invoiceSettings?.dueDays || data.invoice_settings?.due_days || 30,
                    paymentTerms: data.invoiceSettings?.paymentTerms || data.invoice_settings?.payment_terms || 'Net 30',
                    taxRate: data.invoiceSettings?.taxRate || data.invoice_settings?.tax_rate || 0
                },
                extractionSettings: {
                    templateId: data.extractionSettings?.templateId || data.extraction_settings?.template_id || '',
                    customFields: data.extractionSettings?.customFields || data.extraction_settings?.custom_fields || [],
                    dateFormat: data.extractionSettings?.dateFormat || data.extraction_settings?.date_format || 'MM/DD/YYYY',
                    numberFormat: data.extractionSettings?.numberFormat || data.extraction_settings?.number_format || 'en-US'
                },
                reconciliationSettings: {
                    autoReconcile: data.reconciliationSettings?.autoReconcile || data.reconciliation_settings?.auto_reconcile || false,
                    matchingThreshold: data.reconciliationSettings?.matchingThreshold 
                        ? data.reconciliationSettings.matchingThreshold * 100 
                        : data.reconciliation_settings?.matching_threshold
                        ? data.reconciliation_settings.matching_threshold * 100
                        : 95,
                    defaultRules: data.reconciliationSettings?.defaultRules || data.reconciliation_settings?.default_rules || [],
                    bookingSourceField: data.reconciliationSettings?.bookingSourceField || data.reconciliation_settings?.booking_source_field || 'confirmationNumber',
                    amountTolerancePercentage: data.reconciliationSettings?.amountTolerancePercentage || data.reconciliation_settings?.amount_tolerance_percentage || 1
                },
                contacts: data.contacts && data.contacts.length > 0 ? data.contacts : [{
                    name: '',
                    email: '',
                    phone: '',
                    role: 'Primary',
                    isPrimary: true
                }]
            });
        } else {
            // Reset form when modal is closed
            setFormData({
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
        }
    }, [initialData]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.vendorName.trim()) newErrors.vendorName = 'Required';
        if (!formData.vendorCode.trim()) newErrors.vendorCode = 'Required';

        if (formData.contacts.length > 0) {
            if (formData.contacts[0].name && !formData.contacts[0].email) {
                newErrors.contactEmail = 'Email required';
            }

            if (formData.contacts[0].email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contacts[0].email)) {
                newErrors.contactEmail = 'Invalid email';
            }
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Basic Information
                            </h3>
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
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
                                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
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

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-0.5">
                                            Type *
                                        </label>
                                        <select
                                            value={formData.vendorType}
                                            onChange={(e) => handleChange('vendorType', e.target.value)}
                                            className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            {APP_CONFIG.filterOptions.vendor.type
                                                .filter(option => option.value !== '')
                                                .map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-0.5">
                                            Model *
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
                                    <label className="flex items-center text-xs">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => handleChange('isActive', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 mr-1.5"
                                        />
                                        <span className="text-gray-700">Active Vendor</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-1.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Primary Contact
                            </h3>
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                                        Contact Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.contacts[0]?.name || ''}
                                        onChange={(e) => {
                                            const newContacts = [...formData.contacts];
                                            if (newContacts.length === 0) {
                                                newContacts.push({
                                                    name: e.target.value,
                                                    email: '',
                                                    phone: '',
                                                    role: 'Primary',
                                                    isPrimary: true
                                                });
                                            } else {
                                                newContacts[0].name = e.target.value;
                                            }
                                            setFormData(prev => ({ ...prev, contacts: newContacts }));
                                        }}
                                        className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.contacts[0]?.email || ''}
                                        onChange={(e) => {
                                            const newContacts = [...formData.contacts];
                                            if (newContacts.length === 0) {
                                                newContacts.push({
                                                    name: '',
                                                    email: e.target.value,
                                                    phone: '',
                                                    role: 'Primary',
                                                    isPrimary: true
                                                });
                                            } else {
                                                newContacts[0].email = e.target.value;
                                            }
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

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.contacts[0]?.phone || ''}
                                        onChange={(e) => {
                                            const newContacts = [...formData.contacts];
                                            if (newContacts.length === 0) {
                                                newContacts.push({
                                                    name: '',
                                                    email: '',
                                                    phone: e.target.value,
                                                    role: 'Primary',
                                                    isPrimary: true
                                                });
                                            } else {
                                                newContacts[0].phone = e.target.value;
                                            }
                                            setFormData(prev => ({ ...prev, contacts: newContacts }));
                                        }}
                                        className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3">
                        {/* Reconciliation Settings */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-1.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Reconciliation Settings
                            </h3>
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-0.5">
                                            Match Threshold
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={formData.reconciliationSettings.matchingThreshold}
                                                onChange={(e) => handleChange('reconciliationSettings.matchingThreshold', parseInt(e.target.value))}
                                                className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-8"
                                                min="0"
                                                max="100"
                                                placeholder="95"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">%</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-0.5">
                                            Amount Tolerance
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={formData.reconciliationSettings.amountTolerancePercentage}
                                                onChange={(e) => handleChange('reconciliationSettings.amountTolerancePercentage', parseFloat(e.target.value))}
                                                className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-8"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                placeholder="1.0"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">%</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center text-xs">
                                        <input
                                            type="checkbox"
                                            checked={formData.reconciliationSettings.autoReconcile}
                                            onChange={(e) => handleChange('reconciliationSettings.autoReconcile', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 mr-1.5"
                                        />
                                        <span className="text-gray-700">Enable Auto-Reconciliation</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Extraction Settings */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-1.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Extraction Settings
                            </h3>
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
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

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-0.5">
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

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-0.5">
                                            Number Format
                                        </label>
                                        <select
                                            value={formData.extractionSettings.numberFormat}
                                            onChange={(e) => handleChange('extractionSettings.numberFormat', e.target.value)}
                                            className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="en-US">1,234.56</option>
                                            <option value="de-DE">1.234,56</option>
                                            <option value="fr-FR">1 234,56</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
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
