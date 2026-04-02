<script setup lang="ts">
import { h, ref, nextTick, onMounted, onUnmounted, watch } from 'vue'
import type { ECharts } from 'echarts'
import {
  NCard,
  NDataTable,
  NModal,
  NDrawer,
  NDrawerContent,
  NButton,
  NInput,
  NSpace,
  NTag,
  NStatistic,
  NTabs,
  NTabPane,
  NCollapse,
  NCollapseItem,
  NSelect,
  NDescriptions,
  NDescriptionsItem,
  NScrollbar,
  NDivider,
  NEmpty,
  useMessage,
  type SelectOption,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import * as echarts from 'echarts'
import type { LifestylePlan, PlanDetail, ExecutionRecord, FollowUpRecord } from './mock/types'
import {
  statCards,
  barChartData,
  pieChartData,
  unplannedPatients,
  lowExecutionPatients,
  planList,
  generatePlanDetail,
  executionStatCards,
  executionRecords,
  generateFollowUpRecords,
  guidanceLibrary,
  createNewPlan,
  mockPatientsForSelect,
  planStatusMap,
  stratificationList,
} from './mock/data'

defineOptions({ name: 'LifestyleGuidance' })

const message = useMessage()

// ============================================================
// 1. 顶部筛选栏
// ============================================================
const filters = ref({
  stratification: [] as string[],
  planStatus: '',
  timeRange: '近3个月',
  searchKeyword: '',
})

const stratificationOptions: SelectOption[] = stratificationList.map((s) => ({
  label: s,
  value: s,
}))

const planStatusOptions: SelectOption[] = [
  { label: '全部', value: '' },
  { label: '未制定', value: 'not_created' },
  { label: '已制定', value: 'created' },
  { label: '已归档', value: 'archived' },
  { label: '已过期', value: 'expired' },
]

const timeRangeOptions: SelectOption[] = [
  { label: '近1个月', value: '近1个月' },
  { label: '近3个月', value: '近3个月' },
  { label: '近6个月', value: '近6个月' },
]

function handleQuery() {
  message.success('查询成功')
}
function handleReset() {
  filters.value = { stratification: [], planStatus: '', timeRange: '近3个月', searchKeyword: '' }
  message.info('已重置筛选条件')
}

// ============================================================
// 2. 统计卡片
// ============================================================
function cardChangeStyle(type: 'increase' | 'decrease' | 'neutral') {
  if (type === 'increase') return { color: '#18a058', icon: '↑' }
  if (type === 'decrease') return { color: '#d03050', icon: '↓' }
  return { color: '#666', icon: '-' }
}

// ============================================================
// Tab状态
// ============================================================
const activeTab = ref('overview')

// ============================================================
// Tab1: 图表
// ============================================================
const barChartRef = ref<HTMLElement | null>(null)
const pieChartRef = ref<HTMLElement | null>(null)
let barChart: ECharts | null = null
let pieChart: ECharts | null = null

function initTab1Charts() {
  if (barChartRef.value && !barChart) {
    barChart = echarts.init(barChartRef.value)
    barChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['患者总数', '已制定方案'] },
      grid: { left: 40, right: 20, top: 40, bottom: 70 },
      xAxis: { type: 'category', data: barChartData.map((d) => d.category) },
      yAxis: { type: 'value', name: '人数' },
      series: [
        {
          name: '患者总数',
          type: 'bar',
          data: barChartData.map((d) => d.total),
          itemStyle: { color: '#e0e7ff' },
        },
        {
          name: '已制定方案',
          type: 'bar',
          data: barChartData.map((d) => d.planned),
          itemStyle: { color: '#6366f1' },
        },
      ],
    })
  }
  if (pieChartRef.value && !pieChart) {
    pieChart = echarts.init(pieChartRef.value)
    pieChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
      legend: { bottom: 10 },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          data: pieChartData.map((d) => ({
            ...d,
            itemStyle: {
              color: d.name.includes('高')
                ? '#18a058'
                : d.name.includes('中')
                  ? '#e6a23c'
                  : '#d03050',
            },
          })),
          label: { formatter: '{b}\n{d}%' },
        },
      ],
    })
  }
}

// ============================================================
// Tab1: 未制定方案列表列
// ============================================================
const unplannedColumns: DataTableColumns<any> = [
  { title: '患者姓名', key: 'patientName', width: 90 },
  { title: '病历号', key: 'medicalRecordNo', width: 120 },
  { title: '所属分层', key: 'stratification', width: 100 },
  { title: '年龄', key: 'age', width: 60 },
  { title: '性别', key: 'gender', width: 60 },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render() {
      return h(
        NButton,
        { size: 'tiny', type: 'primary', onClick: () => message.info('新建方案（仅样式）') },
        () => '新建方案',
      )
    },
  },
]

