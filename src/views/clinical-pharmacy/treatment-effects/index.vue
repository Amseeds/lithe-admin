<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, h, reactive } from 'vue'
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
  NDivider,
  NPagination,
  NEmpty,
  type DataTableColumns,
  type PaginationProps,
} from 'naive-ui'
import * as echarts from 'echarts'
import { ScrollContainer } from '@/components'
import { getPatientList, type PatientRecord, type PatientQueryParams } from '@/api/patientRecords'
import {
  efficacyCards,
  efficacyFactorsChart,
  efficacyTrendChart,
  unachievedTop20,
  highRiskPatients,
} from './mock/tab1'
import {
  glucoseMetabolicIndices,
  lipidMetabolicIndices,
  liverKidneyIndices,
  otherIndices,
  hba1cAbnormalPatients,
  generateDistributionData,
  generateTrendData,
} from './mock/tab2'
import {
  medicationSafetyCards,
  adverseReactionChart,
  complianceEfficacyChart,
  drugAdverseReactions,
  highRiskMedicationPatients,
} from './mock/tab3'
import { generatePatientDetail, generateHba1cTrend, generateGlucoseTrend } from './mock/tab4'
import type { Patient, PatientDetail } from './mock/types'

defineOptions({
  name: 'TreatmentEffects',
})

// 筛选条件
const timeRange = ref<string | null>('近3个月')
const patientStratification = ref<string[]>([])
const efficacyGrade = ref<string[]>([])
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

const efficacyGradeOptions = [
  { label: '优秀达标', value: '优秀达标' },
  { label: '稳定达标', value: '稳定达标' },
  { label: '部分达标', value: '部分达标' },
  { label: '未达标', value: '未达标' },
  { label: '高风险异常', value: '高风险异常' },
]

// Tab状态
const activeTab = ref('tab4')
const activeTab2Sub = ref('glucose')

// Tab2子Tab选项
const tab2SubOptions = [
  { label: '糖代谢指标', name: 'glucose' },
  { label: '脂质代谢指标', name: 'lipid' },
  { label: '肝肾功能指标', name: 'liverKidney' },
  { label: '其他配套指标', name: 'other' },
]

// Tab2当前指标数据
const currentTab2Indices = computed(() => {
  switch (activeTab2Sub.value) {
    case 'glucose':
      return glucoseMetabolicIndices
    case 'lipid':
      return lipidMetabolicIndices
    case 'liverKidney':
      return liverKidneyIndices
    case 'other':
      return otherIndices
    default:
      return glucoseMetabolicIndices
  }
})

// Tab2当前异常患者
const currentTab2AbnormalPatients = computed(() => {
  return hba1cAbnormalPatients
})

// 弹窗状态
const showPatientDetail = ref(false)
const currentPatientDetail = ref<PatientDetail | null>(null)

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

// 表格列定义 - Tab1未达标患者
const unachievedColumns = [
  { title: '患者姓名', key: 'name', width: 100 },
  { title: '病历号', key: 'medicalRecordNo', width: 120 },
  { title: '年龄', key: 'age', width: 60 },
  { title: '所属分层', key: 'category', width: 120 },
  { title: '超标核心指标', key: 'exceededIndicator', width: 180 },
  { title: '最近随访时间', key: 'lastFollowUpDate', width: 120 },
]

// 表格列定义 - Tab1高风险患者
const highRiskColumns = [
  { title: '患者姓名', key: 'name', width: 100 },
  { title: '病历号', key: 'medicalRecordNo', width: 100 },
  { title: '年龄', key: 'age', width: 60 },
  { title: '所属分层', key: 'category', width: 120 },
  { title: '异常类型', key: 'abnormalType', width: 150 },
  { title: '风险等级', key: 'riskLevel', width: 100 },
  { title: '处理状态', key: 'handleStatus', width: 100 },
]

