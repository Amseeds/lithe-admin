<script setup lang="ts">
import dayjs from 'dayjs'
import { ref, computed, onMounted, watch, nextTick, h, reactive } from 'vue'
import { ScrollContainer } from '@/components'
import type { ECharts } from 'echarts'
import {
  NCard,
  NTabs,
  NTabPane,
  NDataTable,
  NModal,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NGrid,
  NGi,
  NSelect,
  NInput,
  NButton,
  NTooltip,
  NTimeline,
  NTimelineItem,
  NDatePicker,
  NPagination,
  NEmpty,
  type DataTableColumns,
  type PaginationProps,
} from 'naive-ui'
import * as echarts from 'echarts'
import { getPatientList, type PatientRecord, type PatientQueryParams } from '@/api/patientRecords'
import {
  complicationTrendChart,
  complicationProgressTop20,
  highRiskProgressPatients,
} from './mock/tab1'
import {
  pancreaticFunctionCards,
  cPeptideTrendChart,
  pancreaticFunctionPatients,
} from './mock/tab2'
import {
  microvascularCards,
  macrovascularCards,
  microvascularStageDistribution,
  macrovascularStageDistribution,
  microvascularProgressPatients,
  macrovascularProgressPatients,
} from './mock/tab3'
import { generatePatientProgressDetail } from './mock/tab4'
import type { Patient, PatientProgressDetail } from './mock/types'
import {
  getDiseaseProgressionDetail,
  getDiseaseProgressionOverview,
} from '@/api/diseaseProgression'

defineOptions({
  name: 'DiseaseProgression',
})

// 筛选条件
const range = ref<[number, number]>([
  dayjs().subtract(1, 'day').startOf('day').valueOf(),
  dayjs().endOf('day').valueOf(),
])
const patientStratification = ref<string[]>([])
const complicationType = ref<string[]>([])
const searchText = ref('')

const timeRangeOptions = [
  { label: '近1个月', value: '近1个月' },
  { label: '近3个月', value: '近3个月' },
  { label: '近6个月', value: '近6个月' },
  { label: '近1年', value: '近1年' },
]
const patientStratificationOptions = [
  { label: '年轻低危', value: '年轻低危' },
  { label: '老年衰弱', value: '老年衰弱' },
  { label: '肾功能不全', value: '肾功能不全' },
  { label: '妊娠期', value: '妊娠期' },
  { label: '手术期', value: '手术期' },
  { label: '心血管高危', value: '心血管高危' },
]
const complicationTypeOptions = [
  { label: '无并发症', value: '无并发症' },
  { label: '微血管并发症', value: '微血管并发症' },
  { label: '大血管并发症', value: '大血管并发症' },
  { label: '多并发症合并', value: '多并发症合并' },
]

// Tab状态
const activeTab = ref('tab1')
const activeTab3Sub = ref('microvascular')

// 弹窗状态
const showPatientDetail = ref(false)
const currentPatientDetail = ref<PatientProgressDetail | null>(null)

// 患者列表数据 - Tab4
const patientList = ref<PatientRecord[]>([])
const patientListLoading = ref(false)
const patientQueryParams = reactive<PatientQueryParams>({
  zyh: '',
  name: '',
  pageNum: 1,
  pageSize: 10,
})
const patientPagination = reactive<PaginationProps>({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 15, 20],
  showQuickJumper: true,
  onUpdatePage: (page: number) => {
    patientPagination.page = page
    patientQueryParams.pageNum = page
    getPatientListData()
  },
  onUpdatePageSize: (pageSize: number) => {
    patientPagination.pageSize = pageSize
    patientPagination.page = 1
    patientQueryParams.pageSize = pageSize
    patientQueryParams.pageNum = 1
    getPatientListData()
  },
})

const getPatientListData = async () => {
  patientListLoading.value = true
  try {
    const { data } = await getPatientList(patientQueryParams)
    patientList.value = data.list || []
    patientPagination.itemCount = data.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    patientListLoading.value = false
  }
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return dateStr
  }
}

