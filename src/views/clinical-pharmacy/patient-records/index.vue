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
          :bordered="true"
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
        <div class="case-header">
          <div class="case-header-info">
            <span>姓名: {{ currentDetail.name }}</span>
            <span>性别: {{ currentDetail.sex }}</span>
            <span>年龄: {{ currentDetail.age }}</span>
            <span>住院号: {{ currentDetail.zyh }}</span>
          </div>
          <div class="case-header-date">入院时间: {{ currentDetail.admissionDate }}</div>
        </div>

        <!-- 基本信息 -->
        <div class="basic-info">
          <div class="section-title">基本信息</div>
          <div class="basic-info-grid">
            <NGrid
              :cols="3"
              :x-gap="16"
              :y-gap="8"
            >
              <NGi>
                <div class="basic-info-item"><span class="label">姓名：</span>{{ currentDetail.name }}</div>
              </NGi>
              <NGi>
                <div class="basic-info-item"><span class="label">性别：</span>{{ currentDetail.sex }}</div>
              </NGi>
              <NGi>
                <div class="basic-info-item"><span class="label">年龄：</span>{{ currentDetail.age }}</div>
              </NGi>
              <NGi>
                <div class="basic-info-item"><span class="label">民族：</span>{{ currentDetail.nation || '-' }}</div>
              </NGi>
              <NGi>
                <div class="basic-info-item"><span class="label">婚姻状况：</span>{{ currentDetail.marriage || '-' }}</div>
              </NGi>
              <NGi>
                <div class="basic-info-item"><span class="label">报告人：</span>{{ currentDetail.informant || '-' }}</div>
              </NGi>
              <NGi>
                <div class="basic-info-item"><span class="label">职业：</span>{{ currentDetail.job || '-' }}</div>
              </NGi>
              <NGi>
                <div class="basic-info-item"><span class="label">工作单位：</span>{{ currentDetail.workUnit || '-' }}</div>
              </NGi>
              <NGi>
                <div class="basic-info-item"><span class="label">可靠性：</span>{{ currentDetail.reliability || '-' }}</div>
              </NGi>
              <NGi :span="3">
                <div class="basic-info-item"><span class="label">籍贯：</span>{{ currentDetail.address || '-' }}</div>
              </NGi>
              <NGi :span="3">
                <div class="basic-info-item"><span class="label">家庭住址：</span>{{ currentDetail.address || '-' }}</div>
              </NGi>
            </NGrid>
          </div>
        </div>

        <!-- 病历内容 -->
        <template v-if="currentDetail.lasDtoList?.length">
          <NDivider class="case-divider" />
          <div class="case-content">
            <div
              v-for="(item, index) in currentDetail.lasDtoList"
              :key="index"
              class="case-content-item"
            >
              <div class="case-content-title">{{ item.caseContent }}</div>
              <div class="case-content-text">{{ item.medicalCaseContent }}</div>
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
/* ================================================================
   弹窗圆角
   ================================================================ */
::deep(.n-modal),
::deep(.n-card) {
  border-radius: 14px;
}

/* ================================================================
   详情内容区
   ================================================================ */
.case-detail {
  font-size: 13px;
  line-height: 1.7;
  color: #475569;
}

/* 头部信息区 */
.case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.1);
  margin-bottom: 16px;
}

.case-header-info {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  font-size: 14px;
  color: #334155;
}

.case-header-info span {
  font-weight: 500;
}

.case-header-date {
  font-size: 13px;
  color: #64748b;
}

/* ================================================================
   区块标题
   ================================================================ */
.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 16px 0 12px;
  padding-left: 12px;
  border-left: 4px solid #0ea5e9;
  letter-spacing: 0.01em;
}

/* 基本信息网格 */
.basic-info-grid {
  background: #f8fafc;
  border: 1px solid rgba(64, 158, 255, 0.08);
  border-radius: 10px;
  padding: 16px;
}

.basic-info-item {
  font-size: 13px;
  color: #475569;
  line-height: 1.8;
}

.basic-info-item .label {
  font-weight: 600;
  color: #334155;
}

/* ================================================================
   病历内容
   ================================================================ */
.case-content {
  margin-top: 8px;
}

.case-content-item {
  margin-bottom: 16px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 10px;
  border: 1px solid rgba(64, 158, 255, 0.06);
}

.case-content-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.08);
}

.case-content-text {
  font-size: 13px;
  color: #475569;
  line-height: 1.8;
  white-space: pre-wrap;
}

/* ================================================================
   弹窗滚动条
   ================================================================ */
.case-detail::-webkit-scrollbar {
  width: 5px;
}

.case-detail::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.case-detail::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.case-detail::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* ================================================================
   NGrid 样式优化
   ================================================================ */
::deep(.n-grid) {
  font-size: 13px;
}

/* ================================================================
   NDivider 样式
   ================================================================ */
::deep(.n-divider:not(.n-divider--vertical)) {
  margin: 16px 0;
  border-color: rgba(64, 158, 255, 0.08);
}
</style>
