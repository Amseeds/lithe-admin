<script setup lang="ts">
import dayjs from 'dayjs'
import { ref, reactive, computed, onMounted, watch, h } from 'vue'
import {
  NCard,
  NMenu,
  NSelect,
  NInput,
  NDataTable,
  NButton,
  NGrid,
  NGi,
  NModal,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NEmpty,
  NScrollbar,
  NDatePicker,
} from 'naive-ui'
import * as echarts from 'echarts'
import type { MenuOption, DataTableColumns } from 'naive-ui'
import {
  menuCategories,
  categoryDefinitions,
  categoryStatistics,
  hba1cDistribution,
  generalIndicatorCards,
  patientDetails,
  getPatientCategoryPieData,
  isLeafNode,
  getCategoryName,
  type PatientDetail,
  type PatientData,
} from './mock/data'
import { getDashboardData, getPlanDetail } from '@/api/bloodSugarTargets'

interface GroupedPatient {
  patientId: string
  name: string
  age: number
  gender: string | null
  medicalRecordNo: string | null
  mainCategory: string
  subCategory: string
  categoryKey: string
  categoryName: string
  riskLevel: string
  controlStatus: string
  hypoglycemiaRisk: boolean
  hba1cTarget: string | null
  fastingTarget: string
  postprandialTarget: string
}

type GroupByMenu = Record<string, Record<string, GroupedPatient[]>>

// 当前选中的分类
const currentCategory = ref('overview')

// 展开的菜单项
const expandedKeys = ref<string[]>(['t2dm'])

const range = ref<[number, number]>([
  dayjs().subtract(1, 'day').startOf('day').valueOf(),
  dayjs().endOf('day').valueOf(),
])

// 时间范围选项
const timeRangeOptions = [
  { label: '近1个月', value: '1' },
  { label: '近3个月', value: '3' },
  { label: '近6个月', value: '6' },
]
const selectedTimeRange = ref('3')
const searchParams = reactive({
  startDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
  endDate: dayjs().format('YYYY-MM-DD'),
})
// 搜索关键字
const searchKeyword = ref('')

// 详情弹窗
const showDetailModal = ref(false)
const selectedPatient = ref<PatientDetail | null>(null)
const tableLoading = ref(false)

const getData = async (val) => {
  if (val) {
    searchParams.startDate = dayjs(val[0]).format('YYYY-MM-DD')
    searchParams.endDate = dayjs(val[1]).format('YYYY-MM-DD')
  }
  tableLoading.value = true
  console.log(searchParams, 'searchParams==')
  const { code, data } = await getDashboardData(searchParams)
  console.log(code, 'code===')
  console.log(data, 'data===')
  if (code === 200) {
    if (data.groupByMenu) {
      groupByMenu.value = data.groupByMenu
      const allPatients: GroupedPatient[] = []
      Object.values(data.groupByMenu).forEach((subCategories) => {
        Object.values(subCategories).forEach((patients) => {
          allPatients.push(...patients)
        })
      })
      patientList.value = allPatients
    }
    if (data.categoryPie && categoryPieChart) {
      categoryPieChart.hideLoading()
      categoryPieChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}人 ({d}%)',
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: { fontSize: 12 },
        },
        series: [
          {
            name: '患者分类',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['35%', '50%'],
            itemStyle: {
              borderRadius: 6,
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: true,
              formatter: '{b}\n{c}人',
              fontSize: 11,
            },
            data: data.categoryPie.map((item: { name: string; value: number }, index: number) => ({
              ...item,
              itemStyle: {
                color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][
                  index % 6
                ],
              },
            })),
          },
        ],
      })
    }
    if (data.hba1cDistribution && hba1cPieChart) {
      hba1cPieChart.hideLoading()
      hba1cPieChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}人 ({d}%)',
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: { fontSize: 12 },
        },
        series: [
          {
            name: 'HbA1c分布',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['35%', '50%'],
            itemStyle: {
              borderRadius: 6,
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: true,
              formatter: '{b}\n{c}人',
              fontSize: 11,
            },
            data: data.hba1cDistribution.map((item: { name: string; value: number }) => ({
              ...item,
            })),
          },
        ],
      })
    }
  }
  tableLoading.value = false
}