// 表格列 - Tab1 并发症进展TOP20
const top20Columns: DataTableColumns = [
  { title: '就诊编号', key: 'visitnumber', width: 90, ellipsis: { tooltip: true } },
  { title: '患者ID', key: 'patientid', width: 80, ellipsis: { tooltip: true } },
  // { title: '患者姓名', key: 'patientname', width: 70, ellipsis: { tooltip: true } },
  { title: '性别', key: 'sex', width: 50 },
  { title: '入院科室', key: 'admissiondept', width: 90, ellipsis: { tooltip: true } },
  { title: '住院天数', key: 'los', width: 60 },
  { title: '入院日期', key: 'admissiondate', width: 90 },
]

// 表格列 - Tab1 高进展风险
const highRiskColumns = [
  { title: '患者姓名', key: 'name', width: 80 },
  { title: '病历号', key: 'medicalRecordNo', width: 110 },
  { title: '年龄', key: 'age', width: 50 },
  { title: '所属分层', key: 'category', width: 100 },
  { title: '并发症类型', key: 'complicationType', width: 130 },
  { title: '进展情况', key: 'progressStatus', width: 100 },
  { title: '发现日期', key: 'discoveryDate', width: 100 },
]

// 表格列 - Tab2 胰岛功能明细
const pancreaticColumns = [
  { title: '患者姓名', key: 'name', width: 100 },
  { title: '病历号', key: 'medicalRecordNo', width: 120 },
  { title: '年龄', key: 'age', width: 60 },
  { title: '所属分层', key: 'category', width: 120 },
  { title: '胰岛功能分级', key: 'pancreaticLevel', width: 120 },
  { title: '基线C肽', key: 'baselineCPeptide', width: 100 },
  { title: '最近C肽', key: 'latestCPeptide', width: 100 },
  { title: '下降幅度', key: 'declineRate', width: 100 },
  { title: '检测日期', key: 'testDate', width: 120 },
]

// 表格列 - Tab3 并发症明细
const complicationDetailColumns = [
  { title: '患者姓名', key: 'name', width: 100 },
  { title: '病历号', key: 'medicalRecordNo', width: 120 },
  { title: '年龄', key: 'age', width: 60 },
  { title: '所属分层', key: 'category', width: 120 },
  { title: '并发症名称', key: 'complicationName', width: 140 },
  { title: '当前分期', key: 'currentStage', width: 100 },
  { title: '较上次变化', key: 'changeFromLast', width: 140 },
  { title: '最近检查日期', key: 'lastCheckDate', width: 120 },
]

// 表格列 - Tab4 患者列表
const patientListColumns: DataTableColumns<PatientRecord> = [
  {
    title: '住院号',
    key: 'zyh',
    width: 140,
  },
  {
    title: '姓名',
    key: 'name',
    width: 100,
  },
  {
    title: '性别',
    key: 'sex',
    width: 80,
  },
  {
    title: '年龄',
    key: 'age',
    width: 80,
  },
  {
    title: '入院时间',
    key: 'admissionDate',
    width: 180,
    render: (row) => formatDateTime(row.admissionDate),
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render: (row) =>
      h('div', { class: 'flex gap-2' }, [
        h(
          NButton,
          {
            type: 'primary',
            size: 'small',
            text: true,
            onClick: () => handleViewPatientDetail(row),
          },
          { default: () => '查看详情' },
        ),
      ]),
  },
]

// 表格列 - 弹窗检查对比
const examResultColumns = [
  // { title: '检查项目', key: 'examItem', width: 160 },
  // { title: '检查日期', key: 'examDate', width: 120 },
  // { title: '本次结果', key: 'currentResult', width: 180 },
  // { title: '上次结果', key: 'previousResult', width: 140 },
  // { title: '变化趋势', key: 'changeTrend', width: 100 },
  // { title: '异常等级', key: 'abnormityLevel', width: 120 },
  { title: '检查项目', key: 'testSubitemChineseName', width: 160 },
  // { title: '检查日期', key: 'examDate', width: 120 },
  { title: '本次结果', key: 'newValue', width: 120 },
  { title: '上次结果', key: 'oldValue', width: 120 },
  { title: '变化趋势', key: 'treatmentStatus', width: 100 },
  { title: '异常等级', key: 'treatmentEffect', width: 120 },
]

// 表格列 - 弹窗随访记录
const followUpColumns = [
  { title: '随访日期', key: 'followUpDate', width: 120 },
  { title: '随访医生', key: 'followUpDoctor', width: 100 },
  { title: '进展评估结论', key: 'progressConclusion', width: 250 },
  { title: '治疗调整建议', key: 'treatmentAdvice', width: 250 },
]

