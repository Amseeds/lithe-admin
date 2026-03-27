<script setup lang="ts">
import {
  NButton,
  NCard,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NGrid,
  NGi,
  NDivider,
  NPagination,
  useMessage,
  type DataTableColumns,
  type PaginationProps,
} from 'naive-ui'
import { ref, reactive, h, onMounted } from 'vue'

import { ScrollContainer } from '@/components'
import { getPatientList, getPatientDetail, type PatientRecord, type PatientQueryParams } from '@/api'

import FollowUpModal from './FollowUpModal.vue'

defineOptions({
  name: 'PatientRecords',
})

const message = useMessage()

// 表格数据
const tableData = ref<PatientRecord[]>([])
const loading = ref(false)

// 详情弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('入院记录详情')
const detailLoading = ref(false)

// 当前选中患者详情
const currentDetail = ref<PatientRecord>({} as PatientRecord)

// 随访弹窗
const followUpVisible = ref(false)
const followUpUserId = ref('')

// 筛选参数
const queryParams = reactive<PatientQueryParams>({
  zyh: '',
  name: '',
  pageNum: 1,
  pageSize: 10,
})

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

// 获取列表数据
const getList = async () => {
  loading.value = true
  try {
    const { data } = await getPatientList(queryParams)
    tableData.value = data.list || []
    pagination.itemCount = data.total || 0
  } catch (error) {
    message.error('获取数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 重置查询
const resetQuery = () => {
  queryParams.zyh = ''
  queryParams.name = ''
  queryParams.pageNum = 1
  pagination.page = 1
  getList()
}

// 查看详情
const viewRow = async (row: PatientRecord) => {
  dialogVisible.value = true
  detailLoading.value = true
  try {
    const { data } = await getPatientDetail({ zyh: row.zyh })
    currentDetail.value = data
  } catch (error) {
    message.error('获取详情失败')
    console.error(error)
  } finally {
    detailLoading.value = false
  }
}

// 随访功能
const followUp = (row: PatientRecord) => {
  followUpUserId.value = row.zyh
  followUpVisible.value = true
}

// 随访成功回调
const onFollowUpSuccess = () => {
//   message.success('随访计划创建成功')
}

// 表格列定义
const columns: DataTableColumns<PatientRecord> = [
  {
    title: '住院号',
    key: 'zyh',
    width: 140,
  },
  {
    title: '姓名',
    key: 'name',
    width: 100,
  },
  {
    title: '性别',
    key: 'sex',
    width: 80,
  },
  {
    title: '年龄',
    key: 'age',
    width: 80,
  },
  {
    title: '入院时间',
    key: 'admissionDate',
    width: 180,
    render: (row) => formatDateTime(row.admissionDate),
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    render: (row) =>
      h('div', { class: 'flex gap-2' }, [
        h(
          NButton,
          {
            type: 'primary',
            size: 'small',
            text: true,
            onClick: () => viewRow(row),
          },
          { default: () => '查看详情' },
        ),
        h(
          NButton,
          {
            type: 'success',
            size: 'small',
            text: true,
            onClick: () => followUp(row),
          },
          { default: () => '随访' },
        ),
      ]),
  },
]

// 分页配置
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
    getList()
  },
  onUpdatePageSize: (pageSize) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    queryParams.pageSize = pageSize
    queryParams.pageNum = 1
    getList()
  },
})

// 初始化
onMounted(() => {
  getList()
})
</script>

