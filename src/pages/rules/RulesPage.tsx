import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useRules } from '@/hooks/useRules';
import { useVendors } from '@/hooks/useVendors';
import AddRuleModal from '@/components/rules/AddRuleModal';
import ViewRuleModal from '@/components/rules/ViewRuleModal';
import { Card, RulesShimmer } from '@/components/common';
import { ReconciliationRule } from '@/types/api.types';
import { APP_CONFIG } from '@/config/app.config';

export default function RulesPage() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRule, setEditingRule] = useState<ReconciliationRule | null>(null);
    const [viewingRule, setViewingRule] = useState<ReconciliationRule | null>(null);
    const [selectedVendor, setSelectedVendor] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'priority' | 'name' | 'status'>('priority');

    const { vendors } = useVendors();
    const {
        rules,
        loading,
        error,
        createRule,
        updateRule,
        deleteRule,
        toggleRuleStatus
    } = useRules(selectedVendor);

    const filteredAndSortedRules = rules
        .filter(rule => {
            const matchesSearch = searchTerm === '' ||
                rule.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (rule.description && rule.description.toLowerCase().includes(searchTerm.toLowerCase()));

            return matchesSearch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'priority':
                    return a.priority - b.priority;
                case 'name':
                    return a.ruleName.localeCompare(b.ruleName);
                case 'status':
                    return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
                default:
                    return 0;
            }
        });

    const handleCreateRule = async (ruleData: Partial<ReconciliationRule>) => {
        try {
            await createRule({
                ...ruleData,
                description: ruleData.description || '',
                lastUsed: null
            } as Omit<ReconciliationRule, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>);
            setShowAddModal(false);
        } catch (error) {
            console.error('Error creating rule:', error);
            throw error;
        }
    };

    const handleUpdateRule = async (ruleId: string, updates: Partial<ReconciliationRule>) => {
        try {
            await updateRule(ruleId, updates);
            setEditingRule(null);
        } catch (error) {
            console.error('Error updating rule:', error);
            throw error;
        }
    };

    const handleDeleteRule = async (ruleId: string) => {
        if (confirm('Are you sure you want to delete this rule?')) {
            try {
                await deleteRule(ruleId);
            } catch (error) {
                console.error('Error deleting rule:', error);
            }
        }
    };

    if (loading) {
        return <RulesShimmer />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-600">Error loading rules: {error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reconciliation Rules</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Configure validation and reconciliation rules for vendors
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Rule
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
                            placeholder="Search rules..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-7 pr-2 py-1 w-full bg-white border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Vendor */}
                    <select
                        value={selectedVendor}
                        onChange={(e) => setSelectedVendor(e.target.value)}
                        className="px-2 py-1 bg-white border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none min-w-[144px]"
                    >
                        <option value="">All Vendors</option>
                        {vendors.map(vendor => (
                            <option key={vendor.id} value={vendor.id}>
                                {vendor.vendorName}
                            </option>
                        ))}
                    </select>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'priority' | 'name' | 'status')}
                        className="px-2 py-1 bg-white border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none min-w-[173px]"
                    >
                        {APP_CONFIG.filterOptions.rule.sortBy.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* Clear */}
                    {(searchTerm || selectedVendor || sortBy !== 'priority') && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedVendor('');
                                setSortBy('priority');
                            }}
                            className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Rules List */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rule Name
                            </th>
                            <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vendor
                            </th>
                            <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                Entity
                            </th>
                            <th className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Priority
                            </th>
                            <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                From
                            </th>
                            <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                To
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
                        {filteredAndSortedRules.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No rules found
                                </td>
                            </tr>
                        ) : (
                            filteredAndSortedRules.map((rule) => (
                                <tr key={rule.id} className="hover:bg-gray-50">
                                    <td className="px-2 py-1.5">
                                        <div className="text-xs font-medium text-gray-900">
                                            {rule.ruleName}
                                        </div>
                                    </td>
                                    <td className="px-2 py-1.5 whitespace-nowrap">
                                        <span className="text-xs text-gray-900">
                                            {(rule as any).vendorCode || rule.vendorId || 'GLOBAL'}
                                        </span>
                                    </td>
                                    <td className="px-2 py-1.5 whitespace-nowrap">
                                        <span className="inline-flex px-1.5 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
                                            {(rule as any).apiRuleType || rule.ruleType}
                                        </span>
                                    </td>
                                    <td className="px-2 py-1.5 whitespace-nowrap hidden md:table-cell">
                                        <span className="text-xs text-gray-600">
                                            {(rule as any).entityType || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-2 py-1.5 whitespace-nowrap text-center">
                                        <span className="text-xs font-medium text-gray-900">
                                            {rule.priority}
                                        </span>
                                    </td>
                                    <td className="px-2 py-1.5 whitespace-nowrap hidden lg:table-cell">
                                        <span className="text-xs text-gray-600">
                                            {rule.effectiveFrom ? new Date(rule.effectiveFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-2 py-1.5 whitespace-nowrap hidden lg:table-cell">
                                        <span className="text-xs text-gray-600">
                                            {rule.effectiveTo ? new Date(rule.effectiveTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : 'None'}
                                        </span>
                                    </td>
                                    <td className="px-2 py-1.5 whitespace-nowrap text-center">
                                        <button
                                            onClick={() => toggleRuleStatus(rule.id!)}
                                            className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded ${
                                                rule.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {rule.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-2 py-1.5 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end space-x-1">
                                            <button
                                                onClick={() => setViewingRule(rule)}
                                                className="text-xs text-blue-600 hover:text-blue-900 px-1"
                                            >
                                                View
                                            </button>
                                            <span className="text-gray-300">|</span>
                                            <button
                                                onClick={() => setEditingRule(rule)}
                                                className="text-xs text-indigo-600 hover:text-indigo-900 px-1"
                                            >
                                                Edit
                                            </button>
                                            <span className="text-gray-300">|</span>
                                            <button
                                                onClick={() => handleDeleteRule(rule.id!)}
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

            {/* Add Rule Modal */}
            {showAddModal && (
                <AddRuleModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSave={handleCreateRule}
                    vendors={vendors}
                />
            )}

            {/* Edit Rule Modal */}
            {editingRule && (
                <AddRuleModal
                    isOpen={!!editingRule}
                    onClose={() => setEditingRule(null)}
                    onSave={(data) => handleUpdateRule(editingRule.id!, data)}
                    editingRule={editingRule}
                    vendors={vendors}
                />
            )}

            {/* View Rule Modal */}
            {viewingRule && (
                <ViewRuleModal
                    isOpen={!!viewingRule}
                    onClose={() => setViewingRule(null)}
                    rule={viewingRule}
                />
            )}
        </div>
    );
}
