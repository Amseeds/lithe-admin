/**
 * 不良反应预警与教育 - SSE 流式咨询
 */

const SSE_URL = '/api/api/aiuse/consult-stream'

export interface ConsultParams {
  patientId: string
  question: string
  consultType: string
  signal?: AbortSignal
}

/**
 * 发送流式咨询请求，返回 Response 用于读取 stream
 */
export function streamConsult(params: ConsultParams): Promise<Response> {
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
