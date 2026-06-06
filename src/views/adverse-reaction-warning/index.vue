<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { ScrollContainer } from '@/components'
import { useInjection, useSSE } from '@/composables'
import { renderMarkdown, parseAiResponse } from '@/utils/markdown'
import { streamAdverseReactionConsult } from '@/api/adverseReactionEducation'
import { getDrugUsageByZyh, type DrugUsageItem } from '@/api/treatmentEffectiveness'
import { getPatientList, type PatientRecord } from '@/api'
import {
  NCard,
  NDataTable,
  NButton,
  NInput,
  NPagination,
  NScrollbar,
  NSpin,
  NCollapse,
  NCollapseItem,
  useMessage,
  type DataTableColumns,
  type PaginationProps,
  type ScrollbarInst,
} from 'naive-ui'
import { mediaQueryInjectionKey } from '@/injection'

defineOptions({ name: 'AdverseReactionEducation' })

const { isMaxMd, isMaxLg } = useInjection(mediaQueryInjectionKey)

const message = useMessage()
const { start: startSSE, abort: abortSSE } = useSSE()

const selectedPatient = ref<PatientRecord | null>(null)
const searchKeyword = ref('')
const patientList = ref<PatientRecord[]>([])
const patientLoading = ref(false)
const patientPagination = ref<PaginationProps>({
  page: 1,
  pageSize: 15,
  itemCount: 0,
})
const queryParams = ref({
  zyh: '' as string | undefined,
  name: '' as string | undefined,
  pageNum: 1,
  pageSize: 15,
})

const drugUsageList = ref<DrugUsageItem[]>([])
const drugUsageLoading = ref(false)
const drugUsagePagination = ref<PaginationProps>({
  page: 1,
  pageSize: 10,
  itemCount: 0,
})

const streamingText = ref('')
const showRawContent = ref(false)
const isGenerating = ref(false)
const streamError = ref<string | null>(null)
const responseBoxRef = ref<ScrollbarInst | null>(null)

const parsedAi = computed(() => parseAiResponse(streamingText.value))
let streamAbortController: AbortController | null = null

function scrollResponseToBottom() {
  nextTick(() => {
    responseBoxRef.value?.scrollTo({ top: 999999 })
  })
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function loadPatients() {
  patientLoading.value = true
  try {
    const { data } = await getPatientList(queryParams.value)
    patientList.value = data.list || []
    patientPagination.value.itemCount = data.total || 0
  } finally {
    patientLoading.value = false
  }
}

function handleSearch() {
  queryParams.value.zyh = searchKeyword.value || undefined
  queryParams.value.name = undefined
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    patientPagination.value.page = 1
    queryParams.value.pageNum = 1
    loadPatients()
  }, 300)
}

function handlePageChange(page: number) {
  patientPagination.value.page = page
  queryParams.value.pageNum = page
  loadPatients()
}

async function handleSelectPatient(row: PatientRecord) {
  selectedPatient.value = row
  drugUsageList.value = []
  drugUsagePagination.value.page = 1
  drugUsagePagination.value.itemCount = 0
  resetAIState()
  await loadDrugUsage()
}

async function loadDrugUsage() {
  if (!selectedPatient.value) return

  drugUsageLoading.value = true
  try {
    const { data } = await getDrugUsageByZyh({
      zyh: selectedPatient.value.zyh,
      pageNum: drugUsagePagination.value.page || 1,
      pageSize: drugUsagePagination.value.pageSize || 10,
    })
    const { list, total } = data
    drugUsageList.value = list || []
    drugUsagePagination.value.itemCount = total || 0
  } catch {
    drugUsageList.value = []
    drugUsagePagination.value.itemCount = 0
  } finally {
    drugUsageLoading.value = false
  }
}

function handleDrugUsagePageChange(page: number) {
  drugUsagePagination.value.page = page
  loadDrugUsage()
}

function resetAIState() {
  if (streamAbortController) {
    streamAbortController.abort()
    streamAbortController = null
  }
  abortSSE()
  streamingText.value = ''
  streamError.value = null
  isGenerating.value = false
}

