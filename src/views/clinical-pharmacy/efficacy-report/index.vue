<script setup lang="ts">
import {
  NSelect,
  NCard,
  NDataTable,
  NModal,
  NDrawer,
  NDrawerContent,
  NButton,
  NInput,
  NSpace,
  NTag,
  NStatistic,
  useMessage,
  type SelectOption,
} from 'naive-ui'
import type { Report, ReportFilters, ReportDetail } from './mock/types'
import type { DataTableColumns } from 'naive-ui'

import { h, ref, computed, onMounted } from 'vue'

import {
  statCards,
  reportList,
  generateReportDetail,
  filterReports,
  reportTypeMap,
  efficacyRatingMap,
  archiveStatusMap,
  reportStatusMap,
  mockPatients,
} from './mock/data'
import { getReportList, createEfficacyReport, getEfficacyReport } from '@/api/efficacyReport'
import { getPatientList, type PatientQueryParams } from '@/api/patientRecords'

defineOptions({
  name: 'EfficacyReport',
})

const message = useMessage()

// ============================================================
// 筛选栏状态
// ============================================================
const filters = ref({
  reportType: '',
  reportStatus: '',
  searchKeyword: '',
})

const reportTypeOptions: SelectOption[] = [
  { label: '全部', value: '' },
  { label: '治疗效果评估报告', value: '治疗效果评估报告' },
  // { label: '季度评估', value: '季度评估' },
  // { label: '年度全面', value: '年度全面' },
  // { label: '复诊专项', value: '复诊专项' },
]

const reportStatusOptions: SelectOption[] = [
  { label: '全部', value: '' },
  // { label: '草稿', value: '草稿' },
  { label: '未归档', value: '未归档' },
  // { label: '已归档', value: '已归档' },
  // { label: '已作废', value: '已作废' },
]

// 过滤后的报告列表
// const filteredReports = computed(() => filterReports(filters.value))
const filteredReports = ref([])
const loading = ref(false)