// 将 MenuCategory 转换为 NMenu 的 MenuOption
const convertToMenuOptions = (categories: typeof menuCategories): MenuOption[] => {
  return categories.map((cat) => {
    const option: MenuOption = {
      label: cat.name,
      key: cat.key,
    }
    if (cat.children && cat.children.length > 0) {
      option.children = convertToMenuOptions(cat.children)
    }
    return option
  })
}

// 左侧菜单选项
const menuOptions: MenuOption[] = convertToMenuOptions(menuCategories)

// 分组患者数据
const groupByMenu = ref<GroupByMenu>({})

// 扁平化的患者列表（用于筛选）
const patientList = ref<GroupedPatient[]>([])

// 过滤后的患者列表
const filteredPatientList = computed(() => {
  if (currentCategory.value === 'overview') {
    return patientList.value
  }
  if (!isLeafNode(currentCategory.value, menuCategories)) {
    return []
  }
  return patientList.value.filter((p) => p.categoryKey === currentCategory.value)
})

// 当前分类的统计数据
const currentCategoryStats = computed(() => {
  if (currentCategory.value === 'overview') {
    return null
  }
  return categoryStatistics[currentCategory.value]
})

// 当前分类的定义
const currentCategoryDefinition = computed(() => {
  if (currentCategory.value === 'overview') {
    return null
  }
  return categoryDefinitions[currentCategory.value]
})

// 判断当前选中的是否为叶子节点
const isCurrentLeaf = computed(() => {
  if (currentCategory.value === 'overview') {
    return false
  }
  return isLeafNode(currentCategory.value, menuCategories)
})

// 查看详情
const handleViewDetail = async (patientId: string) => {
  // selectedPatient.value = patientDetails[patientId]
  const { code, data } = await getPlanDetail({ patientId: patientId })
  console.log(code, 'code===')
  console.log(data, 'data===')
  if (code === 200) {
    if (!data.bvoList) {
      data.bvoList = []
    }
    selectedPatient.value = data
  }
  showDetailModal.value = true
}

// 表格列定义
const tableColumns: DataTableColumns<GroupedPatient> = [
  { title: '患者姓名', key: 'name', width: 100 },
  { title: '病历号', key: 'patientId', width: 140 },
  { title: '年龄', key: 'age', width: 80 },
  {
    title: '所属分层',
    key: 'categoryName',
    width: 160,
    render: (row) => row.categoryName,
  },
  {
    title: '最近HbA1c结果',
    key: 'hba1cTarget',
    width: 120,
    render: (row) => row.hba1cTarget || '-',
  },
  {
    title: '空腹血糖',
    key: 'fastingTarget',
    width: 140,
    render: (row) => row.fastingTarget || '-',
  },
  {
    title: '控糖状态',
    key: 'controlStatus',
    width: 100,
    render: (row) => {
      const isControlled = row.controlStatus === '达标'
      return h(
        NTag,
        { type: isControlled ? 'success' : 'warning', size: 'small' },
        () => row.controlStatus,
      )
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row) => {
      return h(
        NButton,
        { text: true, type: 'primary', onClick: () => handleViewDetail(row.patientId) },
        { default: () => '查看详情' },
      )
    },
  },
]

// 饼图实例
let categoryPieChart: echarts.ECharts | null = null
let hba1cPieChart: echarts.ECharts | null = null
let bloodGlucoseChart: echarts.ECharts | null = null

// 初始化饼图
const initPieCharts = () => {
  // 患者分类占比饼图
  const categoryChartDom = document.getElementById('category-pie-chart')
  if (categoryChartDom) {
    if (categoryPieChart) {
      categoryPieChart.dispose()
      categoryPieChart = null
    }
    categoryPieChart = echarts.init(categoryChartDom)
    categoryPieChart.showLoading()
  }

  // HbA1c分布饼图
  const hba1cChartDom = document.getElementById('hba1c-pie-chart')
  if (hba1cChartDom) {
    if (hba1cPieChart) {
      hba1cPieChart.dispose()
      hba1cPieChart = null
    }
    hba1cPieChart = echarts.init(hba1cChartDom)
    hba1cPieChart.showLoading()
  }
}

