<script setup lang="ts">
import { ref, computed, onMounted, watch, h } from 'vue'
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
} from 'naive-ui'
import * as echarts from 'echarts'
import type { MenuOption, DataTableColumns } from 'naive-ui'
import {
  menuCategories,
  categoryDefinitions,
  categoryStatistics,
  hba1cDistribution,
  generalIndicatorCards,
  patientList,
  patientDetails,
  getPatientCategoryPieData,
  isLeafNode,
  getCategoryName,
  type PatientDetail,
  type PatientData,
} from './mock/data'

// 当前选中的分类
const currentCategory = ref('overview')

// 展开的菜单项
const expandedKeys = ref<string[]>(['t2dm'])

// 时间范围选项
const timeRangeOptions = [
  { label: '近1个月', value: '1month' },
  { label: '近3个月', value: '3months' },
  { label: '近6个月', value: '6months' },
]
const selectedTimeRange = ref('3months')

// 搜索关键字
const searchKeyword = ref('')

// 详情弹窗
const showDetailModal = ref(false)
const selectedPatient = ref<PatientDetail | null>(null)

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

// 过滤后的患者列表
const filteredPatientList = computed(() => {
  if (currentCategory.value === 'overview') {
    return patientList
  }
  // 只有叶子节点才过滤患者
  if (!isLeafNode(currentCategory.value, menuCategories)) {
    return []
  }
  return patientList.filter((p) => p.category === currentCategory.value)
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
const handleViewDetail = (patientId: number) => {
  selectedPatient.value = patientDetails[patientId]
  showDetailModal.value = true
}

// 表格列定义
const tableColumns: DataTableColumns<PatientData> = [
  { title: '患者姓名', key: 'name', width: 100 },
  { title: '病历号', key: 'medicalRecordNo', width: 140 },
  { title: '年龄', key: 'age', width: 80 },
  {
    title: '所属分层',
    key: 'categoryName',
    width: 160,
    render: (row) => row.categoryName,
  },
  { title: '最近HbA1c结果', key: 'hba1c', width: 120 },
  {
    title: '空腹血糖达标情况',
    key: 'fastingStatus',
    width: 140,
    render: (row) => {
      const isControlled = row.fastingStatus === '达标'
      return h(NTag, { type: isControlled ? 'success' : 'warning', size: 'small' }, { default: () => row.fastingStatus })
    },
  },
  {
    title: '控糖目标状态',
    key: 'targetStatus',
    width: 120,
    render: (row) => {
      const isActive = row.targetStatus === '生效中'
      return h(NTag, { type: isActive ? 'success' : 'default', size: 'small' }, { default: () => row.targetStatus })
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row) => {
      return h(NButton, { text: true, type: 'primary', onClick: () => handleViewDetail(row.id) }, { default: () => '查看详情' })
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
    // 如果已存在实例，先销毁
    if (categoryPieChart) {
      categoryPieChart.dispose()
      categoryPieChart = null
    }
    categoryPieChart = echarts.init(categoryChartDom)
    const pieData = getPatientCategoryPieData()
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
          avoidLabelOverlap: false,
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
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold',
            },
          },
          data: pieData.map((item, index) => ({
            ...item,
            itemStyle: {
              color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6],
            },
          })),
        },
      ],
    })
  }

  // HbA1c分布饼图
  const hba1cChartDom = document.getElementById('hba1c-pie-chart')
  if (hba1cChartDom) {
    // 如果已存在实例，先销毁
    if (hba1cPieChart) {
      hba1cPieChart.dispose()
      hba1cPieChart = null
    }
    hba1cPieChart = echarts.init(hba1cChartDom)
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
          avoidLabelOverlap: false,
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
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold',
            },
          },
          data: hba1cDistribution.map((item) => ({
            name: item.name,
            value: item.value,
            itemStyle: { color: item.color },
          })),
        },
      ],
    })
  }
}

// 初始化血糖波动折线图
const initBloodGlucoseChart = () => {
  const chartDom = document.getElementById('blood-glucose-chart')
  if (chartDom && selectedPatient.value) {
    bloodGlucoseChart = echarts.init(chartDom)
    const { dates, fasting, postprandial, targetMin, targetMax } = selectedPatient.value.bloodGlucoseData

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
})
</script>