// ============================================================
// Tab1: 低执行率TOP20列
// ============================================================
const lowExecColumns: DataTableColumns<any> = [
  { title: '排名', key: 'rank', width: 55 },
  { title: '患者姓名', key: 'patientName', width: 90 },
  { title: '病历号', key: 'medicalRecordNo', width: 120 },
  { title: '方案编号', key: 'planNo', width: 150 },
  {
    title: '执行率',
    key: 'executionRate',
    width: 80,
    render(row: any) {
      return h(
        NTag,
        { type: row.executionRate < 30 ? 'error' : 'warning', size: 'small' },
        () => `${row.executionRate}%`,
      )
    },
  },
  { title: '主要问题', key: 'mainProblem', width: 150 },
  {
    title: '操作',
    key: 'actions',
    width: 90,
    render() {
      return h(
        NButton,
        { size: 'tiny', type: 'info', onClick: () => message.info('查看详情（仅样式）') },
        () => '查看详情',
      )
    },
  },
]

// ============================================================
// Tab2: 方案列表
// ============================================================
const planColumns: DataTableColumns<LifestylePlan> = [
  { title: '方案编号', key: 'planNo', width: 160 },
  { title: '患者姓名', key: 'patientName', width: 90 },
  { title: '病历号', key: 'medicalRecordNo', width: 120 },
  { title: '所属分层', key: 'stratification', width: 100 },
  {
    title: '方案周期',
    width: 200,
    render(row) {
      return `${row.planPeriodStart} 至 ${row.planPeriodEnd}`
    },
  },
  { title: '制定医生', key: 'createDoctor', width: 90 },
  {
    title: '方案状态',
    key: 'planStatus',
    width: 90,
    render(row) {
      const map: Record<
        string,
        { type: 'default' | 'success' | 'warning' | 'error'; text: string }
      > = {
        not_created: { type: 'default', text: '未制定' },
        created: { type: 'success', text: '已制定' },
        archived: { type: 'warning', text: '已归档' },
        expired: { type: 'error', text: '已过期' },
      }
      const s = map[row.planStatus] || map.created
      return h(NTag, { type: s.type, size: 'small' }, () => s.text)
    },
  },
  {
    title: '执行率',
    key: 'executionRate',
    width: 80,
    render(row) {
      const type =
        row.executionRate >= 80 ? 'success' : row.executionRate >= 50 ? 'warning' : 'error'
      return h(NTag, { type, size: 'small' }, () => `${row.executionRate}%`)
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 220,
    fixed: 'right',
    render(row) {
      const btns: any[] = []
      if (row.planStatus === 'created') {
        btns.push(
          h(
            NButton,
            { size: 'tiny', type: 'info', onClick: () => handleViewPlanDetail(row) },
            () => '查看详情',
          ),
        )
        btns.push(
          h(
            NButton,
            { size: 'tiny', type: 'default', onClick: () => message.info('编辑（仅样式）') },
            () => '编辑',
          ),
        )
        btns.push(
          h(
            NButton,
            { size: 'tiny', type: 'warning', onClick: () => message.info('归档（仅样式）') },
            () => '归档',
          ),
        )
      } else if (row.planStatus === 'archived') {
        btns.push(
          h(
            NButton,
            { size: 'tiny', type: 'info', onClick: () => handleViewPlanDetail(row) },
            () => '查看详情',
          ),
        )
      } else if (row.planStatus === 'expired') {
        btns.push(
          h(
            NButton,
            { size: 'tiny', type: 'info', onClick: () => handleViewPlanDetail(row) },
            () => '查看详情',
          ),
        )
      }
      return h(NSpace, { size: 6 }, () => btns)
    },
  },
]

// ============================================================
// Tab2: 方案详情弹窗
// ============================================================
const detailModalVisible = ref(false)
const currentPlanDetail = ref<PlanDetail | null>(null)

function handleViewPlanDetail(plan: LifestylePlan) {
  currentPlanDetail.value = generatePlanDetail(plan)
  detailModalVisible.value = true
}

// ============================================================
// Tab2: 新建/编辑方案抽屉
// ============================================================
const drawerVisible = ref(false)
const newPlanForm = ref({
  patientNo: '',
  stratification: '',
  planPeriodStart: '',
  planPeriodEnd: '',
  doctor: '',
  dietAdvice: '',
  exerciseAdvice: '',
  weightAdvice: '',
  personalizedNote: '',
})

function handleOpenNewPlan() {
  newPlanForm.value = {
    patientNo: '',
    stratification: '',
    planPeriodStart: '',
    planPeriodEnd: '',
    doctor: '',
    dietAdvice: '',
    exerciseAdvice: '',
    weightAdvice: '',
    personalizedNote: '',
  }
  drawerVisible.value = true
}

function handleGeneratePlan() {
  const patient = mockPatientsForSelect.find((p) => p.value === newPlanForm.value.patientNo)
  if (!patient) {
    message.warning('请选择患者')
    return
  }
  const plan = createNewPlan(
    patient.name,
    patient.no,
    newPlanForm.value.stratification || patient.stratification,
    newPlanForm.value.doctor || '张晓明',
  )
  planList.unshift(plan)
  drawerVisible.value = false
  message.success('方案生成并生效成功')
}

// ============================================================
// Tab4: 执行跟踪明细
// ============================================================
const execColumns: DataTableColumns<ExecutionRecord> = [
  { title: '方案编号', key: 'planNo', width: 160 },
  { title: '患者姓名', key: 'patientName', width: 90 },
  { title: '病历号', key: 'medicalRecordNo', width: 120 },
  { title: '检查日期', key: 'checkDate', width: 110 },
  {
    title: '执行率',
    key: 'executionRate',
    width: 75,
    render(row) {
      return h(
        NTag,
        {
          type: row.executionRate >= 80 ? 'success' : row.executionRate >= 50 ? 'warning' : 'error',
          size: 'small',
        },
        () => `${row.executionRate}%`,
      )
    },
  },
  { title: '饮食评分', key: 'dietScore', width: 80 },
  { title: '运动评分', key: 'exerciseScore', width: 80 },
  {
    title: '体重状态',
    key: 'weightStatus',
    width: 80,
    render(row) {
      return h(
        NTag,
        { type: row.weightStatus === '达标' ? 'success' : 'error', size: 'small' },
        () => row.weightStatus,
      )
    },
  },
  {
    title: '睡眠状态',
    key: 'sleepStatus',
    width: 80,
    render(row) {
      return h(
        NTag,
        { type: row.sleepStatus === '良好' ? 'success' : 'warning', size: 'small' },
        () => row.sleepStatus,
      )
    },
  },
  { title: '综合评分', key: 'selfManagementScore', width: 80 },
  {
    title: '总体评级',
    key: 'overallRating',
    width: 80,
    render(row) {
      const map: Record<string, 'success' | 'info' | 'warning' | 'error'> = {
        优秀: 'success',
        良好: 'info',
        一般: 'warning',
        较差: 'error',
      }
      return h(
        NTag,
        { type: map[row.overallRating] || 'default', size: 'small' },
        () => row.overallRating,
      )
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render(row) {
      return h(
        NButton,
        { size: 'tiny', type: 'info', onClick: () => handleViewFollowUp(row) },
        () => '随访记录',
      )
    },
  },
]

// ============================================================
// Tab4: 随访记录弹窗
// ============================================================
const followUpVisible = ref(false)
const followUpRecords = ref<FollowUpRecord[]>([])

function handleViewFollowUp(record: ExecutionRecord) {
  followUpRecords.value = generateFollowUpRecords(record.patientName)
  followUpVisible.value = true
}

const followUpColumns: DataTableColumns<FollowUpRecord> = [
  { title: '随访日期', key: 'followUpDate', width: 110 },
  { title: '随访方式', key: 'followUpType', width: 90 },
  { title: '随访医生', key: 'followUpDoctor', width: 90 },
  { title: '体重', key: 'weight', width: 80 },
  { title: '空腹血糖', key: 'fastingGlucose', width: 110 },
  { title: 'HbA1c', key: 'hba1c', width: 80 },
  { title: '饮食依从性', key: 'dietCompliance', width: 90 },
  { title: '运动依从性', key: 'exerciseCompliance', width: 90 },
  { title: '当前问题', key: 'currentIssues', width: 180 },
  { title: '下一步计划', key: 'nextPlan', width: 200 },
]

// ============================================================
// 初始化入口（由 NTabs @update:value 触发）
// ============================================================
function initCharts() {
  if (activeTab.value === 'overview') {
    initTab1Charts()
  }
}

// ============================================================
// Tab切换时重置图表（treatment-effects 模式：dispose + null + 重新init）
// ============================================================
watch(activeTab, async (newTab) => {
  await nextTick()
  if (newTab === 'overview') {
    barChart?.dispose()
    barChart = null
    pieChart?.dispose()
    pieChart = null
    initTab1Charts()
  }
})

// ============================================================
// 生命周期
// ============================================================
let resizeHandler: (() => void) | null = null

onMounted(() => {
  initTab1Charts()
  resizeHandler = () => {
    barChart?.resize()
    pieChart?.resize()
  }
  window.addEventListener('resize', resizeHandler, { passive: true })
})

onUnmounted(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  barChart?.dispose()
  pieChart?.dispose()
})
</script>

<template>
  <div class="lifestyle-page">
    <!-- ============================================================ -->
    <!-- 1. 顶部筛选栏 -->
    <!-- ============================================================ -->
    <NCard class="filter-card">
      <NSpace
        align="center"
        :size="16"
        :wrap="false"
      >
        <NSelect
          v-model:value="filters.stratification"
          :options="stratificationOptions"
          placeholder="患者分层"
          multiple
          :max-tag-count="1"
          style="width: 200px"
        />
        <NSelect
          v-model:value="filters.planStatus"
          :options="planStatusOptions"
          placeholder="方案状态"
          style="width: 130px"
        />
        <NSelect
          v-model:value="filters.timeRange"
          :options="timeRangeOptions"
          style="width: 120px"
        />
        <NInput
          v-model:value="filters.searchKeyword"
          placeholder="患者姓名/病历号"
          style="width: 170px"
          clearable
        />
        <NButton
          type="primary"
          @click="handleQuery"
          >查询</NButton
        >
        <NButton @click="handleReset">重置</NButton>
        <div style="flex: 1" />
        <NButton
          type="primary"
          @click="handleOpenNewPlan"
          >新建指导方案</NButton
        >
      </NSpace>
    </NCard>

    <!-- ============================================================ -->
    <!-- 2. 核心统计卡片 -->
    <!-- ============================================================ -->
    <div class="stat-cards">
      <NCard
        v-for="card in statCards"
        :key="card.title"
        class="stat-card"
      >
        <NStatistic
          :label="card.title"
          :value="card.value"
        >
          <template #suffix>
            <span
              :style="{
                color: cardChangeStyle(card.changeType).color,
                fontSize: '13px',
                marginLeft: '8px',
                fontWeight: 500,
              }"
              >{{ cardChangeStyle(card.changeType).icon }}{{ card.change }}</span
            >
          </template>
        </NStatistic>
      </NCard>
    </div>

    <!-- ============================================================ -->
    <!-- 3. Tab导航 + 内容区 -->
    <!-- ============================================================ -->
    <NCard>
      <NTabs
        v-model:value="activeTab"
        type="line"
        @update:value="initCharts"
      >
        <!-- Tab1: 指导方案总览 -->
        <NTabPane
          name="overview"
          tab="指导方案总览"
        >
          <div class="tab-content">
            <!-- 图表行 -->
            <div class="chart-row">
              <NCard
                title="不同患者分层方案覆盖情况"
                class="chart-card"
              >
                <div
                  ref="barChartRef"
                  class="chart-container"
                />
              </NCard>
              <NCard
                title="方案执行率分布"
                class="chart-card"
              >
                <div
                  ref="pieChartRef"
                  class="chart-container"
                />
              </NCard>
            </div>
            <!-- 表格行 -->
            <div class="table-row">
              <NCard
                title="未制定方案患者列表"
                class="table-card"
              >
                <NDataTable
                  :columns="unplannedColumns"
                  :data="unplannedPatients"
                  :pagination="{ pageSize: 8 }"
                  size="small"
                  :max-height="320"
                />
              </NCard>
              <NCard
                title="低执行率患者TOP20"
                class="table-card"
              >
                <NDataTable
                  :columns="lowExecColumns"
                  :data="lowExecutionPatients"
                  :pagination="{ pageSize: 8 }"
                  size="small"
                  :max-height="320"
                />
              </NCard>
            </div>
          </div>
        </NTabPane>

        <!-- Tab2: 个体化方案管理 -->
        <NTabPane
          name="plans"
          tab="个体化方案管理"
        >
          <NDataTable
            :columns="planColumns"
            :data="planList"
            :pagination="{ pageSize: 10 }"
            :scroll-x="1280"
            size="small"
          />
        </NTabPane>

        <!-- Tab3: 标准化指导库 -->
        <NTabPane
          name="library"
          tab="标准化指导库"
        >
          <NCollapse
            :default-expanded-names="['0']"
            accordion
          >
            <NCollapseItem
              v-for="(item, idx) in guidanceLibrary"
              :key="idx"
              :title="item.title"
              :name="String(idx)"
            >
              <div class="guidance-content">
                <p
                  v-for="(text, i) in item.content"
                  :key="i"
                  class="guidance-item"
                >
                  {{ text }}
                </p>
              </div>
            </NCollapseItem>
          </NCollapse>
        </NTabPane>

        <!-- Tab4: 执行情况跟踪 -->
        <NTabPane
          name="tracking"
          tab="执行跟踪"
        >
          <div class="tab-content">
            <!-- 执行统计卡片 -->
            <div
              class="stat-cards"
              style="margin-bottom: 16px"
            >
              <NCard
                v-for="card in executionStatCards"
                :key="card.title"
                class="stat-card"
              >
                <NStatistic
                  :label="card.title"
                  :value="card.value"
                >
                  <template #suffix>
                    <span
                      :style="{
                        color: cardChangeStyle(card.changeType).color,
                        fontSize: '13px',
                        marginLeft: '8px',
                        fontWeight: 500,
                      }"
                      >{{ cardChangeStyle(card.changeType).icon }}{{ card.change }}</span
                    >
                  </template>
                </NStatistic>
              </NCard>
            </div>
            <!-- 执行明细列表 -->
            <NCard title="执行情况明细">
              <NDataTable
                :columns="execColumns"
                :data="executionRecords"
                :pagination="{ pageSize: 10 }"
                :scroll-x="1400"
                size="small"
              />
            </NCard>
          </div>
        </NTabPane>
      </NTabs>
    </NCard>

    <!-- ============================================================ -->
    <!-- Tab2: 方案详情弹窗 -->
    <!-- ============================================================ -->
    <NModal
      v-model:show="detailModalVisible"
      preset="card"
      style="width: 820px; max-width: 95vw"
      :mask-closable="true"
    >
      <template #header>
        <div class="modal-header-centered">
          <div class="modal-title">{{ currentPlanDetail?.planNo }} 方案详情</div>
        </div>
      </template>
      <template #footer>
        <div class="detail-footer">
          <NButton @click="message.info('打印（仅样式）')">打印</NButton>
          <NButton
            type="primary"
            @click="detailModalVisible = false"
            >关闭弹窗</NButton
          >
        </div>
      </template>
      <div
        v-if="currentPlanDetail"
        class="plan-detail"
      >
        <!-- 患者基本信息 -->
        <div class="detail-section">
          <h3 class="section-title">患者基本信息</h3>
          <NDescriptions
            bordered
            :column="3"
            size="small"
          >
            <NDescriptionsItem label="患者姓名">{{
              currentPlanDetail.patientName
            }}</NDescriptionsItem>
            <NDescriptionsItem label="病历号">{{
              currentPlanDetail.medicalRecordNo
            }}</NDescriptionsItem>
            <NDescriptionsItem label="性别">{{ currentPlanDetail.gender }}</NDescriptionsItem>
            <NDescriptionsItem label="年龄">{{ currentPlanDetail.age }}岁</NDescriptionsItem>
            <NDescriptionsItem label="所属分层">
              <NTag size="small">{{ currentPlanDetail.stratification }}</NTag>
            </NDescriptionsItem>
            <NDescriptionsItem label="方案周期"
              >{{ currentPlanDetail.planPeriodStart }} 至
              {{ currentPlanDetail.planPeriodEnd }}</NDescriptionsItem
            >
            <NDescriptionsItem label="制定医生">{{
              currentPlanDetail.createDoctor
            }}</NDescriptionsItem>
            <NDescriptionsItem label="制定时间">{{
              currentPlanDetail.createTime
            }}</NDescriptionsItem>
          </NDescriptions>
        </div>
        <NDivider style="margin: 12px 0" />

        <!-- 饮食方案 -->
        <div class="detail-section">
          <h3 class="section-title">饮食方案</h3>
          <NDescriptions
            bordered
            :column="3"
            size="small"
          >
            <NDescriptionsItem label="每日总热量">{{
              currentPlanDetail.dietPlan.dailyCalorie
            }}</NDescriptionsItem>
            <NDescriptionsItem label="碳水化合物">{{
              currentPlanDetail.dietPlan.carbohydrate
            }}</NDescriptionsItem>
            <NDescriptionsItem label="蛋白质">{{
              currentPlanDetail.dietPlan.protein
            }}</NDescriptionsItem>
            <NDescriptionsItem label="脂肪">{{ currentPlanDetail.dietPlan.fat }}</NDescriptionsItem>
            <NDescriptionsItem
              label="三餐分配"
              :span="2"
              >{{ currentPlanDetail.dietPlan.mealDistribution }}</NDescriptionsItem
            >
          </NDescriptions>
          <p class="section-note">{{ currentPlanDetail.dietPlan.dietNotes }}</p>
        </div>
        <NDivider style="margin: 12px 0" />

        <!-- 运动方案 -->
        <div class="detail-section">
          <h3 class="section-title">运动方案</h3>
          <NDescriptions
            bordered
            :column="3"
            size="small"
          >
            <NDescriptionsItem
              label="运动类型"
              :span="2"
              >{{ currentPlanDetail.exercisePlan.exerciseType }}</NDescriptionsItem
            >
            <NDescriptionsItem label="运动频率">{{
              currentPlanDetail.exercisePlan.frequency
            }}</NDescriptionsItem>
            <NDescriptionsItem label="每次时长">{{
              currentPlanDetail.exercisePlan.duration
            }}</NDescriptionsItem>
            <NDescriptionsItem
              label="运动强度"
              :span="2"
              >{{ currentPlanDetail.exercisePlan.intensity }}</NDescriptionsItem
            >
          </NDescriptions>
          <p class="section-note">{{ currentPlanDetail.exercisePlan.exerciseNotes }}</p>
        </div>
        <NDivider style="margin: 12px 0" />

        <!-- 体重管理 -->
        <div class="detail-section">
          <h3 class="section-title">体重管理</h3>
          <NDescriptions
            bordered
            :column="4"
            size="small"
          >
            <NDescriptionsItem label="当前体重">{{
              currentPlanDetail.weightManagement.currentWeight
            }}</NDescriptionsItem>
            <NDescriptionsItem label="目标体重">{{
              currentPlanDetail.weightManagement.targetWeight
            }}</NDescriptionsItem>
            <NDescriptionsItem label="BMI">{{
              currentPlanDetail.weightManagement.bmi
            }}</NDescriptionsItem>
            <NDescriptionsItem label="体重目标">{{
              currentPlanDetail.weightManagement.weightGoal
            }}</NDescriptionsItem>
          </NDescriptions>
        </div>
        <NDivider style="margin: 12px 0" />

        <!-- 作息管理 -->
        <div class="detail-section">
          <h3 class="section-title">作息与睡眠管理</h3>
          <NDescriptions
            bordered
            :column="4"
            size="small"
          >
            <NDescriptionsItem label="建议入睡">{{
              currentPlanDetail.sleepManagement.sleepTime
            }}</NDescriptionsItem>
            <NDescriptionsItem label="建议起床">{{
              currentPlanDetail.sleepManagement.wakeTime
            }}</NDescriptionsItem>
            <NDescriptionsItem label="睡眠时长">{{
              currentPlanDetail.sleepManagement.sleepDuration
            }}</NDescriptionsItem>
          </NDescriptions>
          <p class="section-note">{{ currentPlanDetail.sleepManagement.sleepNotes }}</p>
        </div>
        <NDivider style="margin: 12px 0" />

        <!-- 戒烟限酒 -->
        <div class="detail-section">
          <h3 class="section-title">戒烟限酒</h3>
          <NDescriptions
            bordered
            :column="2"
            size="small"
          >
            <NDescriptionsItem label="吸烟状态">{{
              currentPlanDetail.habitManagement.smokingStatus
            }}</NDescriptionsItem>
            <NDescriptionsItem label="饮酒状态">{{
              currentPlanDetail.habitManagement.drinkingStatus
            }}</NDescriptionsItem>
          </NDescriptions>
          <p class="section-note">{{ currentPlanDetail.habitManagement.habitAdvice }}</p>
        </div>
        <NDivider style="margin: 12px 0" />

        <!-- 个性化建议 -->
        <div class="detail-section">
          <h3 class="section-title">个性化建议</h3>
          <p class="advice-text">{{ currentPlanDetail.personalizedAdvice }}</p>
        </div>
      </div>
      <NEmpty v-else />
    </NModal>

    <!-- ============================================================ -->
    <!-- Tab2: 新建/编辑方案抽屉 -->
    <!-- ============================================================ -->
    <NDrawer
      v-model:show="drawerVisible"
      placement="right"
      :width="520"
    >
      <NDrawerContent
        title="新建指导方案"
        closable
      >
        <div class="drawer-form">
          <div class="form-item">
            <label>患者选择</label>
            <NSelect
              v-model:value="newPlanForm.patientNo"
              :options="mockPatientsForSelect"
              placeholder="请选择患者"
              filterable
            />
          </div>
          <div class="form-item">
            <label>患者分层</label>
            <NSelect
              v-model:value="newPlanForm.stratification"
              :options="stratificationOptions"
              placeholder="请选择分层"
            />
          </div>
          <div class="form-item">
            <label>方案周期</label>
            <NSpace>
              <NInput
                v-model:value="newPlanForm.planPeriodStart"
                placeholder="开始日期"
                style="width: 150px"
              />
              <span>至</span>
              <NInput
                v-model:value="newPlanForm.planPeriodEnd"
                placeholder="结束日期"
                style="width: 150px"
              />
            </NSpace>
          </div>
          <div class="form-item">
            <label>制定医生</label>
            <NInput
              v-model:value="newPlanForm.doctor"
              placeholder="请输入医生姓名"
            />
          </div>
          <NDivider>方案内容</NDivider>
          <div class="form-item">
            <label>饮食建议</label>
            <NInput
              v-model:value="newPlanForm.dietAdvice"
              type="textarea"
              :rows="3"
              placeholder="请输入饮食指导建议"
            />
          </div>
          <div class="form-item">
            <label>运动建议</label>
            <NInput
              v-model:value="newPlanForm.exerciseAdvice"
              type="textarea"
              :rows="3"
              placeholder="请输入运动指导建议"
            />
          </div>
          <div class="form-item">
            <label>体重管理建议</label>
            <NInput
              v-model:value="newPlanForm.weightAdvice"
              type="textarea"
              :rows="3"
              placeholder="请输入体重管理建议"
            />
          </div>
          <div class="form-item">
            <label>个性化建议</label>
            <NInput
              v-model:value="newPlanForm.personalizedNote"
              type="textarea"
              :rows="3"
              placeholder="请输入个性化建议"
            />
          </div>
        </div>
        <template #footer>
          <NSpace>
            <NButton @click="drawerVisible = false">取消</NButton>
            <NButton @click="message.info('已保存草稿')">保存草稿</NButton>
            <NButton
              type="primary"
              @click="handleGeneratePlan"
              >生成并生效</NButton
            >
          </NSpace>
        </template>
      </NDrawerContent>
    </NDrawer>

    <!-- ============================================================ -->
    <!-- Tab4: 随访记录弹窗 -->
    <!-- ============================================================ -->
    <NModal
      v-model:show="followUpVisible"
      preset="card"
      title="随访记录"
      style="width: 900px; max-width: 95vw"
      :mask-closable="true"
    >
      <NDataTable
        :columns="followUpColumns"
        :data="followUpRecords"
        size="small"
        :max-height="400"
      />
      <div style="margin-top: 12px; text-align: right">
        <NButton
          type="primary"
          @click="followUpVisible = false"
          >关闭</NButton
        >
      </div>
    </NModal>
  </div>
