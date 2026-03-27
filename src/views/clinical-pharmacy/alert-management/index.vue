<script setup lang="ts">
import { NButton, NTabPane, NTabs, NDataTable, NTag, NNumberAnimation } from 'naive-ui'
import { ref, computed, h, reactive } from 'vue'

import { ScrollContainer } from '@/components'

import { pendingWarnings, handledWarnings, type PendingWarning, type HandledWarning } from './mock'

defineOptions({
  name: 'AlertManagement',
})

// 当前Tab
const activeTab = ref('pending')

// 待处理预警数据（响应式）
const pendingData = ref<PendingWarning[]>([...pendingWarnings])

// 已处理预警数据
const handledData = ref<HandledWarning[]>([...handledWarnings])

// 统计数据
const statsData = computed(() => {
  const total = 128
  const pending = pendingData.value.filter((item) => item.status === '待处理').length
  const handled = 91
  const rate = ((handled / total) * 100).toFixed(1)

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
const markAsHandled = (row: PendingWarning) => {
  const index = pendingData.value.findIndex((item) => item.id === row.id)
  if (index > -1) {
    pendingData.value[index].status = '已处理'
  }
}

// 待处理表格列
const pendingColumns = [
  {
    title: '预警时间',
    key: 'time',
    width: 180,
  },
  {
    title: '患者姓名',
    key: 'name',
    width: 100,
  },
  {
    title: '风险类型',
    key: 'type',
    width: 120,
    render: (row: PendingWarning) =>
      h(NTag, { type: getTypeTag(row.type), size: 'small' }, { default: () => row.type }),
  },
  {
    title: '预警内容',
    key: 'content',
    ellipsis: { tooltip: true },
  },
  {
    title: '处置状态',
    key: 'status',
    width: 100,
    render: (row: PendingWarning) =>
      h(
        NTag,
        { type: row.status === '待处理' ? 'warning' : 'success', size: 'small' },
        { default: () => row.status },
      ),
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render: (row: PendingWarning) =>
      row.status === '待处理'
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
    key: 'time',
    width: 180,
  },
  {
    title: '患者姓名',
    key: 'name',
    width: 100,
  },
  {
    title: '风险类型',
    key: 'type',
    width: 120,
    render: (row: HandledWarning) =>
      h(NTag, { type: getTypeTag(row.type), size: 'small' }, { default: () => row.type }),
  },
  {
    title: '预警内容',
    key: 'content',
    ellipsis: { tooltip: true },
  },
  {
    title: '处置人',
    key: 'handler',
    width: 100,
  },
  {
    title: '处置时间',
    key: 'handleTime',
    width: 180,
  },
]

// 分页配置
const pendingPagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    pendingPagination.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    pendingPagination.pageSize = pageSize
    pendingPagination.page = 1
  },
})

const handledPagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    handledPagination.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    handledPagination.pageSize = pageSize
    handledPagination.page = 1
  },
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
          <div class="flex items-center">
            <NTag
              :type="tagType"
              size="small"
            >
              {{ tag }}
            </NTag>
          </div>
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
      >
        <NTabPane
          name="pending"
          tab="待处理预警"
        >
          <NDataTable
            :columns="pendingColumns"
            :data="pendingData"
            :bordered="false"
            :scroll-x="1000"
            :pagination="pendingPagination"
          />
        </NTabPane>
        <NTabPane
          name="handled"
          tab="已处理预警"
        >
          <NDataTable
            :columns="handledColumns"
            :data="handledData"
            :bordered="false"
            :scroll-x="1100"
            :pagination="handledPagination"
          />
        </NTabPane>
      </NTabs>
    </div>
  </ScrollContainer>
</template>