<template>
  <div class="flex h-full">
    <!-- 左侧菜单 -->
    <div class="w-[240px] border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 overflow-y-auto">
      <NMenu
        :options="menuOptions"
        :value="currentCategory"
        :expanded-keys="expandedKeys"
        :on-update:expanded-keys="(keys: string[]) => { expandedKeys = keys }"
        :on-update:value="handleMenuUpdate"
      />
    </div>

    <!-- 右侧主内容区 -->
    <div class="flex-1 overflow-auto p-4">
      <!-- 模块总览页面 -->
      <template v-if="currentCategory === 'overview'">
        <!-- 顶部筛选栏 -->
        <NCard class="mb-4">
          <div class="flex items-center gap-4">
            <NSelect
              v-model:value="selectedTimeRange"
              :options="timeRangeOptions"
              style="width: 140px"
            />
            <NInput
              v-model:value="searchKeyword"
              placeholder="患者姓名/病历号"
              style="width: 200px"
              clearable
            />
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
          :cols="4"
          :x-gap="16"
          class="mb-4"
        >
          <NGi
            v-for="card in generalIndicatorCards"
            :key="card.title"
          >
            <NCard size="small">
              <div class="text-sm text-gray-500 mb-2">
                {{ card.title }}
              </div>
              <div
                v-if="card.target"
                class="text-xs text-gray-400 mb-1"
              >
                通用目标：{{ card.target }}
              </div>
              <div class="text-lg font-semibold">
                {{ card.average }}
              </div>
              <div class="text-xs text-gray-400 mt-1">
                达标率：{{ card.rate }}
              </div>
              <div
                v-if="card.change"
                class="text-xs text-green-500 mt-1"
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
            :row-key="(row: PatientData) => row.id"
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
              <div class="text-lg font-semibold mb-2">
                {{ currentCategoryDefinition?.name }}
              </div>
              <div class="text-sm text-gray-500">
                {{ currentCategoryDefinition?.definition }}
              </div>
              <div
                v-if="currentCategoryDefinition?.parentPath.length"
                class="text-xs text-gray-400 mt-1"
              >
                分类路径：{{ currentCategoryDefinition?.parentPath.join(' > ') }} > {{ currentCategoryDefinition?.name }}
              </div>
            </div>
            <div class="flex gap-8 text-center">
              <div>
                <div class="text-2xl font-bold text-blue-500">
                  {{ currentCategoryStats?.total }}
                </div>
                <div class="text-xs text-gray-400">
                  患者总人数
                </div>
              </div>
              <div>
                <div class="text-2xl font-bold text-green-500">
                  {{ currentCategoryStats?.proportion }}
                </div>
                <div class="text-xs text-gray-400">
                  占全院比例
                </div>
              </div>
              <div>
                <div class="text-2xl font-bold text-orange-500">
                  {{ currentCategoryStats?.rate }}
                </div>
                <div class="text-xs text-gray-400">
                  整体达标率
                </div>
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
              class="flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded"
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
        <NGrid
          :cols="4"
          :x-gap="16"
          class="mb-4"
        >
          <NGi>
            <NCard size="small">
              <div class="text-sm text-gray-500">
                该分类总人数
              </div>
              <div class="text-2xl font-bold">
                {{ currentCategoryStats?.total }}
              </div>
            </NCard>
          </NGi>
          <NGi>
            <NCard size="small">
              <div class="text-sm text-gray-500">
                达标人数
              </div>
              <div class="text-2xl font-bold text-green-500">
                {{ currentCategoryStats?.controlled }}
              </div>
            </NCard>
          </NGi>
          <NGi>
            <NCard size="small">
              <div class="text-sm text-gray-500">
                未达标人数
              </div>
              <div class="text-2xl font-bold text-orange-500">
                {{ currentCategoryStats?.uncontrolled }}
              </div>
            </NCard>
          </NGi>
          <NGi>
            <NCard size="small">
              <div class="text-sm text-gray-500">
                低血糖风险人数
              </div>
              <div class="text-2xl font-bold text-red-500">
                {{ currentCategoryStats?.hypoglycemiaRisk }}
              </div>
            </NCard>
          </NGi>
        </NGrid>

        <!-- 患者列表 -->
        <NCard title="该分类患者列表">
          <NDataTable
            :columns="tableColumns"
            :data="filteredPatientList"
            :bordered="false"
            :row-key="(row: PatientData) => row.id"
          />
        </NCard>
      </template>
    </div>
  </div>

  <!-- 患者详情弹窗 -->
  <NModal
    v-model:show="showDetailModal"
    preset="card"
    style="width: 800px; max-width: 90vw"
    title="患者详情"
    :bordered="false"
  >
    <template v-if="selectedPatient">
      <!-- 患者基本信息 -->
      <NDescriptions
        label-placement="left"
        :column="4"
        bordered
        class="mb-4"
      >
        <NDescriptionsItem label="姓名">
          {{ selectedPatient.name }}
        </NDescriptionsItem>
        <NDescriptionsItem label="性别">
          {{ selectedPatient.gender }}
        </NDescriptionsItem>
        <NDescriptionsItem label="年龄">
          {{ selectedPatient.age }}岁
        </NDescriptionsItem>
        <NDescriptionsItem label="病历号">
          {{ selectedPatient.medicalRecordNo }}
        </NDescriptionsItem>
        <NDescriptionsItem label="糖尿病类型">
          {{ selectedPatient.diabetesType }}
        </NDescriptionsItem>
        <NDescriptionsItem label="病程">
          {{ selectedPatient.diseaseCourse }}
        </NDescriptionsItem>
        <NDescriptionsItem label="所属分层">
          {{ selectedPatient.categoryName }}
        </NDescriptionsItem>
        <NDescriptionsItem label="最近HbA1c">
          {{ selectedPatient.latestHba1c }}
        </NDescriptionsItem>
      </NDescriptions>

      <!-- 患者专属控糖目标 -->
      <NCard
        title="专属控糖目标"
        size="small"
        class="mb-4"
      >
        <div class="flex gap-4">
          <div
            v-for="target in categoryDefinitions[selectedPatient.category]?.targets"
            :key="target.name"
            class="flex-1 p-2 bg-gray-50 dark:bg-gray-700 rounded text-center"
          >
            <div class="text-xs text-gray-500">
              {{ target.name }}
            </div>
            <div class="text-sm font-semibold text-blue-500">
              {{ target.value || '-' }}
            </div>
          </div>
        </div>
      </NCard>

      <!-- 血糖波动折线图 -->
      <NCard
        title="血糖波动趋势（近14天）"
        size="small"
        class="mb-4"
      >
        <div
          id="blood-glucose-chart"
          style="height: 250px"
        />
      </NCard>

      <!-- 历史HbA1c检查记录 -->
      <NCard
        title="历史HbA1c检查记录"
        size="small"
        class="mb-4"
      >
        <NDataTable
          :columns="[
            { title: '检查日期', key: 'date', width: 120 },
            { title: 'HbA1c结果', key: 'result', width: 100 },
            { title: '是否达标', key: 'isControlled', width: 100 },
            { title: '医生备注', key: 'note' },
          ]"
          :data="selectedPatient.hba1cHistory"
          :bordered="false"
          :max-height="200"
          :row-key="(row: typeof selectedPatient.hba1cHistory[0]) => row.date"
        />
      </NCard>

      <!-- 控糖目标调整历史 -->
      <NCard
        title="控糖目标调整历史"
        size="small"
      >
        <NDataTable
          :columns="[
            { title: '调整时间', key: 'date', width: 120 },
            { title: '调整前目标', key: 'beforeTarget', width: 140 },
            { title: '调整后目标', key: 'afterTarget', width: 140 },
            { title: '调整原因', key: 'reason' },
            { title: '调整医生', key: 'doctor', width: 100 },
          ]"
          :data="selectedPatient.targetAdjustHistory"
          :bordered="false"
          :max-height="150"
          :row-key="(row: typeof selectedPatient.targetAdjustHistory[0]) => row.date"
        />
      </NCard>
    </template>
    <NEmpty v-else />
  </NModal>
</template>
