<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, h } from 'vue'
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
  type DataTableColumns,
} from 'naive-ui'
import * as echarts from 'echarts'
import {
  complicationCards,
  complicationDistribution,
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
import {
  generatePatientList,
  generatePatientProgressDetail,
} from './mock/tab4'
import type { Patient, PatientProgressDetail } from './mock/types'

defineOptions({
  name: 'DiseaseProgression',
})

// 筛选条件
const timeRange = ref<string | null>('近3个月')
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

// 患者列表数据
const patientList = ref<Patient[]>(generatePatientList())

// 表格列 - Tab1 并发症进展TOP20
const top20Columns = [
  { title: '患者姓名', key: '患者姓名', width: 80 },
  { title: '病历号', key: '病历号', width: 110 },
  { title: '年龄', key: '年龄', width: 50 },
  { title: '所属分层', key: '所属分层', width: 100 },
  { title: '并发症类型', key: '并发症类型', width: 120 },
  { title: '进展情况', key: '进展情况', width: 100 },
  { title: '发现日期', key: '发现日期', width: 100 },
]

// 表格列 - Tab1 高进展风险
const highRiskColumns = [
  { title: '患者姓名', key: '患者姓名', width: 80 },
  { title: '病历号', key: '病历号', width: 110 },
  { title: '年龄', key: '年龄', width: 50 },
  { title: '所属分层', key: '所属分层', width: 100 },
  { title: '并发症类型', key: '并发症类型', width: 130 },
  { title: '进展情况', key: '进展情况', width: 100 },
  { title: '发现日期', key: '发现日期', width: 100 },
]

// 表格列 - Tab2 胰岛功能明细
const pancreaticColumns = [
  { title: '患者姓名', key: '患者姓名', width: 100 },
  { title: '病历号', key: '病历号', width: 120 },
  { title: '年龄', key: '年龄', width: 60 },
  { title: '所属分层', key: '所属分层', width: 120 },
  { title: '胰岛功能分级', key: '胰岛功能分级', width: 120 },
  { title: '基线C肽', key: '基线C肽', width: 100 },
  { title: '最近C肽', key: '最近C肽', width: 100 },
  { title: '下降幅度', key: '下降幅度', width: 100 },
  { title: '检测日期', key: '检测日期', width: 120 },
]

// 表格列 - Tab3 并发症明细
const complicationDetailColumns = [
  { title: '患者姓名', key: '患者姓名', width: 100 },
  { title: '病历号', key: '病历号', width: 120 },
  { title: '年龄', key: '年龄', width: 60 },
  { title: '所属分层', key: '所属分层', width: 120 },
  { title: '并发症名称', key: '并发症名称', width: 140 },
  { title: '当前分期', key: '当前分期', width: 100 },
  { title: '较上次变化', key: '较上次变化', width: 140 },
  { title: '最近检查日期', key: '最近检查日期', width: 120 },
]

// 表格列 - Tab4 患者列表
const patientListColumns = [
  { title: '患者姓名', key: 'name', width: 100 },
  { title: '病历号', key: 'medicalRecordNo', width: 130 },
  { title: '年龄', key: 'age', width: 80 },
  { title: '所属分层', key: 'categoryName', width: 120 },
  { title: '并发症类型', key: 'complicationType', width: 140 },
  { title: '胰岛功能', key: 'pancreaticFunction', width: 120 },
  { title: '最近C肽', key: 'cPeptideLevel', width: 100 },
  { title: '最近检查日期', key: 'lastCheckDate', width: 130 },
  { title: '主诊医生', key: 'mainDoctor', width: 100 },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render(row: Patient) {
      return h(
        NButton,
        { size: 'small', type: 'primary', onClick: () => handleViewPatientDetail(row) },
        { default: () => '查看详情' },
      )
    },
  },
] as DataTableColumns<Patient>