async function handleQuery() {
  if (!selectedPatient.value) {
    message.warning('请先在左侧列表中选择一位患者')
    return
  }

  resetAIState()
  isGenerating.value = true

  streamAbortController = new AbortController()

  try {
    const res = await streamAdverseReactionConsult({
      patientId: selectedPatient.value.zyh,
      question: '请查询该患者可能发生的药物不良反应风险',
      consultType: 'adverse_reaction',
      signal: streamAbortController.signal,
    })

    await startSSE('', {
      response: res,
      onMessage: (text: string) => {
        streamingText.value += text
        scrollResponseToBottom()
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '请求失败'
    streamError.value = msg
    message.error('AI药物不良反应查询失败')
  } finally {
    isGenerating.value = false
    streamAbortController = null
  }
}

const columns: DataTableColumns<PatientRecord> = [
  { title: '住院号', key: 'zyh', width: 120 },
  { title: '姓名', key: 'name', width: 80 },
  { title: '性别', key: 'sex', width: 60 },
  { title: '年龄', key: 'age', width: 60 },
]

onMounted(() => {
  loadPatients()
})
</script>

<template>
  <ScrollContainer
    wrapper-class="flex flex-col gap-y-4 adverse-reaction-warning-page"
    :scrollable="isMaxLg"
  >
    <NCard
      class="main-card flex-1"
      :size="isMaxMd ? 'small' : undefined"
      content-class="flex flex-col min-h-0"
    >
      <div class="content-layout">
        <div class="left-panel">
          <div class="panel-header">
            <span class="panel-title">患者列表</span>
          </div>
          <div class="search-box">
            <NInput
              v-model:value="searchKeyword"
              placeholder="搜索住院号或姓名..."
              size="small"
              clearable
              @input="handleSearch"
              @clear="handleSearch"
            />
          </div>
          <div class="table-wrapper">
            <NDataTable
              :columns="columns"
              :data="patientList"
              :loading="patientLoading"
              size="small"
              :row-props="
                (row: any) => ({
                  class: selectedPatient?.zyh === row.zyh ? 'row-selected' : '',
                  onClick: () => handleSelectPatient(row),
                  style: 'cursor: pointer',
                })
              "
            />
          </div>
          <div class="pagination-box">
            <NPagination
              :page="patientPagination.page"
              :page-size="15"
              :page-slot="5"
              :item-count="patientPagination.itemCount"
              :disabled="patientLoading"
              size="small"
              @update:page="handlePageChange"
            />
          </div>
        </div>

        <div class="right-panel">
          <div class="medication-panel">
            <div class="medication-panel-header">
              <span class="medication-panel-icon iconify ph--prescription" />
              <span class="medication-panel-title">近期用药记录</span>
              <span
                v-if="drugUsagePagination.itemCount"
                class="medication-count"
                >{{ drugUsagePagination.itemCount }} 条用药记录</span
              >
            </div>

            <div
              v-if="!selectedPatient"
              class="medication-panel-placeholder"
            >
              <span class="placeholder-icon iconify ph--pill" />
              <p class="placeholder-desc">选择患者后显示用药信息</p>
            </div>

            <template v-else>
              <div class="medication-body">
                <div
                  v-if="drugUsageLoading && !drugUsageList.length"
                  class="medication-panel-placeholder"
                >
                  <NSpin size="small" />
                  <p class="placeholder-desc">加载用药方案中...</p>
                </div>

                <div
                  v-else-if="!drugUsageLoading && !drugUsageList.length"
                  class="medication-panel-placeholder"
                >
                  <span class="placeholder-icon iconify ph--pill" />
                  <p class="placeholder-desc">该患者暂无用药记录</p>
                </div>

                <template v-else>
                  <div
                    v-if="drugUsageLoading"
                    class="medication-loading-bar"
                  >
                    <NSpin size="tiny" />
                  </div>
                  <NScrollbar class="medication-list-scrollbar">
                    <div class="medication-list">
                      <div
                        v-for="(item, i) in drugUsageList"
                        :key="i"
                        class="medication-item"
                      >
                        <div class="medication-item-row">
                          <span class="drug-index">{{
                            (drugUsagePagination.page - 1) * drugUsagePagination.pageSize + i + 1
                          }}</span>
                          <span class="drug-name">{{ item.yzmc }}</span>
                          <span class="drug-route">{{ item.ypyf }}</span>
                          <span
                            v-if="item.zxpc"
                            class="drug-tag drug-tag--dosage"
                          >
                            <span class="iconify ph--drop-half-bottom" />
                            {{ item.zxpc }}
                          </span>
                          <span
                            v-if="item.zxpl"
                            class="drug-tag drug-tag--freq"
                          >
                            <span class="iconify ph--clock" />
                            {{ item.zxpl }}
                          </span>
                          <span
                            v-if="item.sypc && item.sypc !== item.zxpl"
                            class="drug-tag drug-tag--usage"
                          >
                            <span class="iconify ph--info" />
                            {{ item.sypc }}
                          </span>
                          <span class="drug-time">{{ item.kzsjFormatted || item.kzsj }}</span>
                        </div>
                      </div>
                    </div>
                  </NScrollbar>

                  <div
                    v-if="drugUsagePagination.itemCount > drugUsagePagination.pageSize"
                    class="medication-pagination"
                  >
                    <NPagination
                      :page="drugUsagePagination.page"
                      :page-size="drugUsagePagination.pageSize"
                      :page-slot="5"
                      :item-count="drugUsagePagination.itemCount"
                      :disabled="drugUsageLoading"
                      size="small"
                      @update:page="handleDrugUsagePageChange"
                    />
                  </div>
                </template>
              </div>
            </template>
          </div>

          <div class="ai-action-bar">
            <NButton
              type="primary"
              size="large"
              :loading="isGenerating"
              :disabled="!selectedPatient"
              @click="handleQuery"
            >
              <template #icon>
                <span class="iconify ph--warning-octagon" />
              </template>
              AI 查询药物不良反应
            </NButton>
            <span
              v-if="!selectedPatient"
              class="hint-text"
              >请先选择患者</span
            >
            <NButton
              v-if="isGenerating"
              size="small"
              text
              type="warning"
              @click="resetAIState"
            >
              停止生成
            </NButton>
          </div>

          <div class="ai-response-area">
            <NScrollbar ref="responseBoxRef">
              <div
                v-if="!streamingText && !isGenerating && !streamError"
                class="response-placeholder"
              >
                <span class="iconify text-5xl text-slate-300 ph--warning-octagon" />
                <p class="placeholder-text">
                  点击"AI 查询药物不良反应"按钮，智能分析患者用药方案中的不良反应风险
                </p>
              </div>

              <div
                v-if="isGenerating && !streamingText"
                class="response-loading"
              >
                <NSpin size="medium" />
                <p class="loading-text">AI 正在分析患者用药方案，识别药物不良反应风险...</p>
              </div>

              <div
                v-if="streamingText"
                class="response-content"
              >
                <NCollapse
                  v-if="parsedAi.thinking"
                  class="ai-thinking"
                  :default-expanded-names="parsedAi.hasFinal ? [] : ['think']"
                >
                  <NCollapseItem name="think">
                    <template #header>
                      <span class="ai-thinking-label">思考过程</span>
                    </template>
                    <div class="ai-thinking-content">{{ parsedAi.thinking }}</div>
                  </NCollapseItem>
                </NCollapse>
                <div
                  v-if="parsedAi.hasFinal || !parsedAi.thinking"
                  class="ai-content"
                  v-html="renderMarkdown(parsedAi.response || streamingText)"
                />
                <span
                  v-if="isGenerating && !parsedAi.hasFinal && parsedAi.thinking"
                  class="streaming-thinking"
                  >思考中...</span
                >
                <span
                  v-if="isGenerating"
                  class="streaming-cursor"
                />
                <button class="raw-toggle" @click="showRawContent = !showRawContent">
                  {{ showRawContent ? '收起' : '原始' }}
                </button>
                <pre v-if="showRawContent" class="raw-content">{{ streamingText }}</pre>
              </div>

              <div
                v-if="streamError"
                class="response-error"
              >
                <span class="iconify text-3xl text-red-400 ph--warning-circle" />
                <p>{{ streamError }}</p>
                <NButton
                  size="small"
                  text
                  type="primary"
                  @click="handleQuery"
                >
                  重试
                </NButton>
              </div>
            </NScrollbar>
          </div>
        </div>
      </div>
    </NCard>
  </ScrollContainer>
</template>

<style lang="scss" scoped>
.adverse-reaction-warning-page {
  padding: 20px 24px;
  background: linear-gradient(160deg, #f0f4f8 0%, #f5f7fa 100%);

  @media (max-width: 768px) {
    padding: 12px 8px;
  }
}

.main-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #ffffff;
  border-radius: 14px;
  overflow: visible;
  box-shadow:
    0 2px 12px rgba(64, 158, 255, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(64, 158, 255, 0.06);

  :deep(.n-card__content) {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
}

.content-layout {
  flex: 1;
  display: flex;
  gap: 20px;
  min-height: 0;
  overflow: hidden;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
}

.left-panel {
  width: 350px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e8ecf1;
  padding-right: 20px;

  @media (max-width: 1024px) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e8ecf1;
    padding-right: 0;
    padding-bottom: 16px;
  }
}

.panel-header {
  margin-bottom: 12px;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  letter-spacing: 0.01em;
}

.search-box {
  margin-bottom: 12px;
}

.table-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  :deep(.n-data-table) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  :deep(.n-data-table .n-data-table-base-table) {
    flex: 1;
    min-height: 0;
  }
}

.empty-state {
  text-align: center;
  padding: 32px 0;
  color: #94a3b8;
  font-size: 13px;
}

.pagination-box {
  padding-top: 12px;
  display: flex;
  justify-content: center;
  overflow: hidden;
}

:deep(.row-selected td) {
  background: #e8f4fd !important;
}

:deep(.n-data-table-th) {
  background: #f8fafc !important;
  font-weight: 600;
  color: #334155;
  font-size: 12px;
  letter-spacing: 0.02em;
}

:deep(.n-data-table-td) {
  font-size: 13px;
  color: #475569;
}

:deep(.n-data-table-tr:hover td) {
  background: #f0f9ff !important;
}

.right-panel {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

.medication-panel {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  max-height: 305px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
}

.medication-panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  border-bottom: 1px solid #e8ecf1;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  flex-shrink: 0;
  background: #fafbfc;
  border-radius: 10px 10px 0 0;
}

.medication-panel-icon {
  font-size: 18px;
  color: #409eff;
  flex-shrink: 0;
}

.medication-panel-title {
  letter-spacing: 0.01em;
}

.medication-count {
  margin-left: auto;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  padding: 2px 10px;
  background: #f1f5f9;
  border-radius: 10px;
}

.medication-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}

.medication-loading-bar {
  display: flex;
  justify-content: center;
  padding: 6px;
  background: linear-gradient(180deg, #eff6ff 0%, transparent 100%);
  flex-shrink: 0;
}

.medication-panel-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 24px;
  gap: 10px;
  color: #64748b;
}

.placeholder-icon {
  font-size: 28px;
  color: #cbd5e1;
}

.placeholder-desc {
  font-size: 13px;
  color: #64748b;
}

.medication-list-scrollbar {
  flex: 1;
  min-height: 0;
}

.medication-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 18px;
}

.medication-item {
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid transparent;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    background: #ffffff;
    border-color: #b9d9ff;
    box-shadow: 0 1px 8px rgba(64, 158, 255, 0.06);
  }
}

