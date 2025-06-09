import { useState, useEffect, useCallback } from 'react';
import { ValidationRule } from '@/types/models';
import { MockDataService } from '@/services/mock/mock-data.service';
import { useAuth } from './useAuth';

interface UseRulesOptions {
    vendorCode?: string;
    entityType?: string;
    ruleType?: string;
    isActive?: boolean;
    searchTerm?: string;
    priorityRange?: { min?: number; max?: number };
    dateRange?: { from?: string; to?: string };
    realtime?: boolean;
}

interface UseRulesReturn {
    rules: ValidationRule[];
    loading: boolean;
    error: Error | null;
    createRule: (ruleData: Partial<ValidationRule>) => Promise<void>;
    updateRule: (ruleId: string, updates: Partial<ValidationRule>) => Promise<void>;
    deleteRule: (ruleId: string) => Promise<void>;
    toggleRuleStatus: (ruleId: string) => Promise<void>;
    bulkUpdate: (ruleIds: string[], updates: Partial<ValidationRule>) => Promise<void>;
    exportRules: (ruleIds?: string[]) => Promise<void>;
    importRules: (file: File) => Promise<void>;
    refreshRules: () => Promise<void>;
}

export function useRules(options: UseRulesOptions = {}): UseRulesReturn {
    const [rules, setRules] = useState<ValidationRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { user } = useAuth();

    const applyFilters = useCallback((allRules: ValidationRule[]) => {
        let filtered = [...allRules];

        // Apply vendor filter
        if (options.vendorCode) {
            filtered = filtered.filter(rule =>
                rule.vendorCode === options.vendorCode || rule.vendorCode === '*'
            );
        }

        // Apply entity type filter
        if (options.entityType) {
            filtered = filtered.filter(rule => rule.entityType === options.entityType);
        }

        // Apply rule type filter
        if (options.ruleType) {
            filtered = filtered.filter(rule => rule.ruleType === options.ruleType);
        }

        // Apply active status filter
        if (options.isActive !== undefined) {
            filtered = filtered.filter(rule => rule.isActive === options.isActive);
        }

        // Apply search term filter
        if (options.searchTerm) {
            const searchLower = options.searchTerm.toLowerCase();
            filtered = filtered.filter(rule =>
                rule.ruleName.toLowerCase().includes(searchLower) ||
                rule.description.toLowerCase().includes(searchLower) ||
                rule.ruleId.toLowerCase().includes(searchLower)
            );
        }

        // Apply priority range filter
        if (options.priorityRange) {
            if (options.priorityRange.min !== undefined) {
                filtered = filtered.filter(rule => rule.priority >= options.priorityRange!.min!);
            }
            if (options.priorityRange.max !== undefined) {
                filtered = filtered.filter(rule => rule.priority <= options.priorityRange!.max!);
            }
        }

        // Apply date range filter
        if (options.dateRange) {
            if (options.dateRange.from) {
                filtered = filtered.filter(rule => {
                    const ruleDate = rule.metadata.createdAt.toDate();
                    const fromDate = new Date(options.dateRange!.from!);
                    return ruleDate >= fromDate;
                });
            }
            if (options.dateRange.to) {
                filtered = filtered.filter(rule => {
                    const ruleDate = rule.metadata.createdAt.toDate();
                    const toDate = new Date(options.dateRange!.to!);
                    return ruleDate <= toDate;
                });
            }
        }

        return filtered;
    }, [options]);

    const loadRules = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const filters: any = {};

            if (options.vendorCode) {
                filters.vendorCode = options.vendorCode;
            }

            if (options.isActive !== undefined) {
                filters.isActive = options.isActive;
            }

            const data = await MockDataService.getRules(filters);
            const filtered = applyFilters(data);
            setRules(filtered);
        } catch (err) {
            setError(err as Error);
            console.error('Error loading rules:', err);
        } finally {
            setLoading(false);
        }
    }, [options, applyFilters]);

    // Create new rule
    const createRule = useCallback(async (ruleData: Partial<ValidationRule>) => {
        if (!user) throw new Error('User not authenticated');

        try {
            setError(null);
            await MockDataService.createRule(ruleData);
            await loadRules();
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, [user, loadRules]);

    // Update rule
    const updateRule = useCallback(async (ruleId: string, updates: Partial<ValidationRule>) => {
        if (!user) throw new Error('User not authenticated');

        try {
            setError(null);
            await MockDataService.updateRule(ruleId, updates);
            await loadRules();
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, [user, loadRules]);

    // Delete rule
    const deleteRule = useCallback(async (ruleId: string) => {
        if (!user) throw new Error('User not authenticated');

        try {
            setError(null);
            await MockDataService.deleteRule(ruleId);

            // Update local state
            setRules(prev => prev.filter(rule => rule.id !== ruleId));
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, [user]);

    // Toggle rule status
    const toggleRuleStatus = useCallback(async (ruleId: string) => {
        if (!user) throw new Error('User not authenticated');

        try {
            setError(null);
            const rule = rules.find(r => r.id === ruleId);
            if (rule) {
                await MockDataService.updateRule(ruleId, { isActive: !rule.isActive });
                await loadRules();
            }
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, [user, rules, loadRules]);

    // Bulk update rules
    const bulkUpdate = useCallback(async (ruleIds: string[], updates: Partial<ValidationRule>) => {
        if (!user) throw new Error('User not authenticated');

        try {
            setError(null);
            await Promise.all(
                ruleIds.map(id => MockDataService.updateRule(id, updates))
            );
            await loadRules();
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, [user, loadRules]);

    // Export rules
    const exportRules = useCallback(async (ruleIds?: string[]) => {
        try {
            setError(null);
            const rulesToExport = ruleIds
                ? rules.filter(r => ruleIds.includes(r.id))
                : rules;

            const dataStr = JSON.stringify(rulesToExport, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

            const exportFileDefaultName = `rules-export-${new Date().toISOString().split('T')[0]}.json`;

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, [rules]);

    // Import rules
    const importRules = useCallback(async (file: File) => {
        if (!user) throw new Error('User not authenticated');

        try {
            setError(null);
            const text = await file.text();
            const importedRules = JSON.parse(text);

            if (Array.isArray(importedRules)) {
                for (const rule of importedRules) {
                    await MockDataService.createRule(rule);
                }
                await loadRules();
            } else {
                throw new Error('Invalid file format. Expected an array of rules.');
            }
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, [user, loadRules]);

    // Initial load or real-time subscription
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const filters: any = {};

                if (options.vendorCode) {
                    filters.vendorCode = options.vendorCode;
                }

                if (options.isActive !== undefined) {
                    filters.isActive = options.isActive;
                }

                const data = await MockDataService.getRules(filters);
                const filtered = applyFilters(data);
                setRules(filtered);
            } catch (err) {
                setError(err as Error);
                console.error('Error loading rules:', err);
            } finally {
                setLoading(false);
            }
        };

        if (options.realtime) {
            const unsubscribe = MockDataService.subscribe<ValidationRule>(
                'validation_rules',
                [options],
                (data) => {
                    const filtered = applyFilters(data);
                    setRules(filtered);
                    setLoading(false);
                    setError(null);
                },
                (err) => {
                    setError(err);
                    setLoading(false);
                }
            );

            return () => unsubscribe();
        } else {
            loadData();
        }
    }, [options.realtime, applyFilters]);

    return {
        rules,
        loading,
        error,
        createRule,
        updateRule,
        deleteRule,
        toggleRuleStatus,
        bulkUpdate,
        exportRules,
        importRules,
        refreshRules: loadRules
    };
}
