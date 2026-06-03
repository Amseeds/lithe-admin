<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { ScrollContainer } from '@/components'
import { useInjection, useSSE } from '@/composables'
import { streamSpecialPopulationConsult } from '@/api/specialPopulation'
import { getPatientList, type PatientRecord } from '@/api'
import {
  NCard,
  NTabs,
  NTabPane,
  NDataTable,
  NButton,
  NInput,
  NPagination,
  NScrollbar,
  NSpin,
  useMessage,
  type DataTableColumns,
  type PaginationProps,
  type ScrollbarInst,
} from 'naive-ui'
import { mediaQueryInjectionKey } from '@/injection'

defineOptions({ name: 'SpecialPopulationAiMedication' })

const { isMaxMd, isMaxLg } = useInjection(mediaQueryInjectionKey)

const message = useMessage()
const { start: startSSE, abort: abortSSE } = useSSE()

const categories = [
  {
    value: 'pregnancy',
    label: '妊娠及哺乳期妇女',
    knowledge: `妊娠期糖尿病是一种临床常见的妊娠合并症，由于机体代谢及激素水平的需要，易出现胰岛素抵抗与分泌不足，导致妊娠期妇女出现不同程度糖耐量异常的概率较其他时期要高，可造成产后出血、剖宫产等诸多危害。目前，孕期的糖尿病发病率呈逐年上升趋势，即在妊娠期间表现出糖耐异常等。妊娠期若未严格控制糖尿病，没有得到及时的诊治和处理，有可能会对母婴造成影响，严重影响母婴健康，出现近期、远期并发症，因此，血糖应纳入孕期常规管理。可见，基于量化评估策略的血糖监测大大降低了母婴并发症的发生，对于改善临床结局具有重要价值。基于量化评估策略的血糖监测，是以患者为中心开展血糖监测，对患者个人状况、情绪状况、血糖摄入等进行量化评估，再以评估结果开展行个性化用药指导。`,
  },
  {
    value: 'nafld',
    label: '非酒精性脂肪肝病患者',
    knowledge: `糖尿病和非酒精性脂肪性肝病密切相关，两者患病率呈同步上升趋势。糖尿病与非酒精性脂肪性肝病不仅具有共同的危险因素，而且互为常见的合并症或靶器官损伤，当两者同时出现时会明显增加患者预后不良的风险。因此糖尿病合并非酒精性脂肪性肝病的筛查、诊断及综合管理愈发重要，且其诊治涉及多学科的合作，但目前我国尚缺少专门的管理模式，因此结合 AI 对糖尿病和非酒精性脂肪性肝病患者，建立包括全面评估代谢综合征的评估，如肥胖症、高血压、脂代谢紊乱、高尿酸血症等疾病的风险，一旦出现异常指标，积极干预可改善预后。`,
  },
  {
    value: 'renal',
    label: '肾功能不全患者',
    knowledge: `肾功能不全患者是慢性病患者中的常见病与多发病，同时也是引起终末期肾脏病的主要原因。目前，国内外已颁布了多种有关糖尿病诊断、治疗、管理的临床指南或专家共识，其中也涉及了糖尿病肾脏疾病诊疗的部分内容，但并不能满足内分泌科医师或肾内科医生的需求，对糖尿病肾脏疾病这一特殊人群，合理用药、规范诊疗、细化管理等问题仍有待解决。患者宜根据肾功能情况个体化选择降糖方案，并根据肾脏的损伤程度调节剂量。当患者肾功能有变化时，结合AI提示选择不经肾脏排泄的口服药，根据药物代谢特点，从小剂量开始，根据治疗效果和患者耐受程度，逐渐加量至合理范围。`,
  },
]

const activeTab = ref('pregnancy')
const selectedPatient = ref<PatientRecord | null>(null)
const searchKeyword = ref('')
const patientList = ref<PatientRecord[]>([])
const patientLoading = ref(false)
const patientPagination = ref<PaginationProps>({
  page: 1,
  pageSize: 15,
  itemCount: 0,
})
const queryParams = ref({
  zyh: '' as string | undefined,
  name: '' as string | undefined,
  pageNum: 1,
  pageSize: 15,
})

const streamingText = ref('')
const isGenerating = ref(false)
const streamError = ref<string | null>(null)
const responseBoxRef = ref<ScrollbarInst | null>(null)
let streamAbortController: AbortController | null = null

