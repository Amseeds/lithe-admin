import { get, post } from '@/utils/request'

export interface FollowUpForm {
  ruleId: string
  userId: string
  planType: 'ROUTINE' | 'EMERGENCY' | 'REVIEW'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'SPECIAL'
  labCheckItemsList: string[]
  followupContentList: string[]
  scheduledTime: string // 格式化后的字符串 yyyy-MM-dd HH:mm:ss
  followupMethod: 'PHONE' | 'ONLINE' | 'OUTPATIENT'
  remark: string
  status: string
}

export interface LabCheckItem {
  name: string
}

export interface FollowupContent {
  contentName: string
}

export interface GeneratePlanResponse {
  ruleId: string
  userId: string
  planType: string
  riskLevel: string
  labCheckItemsList: string[]
  followupContentList: string[]
  scheduledTime: string
  followupMethod: string
}

/**
 * 获取检查项目选项
 */
export const getLabCheckItemOptions = () =>
  get<LabCheckItem[]>('/api/DiabetesFollowupCheckItem/alllist')

/**
 * 获取随访内容选项
 */
export const getFollowupContentOptions = () =>
  get<FollowupContent[]>('/api/DiabetesFollowupContent/getall')

/**
 * 生成默认随访计划
 */
export const generatePlan = (params: { userId: string }) =>
  get<GeneratePlanResponse>('/api/followup-rule/generate-plan', params as unknown as Record<string, unknown>)

/**
 * 创建随访计划
 */
export const createPlan = (data: FollowUpForm) =>
  post<null>('/api/followup-rule/addplan', data as unknown as Record<string, unknown>)
