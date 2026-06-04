<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ScrollContainer } from '@/components'
import { useInjection } from '@/composables'
import { getDiseaseDepartments, getDiseaseList, type DiseaseItem } from '@/api/diseaseKnowledge'
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NSelect,
  NDataTable,
  NPagination,
  type DataTableColumns,
  type PaginationProps,
} from 'naive-ui'
import { mediaQueryInjectionKey } from '@/injection'

defineOptions({ name: 'DiseaseKnowledge' })

const { isMaxMd, isMaxLg } = useInjection(mediaQueryInjectionKey)

// ===================== 筛选条件 =====================
const departmentId = ref<number | null>(null)
const diseaseName = ref('')
const departmentOptions = ref<{ label: string; value: number }[]>([])

// ===================== 列表 =====================
const tableData = ref<DiseaseItem[]>([])
const tableLoading = ref(false)

const pagination = reactive<PaginationProps>({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 15, 20],
  itemCount: 0,
  onUpdatePage: (page) => { pagination.page = page; loadData() },
  onUpdatePageSize: (pageSize) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    loadData()
  },
})

async function loadData() {
  tableLoading.value = true
  try {
    const { data } = await getDiseaseList({
      departmentId: departmentId.value || undefined,
      diseaseName: diseaseName.value || undefined,
      pageNum: pagination.page || 1,
      pageSize: pagination.pageSize || 10,
    })
    tableData.value = data.list || []
    pagination.itemCount = data.total || 0
  } finally { tableLoading.value = false }
}

function handleSearch() {
  pagination.page = 1
  loadData()
}

function handleReset() {
  departmentId.value = null
  diseaseName.value = ''
  pagination.page = 1
  loadData()
}

const columns: DataTableColumns<DiseaseItem> = [
  { title: '疾病名称', key: 'diseaseName', width: 150, ellipsis: { tooltip: true } },
  { title: '英文缩写', key: 'diseaseAbbr', width: 100, render(row) { return row.diseaseAbbr || '-' } },
  { title: '别名', key: 'aliasName', width: 160, render(row) { return row.aliasName || '-' }, ellipsis: { tooltip: true } },
  { title: 'ICD-10', key: 'icd10Code', width: 100, render(row) { return row.icd10Code || '-' } },
  { title: '疾病概述', key: 'diseaseOverview', minWidth: 320, render(row) { return row.diseaseOverview || '-' } },
  { title: '治疗方案', key: 'treatmentPlan', minWidth: 300, render(row) { return row.treatmentPlan || '-' } },
]

onMounted(async () => {
  const { data } = await getDiseaseDepartments()
  departmentOptions.value = data.map((d) => ({ label: d.departmentName, value: d.id }))
  loadData()
})
</script>

<template>
  <ScrollContainer wrapper-class="flex flex-col gap-y-4">
    <NCard
      class="flex-1"
      :size="isMaxMd ? 'small' : undefined"
      content-class="flex flex-col"
    >
      <div class="mb-4 flex items-center gap-4">
        <NForm
          :show-feedback="false"
          inline
          label-placement="left"
        >
          <NFormItem label="科室">
            <NSelect
              v-model:value="departmentId"
              :options="departmentOptions"
              placeholder="请选择科室"
              clearable
              style="width: 200px"
            />
          </NFormItem>
          <NFormItem label="疾病名称">
            <NInput
              v-model:value="diseaseName"
              placeholder="请输入疾病名称"
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
            />
          </NFormItem>
          <div class="flex gap-2">
            <NButton type="primary" @click="handleSearch">查询</NButton>
            <NButton @click="handleReset">重置</NButton>
          </div>
        </NForm>
      </div>
      <NDataTable
        class="flex-1"
        :columns="columns"
        :data="tableData"
        :loading="tableLoading"
        size="small"
        :bordered="false"
        :pagination="pagination"
        :max-height="9999"
      />
    </NCard>
  </ScrollContainer>
</template>

<style lang="scss" scoped>
:deep(.n-data-table-th) { background: #f8fafc !important; font-weight: 600; color: #334155; font-size: 12px; }
:deep(.n-data-table-td) { font-size: 13px; color: #475569; }
</style>
