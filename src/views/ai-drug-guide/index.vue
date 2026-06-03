<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { ScrollContainer, AppChart } from '@/components'
import { useInjection, useSSE } from '@/composables'
import { streamDrugGuideAi } from '@/api/aiDrugGuide'
import { getPatientList, type PatientRecord } from '@/api'
import {
  NCard,
  NDataTable,
  NButton,
  NInput,
  NPagination,
  NScrollbar,
  NSpin,
  NModal,
  NTag,
  useMessage,
  type DataTableColumns,
  type PaginationProps,
  type ScrollbarInst,
} from 'naive-ui'
import { mediaQueryInjectionKey } from '@/injection'

defineOptions({ name: 'AiDrugGuide' })

const { isMaxMd, isMaxLg } = useInjection(mediaQueryInjectionKey)
const message = useMessage()
const { start: startSSE, abort: abortSSE } = useSSE()

// ===================== 患者列表 =====================
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

const columns: DataTableColumns<PatientRecord> = [
  { title: '住院号', key: 'zyh', width: 120 },
  { title: '姓名', key: 'name', width: 80 },
  { title: '性别', key: 'sex', width: 60 },
  { title: '年龄', key: 'age', width: 60 },
]

// ===================== Mock 数据 =====================
interface MedicalHistoryItem {
  title: string
  content: string
}

interface MedicationSummaryItem {
  name: string
  route: string
  dosage: string
}

interface FullMedicationItem {
  id: number
  name: string
  route: string
  dosage: string
  freq: string
  usage: string
  time: string
}

interface GlucoseDataPoint {
  date: string
  fasting: number
  postprandial: number
}

const mockMedicalHistory: MedicalHistoryItem[] = [
  { title: '2型糖尿病', content: '确诊5年，口服降糖药控制，近期血糖波动较大，糖化血红蛋白7.2%' },
  { title: '高血压', content: '确诊3年，口服硝苯地平控制，血压维持在130/85mmHg左右' },
  { title: '高脂血症', content: '确诊2年，口服阿托伐他汀，血脂控制良好' },
  { title: '糖尿病肾病', content: 'I期，微量白蛋白尿，定期复查肾功能' },
]

const mockMedicationSummary: MedicationSummaryItem[] = [
  { name: '二甲双胍片', route: '口服', dosage: '0.5g bid' },
  { name: '格列美脲片', route: '口服', dosage: '2mg qd' },
  { name: '硝苯地平缓释片', route: '口服', dosage: '30mg qd' },
  { name: '阿托伐他汀钙片', route: '口服', dosage: '20mg qn' },
]

const mockFullMedication: FullMedicationItem[] = [
  {
    id: 1,
    name: '二甲双胍片(格华止)',
    route: '口服',
    dosage: '0.5g',
    freq: 'bid',
    usage: 'bid',
    time: '2025-10-22 09:46',
  },
  {
    id: 2,
    name: '格列美脲片(亚莫利)',
    route: '口服',
    dosage: '2mg',
    freq: 'qd',
    usage: 'qd',
    time: '2025-10-22 09:47',
  },
  {
    id: 3,
    name: '硝苯地平缓释片(Ⅰ)',
    route: '口服',
    dosage: '30mg',
    freq: 'qd',
    usage: 'qd',
    time: '2025-10-18 08:30',
  },
  {
    id: 4,
    name: '阿托伐他汀钙片(立普妥)',
    route: '口服',
    dosage: '20mg',
    freq: 'qn',
    usage: 'qn',
    time: '2025-10-20 21:00',
  },
  {
    id: 5,
    name: '缬沙坦胶囊(代文)',
    route: '口服',
    dosage: '80mg',
    freq: 'qd',
    usage: 'qd',
    time: '2025-10-15 08:00',
  },
  {
    id: 6,
    name: '阿卡波糖片(拜糖平)',
    route: '口服',
    dosage: '50mg',
    freq: 'tid',
    usage: 'tid',
    time: '2025-10-22 09:48',
  },
  {
    id: 7,
    name: '胰岛素注射液',
    route: '皮下注射',
    dosage: '10U',
    freq: 'qd',
    usage: 'qd',
    time: '2025-10-21 22:00',
  },
  {
    id: 8,
    name: '阿司匹林肠溶片',
    route: '口服',
    dosage: '100mg',
    freq: 'qd',
    usage: 'qd',
    time: '2025-10-10 08:00',
  },
  {
    id: 9,
    name: '维生素B12片',
    route: '口服',
    dosage: '0.5mg',
    freq: 'qd',
    usage: 'qd',
    time: '2025-10-05 08:00',
  },
  {
    id: 10,
    name: '叶酸片',
    route: '口服',
    dosage: '5mg',
    freq: 'qd',
    usage: 'qd',
    time: '2025-10-05 08:00',
  },
  {
    id: 11,
    name: '碳酸钙D3片',
    route: '口服',
    dosage: '600mg',
    freq: 'qd',
    usage: 'qd',
    time: '2025-10-01 08:00',
  },
  {
    id: 12,
    name: '氯化钾缓释片',
    route: '口服',
    dosage: '0.5g',
    freq: 'tid',
    usage: 'tid',
    time: '2025-10-22 10:00',
  },
]

