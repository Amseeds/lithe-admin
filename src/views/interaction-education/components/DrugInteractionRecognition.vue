<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { checkDrugInteraction, type DrugInteractionResult } from '@/api/interactionEducation'
import { getPatientList, type PatientRecord } from '@/api'
import {
  NButton,
  NInput,
  NScrollbar,
  NSpin,
  NDataTable,
  NPagination,
  useMessage,
  type DataTableColumns,
  type PaginationProps,
} from 'naive-ui'

defineOptions({ name: 'DrugInteractionRecognition' })

const message = useMessage()

// ===================== 患者列表 =====================
const selectedPatient = ref<PatientRecord | null>(null)
const searchKeyword = ref('')
const patientList = ref<PatientRecord[]>([])
const patientLoading = ref(false)
const patientPagination = ref<PaginationProps>({ page: 1, pageSize: 15, itemCount: 0 })
const queryParams = ref({
  zyh: '' as string | undefined,
  name: '' as string | undefined,
  pageNum: 1,
  pageSize: 15,
})

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function loadPatients() {
  patientLoading.value = true
  try {
    const { data } = await getPatientList(queryParams.value)
    patientList.value = data.list || []
    patientPagination.value.itemCount = data.total || 0
  } finally {
    patientLoading.value = false
  }
}

function handleSearch() {
  queryParams.value.zyh = searchKeyword.value || undefined
  queryParams.value.name = undefined
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    patientPagination.value.page = 1
    queryParams.value.pageNum = 1
    loadPatients()
  }, 300)
}

function handlePageChange(page: number) {
  patientPagination.value.page = page
  queryParams.value.pageNum = page
  loadPatients()
}

function handleSelectPatient(row: PatientRecord) {
  selectedPatient.value = row
  resetResult()
}

const columns: DataTableColumns<PatientRecord> = [
  { title: '住院号', key: 'zyh', width: 120 },
  { title: '姓名', key: 'name', width: 80 },
  { title: '性别', key: 'sex', width: 60 },
  { title: '年龄', key: 'age', width: 60 },
]

// ===================== 药品相互作用 =====================
const drugName = ref('')
const isLoading = ref(false)
const hasQueried = ref(false)
const errorMsg = ref<string | null>(null)
const result = ref<DrugInteractionResult | null>(null)

const canQuery = computed(() => selectedPatient.value && drugName.value.trim())

const riskConfig = computed(() => {
  const level = result.value?.riskLevel
  if (level === '高')
    return { color: '#ef4444', bg: '#fef2f2', icon: 'ph--shield-warning', label: '高风险' }
  if (level === '中')
    return { color: '#f59e0b', bg: '#fffbeb', icon: 'ph--shield-warning', label: '中风险' }
  return { color: '#10b981', bg: '#ecfdf5', icon: 'ph--shield-check', label: '低风险' }
})

function resetResult() {
  result.value = null
  errorMsg.value = null
  hasQueried.value = false
}

async function handleCheck() {
  const name = drugName.value.trim()
  if (!name) {
    message.warning('请输入药品名称')
    return
  }

  isLoading.value = true
  errorMsg.value = null
  hasQueried.value = true

  try {
    const res = await checkDrugInteraction({
      patientId: selectedPatient.value!.zyh,
      question: '帮我分析一下',
      targetDrug: name,
    })
    result.value = res.data
  } catch (e: unknown) {
    result.value = null
    errorMsg.value = e instanceof Error ? e.message : '请求失败'
    message.error('药物相互作用查询失败')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadPatients()
})
</script>

