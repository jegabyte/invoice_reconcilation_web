import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useRules } from '@/hooks/useRules';
import { RulesList } from '@/components/rules/RulesList';
import AddRuleModal from '@/components/rules/AddRuleModal';
import ViewRuleModal from '@/components/rules/ViewRuleModal';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import { ValidationRule } from '@/types/models';

export default function RulesPage() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRule, setEditingRule] = useState<ValidationRule | null>(null);
    const [viewingRule, setViewingRule] = useState<ValidationRule | null>(null);
    const [filters, setFilters] = useState({
        searchTerm: '',
        vendorCode: ''
    });

    const {
        rules,
        loading,
        error,
        createRule,
        updateRule,
        deleteRule
    } = useRules({
        vendorCode: filters.vendorCode || undefined,
        searchTerm: filters.searchTerm || undefined,
        realtime: true
    });

    const handleCreateRule = async (ruleData: any) => {
        try {
            await createRule(ruleData);
            setShowAddModal(false);
        } catch (error) {
            console.error('Error creating rule:', error);
            throw error;
        }
    };

    const handleUpdateRule = async (ruleId: string, updates: any) => {
        try {
            await updateRule(ruleId, updates);
            setEditingRule(null);
        } catch (error) {
            console.error('Error updating rule:', error);
            throw error;
        }
    };

    const handleDeleteRule = async (ruleId: string) => {
        if (window.confirm('Are you sure you want to delete this rule?')) {
            try {
                await deleteRule(ruleId);
            } catch (error) {
                console.error('Error deleting rule:', error);
            }
        }
    };

    if (loading && rules.length === 0) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-900">Validation Rules</h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Rule
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white shadow-sm rounded-lg p-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search rules..."
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={filters.searchTerm}
                            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                        />
                    </div>

                    <select
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filters.vendorCode}
                        onChange={(e) => setFilters({ ...filters, vendorCode: e.target.value })}
                    >
                        <option value="">All Vendors</option>
                        <option value="EXPEDIA">EXPEDIA</option>
                        <option value="CTRIP">CTRIP</option>
                        <option value="HOTELBEDS">HOTELBEDS</option>
                        <option value="PKFARE">PKFARE</option>
                        <option value="*">GLOBAL</option>
                    </select>

                    <select
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value=""
                        onChange={(e) => e.target.value && setFilters({ ...filters, ...JSON.parse(e.target.value) })}
                    >
                        <option value="">Sort by...</option>
                        <option value='{"sortBy":"priority","sortOrder":"asc"}'>Priority (Low to High)</option>
                        <option value='{"sortBy":"priority","sortOrder":"desc"}'>Priority (High to Low)</option>
                        <option value='{"sortBy":"name","sortOrder":"asc"}'>Name (A-Z)</option>
                        <option value='{"sortBy":"name","sortOrder":"desc"}'>Name (Z-A)</option>
                        <option value='{"sortBy":"date","sortOrder":"desc"}'>Recently Modified</option>
                    </select>
                </div>
            </div>

            {/* Rules List */}
            <RulesList
                rules={rules}
                onViewRule={setViewingRule}
                onEditRule={(rule) => {
                    setEditingRule(rule);
                    setShowAddModal(true);
                }}
                onDeleteRule={handleDeleteRule}
            />

            {/* Add/Edit Rule Modal */}
            {(showAddModal || editingRule) && (
                <AddRuleModal
                    isOpen={showAddModal || !!editingRule}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingRule(null);
                    }}
                    onSave={editingRule ?
                        (data: any) => handleUpdateRule(editingRule.id, data) :
                        handleCreateRule
                    }
                    editingRule={editingRule}
                />
            )}

            {/* View Rule Modal */}
            {viewingRule && (
                <ViewRuleModal
                    isOpen={true}
                    rule={viewingRule}
                    onClose={() => setViewingRule(null)}
                />
            )}
        </div>
    );
}
