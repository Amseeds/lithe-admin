<script setup lang="ts">
import {
  NButton,
  NTabPane,
  NTabs,
  NDataTable,
  NTag,
  NNumberAnimation,
  NPagination,
  useMessage,
  type PaginationProps,
} from 'naive-ui'
import { ref, computed, h, reactive, onMounted, nextTick } from 'vue'

import { ScrollContainer } from '@/components'

import { pendingWarnings, handledWarnings, type PendingWarning, type HandledWarning } from './mock'
import { getDashboardData, getWarningLing, updateWarningStatus } from '@/api/alertManagement'

defineOptions({
  name: 'AlertManagement',
})
const message = useMessage()
// 当前Tab
const activeTab = ref('pending')
const loading = ref(false)

// 待处理预警数据（响应式）
const pendingData = ref<PendingWarning[]>([...pendingWarnings])

// 已处理预警数据
const handledData = ref<HandledWarning[]>([...handledWarnings])

const boardData = ref({
  totalCount: 0,
  pendingCount: 0,
  handledCount: 0,
  handleRate: 0,
})
const getBoardData = async () => {
  const { code, data } = await getDashboardData()
  if (code === 200) {
    boardData.value = data
    console.log(data, 'data=====')
  }
}
const searchParams = reactive({
  pageNum: 1,
  pageSize: 10,
  disposeStatus: '待处理',
})
const handleGetWarning = async () => {
  loading.value = true
  console.log(activeTab.value, 'activeTab')
  if (activeTab.value === 'pending') searchParams.disposeStatus = '待处理'
  if (activeTab.value === 'handled') searchParams.disposeStatus = '已处理'
  const { code, data } = await getWarningLing(searchParams)
  if (code === 200) {
    pendingData.value = data.list || []
    if (activeTab.value === 'pending') {
      pendingPagination.itemCount = data.total || 0
    } else {
      handledPagination.itemCount = data.total || 0
    }
    console.log(data, 'data=====')
  }
  loading.value = false
}
// 统计数据
const statsData = computed(() => {
  const total = boardData.value.totalCount
  const pending = boardData.value.pendingCount
  const handled = boardData.value.handledCount
  const rate = boardData.value.handleRate
  console.log(boardData.value, '====')
  console.log(total, '====')
  return [
    {
      title: '预警总数',
      value: total,
      tag: '+12% 今日新增',
      tagType: 'error' as const,
      iconClass: 'iconify ph--bell text-rose-50 dark:text-rose-150',
      iconBgClass:
        'text-rose-500/5 bg-rose-400 ring-4 ring-rose-200 dark:bg-rose-650 dark:ring-rose-500/30',
    },
    {
      title: '待处理预警',
      value: pending,
      tag: '紧急',
      tagType: 'warning' as const,
      iconClass: 'iconify ph--warning text-orange-50 dark:text-orange-150',
      iconBgClass:
        'text-orange-500/5 bg-orange-400 ring-4 ring-orange-200 dark:bg-orange-650 dark:ring-orange-500/30',
    },
    {
      title: '已处理预警',
      value: handled,
      tag: '完成',
      tagType: 'success' as const,
      iconClass: 'iconify ph--check-circle text-emerald-50 dark:text-emerald-150',
      iconBgClass:
        'text-emerald-500/5 bg-emerald-400 ring-4 ring-emerald-200 dark:bg-emerald-650 dark:ring-emerald-500/30',
    },
    {
      title: '预警处理率',
      value: parseFloat(rate),
      tag: '正常',
      tagType: 'default' as const,
      iconClass: 'iconify ph--chart-line text-neutral-50 dark:text-neutral-150',
      iconBgClass:
        'text-neutral-500/5 bg-neutral-400 ring-4 ring-neutral-200 dark:bg-neutral-650 dark:ring-neutral-500/30',
      isPercent: true,
    },
  ]
})

// 风险类型颜色映射
const getTypeTag = (type: string) => {
  const typeMap: Record<string, 'error' | 'warning' | 'info'> = {
    血糖异常: 'error',
    用药安全: 'warning',
    并发症风险: 'info',
  }
  return typeMap[type] || 'default'
}

