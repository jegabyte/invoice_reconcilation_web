import { Eye, Edit2, Trash2 } from 'lucide-react';
import { ValidationRule } from '@/types/models';
import { StatusBadge, EmptyState } from '@/components/common';
import { formatDate } from '@/utils/formatters';

interface RulesListProps {
    rules: ValidationRule[];
    onViewRule: (rule: ValidationRule) => void;
    onEditRule: (rule: ValidationRule) => void;
    onDeleteRule: (ruleId: string) => void;
}

export function RulesList({
                              rules,
                              onViewRule,
                              onEditRule,
                              onDeleteRule
                          }: RulesListProps) {
    if (rules.length === 0) {
        return (
            <EmptyState
                icon={<span className="text-4xl">📋</span>}
                title="No validation rules found"
                description="Create your first rule to start validating invoices"
            />
        );
    }

    return (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rule ID
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vendor
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Entity
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Priority
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Version
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Effective Dates
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {rules.map((rule) => (
                        <tr key={rule.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-900">
                                {rule.ruleId}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-xs text-gray-900 font-medium">{rule.ruleName}</div>
                                <div className="text-xs text-gray-500">{rule.description.substring(0, 40)}...</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                        {rule.vendorCode === '*' || !rule.vendorCode ? 'GLOBAL' : rule.vendorCode}
                                    </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        rule.ruleType === 'HARD'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {rule.ruleType}
                                    </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-xs text-gray-700">{rule.entityType}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                                {rule.priority}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <StatusBadge status={rule.isActive ? 'ACTIVE' : 'INACTIVE'} />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                                {rule.version}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                                <div>
                                    {rule.effectiveFrom && (
                                        <div>From: {formatDate(rule.effectiveFrom)}</div>
                                    )}
                                    {rule.effectiveTo && (
                                        <div>To: {formatDate(rule.effectiveTo)}</div>
                                    )}
                                    {!rule.effectiveFrom && !rule.effectiveTo && 'Always'}
                                </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-1">
                                    <button
                                        onClick={() => onEditRule(rule)}
                                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => onViewRule(rule)}
                                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                        title="View Details"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => onDeleteRule(rule.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