function generateMockGlucoseData(days = 14): GlucoseDataPoint[] {
  const data: GlucoseDataPoint[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    data.push({
      date: dateStr,
      fasting: +(4.5 + Math.sin(i * 0.45) * 1.3 + Math.random() * 0.5).toFixed(1),
      postprandial: +(7.2 + Math.sin(i * 0.45 + 1.2) * 1.6 + Math.random() * 0.6).toFixed(1),
    })
  }
  return data
}

// ===================== 数据状态 =====================
const mockLoading = ref(false)
const medicalHistory = ref<MedicalHistoryItem[]>([])
const medicationSummary = ref<MedicationSummaryItem[]>([])
const glucoseData = ref<GlucoseDataPoint[]>([])

const medicationDetailPage = ref(1)
const medicationDetailPageSize = 6
const medicationDetailTotal = mockFullMedication.length
const medicationDetailList = computed(() => {
  const start = (medicationDetailPage.value - 1) * medicationDetailPageSize
  return mockFullMedication.slice(start, start + medicationDetailPageSize)
})

// ===================== 弹窗状态 =====================
const showMedicationModal = ref(false)
const showAiModal = ref(false)

// ===================== AI 流式 =====================
const streamingText = ref('')
const isGenerating = ref(false)
const streamError = ref<string | null>(null)
const aiResponseBoxRef = ref<ScrollbarInst | null>(null)
let streamAbortController: AbortController | null = null

function scrollAiToBottom() {
  nextTick(() => {
    aiResponseBoxRef.value?.scrollTo({ top: 999999 })
  })
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

// ===================== 患者选择 =====================
async function handleSelectPatient(row: PatientRecord) {
  selectedPatient.value = row
  resetAIState()
  showAiModal.value = false
  showMedicationModal.value = false
  await loadMockData()
}

async function loadMockData() {
  mockLoading.value = true
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 300))
  medicalHistory.value = mockMedicalHistory
  medicationSummary.value = mockMedicationSummary
  glucoseData.value = generateMockGlucoseData()
  mockLoading.value = false
}