// 标记已处理
const markAsHandled = async (row: PendingWarning) => {
  // const index = pendingData.value.findIndex((item) => item.id === row.id)
  // if (index > -1) {
  //   pendingData.value[index].status = '已处理'
  // }
  const { code, data } = await updateWarningStatus({ id: row.id })
  if (code === 200) {
    message.success('预警处理成功')
    nextTick(() => {
      handleGetWarning()
      getBoardData()
    })
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

// 待处理表格列
const pendingColumns = [
  {
    title: '预警时间',
    key: 'warningTime',
    width: 180,
  },
  {
    title: '住院号',
    key: 'patientName',
    width: 100,
  },
  {
    title: '风险类型',
    key: 'riskType',
    width: 200,
    ellipsis: { tooltip: true },
  },
  {
    title: '预警内容',
    key: 'warningContent',
    ellipsis: { tooltip: true },
  },
  {
    title: '处置状态',
    key: 'status',
    width: 100,
    render: (row: PendingWarning) =>
      h(
        NTag,
        { type: row.disposeStatus === '待处理' ? 'warning' : 'success', size: 'small' },
        { default: () => row.disposeStatus },
      ),
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render: (row: PendingWarning) =>
      row.disposeStatus === '待处理'
        ? h(
            NButton,
            {
              type: 'primary',
              size: 'tiny',
              text: false,
              onClick: () => markAsHandled(row),
            },
            { default: () => '标记已处理' },
          )
        : null,
  },
]

// 已处理表格列
const handledColumns = [
  {
    title: '预警时间',
    key: 'warningTime',
    width: 180,
  },
  {
    title: '住院号',
    key: 'patientName',
    width: 100,
  },
  {
    title: '风险类型',
    key: 'riskType',
    width: 200,
    ellipsis: { tooltip: true },
  },
  {
    title: '预警内容',
    key: 'warningContent',
    ellipsis: { tooltip: true },
  },
  {
    title: '处置时间',
    key: 'updateTime',
    width: 180,
  },
  {
    title: '处置状态',
    key: 'status',
    width: 100,
    render: (row: PendingWarning) =>
      h(
        NTag,
        { type: row.disposeStatus === '待处理' ? 'warning' : 'success', size: 'small' },
        { default: () => row.disposeStatus },
      ),
  },
]

// 分页配置
const pendingPagination = reactive<PaginationProps>({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  showQuickJumper: true,
  onUpdatePage: (page: number) => {
    pendingPagination.page = page
    searchParams.pageNum = page
    handleGetWarning()
  },
  onUpdatePageSize: (pageSize: number) => {
    pendingPagination.pageSize = pageSize
    pendingPagination.page = 1
    searchParams.pageSize = pageSize
    searchParams.pageNum = 1
    handleGetWarning()
  },
})

const handledPagination = reactive<PaginationProps>({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  showQuickJumper: true,
  onUpdatePage: (page: number) => {
    handledPagination.page = page
    searchParams.pageNum = page
    handleGetWarning()
  },
  onUpdatePageSize: (pageSize: number) => {
    handledPagination.pageSize = pageSize
    handledPagination.page = 1
    searchParams.pageSize = pageSize
    searchParams.pageNum = 1
    handleGetWarning()
  },
})

onMounted(() => {
  getBoardData()
  handleGetWarning()
})
</script>

<template>
  <ScrollContainer wrapper-class="flex flex-col gap-y-4">
    <!-- 顶部统计区 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="{ title, value, tag, tagType, iconClass, iconBgClass, isPercent } in statsData"
        :key="title"
        class="flex items-center justify-between gap-x-4 overflow-hidden rounded border border-naive-border bg-naive-card p-6 transition-[background-color,border-color]"
      >
        <div class="flex-1">
          <span class="text-sm font-medium text-neutral-450">{{ title }}</span>
          <div class="mt-1 mb-1.5 flex gap-x-4 text-2xl text-neutral-700 dark:text-neutral-400">
            <NNumberAnimation
              :to="value"
              :precision="isPercent ? 1 : 0"
            />
            <span v-if="isPercent">%</span>
          </div>
          <!-- <div class="flex items-center">
            <NTag
              :type="tagType"
              size="small"
            >
              {{ tag }}
            </NTag>
          </div> -->
        </div>
        <div>
          <div
            class="grid place-items-center rounded-full p-3"
            :class="iconBgClass"
          >
            <span
              class="size-7"
              :class="iconClass"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Tab区 -->
    <div class="rounded border border-naive-border bg-naive-card p-4">
      <NTabs
        v-model:value="activeTab"
        type="line"
        animated
        @update:value="handleGetWarning"
      >
        <NTabPane
          name="pending"
          tab="待处理预警"
        >
          <NDataTable
            :columns="pendingColumns"
            :data="pendingData"
            :loading="loading"
            :bordered="true"
            :scroll-x="1000"
            :pagination="pendingPagination"
            :remote="true"
          />
        </NTabPane>
        <NTabPane
          name="handled"
          tab="已处理预警"
        >
          <NDataTable
            :columns="handledColumns"
            :data="pendingData"
            :loading="loading"
            :bordered="true"
            :scroll-x="1100"
            :pagination="handledPagination"
            :remote="true"
          />
        </NTabPane>
      </NTabs>
    </div>
  </ScrollContainer>
</template>