// 表格列 - 弹窗检查对比
const examResultColumns = [
  { title: '检查项目', key: '检查项目', width: 160 },
  { title: '检查日期', key: '检查日期', width: 120 },
  { title: '本次结果', key: '本次结果', width: 180 },
  { title: '上次结果', key: '上次结果', width: 140 },
  { title: '变化趋势', key: '变化趋势', width: 100 },
  { title: '异常等级', key: '异常等级', width: 120 },
]

// 表格列 - 弹窗随访记录
const followUpColumns = [
  { title: '随访日期', key: '随访日期', width: 120 },
  { title: '随访医生', key: '随访医生', width: 100 },
  { title: '进展评估结论', key: '进展评估结论', width: 250 },
  { title: '治疗调整建议', key: '治疗调整建议', width: 250 },
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
const currentTab3Cards = computed(() => activeTab3Sub.value === 'microvascular' ? microvascularCards : macrovascularCards)
const currentTab3Distribution = computed(() => activeTab3Sub.value === 'microvascular' ? microvascularStageDistribution : macrovascularStageDistribution)
const currentTab3Patients = computed(() => activeTab3Sub.value === 'microvascular' ? microvascularProgressPatients : macrovascularProgressPatients)

// 卡片颜色样式
function getComplicationCardClass(index: number): string {
  return ['type-none', 'type-micro', 'type-macro', 'type-multi', 'type-pancreas', 'type-highrisk'][index] || ''
}

function getSafetyCardClass(index: number): string {
  return ['type-adverse', 'type-liver', 'type-compliance', 'type-risk'][index] || ''
}

function getTimelineType(type: string): 'success' | 'warning' | 'info' {
  if (type === 'stable') return 'info'
  if (type === 'progress') return 'warning'
  return 'success'
}

// 初始化图表
function initCharts() {
  if (activeTab.value === 'tab1') initTab1Charts()
  else if (activeTab.value === 'tab2') initTab2Charts()
  else if (activeTab.value === 'tab3') initTab3Charts()
}

function initTab1Charts() {
  if (pieChartRef.value && !pieChart) {
    pieChart = echarts.init(pieChartRef.value)
    pieChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
      legend: { bottom: 0 },
      series: [{
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['50%', '45%'],
        data: complicationDistribution.data,
        label: { formatter: '{b}\n{d}%' },
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.3)' } },
      }],
    })
  }
  if (trendLineChartRef.value && !trendLineChart) {
    trendLineChart = echarts.init(trendLineChartRef.value)
    trendLineChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: complicationTrendChart.series.map(s => s.name) },
      xAxis: { type: 'category', data: complicationTrendChart.xAxis, axisLabel: { rotate: 30 } },
      yAxis: { type: 'value', name: '人次' },
      series: complicationTrendChart.series.map(s => ({
        name: s.name, type: 'line', data: s.data, smooth: true,
        label: { show: true, position: 'top' },
      })),
    })
  }
}

function initTab2Charts() {
  if (cPeptideChartRef.value && !cPeptideChart) {
    cPeptideChart = echarts.init(cPeptideChartRef.value)
    cPeptideChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: cPeptideTrendChart.series.map(s => s.name) },
      xAxis: { type: 'category', data: cPeptideTrendChart.xAxis, axisLabel: { rotate: 30 } },
      yAxis: { type: 'value', name: 'C肽 (ng/mL)' },
      series: [
        { name: '全院平均C肽', type: 'line', data: cPeptideTrendChart.series[0].data, smooth: true, itemStyle: { color: '#5470C6' } },
        { name: '正常参考下限', type: 'line', data: cPeptideTrendChart.series[1].data, lineStyle: { type: 'dashed' }, itemStyle: { color: '#91CC75' } },
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
      legend: { data: ['早期', '中期', '晚期'] },
      xAxis: { type: 'category', data: dist.map(d => d.并发症名称), axisLabel: { interval: 0 } },
      yAxis: { type: 'value', name: '人数' },
      series: [
        { name: '早期', type: 'bar', stack: 'total', data: dist.map(d => d.早期), itemStyle: { color: '#91CC75' } },
        { name: '中期', type: 'bar', stack: 'total', data: dist.map(d => d.中期), itemStyle: { color: '#FAC858' } },
        { name: '晚期', type: 'bar', stack: 'total', data: dist.map(d => d.晚期), itemStyle: { color: '#EE6666' } },
      ],
    })
  }
}

