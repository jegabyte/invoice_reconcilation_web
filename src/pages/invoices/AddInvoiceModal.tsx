import { useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

// Enhanced Modal component with better styling
const Modal = ({ isOpen, onClose, title, children, className = '' }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
                <div className={`relative bg-white rounded-xl shadow-2xl transform transition-all ${className}`}>
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="px-6 py-6">{children}</div>
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
            title="Upload Invoice"
            className="w-full max-w-lg"
        >
            <div className="space-y-6">
                {/* Vendor Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select Partner <span className="text-red-500">*</span>
                    </label>
                    <select
                        className={`w-full px-4 py-3 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.vendorId ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        value={vendorId}
                        onChange={(e) => {
                            setVendorId(e.target.value);
                            setErrors({ ...errors, vendorId: '' });
                        }}
                    >
                        <option value="">Choose a partner...</option>
                        {vendors.map(vendor => (
                            <option key={vendor.id} value={vendor.id}>
                                {vendor.vendorName}
                            </option>
                        ))}
                    </select>
                    {errors.vendorId && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.vendorId}
                        </p>
                    )}
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Invoice File <span className="text-red-500">*</span>
                    </label>
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                            errors.file 
                                ? 'border-red-300 bg-red-50 hover:bg-red-100' 
                                : file
                                    ? 'border-green-300 bg-green-50'
                                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
                        }`}
                        onClick={() => document.getElementById('file-upload')?.click()}
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add('bg-blue-50', 'border-blue-400');
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400');
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400');
                            const droppedFile = e.dataTransfer.files[0];
                            if (droppedFile) {
                                handleFileChange({ target: { files: [droppedFile] } } as any);
                            }
                        }}
                    >
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept=".pdf,.xlsx,.xls,.csv,.doc,.docx"
                            onChange={handleFileChange}
                        />

                        {file ? (
                            <div className="space-y-3">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                                    <FileText className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-base font-semibold text-gray-900">{file.name}</p>
                                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFile(null);
                                        setErrors({ ...errors, file: '' });
                                    }}
                                    className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Remove file
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
                                    <Upload className="h-8 w-8 text-gray-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-base font-medium text-gray-700">
                                        Drop your invoice here, or click to browse
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Supports PDF, Excel, CSV, and Word documents up to 50MB
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    {errors.file && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.file}
                        </p>
                    )}
                </div>

                {/* Additional Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-800">
                                Once uploaded, your invoice will be automatically processed and reconciled. You'll be notified when the process is complete.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={uploading || !file || !vendorId}
                        className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                        {uploading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Invoice
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
