import { ref, readonly } from 'vue'

export interface SSEOptions {
  body?: Record<string, unknown>
  headers?: Record<string, string>
  signal?: AbortSignal
  onMessage?: (text: string) => void
  /** 直接传入已发起 fetch 的 Response（带 auth 等），跳过内部 fetch */
  response?: Response
}

export function useSSE() {
  const response = ref('')
  const isStreaming = ref(false)
  const error = ref<string | null>(null)
  let abortController: AbortController | null = null

  async function start(url: string, options: SSEOptions = {}) {
    abortController = new AbortController()
    const signal = options.signal || abortController.signal

    response.value = ''
    error.value = null
    isStreaming.value = true

    try {
      let res: Response

      if (options.response) {
        res = options.response
      } else {
        const fetchOptions: RequestInit = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            ...options.headers,
          },
          signal,
        }
        if (options.body) {
          fetchOptions.body = JSON.stringify(options.body)
        }
        res = await fetch(url, fetchOptions)
      }

      if (!res.ok) {
        throw new Error(`请求失败: ${res.status} ${res.statusText}`)
      }

      if (!res.body) {
        throw new Error('浏览器不支持流式响应')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed.startsWith(':') || trimmed.startsWith('event:')) {
            continue
          }
          if (trimmed.startsWith('data:')) {
            let data = trimmed.slice(5).trim()
            if (data === '[DONE]') {
              continue
            }
            try {
              const parsed = JSON.parse(data)
              data = parsed.content || parsed.text || parsed.msg || data
            } catch {
              // 非 JSON，直接使用原始文本
            }
            response.value += data
            options.onMessage?.(data)
          }
        }
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        return
      }
      const msg = e instanceof Error ? e.message : '未知错误'
      error.value = msg
    } finally {
      isStreaming.value = false
      abortController = null
    }
  }

  function abort() {
    abortController?.abort()
    isStreaming.value = false
  }

  function reset() {
    abort()
    response.value = ''
    error.value = null
  }

  return {
    response: readonly(response),
    isStreaming: readonly(isStreaming),
    error: readonly(error),
    start,
    abort,
    reset,
  }
}