// 初始化血糖波动折线图
const initBloodGlucoseChart = () => {
  const chartDom = document.getElementById('blood-glucose-chart')
  if (chartDom && selectedPatient.value) {
    bloodGlucoseChart = echarts.init(chartDom)
    const { dates, fasting, postprandial, targetMin, targetMax } =
      selectedPatient.value.bloodGlucoseData

    bloodGlucoseChart.setOption({
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['空腹血糖', '餐后2小时血糖'],
        top: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
      },
      yAxis: {
        type: 'value',
        name: 'mmol/L',
      },
      series: [
        {
          name: '空腹血糖',
          type: 'line',
          data: fasting,
          smooth: true,
          itemStyle: { color: '#3b82f6' },
          areaStyle: { color: 'rgba(59, 130, 246, 0.1)' },
        },
        {
          name: '餐后2小时血糖',
          type: 'line',
          data: postprandial,
          smooth: true,
          itemStyle: { color: '#10b981' },
          areaStyle: { color: 'rgba(16, 185, 129, 0.1)' },
        },
        {
          name: '目标上限',
          type: 'line',
          data: Array(dates.length).fill(targetMax),
          lineStyle: { type: 'dashed', color: '#ef4444' },
          symbol: 'none',
        },
        {
          name: '目标下限',
          type: 'line',
          data: Array(dates.length).fill(targetMin),
          lineStyle: { type: 'dashed', color: '#f59e0b' },
          symbol: 'none',
        },
      ],
    })
  }
}

// 窗口大小变化时重绘图表
const handleResize = () => {
  categoryPieChart?.resize()
  hba1cPieChart?.resize()
  bloodGlucoseChart?.resize()
}

// HbA1c数值颜色分类
const getHba1cClass = (value: string | number | null | undefined) => {
  if (!value && value !== 0) return ''
  const num = parseFloat(String(value))
  if (isNaN(num)) return ''
  if (num < 6.5) return 'text-green-600 font-medium'
  if (num <= 7.0) return 'text-cyan-600 font-medium'
  if (num <= 8.0) return 'text-orange-500 font-medium'
  return 'text-red-600 font-medium'
}

// 监听弹窗打开，初始化血糖图表
watch(showDetailModal, (val) => {
  if (val) {
    setTimeout(() => {
      initBloodGlucoseChart()
    }, 100)
  }
})

// 监听菜单选中变化，如果是非叶子节点则不处理
const handleMenuUpdate = (key: string) => {
  // 模块总览或叶子节点可以直接选中
  if (key === 'overview' || isLeafNode(key, menuCategories)) {
    currentCategory.value = key
  }
  // 非叶子节点点击时只展开/折叠，不改变选中状态
}

// 监听 currentCategory 变化，当切换回 overview 时重新初始化饼图
watch(currentCategory, (newVal) => {
  if (newVal === 'overview') {
    // 等待 DOM 更新完成后重新初始化饼图
    setTimeout(() => {
      initPieCharts()
    }, 100)
  }
})

onMounted(() => {
  initPieCharts()
  window.addEventListener('resize', handleResize)
  getData()
})
</script>