function initDetailCharts() {
  if (currentPatientDetail.value && detailCPeptideRef.value) {
    const trend = currentPatientDetail.value.cPeptideTrend
    if (!detailCPeptideChart) {
      detailCPeptideChart = echarts.init(detailCPeptideRef.value)
    }
    detailCPeptideChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['C肽检测值', '基线水平'] },
      xAxis: { type: 'category', data: trend.months },
      yAxis: { type: 'value', name: 'C肽 (ng/mL)' },
      series: [
        { name: 'C肽检测值', type: 'line', data: trend.values, smooth: true, itemStyle: { color: '#5470C6' }, label: { show: true, formatter: '{c}' } },
        { name: '基线水平', type: 'line', data: trend.months.map(() => trend.baseline.toString()), lineStyle: { type: 'dashed' }, itemStyle: { color: '#91CC75' } },
      ],
    })
  }
}

// Tab切换时重置图表
watch(activeTab, async () => {
  await nextTick()
  pieChart?.dispose(); pieChart = null
  trendLineChart?.dispose(); trendLineChart = null
  cPeptideChart?.dispose(); cPeptideChart = null
  stageBarChart?.dispose(); stageBarChart = null
  initCharts()
})

watch(activeTab3Sub, async () => {
  await nextTick()
  stageBarChart?.dispose(); stageBarChart = null
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
})

function handleResize() {
  pieChart?.resize()
  trendLineChart?.resize()
  cPeptideChart?.resize()
  stageBarChart?.resize()
  detailCPeptideChart?.resize()
}

function handleViewPatientDetail(patient: Patient) {
  currentPatientDetail.value = generatePatientProgressDetail(patient)
  detailCPeptideChart = null
  showPatientDetail.value = true
}
</script>

