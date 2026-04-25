<script setup lang="ts">
import { h, ref, nextTick, onMounted, onUnmounted, watch, reactive } from 'vue'
import { ScrollContainer } from '@/components'
import type { ECharts } from 'echarts'
import {
  NCard,
  NTabs,
  NTabPane,
  NDataTable,
  NModal,
  NButton,
  NInput,
  NSpace,
  NTag,
  NStatistic,
  NSelect,
  NDescriptions,
  NDescriptionsItem,
  NCollapse,
  NCollapseItem,
  NGrid,
  NGi,
  NDivider,
  type DataTableColumns,
} from 'naive-ui'
import { useMessage } from 'naive-ui'
import * as echarts from 'echarts'
import type { MedicationPlan, PlanDetail, ExecutionRecord, FollowUpRecord } from './mock/types'
import {
  statCards,
  coverageBarData,
  drugTypePieData,
  // unplannedPatients,
  riskPatients,
  planList as initialPlanList,
  generatePlanDetail,
  medicationTemplates,
  executionStatCards,
  executionRecords,
  generateFollowUpRecords,
  generateNewPlan,
  patientCategories,
} from './mock/data'
import {
  getDashboardData,
  getPlanDetail,
  getPlanList,
  getUnplannedPatients,
} from '@/api/personalizedMedication'
import MedicationDrawer from './MedicationDrawer.vue'

defineOptions({ name: 'PersonalizedMedication' })

const message = useMessage()

// ============================================================
// 筛选条件
// ============================================================
const activeTab = ref('overview')
const stratificationFilter = ref<string[]>([])
const statusFilter = ref<string | null>(null)
const timeRangeFilter = ref<string | null>('近3个月')
const searchText = ref('')

const stratificationOptions = patientCategories.map((c) => ({ label: c, value: c }))
const statusOptions = [
  { label: '全部', value: '全部' },
  { label: '未制定', value: '未制定' },
  { label: '生效中', value: '生效中' },
  { label: '已过期', value: '已过期' },
  { label: '已归档', value: '已归档' },
]
const timeRangeOptions = [
  { label: '近1个月', value: '近1个月' },
  { label: '近3个月', value: '近3个月' },
  { label: '近6个月', value: '近6个月' },
]

// ============================================================
// Tab2 方案主列表
// ============================================================
// const tableData = ref<MedicationPlan[]>([...initialPlanList])
const dashBoardData = ref({
  totalCoverCount: 0,
  monthPlanCount: 0,
})
const handleGetDashboardData = async () => {
  const { code, data } = await getDashboardData()
  if (code === 200) {
    dashBoardData.value = data
  }
}

const tableData = ref([])
const searchParams = reactive({
  // startDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
  // endDate: dayjs().format('YYYY-MM-DD'),
  pageNum: 1,
  pageSize: 10,
})
const getMedicationPlanList = async () => {
  const { code, data } = await getPlanList(searchParams)
  if (code === 200) {
    tableData.value = data.list
  }
}
function getStatusType(status: string) {
  switch (status) {
    case 1:
      return 'warning'
    case 2:
      return 'success'
    case 3:
      return 'error'
    default:
      return 'default'
  }
}

const unplannedPatients = ref()
const handleGetUnplannedPatients = async () => {
  const { code, data } = await getUnplannedPatients()
  if (code === 200) {
    unplannedPatients.value = data.list
  }
}

function getGradeType(grade: string) {
  switch (grade) {
    case '规范':
      return 'success'
    case '基本规范':
      return 'warning'
    case '不规范':
      return 'error'
    default:
      return 'default'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 1:
      return '草稿'
    case 2:
      return '已生效'
    case 3:
      return '已失效'
    default:
      return 'default'
  }
}