.medication-item-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.drug-index {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  min-width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.drug-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
  flex-shrink: 0;
}

.drug-route {
  font-size: 12px;
  font-weight: 500;
  color: #2563eb;
  padding: 2px 10px;
  background: #dbeafe;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

.drug-time {
  margin-left: auto;
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  flex-shrink: 0;
}

.drug-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 4px;
  line-height: 1.5;

  .iconify {
    font-size: 14px;
    flex-shrink: 0;
  }
}

.drug-tag--dosage {
  color: #475569;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
}

.drug-tag--freq {
  color: #166534;
  background: #dcfce7;
  border: 1px solid #bbf7d0;
}

.drug-tag--usage {
  color: #92400e;
  background: #fef3c7;
  border: 1px solid #fde68a;
}

.medication-pagination {
  padding: 8px 18px 12px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #f1f5f9;
  flex-shrink: 0;

  :deep(.n-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }
}

.ai-action-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hint-text {
  font-size: 13px;
  color: #94a3b8;
}

.ai-response-area {
  position: relative;
  flex: 1;
  overflow: hidden;
  min-height: 0;
  border: 1px solid #e8ecf1;
  border-radius: 10px;
  background: #fafbfc;
}

.response-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  gap: 16px;
}

.placeholder-text {
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.6;
}

