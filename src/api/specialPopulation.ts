import { get } from '@/utils/request'
import type { PatientRecord } from '@/api'

const SSE_URL = '/api/api/aiuse/consult-stream'

export interface SpecialPopulationListResponse {
  list: PatientRecord[]
  total: number
}

/**
 * 获取特殊人群患者列表
 * lx: 1=妊娠及哺乳期, 2=非酒精性脂肪肝病, 3=肾功能不全
 */
export const getSpecialPopulationPatients = (params: {
  lx: number
  pageNum: number
  pageSize: number
  zyh?: string
  name?: string
}) =>
  get<SpecialPopulationListResponse>(
    '/api/special-population/pregnancy-lactation',
    params as unknown as Record<string, unknown>,
  )

export interface AIGuideSSEParams {
  patientId: string
  question: string
  consultType: 'special_population'
  specialPopulation: string
  signal?: AbortSignal
}

/**
 * 特殊人群 AI 用药指导 SSE 流式咨询
 * 发送带认证 token 的 fetch 请求，返回 Response 供 useSSE 读取 stream
 */
export function streamSpecialPopulationConsult(params: AIGuideSSEParams): Promise<Response> {
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