<template>
  <ScrollContainer wrapper-class="flex flex-col gap-y-4">
    <NCard
      class="flex-1"
      content-class="flex flex-col"
    >
      <!-- 查询区域 -->
      <div class="mb-2 flex justify-end gap-x-4">
        <NForm
          :model="queryParams"
          inline
          label-placement="left"
        >
          <NFormItem label="住院号">
            <NInput
              v-model:value="queryParams.zyh"
              placeholder="请输入住院号"
              clearable
              @keyup.enter="getList"
            />
          </NFormItem>
          <NFormItem label="姓名">
            <NInput
              v-model:value="queryParams.name"
              placeholder="请输入姓名"
              clearable
              @keyup.enter="getList"
            />
          </NFormItem>
        </NForm>
        <div class="flex gap-2">
          <NButton
            type="info"
            @click="getList"
            :loading="loading"
            :disabled="loading"
          >
            <template #icon>
              <span class="iconify ph--magnifying-glass" />
            </template>
            查询
          </NButton>
          <NButton
            type="warning"
            @click="resetQuery"
          >
            <template #icon>
              <span class="iconify ph--arrow-clockwise" />
            </template>
            重置
          </NButton>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="flex flex-1 flex-col">
        <NDataTable
          class="flex-1"
          :columns="columns"
          :data="tableData"
          :loading="loading"
          :bordered="false"
          :scroll-x="800"
          :remote="true"
        />
        <div class="mt-3 flex justify-end">
          <NPagination
            v-bind="pagination"
            :disabled="loading"
          />
        </div>
      </div>
    </NCard>

    <!-- 详情弹窗 -->
    <NModal
      v-model:show="dialogVisible"
      preset="card"
      :title="dialogTitle"
      style="width: 800px; max-width: 90vw"
      :bordered="false"
    >
      <div
        v-if="detailLoading"
        class="py-8 text-center"
      >
        加载中...
      </div>
      <div
        v-else
        class="case-detail"
      >
        <!-- 头部信息 -->
        <div class="flex justify-between items-center pb-3 border-b border-neutral-200 dark:border-neutral-700">
          <div class="flex gap-4">
            <span>姓名: {{ currentDetail.name }}</span>
            <span>性别: {{ currentDetail.sex }}</span>
            <span>年龄: {{ currentDetail.age }}</span>
            <span>住院号: {{ currentDetail.zyh }}</span>
          </div>
          <div>入院时间: {{ currentDetail.admissionDate }}</div>
        </div>

        <!-- 基本信息 -->
        <div class="mt-4">
          <div class="text-lg font-semibold mb-3">基本信息</div>
          <NGrid
            :cols="3"
            :x-gap="16"
            :y-gap="8"
          >
            <NGi>
              <span class="font-medium">姓名：</span>{{ currentDetail.name }}
            </NGi>
            <NGi>
              <span class="font-medium">性别：</span>{{ currentDetail.sex }}
            </NGi>
            <NGi>
              <span class="font-medium">年龄：</span>{{ currentDetail.age }}
            </NGi>
            <NGi>
              <span class="font-medium">民族：</span>{{ currentDetail.nation || '-' }}
            </NGi>
            <NGi>
              <span class="font-medium">婚姻状况：</span>{{ currentDetail.marriage || '-' }}
            </NGi>
            <NGi>
              <span class="font-medium">报告人：</span>{{ currentDetail.informant || '-' }}
            </NGi>
            <NGi>
              <span class="font-medium">职业：</span>{{ currentDetail.job || '-' }}
            </NGi>
            <NGi>
              <span class="font-medium">工作单位：</span>{{ currentDetail.workUnit || '-' }}
            </NGi>
            <NGi>
              <span class="font-medium">可靠性：</span>{{ currentDetail.reliability || '-' }}
            </NGi>
            <NGi :span="3">
              <span class="font-medium">籍贯：</span>{{ currentDetail.address || '-' }}
            </NGi>
            <NGi :span="3">
              <span class="font-medium">家庭住址：</span>{{ currentDetail.address || '-' }}
            </NGi>
          </NGrid>
        </div>

        <!-- 病历内容 -->
        <template v-if="currentDetail.lasDtoList?.length">
          <NDivider />
          <div
            v-for="(item, index) in currentDetail.lasDtoList"
            :key="index"
            class="mb-4"
          >
            <div class="text-lg font-semibold mb-2">{{ item.caseContent }}</div>
            <div class="text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
              {{ item.medicalCaseContent }}
            </div>
          </div>
        </template>
      </div>
    </NModal>

    <!-- 随访弹窗 -->
    <FollowUpModal
      v-model:show="followUpVisible"
      :user-id="followUpUserId"
      @success="onFollowUpSuccess"
    />
  </ScrollContainer>
</template>

<style scoped>
.case-detail {
  font-size: 14px;
  line-height: 1.6;
}
</style>
