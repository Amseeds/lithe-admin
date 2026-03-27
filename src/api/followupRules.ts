import { get } from '@/utils/request'

// 随访规则查询参数
export interface FollowUpRuleQuery {
  ruleName?: string
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'SPECIAL'
  pageNum: number
  pageSize: number
}

// 随访规则
export interface FollowUpRule {
  ruleId: string
  ruleName: string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'SPECIAL'
  conditionType: string
  conditionOperator: string
  conditionValue: string
  followupIntervalDays: number
  priority: number
  updateTime: string
}

/**
 * 获取随访规则列表
 */
export const getRuleList = (params: FollowUpRuleQuery) =>
  get<{ list: FollowUpRule[]; total: number }>('/api/followup-rule/getallrules', params as unknown as Record<string, unknown>)
