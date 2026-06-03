<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ScrollContainer } from '@/components'
import { useInjection } from '@/composables'
import { evaluateTreatment, type TreatmentEvaluationResult } from '@/api/treatmentEffectiveness'
import { getPatientList, type PatientRecord } from '@/api'
import {
  NCard,
  NDataTable,
  NButton,
  NInput,
  NPagination,
  NScrollbar,
  NSpin,
  NTag,
  NProgress,
  useMessage,
  type DataTableColumns,
  type PaginationProps,
} from 'naive-ui'
import { mediaQueryInjectionKey } from '@/injection'

defineOptions({ name: 'MedicationEffectiveness' })

const { isMaxMd, isMaxLg } = useInjection(mediaQueryInjectionKey)
const message = useMessage()

// ===================== 患者列表 =====================
const selectedPatient = ref<PatientRecord | null>(null)
const searchKeyword = ref('')
const patientList = ref<PatientRecord[]>([])
const patientLoading = ref(false)
const patientPagination = ref<PaginationProps>({ page: 1, pageSize: 15, itemCount: 0 })
const queryParams = ref({ zyh: '' as string | undefined, name: '' as string | undefined, pageNum: 1, pageSize: 15 })

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function loadPatients() {
  patientLoading.value = true
  try {
    const { data } = await getPatientList(queryParams.value)
    patientList.value = data.list || []
    patientPagination.value.itemCount = data.total || 0
  } finally { patientLoading.value = false }
}

function handleSearch() {
  queryParams.value.zyh = searchKeyword.value || undefined
  queryParams.value.name = undefined
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { patientPagination.value.page = 1; queryParams.value.pageNum = 1; loadPatients() }, 300)
}

function handlePageChange(page: number) { patientPagination.value.page = page; queryParams.value.pageNum = page; loadPatients() }

function handleSelectPatient(row: PatientRecord) { selectedPatient.value = row; resetResult() }

const columns: DataTableColumns<PatientRecord> = [
  { title: '住院号', key: 'zyh', width: 120 },
  { title: '姓名', key: 'name', width: 80 },
  { title: '性别', key: 'sex', width: 60 },
  { title: '年龄', key: 'age', width: 60 },
]

// ===================== Mock 用药方案 =====================
interface MedicationItem {
  name: string
  route: string
  dosage: string
  purpose: string
}

const mockMedicationPlan: MedicationItem[] = [
  { name: '奥沙西泮片', route: '口服', dosage: '15mg qn', purpose: '抗焦虑' },
  { name: '雷贝拉唑钠肠溶片', route: '口服', dosage: '20mg qd', purpose: '抑酸护胃' },
  { name: '阿司匹林肠溶片', route: '口服', dosage: '100mg qd', purpose: '抗血小板' },
  { name: '硝苯地平控释片', route: '口服', dosage: '30mg qd', purpose: '降压' },
]

// ===================== AI 评估 =====================
const isEvaluating = ref(false)
const hasEvaluated = ref(false)
const evalError = ref<string | null>(null)
const evalResult = ref<TreatmentEvaluationResult | null>(null)

const safetyColor = computed(() => {
  const level = evalResult.value?.safetyLevel ?? 0
  if (level <= 2) return '#10b981'
  if (level <= 3) return '#f59e0b'
  return '#ef4444'
})

const safetyLabel = computed(() => {
  const level = evalResult.value?.safetyLevel ?? 0
  if (level <= 2) return '低风险'
  if (level <= 3) return '中风险'
  return '高风险'
})

function resetResult() {
  evalResult.value = null
  evalError.value = null
  hasEvaluated.value = false
}

async function handleEvaluate() {
  if (!selectedPatient.value) { message.warning('请先在左侧列表中选择一位患者'); return }

  isEvaluating.value = true
  evalError.value = null
  hasEvaluated.value = true

  try {
    const res = await evaluateTreatment({
      patientId: selectedPatient.value.zyh,
      question: '请综合评估该治疗方案',
    })
    if (res.code !== 200 || !res.data) {
      evalError.value = res.message || '评估服务异常，请稍后重试'
      return
    }
    evalResult.value = res.data
  } catch (e: unknown) {
    const axiosErr = e as { response?: { data?: { message?: string } } }
    evalError.value = axiosErr?.response?.data?.message || (e instanceof Error ? e.message : '请求失败')
    message.error('治疗方案评估失败')
  } finally { isEvaluating.value = false }
}

