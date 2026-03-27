<script setup lang="tsx">
import { useQuery } from '@pinia/colada'
import {
  NButton,
  NDataTable,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NPagination,
  useModal,
} from 'naive-ui'
import { ref, watch, reactive } from 'vue'

import { getDrugList, type DrugInformation, type DrugQueryParams } from '@/api/drugInformation'
import { ScrollContainer } from '@/components'
import { useInjection, useResettableReactive } from '@/composables'
import { mediaQueryInjectionKey } from '@/injection'

import DetailModal from './DetailModal.vue'

import type { PaginationProps } from 'naive-ui'

defineOptions({
  name: 'DrugInformation',
})

const { isMaxMd, isMaxLg } = useInjection(mediaQueryInjectionKey)

const [queryParams, , resetQueryParams] = useResettableReactive<DrugQueryParams>({
  drugName: '',
  pageNum: 1,
  pageSize: 10,
})

const dataList = ref<DrugInformation[]>([])
const totalCount = ref(0)

const modal = useModal()

const pagination = reactive<PaginationProps>({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 15, 20],
  itemCount: 0,
  showQuickJumper: true,
  onUpdatePage: (page) => {
    pagination.page = page
    queryParams.pageNum = page
    refetch()
  },
  onUpdatePageSize: (pageSize) => {
    pagination.pageSize = pageSize
    queryParams.pageSize = pageSize
    pagination.page = 1
    queryParams.pageNum = 1
    refetch()
  },
})

const columns = [
  {
    key: 'drugId',
    title: '编码',
    width: 80,
  },
  {
    key: 'drugName',
    title: '药品名称',
    ellipsis: {
      tooltip: true,
    },
    width: 280,
  },
  {
    key: 'drugIngredients',
    title: '药物成分',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    key: 'updateTime',
    title: '更新时间',
    width: 180,
    render: (row: DrugInformation) => {
      if (!row.updateTime) return '-'
      return new Date(row.updateTime).toLocaleString('zh-CN')
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row: DrugInformation) => (
      <NButton
        text
        type="primary"
        onClick={() => handleViewDetail(row)}
      >
        查看详情
      </NButton>
    ),
  },
]

const {
  data,
  isLoading,
  refetch,
} = useQuery({
  key: () => ['drug-list', queryParams.pageNum, queryParams.pageSize, queryParams.drugName ?? ''],
  query: () => getDrugList(queryParams),
  staleTime: 0,
})

watch(data, (newData) => {
  if (newData?.data) {
    dataList.value = newData.data.list || []
    totalCount.value = newData.data.total || 0
    pagination.itemCount = newData.data.total || 0
  }
})

// 查询
const handleSearch = () => {
  queryParams.pageNum = 1
  pagination.page = 1
  refetch()
}

// 重置
const handleReset = () => {
  resetQueryParams()
  queryParams.pageNum = 1
  queryParams.pageSize = 10
  pagination.page = 1
  pagination.pageSize = 10
  refetch()
}

// 查看详情
const handleViewDetail = (row: DrugInformation) => {
  const m = modal.create({
    title: '药品详情',
    preset: 'card',
    style: { width: '800px' },
    content: () => (
      <DetailModal
        drugInfo={row}
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
      :size="isMaxMd ? 'small' : undefined"
      class="flex-1"
      content-class="flex flex-col"
    >
      <div class="mb-2 flex justify-end gap-x-4 max-xl:mb-4 max-xl:flex-wrap">
        <NForm
          :model="queryParams"
          :inline="!isMaxLg"
          label-placement="left"
          class="max-lg:w-full max-lg:flex-col"
          :label-width="isMaxLg ? 80 : undefined"
        >
          <NFormItem
            label="药品名称"
            path="drugName"
          >
            <NInput
              v-model:value="queryParams.drugName"
              clearable
              placeholder="输入药品名称搜索"
              @keyup.enter="handleSearch"
            />
          </NFormItem>
        </NForm>
        <div class="flex gap-2">
          <NButton
            type="info"
            @click="handleSearch"
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
            @click="handleReset"
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
          :scroll-x="600"
          :columns="columns"
          :data="dataList"
          :row-key="(row: DrugInformation) => row.drugCode || row.drugId"
          :loading="isLoading"
          :bordered="true"
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
