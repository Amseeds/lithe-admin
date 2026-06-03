<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { NDropdown, useMessage } from 'naive-ui'
import { streamScienceEducationConsult } from '@/api/healthEducation'
import { questionCategories, type QuestionItem } from './questions'

defineOptions({
  name: 'ScienceEducation',
})

const message = useMessage()

const inputText = ref('')
const isFocused = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// 对话相关
const messages = ref<{ role: 'user' | 'ai'; content: string }[]>([])
const currentAiContent = ref('')
const loading = ref(false)
const chatBoxRef = ref<HTMLDivElement | null>(null)
let abortController: AbortController | null = null

const VISIBLE_COUNT = 3

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 每个分类随机打乱（仅初始化时执行一次）
const shuffledCategories = questionCategories.map((cat) => ({
  ...cat,
  shuffled: shuffleArray(cat.questions),
}))

function visibleQuestions(catIdx: number): QuestionItem[] {
  return shuffledCategories[catIdx].shuffled.slice(0, VISIBLE_COUNT)
}

function otherQuestions(catIdx: number): QuestionItem[] {
  return shuffledCategories[catIdx].shuffled.slice(VISIBLE_COUNT)
}

function dropdownOptions(catIdx: number) {
  return otherQuestions(catIdx).map((q) => ({
    key: q.id,
    label: q.text,
  }))
}

const dropdownVisible = ref<Record<number, boolean>>({})

const allSuggestions = questionCategories.flatMap((c) => c.questions)

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 400) + 'px'
}

function scrollToBottom() {
  nextTick(() => {
    if (chatBoxRef.value) {
      chatBoxRef.value.scrollTop = chatBoxRef.value.scrollHeight
    }
  })
}

// ============================================================
// 卡片点击 → 填入文本并发送
// ============================================================
function handleCardClick(cardText: string) {
  inputText.value = cardText
  handleSend()
}