// 表格列定义 - Tab3药物不良反应
const drugAdverseColumns = [
  { title: '患者姓名', key: 'name', width: 100 },
  { title: '病历号', key: 'medicalRecordNo', width: 120 },
  { title: '所用药物', key: 'drugUsed', width: 120 },
  { title: '不良反应类型', key: 'adverseReactionType', width: 120 },
  { title: '发生时间', key: 'occurrenceTime', width: 120 },
  { title: '处理措施', key: 'treatment', width: 150 },
  { title: '转归情况', key: 'outcome', width: 100 },
]

// 表格列定义 - Tab3用药高风险
const highRiskMedColumns = [
  { title: '患者姓名', key: 'name', width: 100 },
  { title: '病历号', key: 'medicalRecordNo', width: 120 },
  { title: '联用药物', key: 'combinedDrugs', width: 200 },
  { title: '风险类型', key: 'riskType', width: 150 },
  { title: '风险等级', key: 'riskLevel', width: 100 },
  { title: '处理状态', key: 'handleStatus', width: 100 },
]

// 表格列定义 - Tab4患者列表
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
            onClick: () => handleViewPatientDetail(row as any),
          },
          { default: () => '查看详情' },
        ),
      ]),
  },
]

// 表格列定义 - Tab2异常患者
const tab2AbnormalColumns = [
  { title: '患者姓名', key: 'name', width: 100 },
  { title: '病历号', key: 'medicalRecordNo', width: 120 },
  { title: '年龄', key: 'age', width: 80 },
  { title: '所属分层', key: 'category', width: 120 },
  { title: '最近检测值', key: 'latestValue', width: 110 },
  { title: '个人目标值', key: 'personalTarget', width: 110 },
  { title: '异常等级', key: 'abnormalLevel', width: 100 },
  { title: '上次检测值', key: 'previousValue', width: 110 },
  { title: '变化幅度', key: 'changeRate', width: 100 },
  { title: '检测时间', key: 'testDate', width: 120 },
]

// 表格列定义 - 患者详情指标
const indicatorColumns = [
  { title: '指标名称', key: 'indicatorName', width: 150, render: (row) => row.indicatorName || '-' },
  { title: '个人目标值', key: 'personalTarget', width: 110, render: (row) => row.personalTarget || '-' },
  { title: '最近检测值', key: 'latestValue', width: 120, render: (row) => row.latestValue || '-' },
  { title: '最近检测时间', key: 'latestTestTime', width: 120, render: (row) => row.latestTestTime || '-' },
  { title: '单位', key: 'unit', width: 80, render: (row) => row.unit || '-' },
  { title: '参考值', key: 'referenceRange', width: 100, render: (row) => row.referenceRange || '-' },
  {
    title: '是否达标',
    key: 'isStandard',
    width: 100,
    render: (row) => (row.isStandard ? '是' : row.isStandard === false ? '否' : '-'),
  },
  { title: '异常等级', key: 'riskLevel', width: 100, render: (row) => row.riskLevel || '-' },
]

// 表格列定义 - 随访记录
const followUpColumns = [
  { title: '随访日期', key: 'followUpDate', width: 120 },
  { title: '随访医生', key: 'followUpDoctor', width: 100 },
  { title: '疗效评估结论', key: 'efficacyConclusion', width: 200 },
  { title: '治疗调整建议', key: 'treatmentAdvice', width: 200 },
]

// 表格列定义 - 历史报告
const reportColumns = [
  { title: '报告日期', key: 'reportDate', width: 120 },
  { title: '报告类型', key: 'reportType', width: 150 },
  { title: '核心结论', key: 'coreConclusion', width: 300 },
]

// 图表实例
let factorsChart: ECharts | null = null
let trendChart: ECharts | null = null
let adverseChart: ECharts | null = null
let complianceChart: ECharts | null = null
let hba1cTrendChart: ECharts | null = null
let glucoseTrendChart: ECharts | null = null

// 图表DOM refs
const factorsChartRef = ref<HTMLElement | null>(null)
const trendChartRef = ref<HTMLElement | null>(null)
const adverseChartRef = ref<HTMLElement | null>(null)
const complianceChartRef = ref<HTMLElement | null>(null)
const hba1cTrendRef = ref<HTMLElement | null>(null)
const glucoseTrendRef = ref<HTMLElement | null>(null)

