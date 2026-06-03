<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ScrollContainer } from '@/components'
import { useInjection, useSSE } from '@/composables'
import { streamDrugReminderAi } from '@/api/aiDrugReminder'
import { getPatientList, type PatientRecord } from '@/api'
import {
  NCard,
  NDataTable,
  NButton,
  NInput,
  NPagination,
  NScrollbar,
  NSpin,
  useMessage,
  type DataTableColumns,
  type PaginationProps,
  type ScrollbarInst,
} from 'naive-ui'
import { mediaQueryInjectionKey } from '@/injection'

defineOptions({ name: 'AiDrugReminder' })

const { isMaxMd, isMaxLg } = useInjection(mediaQueryInjectionKey)
const message = useMessage()
const { start: startSSE, abort: abortSSE } = useSSE()

// ===================== 患者列表 =====================
const selectedPatient = ref<PatientRecord | null>(null)
const searchKeyword = ref('')
const patientList = ref<PatientRecord[]>([])
const patientLoading = ref(false)
const patientPagination = ref<PaginationProps>({ page: 1, pageSize: 15, itemCount: 0 })
const queryParams = ref({ zyh: '' as string | undefined, name: '' as string | undefined, pageNum: 1, pageSize: 15 })

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function loadPatients() {
  patientLoading.value = true
  try {
    const { data } = await getPatientList(queryParams.value)
    patientList.value = data.list || []
    patientPagination.value.itemCount = data.total || 0
  } finally { patientLoading.value = false }
}

function handleSearch() {
  queryParams.value.zyh = searchKeyword.value || undefined
  queryParams.value.name = undefined
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { patientPagination.value.page = 1; queryParams.value.pageNum = 1; loadPatients() }, 300)
}

function handlePageChange(page: number) { patientPagination.value.page = page; queryParams.value.pageNum = page; loadPatients() }

function handleSelectPatient(row: PatientRecord) { selectedPatient.value = row; resetAIState() }

const columns: DataTableColumns<PatientRecord> = [
  { title: '住院号', key: 'zyh', width: 120 },
  { title: '姓名', key: 'name', width: 80 },
  { title: '性别', key: 'sex', width: 60 },
  { title: '年龄', key: 'age', width: 60 },
]

// ===================== AI 流式 =====================
const streamingText = ref('')
const isGenerating = ref(false)
const streamError = ref<string | null>(null)
const responseBoxRef = ref<ScrollbarInst | null>(null)
let streamAbortController: AbortController | null = null

function scrollToBottom() { nextTick(() => { responseBoxRef.value?.scrollTo({ top: 999999 }) }) }

function resetAIState() {
  if (streamAbortController) { streamAbortController.abort(); streamAbortController = null }
  abortSSE()
  streamingText.value = ''
  streamError.value = null
  isGenerating.value = false
}

async function handleQuery() {
  if (!selectedPatient.value) { message.warning('请先在左侧列表中选择一位患者'); return }
  resetAIState()
  isGenerating.value = true
  streamAbortController = new AbortController()
  try {
    const res = await streamDrugReminderAi({
      patientId: selectedPatient.value.zyh,
      question: '请生成用药方案',
      signal: streamAbortController.signal,
    })
    await startSSE('', { response: res, onMessage: (text: string) => { streamingText.value += text; scrollToBottom() } })
  } catch (e: unknown) {
    streamError.value = e instanceof Error ? e.message : '请求失败'
    message.error('AI用药提醒查询失败')
  } finally { isGenerating.value = false; streamAbortController = null }
}

onMounted(() => { loadPatients() })
</script>

