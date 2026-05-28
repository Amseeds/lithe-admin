const SSE_URL = '/api/api/aiuse/consult-stream'

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
