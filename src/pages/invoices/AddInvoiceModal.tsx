import { useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

// Mock Modal component for demonstration
const Modal = ({ isOpen, onClose, title, children, className = '' }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
                <div className={`relative bg-white rounded-lg shadow-xl ${className}`}>
                    <div className="border-b border-gray-200 px-4 py-3">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="px-4 py-3">{children}</div>
                </div>
            </div>
        </div>
    );
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface Vendor {
    id: string;
    vendorName: string;
}

interface AddInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (file: File, vendorId: string, invoiceData: any) => Promise<void>;
    vendors: Vendor[];
}

interface FormErrors {
    vendorId?: string;
    file?: string;
}

export default function AddInvoiceModal({ isOpen, onClose, onSubmit, vendors }: AddInvoiceModalProps) {
    const [vendorId, setVendorId] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const validateForm = () => {
        const newErrors: FormErrors = {};
        if (!vendorId) newErrors.vendorId = 'Partner is required';
        if (!file) newErrors.file = 'Invoice file is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setUploading(true);
        try {
            const invoiceData = {
                invoiceNumber: `INV-${Date.now()}`,
                invoiceDate: new Date(),
                periodStart: new Date(new Date().setDate(1)),
                periodEnd: new Date(),
            };
            await onSubmit(file!, vendorId, invoiceData);
            handleClose();
        } catch (error) {
            console.error('Error uploading invoice:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const allowedTypes = [
                'application/pdf',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/csv',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];

            if (!allowedTypes.includes(selectedFile.type)) {
                setErrors({ ...errors, file: 'Please upload a PDF, Excel, CSV, or Word document' });
                return;
            }

            if (selectedFile.size > 50 * 1024 * 1024) {
                setErrors({ ...errors, file: 'File size must be less than 50MB' });
                return;
            }

            setFile(selectedFile);
            setErrors({ ...errors, file: '' });
        }
    };

    const handleClose = () => {
        setVendorId('');
        setFile(null);
        setErrors({});
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Add New Invoice"
            className="w-full max-w-sm"
        >
            <div className="space-y-3">
                {/* Vendor Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Partner <span className="text-red-500">*</span>
                    </label>
                    <select
                        className={`w-full px-2.5 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.vendorId ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={vendorId}
                        onChange={(e) => setVendorId(e.target.value)}
                    >
                        <option value="">Select Partner</option>
                        {vendors.map(vendor => (
                            <option key={vendor.id} value={vendor.id}>
                                {vendor.vendorName}
                            </option>
                        ))}
                    </select>
                    {errors.vendorId && (
                        <p className="mt-1 text-xs text-red-600">{errors.vendorId}</p>
                    )}
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Invoice File <span className="text-red-500">*</span>
                    </label>
                    <div
                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                            errors.file ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept=".pdf,.xlsx,.xls,.csv,.doc,.docx"
                            onChange={handleFileChange}
                        />

                        {file ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <FileText className="h-6 w-6 text-gray-400 flex-shrink-0" />
                                    <div className="text-left min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFile(null);
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded ml-2 flex-shrink-0"
                                >
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                <p className="mt-2 text-sm font-medium text-gray-900">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    PDF, Excel, CSV, Word (max 50MB)
                                </p>
                            </>
                        )}
                    </div>
                    {errors.file && (
                        <p className="mt-1 text-xs text-red-600">{errors.file}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={uploading}
                        className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? 'Uploading...' : 'Upload Invoice'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