// 当前选中的指标（用于Tab2图表）
const currentSelectedIndex = ref(0)

// 初始化图表
function initCharts() {
  if (activeTab.value === 'tab1') {
    initTab1Charts()
  } else if (activeTab.value === 'tab3') {
    initTab3Charts()
  }
}

function initTab1Charts() {
  if (factorsChartRef.value && !factorsChart) {
    factorsChart = echarts.init(factorsChartRef.value)
    const option = {
      tooltip: { trigger: 'axis' },
      legend: { data: efficacyFactorsChart.series.map((s) => s.name) },
      xAxis: { type: 'category', data: efficacyFactorsChart.xAxis },
      yAxis: { type: 'value', name: '达标率(%)', max: 100 },
      series: efficacyFactorsChart.series.map((s) => ({
        name: s.name,
        type: 'bar',
        data: s.data,
        label: { show: true, position: 'top', formatter: '{c}%' },
      })),
    }
    factorsChart.setOption(option)
  }

  if (trendChartRef.value && !trendChart) {
    trendChart = echarts.init(trendChartRef.value)
    const option = {
      tooltip: { trigger: 'axis' },
      legend: { data: efficacyTrendChart.series.map((s) => s.name) },
      xAxis: { type: 'category', data: efficacyTrendChart.xAxis },
      yAxis: { type: 'value', name: '占比(%)', max: 60 },
      series: efficacyTrendChart.series.map((s) => ({
        name: s.name,
        type: 'line',
        data: s.data,
        label: { show: true, position: 'top', formatter: '{c}%' },
        smooth: true,
      })),
    }
    trendChart.setOption(option)
  }
}

function initTab3Charts() {
  if (adverseChartRef.value && !adverseChart) {
    adverseChart = echarts.init(adverseChartRef.value)
    const option = {
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: adverseReactionChart.xAxis,
        axisLabel: {
          interval: 0,
        },
      },
      yAxis: { type: 'value', name: '发生率(%)' },
      series: [
        {
          name: '不良反应发生率',
          type: 'bar',
          data: adverseReactionChart.series[0].data,
          label: { show: true, position: 'top', formatter: '{c}%' },
          itemStyle: { color: '#5470C6' },
        },
      ],
    }
    adverseChart.setOption(option)
  }

  if (complianceChartRef.value && !complianceChart) {
    complianceChart = echarts.init(complianceChartRef.value)
    const option = {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: complianceEfficacyChart.xAxis },
      yAxis: { type: 'value', name: '达标率(%)', max: 100 },
      series: [
        {
          name: '疗效达标率',
          type: 'line',
          data: complianceEfficacyChart.series[0].data,
          label: { show: true, position: 'top', formatter: '{c}%' },
          smooth: true,
          itemStyle: { color: '#5470C6' },
        },
      ],
    }
    complianceChart.setOption(option)
  }
}

// 初始化患者详情弹窗中的图表
function initDetailCharts() {
  if (!currentPatientDetail.value) return
  if (currentPatientDetail.value && hba1cTrendRef.value) {
    const hba1cTrendData = currentPatientDetail.value.lsxt
    if (!hba1cTrendData || hba1cTrendData.length === 0) {
      if (hba1cTrendChart) {
        hba1cTrendChart.dispose()
        hba1cTrendChart = null
      }
      return
    }
    const months = hba1cTrendData.map((item: { adate: string }) => item.adate?.split(' ')[0] || '')
    const values = hba1cTrendData.map((item: { avolume: string }) => item.avolume)
    const target = currentPatientDetail.value.basicInfo?.latestHbA1c?.replace('%', '') || '7.0'

    if (!hba1cTrendChart) {
      hba1cTrendChart = echarts.init(hba1cTrendRef.value)
    }
    hba1cTrendChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: months },
      yAxis: { type: 'value', name: 'HbA1c(%)' },
      series: [
        {
          name: 'HbA1c检测值',
          type: 'line',
          data: values,
          smooth: true,
          itemStyle: { color: '#5470C6' },
          label: { show: true, formatter: '{c}%' },
        },
      ],
    })
  }
}

