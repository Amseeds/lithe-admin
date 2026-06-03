<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { ScrollContainer, AppChart } from '@/components'
import { useInjection } from '@/composables'
import { getPatientList, type PatientRecord } from '@/api'
import {
  NCard,
  NDataTable,
  NButton,
  NInput,
  NPagination,
  NScrollbar,
  NSpin,
  NAlert,
  NTag,
  type DataTableColumns,
  type PaginationProps,
} from 'naive-ui'
import { mediaQueryInjectionKey } from '@/injection'

defineOptions({ name: 'GlucoseVisitReminder' })

const { isMaxMd, isMaxLg } = useInjection(mediaQueryInjectionKey)

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

function handleSelectPatient(row: PatientRecord) { selectedPatient.value = row }

const columns: DataTableColumns<PatientRecord> = [
  { title: '住院号', key: 'zyh', width: 120 },
  { title: '姓名', key: 'name', width: 80 },
  { title: '性别', key: 'sex', width: 60 },
  { title: '年龄', key: 'age', width: 60 },
]

// ===================== Mock 血糖数据 =====================
interface GlucoseRecord {
  id: number
  time: string
  period: string
  value: number
  unit: string
  standard: number
}

interface ChartPoint {
  date: string
  fasting: number | null
  postBreakfast: number | null
  postLunch: number | null
  postDinner: number | null
}

const glucoseRecords: GlucoseRecord[] = [
  { id: 1, time: '06-02 07:30', period: '空腹', value: 5.8, unit: 'mmol/L', standard: 5.5 },
  { id: 2, time: '06-02 09:30', period: '早餐后2h', value: 8.6, unit: 'mmol/L', standard: 7.8 },
  { id: 3, time: '06-02 12:30', period: '午餐后2h', value: 7.2, unit: 'mmol/L', standard: 7.8 },
  { id: 4, time: '06-02 18:30', period: '晚餐后2h', value: 9.1, unit: 'mmol/L', standard: 7.8 },
  { id: 5, time: '06-01 07:30', period: '空腹', value: 5.5, unit: 'mmol/L', standard: 5.5 },
  { id: 6, time: '06-01 09:30', period: '早餐后2h', value: 7.8, unit: 'mmol/L', standard: 7.8 },
  { id: 7, time: '06-01 12:30', period: '午餐后2h', value: 6.9, unit: 'mmol/L', standard: 7.8 },
  { id: 8, time: '06-01 18:30', period: '晚餐后2h', value: 8.3, unit: 'mmol/L', standard: 7.8 },
  { id: 9, time: '05-31 07:30', period: '空腹', value: 6.1, unit: 'mmol/L', standard: 5.5 },
  { id: 10, time: '05-31 09:30', period: '早餐后2h', value: 9.2, unit: 'mmol/L', standard: 7.8 },
  { id: 11, time: '05-31 12:30', period: '午餐后2h', value: 7.5, unit: 'mmol/L', standard: 7.8 },
  { id: 12, time: '05-31 18:30', period: '晚餐后2h', value: 8.8, unit: 'mmol/L', standard: 7.8 },
  { id: 13, time: '05-30 07:30', period: '空腹', value: 5.2, unit: 'mmol/L', standard: 5.5 },
  { id: 14, time: '05-30 09:30', period: '早餐后2h', value: 7.1, unit: 'mmol/L', standard: 7.8 },
  { id: 15, time: '05-30 12:30', period: '午餐后2h', value: 6.5, unit: 'mmol/L', standard: 7.8 },
  { id: 16, time: '05-30 18:30', period: '晚餐后2h', value: 7.9, unit: 'mmol/L', standard: 7.8 },
  { id: 17, time: '05-29 07:30', period: '空腹', value: 5.9, unit: 'mmol/L', standard: 5.5 },
  { id: 18, time: '05-29 09:30', period: '早餐后2h', value: 8.4, unit: 'mmol/L', standard: 7.8 },
  { id: 19, time: '05-29 12:30', period: '午餐后2h', value: 7.0, unit: 'mmol/L', standard: 7.8 },
  { id: 20, time: '05-29 18:30', period: '晚餐后2h', value: 8.6, unit: 'mmol/L', standard: 7.8 },
  { id: 21, time: '05-28 07:30', period: '空腹', value: 5.6, unit: 'mmol/L', standard: 5.5 },
  { id: 22, time: '05-28 09:30', period: '早餐后2h', value: 7.6, unit: 'mmol/L', standard: 7.8 },
  { id: 23, time: '05-28 12:30', period: '午餐后2h', value: 6.8, unit: 'mmol/L', standard: 7.8 },
  { id: 24, time: '05-28 18:30', period: '晚餐后2h', value: 8.1, unit: 'mmol/L', standard: 7.8 },
  { id: 25, time: '05-27 07:30', period: '空腹', value: 5.4, unit: 'mmol/L', standard: 5.5 },
  { id: 26, time: '05-27 09:30', period: '早餐后2h', value: 7.2, unit: 'mmol/L', standard: 7.8 },
  { id: 27, time: '05-27 12:30', period: '午餐后2h', value: 6.3, unit: 'mmol/L', standard: 7.8 },
  { id: 28, time: '05-27 18:30', period: '晚餐后2h', value: 7.5, unit: 'mmol/L', standard: 7.8 },
]

