import React, { useState } from 'react';
import { Modal } from '@/components/common';

interface VendorFormData {
    vendorName: string;
    vendorCode: string;
    vendorType: string;
    businessModelType: string;
    commissionRate: string;
    status: 'ACTIVE' | 'INACTIVE';
}

interface AddVendorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (vendorData: any) => Promise<void>;
}

export default function AddVendorModal({ isOpen, onClose, onSubmit }: AddVendorModalProps) {
    const [formData, setFormData] = useState<VendorFormData>({
        vendorName: '',
        vendorCode: '',
        vendorType: '',
        businessModelType: '',
        commissionRate: '',
        status: 'ACTIVE'
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.vendorName.trim()) newErrors.vendorName = 'Partner name is required';
        if (!formData.vendorCode.trim()) newErrors.vendorCode = 'Partner code is required';
        if (!formData.vendorType) newErrors.vendorType = 'Partner type is required';
        if (!formData.businessModelType) newErrors.businessModelType = 'Business model is required';

        if (formData.businessModelType === 'COMMISSION' && !formData.commissionRate) {
            newErrors.commissionRate = 'Commission rate is required';
        }

        if (formData.commissionRate) {
            const rate = parseFloat(formData.commissionRate);
            if (isNaN(rate) || rate < 0 || rate > 100) {
                newErrors.commissionRate = 'Commission rate must be between 0 and 100';
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
            const vendorData = {
                vendorName: formData.vendorName.trim(),
                vendorCode: formData.vendorCode.trim(),
                vendorType: formData.vendorType,
                status: formData.status,
                businessModel: {
                    type: formData.businessModelType,
                    commissionRate: formData.businessModelType === 'COMMISSION'
                        ? parseFloat(formData.commissionRate)
                        : null
                }
            };

            await onSubmit(vendorData);
            handleClose();
        } catch (error) {
            console.error('Error creating partner:', error);
            // Handle error (you might want to show an error message to the user)
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            vendorName: '',
            vendorCode: '',
            vendorType: '',
            businessModelType: '',
            commissionRate: '',
            status: 'ACTIVE'
        });
        setErrors({});
        onClose();
    };

    const handleInputChange = (field: keyof VendorFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Add New Partner"
            size="sm"
        >
            <form onSubmit={handleSubmit} className="space-y-3">
                {/* Partner Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Partner Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.vendorName}
                        onChange={(e) => handleInputChange('vendorName', e.target.value)}
                        className={`w-full px-2.5 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.vendorName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter partner name"
                    />
                    {errors.vendorName && (
                        <p className="mt-1 text-xs text-red-600">{errors.vendorName}</p>
                    )}
                </div>

                {/* Partner Code */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Partner Code <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.vendorCode}
                        onChange={(e) => handleInputChange('vendorCode', e.target.value.toUpperCase())}
                        className={`w-full px-2.5 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.vendorCode ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="e.g., PARTNER001"
                    />
                    {errors.vendorCode && (
                        <p className="mt-1 text-xs text-red-600">{errors.vendorCode}</p>
                    )}
                </div>

                {/* Partner Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Partner Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.vendorType}
                        onChange={(e) => handleInputChange('vendorType', e.target.value)}
                        className={`w-full px-2.5 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.vendorType ? 'border-red-300' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Select partner type</option>
                        <option value="OTA">OTA (Online Travel Agency)</option>
                        <option value="DIRECT">Direct Partner</option>
                        <option value="CHANNEL_MANAGER">Channel Manager</option>
                        <option value="WHOLESALER">Wholesaler</option>
                    </select>
                    {errors.vendorType && (
                        <p className="mt-1 text-xs text-red-600">{errors.vendorType}</p>
                    )}
                </div>

                {/* Business Model */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Model <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.businessModelType}
                        onChange={(e) => handleInputChange('businessModelType', e.target.value)}
                        className={`w-full px-2.5 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.businessModelType ? 'border-red-300' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Select business model</option>
                        <option value="COMMISSION">Commission Based</option>
                        <option value="NET_RATE">Net Rate</option>
                        <option value="MERCHANT">Merchant Model</option>
                    </select>
                    {errors.businessModelType && (
                        <p className="mt-1 text-xs text-red-600">{errors.businessModelType}</p>
                    )}
                </div>

                {/* Commission Rate (conditional) */}
                {formData.businessModelType === 'COMMISSION' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Commission Rate (%) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.commissionRate}
                            onChange={(e) => handleInputChange('commissionRate', e.target.value)}
                            className={`w-full px-2.5 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.commissionRate ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="e.g., 15"
                            min="0"
                            max="100"
                            step="0.01"
                        />
                        {errors.commissionRate && (
                            <p className="mt-1 text-xs text-red-600">{errors.commissionRate}</p>
                        )}
                    </div>
                )}

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                    </label>
                    <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value as 'ACTIVE' | 'INACTIVE')}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating...
                            </span>
                        ) : (
                            'Create Partner'
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
