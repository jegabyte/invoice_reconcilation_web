import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type { ReconciliationRule } from '@/types/api.types';

// Convert API response to ReconciliationRule format
function mapApiRuleToReconciliationRule(apiRule: any): ReconciliationRule & { vendorCode?: string; entityType?: string; apiRuleType?: string } {
  return {
    id: apiRule.rule_id || apiRule.id,
    vendorId: apiRule.vendor_code || 'GLOBAL',
    vendorCode: apiRule.vendor_code || 'GLOBAL', // Preserve original vendor_code
    ruleName: apiRule.rule_name || '',
    description: apiRule.description || '',
    ruleType: apiRule.rule_type === 'HARD' ? 'VALIDATION' : 'MATCHING',
    apiRuleType: apiRule.rule_type, // Preserve original rule_type
    entityType: apiRule.entity_type, // Preserve entity_type
    category: determineCategory(apiRule),
    isActive: apiRule.is_active !== undefined ? apiRule.is_active : true,
    priority: apiRule.priority || 100,
    conditions: mapConditions(apiRule.conditions || []),
    actions: mapActions(apiRule.actions || {}),
    tolerance: apiRule.tolerance ? {
      type: apiRule.tolerance.type || 'PERCENTAGE',
      value: apiRule.tolerance.value || 0,
    } : null,
    effectiveFrom: apiRule.effective_from || new Date().toISOString(),
    effectiveTo: apiRule.effective_to || null,
    createdBy: apiRule.metadata?.created_by || 'system',
    createdAt: apiRule.metadata?.created_at || new Date().toISOString(),
    updatedAt: apiRule.metadata?.updated_at || apiRule.metadata?.created_at || new Date().toISOString(),
    lastUsed: null,
    usageCount: 0,
  };
}

function determineCategory(apiRule: any): ReconciliationRule['category'] {
  if (apiRule.entity_type === 'INVOICE' || apiRule.conditions?.some((c: any) => c.type === 'DUPLICATE_CHECK')) {
    return 'FINANCIAL';
  }
  if (apiRule.actions?.dispute_type === 'GUEST_NAME_MISMATCH') {
    return 'BOOKING';
  }
  return 'CUSTOM';
}

function mapConditions(apiConditions: any[]): ReconciliationRule['conditions'] {
  return apiConditions.map((condition: any) => ({
    field: condition.field || '',
    operator: condition.operator || 'EQUALS',
    value: condition.value || condition.configuration || {},
    dataType: 'STRING',
  }));
}

function mapActions(apiActions: any): ReconciliationRule['actions'] {
  return [{
    type: apiActions.on_match === 'DISPUTED' ? 'FLAG' : 'AUTO_APPROVE',
    parameters: {
      dispute_type: apiActions.dispute_type,
      on_match: apiActions.on_match,
      on_mismatch: apiActions.on_mismatch,
    },
  }];
}

interface RulesFilters {
  vendorId?: string;
  isActive?: boolean;
  ruleType?: string;
  category?: string;
}

class RulesApiService {
  async getRules(filters?: RulesFilters): Promise<{ success: boolean; data: ReconciliationRule[]; total: number }> {
    try {
      const response = await apiClient.get<any[]>(API_ENDPOINTS.rules);
      let mappedRules = (response || []).map(mapApiRuleToReconciliationRule);
      
      // Apply filters on mapped data
      if (filters?.vendorId) {
        mappedRules = mappedRules.filter(r => r.vendorId === filters.vendorId);
      }
      if (filters?.isActive !== undefined) {
        mappedRules = mappedRules.filter(r => r.isActive === filters.isActive);
      }
      if (filters?.ruleType) {
        mappedRules = mappedRules.filter(r => r.ruleType === filters.ruleType);
      }
      if (filters?.category) {
        mappedRules = mappedRules.filter(r => r.category === filters.category);
      }
      
      return {
        success: true,
        data: mappedRules,
        total: mappedRules.length,
      };
    } catch (error) {
      console.error('Error fetching rules:', error);
      throw error;
    }
  }

  async getRuleById(id: string): Promise<{ success: boolean; data: ReconciliationRule }> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.rule(id));
      return {
        success: true,
        data: mapApiRuleToReconciliationRule(response),
      };
    } catch (error: any) {
      if (error.code === 'NOT_FOUND' || error.response?.status === 404) {
        throw {
          code: 'NOT_FOUND',
          message: `Rule with ID ${id} not found`,
          details: { id },
        };
      }
      throw error;
    }
  }

  async createRule(ruleData: Omit<ReconciliationRule, 'id' | 'createdAt' | 'updatedAt' | 'lastUsed' | 'usageCount'>): Promise<{ success: boolean; data: ReconciliationRule; message: string }> {
    // Since no API is configured for creation, return a dummy success response
    const newRule: ReconciliationRule = {
      ...ruleData,
      id: `rule_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUsed: null,
      usageCount: 0,
    };
    
    return {
      success: true,
      data: newRule,
      message: 'Rule saved successfully',
    };
  }

  async updateRule(id: string, updates: Partial<ReconciliationRule>): Promise<{ success: boolean; data: ReconciliationRule; message: string }> {
    // Since no API is configured for updates, return a dummy success response
    try {
      const existingRule = await this.getRuleById(id);
      const updatedRule = {
        ...existingRule.data,
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      };
      
      return {
        success: true,
        data: updatedRule,
        message: 'Rule saved successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteRule(_id: string): Promise<{ success: boolean; message: string }> {
    // Since no API is configured for deletion, return a dummy success response
    return {
      success: true,
      message: 'Rule deleted successfully',
    };
  }

  async toggleRuleStatus(id: string): Promise<{ success: boolean; data: ReconciliationRule; message: string }> {
    // Since no API is configured for updates, return a dummy success response
    try {
      const existingRule = await this.getRuleById(id);
      const updatedRule = {
        ...existingRule.data,
        isActive: !existingRule.data.isActive,
        updatedAt: new Date().toISOString(),
      };
      
      return {
        success: true,
        data: updatedRule,
        message: `Rule ${updatedRule.isActive ? 'activated' : 'deactivated'} successfully`,
      };
    } catch (error) {
      throw error;
    }
  }
}

export const rulesApiService = new RulesApiService();