// Tab切换时重置图表
watch(activeTab, async (newTab) => {
  await nextTick()
  if (newTab === 'tab1') {
    factorsChart?.dispose()
    factorsChart = null
    trendChart?.dispose()
    trendChart = null
    initTab1Charts()
  } else if (newTab === 'tab3') {
    adverseChart?.dispose()
    adverseChart = null
    complianceChart?.dispose()
    complianceChart = null
    initTab3Charts()
  } else if (newTab === 'tab4') {
    getPatientListData()
  }
})

// Tab2子Tab切换时重绘图表
watch(activeTab2Sub, async () => {
  await nextTick()
  currentSelectedIndex.value = 0
})

// 弹窗打开时初始化图表
watch(showPatientDetail, async (show) => {
  if (show) {
    await nextTick()
    initDetailCharts()
  }
})

// 窗口resize时重绘图表
onMounted(() => {
  window.addEventListener('resize', handleResize)
  initCharts()
  getPatientListData()
})

function handleResize() {
  factorsChart?.resize()
  trendChart?.resize()
  adverseChart?.resize()
  complianceChart?.resize()
  hba1cTrendChart?.resize()
  glucoseTrendChart?.resize()
}

// 查看详情
function handleViewDetail() {
  if (patientList.value.length > 0) {
    handleViewPatientDetail(patientList.value[0])
  }
}

async function handleViewPatientDetail(patient: Patient) {
  // currentPatientDetail.value = generatePatientDetail(patient)
  const { code, data } = await getTreatmentEffectsDetail({ zyh: patient.zyh })
  console.log(code, 'code====')
  console.log(data, 'data====')
  currentPatientDetail.value = data

  getCompareData(patient)
  hba1cTrendChart = null
  glucoseTrendChart = null
  showPatientDetail.value = true
}

const indicatorComparisonList = ref()
const indicatorLoading = ref(false)
const getCompareData = async (patient) => {
  indicatorLoading.value = true
  const { code, data } = await getIndicatorComparisonData({ zyh: patient.zyh })
  console.log(code, 'code1====')
  console.log(data, 'data2====')
  if (code === 200) {
    indicatorComparisonList.value = data
  }
  indicatorLoading.value = false
}

function handleViewReport() {
  // 仅做样式，无真实逻辑
}

// 获取疗效卡片CSS类
function getEfficacyCardClass(level: string): string {
  const classMap: Record<string, string> = {
    优秀达标: 'excellent',
    稳定达标: 'stable',
    部分达标: 'partial',
    未达标: 'failed',
    高风险异常: 'risk',
  }
  return classMap[level] || ''
}

// 获取安全卡片CSS类
function getSafetyCardClass(index: number): string {
  const classMap = ['type-adverse', 'type-liver', 'type-compliance', 'type-risk']
  return classMap[index] || ''
}

// 生成Tab2分布图数据
function getDistributionChartData(index: any) {
  return generateDistributionData(index.normalRange, index.target)
}

// 生成Tab2趋势图数据
function getTrendChartData(index: any) {
  return generateTrendData(index.target * 1.2, index.target)
}
</script>