const latestRecord = computed(() => glucoseRecords[0])
const latestStatus = computed(() => {
  const v = latestRecord.value.value
  const s = latestRecord.value.standard
  if (v > s * 1.1) return { text: '偏高', type: 'error' as const, color: '#ef4444' }
  if (v < s * 0.9) return { text: '偏低', type: 'warning' as const, color: '#f59e0b' }
  return { text: '正常', type: 'success' as const, color: '#10b981' }
})

const tableLoading = ref(false)

// 表格分页
const tablePage = ref(1)
const tablePageSize = 5
const pagedRecords = computed(() => {
  const start = (tablePage.value - 1) * tablePageSize
  return glucoseRecords.slice(start, start + tablePageSize)
})

function diffRate(value: number, standard: number): string {
  return ((value - standard) / standard * 100).toFixed(1) + '%'
}

function diffRateColor(value: number, standard: number): string {
  const diff = (value - standard) / standard * 100
  if (diff > 5) return '#ef4444'   // 偏高: 红色
  if (diff < -5) return '#f59e0b'  // 偏低: 橙色
  return '#10b981'                 // 正常: 绿色
}

const recordColumns: DataTableColumns<GlucoseRecord> = [
  { title: '序号', key: 'id', width: 60, align: 'center' },
  { title: '监测时间', key: 'time', width: 140 },
  {
    title: '血糖',
    key: 'value',
    width: 100,
    render(row) { return `${row.value} ${row.unit}` },
  },
  {
    title: '标准值',
    key: 'standard',
    width: 100,
    render(row) { return `${row.standard} ${row.unit}` },
  },
  {
    title: '标准偏差率',
    key: 'diff',
    width: 100,
    render(row) {
      const d = diffRate(row.value, row.standard)
      const c = diffRateColor(row.value, row.standard)
      return h('span', { style: { color: c, fontWeight: 600 } }, d)
    },
  },
]

// ===================== 图表 =====================
const chartData = computed<ChartPoint[]>(() => {
  const map = new Map<string, Partial<ChartPoint>>()
  glucoseRecords.forEach((r) => {
    const date = r.time.split(' ')[0]
    if (!map.has(date)) map.set(date, { date })
    const entry = map.get(date)!
    if (r.period === '空腹') entry.fasting = r.value
    else if (r.period === '早餐后2h') entry.postBreakfast = r.value
    else if (r.period === '午餐后2h') entry.postLunch = r.value
    else if (r.period === '晚餐后2h') entry.postDinner = r.value
  })
  return Array.from(map.values()).reverse() as ChartPoint[]
})

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis' as const,
    valueFormatter: (value: unknown) => `${value} mmol/L`,
  },
  legend: {
    data: ['空腹', '早餐后2h', '午餐后2h', '晚餐后2h'],
    top: 0,
    textStyle: { fontSize: 11, color: '#64748b' },
  },
  grid: { left: 48, right: 16, top: 36, bottom: 20 },
  xAxis: {
    type: 'category' as const,
    data: chartData.value.map((d) => d.date),
    axisLabel: { fontSize: 11, color: '#94a3b8' },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value' as const,
    name: 'mmol/L',
    min: 3,
    max: 12,
    interval: 1,
    splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' as const } },
  },
  series: [
    {
      name: '空腹', type: 'line' as const, data: chartData.value.map((d) => d.fasting),
      smooth: true, symbolSize: 5, lineStyle: { color: '#3b82f6', width: 2 },
      itemStyle: { color: '#3b82f6' },
    },
    {
      name: '早餐后2h', type: 'line' as const, data: chartData.value.map((d) => d.postBreakfast),
      smooth: true, symbolSize: 5, lineStyle: { color: '#10b981', width: 2 },
      itemStyle: { color: '#10b981' },
    },
    {
      name: '午餐后2h', type: 'line' as const, data: chartData.value.map((d) => d.postLunch),
      smooth: true, symbolSize: 5, lineStyle: { color: '#f59e0b', width: 2 },
      itemStyle: { color: '#f59e0b' },
    },
    {
      name: '晚餐后2h', type: 'line' as const, data: chartData.value.map((d) => d.postDinner),
      smooth: true, symbolSize: 5, lineStyle: { color: '#8b5cf6', width: 2 },
      itemStyle: { color: '#8b5cf6' },
    },
  ],
}))

onMounted(() => { loadPatients() })
</script>