// ===================== AI 查询 =====================
async function handleAiQuery() {
  if (!selectedPatient.value) {
    message.warning('请先在左侧列表中选择一位患者')
    return
  }

  resetAIState()
  showAiModal.value = true
  isGenerating.value = true

  streamAbortController = new AbortController()

  try {
    const res = await streamDrugGuideAi({
      patientId: selectedPatient.value.zyh,
      signal: streamAbortController.signal,
    })

    await startSSE('', {
      response: res,
      onMessage: (text: string) => {
        streamingText.value += text
        scrollAiToBottom()
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '请求失败'
    streamError.value = msg
    message.error('AI用药指导查询失败')
  } finally {
    isGenerating.value = false
    streamAbortController = null
  }
}

function handleAiModalClose() {
  if (isGenerating.value) {
    resetAIState()
  }
}

// ===================== 血糖图表 =====================
const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis' as const,
    formatter: (params: any[]) => {
      let html = `<div style="font-weight:600;margin-bottom:4px">${params[0]?.axisValue}</div>`
      params.forEach((p: any) => {
        html += `<div style="display:flex;align-items:center;gap:6px;padding:2px 0">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
          <span>${p.seriesName}: <b>${p.value} mmol/L</b></span>
        </div>`
      })
      return html
    },
  },
  legend: {
    data: ['空腹血糖', '餐后2h血糖'],
    top: 8,
    textStyle: { fontSize: 12, color: '#64748b' },
  },
  grid: { left: 48, right: 16, top: 40, bottom: 24 },
  xAxis: {
    type: 'category' as const,
    data: glucoseData.value.map((d) => d.date),
    axisLabel: { fontSize: 11, color: '#94a3b8' },
    axisLine: { lineStyle: { color: '#e2e8f0' } },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value' as const,
    name: 'mmol/L',
    min: 2,
    max: 16,
    interval: 2,
    splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' as const } },
    axisLabel: { fontSize: 11, color: '#94a3b8' },
  },
  series: [
    {
      name: '空腹血糖',
      type: 'line' as const,
      data: glucoseData.value.map((d) => d.fasting),
      smooth: true,
      symbol: 'circle' as const,
      symbolSize: 6,
      lineStyle: { color: '#3b82f6', width: 2.5 },
      itemStyle: { color: '#3b82f6' },
      areaStyle: {
        color: {
          type: 'linear' as const,
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(59,130,246,0.2)' },
            { offset: 1, color: 'rgba(59,130,246,0.01)' },
          ],
        },
      },
      markLine: {
        silent: true,
        symbol: 'none' as const,
        data: [
          {
            yAxis: 6.1,
            label: { formatter: '空腹上限 6.1', fontSize: 10 },
            lineStyle: { color: '#ef4444', type: 'dashed' as const, width: 1 },
          },
        ],
      },
    },
    {
      name: '餐后2h血糖',
      type: 'line' as const,
      data: glucoseData.value.map((d) => d.postprandial),
      smooth: true,
      symbol: 'circle' as const,
      symbolSize: 6,
      lineStyle: { color: '#10b981', width: 2.5 },
      itemStyle: { color: '#10b981' },
      areaStyle: {
        color: {
          type: 'linear' as const,
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(16,185,129,0.2)' },
            { offset: 1, color: 'rgba(16,185,129,0.01)' },
          ],
        },
      },
      markLine: {
        silent: true,
        symbol: 'none' as const,
        data: [
          {
            yAxis: 7.8,
            label: { formatter: '餐后上限 7.8', fontSize: 10 },
            lineStyle: { color: '#f59e0b', type: 'dashed' as const, width: 1 },
          },
        ],
      },
    },
  ],
}))

onMounted(() => {
  loadPatients()
})
</script>