onMounted(() => { loadPatients() })
</script>

<template>
  <ScrollContainer
    wrapper-class="flex flex-col gap-y-4 treatment-effectiveness-page"
    :scrollable="isMaxLg"
  >
    <NCard
      class="main-card flex-1"
      :size="isMaxMd ? 'small' : undefined"
      content-class="flex flex-col min-h-0"
    >
      <div class="content-layout">
        <div class="left-panel">
          <div class="panel-header"><span class="panel-title">患者列表</span></div>
          <div class="search-box">
            <NInput v-model:value="searchKeyword" placeholder="搜索住院号或姓名..." size="small" clearable @input="handleSearch" @clear="handleSearch" />
          </div>
          <div class="table-wrapper">
            <NDataTable
              :columns="columns" :data="patientList" :loading="patientLoading" size="small"
              :row-props="(row: any) => ({ class: selectedPatient?.zyh === row.zyh ? 'row-selected' : '', onClick: () => handleSelectPatient(row), style: 'cursor: pointer' })"
            />
          </div>
          <div class="pagination-box">
            <NPagination :page="patientPagination.page" :page-size="15" :page-slot="5" :item-count="patientPagination.itemCount" :disabled="patientLoading" size="small" @update:page="handlePageChange" />
          </div>
        </div>

        <div class="right-panel">
          <!-- 当前用药方案 (mock) -->
          <div class="med-plan-card">
            <div class="section-header">
              <span class="iconify ph--prescription header-icon" />
              <span>当前用药方案</span>
            </div>
            <div v-if="!selectedPatient" class="placeholder-block">
              <span class="iconify ph--pill placeholder-icon" />
              <p>选择患者后显示用药方案</p>
            </div>
            <div v-else class="med-plan-list">
              <div v-for="(item, i) in mockMedicationPlan" :key="i" class="med-plan-item">
                <span class="med-index">{{ i + 1 }}</span>
                <span class="med-name">{{ item.name }}</span>
                <NTag :bordered="false" size="small" type="info">{{ item.route }}</NTag>
                <NTag :bordered="false" size="small">{{ item.dosage }}</NTag>
                <span class="med-purpose">{{ item.purpose }}</span>
              </div>
            </div>
          </div>

          <!-- AI 按钮 -->
          <div class="ai-action-bar">
            <NButton
              type="primary"
              size="large"
              :loading="isEvaluating"
              :disabled="!selectedPatient"
              @click="handleEvaluate"
            >
              <template #icon><span class="iconify ph--chart-line-up" /></template>
              AI 分析药物治疗方案有效性
            </NButton>
            <span v-if="!selectedPatient" class="hint-text">请先选择患者</span>
          </div>

          <!-- 评估结果区 -->
          <div class="eval-content-area">
            <!-- 占位态 -->
            <div v-if="!hasEvaluated" class="state-placeholder">
              <span class="iconify ph--chart-line-up placeholder-icon" />
              <p class="placeholder-title">治疗方案有效性评估</p>
              <p class="placeholder-desc">点击上方按钮，AI 将综合分析患者用药方案的有效性和安全性</p>
            </div>

            <!-- 加载态 -->
            <div v-else-if="isEvaluating" class="state-placeholder">
              <NSpin size="medium" />
              <p class="state-text">AI 正在评估治疗方案...</p>
            </div>

            <!-- 错误态 -->
            <div v-else-if="evalError" class="state-placeholder state-error">
              <span class="iconify text-4xl text-red-400 ph--warning-circle" />
              <p class="state-text text-red-500">{{ evalError }}</p>
              <NButton size="small" text type="primary" @click="handleEvaluate">重试</NButton>
            </div>

            <!-- 结果态 -->
            <NScrollbar v-else-if="evalResult" class="result-scrollbar">
              <div class="result-content">
                <!-- 评分行 -->
                <div class="score-row">
                  <div class="score-item">
                    <span class="score-label">有效性评分</span>
                    <div class="score-value-row">
                      <span class="score-number">{{ evalResult.effectivenessScore }}</span>
                      <span class="score-unit">/ 10</span>
                    </div>
                    <NProgress
                      type="line"
                      :percentage="evalResult.effectivenessScore * 10"
                      :color="evalResult.effectivenessScore >= 7 ? '#10b981' : evalResult.effectivenessScore >= 5 ? '#f59e0b' : '#ef4444'"
                      :height="6"
                      :border-radius="3"
                      :show-indicator="false"
                    />
                  </div>
                  <div class="score-divider" />
                  <div class="score-item">
                    <span class="score-label">安全级别</span>
                    <div class="score-value-row">
                      <span class="score-number" :style="{ color: safetyColor }">{{ evalResult.safetyLevel }}</span>
                      <span class="score-unit">/ 5</span>
                    </div>
                    <NTag :bordered="false" size="small" :type="evalResult.safetyLevel <= 2 ? 'success' : evalResult.safetyLevel <= 3 ? 'warning' : 'error'">{{ safetyLabel }}</NTag>
                  </div>
                </div>

                <!-- 相互作用警告 -->
                <div v-if="evalResult.interactionWarnings" class="detail-card warning-card">
                  <div class="detail-card-header">
                    <span class="iconify ph--warning-octagon" />
                    <span>药物相互作用警告</span>
                  </div>
                  <p class="detail-card-text">{{ evalResult.interactionWarnings }}</p>
                </div>

                <!-- 调整建议 -->
                <div v-if="evalResult.adjustmentSuggestions" class="detail-card info-card">
                  <div class="detail-card-header">
                    <span class="iconify ph--lightbulb" />
                    <span>用药调整建议</span>
                  </div>
                  <p class="detail-card-text">{{ evalResult.adjustmentSuggestions }}</p>
                </div>

                <!-- 复诊建议 -->
                <div v-if="evalResult.followUpAdvice" class="detail-card success-card">
                  <div class="detail-card-header">
                    <span class="iconify ph--calendar-check" />
                    <span>复诊建议</span>
                  </div>
                  <p class="detail-card-text">{{ evalResult.followUpAdvice }}</p>
                </div>

                <!-- 评估时间 -->
                <div v-if="evalResult.createTime" class="eval-time">
                  <span class="iconify ph--clock" />
                  <span>评估时间：{{ evalResult.createTime }}</span>
                </div>
              </div>
            </NScrollbar>
          </div>
        </div>
      </div>
    </NCard>
  </ScrollContainer>