<template>
  <ScrollContainer wrapper-class="flex flex-col gap-y-4 max-sm:gap-y-2">
    <div class="treatment-effects">
      <!-- 顶部全局筛选栏 -->
      <!-- <NCard
        class="filter-bar"
        size="small"
      >
        <div class="filter-bar-inner">
          <div class="filter-controls">
            <div class="filter-item">
              <span class="filter-label">时间范围</span>
              <NSelect
                v-model:value="timeRange"
                :options="timeRangeOptions"
                placeholder="请选择"
                clearable
                style="width: 140px"
                size="small"
              />
            </div>
            <div class="filter-item">
              <span class="filter-label">患者分层</span>
              <NSelect
                v-model:value="patientStratification"
                :options="patientStratificationOptions"
                placeholder="请选择"
                multiple
                clearable
                style="width: 180px"
                size="small"
              />
            </div>
            <div class="filter-item">
              <span class="filter-label">疗效分级</span>
              <NSelect
                v-model:value="efficacyGrade"
                :options="efficacyGradeOptions"
                placeholder="请选择"
                multiple
                clearable
                style="width: 180px"
                size="small"
              />
            </div>
            <div class="filter-buttons">
              <NButton
                size="small"
                type="primary"
                >查询</NButton
              >
              <NButton size="small">重置</NButton>
            </div>
          </div>
        </div>
      </NCard> -->

      <!-- 核心主导航Tab -->
      <NCard class="main-content">
        <NTabs
          v-model:value="activeTab"
          type="line"
          animated
          @update:value="initCharts"
        >
          <!-- Tab4: 患者疗效明细列表 -->
          <NTabPane
            name="tab4"
            tab="患者疗效明细列表"
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
        title="患者治疗效果详情"
        style="width: 960px; max-width: 95vw"
        :mask-closable="true"
      >
        <template v-if="currentPatientDetail">
          <!-- 患者基本信息 -->
          <NCard
            title="患者基本信息"
            :bordered="false"
            class="mb-4"
          >
            <NDescriptions
              :column="3"
              label-placement="left"
            >
              <NDescriptionsItem label="姓名">{{
                currentPatientDetail.patientName
              }}</NDescriptionsItem>
              <NDescriptionsItem label="性别">{{ currentPatientDetail.gender }}</NDescriptionsItem>
              <NDescriptionsItem label="年龄">{{ currentPatientDetail.age }}</NDescriptionsItem>
              <NDescriptionsItem label="住院号">{{
                currentPatientDetail.userId
              }}</NDescriptionsItem>
              <NDescriptionsItem
                label="最近HbA1c"
                :span="2"
                >{{ currentPatientDetail.latestHba1c }}</NDescriptionsItem
              >
              <NDescriptionsItem
                label="病情"
                :span="3"
              >
                {{ currentPatientDetail?.diabetesType || '-' }}
              </NDescriptionsItem>
              <!-- <NDescriptionsItem label="糖尿病类型">
                currentPatientDetail.basicInfo.diabetesType
              </NDescriptionsItem>
              <NDescriptionsItem label="病程">
                currentPatientDetail.basicInfo.diseaseDuration
              </NDescriptionsItem>
              <NDescriptionsItem label="所属分层">
                currentPatientDetail.basicInfo.category
              </NDescriptionsItem>

              <NDescriptionsItem label="综合疗效评级">
                <NTag
                  :type="
                    currentPatientDetail.basicInfo.comprehensiveEfficacyLevel === '优秀达标'
                      ? 'success'
                      : currentPatientDetail.basicInfo.comprehensiveEfficacyLevel === '高风险异常'
                        ? 'error'
                        : 'info'
                  "
                >
                  {{ currentPatientDetail.basicInfo.comprehensiveEfficacyLevel }}
                </NTag>
              </NDescriptionsItem>
              <NDescriptionsItem label="整体达标情况">
                <NTag
                  :type="
                    currentPatientDetail.basicInfo.overallStandardStatus === '达标'
                      ? 'success'
                      : 'warning'
                  "
                >
                  {{ currentPatientDetail.basicInfo.overallStandardStatus }}
                </NTag>
              </NDescriptionsItem> -->
            </NDescriptions>
          </NCard>

          <!-- 核心指标达标对比 -->
          <NCard
            title="核心指标达标对比总表"
            :bordered="false"
            class="mb-4"
          >
            <NDataTable
              :columns="indicatorColumns"
              :data="indicatorComparisonList"
              :loading="indicatorLoading"
              :pagination="false"
            />
            <!-- :max-height="400" -->
          </NCard>

          <!-- 治疗效果趋势 -->
          <NCard
            title="HbA1c变化趋势"
            :bordered="false"
            class="mb-4"
          >
            <NGrid
              :cols="1"
              :x-gap="16"
            >
              <NGi>
                <NEmpty
                  v-if="!currentPatientDetail.lsxt || currentPatientDetail.lsxt.length === 0"
                  description="暂无HbA1c趋势数据"
                />
                <template v-else>
                  <div
                    ref="hba1cTrendRef"
                    class="chart-container"
                  ></div>
                </template>
              </NGi>
              <!-- <NGi>
                <div class="chart-title">近3个月血糖波动趋势</div>
                <div
                  ref="glucoseTrendRef"
                  class="chart-container"
                ></div>
              </NGi> -->
            </NGrid>
          </NCard>

          <!-- 用药安全性 -->
          <!-- <NCard
            title="用药安全性专项评估"
            :bordered="false"
            class="mb-4"
          >
            <NDescriptions
              :column="2"
              label-placement="left"
            >
              <NDescriptionsItem label="当前用药方案">{{
                currentPatientDetail.currentMedication.medicationPlan
              }}</NDescriptionsItem>
              <NDescriptionsItem label="用药时长">{{
                currentPatientDetail.currentMedication.medicationDuration
              }}</NDescriptionsItem>
              <NDescriptionsItem label="用药依从性">{{
                currentPatientDetail.currentMedication.medicationCompliance
              }}</NDescriptionsItem>
              <NDescriptionsItem label="历史不良反应">{{
                currentPatientDetail.currentMedication.historicalAdverseReactions
              }}</NDescriptionsItem>
              <NDescriptionsItem
                label="用药风险提示"
                :span="2"
                >{{
                  currentPatientDetail.currentMedication.medicationRiskWarning
                }}</NDescriptionsItem
              >
            </NDescriptions>
          </NCard> -->

          <!-- 随访记录 -->
          <!-- <NCard
            title="历次随访评估记录"
            :bordered="false"
            class="mb-4"
          >
            <NDataTable
              :columns="followUpColumns"
              :data="currentPatientDetail.followUpRecords"
              :pagination="false"
              :max-height="300"
            />
          </NCard> -->

          <!-- 历史报告 -->
          <!-- <NCard
            title="历史疗效报告"
            :bordered="false"
          >
            <NDataTable
              :columns="reportColumns"
              :data="currentPatientDetail.efficacyReports"
              :pagination="false"
            />
          </NCard> -->
        </template>
      </NModal>
    </div>
  </ScrollContainer>
