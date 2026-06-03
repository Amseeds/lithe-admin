<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useSSE } from '@/composables'
import { streamInteractionConsult } from '@/api/interactionEducation'
import { getDrugUsageByZyh, type DrugUsageItem } from '@/api/treatmentEffectiveness'
import { getPatientList, type PatientRecord } from '@/api'
import {
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

defineOptions({ name: 'PatientMedicationEducation' })

const message = useMessage()
const { start: startSSE, abort: abortSSE } = useSSE()

const selectedPatient = ref<PatientRecord | null>(null)
const searchKeyword = ref('')
const patientList = ref<PatientRecord[]>([])
const patientLoading = ref(false)
const patientPagination = ref<PaginationProps>({ page: 1, pageSize: 15, itemCount: 0 })
const queryParams = ref({
  zyh: '' as string | undefined,
  name: '' as string | undefined,
  pageNum: 1,
  pageSize: 15,
})

const drugUsageList = ref<DrugUsageItem[]>([])
const drugUsageLoading = ref(false)
const drugUsagePagination = ref<PaginationProps>({ page: 1, pageSize: 10, itemCount: 0 })

const streamingText = ref('')
const isGenerating = ref(false)
const streamError = ref<string | null>(null)
const responseBoxRef = ref<ScrollbarInst | null>(null)
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
    const res = await streamInteractionConsult({
      patientId: selectedPatient.value.zyh,
      question: '请查询该患者当前用药方案中存在的药物相互作用风险',
      consultType: 'interaction',
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
    streamError.value = e instanceof Error ? e.message : '请求失败'
    message.error('AI药物相互作用查询失败')
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
  <div class="content-layout">
    <div class="left-panel">
      <div class="panel-header"><span class="panel-title">患者列表</span></div>
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
          <span class="medication-panel-title">用药记录</span>
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
              <p class="placeholder-desc">加载用药记录中...</p>
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
                        ><span class="iconify ph--drop-half-bottom" />{{ item.zxpc }}</span
                      >
                      <span
                        v-if="item.zxpl"
                        class="drug-tag drug-tag--freq"
                        ><span class="iconify ph--clock" />{{ item.zxpl }}</span
                      >
                      <span
                        v-if="item.sypc && item.sypc !== item.zxpl"
                        class="drug-tag drug-tag--usage"
                        ><span class="iconify ph--info" />{{ item.sypc }}</span
                      >
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
          <template #icon><span class="iconify ph--intersect" /></template>
          AI 查询药物相互作用
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
          >停止生成</NButton
        >
      </div>

      <div class="ai-response-area">
        <NScrollbar ref="responseBoxRef">
          <div
            v-if="!streamingText && !isGenerating && !streamError"
            class="response-placeholder"
          >
            <span class="iconify text-5xl text-slate-300 ph--intersect" />
            <p class="placeholder-text">
              点击"AI 查询药物相互作用"按钮，智能分析患者用药中的相互作用风险
            </p>
          </div>
          <div
            v-if="isGenerating && !streamingText"
            class="response-loading"
          >
            <NSpin size="medium" />
            <p class="loading-text">AI 正在分析患者用药记录，识别药物相互作用风险...</p>
          </div>
          <div
            v-if="streamingText"
            class="response-content"
          >
            <div class="response-text">
              <template
                v-for="(block, bi) in streamingText.split('\n\n').filter(Boolean)"
                :key="bi"
              >
                <h3
                  v-if="block.startsWith('## ')"
                  class="resp-h3"
                >
                  {{ block.replace('## ', '') }}
                </h3>
                <h4
                  v-else-if="block.startsWith('### ')"
                  class="resp-h4"
                >
                  {{ block.replace('### ', '') }}
                </h4>
                <ul
                  v-else-if="block.includes('\n- ')"
                  class="resp-ul"
                >
                  <li
                    v-for="(line, li) in block.split('\n').filter((l) => l.trim())"
                    :key="li"
                    class="resp-li"
                  >
                    {{ line.replace(/^- /, '').replace(/^\d+\.\s/, '') }}
                  </li>
                </ul>
                <p
                  v-else
                  class="resp-p"
                >
                  {{ block }}
                </p>
              </template>
            </div>
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
              >重试</NButton
            >
          </div>
        </NScrollbar>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
.pagination-box {
  padding-top: 12px;
  display: flex;
  justify-content: center;
  overflow: hidden;
}
:deep(.row-selected td) {
  background: #e8f4fd !important;
  transition: background-color 0.2s ease;
}
:deep(.n-data-table-th) {
  background: #f8fafc !important;
  font-weight: 600;
  color: #334155;
  font-size: 12px;
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
  max-height: 340px;
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
  color: #64748b;
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
  color: #64748b;
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
.response-text {
  font-size: 14px;
  line-height: 1.85;
  color: #1e293b;
}
.resp-h3 {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 20px 0 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e2e8f0;
}
.resp-h4 {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin: 14px 0 6px;
}
.resp-ul {
  padding-left: 20px;
  margin: 6px 0 12px;
}
.resp-li {
  margin-bottom: 4px;
  color: #475569;
}
.resp-p {
  font-size: 14px;
  color: #475569;
}
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
  .medication-item {
    transition: none;
  }
}
</style>
