<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { NCollapse, NCollapseItem, NCard, NDropdown, NScrollbar, useMessage } from 'naive-ui'
import { ScrollContainer } from '@/components'
import { useInjection } from '@/composables'
import { mediaQueryInjectionKey } from '@/injection'
import { streamScienceEducationConsult } from '@/api/healthEducation'
import { renderMarkdown, parseAiResponse } from '@/utils/markdown'
import { questionCategories, type QuestionItem } from './questions'

defineOptions({
  name: 'HealthEducation',
})

const message = useMessage()
const { isMaxMd, isMaxLg } = useInjection(mediaQueryInjectionKey)

const inputText = ref('')
const isFocused = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// 对话相关
const messages = ref<
  { role: 'user' | 'ai'; content: string; thinking?: string; response?: string }[]
>([])
const currentAiContent = ref('')
const showRawContent = ref(false)
const loading = ref(false)
const chatBoxRef = ref<InstanceType<typeof NScrollbar> | null>(null)
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
  el.style.height = Math.min(el.scrollHeight, 160) + 'px'
}

const parsedCurrent = computed(() => parseAiResponse(currentAiContent.value))

const thinkExpanded = computed(() => {
  if (!currentAiContent.value) return []
  if (parsedCurrent.value.thinking && !parsedCurrent.value.hasFinal) return ['think']
  return []
})

function scrollToBottom() {
  nextTick(() => {
    chatBoxRef.value?.scrollTo({ top: 99999, behavior: 'instant' } as any)
  })
}