<template>
  <div class="disease-progression">
    <!-- 顶部全局筛选栏 -->
    <div class="filter-bar">
      <div class="filter-item">
        <span class="filter-label">时间范围</span>
        <NSelect v-model:value="timeRange" :options="timeRangeOptions" placeholder="请选择" clearable style="width: 140px" />
      </div>
      <div class="filter-item">
        <span class="filter-label">患者分层</span>
        <NSelect v-model:value="patientStratification" :options="patientStratificationOptions" placeholder="请选择" multiple clearable style="width: 180px" />
      </div>
      <div class="filter-item">
        <span class="filter-label">并发症类型</span>
        <NSelect v-model:value="complicationType" :options="complicationTypeOptions" placeholder="请选择" multiple clearable style="width: 180px" />
      </div>
      <div class="filter-item">
        <span class="filter-label">患者姓名/病历号</span>
        <NInput v-model:value="searchText" placeholder="请输入" clearable style="width: 160px" />
      </div>
      <NButton type="primary">查询</NButton>
    </div>

    <!-- 核心主导航Tab -->
    <NCard class="main-content">
      <NTabs v-model:value="activeTab" type="line" animated @update:value="initCharts">

        <!-- Tab1: 综合进展总览 -->
        <NTabPane name="tab1" tab="综合进展总览">
          <!-- 6张并发症统计卡片 -->
          <div class="complication-cards">
            <NCard v-for="(card, index) in complicationCards" :key="card.name" :class="['complication-card', getComplicationCardClass(index)]" :bordered="false" hoverable>
              <div class="card-header">
                <span class="card-title">
                  {{ card.name }}
                  <NTooltip trigger="hover">
                    <template #trigger>
                      <span class="info-icon">ⓘ</span>
                    </template>
                    {{ card.definition }}
                  </NTooltip>
                </span>
                <span class="card-count">{{ card.count }}<span style="font-size: 14px; font-weight: 400">人</span></span>
              </div>
              <div class="card-content">
                <span class="card-proportion">占全院 {{ card.percentage }}</span>
                <span class="card-change" :class="{ positive: card.change.startsWith('+'), negative: card.change.startsWith('-') }">
                  {{ card.change.startsWith('+') ? '↑' : '↓' }} {{ card.change.slice(1) }} 较上月
                </span>
              </div>
            </NCard>
          </div>

          <!-- 2个并排图表 -->
          <NGrid :cols="2" :x-gap="16" class="charts-row">
            <NGi>
              <NCard title="并发症类型分布" :bordered="false">
                <div ref="pieChartRef" class="chart-container"></div>
              </NCard>
            </NGi>
            <NGi>
              <NCard title="近1年并发症新发/进展趋势" :bordered="false">
                <div ref="trendLineChartRef" class="chart-container"></div>
              </NCard>
            </NGi>
          </NGrid>

          <!-- 2个并排表格 -->
          <NGrid :cols="2" :x-gap="16">
            <NGi>
              <NCard title="并发症新发/进展患者TOP20" :bordered="false">
                <NDataTable :columns="top20Columns" :data="complicationProgressTop20" :pagination="false" :max-height="400" />
              </NCard>
            </NGi>
            <NGi>
              <NCard title="高进展风险患者列表" :bordered="false">
                <NDataTable :columns="highRiskColumns" :data="highRiskProgressPatients" :pagination="false" :max-height="400" />
              </NCard>
            </NGi>
          </NGrid>
        </NTabPane>

        <!-- Tab2: 胰岛功能变化跟踪 -->
        <NTabPane name="tab2" tab="胰岛功能变化跟踪">
          <!-- 4张胰岛功能统计卡片 -->
          <NGrid :cols="4" :x-gap="16" class="index-cards">
            <NGi v-for="(card, index) in pancreaticFunctionCards" :key="card.name">
              <NCard :class="['safety-card', getSafetyCardClass(index)]" :bordered="false" hoverable>
                <div class="safety-title">{{ card.name }}</div>
                <div class="safety-content">
                  <span class="safety-value">{{ card.count }}</span>
                  <span class="safety-unit">人</span>
                  <span class="safety-rate">{{ card.percentage }}</span>
                </div>
                <div class="safety-change" :class="{ positive: card.change.startsWith('-'), negative: card.change.startsWith('+') }">
                  {{ card.change.startsWith('+') ? '↑' : '↓' }} {{ card.change.slice(1) }} 较上月
                </div>
              </NCard>
            </NGi>
          </NGrid>

          <!-- C肽趋势图 -->
          <NCard title="近2年全院平均C肽水平变化趋势" :bordered="false" class="mb-4">
            <div ref="cPeptideChartRef" class="chart-container"></div>
          </NCard>

          <!-- 胰岛功能明细列表 -->
          <NCard title="患者胰岛功能明细列表" :bordered="false">
            <NDataTable :columns="pancreaticColumns" :data="pancreaticFunctionPatients" :pagination="false" :max-height="400" />
          </NCard>
        </NTabPane>

        <!-- Tab3: 慢性并发症进展跟踪 -->
        <NTabPane name="tab3" tab="慢性并发症进展跟踪">
          <NTabs v-model:value="activeTab3Sub" type="line" tab-style="margin-bottom: 0px">
            <NTabPane name="microvascular" tab="微血管并发症">
              <NGrid :cols="4" :x-gap="16" class="safety-cards">
                <NGi v-for="(card, index) in currentTab3Cards" :key="card.title">
                  <NCard :class="['safety-card', getSafetyCardClass(index)]" :bordered="false" hoverable>
                    <div class="safety-title">{{ card.title }}</div>
                    <div class="safety-content">
                      <span class="safety-value">{{ card.value }}</span>
                      <span class="safety-unit">{{ card.unit }}</span>
                      <span class="safety-rate">{{ card.rate }}</span>
                    </div>
                    <div class="safety-change" :class="{ positive: card.change.startsWith('-'), negative: card.change.startsWith('+') }">
                      {{ card.change.startsWith('+') ? '↑' : '↓' }} {{ card.change.slice(1) }} 较上月
                    </div>
                    <div class="safety-subtitle">{{ card.subTitle }}</div>
                  </NCard>
                </NGi>
              </NGrid>
              <NCard title="并发症分期分布" :bordered="false" class="mb-4">
                <div ref="stageBarChartRef" class="chart-container"></div>
              </NCard>
              <NCard title="并发症进展患者明细列表" :bordered="false">
                <NDataTable :columns="complicationDetailColumns" :data="currentTab3Patients" :pagination="false" :max-height="400" />
              </NCard>
            </NTabPane>
            <NTabPane name="macrovascular" tab="大血管并发症">
              <NGrid :cols="4" :x-gap="16" class="safety-cards">
                <NGi v-for="(card, index) in currentTab3Cards" :key="card.title">
                  <NCard :class="['safety-card', getSafetyCardClass(index)]" :bordered="false" hoverable>
                    <div class="safety-title">{{ card.title }}</div>
                    <div class="safety-content">
                      <span class="safety-value">{{ card.value }}</span>
                      <span class="safety-unit">{{ card.unit }}</span>
                      <span class="safety-rate">{{ card.rate }}</span>
                    </div>
                    <div class="safety-change" :class="{ positive: card.change.startsWith('-'), negative: card.change.startsWith('+') }">
                      {{ card.change.startsWith('+') ? '↑' : '↓' }} {{ card.change.slice(1) }} 较上月
                    </div>
                    <div class="safety-subtitle">{{ card.subTitle }}</div>
                  </NCard>
                </NGi>
              </NGrid>
              <NCard title="并发症分期分布" :bordered="false" class="mb-4">
                <div ref="stageBarChartRef" class="chart-container"></div>
              </NCard>
              <NCard title="并发症进展患者明细列表" :bordered="false">
                <NDataTable :columns="complicationDetailColumns" :data="currentTab3Patients" :pagination="false" :max-height="400" />
              </NCard>
            </NTabPane>
          </NTabs>
        </NTabPane>

        <!-- Tab4: 患者进展明细档案 -->
        <NTabPane name="tab4" tab="患者进展明细档案">
          <NCard :bordered="false">
            <NDataTable :columns="patientListColumns" :data="patientList" :pagination="{ pageSize: 10 }" :max-height="600" />
          </NCard>
        </NTabPane>
      </NTabs>
    </NCard>

    <!-- 患者详情弹窗 -->
    <NModal v-model:show="showPatientDetail" preset="card" title="患者进展明细" style="width: 960px; max-width: 95vw" :mask-closable="true">
      <template v-if="currentPatientDetail">
        <!-- 患者基本信息 -->
        <NCard title="患者基本信息" :bordered="false" class="mb-4">
          <NDescriptions :column="3" label-placement="left">
            <NDescriptionsItem label="姓名">{{ currentPatientDetail.basicInfo.姓名 }}</NDescriptionsItem>
            <NDescriptionsItem label="性别">{{ currentPatientDetail.basicInfo.性别 }}</NDescriptionsItem>
            <NDescriptionsItem label="年龄">{{ currentPatientDetail.basicInfo.年龄 }}岁</NDescriptionsItem>
            <NDescriptionsItem label="病历号">{{ currentPatientDetail.basicInfo.病历号 }}</NDescriptionsItem>
            <NDescriptionsItem label="糖尿病类型">{{ currentPatientDetail.basicInfo.糖尿病类型 }}</NDescriptionsItem>
            <NDescriptionsItem label="病程">{{ currentPatientDetail.basicInfo.病程 }}</NDescriptionsItem>
            <NDescriptionsItem label="所属分层">{{ currentPatientDetail.basicInfo.所属分层 }}</NDescriptionsItem>
            <NDescriptionsItem label="并发症类型">
              <NTag :type="currentPatientDetail.basicInfo.并发症类型 === '无并发症' ? 'success' : 'warning'">
                {{ currentPatientDetail.basicInfo.并发症类型 }}
              </NTag>
            </NDescriptionsItem>
            <NDescriptionsItem label="胰岛功能">
              <NTag :type="currentPatientDetail.basicInfo.胰岛功能 === '正常' ? 'success' : currentPatientDetail.basicInfo.胰岛功能 === '重度减退' ? 'error' : 'warning'">
                {{ currentPatientDetail.basicInfo.胰岛功能 }}
              </NTag>
            </NDescriptionsItem>
            <NDescriptionsItem label="最近C肽">{{ currentPatientDetail.basicInfo.最近C肽 }}</NDescriptionsItem>
            <NDescriptionsItem label="最近检查日期">{{ currentPatientDetail.basicInfo.最近检查日期 }}</NDescriptionsItem>
          </NDescriptions>
        </NCard>

        <!-- 并发症进展时间轴 -->
        <NCard title="并发症进展时间轴" :bordered="false" class="mb-4">
          <NTimeline v-if="currentPatientDetail.complicationTimeline.length > 0">
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
          <div v-else class="empty-tip">暂无并发症进展记录</div>
        </NCard>

        <!-- 胰岛功能变化趋势 -->
        <NCard title="胰岛功能变化趋势（C肽）" :bordered="false" class="mb-4">
          <div ref="detailCPeptideRef" class="chart-container"></div>
        </NCard>

        <!-- 并发症历次检查结果对比表 -->
        <NCard title="并发症历次检查结果对比" :bordered="false" class="mb-4">
          <NDataTable :columns="examResultColumns" :data="currentPatientDetail.examinationResults" :pagination="false" :max-height="300" />
        </NCard>

        <!-- 随访进展评估记录 -->
        <NCard title="随访进展评估记录" :bordered="false">
          <NDataTable :columns="followUpColumns" :data="currentPatientDetail.followUpRecords" :pagination="false" :max-height="300" />
        </NCard>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