const columns: DataTableColumns<MedicationPlan> = [
  { title: '方案编号', key: 'id', width: 150 },
  { title: '病历号', key: 'patientId', width: 120 },
  { title: '患者姓名', key: 'patientName', width: 90 },
  // { title: '性别', key: '性别', width: 55 },
  // { title: '年龄', key: '年龄', width: 60 },
  { title: 'Hba1c目标', key: 'hba1cTarget', width: 80 },
  { title: '空腹血糖控制目标', key: 'fastingBloodSugarTarget', width: 120 },
  // { title: '所属分层', key: '所属分层', width: 110 },
  { title: '方案周期', key: 'planCycle', width: 200, ellipsis: { tooltip: true } },
  // { title: '制定医生', key: 'creator', width: 90 },
  {
    title: '方案状态',
    key: '方案状态',
    width: 90,
    render(row) {
      return h(
        NTag,
        { type: getStatusType(row.status), size: 'small' },
        { default: () => getStatusText(row.status) },
      )
    },
  },
  // {
  //   title: '规范评级',
  //   key: '规范评级',
  //   width: 90,
  //   render(row) {
  //     return h(
  //       NTag,
  //       { type: getGradeType(row.规范评级), size: 'small' },
  //       { default: () => row.规范评级 },
  //     )
  //   },
  // },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right',
    render(row) {
      const btns = []
      if (row.status === 2) {
        btns.push(
          h(
            NButton,
            { type: 'primary', size: 'tiny', text: true, onClick: () => openDetail(row) },
            { default: () => '查看详情' },
          ),
          h(
            NButton,
            { type: 'info', size: 'tiny', text: true, onClick: () => openEditDrawer(row) },
            { default: () => '编辑' },
          ),
          h(
            NButton,
            { type: 'warning', size: 'tiny', text: true, onClick: () => {} },
            { default: () => '归档' },
          ),
        )
      } else if (row.方案状态 === '已归档') {
        btns.push(
          h(
            NButton,
            { type: 'primary', size: 'tiny', text: true, onClick: () => openDetail(row) },
            { default: () => '查看详情' },
          ),
        )
      } else if (row.方案状态 === '已过期') {
        btns.push(
          h(
            NButton,
            { type: 'primary', size: 'tiny', text: true, onClick: () => openDetail(row) },
            { default: () => '查看详情' },
          ),
          h(
            NButton,
            { type: 'info', size: 'tiny', text: true, onClick: () => openEditDrawer(row) },
            { default: () => '续期' },
          ),
        )
      }
      return h(NSpace, { size: 4 }, { default: () => btns })
    },
  },
]

// ============================================================
// 方案详情弹窗
// ============================================================
const detailModalVisible = ref(false)
const currentDetail = ref<PlanDetail | null>(null)

async function openDetail(plan: MedicationPlan) {
  console.log('=============================')
  // currentDetail.value = generatePlanDetail(plan)
  // currentDetail.value = plan
  const { code, data } = await getPlanDetail(plan.id)
  if (code === 200) {
    currentDetail.value = data
    console.log(currentDetail.value, ' currentDetail.value===')
  }

  detailModalVisible.value = true
}

// ============================================================
// 新建/编辑方案抽屉
// ============================================================
const drawerVisible = ref(false)
const currentEditPlan = ref<MedicationPlan | null>(null)

const currentPatientZyh = ref('')
function openCreateDrawer(row?: any) {
  currentEditPlan.value = null
  currentPatientZyh.value = row?.zyh || ''
  drawerVisible.value = true
}

async function openEditDrawer(plan: MedicationPlan) {
  console.log(plan, 'plan=====')
  const { code, data } = await getPlanDetail(plan.id)
  if (code === 200) {
    currentEditPlan.value = data
    drawerVisible.value = true
  }
}

function handleDrawerSuccess() {
  const newPlan = generateNewPlan('新建患者')
  tableData.value.unshift(newPlan)
  message.success('方案生成并生效成功')
}

// ============================================================
// Tab4 随访记录弹窗
// ============================================================
const followUpVisible = ref(false)
const followUpRecords = ref<FollowUpRecord[]>([])

const followUpColumns: DataTableColumns<FollowUpRecord> = [
  { title: '随访日期', key: '随访日期', width: 110 },
  { title: '随访类型', key: '随访类型', width: 100 },
  { title: '随访医生', key: '随访医生', width: 80 },
  { title: '空腹血糖', key: '空腹血糖', width: 100 },
  { title: '餐后2h血糖', key: '餐后2h血糖', width: 110 },
  { title: 'HbA1c', key: 'HbA1c', width: 80 },
  { title: '用药依从性', key: '用药依从性', width: 90 },
  { title: '方案执行情况', key: '方案执行情况', width: 160, ellipsis: { tooltip: true } },
  { title: '不良反应', key: '不良反应', width: 100 },
  { title: '调整建议', key: '调整建议', width: 180, ellipsis: { tooltip: true } },
  { title: '下次随访计划', key: '下次随访计划', width: 110 },
]

function openFollowUp(record: ExecutionRecord) {
  followUpRecords.value = generateFollowUpRecords(record.患者姓名, record.病历号)
  followUpVisible.value = true
}

