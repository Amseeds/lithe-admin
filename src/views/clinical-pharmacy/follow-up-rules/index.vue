<script setup lang="tsx">
import { useQuery } from '@pinia/colada'
import {
  NButton,
  NDataTable,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NTag,
  NPagination,
} from 'naive-ui'
import { reactive, ref, computed, watch } from 'vue'

import { getRuleList, type FollowUpRule, type FollowUpRuleQuery } from '@/api/followupRules'
import { ScrollContainer } from '@/components'
import { useInjection, useResettableReactive } from '@/composables'
import { mediaQueryInjectionKey } from '@/injection'

import type { DataTableColumns, PaginationProps } from 'naive-ui'

defineOptions({
  name: 'FollowUpRules',
})

const { isMaxMd, isMaxLg } = useInjection(mediaQueryInjectionKey)

const [form, , resetForm] = useResettableReactive<FollowUpRuleQuery>({
  ruleName: '',
  riskLevel: undefined,
  pageNum: 1,
  pageSize: 10,
})

// 风险等级映射
const RISK_LEVEL_MAP: Record<string, string> = {
  LOW: '低风险',
  MEDIUM: '中风险',
  HIGH: '高风险',
  SPECIAL: '特殊人群',
}

const dataList = ref<FollowUpRule[]>([])
const totalCount = ref(0)

const pagination = reactive<PaginationProps>({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 15, 20],
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

const columns: DataTableColumns<FollowUpRule> = [
  {
    key: 'ruleName',
    title: '规则名称',
    width: 200,
  },
  {
    key: 'riskLevel',
    title: '风险等级',
    width: 120,
    render: (row) => {
      const label = RISK_LEVEL_MAP[row.riskLevel] || row.riskLevel
      const type = row.riskLevel === 'HIGH' ? 'error' : row.riskLevel === 'MEDIUM' ? 'warning' : row.riskLevel === 'LOW' ? 'success' : 'info'
      return <NTag type={type} size="small">{label}</NTag>
    },
  },
  {
    key: 'condition',
    title: '触发条件',
    width: 120,
    render: (row) => `${row.conditionType}${row.conditionOperator}${row.conditionValue}`,
  },
  {
    key: 'followupIntervalDays',
    title: '随访间隔(天)',
    width: 120,
  },
  {
    key: 'priority',
    title: '优先级',
    width: 80,
  },
  {
    key: 'updateTime',
    title: '更新时间',
    width: 200,
  },
]

const riskLevelOptions = [
  { label: '低风险', value: 'LOW' },
  { label: '中风险', value: 'MEDIUM' },
  { label: '高风险', value: 'HIGH' },
  { label: '特殊人群', value: 'SPECIAL' },
]

const {
  data,
  isLoading,
  refetch,
} = useQuery({
  key: () => ['followUpRuleList', pagination.page ?? 1, pagination.pageSize ?? 10, form.ruleName, form.riskLevel],
  query: () =>
    getRuleList({
      ruleName: form.ruleName,
      riskLevel: form.riskLevel,
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
</script>

<template>
  <ScrollContainer
    wrapper-class="flex flex-col gap-y-2"
    :scrollable="isMaxLg"
  >
    <NCard
      title=""
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
            label="规则名称"
            path="ruleName"
          >
            <NInput
              v-model:value="form.ruleName"
              clearable
              placeholder="请输入规则名称"
              @keyup.enter="handleQueryClick"
            />
          </NFormItem>
          <NFormItem
            label="风险等级"
            path="riskLevel"
          >
            <NSelect
              v-model:value="form.riskLevel"
              :options="riskLevelOptions"
              clearable
              placeholder="请选择风险等级"
              style="width: 160px"
              @update:value="handleQueryClick"
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
          :scroll-x="900"
          :columns="columns"
          :data="dataList"
          :row-key="(row: FollowUpRule) => row.ruleId"
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
