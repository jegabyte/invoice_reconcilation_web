import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import { mockRules } from './mock-data';
import type { ReconciliationRule } from '@/types/api.types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface RulesFilters {
  vendorId?: string;
  isActive?: boolean;
  ruleType?: string;
  category?: string;
}

class RulesApiService {
  async getRules(filters?: RulesFilters): Promise<{ success: boolean; data: ReconciliationRule[]; total: number }> {
    await delay(400);
    
    let filteredData = [...mockRules];
    
    // Apply filters
    if (filters?.vendorId) {
      filteredData = filteredData.filter(r => r.vendorId === filters.vendorId);
    }
    if (filters?.isActive !== undefined) {
      filteredData = filteredData.filter(r => r.isActive === filters.isActive);
    }
    if (filters?.ruleType) {
      filteredData = filteredData.filter(r => r.ruleType === filters.ruleType);
    }
    if (filters?.category) {
      filteredData = filteredData.filter(r => r.category === filters.category);
    }
    
    return {
      success: true,
      data: filteredData,
      total: filteredData.length,
    };
    
    // return apiClient.get(API_ENDPOINTS.rules, filters);
  }

  async getRuleById(id: string): Promise<{ success: boolean; data: ReconciliationRule }> {
    await delay(300);
    const rule = mockRules.find(r => r.id === id);
    if (!rule) {
      throw {
        code: 'NOT_FOUND',
        message: `Rule with ID ${id} not found`,
        details: { id },
      };
    }
    return {
      success: true,
      data: rule,
    };
    
    // return apiClient.get(API_ENDPOINTS.rule(id));
  }

  async createRule(ruleData: Omit<ReconciliationRule, 'id' | 'createdAt' | 'updatedAt' | 'lastUsed' | 'usageCount'>): Promise<{ success: boolean; data: ReconciliationRule; message: string }> {
    await delay(600);
    const newRule: ReconciliationRule = {
      ...ruleData,
      id: `rule_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUsed: null,
      usageCount: 0,
    };
    mockRules.push(newRule);
    
    return {
      success: true,
      data: newRule,
      message: 'Rule created successfully',
    };
    
    // return apiClient.post(API_ENDPOINTS.rules, ruleData);
  }

  async updateRule(id: string, updates: Partial<ReconciliationRule>): Promise<{ success: boolean; data: ReconciliationRule; message: string }> {
    await delay(400);
    const ruleIndex = mockRules.findIndex(r => r.id === id);
    if (ruleIndex === -1) {
      throw {
        code: 'NOT_FOUND',
        message: `Rule with ID ${id} not found`,
        details: { id },
      };
    }
    
    const updatedRule = {
      ...mockRules[ruleIndex],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    mockRules[ruleIndex] = updatedRule;
    
    return {
      success: true,
      data: updatedRule,
      message: 'Rule updated successfully',
    };
    
    // return apiClient.put(API_ENDPOINTS.rule(id), updates);
  }

  async deleteRule(id: string): Promise<{ success: boolean; message: string }> {
    await delay(400);
    const ruleIndex = mockRules.findIndex(r => r.id === id);
    if (ruleIndex === -1) {
      throw {
        code: 'NOT_FOUND',
        message: `Rule with ID ${id} not found`,
        details: { id },
      };
    }
    
    mockRules.splice(ruleIndex, 1);
    
    return {
      success: true,
      message: 'Rule deleted successfully',
    };
    
    // return apiClient.delete(API_ENDPOINTS.rule(id));
  }

  async toggleRuleStatus(id: string): Promise<{ success: boolean; data: ReconciliationRule; message: string }> {
    await delay(300);
    const ruleIndex = mockRules.findIndex(r => r.id === id);
    if (ruleIndex === -1) {
      throw {
        code: 'NOT_FOUND',
        message: `Rule with ID ${id} not found`,
        details: { id },
      };
    }
    
    const updatedRule = {
      ...mockRules[ruleIndex],
      isActive: !mockRules[ruleIndex].isActive,
      updatedAt: new Date().toISOString(),
    };
    mockRules[ruleIndex] = updatedRule;
    
    return {
      success: true,
      data: updatedRule,
      message: `Rule ${updatedRule.isActive ? 'activated' : 'deactivated'} successfully`,
    };
  }
}

export const rulesApiService = new RulesApiService();