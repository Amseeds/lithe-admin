import request from '@/utils/request'

const SSE_URL = '/api/api/aiuse/evaluate-treatment-stream'

export interface DrugUsageItem {
  zyh: string
  yzmc: string
  zxpl: string
  zxpc: string
  sypc: string
  ypyf: string
  kzsj: string
  tzsj: string
  kzsjFormatted: string
  tzsjFormatted: string
}

export interface DrugUsageListData {
  list: DrugUsageItem[]
  total: number
  pageNum: number
  pageSize: number
  pages: number
}

export interface DrugUsageQueryParams {
  zyh: string
  pageNum: number
  pageSize: number
}

/**
 * 获取患者当前用药方案（分页）
 */
export function getDrugUsageByZyh(params: DrugUsageQueryParams) {
  return request<DrugUsageListData>({
    url: '/api/v1/DrugUsage/getDrugUsageByZyh',
    method: 'get',
    params: params as unknown as Record<string, unknown>,
  })
}

export interface EvaluateTreatmentParams {
  patientId: string
  question: string
  signal?: AbortSignal
}

/**
 * 治疗方案有效性 AI 评估 SSE 流式接口 (保留兼容)
 */
export function streamEvaluateTreatment(params: EvaluateTreatmentParams): Promise<Response> {
  const token = localStorage.getItem('token') || ''
  const { signal, ...body } = params

  return fetch(SSE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  })
}

// ===================== 治疗方案评估 (非流式) =====================

export interface TreatmentEvaluationResult {
  evaluationId: number
  zyh: string
  evaluationType: string
  safetyLevel: number
  effectivenessScore: number
  interactionWarnings: string
  adjustmentSuggestions: string
  followUpAdvice: string
  createTime: string
}

/**
 * 治疗方案有效性 AI 评估 (非流式 JSON)
 */
export function evaluateTreatment(params: { patientId: string; question: string }) {
  return request<TreatmentEvaluationResult>({
    url: '/api/aiuse/evaluate-treatment',
    method: 'post',
    data: params,
  })
}