// 图表实例
let pieChart: ECharts | null = null
let trendLineChart: ECharts | null = null
let cPeptideChart: ECharts | null = null
let stageBarChart: ECharts | null = null
let detailCPeptideChart: ECharts | null = null

// 图表DOM refs
const pieChartRef = ref<HTMLElement | null>(null)
const trendLineChartRef = ref<HTMLElement | null>(null)
const cPeptideChartRef = ref<HTMLElement | null>(null)
const stageBarChartRef = ref<HTMLElement | null>(null)
const detailCPeptideRef = ref<HTMLElement | null>(null)

// Tab3当前数据
const currentTab3Cards = computed(() =>
  activeTab3Sub.value === 'microvascular' ? microvascularCards : macrovascularCards,
)
const currentTab3Distribution = computed(() =>
  activeTab3Sub.value === 'microvascular'
    ? microvascularStageDistribution
    : macrovascularStageDistribution,
)
const currentTab3Patients = computed(() =>
  activeTab3Sub.value === 'microvascular'
    ? microvascularProgressPatients
    : macrovascularProgressPatients,
)

// 卡片颜色样式
function getComplicationCardClass(index: number): string {
  return (
    ['type-none', 'type-micro', 'type-macro', 'type-multi', 'type-pancreas', 'type-highrisk'][
      index
    ] || ''
  )
}

function getSafetyCardClass(index: number): string {
  return ['type-adverse', 'type-liver', 'type-compliance', 'type-risk'][index] || ''
}

function getTimelineType(type: string): 'success' | 'warning' | 'info' {
  if (type === 'stable') return 'info'
  if (type === 'progress') return 'warning'
  return 'success'
}

const getCPeptideClass = (value: string | number | null | undefined) => {
  if (!value && value !== 0) return 'text-gray-400'
  const num = parseFloat(String(value))
  if (isNaN(num)) return 'text-gray-400'
  if (num >= 1.0) return 'text-green-600 font-medium'
  if (num >= 0.5) return 'text-cyan-600 font-medium'
  if (num >= 0.2) return 'text-orange-500 font-medium'
  return 'text-red-600 font-medium'
}

const overviewData = ref(null) as any
const loading = ref(false)

const getOverviewData = async (val?: [string, string]) => {
  const params: { startDate?: string; endDate?: string } = {}
  console.log(val, 'val==========')
  if (val) {
    params.startDate = dayjs(range.value[0]).format('YYYY-MM-DD')
    params.endDate = dayjs(range.value[1]).format('YYYY-MM-DD')
  } else {
    params.startDate = dayjs(range.value[0]).format('YYYY-MM-DD')
    params.endDate = dayjs(range.value[1]).format('YYYY-MM-DD')
  }
  loading.value = true
  overviewData.value = await getDiseaseProgressionOverview(params)
  loading.value = false
  if (activeTab.value === 'tab1') {
    pieChart = null
    initTab1Charts()
    if (pieChart && complicationDistributionData.value.length > 0) {
      pieChart.hideLoading()
      pieChart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
        legend: { bottom: 0 },
        series: [
          {
            type: 'pie',
            radius: ['35%', '65%'],
            center: ['50%', '45%'],
            data: complicationDistributionData.value,
            label: { formatter: '{b}\n{d}%' },
            emphasis: {
              itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.3)' },
            },
          },
        ],
      })
    } else if (pieChart) {
      pieChart.hideLoading()
    }
  }
}

const complicationCards = computed(() => {
  if (!overviewData.value?.data?.complicationStatCardVOList) return []
  return overviewData.value.data.complicationStatCardVOList
})

const complicationDistributionData = computed(() => {
  if (!overviewData.value?.data?.complicationStatCardVOList) return []
  return overviewData.value.data.complicationStatCardVOList
    .filter((item: { count: number }) => item.count > 0)
    .map((item: { name: string; count: number }) => ({
      name: item.name,
      value: item.count,
    }))
})

const top20PatientList = computed(() => {
  if (!overviewData.value?.data?.top20PatientList) return []
  return overviewData.value.data.top20PatientList.map((item: any) => ({
    ...item,
    admissiondate: item.admissiondate?.split(' ')[0] || '-',
    dischargedate: item.dischargedate?.split(' ')[0] || '-',
  }))
})