</template>

<style scoped>
/* ================================================================
   CSS Variables — Refined Clinical Palette
   ================================================================ */
.lifestyle-page {
  /* --color-bg: #f0f4f8; */
  --color-surface: #ffffff;
  --color-primary: #0d9488;
  --color-primary-light: #ccfbf1;
  --color-primary-dark: #0f766e;
  --color-accent: #f97316;
  --color-accent-light: #ffedd5;
  --color-success: #10b981;
  --color-success-light: #d1fae5;
  --color-warning: #f59e0b;
  --color-warning-light: #fef3c7;
  --color-danger: #ef4444;
  --color-danger-light: #fee2e2;
  --color-text-primary: #1e293b;
  --color-text-secondary: #64748b;
  --color-text-muted: #94a3b8;
  --color-border: #e2e8f0;
  --color-border-light: #f1f5f9;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.09), 0 1px 3px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 6px 20px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.13), 0 6px 12px rgba(0, 0, 0, 0.08);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  padding: 20px 24px;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  background: var(--color-bg);
}

/* ================================================================
   1. 顶部筛选栏
   ================================================================ */
.filter-card {
  border: none;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  background: var(--color-surface);
}

.filter-card :deep(.n-card__content) {
  padding: 16px 20px;
}

/* ================================================================
   2. 核心统计卡片组
   ================================================================ */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  align-items: stretch;
}