.disease-progression {
  padding: 16px;
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

:deep(.n-tab-pane) {
  padding-bottom: 32px;
}

.complication-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
  top: 0; bottom: 0; left: 0;
  width: 5px;
}

.complication-card.type-none::before { background: linear-gradient(180deg, #67c23a, #95d475); }
.complication-card.type-micro::before { background: linear-gradient(180deg, #409eff, #79bbff); }
.complication-card.type-macro::before { background: linear-gradient(180deg, #e6a23c, #f3b740); }
.complication-card.type-multi::before { background: linear-gradient(180deg, #f56c6c, #f89898); }
.complication-card.type-pancreas::before { background: linear-gradient(180deg, #8b5cf6, #a78bfa); }
.complication-card.type-highrisk::before { background: linear-gradient(180deg, #909399, #a6a9ad); }

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

.card-change.positive { color: #67c23a; background: rgba(103, 194, 58, 0.1); }
.card-change.negative { color: #f56c6c; background: rgba(245, 108, 108, 0.1); }

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
  left: 0; top: 0; bottom: 0;
  width: 4px;
  border-radius: 12px 0 0 12px;
}

.safety-card.type-adverse::before { background: linear-gradient(180deg, #409eff, #79bbff); }
.safety-card.type-liver::before { background: linear-gradient(180deg, #e6a23c, #f3b740); }
.safety-card.type-compliance::before { background: linear-gradient(180deg, #67c23a, #95d475); }
.safety-card.type-risk::before { background: linear-gradient(180deg, #f56c6c, #f89898); }

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

.safety-change.positive { color: #67c23a; background: rgba(103, 194, 58, 0.1); }
.safety-change.negative { color: #f56c6c; background: rgba(245, 108, 108, 0.1); }

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
</style>
