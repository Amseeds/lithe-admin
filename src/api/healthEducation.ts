const SSE_URL = '/api/api/aiuse/consult-stream'

export interface ScienceEducationConsultParams {
  patientId: string
  question: string
  consultType: 'general'
  signal?: AbortSignal
}

/**
 * 科普教育 AI 咨询 SSE 流式请求
 */
export function streamScienceEducationConsult(params: ScienceEducationConsultParams): Promise<Response> {
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