</template>

<style lang="scss" scoped>
.treatment-effectiveness-page { padding: 20px 24px; background: linear-gradient(160deg, #f0f4f8 0%, #f5f7fa 100%); @media (max-width: 768px) { padding: 12px 8px; } }
.main-card { display: flex; flex-direction: column; min-height: 0; background: #ffffff; border-radius: 14px; overflow: visible; box-shadow: 0 2px 12px rgba(64,158,255,0.06), 0 1px 3px rgba(0,0,0,0.04); border: 1px solid rgba(64,158,255,0.06); :deep(.n-card__content) { flex: 1; min-height: 0; overflow: hidden; } }
.content-layout { flex: 1; display: flex; gap: 20px; min-height: 0; overflow: hidden; @media (max-width: 1024px) { flex-direction: column; } }

// 左侧
.left-panel { width: 350px; flex-shrink: 0; display: flex; flex-direction: column; border-right: 1px solid #e8ecf1; padding-right: 20px; @media (max-width: 1024px) { width: 100%; border-right: none; border-bottom: 1px solid #e8ecf1; padding-right: 0; padding-bottom: 16px; } }
.panel-header { margin-bottom: 12px; }
.panel-title { font-size: 14px; font-weight: 600; color: #334155; }
.search-box { margin-bottom: 12px; }
.table-wrapper { flex: 1; min-height: 0; display: flex; flex-direction: column; :deep(.n-data-table) { flex: 1; min-height: 0; display: flex; flex-direction: column; } :deep(.n-data-table .n-data-table-base-table) { flex: 1; min-height: 0; } }
.pagination-box { padding-top: 12px; display: flex; justify-content: center; overflow: hidden; }
:deep(.row-selected td) { background: #e8f4fd !important; transition: background-color 0.2s ease; }
:deep(.n-data-table-th) { background: #f8fafc !important; font-weight: 600; color: #334155; font-size: 12px; }
:deep(.n-data-table-td) { font-size: 13px; color: #475569; }
:deep(.n-data-table-tr:hover td) { background: #f0f9ff !important; }

// 右侧
.right-panel { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; gap: 14px; overflow: hidden; }

// ===================== 用药方案卡片 =====================
.section-header { display: flex; align-items: center; gap: 8px; padding: 10px 16px; font-size: 13px; font-weight: 600; color: #1e293b; background: #fafbfc; border-bottom: 1px solid #e8ecf1; flex-shrink: 0; border-radius: 10px 10px 0 0; }
.header-icon { font-size: 16px; color: #409eff; }

.med-plan-card { border: 1px solid #e2e8f0; border-radius: 10px; background: #ffffff; flex-shrink: 0; overflow: hidden; }

.placeholder-block { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; gap: 6px; color: #64748b; font-size: 13px; }
.placeholder-icon { font-size: 28px; color: #cbd5e1; }

.med-plan-list { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px 16px; }

.med-plan-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #f1f5f9; transition: border-color 0.2s; &:hover { border-color: #b9d9ff; } }

.med-index { font-size: 11px; font-weight: 600; color: #94a3b8; min-width: 16px; text-align: center; }
.med-name { font-size: 13px; font-weight: 600; color: #1e293b; }
.med-purpose { font-size: 12px; color: #94a3b8; margin-left: 4px; }

// ===================== AI 按钮 =====================
.ai-action-bar { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.hint-text { font-size: 13px; color: #64748b; }

// ===================== 评估结果区 =====================
.eval-content-area { flex: 1; min-height: 0; border: 1px solid #e2e8f0; border-radius: 10px; background: #ffffff; overflow: hidden; }

.state-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; min-height: 240px; padding: 48px 32px; text-align: center; gap: 12px; }
.state-placeholder .placeholder-icon { font-size: 48px; color: #cbd5e1; }
.placeholder-title { font-size: 16px; font-weight: 600; color: #334155; }
.placeholder-desc { font-size: 14px; color: #64748b; line-height: 1.6; }
.state-text { font-size: 14px; color: #64748b; }
.state-error { gap: 10px; }

.result-scrollbar { height: 100%; }
.result-content { padding: 20px; display: flex; flex-direction: column; gap: 14px; }

// 评分行
.score-row { display: flex; align-items: center; gap: 32px; padding: 20px 24px; background: #f8fafc; border-radius: 10px; border: 1px solid #f1f5f9; }
.score-item { display: flex; flex-direction: column; gap: 8px; min-width: 140px; }
.score-label { font-size: 12px; color: #94a3b8; }
.score-value-row { display: flex; align-items: baseline; gap: 4px; }
.score-number { font-size: 32px; font-weight: 700; color: #1e293b; line-height: 1; }
.score-unit { font-size: 14px; color: #94a3b8; }
.score-divider { width: 1px; height: 60px; background: #e2e8f0; }

// 详情卡片 (共用)
.detail-card { padding: 14px 18px; border-radius: 8px; }
.detail-card-header { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; margin-bottom: 10px; .iconify { font-size: 18px; } }
.detail-card-text { font-size: 13px; line-height: 1.7; margin: 0; color: inherit; }

.warning-card { background: #fef2f2; border: 1px solid #fecaca; .detail-card-header { color: #dc2626; } .detail-card-text { color: #7f1d1d; } }
.info-card { background: #eff6ff; border: 1px solid #bfdbfe; .detail-card-header { color: #2563eb; } .detail-card-text { color: #1e40af; } }
.success-card { background: #f0fdf4; border: 1px solid #bbf7d0; .detail-card-header { color: #16a34a; } .detail-card-text { color: #166534; } }

.eval-time { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #94a3b8; align-self: flex-end; .iconify { font-size: 14px; } }
</style>
