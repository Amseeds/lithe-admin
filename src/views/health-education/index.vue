<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useMessage } from 'naive-ui'
import { streamConsult } from '@/api/adverseReactionEducation'

defineOptions({
  name: 'ScienceEducation',
})

const message = useMessage()

const inputText = ref('')
const isFocused = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const recommandations = ref<{ id: number; category: string; text: string }[][]>([])

// 对话相关
const messages = ref<{ role: 'user' | 'ai'; content: string }[]>([])
const currentAiContent = ref('')
const loading = ref(false)
const chatBoxRef = ref<HTMLDivElement | null>(null)
let abortController: AbortController | null = null

const allSuggestions = [
  {
    id: 1,
    category: '初始评估与用药启动',
    text: '刚确诊糖尿病，如何根据我的年龄和体重制定初始用药方案？',
  },
  {
    id: 2,
    category: '初始评估与用药启动',
    text: '糖化血红蛋白(HbA1c) 8.5%，二甲双胍单药治疗是否足够？',
  },
  {
    id: 3,
    category: '初始评估与用药启动',
    text: '我的胰岛功能报告提示β细胞功能尚可，是否适合使用DPP-4抑制剂？',
  },
  {
    id: 4,
    category: '初始评估与用药启动',
    text: '肾功能轻度减退（eGFR 55），哪些口服降糖药需要调整剂量？',
  },
  {
    id: 5,
    category: '初始评估与用药启动',
    text: '最近多次出现低血糖，如何重新评估我的降糖方案强度？',
  },
  {
    id: 6,
    category: '个体化药物选择',
    text: '合并慢性肾病（CKD），SGLT2抑制剂和GLP-1受体激动剂哪个更优？',
  },
  {
    id: 7,
    category: '个体化药物选择',
    text: '糖尿病合并心血管疾病，GLP-1激动剂与SGLT2抑制剂如何协同使用？',
  },
  { id: 8, category: '个体化药物选择', text: '餐后血糖持续偏高，阿卡波糖和瑞格列奈谁更适合我？' },
  {
    id: 9,
    category: '个体化药物选择',
    text: '胰岛素起始治疗，基础胰岛素（甘精）与预混胰岛素（30R）如何选择？',
  },
  {
    id: 10,
    category: '个体化药物选择',
    text: '2型糖尿病肥胖患者，GLP-1激动剂与二甲双胍联合用药策略？',
  },
  {
    id: 11,
    category: '用药调整与剂量优化',
    text: '二甲双胍从500mg加至850mg，胃肠道不耐受如何应对？',
  },
  {
    id: 12,
    category: '用药调整与剂量优化',
    text: '甘精胰岛素每天12单位，空腹血糖仍高于7.0，如何逐步调整剂量？',
  },
  {
    id: 13,
    category: '用药调整与剂量优化',
    text: '使用SGLT2抑制剂后出现体重下降、肌酐升高，需要停药吗？',
  },
  {
    id: 14,
    category: '用药调整与剂量优化',
    text: '餐时胰岛素（赖脯）与基础胰岛素比例为1:2，如何优化注射时间点？',
  },
  {
    id: 15,
    category: '用药调整与剂量优化',
    text: '老年人使用磺脲类降糖药（格列美脲），如何调整剂量预防低血糖？',
  },
  {
    id: 16,
    category: '不良反应与药学监护',
    text: '使用恩格列净后出现反复泌尿系感染，如何处理及预防？',
  },
  {
    id: 17,
    category: '不良反应与药学监护',
    text: '利拉鲁肽引起持续性恶心呕吐，是否可调整为度拉糖肽？',
  },
  { id: 18, category: '不良反应与药学监护', text: '二甲双胍长期服用后维生素B12缺乏，如何补充？' },
  {
    id: 19,
    category: '不良反应与药学监护',
    text: '使用达格列净后出现酮症酸中毒（DKA）倾向，我该注意什么？',
  },
  {
    id: 20,
    category: '不良反应与药学监护',
    text: '格列吡嗪导致严重的低血糖，更换为西格列汀是否可行？',
  },
  {
    id: 21,
    category: '合并症与特殊人群管理',
    text: '糖尿病合并肝硬化（Child-Pugh B级），哪些降糖药禁用？',
  },
  {
    id: 22,
    category: '合并症与特殊人群管理',
    text: '妊娠期糖尿病（GDM），哪些口服降糖药相对安全？',
  },
  {
    id: 23,
    category: '合并症与特殊人群管理',
    text: '糖尿病患者合并甲状腺功能减退，左甲状腺素与降糖药如何错时服用？',
  },
  {
    id: 24,
    category: '合并症与特殊人群管理',
    text: '老年（80岁）糖尿病患者，控制目标是HbA1c 7.5%还是8.0%？',
  },
  {
    id: 25,
    category: '生活方式与长期随访',
    text: '每日服用二甲双胍缓释片，忘记一次该立即补服还是跳过？',
  },
  {
    id: 26,
    category: '生活方式与长期随访',
    text: '糖尿病患者服用他汀类药物，降糖药与他汀是否需要减量？',
  },
  {
    id: 27,
    category: '生活方式与长期随访',
    text: '糖尿病患者复诊前3天如何自行监测血糖并调整用药？',
  },
]

function shufflePick(arr: typeof allSuggestions, n: number) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, n)
}

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 400) + 'px'
}

function splitIntoRows(items: typeof allSuggestions, cols: number) {
  const rows: (typeof allSuggestions)[] = []
  for (let i = 0; i < items.length; i += cols) {
    rows.push(items.slice(i, i + cols))
  }
  return rows
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
    const res = await streamConsult({
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

onMounted(() => {
  const picked = shufflePick(allSuggestions, 9)
  recommandations.value = splitIntoRows(picked, 3)
})
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
        <h1 class="mb-10 text-center text-3xl font-bold tracking-tight text-gray-900">
          有什么我能帮你的吗？
        </h1>

        <div class="flex w-full flex-col items-center gap-3">
          <div
            v-for="(row, rowIdx) in recommandations"
            :key="rowIdx"
            class="flex justify-center gap-3"
          >
            <button
              v-for="card in row"
              :key="card.id"
              class="flex shrink-0 cursor-pointer items-center justify-center truncate rounded-xl px-5 py-3 text-sm text-gray-900 transition-all duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus-visible:outline-none"
              style="background-color: #eaeaea"
              @click="handleCardClick(card.text)"
            >
              {{ card.text }}
            </button>
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