// ============================================================
// 发送消息 + SSE 流式接收
// ============================================================
async function handleSend() {
  const q = inputText.value.trim()
  if (!q || loading.value) return

  messages.value.push({ role: 'user', content: q })
  inputText.value = ''
  currentAiContent.value = ''
  scrollToBottom()

  if (abortController) {
    abortController.abort()
  }
  abortController = new AbortController()

  loading.value = true

  try {
    const res = await streamScienceEducationConsult({
      patientId: '',
      question: q,
      consultType: 'general',
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
  <div class="flex h-full flex-col bg-white">
    <!-- === 中间内容区（可滚动） === -->
    <main
      ref="chatBoxRef"
      class="flex-1 overflow-y-auto"
    >
      <!-- 无对话时：欢迎页 + 推荐卡片 -->
      <div
        v-if="messages.length === 0 && !currentAiContent"
        class="mx-auto flex min-h-full max-w-4xl flex-col items-center justify-center px-6 pt-12 pb-6"
      >
        <h1 class="mb-8 text-center text-3xl font-bold tracking-tight text-slate-800">
          有什么我能帮你的吗？
        </h1>

        <div class="flex w-full max-w-5xl flex-col gap-5">
          <div
            v-for="(cat, catIdx) in shuffledCategories"
            :key="cat.key"
            class="category-group"
          >
            <div class="category-header">
              <span class="iconify category-icon" :class="cat.icon" />
              <span class="category-label">{{ cat.label }}</span>
              <NDropdown
                v-if="otherQuestions(catIdx).length"
                trigger="click"
                :options="dropdownOptions(catIdx)"
                :show="dropdownVisible[catIdx]"
                @select="(key: number) => {
                  const q = allSuggestions.find(s => s.id === key)
                  if (q) handleCardClick(q.text)
                }"
                @clickoutside="dropdownVisible[catIdx] = false"
              >
                <button
                  class="more-btn"
                  @click="dropdownVisible[catIdx] = !dropdownVisible[catIdx]"
                >
                  <span>查看全部</span>
                  <span class="iconify ph--caret-down more-arrow" />
                </button>
              </NDropdown>
            </div>
            <div class="category-cards">
              <button
                v-for="q in visibleQuestions(catIdx)"
                :key="q.id"
                class="question-card"
                @click="handleCardClick(q.text)"
              >
                {{ q.text }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 对话消息区 -->
      <div
        v-else
        class="mx-auto px-4 py-6"
      >
        <!-- 历史消息 -->
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
            <div
              class="max-w-[80%] rounded-2xl bg-gray-100 px-4 py-2.5 text-sm leading-relaxed text-gray-800"
            >
              {{ msg.content }}
            </div>
          </div>
        </div>

        <!-- 正在流式输出的内容 -->
        <div
          v-if="currentAiContent"
          class="mb-4 flex justify-start"
        >
          <div
            class="max-w-[80%] rounded-2xl bg-gray-100 px-4 py-2.5 text-sm leading-relaxed text-gray-800"
          >
            {{ currentAiContent }}
            <span class="inline-block h-4 w-[2px] animate-pulse bg-gray-500 align-middle" />
          </div>
        </div>
      </div>
    </main>

    <!-- === 底部输入框（悬浮固定） === -->
    <footer class="shrink-0 border-t border-gray-100 bg-white px-4 pt-3 pb-6">
      <div class="mx-auto max-w-3xl">
        <div
          class="relative rounded-2xl border bg-white transition-all duration-200"
          :class="
            isFocused
              ? 'border-blue-200 shadow-[0_0_0_2px_rgba(59,130,246,0.08),0_4px_12px_rgba(0,0,0,0.05)]'
              : 'border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
          "
        >
          <div class="px-5 pt-4 pb-2">
            <textarea
              ref="textareaRef"
              v-model="inputText"
              placeholder="发送消息..."
              rows="1"
              class="scrollbar-thin w-full resize-none bg-transparent text-[15px] leading-relaxed text-gray-800 outline-none placeholder:text-gray-400"
              :style="{ maxHeight: '400px' }"
              :disabled="loading"
              @input="textareaRef && autoResize(textareaRef)"
              @focus="isFocused = true"
              @blur="isFocused = false"
              @keydown.enter.exact.prevent="inputText.trim() && !loading && handleSend()"
            />
          </div>

          <div class="flex items-center justify-between px-3 pb-2">
            <!-- 操作按钮 -->
            <div class="flex gap-1.5">
              <button
                v-if="loading"
                class="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                @click="handleStop"
              >
                停止生成
              </button>
              <button
                v-if="messages.length > 0 && !loading"
                class="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100"
                @click="handleClear"
              >
                清空对话
              </button>
            </div>

            <!-- 发送按钮 -->
            <button
              class="flex size-9 cursor-pointer items-center justify-center rounded-xl text-white transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus-visible:outline-none"
              :class="
                inputText.trim() && !loading
                  ? 'bg-[#0066ff] shadow-sm hover:bg-[#0052cc] hover:shadow-md active:scale-95'
                  : 'cursor-not-allowed bg-gray-200'
              "
              :disabled="!inputText.trim() || loading"
              aria-label="发送消息"
              @click="handleSend"
            >
              <span
                class="iconify text-lg transition-transform duration-200"
                :class="
                  inputText.trim() && !loading ? 'ph--arrow-up' : 'text-gray-400 ph--arrow-up'
                "
              />
            </button>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.category-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
}

.category-icon {
  font-size: 16px;
  color: #409eff;
  flex-shrink: 0;
}

.category-label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.more-btn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #409eff;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.more-btn:hover {
  background-color: #eff6ff;
}

.more-arrow {
  font-size: 12px;
  transition: transform 0.2s ease;
}

.category-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.question-card {
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
}

.question-card:hover {
  border-color: #409eff;
  box-shadow: 0 1px 6px rgba(64, 158, 255, 0.08);
  color: #1e293b;
}

@media (prefers-reduced-motion: reduce) {
  .question-card,
  .more-btn,
  .more-arrow {
    transition: none;
  }
}
</style>