<template>
  <div class="content-layout">
    <!-- 左侧: 患者列表 -->
    <div class="left-panel">
      <div class="panel-header"><span class="panel-title">患者列表</span></div>
      <div class="search-box">
        <NInput
          v-model:value="searchKeyword"
          placeholder="搜索住院号或姓名..."
          size="small"
          clearable
          @input="handleSearch"
          @clear="handleSearch"
        />
      </div>
      <div class="table-wrapper">
        <NDataTable
          :columns="columns"
          :data="patientList"
          :loading="patientLoading"
          size="small"
          :row-props="
            (row: any) => ({
              class: selectedPatient?.zyh === row.zyh ? 'row-selected' : '',
              onClick: () => handleSelectPatient(row),
              style: 'cursor: pointer',
            })
          "
        />
      </div>
      <div class="pagination-box">
        <NPagination
          :page="patientPagination.page"
          :page-size="15"
          :page-slot="5"
          :item-count="patientPagination.itemCount"
          :disabled="patientLoading"
          size="small"
          @update:page="handlePageChange"
        />
      </div>
    </div>

    <!-- 右侧: 药品相互作用 -->
    <div class="right-panel">
      <div class="search-bar">
        <NInput
          v-model:value="drugName"
          placeholder="输入药品名称，如：醋甲唑胺片、阿莫西林..."
          size="large"
          clearable
          :disabled="isLoading"
          class="search-input"
          @clear="resetResult"
          @keydown.enter="handleCheck"
        />
        <NButton
          type="primary"
          size="large"
          :loading="isLoading"
          :disabled="!canQuery"
          @click="handleCheck"
        >
          <template #icon><span class="iconify ph--flask" /></template>
          AI 识别相互作用
        </NButton>
      </div>

      <div class="content-area">
        <!-- 初始态 -->
        <div
          v-if="!hasQueried"
          class="state-placeholder"
        >
          <span class="placeholder-icon iconify ph--flask" />
          <p class="placeholder-title">药物相互作用智能识别</p>
          <p class="placeholder-desc">
            选择患者并输入药品名称，AI 将自动分析该药物与患者现有用药方案的相互作用风险
          </p>
        </div>

        <!-- 加载态 -->
        <div
          v-else-if="isLoading"
          class="state-placeholder"
        >
          <NSpin size="medium" />
          <p class="state-text">AI 正在分析药物相互作用...</p>
        </div>

        <!-- 错误态 -->
        <div
          v-else-if="errorMsg"
          class="state-placeholder state-error"
        >
          <span class="iconify text-4xl text-red-400 ph--warning-circle" />
          <p class="state-text text-red-500">{{ errorMsg }}</p>
          <NButton
            size="small"
            text
            type="primary"
            @click="handleCheck"
            >重试</NButton
          >
        </div>

        <!-- 结果态 -->
        <div
          v-else-if="result"
          class="result-layout"
        >
          <div
            class="risk-card"
            :style="{ background: riskConfig.bg, borderColor: riskConfig.color }"
          >
            <span
              class="risk-icon iconify"
              :class="riskConfig.icon"
              :style="{ color: riskConfig.color }"
            />
            <span
              class="risk-level"
              :style="{ color: riskConfig.color }"
              >{{ result.riskLevel }}风险</span
            >
            <span class="risk-subtitle">{{ result.summary }}</span>
          </div>
          <NScrollbar class="detail-scrollbar">
            <div class="detail-column">
              <div
                v-if="result.interactions?.length"
                class="interaction-list"
              >
                <div
                  v-for="(item, idx) in result.interactions"
                  :key="idx"
                  class="interaction-item"
                >
                  <div class="interaction-header">
                    <span class="interaction-icon iconify ph--arrows-left-right" />
                    <span class="interaction-drug-pair">{{ item.drugPair }}</span>
                  </div>
                  <p class="interaction-desc">{{ item.riskDescription }}</p>
                  <div class="interaction-recommendation">
                    <span class="rec-icon iconify ph--lightbulb" />
                    <span>{{ item.recommendation }}</span>
                  </div>
                </div>
              </div>
              <div
                v-if="result.suggestions?.length"
                class="suggestions-card"
              >
                <div class="suggestions-title">
                  <span class="suggestions-icon iconify ph--check-circle" /><span>总体建议</span>
                </div>
                <ul class="suggestions-list">
                  <li
                    v-for="(s, idx) in result.suggestions"
                    :key="idx"
                    class="suggestions-item"
                  >
                    <span class="suggestions-bullet iconify ph--check" />{{ s }}
                  </li>
                </ul>
              </div>
            </div>
          </NScrollbar>
        </div>
      </div>

      <div class="links-bar">
        <router-link
          to="/pharmacy-knowledge-base/clinical-pharmacy/drug-information"
          class="link-btn"
        >
          <span class="link-icon iconify ph--books" />
          <span>药学知识</span>
        </router-link>
        <router-link
          to="/pharmaceutical-care/health-education"
          class="link-btn"
        >
          <span class="link-icon iconify ph--question" />
          <span>常见问题</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content-layout {
  flex: 1;
  display: flex;
  gap: 20px;
  min-height: 0;
  padding-top: 8px;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
}