function handleCardClick(cardText: string) {
  inputText.value = cardText
  handleSend()
}

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
      const parsed = parseAiResponse(currentAiContent.value)
      messages.value.push({
        role: 'ai',
        content: currentAiContent.value,
        thinking: parsed.thinking,
        response: parsed.response,
      })
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
    const parsed = parseAiResponse(currentAiContent.value)
    messages.value.push({
      role: 'ai',
      content: currentAiContent.value,
      thinking: parsed.thinking,
      response: parsed.response,
    })
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
  <ScrollContainer
    wrapper-class="flex flex-col gap-y-4 health-education-page"
    :scrollable="isMaxLg"
  >
    <NCard
      class="main-card flex-1"
      :size="isMaxMd ? 'small' : undefined"
      content-class="flex flex-col min-h-0"
    >
      <div class="chat-layout">
        <!-- === 中间内容区（可滚动） === -->
        <NScrollbar
          ref="chatBoxRef"
          class="chat-body"
        >
          <!-- 无对话时：欢迎页 + 推荐卡片 -->
          <div
            v-if="messages.length === 0 && !currentAiContent"
            class="welcome-container"
          >
            <h1 class="welcome-title">有什么我能帮你的吗？</h1>

            <div class="categories-wrapper">
              <div
                v-for="(cat, catIdx) in shuffledCategories"
                :key="cat.key"
                class="category-group"
                :class="{ 'category-group--last': catIdx === shuffledCategories.length - 1 }"
              >
                <div class="category-header">
                  <span
                    class="category-icon iconify"
                    :class="cat.icon"
                  />
                  <span class="category-label">{{ cat.label }}</span>
                  <NDropdown
                    v-if="otherQuestions(catIdx).length"
                    trigger="click"
                    :options="dropdownOptions(catIdx)"
                    :show="dropdownVisible[catIdx]"
                    @select="
                      (key: number) => {
                        const q = allSuggestions.find((s) => s.id === key)
                        if (q) handleCardClick(q.text)
                      }
                    "
                    @clickoutside="dropdownVisible[catIdx] = false"
                  >
                    <button
                      class="more-btn"
                      @click="dropdownVisible[catIdx] = !dropdownVisible[catIdx]"
                    >
                      <span>查看全部</span>
                      <span class="more-arrow iconify ph--caret-down" />
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
            class="messages-container"
          >
            <!-- 历史消息 -->
            <div
              v-for="(msg, idx) in messages"
              :key="idx"
              class="message-item"
            >
              <div
                v-if="msg.role === 'user'"
                class="message-row message-row--user"
              >
                <div class="message-user">
                  {{ msg.content }}
                </div>
              </div>
              <div
                v-else
                class="message-row message-row--ai"
              >
                <div class="message-ai">
                  <template v-if="msg.thinking || msg.response">
                    <div class="ai-bubble">
                      <NCollapse
                        v-if="msg.thinking"
                        class="ai-thinking"
                      >
                        <NCollapseItem name="think">
                          <template #header>
                            <span class="ai-thinking-label">思考过程</span>
                          </template>
                          <div class="ai-thinking-content">
                            {{ msg.thinking.replace(/^##\s*Thinking\s*/i, '') }}
                          </div>
                        </NCollapseItem>
                      </NCollapse>
                      <div
                        class="ai-content"
                        v-html="renderMarkdown(msg.response || '')"
                      />
                    </div>
                  </template>
                  <div
                    v-else
                    class="message-ai-fallback"
                    v-html="renderMarkdown(msg.content)"
                  />
                <button class="raw-toggle" @click="showRawContent = !showRawContent">
                  {{ showRawContent ? '收起' : '原始' }}
                </button>
                <pre v-if="showRawContent" class="raw-content">{{ msg.content }}</pre>
                </div>
              </div>
            </div>

            <!-- 正在流式输出的内容 -->
            <div
              v-if="currentAiContent"
              class="message-item"
            >
              <div class="message-row message-row--ai">
                <div class="message-ai">
                  <div class="ai-bubble">
                    <NCollapse
                      v-if="parsedCurrent.thinking"
                      class="ai-thinking"
                      :default-expanded-names="thinkExpanded"
                    >
                      <NCollapseItem name="think">
                        <template #header>
                          <span class="ai-thinking-label">思考过程</span>
                        </template>
                        <div class="ai-thinking-content">
                          {{ parsedCurrent.thinking.replace(/^##\s*Thinking\s*/i, '') }}
                        </div>
                      </NCollapseItem>
                    </NCollapse>
                    <div class="ai-content">
                      <span
                        v-if="parsedCurrent.hasFinal"
                        v-html="renderMarkdown(parsedCurrent.response)"
                      />
                      <span
                        v-else
                        class="streaming-thinking"
                        >思考中...</span
                      >
                      <span
                        v-if="loading"
                        class="streaming-cursor"
                      />
                    </div>
                  </div>
                <button class="raw-toggle" @click="showRawContent = !showRawContent">
                  {{ showRawContent ? '收起' : '原始' }}
                </button>
                <pre v-if="showRawContent" class="raw-content">{{ currentAiContent }}</pre>
                </div>
              </div>
            </div>
          </div>
        </NScrollbar>

        <!-- === 底部输入框 === -->
        <footer class="chat-footer">
          <div
            class="input-wrapper"
            :class="{ 'input-wrapper--focused': isFocused }"
          >
            <textarea
              ref="textareaRef"
              v-model="inputText"
              placeholder="发送消息..."
              rows="1"
              class="chat-textarea"
              :disabled="loading"
              @input="textareaRef && autoResize(textareaRef)"
              @focus="isFocused = true"
              @blur="isFocused = false"
              @keydown.enter.exact.prevent="inputText.trim() && !loading && handleSend()"
            />

            <div class="input-actions">
              <div class="action-left">
                <button
                  v-if="loading"
                  class="action-btn action-btn--stop"
                  @click="handleStop"
                >
                  停止生成
                </button>
                <button
                  v-if="messages.length > 0 && !loading"
                  class="action-btn action-btn--clear"
                  @click="handleClear"
                >
                  清空对话
                </button>
              </div>

              <button
                class="send-btn"
                :class="inputText.trim() && !loading ? 'send-btn--active' : 'send-btn--disabled'"
                :disabled="!inputText.trim() || loading"
                aria-label="发送消息"
                @click="handleSend"
              >
                <span class="iconify text-lg ph--arrow-up" />
              </button>
            </div>
          </div>
        </footer>
      </div>
    </NCard>
  </ScrollContainer>
</template>

<style lang="scss" scoped>
// ============================================================
// 页面级样式
// ============================================================
.health-education-page {
  padding: 20px 24px;
  background: linear-gradient(160deg, #f0f4f8 0%, #f5f7fa 100%);

  @media (max-width: 768px) {
    padding: 12px 8px;
  }
}

.main-card {
  border-radius: 14px;
  box-shadow:
    0 2px 12px rgba(64, 158, 255, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(64, 158, 255, 0.06);
  overflow: hidden;

  :deep(.n-card__content) {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
}

.chat-layout {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.chat-body {
  flex: 1;
  min-height: 0;
}

// ============================================================
// 欢迎页
// ============================================================
.welcome-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 24px 24px;
  max-width: 960px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 32px 16px 16px;
  }
}

.welcome-title {
  margin-bottom: 32px;
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #1e293b;

  @media (max-width: 768px) {
    font-size: 22px;
    margin-bottom: 24px;
  }
}

.categories-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.category-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;

  &--last {
    border-bottom: none;
    padding-bottom: 0;
  }
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
  padding: 4px 10px;
  border-radius: 6px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #e8f4fd;
    color: #337ecc;
  }
}

.more-arrow {
  font-size: 12px;
  transition: transform 0.2s ease;
}

.category-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.question-card {
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e8ecf1;
  background: #f8fafc;
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: #409eff;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
    color: #1e293b;
    transform: translateY(-1px);
  }
}

// ============================================================
// 对话消息区
// ============================================================
.messages-container {
  max-width: 48rem;
  margin: 0 auto;
  padding: 20px 16px;

  @media (max-width: 768px) {
    padding: 16px 12px;
  }
}

.message-item {
  margin-bottom: 20px;
}

.message-row {
  display: flex;

  &--user {
    justify-content: flex-end;
  }

  &--ai {
    justify-content: flex-start;
  }
}

.message-user {
  max-width: 75%;
  padding: 10px 16px;
  border-radius: 16px 4px 16px 16px;
  background: #e8f4fd;
  border: 1px solid #b9d9ff;
  color: #1e293b;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;

  @media (max-width: 1024px) {
    max-width: 85%;
  }

  @media (max-width: 768px) {
    max-width: 90%;
  }
}

.message-ai {
  max-width: 75%;

  @media (max-width: 1024px) {
    max-width: 85%;
  }

  @media (max-width: 768px) {
    max-width: 90%;
  }
}

.ai-bubble {
  border-radius: 4px 16px 16px 16px;
  background: #ffffff;
  border: 1px solid #e8ecf1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.ai-content {
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.7;
  color: #334155;
  word-break: break-word;

  :deep(p) {
    margin: 0 0 8px;
    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(strong) {
    font-weight: 600;
    color: #1e293b;
  }

  :deep(em) {
    font-style: italic;
    color: #475569;
  }

  :deep(h3) {
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
    margin: 16px 0 8px;
  }

  :deep(h4) {
    font-size: 14px;
    font-weight: 600;
    color: #334155;
    margin: 12px 0 6px;
  }

  :deep(ul),
  :deep(ol) {
    margin: 8px 0;
    padding-left: 20px;
  }

  :deep(li) {
    margin-bottom: 4px;
  }

  :deep(code) {
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    color: #334155;
    font-family: 'SF Mono', 'Fira Code', monospace;
  }

  :deep(pre) {
    background: #f8fafc;
    border: 1px solid #e8ecf1;
    border-radius: 8px;
    padding: 12px;
    overflow-x: auto;
    margin: 8px 0;

    code {
      background: none;
      padding: 0;
      border-radius: 0;
      font-size: 13px;
    }
  }

  :deep(a) {
    color: #409eff;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  :deep(blockquote) {
    border-left: 3px solid #409eff;
    padding: 4px 12px;
    margin: 8px 0;
    background: #f8fafc;
    color: #64748b;
  }
}

.ai-thinking {
  :deep(.n-collapse-item__header) {
    font-size: 12px;
    color: #a68a3c;
    padding: 8px 16px !important;
    background: #fefce8;
    border-bottom: 1px solid #fde68a;
  }

  :deep(.n-collapse-item__content-inner) {
    padding: 10px 16px;
    font-size: 13px;
    color: #78716c;
    line-height: 1.6;
    white-space: pre-wrap;
    background: #fffdf0;
  }
}

.ai-thinking-label {
  font-size: 12px;
  color: #a68a3c;
}

.ai-thinking-content {
  font-size: 13px;
  color: #78716c;
  line-height: 1.6;
  white-space: pre-wrap;
}

.message-ai-fallback {
  padding: 10px 16px;
  border-radius: 4px 16px 16px 16px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;

  :deep(p) {
    margin: 0 0 6px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  :deep(strong) {
    font-weight: 600;
    color: #1e293b;
  }
  :deep(ul),
  :deep(ol) {
    margin: 6px 0;
    padding-left: 18px;
  }
  :deep(li) {
    margin-bottom: 2px;
  }
  :deep(code) {
    background: #e8ecf1;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 13px;
  }
  :deep(a) {
    color: #409eff;
  }
}

// ============================================================
// 流式输出
// ============================================================
.streaming-thinking {
  color: #94a3b8;
  font-style: italic;
}

.streaming-cursor {
  display: inline-block;
  width: 2px;
  height: 16px;
  background: #409eff;
  vertical-align: text-bottom;
  margin-left: 2px;
  animation: cursor-blink 1s step-end infinite;
}

@keyframes cursor-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

// ============================================================
// 底部输入区
// ============================================================
.chat-footer {
  flex-shrink: 0;
  border-top: 1px solid #e8ecf1;
  background: linear-gradient(to top, #fafbfc 0%, #ffffff 100%);
  padding: 12px 20px 0;

  @media (max-width: 768px) {
    padding: 10px 12px 16px;
  }
}

.input-wrapper {
  position: relative;
  max-width: 48rem;
  margin: 0 auto;
  border-radius: 16px;
  border: 1px solid #e8ecf1;
  background: #ffffff;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);

  &--focused {
    border-color: #409eff;
    box-shadow:
      0 0 0 3px rgba(64, 158, 255, 0.12),
      0 4px 12px rgba(0, 0, 0, 0.06);
  }
}

.chat-textarea {
  width: 100%;
  resize: none;
  background: transparent;
  border: none;
  outline: none;
  font-size: 15px;
  line-height: 1.6;
  color: #1e293b;
  padding: 14px 18px 8px;
  min-height: 24px;
  max-height: 160px;

  &::placeholder {
    color: #94a3b8;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.input-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 10px;
}

.action-left {
  display: flex;
  gap: 6px;
}

.action-btn {
  border: none;
  background: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &--stop {
    color: #ef4444;

    &:hover {
      background: #fef2f2;
    }
  }

  &--clear {
    color: #64748b;

    &:hover {
      background: #f1f5f9;
      color: #475569;
    }
  }
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &--active {
    background: #409eff;
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.25);

    &:hover {
      background: #337ecc;
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.35);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  &--disabled {
    background: #f1f5f9;
    color: #c0c8d4;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid #409eff;
    outline-offset: 2px;
  }
}

// ============================================================
// 无障碍
// ============================================================
@media (prefers-reduced-motion: reduce) {
  .question-card,
  .more-btn,
  .more-arrow,
  .send-btn,
  .action-btn,
  .input-wrapper {
    transition: none;
  }

  .streaming-cursor {
    animation: none;
    opacity: 1;
  }
}

.raw-toggle {
  display: inline-block;
  margin-top: 8px;
  padding: 2px 8px;
  border: 1px solid #e8ecf1;
  border-radius: 4px;
  background: #fafbfc;
  color: #94a3b8;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: #64748b;
    border-color: #cbd5e1;
  }
}

.raw-content {
  margin-top: 6px;
  padding: 10px;
  border-radius: 6px;
  background: #fefce8;
  border: 1px solid #fde68a;
  font-size: 12px;
  line-height: 1.5;
  color: #78716c;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 240px;
  overflow-y: auto;
}
</style>