// Tab4 执行明细操作列
const executionColumns: DataTableColumns<ExecutionRecord> = [
  { title: '方案编号', key: '方案编号', width: 150 },
  { title: '患者姓名', key: '患者姓名', width: 80 },
  { title: '病历号', key: '病历号', width: 120 },
  { title: '所属分层', key: '所属分层', width: 100 },
  {
    title: '方案状态',
    key: '方案状态',
    width: 80,
    render(row) {
      return h(
        NTag,
        { type: getStatusType(row.方案状态), size: 'small' },
        { default: () => row.方案状态 },
      )
    },
  },
  {
    title: '依从性评分',
    key: '依从性评分',
    width: 90,
    render(row) {
      const type = row.依从性评分 >= 80 ? 'success' : row.依从性评分 >= 60 ? 'warning' : 'error'
      return h(NTag, { type, size: 'small' }, { default: () => `${row.依从性评分}分` })
    },
  },
  { title: '漏服次数', key: '漏服次数', width: 80 },
  { title: '最近随访日期', key: '最近随访日期', width: 110 },
  { title: '随访医生', key: '随访医生', width: 80 },
  { title: '不良反应', key: '不良反应', width: 100 },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render(row) {
      return h(
        NButton,
        { type: 'primary', size: 'tiny', text: true, onClick: () => openFollowUp(row) },
        { default: () => '随访记录' },
      )
    },
  },
]

// ============================================================
// ECharts - Tab1 图表
// ============================================================
const barChartRef = ref<HTMLElement | null>(null)
const pieChartRef = ref<HTMLElement | null>(null)
let barChart: ECharts | null = null
let pieChart: ECharts | null = null

function initTab1Charts() {
  if (barChartRef.value && !barChart) {
    barChart = echarts.init(barChartRef.value)
    barChart.setOption({
      title: {
        text: '不同患者分层方案覆盖情况',
        left: 'center',
        textStyle: { fontSize: 14, fontWeight: 600 },
      },
      tooltip: { trigger: 'axis' },
      legend: { bottom: 10, data: ['患者总数', '已覆盖'] },
      grid: { top: 55, left: 50, right: 30, bottom: 60 },
      xAxis: {
        type: 'category',
        data: coverageBarData.map((d) => d.分层),
        axisLabel: { rotate: 0 },
      },
      yAxis: { type: 'value', name: '人数' },
      series: [
        {
          name: '患者总数',
          type: 'bar',
          data: coverageBarData.map((d) => d.患者总数),
          itemStyle: { color: '#818cf8' },
          barWidth: 28,
        },
        {
          name: '已覆盖',
          type: 'bar',
          data: coverageBarData.map((d) => d.已覆盖),
          itemStyle: { color: '#409EFF' },
          barWidth: 28,
        },
      ],
    })
  }
  if (pieChartRef.value && !pieChart) {
    pieChart = echarts.init(pieChartRef.value)
    pieChart.setOption({
      title: {
        text: '降糖药物使用类型分布',
        left: 'center',
        textStyle: { fontSize: 14, fontWeight: 600 },
      },
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { orient: 'vertical', left: 'left', top: 'middle' },
      series: [
        {
          type: 'pie',
          radius: ['35%', '65%'],
          center: ['60%', '55%'],
          data: drugTypePieData,
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.2)' },
          },
          label: { formatter: '{b}\n{d}%' },
        },
      ],
    })
  }
}

function disposeTab1Charts() {
  barChart?.dispose()
  barChart = null
  pieChart?.dispose()
  pieChart = null
}

// 初始化入口
function initCharts() {
  if (activeTab.value === 'overview') {
    initTab1Charts()
  }
}

// Tab切换时重置图表
watch(activeTab, async (newTab) => {
  await nextTick()
  if (newTab === 'overview') {
    disposeTab1Charts()
    initTab1Charts()
  }
})

// ============================================================
// 用药明细弹窗表格列
// ============================================================
const medDetailColumns: DataTableColumns<{
  drugName: string
  usageDosage: string
  frequency: string
}> = [
  { title: '药物名称', key: 'drugName', width: 140 },
  { title: '用法用量', key: 'usageDosage', width: 120 },
  { title: '频次', key: 'frequency', width: 100 },
]

// ============================================================
// 生命周期
// ============================================================
onMounted(() => {
  nextTick(() => {
    initTab1Charts()
  })
  getMedicationPlanList()
  handleGetDashboardData()
  handleGetUnplannedPatients()
})

onUnmounted(() => {
  disposeTab1Charts()
})
</script>