.response-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 16px;
}

.loading-text {
  font-size: 14px;
  color: #64748b;
}

.response-content {
  padding: 20px 24px;
  animation: fade-in 0.3s ease;

  @media (max-width: 768px) {
    padding: 14px 16px;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// ============================================================
// Markdown 渲染元素
// ============================================================
.ai-content {
  font-size: 14px;
  line-height: 1.85;
  color: #1e293b;

  :deep(p) {
    margin: 0 0 10px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  :deep(strong) {
    font-weight: 600;
    color: #0f172a;
  }
  :deep(em) {
    font-style: italic;
    color: #475569;
  }
  :deep(h2) {
    font-size: 17px;
    font-weight: 700;
    color: #0f172a;
    margin: 24px 0 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid #e8ecf1;
  }
  :deep(h3) {
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
    margin: 18px 0 8px;
  }
  :deep(h4) {
    font-size: 14px;
    font-weight: 600;
    color: #334155;
    margin: 14px 0 6px;
  }
  :deep(ul),
  :deep(ol) {
    margin: 8px 0 12px;
    padding-left: 20px;
  }
  :deep(li) {
    margin-bottom: 4px;
    color: #475569;
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

// ============================================================
// 思考过程
// ============================================================
.ai-thinking {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #fde68a;

  :deep(.n-collapse-item__header) {
    font-size: 12px;
    color: #a68a3c;
    padding: 8px 14px !important;
    background: #fefce8;
    border-bottom: 1px solid #fde68a;
  }

  :deep(.n-collapse-item__content-inner) {
    padding: 10px 14px;
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
// 错误态
// ============================================================
.response-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: #ef4444;
  gap: 8px;
}

@media (prefers-reduced-motion: reduce) {
  .response-content {
    animation: none;
  }
  .streaming-cursor {
    animation: none;
    opacity: 1;
  }
  .medication-item {
    transition: none;
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
  &:hover { color: #64748b; border-color: #cbd5e1; }
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