// 初始化图表
function initCharts() {
  if (activeTab.value === 'tab1') initTab1Charts()
  else if (activeTab.value === 'tab2') initTab2Charts()
  else if (activeTab.value === 'tab3') initTab3Charts()
}

function initTab1Charts() {
  if (pieChartRef.value) {
    if (pieChart) {
      pieChart.dispose()
      pieChart = null
    }
    pieChart = echarts.init(pieChartRef.value)
    pieChart.showLoading()
  }
  if (trendLineChartRef.value) {
    if (trendLineChart) {
      trendLineChart.dispose()
      trendLineChart = null
    }
    trendLineChart = echarts.init(trendLineChartRef.value)
    trendLineChart.showLoading()
  }
}

function initTab2Charts() {
  if (cPeptideChartRef.value && !cPeptideChart) {
    cPeptideChart = echarts.init(cPeptideChartRef.value)
    cPeptideChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: cPeptideTrendChart.series.map((s) => s.name) },
      xAxis: { type: 'category', data: cPeptideTrendChart.xAxis, axisLabel: { rotate: 30 } },
      yAxis: { type: 'value', name: 'C肽 (ng/mL)' },
      series: [
        {
          name: '全院平均C肽',
          type: 'line',
          data: cPeptideTrendChart.series[0].data,
          smooth: true,
          itemStyle: { color: '#5470C6' },
        },
        {
          name: '正常参考下限',
          type: 'line',
          data: cPeptideTrendChart.series[1].data,
          lineStyle: { type: 'dashed' },
          itemStyle: { color: '#91CC75' },
        },
      ],
    })
  }
}

function initTab3Charts() {
  if (stageBarChartRef.value && !stageBarChart) {
    stageBarChart = echarts.init(stageBarChartRef.value)
    const dist = currentTab3Distribution.value
    stageBarChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['early', 'mid', 'late'] },
      xAxis: {
        type: 'category',
        data: dist.map((d) => d.complicationName),
        axisLabel: { interval: 0 },
      },
      yAxis: { type: 'value', name: '人数' },
      series: [
        {
          name: 'early',
          type: 'bar',
          stack: 'total',
          data: dist.map((d) => d.early),
          itemStyle: { color: '#91CC75' },
        },
        {
          name: 'mid',
          type: 'bar',
          stack: 'total',
          data: dist.map((d) => d.mid),
          itemStyle: { color: '#FAC858' },
        },
        {
          name: 'late',
          type: 'bar',
          stack: 'total',
          data: dist.map((d) => d.late),
          itemStyle: { color: '#EE6666' },
        },
      ],
    })
  }
}

function initDetailCharts() {
  if (!currentPatientDetail.value) return
  if (currentPatientDetail.value && detailCPeptideRef.value) {
    const trend = currentPatientDetail.value.cPeptideTrend
    if (!trend) {
      if (detailCPeptideChart) {
        detailCPeptideChart.dispose()
        detailCPeptideChart = null
      }
      return
    }
    if (!detailCPeptideChart) {
      detailCPeptideChart = echarts.init(detailCPeptideRef.value)
    }
    detailCPeptideChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['C肽检测值', '基线水平'] },
      xAxis: { type: 'category', data: trend.months },
      yAxis: { type: 'value', name: 'C肽 (ng/mL)' },
      series: [
        {
          name: 'C肽检测值',
          type: 'line',
          data: trend.values,
          smooth: true,
          itemStyle: { color: '#5470C6' },
          label: { show: true, formatter: '{c}' },
        },
        {
          name: '基线水平',
          type: 'line',
          data: trend.months.map(() => trend.baseline.toString()),
          lineStyle: { type: 'dashed' },
          itemStyle: { color: '#91CC75' },
        },
      ],
    })
  }
}

// Tab切换时重置图表
watch(activeTab, async () => {
  await nextTick()
  pieChart?.dispose()
  pieChart = null
  trendLineChart?.dispose()
  trendLineChart = null
  cPeptideChart?.dispose()
  cPeptideChart = null
  stageBarChart?.dispose()
  stageBarChart = null
  initCharts()
  if (activeTab.value === 'tab4') {
    getPatientListData()
  }
})

watch(activeTab3Sub, async () => {
  await nextTick()
  stageBarChart?.dispose()
  stageBarChart = null
  initTab3Charts()
})