<template>
  <ScrollContainer wrapper-class="flex flex-col gap-y-4 max-sm:gap-y-2 personalized-medication">
    <div class="">
      <!-- ============================================================ -->
      <!-- 1. 顶部筛选栏 -->
      <!-- ============================================================ -->
      <NCard
        class="filter-card"
        :bordered="false"
      >
        <NSpace
          align="center"
          :wrap="true"
          :size="16"
        >
          <NSpace
            align="center"
            :size="8"
          >
            <span class="filter-label">患者分层</span>
            <NSelect
              v-model:value="stratificationFilter"
              :options="stratificationOptions"
              multiple
              placeholder="全部"
              style="width: 240px"
              size="small"
            />
          </NSpace>
          <NSpace
            align="center"
            :size="8"
          >
            <span class="filter-label">方案状态</span>
            <NSelect
              v-model:value="statusFilter"
              :options="statusOptions"
              placeholder="全部"
              style="width: 120px"
              size="small"
            />
          </NSpace>
          <NSpace
            align="center"
            :size="8"
          >
            <span class="filter-label">时间范围</span>
            <NSelect
              v-model:value="timeRangeFilter"
              :options="timeRangeOptions"
              style="width: 120px"
              size="small"
            />
          </NSpace>
          <NInput
            v-model:value="searchText"
            placeholder="患者姓名/病历号"
            style="width: 160px"
            size="small"
            clearable
          />
          <NButton
            type="primary"
            size="small"
            >查询</NButton
          >
          <NButton size="small">重置</NButton>
          <NButton
            type="primary"
            size="small"
            @click="openCreateDrawer"
            >新建用药方案</NButton
          >
        </NSpace>
      </NCard>

      <!-- ============================================================ -->
      <!-- 2. 核心统计卡片组 -->
      <!-- ============================================================ -->
      <div class="stat-cards">
        <!-- <NCard
          v-for="card in statCards"
          :key="card.title"
          class="stat-card"
          :bordered="false"
        >
          <NStatistic
            :value="card.value"
            :label="card.title"
          >
            <template #suffix>
              <span
                class="stat-change"
                :class="
                  card.changeType === 'increase'
                    ? 'positive'
                    : card.changeType === 'decrease'
                      ? 'negative'
                      : 'neutral'
                "
              >
                {{ card.change.startsWith('+') ? '↑' : card.change.startsWith('-') ? '↓' : ''
                }}{{ card.change }}
              </span>
            </template>
            <template
              #suffix
              v-if="typeof card.value === 'string' && card.value.includes('%')"
            ></template>
          </NStatistic>
        </NCard> -->
        <NCard class="stat-card">
          <NStatistic
            label="方案覆盖总人数"
            :value="dashBoardData.totalCoverCount ?? '-'"
          >
          </NStatistic>
        </NCard>
        <NCard class="stat-card">
          <NStatistic
            label="本月新建方案数"
            :value="dashBoardData.monthPlanCount ?? '-'"
          >
          </NStatistic>
        </NCard>
      </div>

      <!-- ============================================================ -->
      <!-- 3. Tab导航 + 内容区 -->
      <!-- ============================================================ -->
      <NCard
        class="main-content"
        :bordered="false"
      >
        <NTabs
          v-model:value="activeTab"
          type="line"
          animated
          @update:value="initCharts"
        >
          <!-- Tab1: 用药方案总览 -->
          <NTabPane
            name="overview"
            tab="未制定方案患者列表"
          >
            <NDataTable
              :columns="[
                // { title: '患者姓名', key: '患者姓名', width: 80 },
                { title: '病历号', key: 'zyh', width: 110 },
                { title: '姓名', key: 'name', width: 60 },
                { title: '年龄', key: 'age', width: 60 },
                // { title: '所属分层', key: '所属分层', width: 100 },
                // { title: '最近HbA1c', key: '最近HbA1c', width: 90 },
                {
                  title: '操作',
                  key: 'actions',
                  width: 90,
                  render(row) {
                    return h(
                      NButton,
                      {
                        type: 'primary',
                        size: 'tiny',
                        text: true,
                        onClick: () => openCreateDrawer(row),
                      },
                      { default: () => '新建方案' },
                    )
                  },
                },
              ]"
              :data="unplannedPatients"
              :pagination="{ pageSize: 5 }"
              size="small"
              :max-height="320"
            />
          </NTabPane>

          <!-- Tab2: 个体化方案管理 -->
          <NTabPane
            name="management"
            tab="个体化方案管理"
          >
            <NDataTable
              :columns="columns"
              :data="tableData"
              :pagination="{ pageSize: 10 }"
              :scroll-x="1200"
              size="small"
              :max-height="560"
            />
          </NTabPane>

          <!-- Tab3: 标准化用药模板库 -->
          <NTabPane
            name="templates"
            tab="标准化用药模板库"
          >
            <div class="template-section">
              <div class="template-note">
                基于《中国2型糖尿病防治指南2024版》整理，仅供临床用药参考，不作为处方依据
              </div>
              <NCollapse :default-expanded-names="['t1']">
                <NCollapseItem
                  v-for="(tpl, idx) in medicationTemplates"
                  :key="idx"
                  :title="tpl.分层名称"
                  :name="`t${idx}`"
                >
                  <div class="tpl-content">
                    <p><strong>适用人群：</strong>{{ tpl.适用人群 }}</p>
                    <p><strong>推荐用药方案：</strong>{{ tpl.推荐用药方案 }}</p>
                    <p><strong>一线药物选择：</strong></p>
                    <ul>
                      <li
                        v-for="d in tpl.一线药物选择"
                        :key="d"
                      >
                        {{ d }}
                      </li>
                    </ul>
                    <p><strong>二线药物选择：</strong></p>
                    <ul>
                      <li
                        v-for="d in tpl.二线药物选择"
                        :key="d"
                      >
                        {{ d }}
                      </li>
                    </ul>
                    <p><strong>联合用药原则：</strong>{{ tpl.联合用药原则 }}</p>
                    <p><strong>禁用药物：</strong></p>
                    <ul>
                      <li
                        v-for="d in tpl.禁用药物"
                        :key="d"
                        style="color: #f56c6c"
                      >
                        {{ d }}
                      </li>
                    </ul>
                    <p><strong>特殊注意事项：</strong></p>
                    <ul>
                      <li
                        v-for="n in tpl.特殊注意事项"
                        :key="n"
                      >
                        {{ n }}
                      </li>
                    </ul>
                    <p><strong>随访监测要求：</strong>{{ tpl.随访监测要求 }}</p>
                    <p><strong>控糖目标参考：</strong>{{ tpl.控糖目标参考 }}</p>
                  </div>
                </NCollapseItem>
              </NCollapse>
            </div>
          </NTabPane>

          <!-- Tab4: 用药安全与随访 -->
          <NTabPane
            name="safety"
            tab="用药安全与随访"
          >
            <div class="tab-content">
              <!-- 4张执行统计卡片 -->
              <div class="exec-cards">
                <NCard
                  v-for="card in executionStatCards"
                  :key="card.title"
                  :bordered="false"
                  class="exec-card"
                >
                  <div class="exec-card-value">
                    <span class="exec-num">{{ card.value }}</span>
                    <span
                      v-if="card.title.includes('率')"
                      class="exec-unit"
                      >%</span
                    >
                  </div>
                  <div class="exec-card-title">{{ card.title }}</div>
                  <div class="exec-card-sub">{{ card.subtitle }}</div>
                  <div
                    class="stat-change"
                    :class="card.changeType === 'increase' ? 'positive' : 'negative'"
                  >
                    {{ card.change.startsWith('+') ? '↑' : '↓' }}{{ card.change }}
                  </div>
                </NCard>
              </div>

              <!-- 用药执行与随访明细列表 -->
              <NCard
                title="用药执行与随访明细"
                :bordered="false"
              >
                <NDataTable
                  :columns="executionColumns"
                  :data="executionRecords"
                  :pagination="{ pageSize: 10 }"
                  :scroll-x="1200"
                  size="small"
                  :max-height="450"
                />
              </NCard>
            </div>
          </NTabPane>
        </NTabs>
      </NCard>

      <!-- ============================================================ -->
      <!-- 方案详情弹窗 -->
      <!-- ============================================================ -->
      <NModal
        v-model:show="detailModalVisible"
        preset="card"
        title="用药方案详情"
        style="width: 960px; max-width: 95vw"
        :mask-closable="true"
      >
        <template v-if="currentDetail">
          <div class="plan-detail">
            <!-- 一、患者基本信息 -->
            <div class="detail-section">
              <div class="section-title">一、患者基本信息</div>
              <NDescriptions
                :column="3"
                label-placement="left"
                size="small"
                bordered
              >
                <NDescriptionsItem label="患者姓名">{{
                  currentDetail.patientName
                }}</NDescriptionsItem>
                <!-- <NDescriptionsItem label="性别">{{
                  currentDetail.basicInfo.性别
                }}</NDescriptionsItem> -->
                <!-- <NDescriptionsItem label="年龄"
                  >{{ currentDetail.basicInfo.年龄 }}岁</NDescriptionsItem
                > -->
                <!-- <NDescriptionsItem label="病历号">{{
                  currentDetail.basicInfo.病历号
                }}</NDescriptionsItem> -->
                <!-- <NDescriptionsItem label="所属分层">
                  <NTag size="small">{{ currentDetail.所属分层 }}</NTag>
                </NDescriptionsItem>
                <NDescriptionsItem label="糖尿病类型">{{
                  currentDetail.basicInfo.糖尿病类型
                }}</NDescriptionsItem> -->
                <NDescriptionsItem label="方案编号">{{ currentDetail.id }}</NDescriptionsItem>
                <NDescriptionsItem label="方案状态">
                  <NTag
                    :type="getStatusType(currentDetail.status)"
                    size="small"
                    >{{ getStatusText(currentDetail.status) }}</NTag
                  >
                </NDescriptionsItem>
                <!-- <NDescriptionsItem label="制定医生">{{
                  currentDetail.basicInfo.制定医生
                }}</NDescriptionsItem> -->
                <NDescriptionsItem
                  label="方案周期"
                  :span="2"
                  >{{ `${currentDetail.startTime}至${currentDetail.endTime}` }}</NDescriptionsItem
                >
                <NDescriptionsItem label="制定日期">{{
                  currentDetail.createTime
                }}</NDescriptionsItem>
              </NDescriptions>
            </div>

            <!-- 二、控糖目标展示 -->
            <div class="detail-section">
              <div class="section-title">二、控糖目标展示</div>
              <!-- <div class="section-note">以下控糖目标仅供参考展示，不做制定功能</div> -->
              <NDescriptions
                :column="3"
                label-placement="left"
                size="small"
                bordered
              >
                <NDescriptionsItem label="HbA1c目标">{{
                  currentDetail.hba1cTarget
                }}</NDescriptionsItem>
                <NDescriptionsItem label="空腹血糖目标">{{
                  currentDetail.fastingBloodSugarTarget
                }}</NDescriptionsItem>
              </NDescriptions>
            </div>

            <!-- 三、当前用药方案 -->
            <div class="detail-section">
              <div class="section-title">三、当前用药方案</div>
              <!-- <div class="advice-text">{{ currentDetail.currentMedication.用药方案概述 }}</div> -->
              <div style="margin-top: 12px">
                <NDataTable
                  :columns="medDetailColumns"
                  :data="currentDetail.detailList"
                  :pagination="false"
                  size="small"
                  bordered
                />
              </div>
              <!-- <NDescriptions
                :column="2"
                label-placement="left"
                size="small"
                style="margin-top: 12px"
                bordered
              >
                <NDescriptionsItem label="用药时长">{{
                  currentDetail.currentMedication.用药时长
                }}</NDescriptionsItem>
                <NDescriptionsItem label="依从性评估">{{
                  currentDetail.currentMedication.依从性评估
                }}</NDescriptionsItem>
              </NDescriptions> -->
            </div>

            <!-- 四、方案规范评级依据 -->
            <!-- <div class="detail-section">
              <div class="section-title">四、方案规范评级依据</div>
              <NDescriptions
                :column="1"
                label-placement="left"
                size="small"
                bordered
              >
                <NDescriptionsItem label="规范评级">
                  <NTag
                    :type="getGradeType(currentDetail.complianceAssessment.规范评级)"
                    size="small"
                    >{{ currentDetail.complianceAssessment.规范评级 }}</NTag
                  >
                </NDescriptionsItem>
                <NDescriptionsItem label="评级依据">
                  <ul style="margin: 0; padding-left: 16px; line-height: 1.8">
                    <li
                      v-for="item in currentDetail.complianceAssessment.评级依据"
                      :key="item"
                    >
                      {{ item }}
                    </li>
                  </ul>
                </NDescriptionsItem>
                <NDescriptionsItem label="指南推荐方案">{{
                  currentDetail.complianceAssessment.指南推荐方案
                }}</NDescriptionsItem>
                <NDescriptionsItem label="与指南差异">{{
                  currentDetail.complianceAssessment.与指南差异
                }}</NDescriptionsItem>
              </NDescriptions>
            </div> -->

            <!-- 五、用药安全提示 -->
            <!-- <div class="detail-section">
              <div class="section-title">五、用药安全提示</div>
              <NDescriptions
                :column="1"
                label-placement="left"
                size="small"
                bordered
              >
                <NDescriptionsItem label="肝功能状态">{{
                  currentDetail.safetyAlerts.肝功能状态
                }}</NDescriptionsItem>
                <NDescriptionsItem label="肾功能状态">{{
                  currentDetail.safetyAlerts.肾功能状态
                }}</NDescriptionsItem>
                <NDescriptionsItem label="低血糖风险评估">{{
                  currentDetail.safetyAlerts.低血糖风险评估
                }}</NDescriptionsItem>
                <NDescriptionsItem label="药物相互作用提示">{{
                  currentDetail.safetyAlerts.药物相互作用提示
                }}</NDescriptionsItem>
                <NDescriptionsItem label="禁忌症排查">{{
                  currentDetail.safetyAlerts.禁忌症排查
                }}</NDescriptionsItem>
                <NDescriptionsItem label="不良反应记录">{{
                  currentDetail.safetyAlerts.不良反应记录
                }}</NDescriptionsItem>
              </NDescriptions>
            </div> -->

            <!-- 六、方案调整记录 -->
            <!-- <div class="detail-section">
              <div class="section-title">六、方案调整记录</div>
              <NDataTable
                :columns="[
                  { title: '调整日期', key: '调整日期', width: 110 },
                  { title: '调整原因', key: '调整原因', width: 150 },
                  { title: '调整内容', key: '调整内容' },
                  { title: '调整医生', key: '调整医生', width: 80 },
                ]"
                :data="currentDetail.adjustmentHistory"
                :pagination="false"
                size="small"
                bordered
              />
            </div> -->

            <!-- 七、随访计划 -->
            <!-- <div class="detail-section">
              <div class="section-title">七、随访计划</div>
              <NDescriptions
                :column="2"
                label-placement="left"
                size="small"
                bordered
              >
                <NDescriptionsItem label="下次随访日期">{{
                  currentDetail.followUpPlan.下次随访日期
                }}</NDescriptionsItem>
                <NDescriptionsItem label="随访频次">{{
                  currentDetail.followUpPlan.随访频次
                }}</NDescriptionsItem>
                <NDescriptionsItem label="随访监测指标">
                  <NSpace
                    :size="4"
                    :wrap="true"
                  >
                    <NTag
                      v-for="item in currentDetail.followUpPlan.随访监测指标"
                      :key="item"
                      size="small"
                      type="info"
                      >{{ item }}</NTag
                    >
                  </NSpace>
                </NDescriptionsItem>
                <NDescriptionsItem label="备注">{{
                  currentDetail.followUpPlan.备注
                }}</NDescriptionsItem>
              </NDescriptions>
            </div> -->
          </div>
        </template>
        <template #footer>
          <!-- 底部按钮 -->
          <div class="detail-footer">
            <!-- <NButton>打印</NButton> -->
            <NButton
              type="primary"
              @click="detailModalVisible = false"
              >关闭</NButton
            >
          </div>
        </template>
      </NModal>

      <MedicationDrawer
        v-model:show="drawerVisible"
        :patientId="currentPatientZyh"
        :plan="currentEditPlan"
        @success="handleDrawerSuccess"
      />

      <!-- ============================================================ -->
      <!-- Tab4 随访记录弹窗 -->
      <!-- ============================================================ -->
      <NModal
        v-model:show="followUpVisible"
        preset="card"
        title="随访记录"
        style="width: 1500px; max-width: 96vw"
        :mask-closable="true"
      >
        <NDataTable
          :columns="followUpColumns"
          :data="followUpRecords"
          size="small"
          :max-height="400"
          :scroll-x="1400"
        />
      </NModal>
    </div>
  </ScrollContainer>
