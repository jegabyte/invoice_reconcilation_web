import { useState } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Card, LoadingSpinner, StatusBadge } from '@/components/common';
import { useVendors } from '@/hooks/useVendors';
import { Vendor } from '@/types/models';
import { formatDate } from '@/utils/formatters';
import AddVendorModal from './AddVendorModal';
import { VendorService } from '@/services/api/vendor.service';

export default function VendorsPage() {
    const { vendors, loading, refreshVendors } = useVendors();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
    const [showAddModal, setShowAddModal] = useState(false);

    const filteredVendors = vendors.filter(vendor => {
        const matchesSearch = vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.vendorCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || vendor.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleDeleteVendor = async (vendor: Vendor) => {
        if (confirm(`Are you sure you want to delete ${vendor.vendorName}? This action cannot be undone.`)) {
            // You'll need to implement deleteVendor in your useVendors hook
            // await deleteVendor(vendor.id);
            console.log('Delete vendor:', vendor.id);
        }
    };

    const handleCreateVendor = async (vendorData: any) => {
        try {
            await VendorService.createVendor(vendorData);
            await refreshVendors();
            setShowAddModal(false);
        } catch (error) {
            console.error('Error creating partner:', error);
            // You might want to show an error toast/notification here
            throw error; // Re-throw to let the modal handle the error state
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Partners</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage your partner relationships and configurations
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Partner
                </button>
            </div>

            <Card>
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Search partners..."
                            />
                        </div>
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Partner
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Business Model
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Invoices
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Activity
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredVendors.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                    No partners found
                                </td>
                            </tr>
                        ) : (
                            filteredVendors.map((vendor) => (
                                <tr key={vendor.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {vendor.vendorName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {vendor.vendorCode}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {vendor.vendorType}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {vendor.businessModel.type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={vendor.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {vendor.statistics.totalInvoices}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {vendor.statistics.lastInvoiceDate
                                            ? formatDate(vendor.statistics.lastInvoiceDate)
                                            : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                className="text-gray-600 hover:text-gray-900"
                                                title="Edit partner"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteVendor(vendor)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete partner"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add Partner Modal */}
            <AddVendorModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleCreateVendor}
            />
        </div>
    );
}