// ===================== 左侧: 患者列表 =====================
.left-panel {
  width: 350px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e8ecf1;
  padding-right: 20px;

  @media (max-width: 1024px) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e8ecf1;
    padding-right: 0;
    padding-bottom: 16px;
  }
}

.panel-header {
  margin-bottom: 12px;
}
.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}
.search-box {
  margin-bottom: 12px;
}

.table-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  :deep(.n-data-table) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  :deep(.n-data-table .n-data-table-base-table) {
    flex: 1;
    min-height: 0;
  }
}

.pagination-box {
  padding-top: 12px;
  display: flex;
  justify-content: center;
  overflow: hidden;
}

:deep(.row-selected td) {
  background: #e8f4fd !important;
  transition: background-color 0.2s ease;
}
:deep(.n-data-table-th) {
  background: #f8fafc !important;
  font-weight: 600;
  color: #334155;
  font-size: 12px;
}
:deep(.n-data-table-td) {
  font-size: 13px;
  color: #475569;
}
:deep(.n-data-table-tr:hover td) {
  background: #f0f9ff !important;
}

// ===================== 右侧面板 =====================
.right-panel {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

// ===================== 搜索栏 =====================
.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
}

// ===================== 底部链接栏 =====================
.links-bar {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.link-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 1px 6px rgba(64, 158, 255, 0.08);
    color: #409eff;
  }
}

.link-icon {
  font-size: 18px;
  color: #409eff;
}

// ===================== 内容区 =====================
.content-area {
  flex: 1;
  min-height: 0;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  overflow: hidden;
}

.state-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
  padding: 48px 32px;
  text-align: center;
  gap: 12px;
}

.placeholder-icon {
  font-size: 52px;
  color: #cbd5e1;
}
.placeholder-title {
  font-size: 16px;
  font-weight: 600;
  color: #334155;
}
.placeholder-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  max-width: 460px;
}
.state-text {
  font-size: 14px;
  color: #64748b;
}
.state-error {
  gap: 10px;
}

// ===================== 结果布局 =====================
.result-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  height: 100%;
  overflow: hidden;
}

// ===================== 风险等级卡片 =====================
.risk-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 18px 24px;
  border-radius: 10px;
  border: 2px solid;
  flex-shrink: 0;
}

.risk-icon {
  font-size: 28px;
}
.risk-level {
  font-size: 18px;
  font-weight: 700;
}
.risk-subtitle {
  font-size: 12px;
  color: #64748b;
  font-weight: 400;
}

// ===================== 详情滚动区 =====================
.detail-scrollbar {
  flex: 1;
  min-width: 0;
}

// ===================== 详情列 =====================
.detail-column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.summary-card {
  padding: 14px 18px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}
.summary-text {
  font-size: 14px;
  color: #334155;
  line-height: 1.65;
}

.interaction-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.interaction-item {
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
  transition: border-color 0.2s ease;
  &:hover {
    border-color: #b9d9ff;
  }
}

.interaction-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.interaction-icon {
  font-size: 18px;
  color: #409eff;
  flex-shrink: 0;
}
.interaction-drug-pair {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}
.interaction-desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 10px;
}

.interaction-recommendation {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  background: #eff6ff;
  border-left: 3px solid #409eff;
  border-radius: 0 6px 6px 0;
  font-size: 13px;
  color: #1e40af;
  line-height: 1.5;
}
.rec-icon {
  font-size: 16px;
  color: #f59e0b;
  flex-shrink: 0;
  margin-top: 1px;
}

.suggestions-card {
  padding: 14px 18px;
  background: #f0fdf4;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
}
.suggestions-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #166534;
  margin-bottom: 10px;
}
.suggestions-icon {
  font-size: 18px;
  color: #10b981;
}
.suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.suggestions-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #166534;
  line-height: 1.5;
}
.suggestions-bullet {
  font-size: 15px;
  color: #10b981;
  flex-shrink: 0;
  margin-top: 1px;
}

@media (prefers-reduced-motion: reduce) {
  .interaction-item {
    transition: none;
  }
}
</style>
