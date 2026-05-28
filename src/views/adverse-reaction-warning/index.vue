<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { NButton, NInput, useMessage } from 'naive-ui'

import { streamConsult } from '@/api/adverseReactionEducation'

defineOptions({
  name: 'AdverseReactionEducation',
})

const message = useMessage()

const question = ref('识别潜在的药品不良反应并预警')
const messages = ref<{ role: 'user' | 'ai'; content: string }[]>([])
const currentAiContent = ref('')
const loading = ref(false)
const resultBoxRef = ref<HTMLDivElement | null>(null)
let abortController: AbortController | null = null

function scrollToBottom() {
  nextTick(() => {
    if (resultBoxRef.value) {
      resultBoxRef.value.scrollTop = resultBoxRef.value.scrollHeight
    }
  })
}

async function handleSend() {
  const q = question.value.trim()
  if (!q) {
    message.warning('请输入问题')
    return
  }

  messages.value.push({ role: 'user', content: q })
  question.value = ''
  currentAiContent.value = ''
  scrollToBottom()

  if (abortController) {
    abortController.abort()
  }
  abortController = new AbortController()

  loading.value = true

  try {
    const res = await streamConsult({
      patientId: '20092064',
      question: q,
      consultType: 'adverse_reaction',
      signal: abortController.signal,
    })

    if (!res.ok) {
      currentAiContent.value = `请求错误：${res.status}`
      message.error(`请求失败：${res.status}`)
      return
    }

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const data = line.slice(5).trim()
          if (data === '[DONE]') continue
          if (data) {
            currentAiContent.value += data
            scrollToBottom()
          }
        }
      }
    }

    if (currentAiContent.value) {
      messages.value.push({ role: 'ai', content: currentAiContent.value })
      currentAiContent.value = ''
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name !== 'AbortError') {
      currentAiContent.value = `错误：${err.message}`
      message.error(err.message)
    }
  } finally {
    loading.value = false
  }
}

function handleStop() {
  if (abortController) {
    abortController.abort()
    abortController = null
  }
  if (currentAiContent.value) {
    messages.value.push({ role: 'ai', content: currentAiContent.value })
    currentAiContent.value = ''
  }
  loading.value = false
}

function handleClear() {
  messages.value = []
  currentAiContent.value = ''
}
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- 对话结果区 -->
    <div
      ref="resultBoxRef"
      class="flex-1 overflow-y-auto px-4 py-4"
    >
        <div
          v-if="messages.length === 0 && !currentAiContent"
          class="flex h-full items-center justify-center text-neutral-400"
        >
          发送问题后，AI 回复将显示在这里
        </div>

        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="mb-4"
        >
          <div
            v-if="msg.role === 'user'"
            class="flex justify-end"
          >
            <div class="max-w-[80%] rounded-2xl bg-blue-50 px-4 py-2.5 text-sm text-gray-800">
              {{ msg.content }}
            </div>
          </div>
          <div
            v-else
            class="flex justify-start"
          >
            <div class="max-w-[80%] rounded-2xl bg-gray-100 px-4 py-2.5 text-sm leading-relaxed text-gray-800">
              {{ msg.content }}
            </div>
          </div>
        </div>

        <!-- 正在流式输出的内容 -->
        <div
          v-if="currentAiContent"
          class="mb-4 flex justify-start"
        >
          <div class="max-w-[80%] rounded-2xl bg-gray-100 px-4 py-2.5 text-sm leading-relaxed text-gray-800">
            {{ currentAiContent }}
            <span class="inline-block w-[2px] animate-pulse bg-gray-500"> </span>
          </div>
        </div>
      </div>

      <!-- 底部输入区 -->
      <div class="border-t border-gray-100 px-4 py-3">
        <div
          class="rounded-2xl border bg-white shadow-sm transition-shadow"
          :class="question.trim() ? 'border-gray-300' : 'border-gray-200'"
        >
          <div class="px-4 py-3">
            <textarea
              v-model="question"
              placeholder="请输入咨询问题..."
              rows="2"
              class="w-full resize-none bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />
            <div class="mt-2 flex items-center justify-between">
              <div class="flex gap-x-2">
                <NButton
                  size="tiny"
                  :disabled="loading || !question.trim()"
                  type="primary"
                  @click="handleSend"
                >
                  发送
                </NButton>
                <NButton
                  v-if="loading"
                  size="tiny"
                  @click="handleStop"
                >
                  停止
                </NButton>
                <NButton
                  size="tiny"
                  :disabled="loading"
                  @click="handleClear"
                >
                  清空
                </NButton>
              </div>
            </div>
          </div>
        </div>
    </div>
  </div>
</template>