<template>
  <div class="flex h-full">
    <!-- 左侧菜单 -->
    <div
      class="h-full w-[240px] flex-shrink-0 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      <NScrollbar
        h-full
        trigger="hover"
      >
        <NMenu
          :options="menuOptions"
          :value="currentCategory"
          :expanded-keys="expandedKeys"
          :on-update:expanded-keys="
            (keys: string[]) => {
              expandedKeys = keys
            }
          "
          :on-update:value="handleMenuUpdate"
        />
      </NScrollbar>
    </div>

    <!-- 右侧主内容区 -->
    <div class="flex-1 overflow-auto p-4">
      <!-- 模块总览页面 -->
      <template v-if="currentCategory === 'overview'">
        <!-- 顶部筛选栏 -->
        <NCard class="mb-4">
          <div class="flex items-center gap-4">
            <NDatePicker
              v-model:value="range"
              type="daterange"
              clearable
              @confirm="
                (val) => {
                  console.log(val, '=====')
                  getData(val)
                }
              "
            />

            <!-- <NSelect
              v-model:value="selectedTimeRange"
              :options="timeRangeOptions"
              style="width: 140px"
            /> -->
            <!-- <NInput
              v-model:value="searchKeyword"
              placeholder="患者姓名/病历号"
              style="width: 200px"
              clearable
            /> -->
          </div>
        </NCard>

        <!-- 饼图区域 -->
        <NGrid
          :cols="2"
          :x-gap="16"
          class="mb-4"
        >
          <NGi>
            <NCard title="患者分类占比">
              <div
                id="category-pie-chart"
                style="height: 280px"
              />
            </NCard>
          </NGi>
          <NGi>
            <NCard title="HbA1c血糖指标占比">
              <div
                id="hba1c-pie-chart"
                style="height: 280px"
              />
            </NCard>
          </NGi>
        </NGrid>

        <!-- 通用控糖指标卡片 -->
        <NGrid
          :cols="3"
          :x-gap="16"
          class="mb-4"
        >
          <NGi
            v-for="card in generalIndicatorCards.filter((c) => c.title !== '整体达标率')"
            :key="card.title"
          >
            <NCard size="small">
              <div class="mb-2 text-sm text-gray-500">
                {{ card.title }}
              </div>
              <div
                v-if="card.target"
                class="mb-1 text-xs text-gray-400"
              >
                通用目标：{{ card.target }}
              </div>
              <div class="text-lg font-semibold">
                {{ card.average }}
              </div>
              <div
                v-if="card.change"
                class="mt-1 text-xs text-green-500"
              >
                较上月：{{ card.change }}
              </div>
            </NCard>
          </NGi>
        </NGrid>

        <!-- 患者列表 -->
        <NCard title="全院患者列表">
          <NDataTable
            :columns="tableColumns"
            :data="filteredPatientList"
            :bordered="false"
            :loading="tableLoading"
            :row-key="(row: GroupedPatient) => row.patientId"
          />
        </NCard>
      </template>

      <!-- 非叶子节点提示 -->
      <template v-else-if="!isCurrentLeaf">
        <NCard>
          <NEmpty description="请在左侧菜单选择具体的分类查看详情">
            <template #extra>
              <div class="text-sm text-gray-400">
                当前选中：{{ getCategoryName(currentCategory) }}
              </div>
            </template>
          </NEmpty>
        </NCard>
      </template>

      <!-- 叶子节点分类页面 -->
      <template v-else>
        <!-- 分类信息条 -->
        <NCard class="mb-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="mb-2 text-lg font-semibold">
                {{ currentCategoryDefinition?.name }}
              </div>
              <div class="text-sm text-gray-500">
                {{ currentCategoryDefinition?.definition }}
              </div>
              <div
                v-if="currentCategoryDefinition?.parentPath.length"
                class="mt-1 text-xs text-gray-400"
              >
                分类路径：{{ currentCategoryDefinition?.parentPath.join(' > ') }} >
                {{ currentCategoryDefinition?.name }}
              </div>
            </div>
            <div class="flex gap-8 text-center">
              <div>
                <div class="text-2xl font-bold text-blue-500">
                  {{ currentCategoryStats?.total }}
                </div>
                <div class="text-xs text-gray-400">患者总人数</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-green-500">
                  {{ currentCategoryStats?.proportion }}
                </div>
                <div class="text-xs text-gray-400">占全院比例</div>
              </div>
            </div>
          </div>
        </NCard>

        <!-- 专属控糖目标卡片 -->
        <NCard
          title="专属控糖目标"
          class="mb-4"
        >
          <div class="flex gap-4">
            <div
              v-for="target in currentCategoryDefinition?.targets"
              :key="target.name"
              class="flex-1 rounded bg-gray-50 p-3 dark:bg-gray-700"
            >
              <div class="text-sm text-gray-500">
                {{ target.name }}
              </div>
              <div class="text-lg font-semibold text-blue-500">
                {{ target.value || '-' }}
              </div>
            </div>
          </div>
        </NCard>

        <!-- 统计卡片区 -->
        <!-- <NGrid
          :cols="4"
          :x-gap="16"
          class="mb-4"
        >
          <NGi>
            <NCard size="small">
              <div class="text-sm text-gray-500">该分类总人数</div>
              <div class="text-2xl font-bold">
                {{ currentCategoryStats?.total }}
              </div>
            </NCard>
          </NGi>
          <NGi>
            <NCard size="small">
              <div class="text-sm text-gray-500">达标人数</div>
              <div class="text-2xl font-bold text-green-500">
                {{ currentCategoryStats?.controlled }}
              </div>
            </NCard>
          </NGi>
          <NGi>
            <NCard size="small">
              <div class="text-sm text-gray-500">未达标人数</div>
              <div class="text-2xl font-bold text-orange-500">
                {{ currentCategoryStats?.uncontrolled }}
              </div>
            </NCard>
          </NGi>
          <NGi>
            <NCard size="small">
              <div class="text-sm text-gray-500">低血糖风险人数</div>
              <div class="text-2xl font-bold text-red-500">
                {{ currentCategoryStats?.hypoglycemiaRisk }}
              </div>
            </NCard>
          </NGi>
        </NGrid> -->

        <!-- 患者列表 -->
        <NCard>
          <template #header>
            <div class="flex items-center gap-4">
              <span>该分类患者列表</span>
              <NDatePicker
                v-model:value="range"
                type="daterange"
                clearable
                size="small"
                @confirm="(val) => getData(val)"
              />
            </div>
          </template>
          <NDataTable
            :columns="tableColumns"
            :data="filteredPatientList"
            :bordered="false"
            :loading="tableLoading"
            :row-key="(row: GroupedPatient) => row.patientId"
          />
        </NCard>
      </template>
    </div>
  </div>

  <!-- 患者详情弹窗 -->
  <NModal
    v-model:show="showDetailModal"
    preset="card"
    style="width: 720px; max-width: 95vw"
    :bordered="false"
    :segmented="{ content: true, footer: true }"
    :header-style="{ paddingBottom: '8px' }"
  >
    <template v-if="selectedPatient">
      <!-- 患者信息卡片 -->
      <NCard
        size="small"
        class="mb-4"
        :content-style="{ padding: '16px' }"
      >
        <div class="patient-header">
          <div class="patient-avatar">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="patient-main-info">
            <div class="patient-name-row">
              <span class="patient-name">{{ selectedPatient.name }}</span>
              <NTag :type="selectedPatient.sex === '男' ? 'info' : 'warning'" size="small" round>
                {{ selectedPatient.sex }}
              </NTag>
              <NTag type="default" size="small" round>
                {{ selectedPatient.age }}岁
              </NTag>
            </div>
            <div class="patient-meta">
              <span class="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                住院号: {{ selectedPatient.zyh }}
              </span>
            </div>
          </div>
          <div class="patient-hba1c-indicator" :class="{ 'is-empty': !selectedPatient.lasthba1c }">
            <span class="hba1c-label">最新HbA1c</span>
            <span v-if="selectedPatient.lasthba1c" class="hba1c-value" :class="getHba1cClass(selectedPatient.lasthba1c)">
              {{ selectedPatient.lasthba1c }}%
            </span>
            <span v-else class="hba1c-empty">--</span>
          </div>
        </div>
      </NCard>

      <!-- 历史HbA1c检查记录 -->
      <NCard
        title="历史检查记录"
        size="small"
        :content-style="{ padding: '0 12px 12px 12px' }"
      >
        <template #header-extra>
          <span class="text-xs text-gray-500">共 {{ selectedPatient.bvoList?.length || 0 }} 条记录</span>
        </template>
        <NDataTable
          v-if="selectedPatient.bvoList?.length"
          :columns="[
            { title: '检查日期', key: 'adate', width: 120 },
            { title: 'HbA1c结果', key: 'avolume', width: 100,
              render: (row) => h('span', { class: getHba1cClass(row.avolume) }, row.avolume + '%') },
            { title: '是否达标', key: 'targetAchieved', width: 100,
              render: (row) => h(NTag, { type: row.targetAchieved === '是' ? 'success' : 'error', size: 'small' }, () => row.targetAchieved) },
          ]"
          :data="selectedPatient.bvoList"
          :bordered="false"
          :max-height="220"
          size="small"
          :row-key="(row: (typeof selectedPatient.bvoList)[0]) => row.adate"
        />
        <NEmpty v-else description="暂无检查记录" size="small" />
      </NCard>
    </template>
    <NEmpty v-else description="暂无患者数据" />
  </NModal>
</template>

<style scoped>
.patient-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.patient-avatar {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0891b2 0%, #22d3ee 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
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

.patient-hba1c-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  min-width: 100px;
}

.patient-hba1c-indicator.is-empty {
  background: #f3f4f6;
  border-style: dashed;
}

.hba1c-label {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.hba1c-value {
  font-size: 24px;
  font-weight: 700;
}

.hba1c-empty {
  font-size: 24px;
  font-weight: 700;
  color: #d1d5db;
}
</style>