.stat-card {
  position: relative;
  overflow: hidden;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  cursor: default;
  transition:
    box-shadow 0.25s ease,
    transform 0.25s ease;
  min-width: 0;
  width: 100%;
}

.stat-card :deep(.n-card) {
  width: 100%;
  height: 100%;
}

.stat-card :deep(.n-card__content) {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 24px;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

/* 每个卡片的accent bar颜色各不同 */
.stat-card:nth-child(1)::before {
  background: linear-gradient(90deg, var(--color-primary), #5eead4);
}
.stat-card:nth-child(2)::before {
  background: linear-gradient(90deg, var(--color-accent), #fbbf24);
}
.stat-card:nth-child(3)::before {
  background: linear-gradient(90deg, var(--color-success), #6ee7b7);
}
.stat-card:nth-child(4)::before {
  background: linear-gradient(90deg, var(--color-danger), #fca5a5);
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}

.stat-card :deep(.n-statistic .n-statistic-value) {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.5px;
}

.stat-card :deep(.n-statistic .n-statistic-label) {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 6px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

/* ================================================================
   3. Tab 导航 + 内容区
   ================================================================ */
.lifestyle-page > :deep(.n-card) {
  border: none;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  background: var(--color-surface);
}

:deep(.n-tabs-nav) {
  font-weight: 600;
}

:deep(.n-tab-pane) {
  padding-bottom: 28px;
}

/* ================================================================
   4. Tab1: 图表行
   ================================================================ */
.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.chart-card {
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease;
  overflow: hidden;
  min-width: 0;
  width: 100%;
}

.chart-card:hover {
  box-shadow: var(--shadow-md);
}

.chart-card :deep(.n-card-header) {
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--color-border-light);
}

.chart-card :deep(.n-card-header__main) {
  font-weight: 600;
  font-size: 15px;
  color: var(--color-text-primary);
}

.chart-card :deep(.n-card__content) {
  padding: 16px 20px;
}

.chart-container {
  width: 100%;
  height: 280px;
}

/* ================================================================
   5. Tab1: 表格行
   ================================================================ */
.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.table-card {
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease;
  min-width: 0;
  width: 100%;
}

.table-card:hover {
  box-shadow: var(--shadow-md);
}

.table-card :deep(.n-card-header) {
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--color-border-light);
}

.table-card :deep(.n-card-header__main) {
  font-weight: 600;
  font-size: 15px;
  color: var(--color-text-primary);
}

.table-card :deep(.n-card__content) {
  padding: 0;
}

/* ================================================================
   6. Tab3: 标准化指导库
   ================================================================ */
.guidance-content {
  line-height: 2;
}

.guidance-item {
  margin-bottom: 8px;
  color: var(--color-text-secondary);
  font-size: 14px;
  padding-left: 12px;
  position: relative;
}

.guidance-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-primary);
}

:deep(.n-collapse-item__header) {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-primary);
}

/* ================================================================
   7. 方案详情弹窗
   ================================================================ */
.plan-detail {
  max-height: 65vh;
  overflow-y: auto;
  padding-right: 4px;
}

.plan-detail::-webkit-scrollbar {
  width: 4px;
}
.plan-detail::-webkit-scrollbar-track {
  background: var(--color-border-light);
  border-radius: 2px;
}
.plan-detail::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

.detail-section {
  margin-bottom: 4px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 12px 0 14px;
  padding-left: 10px;
  border-left: 3px solid var(--color-primary);
  letter-spacing: 0.5px;
}

.section-note {
  margin-top: 10px;
  padding: 10px 14px;
  background: var(--color-primary-light);
  border-radius: var(--radius-sm);
  color: var(--color-primary-dark);
  font-size: 13px;
  line-height: 1.7;
  border-left: 3px solid var(--color-primary);
}

.advice-text {
  padding: 14px 16px;
  background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
  border-left: 4px solid var(--color-primary);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  color: var(--color-text-primary);
  font-size: 14px;
  line-height: 1.8;
}

.detail-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--color-border);
}