// 获取列表数据
const getList = async () => {
  loading.value = true
  try {
    const { data } = await getReportList(filters.value)
    filteredReports.value = data.list || []
    // pagination.itemCount = data.total || 0
  } catch (error) {
    message.error('获取数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}
// 查询按钮点击
function handleQuery() {
  getList()
  message.success('查询成功')
}

// 重置按钮点击
function handleReset() {
  filters.value = {
    reportType: '',
    reportStatus: '',
    searchKeyword: '',
  }
  message.info('已重置筛选条件')
}

// ============================================================
// 统计卡片
// ============================================================
const cardChangeType = (type: 'increase' | 'decrease' | 'neutral') => {
  if (type === 'increase') return { color: '#18a058', icon: '↑' }
  if (type === 'decrease') return { color: '#d03050', icon: '↓' }
  return { color: '#666', icon: '-' }
}

// ============================================================
// 报告主列表 - 8列
// ============================================================
const columns: DataTableColumns<Report> = [
  {
    title: '报告编号',
    key: 'reportNo',
    width: 200,
  },
  {
    title: '患者姓名',
    key: 'patientName',
    width: 100,
  },
  {
    title: '住院号',
    key: 'medicalRecordNo',
    width: 120,
  },
  {
    title: '报告类型',
    key: 'reportType',
    width: 140,
    render(row: Report) {
      return reportTypeMap[row.reportType] || row.reportType
    },
  },
  {
    title: '报告周期',
    key: 'reportPeriod',
    width: 220,
    render(row: Report) {
      return `${row.reportPeriodStart} 至 ${row.reportPeriodEnd}`
    },
  },
  {
    title: '生成医生',
    key: 'generateDoctor',
    width: 120,
  },
  {
    title: '生成时间',
    key: 'generateTime',
    width: 120,
  },
  {
    title: '报告状态',
    key: 'reportStatus',
    width: 90,
    render(row: Report) {
      const tagType: 'default' | 'warning' | 'success' | 'error' =
        row.reportStatus === 'draft' ? 'warning' : row.reportStatus === '已归档' ? 'error' : 'error'
      return h(NTag, { type: tagType, size: 'small' }, () => row.reportStatus)
    },
  },
  {
    title: '疗效评级',
    key: 'efficacyRating',
    width: 100,
    // render(row: Report) {
    //   const ratingText = efficacyRatingMap[row.efficacyRating]
    //   const colorMap: Record<string, string> = {
    //     优秀达标: '#18a058',
    //     稳定达标: '#2080f0',
    //     部分达标: '#f0a020',
    //     未达标: '#d03050',
    //   }
    //   return h('span', { style: { color: colorMap[ratingText] || '#666' } }, ratingText)
    // },
    render(row: Report) {
      const tagType: 'default' | 'warning' | 'success' | 'error' =
        row.efficacyRating === '良好'
          ? 'success'
          : row.efficacyRating === '已归档'
            ? 'error'
            : 'error'
      return h(NTag, { type: tagType, size: 'small' }, () => row.efficacyRating)
    },
  },
  // {
  //   title: '归档状态',
  //   key: 'archiveStatus',
  //   width: 90,
  //   render(row: Report) {
  //     return h(
  //       NTag,
  //       { type: row.archiveStatus === 'archived' ? 'success' : 'default', size: 'small' },
  //       () => archiveStatusMap[row.archiveStatus],
  //     )
  //   },
  // },
  {
    title: '操作',
    key: 'actions',
    width: 220,
    fixed: 'right',
    render(row: Report) {
      const buttons: any[] = []
      buttons.push(
        h(
          NButton,
          { size: 'tiny', type: 'info', onClick: () => handleViewDetail(row) },
          () => '查看详情',
        ),
      )
      // if (row.reportStatus === 'draft') {
      //   buttons.push(
      //     h(
      //       NButton,
      //       { size: 'tiny', type: 'default', onClick: () => handleEdit(row) },
      //       () => '编辑',
      //     ),
      //   )
      //   buttons.push(
      //     h(
      //       NButton,
      //       { size: 'tiny', type: 'default', onClick: () => handlePreview(row) },
      //       () => '预览',
      //     ),
      //   )
      //   buttons.push(
      //     h(
      //       NButton,
      //       { size: 'tiny', type: 'error', onClick: () => handleDelete(row) },
      //       () => '删除',
      //     ),
      //   )
      //   buttons.push(
      //     h(
      //       NButton,
      //       { size: 'tiny', type: 'primary', onClick: () => handleArchive(row) },
      //       () => '归档',
      //     ),
      //   )
      // } else if (row.reportStatus === 'archived') {
      //   buttons.push(
      //     h(
      //       NButton,
      //       { size: 'tiny', type: 'info', onClick: () => handleViewDetail(row) },
      //       () => '查看详情',
      //     ),
      //   )
      //   buttons.push(
      //     h(
      //       NButton,
      //       { size: 'tiny', type: 'default', onClick: () => handleExportPdf(row) },
      //       () => '导出PDF',
      //     ),
      //   )
      //   buttons.push(
      //     h(
      //       NButton,
      //       { size: 'tiny', type: 'default', onClick: () => handlePrint(row) },
      //       () => '打印',
      //     ),
      //   )
      // } else if (row.reportStatus === 'obsolete') {
      //   buttons.push(
      //     h(
      //       NButton,
      //       { size: 'tiny', type: 'info', onClick: () => handleViewDetail(row) },
      //       () => '查看详情',
      //     ),
      //   )
      // }

      return h(NSpace, { size: 6 }, () => buttons)
    },
  },
]

// 操作按钮处理函数
function handleEdit(row: Report) {
  message.warning(`编辑报告：${row.reportNo}`)
}

function handlePreview(row: Report) {
  currentReport.value = row
  currentDetail.value = generateReportDetail(row)
  detailModalVisible.value = true
}

function handleDelete(row: Report) {
  message.warning(`删除报告：${row.reportNo}`)
}

function handleArchive(row: Report) {
  message.success(`归档报告：${row.reportNo}`)
}

async function handleViewDetail(row: Report) {
  currentReport.value = row
  // currentDetail.value = generateReportDetail(row)
  const { code, data } = await getEfficacyReport(row.id)
  console.log(code, 'code===')
  console.log(data, 'data===')
  if (code === 200) {
    currentDetail.value = data
  }
  detailModalVisible.value = true
}

function handleExportPdf(row: Report) {
  message.warning(`导出PDF：${row.reportNo}`)
}

function handlePrint(row: Report) {
  message.warning(`打印报告：${row.reportNo}`)
}

// ============================================================
// 报告详情弹窗
// ============================================================
const detailModalVisible = ref(false)
const currentReport = ref<Report | null>(null)
const currentDetail = ref<ReportDetail | null>(null)

function closeDetailModal() {
  detailModalVisible.value = false
}

function handleExportFromModal() {
  message.warning('导出PDF')
}

function handlePrintFromModal() {
  message.warning('打印报告')
}

// ============================================================
// 报告生成抽屉
// ============================================================
const drawerVisible = ref(false)

const drawerForm = ref({
  medicalRecordNo: '',
  // reportType: 'monthly' as 'monthly' | 'quarterly' | 'annual' | 'followup',
  // suggestions: '',
})

const patientOptions = ref<SelectOption[]>([])
const patientLoading = ref(false)

const loadPatientList = async (searchValue: string) => {
  patientLoading.value = true
  try {
    const params: PatientQueryParams = {
      zyh: searchValue,
      pageNum: 1,
      pageSize: 100,
    }
    const { data } = await getPatientList(params)
    const list = data.list || []
    patientOptions.value = list.map((item) => ({
      label: `${item.name} (${item.zyh})`,
      value: item.zyh,
    }))
  } catch (error) {
    message.error('获取患者列表失败')
    console.error(error)
  } finally {
    patientLoading.value = false
  }
}

const handlePatientSearch = (query: string) => {
  loadPatientList(query)
}

const drawerReportTypeOptions: SelectOption[] = [
  { label: '月度随访', value: 'monthly' },
  { label: '季度评估', value: 'quarterly' },
  { label: '年度全面', value: 'annual' },
  { label: '复诊专项', value: 'followup' },
]

function openDrawer() {
  drawerVisible.value = true
}

function closeDrawer() {
  drawerVisible.value = false
  drawerForm.value = {
    medicalRecordNo: '',
    // reportType: 'monthly',
    // suggestions: '',
  }
}

function handleSaveDraft() {
  message.success('已保存为草稿')
  closeDrawer()
}

async function handleGenerateAndArchive() {
  console.log(drawerForm.value, '===handleGenerateAndArchive')
  const { code, res } = await createEfficacyReport({
    medicalRecordNo: drawerForm.value.medicalRecordNo,
    // reportType: drawerForm.value.reportType,
    // status: 'archived',
  })
  if (code === 200) {
    message.success('生成成功，报告已归档')
    closeDrawer()
  }
}

// ============================================================
// 表格数据
// ============================================================
const tableData = computed(() => filteredReports.value)

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="efficacy-report-page">
    <!-- ============================================================ -->
    <!-- 1. 顶部筛选栏 -->
    <!-- ============================================================ -->
    <NCard
      class="filter-bar"
      size="small"
    >
      <div class="filter-bar-inner">
        <div class="filter-controls">
          <div class="filter-item">
            <span class="filter-label">报告类型：</span>
            <NSelect
              v-model:value="filters.reportType"
              :options="reportTypeOptions"
              style="width: 160px"
              size="small"
            />
          </div>
          <div class="filter-item">
            <span class="filter-label">报告状态：</span>
            <NSelect
              v-model:value="filters.reportStatus"
              :options="reportStatusOptions"
              style="width: 120px"
              size="small"
            />
          </div>
          <!-- <div class="filter-item">
            <span class="filter-label">患者姓名/病历号：</span>
            <NInput
              v-model:value="filters.searchKeyword"
              placeholder="请输入关键词"
              style="width: 180px"
              size="small"
              clearable
            />
          </div> -->
          <div class="filter-buttons">
            <NButton
              size="small"
              type="primary"
              @click="handleQuery"
              >查询</NButton
            >
            <NButton
              size="small"
              @click="handleReset"
              >重置</NButton
            >
          </div>
        </div>
        <div class="filter-right">
          <NButton
            size="small"
            type="primary"
            @click="openDrawer"
            >生成新报告</NButton
          >
        </div>
      </div>
    </NCard>

    <!-- ============================================================ -->
    <!-- 2. 统计卡片组 -->
    <!-- ============================================================ -->
    <!-- <div class="stat-cards">
      <NCard
        v-for="card in statCards"
        :key="card.title"
        class="stat-card"
        size="small"
      >
        <NStatistic
          :label="card.title"
          :value="card.value"
        >
          <template #suffix>
            <span :style="{ color: cardChangeType(card.changeType).color, fontSize: '14px' }">
              {{ cardChangeType(card.changeType).icon }}{{ card.change }}
            </span>
          </template>
        </NStatistic>
      </NCard>
    </div> -->

    <!-- ============================================================ -->
    <!-- 3. 报告主列表 -->
    <!-- ============================================================ -->
    <NCard
      class="report-table-card"
      size="small"
    >
      <NDataTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        :scroll-x="1200"
      />
    </NCard>

    <!-- ============================================================ -->
    <!-- 4. 报告详情弹窗 -->
    <!-- ============================================================ -->
    <NModal
      v-model:show="detailModalVisible"
      preset="card"
      style="width: 820px; max-width: 95vw"
      :mask-closable="true"
    >
      <template #header>
        <div class="modal-header-centered">
          <div class="modal-title">{{ currentDetail?.reportTitle }}</div>
          <div class="modal-report-no">报告编号：{{ currentDetail?.reportNo }}</div>
        </div>
      </template>
      <div
        v-if="currentDetail"
        class="report-detail"
      >
        <!-- 报告头部 -->
        <div class="detail-section report-header-section">
          <div class="patient-info-table">
            <div class="patient-info-row">
              <span>患者姓名：{{ currentDetail.patientName }}</span>
              <span>性别：{{ currentDetail.patientGender }}</span>
              <span>年龄：{{ currentDetail.patientAge }}</span>
              <span>病历号：{{ currentDetail.medicalRecordNo }}</span>
            </div>
            <div class="patient-info-row">
              <span>糖尿病类型：{{ currentDetail.diabetesType }}</span>
              <!-- <span>确诊时间：{{ currentDetail.diagnosisDate }}</span> -->
              <!-- <span>病程：{{ currentDetail.diseaseDuration }}年</span> -->
            </div>
            <div class="patient-info-row">
              <span>所属分层：{{ currentDetail.stratification }}</span>
              <span
                >报告周期：{{ currentDetail.reportPeriodStart }} 至
                {{ currentDetail.reportPeriodEnd }}</span
              >
            </div>
            <div class="patient-info-row">
              <span>生成医生：{{ currentDetail.generateDoctor }}</span>
              <span>生成时间：{{ currentDetail.generateTime }}</span>
              <span>所属科室：{{ currentDetail.department }}</span>
            </div>
          </div>
        </div>

        <!-- 一、核心控糖目标基准 -->
        <div class="detail-section">
          <h3 class="section-title">一、核心控糖目标基准</h3>
          <p class="section-desc">■ 本报告评估基准，为患者当前生效的个体化控糖目标：</p>
          <ul class="target-list">
            <li>糖化血红蛋白（HbA1c）：{{ currentDetail.glucoseControlTarget.hba1c }}</li>
            <li>空腹血糖：{{ currentDetail.glucoseControlTarget.fastingGlucose }} mmol/L</li>
            <li>
              餐后2小时血糖：{{ currentDetail.glucoseControlTarget.postprandialGlucose }} mmol/L
            </li>
            <li>血压目标：{{ currentDetail.glucoseControlTarget.bloodPressure }} mmHg</li>
            <li>
              低密度脂蛋白胆固醇：{{ currentDetail.glucoseControlTarget.ldlCholesterol }} mmol/L
            </li>
          </ul>
        </div>

        <!-- 二、本周期治疗效果评估 -->
        <div class="detail-section">
          <h3 class="section-title">二、本周期治疗效果评估</h3>
          <p class="section-desc">■ 核心指标达标情况总结：</p>
          <p class="section-content">
            本周期内，患者糖化血红蛋白平均水平{{ currentDetail.coreIndicator.hba1cAvg }}%，达标率{{
              currentDetail.coreIndicator.hba1cRate
            }}%；空腹血糖平均水平{{ currentDetail.coreIndicator.fastingGlucoseAvg }}mmol/L，达标率{{
              currentDetail.coreIndicator.fastingGlucoseRate
            }}%；餐后2小时血糖平均水平{{
              currentDetail.coreIndicator.postprandialGlucoseAvg
            }}mmol/L，达标率{{
              currentDetail.coreIndicator.postprandialGlucoseRate
            }}%；血压、血脂均{{
              currentDetail.coreIndicator.bloodPressureStatus === '达标' ? '达标' : '未达标'
            }}。
          </p>
          <p
            class="section-desc"
            style="margin-top: 12px"
          >
            ■ 用药安全性总结：
          </p>
          <p class="section-content">
            本周期内，患者用药依从性{{ currentDetail.medicationSafety.compliance }}，共发生{{
              currentDetail.medicationSafety.adverseReactions
            }}次药物不良反应，{{
              currentDetail.medicationSafety.liverKidneyAbnormal
            }}用药相关肝肾功能异常，{{
              currentDetail.medicationSafety.drugInteractionRisk
            }}药物联用风险。
          </p>
          <p
            class="section-desc"
            style="margin-top: 12px"
          >
            ■ 整体疗效评级：{{ efficacyRatingMap[currentDetail.efficacyRating] }}
          </p>
        </div>

        <!-- 三、本周期疾病进展情况 -->
        <div class="detail-section">
          <h3 class="section-title">三、本周期疾病进展情况</h3>
          <p class="section-desc">■ 胰岛功能变化：</p>
          <p class="section-content">
            本周期患者空腹C肽平均水平{{
              currentDetail.isletFunction.fastingCPeptide
            }}pmol/L，较上周期{{ currentDetail.isletFunction.changeTrend }}，胰岛功能{{
              currentDetail.isletFunction.functionStatus
            }}。
          </p>
          <p
            class="section-desc"
            style="margin-top: 12px"
          >
            ■ 并发症变化情况：
          </p>
          <p class="section-content">
            本周期内{{ currentDetail.complications.newComplications }}，原有{{
              currentDetail.complications.existingComplications
            }}，{{ currentDetail.complications.existingStatus }}，当前并发症分期为{{
              currentDetail.complications.currentStage
            }}。
          </p>
          <p
            class="section-desc"
            style="margin-top: 12px"
          >
            ■ 整体病程评估：{{ currentDetail.diseaseProgression }}
          </p>
        </div>

        <!-- 四、治疗方案调整建议 -->
        <div class="detail-section">
          <h3 class="section-title">四、治疗方案调整建议</h3>
          <ul class="suggestion-list">
            <li>
              <strong>控糖方案调整建议：</strong
              >{{ currentDetail.treatmentSuggestions.glucoseControl }}
            </li>
            <li>
              <strong>生活方式干预建议：</strong>{{ currentDetail.treatmentSuggestions.lifestyle }}
            </li>
            <li>
              <strong>随访复查建议：</strong>{{ currentDetail.treatmentSuggestions.followup }}
            </li>
          </ul>
        </div>

        <!-- 五、归档信息 -->
        <div class="detail-section archive-section">
          <h3 class="section-title">五、归档信息</h3>
          <div class="archive-info">
            <span>医生电子签名：{{ currentDetail.archiveInfo.electronicSignature }}</span>
            <span>归档状态：{{ currentDetail.archiveInfo.archiveStatus }}</span>
            <span>报告版本号：{{ currentDetail.archiveInfo.version }}</span>
            <span>备注：{{ currentDetail.archiveInfo.remark }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="modal-footer">
          <!-- <NButton @click="handleExportFromModal">导出PDF</NButton>
          <NButton @click="handlePrintFromModal">打印</NButton> -->
          <NButton
            type="primary"
            @click="closeDetailModal"
            >关闭弹窗</NButton
          >
        </div>
      </template>
    </NModal>

    <!-- ============================================================ -->
    <!-- 5. 报告生成抽屉 -->
    <!-- ============================================================ -->
    <NDrawer
      v-model:show="drawerVisible"
      :width="480"
      placement="right"
    >
      <NDrawerContent
        title="生成新报告"
        closable
      >
        <div class="drawer-form">
          <div class="form-item">
            <label>患者选择</label>
            <NSelect
              v-model:value="drawerForm.medicalRecordNo"
              :options="patientOptions"
              :loading="patientLoading"
              filterable
              remote
              placeholder="输入住院号搜索患者"
              @search="handlePatientSearch"
            />
          </div>
          <!-- <div class="form-item">
            <label>报告类型</label>
            <NSelect
              v-model:value="drawerForm.reportType"
              :options="drawerReportTypeOptions"
              style="width: 100%"
              placeholder="请选择报告类型"
            />
          </div>
          <div class="form-item">
            <label>报告周期</label>
            <div class="period-display">2026-03-01 至 2026-03-31</div>
          </div>
          <div class="form-item">
            <label>治疗方案调整建议</label>
            <NInput
              v-model:value="drawerForm.suggestions"
              type="textarea"
              :rows="4"
              placeholder="请输入治疗方案调整建议"
            />
          </div> -->
        </div>

        <template #footer>
          <div class="drawer-footer">
            <NButton @click="closeDrawer">取消</NButton>
            <!-- <NButton @click="handleSaveDraft">保存草稿</NButton> -->
            <NButton
              type="primary"
              @click="handleGenerateAndArchive"
              >生成并归档</NButton
            >
          </div>
        </template>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>

<style scoped>
.efficacy-report-page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 筛选栏 */
.filter-bar :deep(.n-card__content) {
  padding: 12px 16px;
}

.filter-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-label {
  font-size: 13px;
  color: #334155;
  white-space: nowrap;
  font-weight: 500;
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-right {
  display: flex;
  align-items: center;
}

/* 统计卡片 */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  cursor: default;
  transition:
    box-shadow 0.25s ease,
    transform 0.25s ease;
  border-radius: 14px;
  box-shadow: 0 1px 6px rgba(64, 158, 255, 0.06);
  border: 1px solid rgba(64, 158, 255, 0.06);
}

.stat-card:hover {
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.12);
  transform: translateY(-2px);
}

.stat-card :deep(.n-card__content) {
  padding: 20px 24px;
}

.stat-card :deep(.n-statistic .n-statistic-value) {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.stat-card :deep(.n-statistic .n-statistic-label) {
  font-size: 13px;
  color: #334155;
  margin-top: 4px;
  font-weight: 500;
}

.stat-card :deep(.n-statistic .n-statistic-suffix) {
  font-size: 14px;
  font-weight: 600;
  margin-left: 8px;
}

/* 报告列表 */
.report-table-card :deep(.n-card__content) {
  padding: 0;
}

/* 详情弹窗头部 */
.modal-header-centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.modal-report-no {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
}

.report-detail {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.detail-section {
  padding: 12px 0;
  border-bottom: 1px solid rgba(64, 158, 255, 0.06);
}

.detail-section:last-child {
  border-bottom: none;
}

.report-header-section {
  padding-bottom: 16px;
}

.report-title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 8px;
  color: #333;
}

.report-no {
  text-align: center;
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
}

.patient-info-table {
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.patient-info-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #333;
}

.patient-info-row span {
  min-width: 165px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 16px 0 12px;
  padding-left: 12px;
  border-left: 4px solid #0ea5e9;
  letter-spacing: 0.01em;
}

.section-desc {
  font-size: 13px;
  color: #555;
  line-height: 1.6;
  margin-bottom: 4px;
}

.section-content {
  font-size: 13px;
  color: #444;
  line-height: 1.8;
  text-indent: 2em;
}

.target-list {
  margin: 8px 0 0 0;
  padding-left: 24px;
}

.target-list li {
  font-size: 13px;
  color: #444;
  line-height: 1.8;
}

.suggestion-list {
  margin: 8px 0 0 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-list li {
  font-size: 13px;
  color: #444;
  line-height: 1.7;
}

.suggestion-list li strong {
  color: #333;
  font-weight: 600;
}

.archive-section .archive-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #555;
}

.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* 抽屉表单 */
.drawer-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item label {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.period-display {
  font-size: 13px;
  color: #666;
  padding: 6px 0;
}

.drawer-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* ================================================================
   表格 - 医疗级样式
   ================================================================ */
::deep(.n-data-table) {
  font-size: 13px;
  border-radius: 10px;
  overflow: hidden;
}

::deep(.n-data-table-th) {
  background: #f8fafc !important;
  font-weight: 600;
  color: #334155;
  font-size: 13px;
  letter-spacing: 0.02em;
}

::deep(.n-data-table-td) {
  font-size: 13px;
  color: #475569;
}

::deep(.n-data-table-tr:hover td) {
  background: #f0f9ff !important;
}

/* ================================================================
   弹窗 & 抽屉圆角
   ================================================================ */
::deep(.n-modal),
::deep(.n-card) {
  border-radius: 14px;
}

::deep(.n-drawer) {
  border-radius: 14px 0 0 14px;
}

/* ================================================================
   详情弹窗 - 滚动条美化
   ================================================================ */
.report-detail {
  max-height: 65vh;
  overflow-y: auto;
  padding-right: 6px;
}

.report-detail::-webkit-scrollbar {
  width: 5px;
}

.report-detail::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.report-detail::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.report-detail::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* ================================================================
   section-note & advice-text
   ================================================================ */
.section-note {
  margin: 10px 0;
  padding: 10px 16px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-left: 3px solid #0ea5e9;
  border-radius: 6px;
  color: #1e40af;
  font-size: 13px;
  line-height: 1.7;
}

.advice-text {
  padding: 14px 18px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-left: 4px solid #10b981;
  border-radius: 0 8px 8px 0;
  color: #14532d;
  font-size: 14px;
  line-height: 1.8;
}

/* ================================================================
   全局滚动条
   ================================================================ */
.efficacy-report-page::-webkit-scrollbar {
  width: 6px;
}

.efficacy-report-page::-webkit-scrollbar-track {
  background: transparent;
}

.efficacy-report-page::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.efficacy-report-page::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
