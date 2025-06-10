import { useState, useEffect, useCallback } from 'react';
import { ReconciliationRule } from '@/types/api.types';
import { ApiDataService } from '@/services/api.data.service';

interface UseRulesReturn {
    rules: ReconciliationRule[];
    loading: boolean;
    error: Error | null;
    createRule: (ruleData: Omit<ReconciliationRule, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => Promise<void>;
    updateRule: (ruleId: string, updates: Partial<ReconciliationRule>) => Promise<void>;
    deleteRule: (ruleId: string) => Promise<void>;
    toggleRuleStatus: (ruleId: string) => Promise<void>;
    refreshRules: () => Promise<void>;
}

export function useRules(vendorId?: string): UseRulesReturn {
    const [rules, setRules] = useState<ReconciliationRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadRules = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const rulesData = await ApiDataService.getReconciliationRules({
                vendorId,
                isActive: undefined
            });
            
            setRules(rulesData);
        } catch (err) {
            setError(err as Error);
            console.error('Error loading rules:', err);
        } finally {
            setLoading(false);
        }
    }, [vendorId]);

    const createRule = useCallback(async (ruleData: Omit<ReconciliationRule, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
        try {
            setError(null);
            await ApiDataService.createReconciliationRule(ruleData);
            await loadRules();
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, [loadRules]);

    const updateRule = useCallback(async (ruleId: string, updates: Partial<ReconciliationRule>) => {
        try {
            setError(null);
            await ApiDataService.updateReconciliationRule(ruleId, updates);
            await loadRules();
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, [loadRules]);

    const deleteRule = useCallback(async (ruleId: string) => {
        try {
            setError(null);
            await ApiDataService.deleteReconciliationRule(ruleId);
            setRules(prev => prev.filter(rule => rule.id !== ruleId));
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, []);

    const toggleRuleStatus = useCallback(async (ruleId: string) => {
        try {
            setError(null);
            const rule = rules.find(r => r.id === ruleId);
            if (rule) {
                await ApiDataService.updateReconciliationRule(ruleId, { isActive: !rule.isActive });
                await loadRules();
            }
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, [rules, loadRules]);

    useEffect(() => {
        loadRules();
    }, [loadRules]);

    return {
        rules,
        loading,
        error,
        createRule,
        updateRule,
        deleteRule,
        toggleRuleStatus,
        refreshRules: loadRules
    };
}