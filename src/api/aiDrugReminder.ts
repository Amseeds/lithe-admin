const SSE_URL = '/api/api/aiuse/generate-medication-schedule-stream'

export interface DrugReminderAiParams {
  patientId: string
  question: string
  signal?: AbortSignal
}

/**
 * AI 用药提醒及药物咨询 SSE 流式接口
 */
export function streamDrugReminderAi(params: DrugReminderAiParams): Promise<Response> {
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
