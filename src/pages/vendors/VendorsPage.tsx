import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Card, LoadingSpinner } from '@/components/common';
import { VendorConfiguration } from '@/types/api.types';
import { ApiDataService } from '@/services/api.data.service';
import { APP_CONFIG } from '@/config/app.config';
import AddVendorModal from './AddVendorModal';
import ViewVendorModal from './ViewVendorModal';

export default function VendorsPage() {
    const [vendors, setVendors] = useState<VendorConfiguration[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
    const [filterType, setFilterType] = useState<string>('');
    const [sortBy, setSortBy] = useState<'name' | 'code' | 'type' | 'status'>('name');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingVendor, setEditingVendor] = useState<VendorConfiguration | null>(null);
    const [viewingVendor, setViewingVendor] = useState<VendorConfiguration | null>(null);

    useEffect(() => {
        loadVendors();
    }, [filterStatus]);

    const loadVendors = async () => {
        try {
            setLoading(true);
            const vendorsList = await ApiDataService.getVendors({
                isActive: filterStatus === 'ALL' ? undefined : filterStatus === 'ACTIVE'
            });
            setVendors(vendorsList);
        } catch (error) {
            console.error('Error loading vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAndSortedVendors = vendors
        .filter(vendor => {
            const matchesSearch = searchTerm === '' ||
                vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vendor.vendorCode.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesType = filterType === '' || vendor.vendorType === filterType;
            
            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.vendorName.localeCompare(b.vendorName);
                case 'code':
                    return a.vendorCode.localeCompare(b.vendorCode);
                case 'type':
                    return a.vendorType.localeCompare(b.vendorType);
                case 'status':
                    return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
                default:
                    return 0;
            }
        });

    const handleDeleteVendor = async (vendor: VendorConfiguration) => {
        if (confirm(`Are you sure you want to delete ${vendor.vendorName}? This action cannot be undone.`)) {
            try {
                if (vendor.id) {
                    await ApiDataService.deleteVendor(vendor.id);
                    await loadVendors();
                }
            } catch (error) {
                console.error('Error deleting vendor:', error);
            }
        }
    };

    const handleCreateVendor = async (vendorData: Omit<VendorConfiguration, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            await ApiDataService.createVendor(vendorData);
            setShowAddModal(false);
            await loadVendors();
        } catch (error) {
            console.error('Error creating vendor:', error);
            throw error;
        }
    };

    const handleUpdateVendor = async (id: string, updates: Partial<VendorConfiguration>) => {
        try {
            await ApiDataService.updateVendor(id, updates);
            setEditingVendor(null);
            await loadVendors();
        } catch (error) {
            console.error('Error updating vendor:', error);
            throw error;
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
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage vendor settings and configurations
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Vendor
                </button>
            </div>

            {/* Filters - Sleek Design */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex flex-wrap gap-2 items-center">
                    <Filter className="h-4 w-4 text-gray-400" />
                    
                    {/* Search */}
                    <div className="relative flex-1 min-w-[150px] max-w-[200px]">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search vendors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-7 pr-2 py-1 w-full bg-white border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Type */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-2 py-1 bg-white border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none min-w-[100px]"
                    >
                        {APP_CONFIG.filterOptions.vendor.type.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* Status */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="px-2 py-1 bg-white border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none min-w-[100px]"
                    >
                        {APP_CONFIG.filterOptions.vendor.status.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'name' | 'code' | 'type' | 'status')}
                        className="px-2 py-1 bg-white border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none min-w-[100px]"
                    >
                        {APP_CONFIG.filterOptions.vendor.sortBy.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* Clear */}
                    {(searchTerm || filterType || filterStatus !== 'ALL' || sortBy !== 'name') && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterType('');
                                setFilterStatus('ALL');
                                setSortBy('name');
                            }}
                            className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Vendors Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Code
                            </th>
                            <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                Model
                            </th>
                            <th className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-2 py-1.5 text-right text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAndSortedVendors.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-xs text-gray-500">
                                    No vendors found
                                </td>
                            </tr>
                        ) : (
                            filteredAndSortedVendors.map((vendor) => (
                                <tr key={vendor.id} className="hover:bg-gray-50">
                                    <td className="px-2 py-1.5 whitespace-nowrap">
                                        <div className="text-xs font-medium text-gray-900 truncate max-w-[200px]" title={vendor.vendorName}>
                                            {vendor.vendorName}
                                        </div>
                                    </td>
                                    <td className="px-2 py-1.5 whitespace-nowrap">
                                        <span className="text-xs text-gray-900">{vendor.vendorCode}</span>
                                    </td>
                                    <td className="px-2 py-1.5 whitespace-nowrap">
                                        <span className="inline-flex px-1.5 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
                                            {vendor.vendorType}
                                        </span>
                                    </td>
                                    <td className="px-2 py-1.5 whitespace-nowrap hidden md:table-cell">
                                        <span className="text-xs text-gray-600">
                                            {vendor.businessModel}
                                        </span>
                                    </td>
                                    <td className="px-2 py-1.5 whitespace-nowrap text-center">
                                        <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded ${
                                            vendor.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {vendor.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-2 py-1.5 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end space-x-1">
                                            <button
                                                onClick={() => setViewingVendor(vendor)}
                                                className="text-xs text-blue-600 hover:text-blue-900 px-1"
                                            >
                                                View
                                            </button>
                                            <span className="text-gray-300">|</span>
                                            <button
                                                onClick={() => setEditingVendor(vendor)}
                                                className="text-xs text-indigo-600 hover:text-indigo-900 px-1"
                                            >
                                                Edit
                                            </button>
                                            <span className="text-gray-300">|</span>
                                            <button
                                                onClick={() => handleDeleteVendor(vendor)}
                                                className="text-xs text-red-600 hover:text-red-900 px-1"
                                            >
                                                Delete
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

            {/* Add Vendor Modal */}
            <AddVendorModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleCreateVendor}
            />

            {/* Edit Vendor Modal */}
            <AddVendorModal
                isOpen={!!editingVendor}
                onClose={() => setEditingVendor(null)}
                onSubmit={async (data) => {
                    if (editingVendor?.id) {
                        await handleUpdateVendor(editingVendor.id, data);
                    }
                }}
                initialData={editingVendor || undefined}
            />

            {/* View Vendor Modal */}
            <ViewVendorModal
                isOpen={!!viewingVendor}
                onClose={() => setViewingVendor(null)}
                vendor={viewingVendor}
            />
        </div>
    );
}