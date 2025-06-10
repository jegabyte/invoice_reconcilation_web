import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Building2, Globe, Link } from 'lucide-react';
import { Card, LoadingSpinner, StatusBadge } from '@/components/common';
import { VendorConfiguration } from '@/types/api.types';
import { DataService } from '@/services/data.service';
import { formatDate } from '@/utils/formatters';
import AddVendorModal from './AddVendorModal';

export default function VendorsPage() {
    const [vendors, setVendors] = useState<VendorConfiguration[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingVendor, setEditingVendor] = useState<VendorConfiguration | null>(null);

    useEffect(() => {
        loadVendors();
        
        // Subscribe to real-time updates
        const unsubscribe = DataService.subscribeToVendors(
            (updatedVendors) => {
                setVendors(updatedVendors);
            },
            { isActive: filterStatus === 'ALL' ? undefined : filterStatus === 'ACTIVE' }
        );

        return () => unsubscribe();
    }, [filterStatus]);

    const loadVendors = async () => {
        try {
            setLoading(true);
            const vendorsList = await DataService.getVendors({
                isActive: filterStatus === 'ALL' ? undefined : filterStatus === 'ACTIVE'
            });
            setVendors(vendorsList);
        } catch (error) {
            console.error('Error loading vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredVendors = vendors.filter(vendor => {
        const matchesSearch = vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.vendorCode.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleDeleteVendor = async (vendor: VendorConfiguration) => {
        if (confirm(`Are you sure you want to delete ${vendor.vendorName}? This action cannot be undone.`)) {
            try {
                if (vendor.id) {
                    await DataService.deleteVendor(vendor.id);
                }
            } catch (error) {
                console.error('Error deleting vendor:', error);
            }
        }
    };

    const handleCreateVendor = async (vendorData: Omit<VendorConfiguration, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            await DataService.createVendor(vendorData);
            setShowAddModal(false);
        } catch (error) {
            console.error('Error creating vendor:', error);
            throw error;
        }
    };

    const handleUpdateVendor = async (id: string, updates: Partial<VendorConfiguration>) => {
        try {
            await DataService.updateVendor(id, updates);
            setEditingVendor(null);
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
                    <h1 className="text-2xl font-bold text-gray-900">Vendor Configurations</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage vendor settings and integration configurations
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

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search vendors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Vendors List */}
            <div className="grid gap-4">
                {filteredVendors.length === 0 ? (
                    <Card className="p-8 text-center">
                        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Get started by adding your first vendor configuration.
                        </p>
                    </Card>
                ) : (
                    filteredVendors.map((vendor) => (
                        <Card key={vendor.id} className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {vendor.vendorName}
                                        </h3>
                                        <StatusBadge
                                            status={vendor.isActive ? 'ACTIVE' : 'INACTIVE'}
                                        />
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Code: {vendor.vendorCode} • Type: {vendor.vendorType}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setEditingVendor(vendor)}
                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteVendor(vendor)}
                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Business Model</p>
                                    <p className="mt-1 text-sm text-gray-900">{vendor.businessModel}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Integration</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        {vendor.integrationSettings.apiEndpoint && (
                                            <Globe className="h-4 w-4 text-gray-400" />
                                        )}
                                        {vendor.integrationSettings.ftpDetails && (
                                            <Link className="h-4 w-4 text-gray-400" />
                                        )}
                                        <span className="text-sm text-gray-900">
                                            {vendor.integrationSettings.apiEndpoint ? 'API' : 
                                             vendor.integrationSettings.ftpDetails ? 'FTP' : 
                                             'Email'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Invoice Settings</p>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {vendor.invoiceSettings.defaultCurrency} • 
                                        {vendor.invoiceSettings.dueDays} days
                                    </p>
                                </div>
                            </div>

                            {vendor.contacts.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-sm font-medium text-gray-700">Primary Contact</p>
                                    {vendor.contacts
                                        .filter(c => c.isPrimary)
                                        .map(contact => (
                                            <p key={contact.email} className="mt-1 text-sm text-gray-900">
                                                {contact.name} • {contact.email}
                                            </p>
                                        ))}
                                </div>
                            )}

                            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                                <span>Created: {formatDate(new Date(vendor.createdAt))}</span>
                                <span>Updated: {formatDate(new Date(vendor.updatedAt))}</span>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Add Vendor Modal */}
            {showAddModal && (
                <AddVendorModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleCreateVendor}
                />
            )}

            {/* Edit Vendor Modal */}
            {editingVendor && (
                <AddVendorModal
                    isOpen={!!editingVendor}
                    onClose={() => setEditingVendor(null)}
                    onSubmit={(data) => handleUpdateVendor(editingVendor.id!, data)}
                    initialData={editingVendor}
                />
            )}
        </div>
    );
}