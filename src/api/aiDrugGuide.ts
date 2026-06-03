const SSE_URL = '/api/api/aiuse/comorbidity-guidance-stream'

export interface DrugGuideAiParams {
  patientId: string
  signal?: AbortSignal
}

/**
 * AI 用药指导 SSE 流式咨询
 */
export function streamDrugGuideAi(params: DrugGuideAiParams): Promise<Response> {
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
