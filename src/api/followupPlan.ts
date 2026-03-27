import { get, post } from '@/utils/request'

// 随访计划查询参数
export interface FollowUpPlanQuery {
  userId?: string
  pageNum: number
  pageSize: number
}

// 随访计划
export interface FollowUpPlan {
  planId: string
  ruleId: string
  userId: string
  planType: 'ROUTINE' | 'EMERGENCY' | 'REVIEW'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'SPECIAL'
  labCheckItemsList: string[]
  followupContentList: string[]
  scheduledTime: string
  followupMethod: 'PHONE' | 'ONLINE' | 'OUTPATIENT'
  status: 'PENDING' | 'COMPLETED'
  remark: string
  updateTime: string
}

// 执行随访表单
export interface ExecutePlanForm {
  planId: string
  ruleId: string
  userId: string
  planType: string
  followupMethod: string
  labResultsList: { labName: string; labValue: string }[]
  medicationAdjustment: string
  doctorAdvice: string
  nextFollowupFlag: 0 | 1
  emergencyFlag: 0 | 1
  emergencyReason: string
}

// 随访详情
export interface FollowUpPlanDetail extends FollowUpPlan {
  labResultsList?: { labName: string; labValue: string }[]
  medicationAdjustment?: string
  doctorAdvice?: string
}

/**
 * 获取随访计划列表
 */
export const getPlanList = (params: FollowUpPlanQuery) =>
  get<{ list: FollowUpPlan[]; total: number }>('/api/followup-execution/getallplan', params as unknown as Record<string, unknown>)

/**
 * 获取随访计划详情
 */
export const getPlanDetail = (planId: string) =>
  get<FollowUpPlanDetail>(`/api/followup-execution/record/${planId}`)

/**
 * 执行随访
 */
export const executePlan = (data: ExecutePlanForm) =>
  post<null>('/api/followup-execution/execute', data as unknown as Record<string, unknown>)
