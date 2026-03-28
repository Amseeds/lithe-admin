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

import {
  getChineseMateriaMedicaList,
  type ChineseMateriaMedica,
  type ChineseMateriaMedicaQueryParams,
} from '@/api/chineseMateriaMedica'
import { ScrollContainer } from '@/components'
import { useInjection, useResettableReactive } from '@/composables'
import { mediaQueryInjectionKey } from '@/injection'

import DetailModal from './DetailModal.vue'

import type { PaginationProps } from 'naive-ui'

defineOptions({
  name: 'ChineseMateriaMedica',
})

const { isMaxMd, isMaxLg } = useInjection(mediaQueryInjectionKey)

const [queryParams, , resetQueryParams] = useResettableReactive<ChineseMateriaMedicaQueryParams>({
  drugName: '',
  pageNum: 1,
  pageSize: 10,
})

const dataList = ref<ChineseMateriaMedica[]>([])
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
    key: 'id',
    title: '编码',
    width: 80,
  },
  {
    key: 'name',
    title: '名称',
    ellipsis: {
      tooltip: true,
    },
    width: 120,
  },
  {
    key: 'sourceFile',
    title: '来源文件',
    ellipsis: {
      tooltip: true,
    },
    width: 140,
  },
  {
    key: 'natureFlavor',
    title: '性味',
    width: 180,
    render: (row: ChineseMateriaMedica) => {
      const nature = row.natureFlavor
      return nature ?? '-'
    },
  },
  {
    key: 'meridianTropism',
    title: '归经',
    ellipsis: {
      tooltip: true,
    },
    width: 200,
    render: (row: ChineseMateriaMedica) => row.meridianTropism || '-',
  },
  {
    key: 'functionsIndications',
    title: '功能主治',
    ellipsis: {
      tooltip: true,
    },
    render: (row: ChineseMateriaMedica) => row.functionsIndications || '-',
  },
  {
    key: 'createdAt',
    title: '创建时间',
    width: 180,
    render: (row: ChineseMateriaMedica) => {
      if (!row.createdAt) return '-'
      return new Date(row.createdAt).toLocaleString('zh-CN')
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row: ChineseMateriaMedica) => (
      <NButton
        text
        type='primary'
        onClick={() => handleViewDetail(row)}
      >
        查看详情
      </NButton>
    ),
  },
]

const { data, isLoading, refetch } = useQuery({
  key: () => [
    'chinese-materia-medica-list',
    queryParams.pageNum,
    queryParams.pageSize,
    queryParams.drugName ?? '',
  ],
  query: () => getChineseMateriaMedicaList(queryParams),
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
const handleViewDetail = (row: ChineseMateriaMedica) => {
  const m = modal.create({
    title: '中药材详情',
    preset: 'card',
    style: { width: '800px' },
    content: () => (
      <DetailModal
        info={row}
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
            label="名称"
            path="drugName"
          >
            <NInput
              v-model:value="queryParams.drugName"
              clearable
              placeholder="输入名称搜索"
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
          :scroll-x="800"
          :columns="columns"
          :data="dataList"
          :row-key="(row: ChineseMateriaMedica) => row.id"
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