function scrollResponseToBottom() {
  nextTick(() => {
    responseBoxRef.value?.scrollTo({ top: 999999 })
  })
}

const currentCategory = computed(() => categories.find((c) => c.value === activeTab.value)!)

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
  resetAIState()
}

function resetAIState() {
  if (streamAbortController) {
    streamAbortController.abort()
    streamAbortController = null
  }
  abortSSE()
  streamingText.value = ''
  streamError.value = null
  isGenerating.value = false
}

function buildAIQuestion(): string {
  const cat = currentCategory.value
  return `该患者属于${cat.label}`
}

async function handleAIGuide() {
  if (!selectedPatient.value) {
    message.warning('请先在左侧列表中选择一位患者')
    return
  }

  resetAIState()
  isGenerating.value = true

  streamAbortController = new AbortController()

  try {
    const res = await streamSpecialPopulationConsult({
      patientId: selectedPatient.value.zyh,
      question: buildAIQuestion(),
      consultType: 'special_population',
      specialPopulation: '',
      signal: streamAbortController.signal,
    })

    await startSSE('', {
      response: res,
      onMessage: (text: string) => {
        streamingText.value += text
        scrollResponseToBottom()
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '请求失败'
    streamError.value = msg
    message.error('AI用药指导请求失败')
  } finally {
    isGenerating.value = false
    streamAbortController = null
  }
}

function handleTabChange() {
  searchKeyword.value = ''
  selectedPatient.value = null
  patientPagination.value.page = 1
  queryParams.value.zyh = undefined
  queryParams.value.name = undefined
  queryParams.value.pageNum = 1
  resetAIState()
  loadPatients()
}

watch(activeTab, handleTabChange)

const columns: DataTableColumns<PatientRecord> = [
  { title: '住院号', key: 'zyh', width: 120 },
  { title: '姓名', key: 'name', width: 80 },
  { title: '性别', key: 'sex', width: 60 },
  { title: '年龄', key: 'age', width: 60 },
]

onMounted(() => {
  loadPatients()
})
</script>

<template>
  <ScrollContainer
    wrapper-class="flex flex-col gap-y-4 special-population-page"
    :scrollable="isMaxLg"
  >
    <NCard
      class="main-card flex-1"
      :size="isMaxMd ? 'small' : undefined"
      content-class="flex flex-col min-h-0"
    >
      <NTabs
        v-model:value="activeTab"
        type="line"
        animated
      >
        <NTabPane
          v-for="cat in categories"
          :key="cat.value"
          :name="cat.value"
          :tab="cat.label"
        />
      </NTabs>

      <div class="content-layout">
        <div class="left-panel">
          <div class="panel-header">
            <span class="panel-title">患者列表</span>
          </div>
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

        <div class="right-panel">
          <div class="knowledge-card">
            <div class="knowledge-label">科普知识</div>
            <p class="knowledge-text">{{ currentCategory.knowledge }}</p>
          </div>

          <div class="ai-action-bar">
            <NButton
              type="primary"
              size="large"
              :loading="isGenerating"
              :disabled="!selectedPatient"
              @click="handleAIGuide"
            >
              <template #icon>
                <span class="iconify ph--robot" />
              </template>
              AI 用药指导
            </NButton>
            <span
              v-if="!selectedPatient"
              class="hint-text"
              >请先选择患者</span
            >
            <NButton
              v-if="isGenerating"
              size="small"
              text
              type="warning"
              @click="resetAIState"
            >
              停止生成
            </NButton>
          </div>

          <div class="ai-response-area">
            <NScrollbar ref="responseBoxRef">
              <div
                v-if="!streamingText && !isGenerating && !streamError"
                class="response-placeholder"
              >
                <span class="iconify text-5xl text-slate-300 ph--brain" />
                <p class="placeholder-text">
                  点击"AI 用药指导"按钮，获取基于临床指南的个体化用药建议
                </p>
              </div>

              <div
                v-if="isGenerating && !streamingText"
                class="response-loading"
              >
                <NSpin size="medium" />
                <p class="loading-text">AI 正在分析患者数据，生成个体化用药指导...</p>
              </div>

              <div
                v-if="streamingText"
                class="response-content"
              >
                <div class="response-text">
                  <template
                    v-for="(block, bi) in streamingText.split('\n\n').filter(Boolean)"
                    :key="bi"
                  >
                    <h3
                      v-if="block.startsWith('## ')"
                      class="resp-h3"
                    >
                      {{ block.replace('## ', '') }}
                    </h3>
                    <h4
                      v-else-if="block.startsWith('### ')"
                      class="resp-h4"
                    >
                      {{ block.replace('### ', '') }}
                    </h4>
                    <ul
                      v-else-if="block.includes('\n- ')"
                      class="resp-ul"
                    >
                      <li
                        v-for="(line, li) in block.split('\n').filter((l) => l.trim())"
                        :key="li"
                        class="resp-li"
                      >
                        {{ line.replace(/^- /, '').replace(/^\d+\.\s/, '') }}
                      </li>
                    </ul>
                    <p
                      v-else
                      class="resp-p"
                    >
                      {{ block }}
                    </p>
                  </template>
                </div>
              </div>

              <div
                v-if="streamError"
                class="response-error"
              >
                <span class="iconify text-3xl text-red-400 ph--warning-circle" />
                <p>{{ streamError }}</p>
                <NButton
                  size="small"
                  text
                  type="primary"
                  @click="handleAIGuide"
                >
                  重试
                </NButton>
              </div>
            </NScrollbar>
          </div>
        </div>
      </div>
    </NCard>
  </ScrollContainer>
</template>

<style lang="scss" scoped>
.special-population-page {
  padding: 20px 24px;
  background: linear-gradient(160deg, #f0f4f8 0%, #f5f7fa 100%);

  @media (max-width: 768px) {
    padding: 12px 8px;
  }
}

.main-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #ffffff;
  border-radius: 14px;
  overflow: visible;
  box-shadow:
    0 2px 12px rgba(64, 158, 255, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(64, 158, 255, 0.06);

  :deep(.n-card__content) {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
}

.content-layout {
  flex: 1;
  display: flex;
  gap: 20px;
  min-height: 0;
  overflow: hidden;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
}

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
  letter-spacing: 0.01em;
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

.empty-state {
  text-align: center;
  padding: 32px 0;
  color: #94a3b8;
  font-size: 13px;
}

.pagination-box {
  padding-top: 12px;
  display: flex;
  justify-content: center;
  overflow: hidden;
}

:deep(.row-selected td) {
  background: #e8f4fd !important;
}

:deep(.n-data-table-th) {
  background: #f8fafc !important;
  font-weight: 600;
  color: #334155;
  font-size: 12px;
  letter-spacing: 0.02em;
}

:deep(.n-data-table-td) {
  font-size: 13px;
  color: #475569;
}

:deep(.n-data-table-tr:hover td) {
  background: #f0f9ff !important;
}

.right-panel {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

.knowledge-card {
  padding: 16px 20px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-left: 4px solid #0ea5e9;
  border-radius: 0 8px 8px 0;

  @media (max-width: 768px) {
    padding: 12px 14px;
  }
}

.knowledge-label {
  font-size: 13px;
  font-weight: 700;
  color: #0ea5e9;
  margin-bottom: 8px;
  letter-spacing: 0.02em;
}

.knowledge-text {
  font-size: 14px;
  line-height: 1.8;
  color: #1e40af;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 13px;
  }
}

.ai-action-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hint-text {
  font-size: 13px;
  color: #94a3b8;
}

.ai-response-area {
  position: relative;
  flex: 1;
  overflow: hidden;
  min-height: 0;
  border: 1px solid #e8ecf1;
  border-radius: 10px;
  background: #fafbfc;
}

.response-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  gap: 16px;
}

.placeholder-text {
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.6;
}

.response-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 16px;
}

.loading-text {
  font-size: 14px;
  color: #64748b;
}

.response-content {
  padding: 20px 24px;

  @media (max-width: 768px) {
    padding: 14px 16px;
  }
}

.response-text {
  font-size: 14px;
  line-height: 1.85;
  color: #1e293b;
}

.resp-h3 {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 20px 0 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e2e8f0;
}

.resp-h4 {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin: 14px 0 6px;
}

.resp-ul {
  padding-left: 20px;
  margin: 6px 0 12px;
}

.resp-li {
  margin-bottom: 4px;
  color: #475569;
}

.resp-p {
  color: #475569;
}

.response-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: #ef4444;
  gap: 8px;
}

@keyframes pulse-text {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