watch(showPatientDetail, async (show) => {
  if (show) {
    await nextTick()
    initDetailCharts()
  }
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
  initCharts()
  getOverviewData()
})

function handleResize() {
  pieChart?.resize()
  trendLineChart?.resize()
  cPeptideChart?.resize()
  stageBarChart?.resize()
  detailCPeptideChart?.resize()
}

async function handleViewPatientDetail(patient: PatientRecord) {
  // currentPatientDetail.value = generatePatientProgressDetail(patient as any)
  const { code, data } = await getDiseaseProgressionDetail({ zyh: patient.zyh })
  console.log(code, 'code===')
  console.log(data, 'data===')
  currentPatientDetail.value = data
  detailCPeptideChart = null
  showPatientDetail.value = true
}
</script>

<template>
  <ScrollContainer wrapper-class="flex flex-col gap-y-4 max-sm:gap-y-2">
    <div class="disease-progression">
      <!-- 核心主导航Tab -->
      <NCard class="main-content">
        <NTabs
          v-model:value="activeTab"
          type="line"
          animated
          @update:value="initCharts"
        >
          <!-- Tab1: 综合进展总览 -->
          <NTabPane
            name="tab1"
            tab="综合进展总览"
          >
            <div class="filter-bar mb-4">
              <div class="filter-item">
                <span class="filter-label">时间范围</span>
                <NDatePicker
                  v-model:value="range"
                  type="daterange"
                  clearable
                  @confirm="(val) => getOverviewData(val)"
                />
              </div>
            </div>
            <!-- 6张并发症统计卡片 -->
            <div class="complication-cards">
              <NCard
                v-for="(card, index) in complicationCards"
                :key="card.name"
                :class="['complication-card', getComplicationCardClass(index)]"
                :bordered="false"
                hoverable
              >
                <div class="card-header">
                  <span class="card-title">{{ card.name }}</span>
                  <span class="card-count"
                    >{{ card.count }}<span style="font-size: 14px; font-weight: 400">人</span></span
                  >
                </div>
                <div class="card-content">
                  <span class="card-proportion">占全院 {{ card.percentage }}%</span>
                  <span
                    v-if="card.change"
                    class="card-change"
                    :class="{
                      positive: card.change.startsWith('+'),
                      negative: card.change.startsWith('-'),
                    }"
                  >
                    {{ card.change.startsWith('+') ? '↑' : '↓' }} {{ card.change.slice(1) }} 较上月
                  </span>
                </div>
              </NCard>
            </div>

            <!-- 2个并排图表 -->
            <div class="charts-row grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div>
                <NCard
                  title="并发症类型分布"
                  :bordered="false"
                >
                  <div
                    ref="pieChartRef"
                    class="chart-container"
                  ></div>
                </NCard>
              </div>
              <div class="lg:col-span-2">
                <NCard
                  title="并发症新发/进展患者TOP20"
                  :bordered="false"
                >
                  <NDataTable
                    :columns="top20Columns"
                    :data="top20PatientList"
                    :loading="loading"
                    :pagination="false"
                    :max-height="400"
                  />
                </NCard>
              </div>
            </div>
          </NTabPane>

          <!-- Tab4: 患者进展明细档案 -->
          <NTabPane
            name="tab4"
            tab="患者进展明细档案"
          >
            <NCard :bordered="false">
              <div class="mb-4 flex gap-4">
                <NInput
                  v-model:value="patientQueryParams.zyh"
                  placeholder="住院号"
                  clearable
                  style="width: 160px"
                  @keyup.enter="getPatientListData"
                />
                <NInput
                  v-model:value="patientQueryParams.name"
                  placeholder="姓名"
                  clearable
                  style="width: 160px"
                  @keyup.enter="getPatientListData"
                />
                <NButton
                  type="primary"
                  @click="getPatientListData"
                  >查询</NButton
                >
              </div>
              <NDataTable
                :columns="patientListColumns"
                :data="patientList"
                :loading="patientListLoading"
                :pagination="patientPagination"
                :max-height="600"
                :remote="true"
              />
            </NCard>
          </NTabPane>
        </NTabs>
      </NCard>

      <!-- 患者详情弹窗 -->
      <NModal
        v-model:show="showPatientDetail"
        preset="card"
        title="病情进展明细"
        style="width: 800px; max-width: 95vw"
        :mask-closable="true"
        :bordered="false"
        :segmented="{ content: true, footer: true }"
        :header-style="{ paddingBottom: '8px' }"
      >
        <template v-if="currentPatientDetail">
          <!-- 患者信息卡片 -->
          <NCard
            size="small"
            :bordered="false"
            class="mb-4"
            :content-style="{ padding: '16px' }"
          >
            <div class="patient-header">
              <div
                class="patient-avatar"
                :class="currentPatientDetail.basicInfo.sex === '女' ? 'female' : 'male'"
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                  />
                </svg>
              </div>
              <div class="patient-main-info">
                <div class="patient-name-row">
                  <span class="patient-name">{{ currentPatientDetail.basicInfo.name }}</span>
                  <NTag
                    :type="currentPatientDetail.basicInfo.sex === '男' ? 'info' : 'warning'"
                    size="small"
                    round
                  >
                    {{ currentPatientDetail.basicInfo.sex }}
                  </NTag>
                  <NTag
                    type="default"
                    size="small"
                    round
                  >
                    {{ currentPatientDetail.basicInfo.age }}
                  </NTag>
                </div>
                <div class="patient-meta">
                  <span class="meta-item">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      />
                      <line
                        x1="16"
                        y1="2"
                        x2="16"
                        y2="6"
                      />
                      <line
                        x1="8"
                        y1="2"
                        x2="8"
                        y2="6"
                      />
                      <line
                        x1="3"
                        y1="10"
                        x2="21"
                        y2="10"
                      />
                    </svg>
                    住院号: {{ currentPatientDetail.basicInfo.zyh }}
                  </span>
                </div>
              </div>
              <div class="patient-indicators">
                <div class="indicator-item">
                  <span class="indicator-label">最近C肽</span>
                  <span
                    class="indicator-value"
                    :class="getCPeptideClass(currentPatientDetail.basicInfo.latestCPeptide)"
                  >
                    {{ currentPatientDetail.basicInfo.latestCPeptide || '--' }}
                  </span>
                </div>
                <div class="indicator-item">
                  <span class="indicator-label">入院日期</span>
                  <span
                    v-if="currentPatientDetail.basicInfo.admissionDate"
                    class="indicator-value secondary"
                  >
                    {{ formatDate(currentPatientDetail.basicInfo.admissionDate) }}
                  </span>
                  <span
                    v-else
                    class="indicator-empty"
                    >--</span
                  >
                </div>
              </div>
            </div>
          </NCard>

          <!-- 并发症进展时间轴 -->
          <NCard
            title="并发症进展时间轴"
            size="small"
            :bordered="false"
            class="mb-4"
            :content-style="{ padding: '0 12px 12px 12px' }"
          >
            <template #header-extra>
              <NTag
                type="info"
                size="small"
                >{{ currentPatientDetail.complicationTimeline.length }}条记录</NTag
              >
            </template>
            <NTimeline
              v-if="currentPatientDetail.complicationTimeline.length > 0"
              size="small"
            >
              <NTimelineItem
                v-for="(event, idx) in currentPatientDetail.complicationTimeline"
                :key="idx"
                :type="getTimelineType(event.type)"
                :title="event.title"
                :time="event.date"
              >
                {{ event.content }}
              </NTimelineItem>
            </NTimeline>
            <NEmpty
              v-else
              description="暂无并发症进展记录"
              size="small"
            />
          </NCard>

          <!-- 胰岛功能变化趋势 -->
          <NCard
            title="胰岛功能变化趋势（C肽）"
            size="small"
            :bordered="false"
            class="mb-4"
            :content-style="{ padding: '0 12px 12px 12px' }"
          >
            <NEmpty
              v-if="!currentPatientDetail.cPeptideTrend"
              description="暂无C肽变化趋势数据"
              size="small"
            />
            <div
              v-else
              ref="detailCPeptideRef"
              class="chart-container"
            ></div>
          </NCard>

          <!-- 并发症历次检查结果对比表 -->
          <NCard
            title="历次检查结果对比"
            size="small"
            :bordered="false"
            :content-style="{ padding: '0 12px 12px 12px' }"
          >
            <NDataTable
              :columns="examResultColumns"
              :data="currentPatientDetail.examinationResults"
              :pagination="false"
              :max-height="280"
              size="small"
              :row-class-name="() => 'exam-result-row'"
            />
          </NCard>
        </template>
      </NModal>
    </div>
  </ScrollContainer>
