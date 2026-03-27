<script setup lang="tsx">
import { useMutation, useQuery } from '@pinia/colada'
import {
  NButton,
  NDataTable,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NTag,
  useMessage,
  useModal,
  NPagination,
} from 'naive-ui'
import { reactive, ref, computed, watch } from 'vue'

import { getPlanList, getPlanDetail, executePlan, type FollowUpPlan, type FollowUpPlanQuery } from '@/api/followupPlan'
import { getLabCheckItemOptions, type LabCheckItem } from '@/api/followup'
import { ScrollContainer } from '@/components'
import { useInjection, useResettableReactive } from '@/composables'
import { mediaQueryInjectionKey } from '@/injection'

import ExecuteModal from './ExecuteModal.vue'

import type { DataTableColumns, PaginationProps } from 'naive-ui'

defineOptions({
  name: 'FollowUpPlan',
})

const { isMaxMd, isMaxLg } = useInjection(mediaQueryInjectionKey)

const message = useMessage()
const modal = useModal()

const [form, , resetForm] = useResettableReactive<FollowUpPlanQuery>({
  userId: '',
  pageNum: 1,
  pageSize: 10,
})

// 类型映射
const PLAN_TYPE_MAP: Record<string, string> = {
  ROUTINE: '常规随访',
  EMERGENCY: '紧急随访',
  REVIEW: '复查',
}

const PLAN_STATUS_MAP: Record<string, string> = {
  PENDING: '待执行',
  COMPLETED: '已完成',
}

const dataList = ref<FollowUpPlan[]>([])
const totalCount = ref(0)

const pagination = reactive<PaginationProps>({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  itemCount: 0,
  showQuickJumper: true,
  onUpdatePage: (page) => {
    pagination.page = page
    refetch()
  },
  onUpdatePageSize: (pageSize) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    refetch()
  },
})

const columns: DataTableColumns<FollowUpPlan> = [
  {
    key: 'planId',
    title: '随访计划号',
    width: 120,
  },
  {
    key: 'userId',
    title: '住院号',
    width: 120,
  },
  {
    key: 'planType',
    title: '随访类型',
    width: 100,
    render: (row) => PLAN_TYPE_MAP[row.planType] || row.planType,
  },
  {
    key: 'labCheckItemsList',
    title: '检查项目',
    render: (row) => row.labCheckItemsList?.join(', ') || '-',
  },
  {
    key: 'followupContentList',
    title: '随访内容',
    render: (row) => row.followupContentList?.join(', ') || '-',
  },
  {
    key: 'status',
    title: '状态',
    width: 100,
    render: (row) => {
      const status = row.status
      const type = status === 'COMPLETED' ? 'success' : status === 'PENDING' ? 'warning' : 'default'
      return <NTag type={type} size="small">{PLAN_STATUS_MAP[status] || status}</NTag>
    },
  },
  {
    key: 'updateTime',
    title: '更新时间',
    width: 160,
  },
  {
    key: 'actions',
    title: '操作',
    width: 120,
    fixed: 'right',
    render: (row) => {
      const isCompleted = row.status === 'COMPLETED'
      return (
        <div class="flex gap-2">
          {isCompleted && (
            <NButton
              secondary
              type="primary"
              size="small"
              onClick={() => viewDetail(row.planId)}
            >
              查看详情
            </NButton>
          )}
          {!isCompleted && (
            <NButton
              secondary
              type="success"
              size="small"
              onClick={() => executeFollowUp(row)}
            >
              执行
            </NButton>
          )}
        </div>
      )
    },
  },
]

const {
  data,
  isLoading,
  refetch,
} = useQuery({
  key: () => ['followUpPlanList', pagination.page ?? 1, pagination.pageSize ?? 10, form.userId],
  query: () =>
    getPlanList({
      userId: form.userId,
      pageNum: pagination.page ?? 1,
      pageSize: pagination.pageSize ?? 10,
    }),
  staleTime: 0,
})

watch(data, (newData) => {
  if (newData) {
    dataList.value = newData.data.list || []
    totalCount.value = newData.data.total || 0
    pagination.itemCount = newData.data.total || 0
  }
})

const handleQueryClick = () => {
  pagination.page = 1
  refetch()
}

// 查看详情
const viewDetail = async (planId: string) => {
  const m = modal.create({
    title: '查看详情',
    preset: 'card',
    draggable: true,
    style: {
      width: '600px',
      ...(isMaxMd.value ? { marginInline: '16px' } : {}),
    },
    content: () => (
      <ExecuteModal
        planId={planId}
        mode="view"
        message={message}
        onClose={() => m.destroy()}
      />
    ),
  })
}

// 执行随访
const executeFollowUp = (row: FollowUpPlan) => {
  const m = modal.create({
    title: '执行随访',
    preset: 'card',
    draggable: true,
    style: {
      width: '600px',
      ...(isMaxMd.value ? { marginInline: '16px' } : {}),
    },
    content: () => (
      <ExecuteModal
        planId={row.planId}
        mode="execute"
        planData={row}
        message={message}
        onSuccess={() => {
          m.destroy()
          refetch()
        }}
        onClose={() => m.destroy()}
      />
    ),
  })
}
</script>

<template>
  <ScrollContainer
    wrapper-class="flex flex-col gap-y-2"
    :scrollable="isMaxLg"
  >
    <NCard
      title="随访计划"
      :size="isMaxMd ? 'small' : undefined"
      class="flex-1"
      content-class="flex flex-col"
    >
      <div class="mb-2 flex justify-end gap-x-4 max-xl:mb-4 max-xl:flex-wrap">
        <NForm
          :model="form"
          :inline="!isMaxLg"
          label-placement="left"
          class="max-lg:w-full max-lg:flex-col"
          :label-width="isMaxLg ? 70 : undefined"
        >
          <NFormItem
            label="住院号"
            path="userId"
          >
            <NInput
              v-model:value="form.userId"
              clearable
              placeholder="请输入住院号"
              @keyup.enter="handleQueryClick"
            />
          </NFormItem>
        </NForm>
        <div class="flex gap-2">
          <NButton
            type="info"
            @click="handleQueryClick"
            :loading="isLoading"
            :disabled="isLoading"
          >
            <template #icon>
              <span class="iconify ph--magnifying-glass" />
            </template>
            查询
          </NButton>
          <NButton
            type="warning"
            @click="resetForm"
          >
            <template #icon>
              <span class="iconify ph--arrow-clockwise" />
            </template>
            重置
          </NButton>
        </div>
      </div>
      <div class="flex flex-1 flex-col">
        <NDataTable
          class="flex-1"
          :remote="true"
          :flex-height="!isMaxLg"
          :scroll-x="1200"
          :columns="columns"
          :data="dataList"
          :row-key="(row: FollowUpPlan) => row.planId"
          :loading="isLoading"
        />
        <div class="mt-3 flex justify-end">
          <NPagination
            v-bind="pagination"
            :page-slot="isMaxMd ? 5 : undefined"
            :show-quick-jump-dropdown="!isMaxMd"
            :show-quick-jumper="!isMaxMd"
            :show-size-picker="!isMaxMd"
            :disabled="isLoading"
          />
        </div>
      </div>
    </NCard>
  </ScrollContainer>
</template>