<template>
  <ScrollContainer
    wrapper-class="flex flex-col gap-y-4 ai-drug-reminder-page"
    :scrollable="isMaxLg"
  >
    <NCard
      class="main-card flex-1"
      :size="isMaxMd ? 'small' : undefined"
      content-class="flex flex-col min-h-0"
    >
      <div class="content-layout">
        <div class="left-panel">
          <div class="panel-header"><span class="panel-title">患者列表</span></div>
          <div class="search-box">
            <NInput v-model:value="searchKeyword" placeholder="搜索住院号或姓名..." size="small" clearable @input="handleSearch" @clear="handleSearch" />
          </div>
          <div class="table-wrapper">
            <NDataTable
              :columns="columns" :data="patientList" :loading="patientLoading" size="small"
              :row-props="(row: any) => ({ class: selectedPatient?.zyh === row.zyh ? 'row-selected' : '', onClick: () => handleSelectPatient(row), style: 'cursor: pointer' })"
            />
          </div>
          <div class="pagination-box">
            <NPagination :page="patientPagination.page" :page-size="15" :page-slot="5" :item-count="patientPagination.itemCount" :disabled="patientLoading" size="small" @update:page="handlePageChange" />
          </div>
        </div>

        <div class="right-panel">
          <div class="ai-action-bar">
            <NButton
              type="primary"
              size="large"
              :loading="isGenerating"
              :disabled="!selectedPatient"
              @click="handleQuery"
            >
              <template #icon><span class="iconify ph--bell-ringing" /></template>
              AI 用药提醒
            </NButton>
            <span v-if="!selectedPatient" class="hint-text">请先选择患者</span>
            <NButton v-if="isGenerating" size="small" text type="warning" @click="resetAIState">停止生成</NButton>
          </div>

          <div class="ai-response-area">
            <NScrollbar ref="responseBoxRef">
              <div v-if="!streamingText && !isGenerating && !streamError" class="response-placeholder">
                <span class="iconify placeholder-icon ph--bell-ringing" />
                <p class="placeholder-text">点击"AI 用药提醒"按钮，智能生成患者用药提醒和药物咨询建议</p>
              </div>
              <div v-if="isGenerating && !streamingText" class="response-loading">
                <NSpin size="medium" /><p class="loading-text">AI 正在生成用药提醒和药物咨询建议...</p>
              </div>
              <div v-if="streamingText" class="response-content">
                <div class="response-text">
                  <template v-for="(block, bi) in streamingText.split('\n\n').filter(Boolean)" :key="bi">
                    <h3 v-if="block.startsWith('## ')" class="resp-h3">{{ block.replace('## ', '') }}</h3>
                    <h4 v-else-if="block.startsWith('### ')" class="resp-h4">{{ block.replace('### ', '') }}</h4>
                    <ul v-else-if="block.includes('\n- ')" class="resp-ul"><li v-for="(line, li) in block.split('\n').filter((l) => l.trim())" :key="li" class="resp-li">{{ line.replace(/^- /, '').replace(/^\d+\.\s/, '') }}</li></ul>
                    <p v-else class="resp-p">{{ block }}</p>
                  </template>
                </div>
              </div>
              <div v-if="streamError" class="response-error">
                <span class="iconify error-icon ph--warning-circle" /><p>{{ streamError }}</p>
                <NButton size="small" text type="primary" @click="handleQuery">重试</NButton>
              </div>
            </NScrollbar>
          </div>
        </div>
      </div>
    </NCard>
  </ScrollContainer>
</template>

<style lang="scss" scoped>
.ai-drug-reminder-page { padding: 20px 24px; background: linear-gradient(160deg, #f0f4f8 0%, #f5f7fa 100%); @media (max-width: 768px) { padding: 12px 8px; } }
.main-card { display: flex; flex-direction: column; min-height: 0; background: #ffffff; border-radius: 14px; overflow: visible; box-shadow: 0 2px 12px rgba(64,158,255,0.06), 0 1px 3px rgba(0,0,0,0.04); border: 1px solid rgba(64,158,255,0.06); :deep(.n-card__content) { flex: 1; min-height: 0; overflow: hidden; } }
.content-layout { flex: 1; display: flex; gap: 20px; min-height: 0; overflow: hidden; @media (max-width: 1024px) { flex-direction: column; } }
.left-panel { width: 350px; flex-shrink: 0; display: flex; flex-direction: column; border-right: 1px solid #e8ecf1; padding-right: 20px; @media (max-width: 1024px) { width: 100%; border-right: none; border-bottom: 1px solid #e8ecf1; padding-right: 0; padding-bottom: 16px; } }
.panel-header { margin-bottom: 12px; }
.panel-title { font-size: 14px; font-weight: 600; color: #334155; }
.search-box { margin-bottom: 12px; }
.table-wrapper { flex: 1; min-height: 0; display: flex; flex-direction: column; :deep(.n-data-table) { flex: 1; min-height: 0; display: flex; flex-direction: column; } :deep(.n-data-table .n-data-table-base-table) { flex: 1; min-height: 0; } }
.pagination-box { padding-top: 12px; display: flex; justify-content: center; overflow: hidden; }
:deep(.row-selected td) { background: #e8f4fd !important; transition: background-color 0.2s ease; }
:deep(.n-data-table-th) { background: #f8fafc !important; font-weight: 600; color: #334155; font-size: 12px; }
:deep(.n-data-table-td) { font-size: 13px; color: #475569; }
:deep(.n-data-table-tr:hover td) { background: #f0f9ff !important; }

.right-panel { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; gap: 16px; overflow: hidden; }

.ai-action-bar { display: flex; align-items: center; gap: 12px; }
.hint-text { font-size: 13px; color: #64748b; }

.ai-response-area { position: relative; flex: 1; overflow: hidden; min-height: 0; border: 1px solid #e8ecf1; border-radius: 10px; background: #fafbfc; }

.response-placeholder { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center; gap: 16px; }
.placeholder-icon { font-size: 44px; color: #cbd5e1; }
.placeholder-text { font-size: 14px; color: #64748b; line-height: 1.6; }

.response-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; gap: 16px; }
.loading-text { font-size: 14px; color: #64748b; }

.response-content { padding: 20px 24px; animation: fade-in 0.3s ease; @media (max-width: 768px) { padding: 14px 16px; } }
@keyframes fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.response-text { font-size: 14px; line-height: 1.85; color: #1e293b; }
.resp-h3 { font-size: 16px; font-weight: 700; color: #0f172a; margin: 20px 0 8px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
.resp-h4 { font-size: 14px; font-weight: 600; color: #334155; margin: 14px 0 6px; }
.resp-ul { padding-left: 20px; margin: 6px 0 12px; }
.resp-li { margin-bottom: 4px; color: #475569; }
.resp-p { font-size: 14px; color: #475569; }

.response-error { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center; color: #ef4444; gap: 8px; }
.error-icon { font-size: 28px; }

@media (prefers-reduced-motion: reduce) { .response-content { animation: none; } }
</style>
