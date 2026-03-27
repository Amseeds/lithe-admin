<script setup lang="tsx">
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NButton,
  NDataTable,
  NSpace,
  NRadioButton,
  NRadioGroup,
  NPopconfirm,
  useMessage,
  useModal,
} from 'naive-ui'

import { ScrollContainer } from '@/components'
import { useQuery } from '@pinia/colada'
import { ref, watch } from 'vue'

import {
  getEducationList,
  deleteEducation,
  toggleFavorite,
  CATEGORY_OPTIONS,
  type EducationMaterial,
  type EducationQueryParams,
} from '@/api/medicationEducation'
import { useResettableReactive } from '@/composables'
import { download } from '@/utils/request'
import AddModal from './AddModal.vue'

defineOptions({
  name: 'MedicationEducation',
})

const message = useMessage()

// 查询参数
const [queryParams, , resetQueryParams] = useResettableReactive<EducationQueryParams>({
  title: '',
  category: undefined,
  CheckFavorites: '0',
  pageNum: 1,
  pageSize: 15,
})

// 数据列表
const dataList = ref<EducationMaterial[]>([])
const totalCount = ref(0)

// 列表查询
const { data, isLoading, refetch } = useQuery({
  key: () => [
    'education-list',
    queryParams.pageNum,
    queryParams.pageSize,
    queryParams.title ?? '',
    queryParams.category ?? '',
    queryParams.CheckFavorites ?? '0',
  ],
  query: () => getEducationList(queryParams),
  staleTime: 0,
})

watch(data, (newData) => {
  if (newData?.data) {
    dataList.value = newData.data.list || []
    totalCount.value = newData.data.total || 0
  }
})

// 分类选项
const categoryOptions = CATEGORY_OPTIONS.map((item) => ({
  label: item.label,
  value: item.value,
}))

// 表格列
const columns = [
  { title: '标题', key: 'title' },
  { title: '关键词', key: 'keywords' },
  { title: '简介', key: 'description' },
  {
    title: '分类',
    key: 'category',
    render: (row: EducationMaterial) => {
      const option = CATEGORY_OPTIONS.find((o) => o.value === String(row.category))
      return option?.label ?? row.category
    },
  },
  {
    title: '更新时间',
    key: 'updateTime',
    render: (row: EducationMaterial) => {
      if (!row.updateTime) return '-'
      return new Date(row.updateTime).toLocaleString('zh-CN')
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render: (row: EducationMaterial) => (
      <NSpace>
        <NButton
          text
          type={row.isFavorited ? 'warning' : 'primary'}
          onClick={() => handleFavorite(row)}
        >
          {row.isFavorited ? '取消收藏' : '收藏'}
        </NButton>
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

// 收藏
const handleFavorite = async (row: EducationMaterial) => {
  try {
    await toggleFavorite(row.materialId)
    message.success(row.isFavorited ? '取消收藏成功' : '收藏成功')
    refetch()
  } catch (error) {
    message.error('操作失败')
  }
}

// 下载
const handleDownload = (row: EducationMaterial) => {
  console.log('下载资料:', row)
  download({
    url: `/api/education/${row.materialId}/download`,
  })
}

// 删除
const handleDelete = async (row: EducationMaterial) => {
  try {
    await deleteEducation(row.materialId)
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

// 查询
const handleSearch = () => {
  queryParams.pageNum = 1
  refetch()
}

// 重置
const handleReset = () => {
  resetQueryParams()
  refetch()
}

// 分页变化
const handlePageChange = (page: number) => {
  queryParams.pageNum = page
}

const handlePageSizeChange = (size: number) => {
  queryParams.pageSize = size
  queryParams.pageNum = 1
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
            <NFormItem label="资料分类">
              <NSelect
                :key="queryParams.category"
                v-model:value="queryParams.category"
                :options="categoryOptions"
                placeholder="请选择"
                clearable
                style="width: 160px"
                @update:value="handleSearch"
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
          <NRadioGroup
            v-model:value="queryParams.CheckFavorites"
            @update:value="handleSearch"
          >
            <NRadioButton value="0">全部</NRadioButton>
            <NRadioButton value="1">收藏</NRadioButton>
          </NRadioGroup>
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
        :pagination="{
          page: queryParams.pageNum,
          pageSize: queryParams.pageSize,
          itemCount: totalCount,
          pageSizes: [15, 20, 25],
          showSizePicker: true,
          onChange: handlePageChange,
          onUpdatePageSize: handlePageSizeChange,
        }"
        :bordered="true"
      />
    </NCard>
  </ScrollContainer>
</template>
