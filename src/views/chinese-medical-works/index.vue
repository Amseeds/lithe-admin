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
  useMessage,
  useModal,
  NPopconfirm,
  NPagination,
} from 'naive-ui'
import { reactive, ref, watch } from 'vue'

import {
  getList,
  deleteChineseMedicalWork,
  type ChineseMedicalWork,
  type WorkQueryParams,
} from '@/api/TCM/medicalWork.ts'
import { ScrollContainer } from '@/components'
import { useResettableReactive } from '@/composables'
import { download } from '@/utils/request'

import AddModal from './AddModal.vue'

import type { PaginationProps } from 'naive-ui'

defineOptions({
  name: 'TraditionalChineseMedicineWorks',
})

const message = useMessage()

// 查询参数
const [queryParams, , resetQueryParams] = useResettableReactive<WorkQueryParams>({
  title: '',
  pageNum: 1,
  pageSize: 10,
})

// 数据列表
const dataList = ref<ChineseMedicalWork[]>([])

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
  key: () => ['education-list', queryParams.pageNum, queryParams.pageSize, queryParams.title ?? ''],
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
  { title: '标题', key: 'title' },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render: (row: ChineseMedicalWork) => (
      <NSpace>
        <NButton
          text
          type='primary'
          onClick={() => handleDownload(row)}
        >
          下载
        </NButton>
        <NPopconfirm onPositiveClick={() => handleDelete(row)}>
          {{
            trigger: () => (
              <NButton
                text
                type='error'
              >
                删除
              </NButton>
            ),
            default: () => '确认删除该资料吗？',
          }}
        </NPopconfirm>
      </NSpace>
    ),
  },
]

// 下载
const handleDownload = (row: ChineseMedicalWork) => {
  console.log('下载资料:', row)
  download({
    url: `/api/education/${row.materialId}/download`,
  })
}

// 删除
const handleDelete = async (row: ChineseMedicalWork) => {
  try {
    await deleteChineseMedicalWork(row.materialId)
    message.success('删除成功')
    refetch()
  } catch (error) {
    message.error('删除失败')
  }
}

// 新增弹窗
const modal = useModal()

const handleAdd = () => {
  const m = modal.create({
    title: '新增资料',
    preset: 'card',
    style: { width: '500px' },
    content: () => (
      <AddModal
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

// 搜索词变化时重置分页
watch(
  () => queryParams.title,
  () => {
    queryParams.pageNum = 1
    pagination.page = 1
  },
)

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
      <div class="mb-4 flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <NForm
            :show-feedback="false"
            inline
            label-placement="left"
          >
            <NFormItem label="标题">
              <NInput
                v-model:value="queryParams.title"
                placeholder="请输入标题"
                clearable
                style="width: 160px"
                @keyup.enter="handleSearch"
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
        <div class="flex items-center gap-4">
          <NButton
            type="primary"
            @click="handleAdd"
            >+ 新增资料</NButton
          >
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