<template>
  <ScrollContainer
    wrapper-class="flex flex-col gap-y-4 ai-drug-guide-page"
    :scrollable="isMaxLg"
  >
    <NCard
      class="main-card flex-1"
      :size="isMaxMd ? 'small' : undefined"
      content-class="flex flex-col min-h-0"
    >
      <div class="content-layout">
        <!-- ========== 左侧: 患者列表 ========== -->
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

        <!-- ========== 右侧 ========== -->
        <div class="right-panel">
          <!-- 右侧左列 -->
          <div class="right-left-col">
            <!-- 患者基本信息 -->
            <div class="info-card">
              <div class="info-card-header">
                <span class="iconify ph--user" />
                <span>患者基本信息</span>
              </div>
              <div
                v-if="!selectedPatient"
                class="info-card-placeholder"
              >
                <span class="placeholder-icon iconify ph--user-circle" />
                <p>请选择患者</p>
              </div>
              <div
                v-else
                class="info-card-body"
              >
                <div class="info-row">
                  <span class="info-label">姓名</span>
                  <span class="info-value">{{ selectedPatient.name }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">性别</span>
                  <NTag
                    :type="selectedPatient.sex === '男' ? 'info' : 'error'"
                    size="small"
                    :bordered="false"
                    >{{ selectedPatient.sex }}</NTag
                  >
                </div>
                <div class="info-row">
                  <span class="info-label">年龄</span>
                  <span class="info-value">{{ selectedPatient.age }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">住院号</span>
                  <span class="info-value info-value--mono">{{ selectedPatient.zyh }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">入院日期</span>
                  <span class="info-value">{{ selectedPatient.admissionDate || '-' }}</span>
                </div>
              </div>
            </div>

            <!-- 既往病史 -->
            <div class="info-card">
              <div class="info-card-header">
                <span class="iconify ph--clipboard-text" />
                <span>既往病史</span>
              </div>
              <n-scrollbar style="max-height: 220px">
                <div
                  v-if="!selectedPatient"
                  class="info-card-placeholder"
                >
                  <span class="placeholder-icon iconify ph--clipboard-text" />
                  <p>请选择患者</p>
                </div>
                <div
                  v-else-if="mockLoading"
                  class="info-card-placeholder"
                >
                  <NSpin size="small" />
                  <p>加载病史数据中...</p>
                </div>
                <div
                  v-else
                  class="history-list"
                >
                  <div
                    v-for="(item, i) in medicalHistory"
                    :key="i"
                    class="history-item"
                  >
                    <div class="history-item-title">{{ item.title }}</div>
                    <div class="history-item-content">{{ item.content }}</div>
                  </div>
                </div>
              </n-scrollbar>
            </div>

            <!-- 当前用药 -->
            <div class="info-card info-card--fill">
              <div class="info-card-header">
                <span class="iconify ph--pill" />
                <span>当前用药</span>
                <NButton
                  v-if="selectedPatient && !mockLoading"
                  size="small"
                  type="primary"
                  class="header-ai-btn"
                  @click="handleAiQuery"
                >
                  <template #icon>
                    <span class="iconify ph--robot" />
                  </template>
                  AI 用药指导
                </NButton>
              </div>
              <n-scrollbar>
                <div
                  v-if="!selectedPatient"
                  class="info-card-placeholder"
                >
                  <span class="placeholder-icon iconify ph--pill" />
                  <p>请选择患者</p>
                </div>
                <div
                  v-else-if="mockLoading"
                  class="info-card-placeholder"
                >
                  <NSpin size="small" />
                  <p>加载用药数据中...</p>
                </div>
                <div
                  v-else
                  class="med-summary-list"
                >
                  <div
                    v-for="(item, i) in medicationSummary"
                    :key="i"
                    class="med-summary-item"
                  >
                    <span class="med-summary-name">{{ item.name }}</span>
                    <span class="med-summary-route">{{ item.route }}</span>
                    <span class="med-summary-dosage">{{ item.dosage }}</span>
                  </div>
                  <NButton
                    size="tiny"
                    text
                    type="primary"
                    class="med-detail-btn"
                    @click="showMedicationModal = true"
                  >
                    查看详情
                    <template #icon>
                      <span class="iconify ph--arrow-right" />
                    </template>
                  </NButton>
                </div>
              </n-scrollbar>
            </div>
          </div>

          <!-- 右侧右列 -->
          <div class="right-right-col">
            <!-- 血糖图表 + AI 分析 -->
            <div class="chart-card">
              <div class="chart-card-header">
                <span class="chart-header-icon iconify ph--chart-line-up" />
                <span>血糖变化趋势（近14天）</span>
                <span
                  v-if="glucoseData.length"
                  class="chart-subtitle"
                  >单位: mmol/L</span
                >
              </div>
              <div
                v-if="!selectedPatient"
                class="chart-placeholder"
              >
                <span class="placeholder-icon iconify ph--chart-line-up" />
                <p>选择患者后显示血糖趋势</p>
              </div>
              <div
                v-else-if="mockLoading"
                class="chart-placeholder"
              >
                <NSpin size="medium" />
                <p>加载血糖数据中...</p>
              </div>
              <div
                v-else
                class="chart-wrapper"
              >
                <AppChart
                  :option="chartOption"
                  :autoresize="true"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </NCard>

    <!-- ========== 用药方案详情弹窗 ========== -->
    <NModal
      v-model:show="showMedicationModal"
      preset="card"
      title="完整用药方案"
      style="width: 800px; max-width: 95vw"
      :bordered="false"
      :segmented="{ content: true }"
      :header-style="{ paddingBottom: '8px' }"
    >
      <template #header-extra>
        <span class="modal-header-count">共 {{ medicationDetailTotal }} 条记录</span>
      </template>
      <div class="medication-modal-list">
        <div
          v-for="(item, i) in medicationDetailList"
          :key="item.id"
          class="medication-modal-item"
        >
          <div class="med-modal-row">
            <span class="med-modal-index">{{
              (medicationDetailPage - 1) * medicationDetailPageSize + i + 1
            }}</span>
            <span class="med-modal-name">{{ item.name }}</span>
            <span class="med-modal-route">{{ item.route }}</span>
            <span class="med-modal-time">{{ item.time }}</span>
          </div>
          <div class="med-modal-tags">
            <span
              v-if="item.dosage"
              class="drug-tag drug-tag--dosage"
            >
              <span class="iconify ph--drop-half-bottom" />
              {{ item.dosage }}
            </span>
            <span
              v-if="item.freq"
              class="drug-tag drug-tag--freq"
            >
              <span class="iconify ph--clock" />
              {{ item.freq }}
            </span>
            <span
              v-if="item.usage && item.usage !== item.freq"
              class="drug-tag drug-tag--usage"
            >
              <span class="iconify ph--info" />
              {{ item.usage }}
            </span>
          </div>
        </div>
      </div>
      <div
        v-if="medicationDetailTotal > medicationDetailPageSize"
        class="medication-modal-pagination"
      >
        <NPagination
          v-model:page="medicationDetailPage"
          :page-size="medicationDetailPageSize"
          :page-slot="5"
          :item-count="medicationDetailTotal"
          size="small"
        />
      </div>
    </NModal>

    <!-- ========== AI 用药指导弹窗 ========== -->
    <NModal
      v-model:show="showAiModal"
      preset="card"
      title="AI 用药指导"
      style="width: 1080px; max-width: 95vw"
      :bordered="false"
      :segmented="{ content: true }"
      :header-style="{ paddingBottom: '8px' }"
      @update:show="handleAiModalClose"
    >
      <div class="ai-modal-body">
        <NScrollbar ref="aiResponseBoxRef">
          <div
            v-if="!streamingText && !isGenerating && !streamError"
            class="response-placeholder"
          >
            <span class="response-placeholder-icon iconify ph--robot" />
            <p class="placeholder-text">
              点击下方"AI 用药指导"按钮，智能分析患者血糖趋势、评估用药方案并提供个体化治疗建议
            </p>
            <NButton
              type="primary"
              :loading="isGenerating"
              @click="handleAiQuery"
            >
              <template #icon>
                <span class="iconify ph--robot" />
              </template>
              开始分析
            </NButton>
          </div>

          <div
            v-if="isGenerating && !streamingText"
            class="response-loading"
          >
            <NSpin size="medium" />
            <p class="loading-text">AI 正在分析患者血糖数据和用药方案，生成个体化指导建议...</p>
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
              @click="handleAiQuery"
            >
              重试
            </NButton>
          </div>
        </NScrollbar>
      </div>
    </NModal>
  </ScrollContainer>
</template>

<style lang="scss" scoped>
.ai-drug-guide-page {
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

// ===================== 三栏布局 =====================
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
  letter-spacing: 0.02em;
}

:deep(.n-data-table-td) {
  font-size: 13px;
  color: #475569;
}

:deep(.n-data-table-tr:hover td) {
  background: #f0f9ff !important;
}

// ===================== 右侧面板 =====================
.right-panel {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  gap: 20px;
  overflow: hidden;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
}

.right-left-col {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.right-right-col {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// ===================== 信息卡片 (共用) =====================
.info-card {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.info-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #e8ecf1;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  background: #fafbfc;
  border-radius: 10px 10px 0 0;

  .iconify {
    font-size: 16px;
    color: #409eff;
  }
}

.info-card-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 6px;
  color: #64748b;
  font-size: 13px;
}

.placeholder-icon {
  font-size: 28px;
  color: #cbd5e1;
}

.info-card-body {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.info-label {
  color: #94a3b8;
  min-width: 52px;
  flex-shrink: 0;
}

.info-value {
  color: #1e293b;
  font-weight: 500;

  &--mono {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 12px;
    color: #475569;
  }
}

// ===================== 既往病史 =====================
.history-list {
  padding: 8px 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  /* max-height: 200px; */
  overflow-y: auto;
}

.history-item {
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #f1f5f9;
}

.history-item-title {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 2px;
}

.history-item-content {
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
}

// ===================== 当前用药摘要 =====================
.med-summary-list {
  padding: 8px 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.med-summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #f1f5f9;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: #b9d9ff;
  }
}

.med-summary-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.med-summary-route {
  font-size: 11px;
  font-weight: 500;
  color: #2563eb;
  padding: 1px 6px;
  background: #dbeafe;
  border-radius: 3px;
  white-space: nowrap;
}

.med-summary-dosage {
  margin-left: auto;
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
}

.med-detail-btn {
  align-self: flex-end;
  margin-top: 4px;
}

// ===================== 血糖图表卡片 =====================
.chart-card {
  flex: 1;
  min-height: 300px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chart-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #e8ecf1;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  background: #fafbfc;
  flex-shrink: 0;
}

.chart-header-icon {
  font-size: 16px;
  color: #409eff;
}

.chart-subtitle {
  margin-left: auto;
  font-size: 11px;
  font-weight: 400;
  color: #94a3b8;
}

.chart-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #64748b;
  font-size: 13px;

  .placeholder-icon {
    font-size: 40px;
    color: #cbd5e1;
  }
}

.chart-wrapper {
  flex: 1;
  min-height: 0;
  padding: 8px 8px 4px 0;
}

// ===================== 卡片填充 & AI 按钮 =====================
.info-card--fill {
  flex: 1;
  min-height: 0;
  &:deep(.n-scrollbar-content) {
    height: 100%;
  }
  &:deep(.info-card-placeholder) {
    height: 100%;
  }
}

.header-ai-btn {
  margin-left: auto;
  flex-shrink: 0;
  .iconify {
    color: #ededed;
  }
}

// ===================== 用药详情弹窗 =====================
.modal-header-count {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 400;
}

.medication-modal-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 55vh;
  overflow-y: auto;
}

.medication-modal-item {
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: #b9d9ff;
  }
}

.med-modal-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.med-modal-index {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  min-width: 20px;
  text-align: center;
}

.med-modal-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
  min-width: 0;
}

.med-modal-route {
  font-size: 12px;
  font-weight: 500;
  color: #2563eb;
  padding: 2px 8px;
  background: #dbeafe;
  border-radius: 4px;
  white-space: nowrap;
}

.med-modal-time {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  margin-left: auto;
}

.med-modal-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding-left: 28px;
}

.drug-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 3px;
  line-height: 1.4;

  .iconify {
    font-size: 12px;
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

.medication-modal-pagination {
  display: flex;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  margin-top: 12px;
}

// ===================== AI 弹窗 =====================
.ai-modal-body {
  height: 60vh;
  overflow: hidden;
}

.response-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
  gap: 16px;
  height: 100%;
}

.response-placeholder-icon {
  font-size: 48px;
  color: #cbd5e1;
}

.placeholder-text {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  max-width: 460px;
}

.response-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  gap: 16px;
  height: 100%;
}

.loading-text {
  font-size: 14px;
  color: #64748b;
}

.response-content {
  padding: 20px 24px;
  animation: fade-in 0.3s ease;
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
  padding: 64px 24px;
  text-align: center;
  color: #ef4444;
  gap: 8px;
  height: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .response-content {
    animation: none;
  }
}
</style>