<template>
  <ScrollContainer
    wrapper-class="flex flex-col gap-y-4 glucose-visit-page"
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
          <NAlert
            v-if="selectedPatient"
            type="warning"
            :bordered="false"
            class="glucose-alert"
          >
            <template #header>血糖预警提醒</template>
            患者近期血糖波动较大，餐后血糖多次超出正常范围，建议关注并定期监测，必要时联系医生调整用药方案。
          </NAlert>

          <div
            v-if="!selectedPatient"
            class="right-placeholder"
          >
            <span class="iconify placeholder-icon ph--drop-half-bottom" />
            <p class="placeholder-text">选择患者后查看血糖监测数据</p>
          </div>

          <template v-else>
            <div class="middle-row">
              <div class="chart-area">
                <div class="section-title">
                  <span class="iconify ph--chart-line-up title-icon" />
                  <span>血糖趋势（近7天）</span>
                </div>
                <AppChart
                  :option="chartOption"
                  :autoresize="true"
                  class="trend-chart"
                />
              </div>

              <div class="latest-card">
                <div class="latest-header">最近一次监测</div>
                <div class="latest-value">
                  <span class="latest-number" :style="{ color: latestStatus.color }">{{ latestRecord.value }}</span>
                  <span class="latest-unit">mmol/L</span>
                </div>
                <NTag
                  :type="latestStatus.type"
                  size="small"
                  :bordered="false"
                >{{ latestStatus.text }}</NTag>
                <div class="latest-meta">
                  <span>{{ latestRecord.time }}</span>
                  <span class="meta-divider">|</span>
                  <span>{{ latestRecord.period }}</span>
                </div>
                <div class="latest-standard">
                  标准值: {{ latestRecord.standard }} mmol/L
                </div>
              </div>
            </div>

            <div class="table-section">
              <div class="section-title">
                <span class="iconify ph--table title-icon" />
                <span>近期血糖监测记录</span>
              </div>
              <NScrollbar class="table-scrollbar">
                <NDataTable
                  :columns="recordColumns"
                  :data="pagedRecords"
                  :loading="tableLoading"
                  size="small"
                  :bordered="false"
                  :max-height="9999"
                  class="glucose-table"
                />
              </NScrollbar>
              <div
                v-if="glucoseRecords.length > tablePageSize"
                class="table-pagination"
              >
                <NPagination
                  v-model:page="tablePage"
                  :page-size="tablePageSize"
                  :page-slot="5"
                  :item-count="glucoseRecords.length"
                  size="small"
                />
              </div>
            </div>
          </template>
        </div>
      </div>
    </NCard>
  </ScrollContainer>
</template>

<style lang="scss" scoped>
.glucose-visit-page { padding: 20px 24px; background: linear-gradient(160deg, #f0f4f8 0%, #f5f7fa 100%); @media (max-width: 768px) { padding: 12px 8px; } }
.main-card { display: flex; flex-direction: column; min-height: 0; background: #ffffff; border-radius: 14px; overflow: visible; box-shadow: 0 2px 12px rgba(64,158,255,0.06), 0 1px 3px rgba(0,0,0,0.04); border: 1px solid rgba(64,158,255,0.06); :deep(.n-card__content) { flex: 1; min-height: 0; overflow: hidden; } }
.content-layout { flex: 1; display: flex; gap: 20px; min-height: 0; overflow: hidden; @media (max-width: 1024px) { flex-direction: column; } }

// 左侧
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

// 右侧
.right-panel { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; gap: 14px; overflow: hidden; }

.right-placeholder { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #64748b; }
.placeholder-icon { font-size: 48px; color: #cbd5e1; }
.placeholder-text { font-size: 14px; }

.glucose-alert { border-radius: 8px; flex-shrink: 0; }

// 中间行: 图表 + 最近值
.middle-row { display: flex; gap: 16px; height: 350px; flex-shrink: 0; @media (max-width: 768px) { flex-direction: column; height: auto; min-height: 350px; } }

.chart-area { flex: 1; min-width: 0; border: 1px solid #e2e8f0; border-radius: 10px; background: #ffffff; display: flex; flex-direction: column; overflow: hidden; }
.section-title { display: flex; align-items: center; gap: 6px; padding: 12px 16px; font-size: 13px; font-weight: 600; color: #334155; border-bottom: 1px solid #f1f5f9; flex-shrink: 0; }
.title-icon { font-size: 16px; color: #409eff; }
.trend-chart { flex: 1; min-height: 300px; }

// 最近值卡片
.latest-card { width: 220px; flex-shrink: 0; border: 1px solid #e2e8f0; border-radius: 10px; background: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 28px 20px; @media (max-width: 768px) { width: 100%; flex-direction: row; flex-wrap: wrap; gap: 12px; } }
.latest-header { font-size: 12px; color: #94a3b8; }
.latest-value { display: flex; align-items: baseline; gap: 4px; }
.latest-number { font-size: 42px; font-weight: 700; line-height: 1; }
.latest-unit { font-size: 14px; color: #64748b; }
.latest-meta { font-size: 12px; color: #94a3b8; display: flex; gap: 6px; }
.meta-divider { color: #e2e8f0; }
.latest-standard { font-size: 11px; color: #94a3b8; }

// 底部表格
.table-section { border: 1px solid #e2e8f0; border-radius: 10px; background: #ffffff; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
.table-scrollbar { max-height: 350px; }
.table-pagination { padding: 10px 16px; display: flex; justify-content: center; border-top: 1px solid #f1f5f9; }

.glucose-table {
  :deep(.n-data-table-td) { padding: 8px 12px; }
}
</style>