</template>

<style scoped>
.personalized-medication {
  padding: 20px 24px;
  background: linear-gradient(160deg, #f0f4f8 0%, #f5f7fa 100%);
  min-height: calc(100vh - 60px);
  max-height: 100%;
  overflow-y: auto;
}

/* 筛选栏 - 医疗级卡片 */
.filter-card {
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow:
    0 2px 8px rgba(64, 158, 255, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(64, 158, 255, 0.08);
}

.filter-card :deep(.n-card__content) {
  padding: 14px 20px;
}

.filter-label {
  font-size: 13px;
  font-weight: 500;
  color: #4a5568;
  white-space: nowrap;
  letter-spacing: 0.01em;
}

/* 统计卡片 - 医疗蓝绿渐变体系 */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  box-shadow:
    0 2px 12px rgba(64, 158, 255, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.9);
  background: #ffffff;
  transition:
    box-shadow 0.25s ease,
    transform 0.25s ease;
  cursor: default;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 14px 14px 0 0;
}

.stat-card:nth-child(1)::before {
  background: linear-gradient(90deg, #0ea5e9, #38bdf8, #7dd3fc);
}
.stat-card:nth-child(2)::before {
  background: linear-gradient(90deg, #10b981, #34d399, #6ee7b7);
}
.stat-card:nth-child(3)::before {
  background: linear-gradient(90deg, #f59e0b, #fbbf24, #fcd34d);
}
.stat-card:nth-child(4)::before {
  background: linear-gradient(90deg, #ef4444, #f87171, #fca5a5);
}

.stat-card:hover {
  box-shadow:
    0 8px 24px rgba(64, 158, 255, 0.14),
    0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-3px);
}

.stat-change {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  margin-left: 6px;
  letter-spacing: 0.02em;
}

.stat-change.positive {
  color: #059669;
  background: rgba(16, 185, 129, 0.1);
}
.stat-change.negative {
  color: #dc2626;
  background: rgba(239, 68, 68, 0.1);
}
.stat-change.neutral {
  color: #6b7280;
  background: rgba(107, 114, 128, 0.1);
}

/* 主内容 - 层级阴影 */
.main-content {
  background: #ffffff;
  border-radius: 14px;
  overflow: visible;
  box-shadow:
    0 2px 12px rgba(64, 158, 255, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(64, 158, 255, 0.06);
}

:deep(.n-tab-pane) {
  padding-bottom: 36px;
}

.tab-content {
  display: flex;
  flex-direction: column;
}

.mb-4 {
  margin-bottom: 18px;
}

/* 图表卡片 */
.chart-card {
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(64, 158, 255, 0.06);
  border: 1px solid #f0f2f5;
  transition: box-shadow 0.2s ease;
}

.chart-card:hover {
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.1);
}

.chart-container {
  height: 300px;
  width: 100%;
}

/* 模板库 - 医疗黄提示 */
.template-note {
  padding: 10px 16px;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-left: 3px solid #f59e0b;
  border-radius: 6px;
  color: #92400e;
  font-size: 13px;
  margin-bottom: 16px;
  line-height: 1.7;
}

.tpl-content {
  line-height: 1.8;
  font-size: 14px;
  color: #1e293b;
}

.tpl-content p {
  margin: 10px 0 5px;
  font-weight: 600;
  color: #0f172a;
}

.tpl-content ul {
  padding-left: 22px;
  margin: 6px 0 10px;
}

.tpl-content li {
  margin-bottom: 5px;
  color: #475569;
}

/* 表格 - 医疗级样式 */
:deep(.n-data-table) {
  border-radius: 10px;
  overflow: hidden;
}

:deep(.n-data-table-th) {
  background: #f8fafc !important;
  font-weight: 600;
  color: #334155;
  font-size: 13px;
  letter-spacing: 0.02em;
}

:deep(.n-data-table-td) {
  font-size: 13px;
  color: #475569;
}

:deep(.n-data-table-tr:hover td) {
  background: #f0f9ff !important;
}

:deep(.n-button--primary-type) {
  border-radius: 6px;
}

/* 执行统计卡片 */
.exec-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}

.exec-card {
  text-align: center;
  border-radius: 14px;
  position: relative;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #f0f2f5;
  box-shadow: 0 1px 6px rgba(64, 158, 255, 0.06);
  padding: 20px 16px;
  transition:
    box-shadow 0.25s ease,
    transform 0.25s ease;
  cursor: default;
}

.exec-card:hover {
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.12);
  transform: translateY(-2px);
}

.exec-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 14px 0 0 14px;
}

.exec-card:nth-child(1)::before {
  background: linear-gradient(180deg, #10b981, #34d399);
}
.exec-card:nth-child(2)::before {
  background: linear-gradient(180deg, #0ea5e9, #38bdf8);
}
.exec-card:nth-child(3)::before {
  background: linear-gradient(180deg, #f59e0b, #fbbf24);
}
.exec-card:nth-child(4)::before {
  background: linear-gradient(180deg, #6b7280, #9ca3af);
}

.exec-card-value {
  margin-bottom: 6px;
}

.exec-num {
  font-size: 34px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
  letter-spacing: -0.02em;
}

.exec-unit {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
}

.exec-card-title {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.exec-card-sub {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 0;
}

/* 方案详情 */
.plan-detail {
  max-height: 65vh;
  overflow-y: auto;
  padding-right: 6px;
}

/* 滚动条美化 */
.plan-detail::-webkit-scrollbar {
  width: 5px;
}
.plan-detail::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}
.plan-detail::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.plan-detail::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.detail-section {
  margin-bottom: 14px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 16px 0 12px;
  padding-left: 12px;
  border-left: 4px solid #0ea5e9;
  letter-spacing: 0.01em;
}

.section-note {
  margin: 10px 0;
  padding: 10px 16px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-left: 3px solid #0ea5e9;
  border-radius: 6px;
  color: #1e40af;
  font-size: 13px;
  line-height: 1.7;
}

.advice-text {
  padding: 14px 18px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-left: 4px solid #10b981;
  border-radius: 0 8px 8px 0;
  color: #14532d;
  font-size: 14px;
  line-height: 1.8;
}

.detail-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 方案详情 - NDescriptions label不换行 */
.plan-detail .n-descriptions .n-descriptions-item .n-descriptions-item__label {
  white-space: nowrap;
  flex-shrink: 0;
}

.plan-detail .n-descriptions-table .n-descriptions-item__label {
  white-space: nowrap;
  flex-shrink: 0;
}

/* 抽屉表单 */
.drawer-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  letter-spacing: 0.01em;
}

/* 响应式 */
@media (max-width: 1200px) {
  .stat-cards,
  .exec-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .stat-cards,
  .exec-cards {
    grid-template-columns: 1fr;
  }
}
</style>
