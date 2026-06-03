import request from '@/utils/request'

const SSE_URL = '/api/api/aiuse/consult-stream'
const CHECK_URL = '/api/aiuse/drug-interaction-check'

export interface InteractionConsultParams {
  patientId: string
  question: string
  consultType: 'interaction'
  signal?: AbortSignal
}

/**
 * 药物相互作用 AI 查询 SSE 流式咨询
 */
export function streamInteractionConsult(params: InteractionConsultParams): Promise<Response> {
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

// ===================== 药品相互作用识别 (Batch API) =====================

export interface InteractionItem {
  drugPair: string
  riskDescription: string
  recommendation: string
}

export interface DrugInteractionResult {
  riskLevel: string
  summary: string
  interactions: InteractionItem[]
  suggestions: string[]
}

export interface DrugInteractionCheckParams {
  patientId: string
  question: string
  targetDrug: string
}

/**
 * 药品相互作用识别 (非流式)
 */
export function checkDrugInteraction(params: DrugInteractionCheckParams) {
  return request<DrugInteractionResult>({
    url: CHECK_URL,
    method: 'post',
    data: params,
  })
}
