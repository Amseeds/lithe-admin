<script setup lang="tsx">
import { useQuery } from '@pinia/colada'
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NDataTable,
  NSpace,
  NSelect,
  useMessage,
  useModal,
  NPopconfirm,
  NPagination,
} from 'naive-ui'
import { reactive, ref, watch } from 'vue'

import {
  getList,
  type TcmPrescription,
  type PrescriptionQueryParams,
} from '@/api/TCM/prescriptions.ts'
import { ScrollContainer } from '@/components'
import { useResettableReactive } from '@/composables'
import { download } from '@/utils/request'

import type { PaginationProps } from 'naive-ui'

defineOptions({
  name: 'TraditionalChineseMedicineWorks',
})

// 查询参数
const [queryParams, , resetQueryParams] = useResettableReactive<PrescriptionQueryParams>({
  prescriptionName: '',
  categoryId: null,
  pageNum: 1,
  pageSize: 10,
})

// 数据列表
const dataList = ref<TcmPrescription[]>([])

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

// 列表查询
const { data, isLoading, refetch } = useQuery({
  key: () => ['education-list', queryParams.pageNum, queryParams.pageSize],
  query: () => getList(queryParams),
  staleTime: 0,
})

watch(data, (newData) => {
  if (newData?.data) {
    console.log('newData:', newData)
    dataList.value = newData.data.list || []
    pagination.itemCount = newData.data.total || 0
  }
})

// 表格列
const columns = [
  { title: '标题', key: 'prescriptionName' },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render: (row: TcmPrescription) => (
      <NSpace>
        <NButton
          text
          type='primary'
          onClick={() => handleDownload(row)}
        >
          下载
        </NButton>
      </NSpace>
    ),
  },
]

// 下载
const handleDownload = (row: TcmPrescription) => {
  console.log('下载资料:', row)
  download({
    url: `/api/tcm-prescription/${row.id}/download`,
  })
}

// 查询
const handleSearch = () => {
  queryParams.pageNum = 1
  pagination.page = 1
  refetch()
}

// 重置
const handleReset = () => {
  resetQueryParams()
  pagination.page = 1
  refetch()
}
</script>

<template>
  <ScrollContainer wrapper-class="flex flex-col gap-y-4">
    <NCard
      class="flex-1"
      content-class="flex flex-col"
    >
      <div class="mb-4 flex items-center gap-4">
        <NForm
          :show-feedback="false"
          inline
          label-placement="left"
        >
          <NFormItem label="标题">
            <NInput
              v-model:value="queryParams.prescriptionName"
              placeholder="请输入标题"
              clearable
              style="width: 160px"
              @keyup.enter="handleSearch"
            />
          </NFormItem>
          <!-- <NFormItem label="分类">
            <NSelect
              v-model:value="queryParams.categoryId"
              :options="[
                { label: '中医经典方', value: '1' },
                { label: '常见病症推荐方', value: '2' },
                { label: '协定方', value: '3' },
              ]"
              style="width: 200px"
              clearable
              @update:value="handleSearch"
            />
          </NFormItem> -->
          <div class="flex gap-2">
            <NButton
              type="primary"
              @click="handleSearch"
              >查询</NButton
            >
            <NButton @click="handleReset">重置</NButton>
          </div>
        </NForm>
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