</template>

<style scoped>
.disease-progression {
  /* padding: 16px; */
  background: #f5f5f5;
  min-height: calc(100vh - 60px);
  max-height: 100%;
  overflow-y: auto;
}

.filter-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.main-content {
  background: #fff;
  border-radius: 8px;
  overflow: visible;
}

::deep(.n-tab-pane) {
  padding-bottom: 32px;
}

.complication-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.complication-card {
  position: relative;
  text-align: left;
  cursor: pointer;
  transition: all 0.25s ease;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #ebeef5;
}

.complication-card::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 5px;
}

.complication-card.type-none::before {
  background: linear-gradient(180deg, #67c23a, #95d475);
}
.complication-card.type-micro::before {
  background: linear-gradient(180deg, #409eff, #79bbff);
}
.complication-card.type-macro::before {
  background: linear-gradient(180deg, #e6a23c, #f3b740);
}
.complication-card.type-multi::before {
  background: linear-gradient(180deg, #f56c6c, #f89898);
}
.complication-card.type-pancreas::before {
  background: linear-gradient(180deg, #8b5cf6, #a78bfa);
}
.complication-card.type-highrisk::before {
  background: linear-gradient(180deg, #909399, #a6a9ad);
}

.complication-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-top: 8px;
  padding-left: 12px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-icon {
  font-size: 14px;
  color: #909399;
  cursor: help;
  font-style: normal;
}

.card-count {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 12px;
}

.card-proportion {
  font-size: 13px;
  color: #909399;
}

.card-change {
  font-size: 13px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}

.card-change.positive {
  color: #67c23a;
  background: rgba(103, 194, 58, 0.1);
}
.card-change.negative {
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.1);
}

.charts-row {
  margin-bottom: 24px;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.index-cards {
  margin-bottom: 24px;
}

.safety-cards {
  margin-bottom: 24px;
}

.safety-card {
  position: relative;
  text-align: left;
  border-radius: 12px;
  border: 1px solid #ebeef5;
  transition: all 0.25s ease;
  overflow: hidden;
}

.safety-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 12px 0 0 12px;
}

.safety-card.type-adverse::before {
  background: linear-gradient(180deg, #409eff, #79bbff);
}
.safety-card.type-liver::before {
  background: linear-gradient(180deg, #e6a23c, #f3b740);
}
.safety-card.type-compliance::before {
  background: linear-gradient(180deg, #67c23a, #95d475);
}
.safety-card.type-risk::before {
  background: linear-gradient(180deg, #f56c6c, #f89898);
}

.safety-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.safety-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
  padding-left: 8px;
}

.safety-content {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 12px;
}

.safety-value {
  font-size: 36px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
}

.safety-unit {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.safety-rate {
  font-size: 14px;
  color: #909399;
  margin-left: 4px;
}

.safety-change {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  padding: 4px 10px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
}

.safety-change.positive {
  color: #67c23a;
  background: rgba(103, 194, 58, 0.1);
}
.safety-change.negative {
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.1);
}

.safety-subtitle {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 4px;
  padding-left: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}

.empty-tip {
  text-align: center;
  color: #909399;
  padding: 24px 0;
  font-size: 14px;
}

@media (max-width: 1200px) {
  .complication-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .complication-cards {
    grid-template-columns: 1fr;
  }
}

.patient-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.patient-avatar {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.patient-avatar.male {
  background: linear-gradient(135deg, #0891b2 0%, #22d3ee 100%);
}

.patient-avatar.female {
  background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
}

.patient-main-info {
  flex: 1;
  min-width: 0;
}

.patient-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.patient-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.patient-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
}

.patient-indicators {
  display: flex;
  gap: 24px;
}

.indicator-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 16px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.indicator-label {
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.indicator-value {
  font-size: 18px;
  font-weight: 700;
  color: #374151;
}

.indicator-value.secondary {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

.indicator-empty {
  font-size: 18px;
  font-weight: 700;
  color: #374151;
}

.chart-container {
  height: 200px;
}

:deep(.exam-result-row:hover) {
  background-color: #f9fafb;
}
</style>