</template>

<script lang="ts">
import { h } from 'vue'
import { getIndicatorComparisonData, getTreatmentEffectsDetail } from '@/api/treatmentEffects'
export default {}
</script>

<style scoped>
/* ================================================================
   CSS变量 - 医疗级色系（支持 Dark Mode）
   ================================================================ */
.treatment-effects {
  --color-bg: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;
  --color-border: #ebeef5;
  --color-border-light: rgba(64, 158, 255, 0.08);

  --color-text-primary: #0f172a;
  --color-text-secondary: #334155;
  --color-text-muted: #64748b;
  --color-text-light: #94a3b8;

  --color-primary: #0ea5e9;
  --color-primary-light: #38bdf8;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;

  --color-card-shadow: rgba(64, 158, 255, 0.06);
  --color-card-shadow-hover: rgba(64, 158, 255, 0.12);

  --radius-sm: 8px;
  --radius-md: 12px;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .treatment-effects {
    --color-bg: #1e293b;
    --color-bg-secondary: #0f172a;
    --color-bg-tertiary: #1e293b;
    --color-border: #334155;
    --color-border-light: rgba(255, 255, 255, 0.06);

    --color-text-primary: #f1f5f9;
    --color-text-secondary: #cbd5e1;
    --color-text-muted: #94a3b8;
    --color-text-light: #64748b;

    --color-card-shadow: rgba(0, 0, 0, 0.2);
    --color-card-shadow-hover: rgba(0, 0, 0, 0.35);
  }
}
.treatment-effects {
  /* padding: 16px; */
  /* background: #f5f5f5; */
  min-height: calc(100vh - 60px);
  max-height: 100%;
  overflow-y: auto;
}