.modal-header-centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
}

/* ================================================================
   8. 新建方案抽屉
   ================================================================ */
.drawer-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.3px;
}

.drawer-form :deep(.n-divider) {
  margin: 4px 0;
}

/* ================================================================
   9. 全局滚动条
   ================================================================ */
.lifestyle-page::-webkit-scrollbar {
  width: 6px;
}
.lifestyle-page::-webkit-scrollbar-track {
  background: transparent;
}
.lifestyle-page::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

/* ================================================================
   10. 按钮 & 标签细节增强
   ================================================================ */

:deep(.n-tag) {
  font-weight: 500;
}

/* ================================================================
   11. 弹窗 & 抽屉的 Naive UI 深層覆蓋
   ================================================================ */
:deep(.n-modal) {
  border-radius: var(--radius-md);
}

:deep(.n-card) {
  border-radius: var(--radius-md);
}

:deep(.n-drawer) {
  border-radius: var(--radius-md) 0 0 var(--radius-md);
}

:deep(.n-data-table) {
  font-size: 13px;
}

:deep(.n-data-table th) {
  font-weight: 600 !important;
  color: var(--color-text-secondary) !important;
  font-size: 12px !important;
  letter-spacing: 0.5px;
}

:deep(.n-data-table td) {
  color: var(--color-text-primary);
}

/* ================================================================
   12. 响应式
   ================================================================ */
@media (max-width: 1200px) {
  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .chart-row,
  .table-row {
    grid-template-columns: 1fr;
  }
}
</style>
