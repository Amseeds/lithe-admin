<script setup lang="tsx">
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NDataTable,
  NRadioButton,
  NRadioGroup,
  NPagination,
} from 'naive-ui'
import { reactive, ref, watch, nextTick } from 'vue'

import { ScrollContainer } from '@/components'
import { useQuery } from '@pinia/colada'

import { getAdverseReactionList, type AdverseReactionMaterial } from '@/api/adverseReaction'
import { useResettableReactive } from '@/composables'

import type { PaginationProps } from 'naive-ui'

defineOptions({
  name: 'AdverseDrugReactions',
})

// 查询参数
const [queryParams, , resetQueryParams] = useResettableReactive({
  description: '',
  Type: '1',
})

// 数据列表
const dataList = ref<AdverseReactionMaterial[]>([])

// 分页
const pagination = reactive<PaginationProps>({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 15, 20],
  itemCount: 0,
  prefix: ({ itemCount }) => (itemCount ? <div>总数 {itemCount} 条</div> : null),
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

// 列表查询
const { data, isLoading, refetch } = useQuery({
  key: () => ['adverse-reaction-list', pagination.page ?? 1, pagination.pageSize ?? 15],
  query: () =>
    getAdverseReactionList({
      pageNum: pagination.page ?? 1,
      pageSize: pagination.pageSize ?? 15,
      description: queryParams.description,
      Type: queryParams.Type,
    }),
  staleTime: 0,
})

watch(data, (newData) => {
  if (newData) {
    dataList.value = newData.data.list
    pagination.itemCount = newData.data.total
  }
})

const fileBaseUrl = import.meta.env.VITE_FILE_BASE_URL

// 表格列
const columns = [
  {
    title: '标题',
    key: 'description',
    render: (row: AdverseReactionMaterial) => (
      <a
        href={`${fileBaseUrl}${row.filePath}`}
        target='_blank'
        rel='noopener noreferrer'
        class='text-blue-500 hover:text-blue-600 hover:underline'
      >
        {row.description}
      </a>
    ),
  },
]

// 查询
const handleSearch = () => {
  pagination.page = 1
  nextTick(() => refetch())
}

// 重置
const handleReset = () => {
  resetQueryParams()
  pagination.page = 1
  nextTick(() => refetch())
}
</script>

<template>
  <ScrollContainer wrapper-class="flex flex-col gap-y-4">
    <NCard
      class="flex-1"
      content-class="flex flex-col"
    >
      <div class="mb-4 flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <NRadioGroup
            v-model:value="queryParams.Type"
            @update:value="handleSearch"
          >
            <NRadioButton value="1">药物不良反应信息通报</NRadioButton>
            <NRadioButton value="2">药物警戒快讯</NRadioButton>
          </NRadioGroup>
          <NForm
            :show-feedback="false"
            inline
            label-placement="left"
          >
            <NFormItem label="标题">
              <NInput
                v-model:value="queryParams.description"
                placeholder="请输入标题"
                clearable
                style="width: 160px"
                @input="handleSearch"
              />
            </NFormItem>
          </NForm>
          <div class="flex gap-2">
            <NButton
              type="primary"
              @click="handleSearch"
              >查询</NButton
            >
            <NButton @click="handleReset">重置</NButton>
          </div>
        </div>
      </div>
      <NDataTable
        class="flex-1"
        :columns="columns"
        :data="dataList"
        :loading="isLoading"
        :bordered="true"
      />
      <div class="mt-3 flex justify-end">
        <NPagination v-bind="pagination" />
      </div>
    </NCard>
  </ScrollContainer>
</template>