.filter-bar {
  margin-bottom: 16px;
}

.filter-bar :deep(.n-card__content) {
  padding: 12px 16px;
}

.filter-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  font-weight: 500;
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.main-content {
  /* background: #fff; */
  border-radius: 8px;
  overflow: visible;
}

::deep(.n-tab-pane) {
  padding-bottom: 32px;
}

.efficacy-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.efficacy-card {
  position: relative;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
}

.efficacy-card::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 5px;
}

.efficacy-card.excellent::before {
  background: linear-gradient(180deg, #67c23a, #95d475);
}
.efficacy-card.stable::before {
  background: linear-gradient(180deg, #409eff, #79bbff);
}
.efficacy-card.partial::before {
  background: linear-gradient(180deg, #e6a23c, #f3b740);
}
.efficacy-card.failed::before {
  background: linear-gradient(180deg, #f56c6c, #f89898);
}
.efficacy-card.risk::before {
  background: linear-gradient(180deg, #909399, #a6a9ad);
}

.efficacy-card:hover {
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
  color: var(--color-text-primary);
}

.card-count {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 12px;
}

.card-proportion {
  font-size: 13px;
  color: var(--color-text-muted);
}

.card-change {
  font-size: 13px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
}

.card-change.positive {
  color: var(--color-success);
  background: rgba(16, 185, 129, 0.1);
}

.card-change.negative {
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.1);
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

.index-card {
  position: relative;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-bottom: 16px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-secondary) 100%);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.index-card::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 4px;
  background: linear-gradient(180deg, var(--color-text-muted), var(--color-text-light));
  transition: all 0.2s;
}

.index-card.active::before {
  background: linear-gradient(180deg, var(--color-primary), var(--color-primary-light));
}

.index-card.active {
  border: 1px solid var(--color-primary);
  background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-tertiary) 100%);
}

.index-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--color-card-shadow-hover);
}

.index-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  text-align: left;
  color: var(--color-text-primary);
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.index-name-text {
  display: flex;
  align-items: center;
  gap: 6px;
}

.index-unit {
  font-size: 11px;
  font-weight: 400;
  color: var(--color-text-muted);
  background: var(--color-bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
}

.index-stat {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.stat-rate-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

.stat-rate {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-success);
}

.stat-rate.danger {
  color: var(--color-danger);
}

.stat-change {
  font-size: 11px;
  font-weight: 500;
  padding: 1px 5px;
  border-radius: 3px;
}

.stat-change.positive {
  color: var(--color-success);
  background: rgba(16, 185, 129, 0.1);
}

.stat-change.negative {
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.1);
}

.safety-cards {
  margin-bottom: 24px;
}

.safety-card {
  position: relative;
  text-align: left;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-secondary) 100%);
  border: 1px solid var(--color-border);
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
  border-radius: var(--radius-md) 0 0 var(--radius-md);
}

.safety-card.type-adverse::before {
  background: linear-gradient(180deg, var(--color-warning), #fbbf24);
}
.safety-card.type-liver::before {
  background: linear-gradient(180deg, var(--color-text-muted), var(--color-text-light));
}
.safety-card.type-compliance::before {
  background: linear-gradient(180deg, var(--color-success), #34d399);
}
.safety-card.type-risk::before {
  background: linear-gradient(180deg, var(--color-danger), #f87171);
}

.safety-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--color-card-shadow-hover);
}

.safety-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--color-text-primary);
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
  color: var(--color-text-primary);
  line-height: 1;
}

.safety-unit {
  font-size: 14px;
  color: var(--color-text-muted);
  font-weight: 500;
}

.safety-rate {
  font-size: 14px;
  color: var(--color-text-light);
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
  color: var(--color-success);
  background: rgba(16, 185, 129, 0.1);
}

.safety-change.negative {
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.1);
}

.safety-subtitle {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  text-align: center;
}

.mb-4 {
  margin-bottom: 16px;
}

@media (max-width: 1200px) {
  .efficacy-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .efficacy-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
