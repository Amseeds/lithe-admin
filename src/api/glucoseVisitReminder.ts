const SSE_URL = '/api/api/aiuse/glucose-visit-reminder-stream'

export interface GlucoseAiParams {
  patientId: string
  signal?: AbortSignal
}

/**
 * 血糖管理就诊提醒 AI SSE 流式咨询
 */
export function streamGlucoseVisitAi(params: GlucoseAiParams): Promise<Response> {
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
