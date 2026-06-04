<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { ScrollContainer } from '@/components'
import { useInjection } from '@/composables'
import { getCategories, getDrugsByCategory, type DrugItem } from '@/api/medicationInstructions'
import {
  NCard,
  NTree,
  NDataTable,
  NScrollbar,
  NSpin,
  NPagination,
  NModal,
  type TreeOption,
  type DataTableColumns,
  type PaginationProps,
} from 'naive-ui'
import { mediaQueryInjectionKey } from '@/injection'

defineOptions({ name: 'MedicationInstructions' })

const { isMaxMd, isMaxLg } = useInjection(mediaQueryInjectionKey)

// ===================== 科室树 =====================
const treeData = ref<TreeOption[]>([])
const treeLoading = ref(false)
const selectedCat = ref('')

async function loadCategories() {
  treeLoading.value = true
  try {
    const { data } = await getCategories()
    treeData.value = data.map((name, i) => ({
      key: `cat-${i}`,
      label: name,
      isLeaf: true,
      catName: name,
    }))
  } finally {
    treeLoading.value = false
  }
}

function handleSelect(_keys: string[], nodes: TreeOption[]) {
  if (!nodes.length) return
  const n = nodes[0] as TreeOption & { catName?: string }
  if (!n.catName) return
  selectedCat.value = n.catName
  tablePage.value = 1
  loadDrugs()
}

// ===================== 药品表格 =====================
const tableData = ref<DrugItem[]>([])
const tableLoading = ref(false)
const tablePage = ref(1)
const tableTotal = ref(0)
const tablePageSize = 10

async function loadDrugs() {
  tableLoading.value = true
  try {
    const { data } = await getDrugsByCategory({
      categoryName: selectedCat.value,
      pageNum: tablePage.value,
      pageSize: tablePageSize,
    })
    tableData.value = data.list || []
    tableTotal.value = data.total || 0
  } finally {
    tableLoading.value = false
  }
}

const columns: DataTableColumns<DrugItem> = [
  { title: '药品名称', key: 'drugName', width: 160, ellipsis: { tooltip: true } },
  { title: '规格', key: 'specification', width: 120, render(row) { return row.specification || '-' }, ellipsis: { tooltip: true } },
  { title: '单位', key: 'unit', width: 60, render(row) { return row.unit || '-' } },
  { title: '厂家', key: 'origin', width: 140, render(row) { return row.origin || '-' }, ellipsis: { tooltip: true } },
  { title: '用药交代', key: 'medicationTips', minWidth: 280, render(row) { return row.medicationTips || '-' } },
  // {
  //   title: '操作',
  //   key: 'action',
  //   width: 90,
  //   render(row) {
  //     return h('span', { style: { color: '#409eff', cursor: 'pointer' }, onClick: () => showDetail(row) }, '查看详情')
  //   },
  // },
]

// ===================== 详情弹窗 =====================
const showDetailModal = ref(false)
const detailDrug = ref<DrugItem | null>(null)

function showDetail(row: DrugItem) {
  detailDrug.value = row
  showDetailModal.value = true
}

onMounted(() => {
  loadCategories()
})
</script>

<template>
  <ScrollContainer
    wrapper-class="flex flex-col gap-y-4"
    :scrollable="isMaxLg"
  >
    <NCard
      class="main-card flex-1"
      :size="isMaxMd ? 'small' : undefined"
      content-class="flex flex-col min-h-0"
    >
      <div class="content-layout">
        <!-- 左侧: 科室树 -->
        <div class="left-panel">
          <div class="panel-header"><span class="panel-title">用药交代实用手册</span></div>
          <NScrollbar class="tree-wrapper">
            <NSpin
              :show="treeLoading"
              size="small"
            >
              <NTree
                :data="treeData"
                block-line
                selectable
                expand-on-click
                @update:selected-keys="handleSelect"
              />
            </NSpin>
          </NScrollbar>
        </div>

        <!-- 右侧: 药品列表 -->
        <div class="right-panel">
          <div
            v-if="!selectedCat"
            class="empty-state"
          >
            <span class="placeholder-icon iconify ph--clipboard-text" />
            <p class="placeholder-title">用药交代实用手册</p>
            <p class="placeholder-desc">请在左侧选择科室查看该科室下的药品列表</p>
          </div>
          <template v-else>
            <div class="table-header">
              <span class="table-header-icon iconify ph--clipboard-text" />
              <span>{{ selectedCat }}</span>
              <span class="table-count">{{ tableTotal }} 个药品</span>
            </div>
            <NScrollbar class="table-wrapper">
              <NDataTable
                :columns="columns"
                :data="tableData"
                :loading="tableLoading"
                size="small"
                :bordered="false"
                class="drug-table"
              />
            </NScrollbar>
            <div
              v-if="tableTotal > tablePageSize"
              class="table-pagination"
            >
              <NPagination
                v-model:page="tablePage"
                :page-size="tablePageSize"
                :page-slot="5"
                :item-count="tableTotal"
                size="small"
                @update:page="loadDrugs"
              />
            </div>
          </template>
        </div>
      </div>
    </NCard>

    <!-- 药品详情弹窗 -->
    <NModal
      v-model:show="showDetailModal"
      preset="card"
      :title="detailDrug?.drugName"
      style="width: 780px; max-width: 95vw"
      :bordered="false"
      :segmented="{ content: true }"
    >
      <template v-if="detailDrug">
        <div class="detail-grid">
          <div class="detail-row">
            <span class="detail-label">药品名称</span>
            <span class="detail-value">{{ detailDrug.drugName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">规格</span>
            <span class="detail-value">{{ detailDrug.specification || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">单位</span>
            <span class="detail-value">{{ detailDrug.unit || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">厂家</span>
            <span class="detail-value">{{ detailDrug.origin || '-' }}</span>
          </div>
          <div class="detail-row detail-row--tips">
            <span class="detail-label">用药交代</span>
            <span class="detail-value">{{ detailDrug.medicationTips }}</span>
          </div>
        </div>
      </template>
    </NModal>
  </ScrollContainer>
</template>

<style lang="scss" scoped>
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
  width: 260px;
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
.tree-wrapper {
  flex: 1;
  min-height: 0;
  :deep(.n-tree-node-content) {
    font-size: 13px;
  }
}

.right-panel {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px;
  text-align: center;
}
.placeholder-icon {
  font-size: 48px;
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
}

.table-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 0 14px;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  flex-shrink: 0;
}
.table-header-icon {
  font-size: 18px;
  color: #409eff;
}
.table-count {
  margin-left: auto;
  font-size: 12px;
  font-weight: 400;
  color: #94a3b8;
  padding: 2px 10px;
  background: #f1f5f9;
  border-radius: 10px;
}

.table-wrapper {
  flex: 1;
  min-height: 0;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}
.table-pagination {
  padding: 10px 16px 12px;
  display: flex;
  justify-content: center;
}

.drug-table {
  :deep(.n-data-table-th) {
    background: #f8fafc !important;
    font-weight: 600;
    color: #334155;
    font-size: 12px;
  }
  :deep(.n-data-table-td) {
    font-size: 13px;
    color: #475569;
    padding: 10px 14px;
  }
  :deep(.n-data-table-tr:hover td) {
    background: #f0f9ff !important;
  }
}

// 详情弹窗
.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.detail-row {
  display: flex;
  gap: 12px;
}
.detail-label {
  color: #94a3b8;
  font-size: 13px;
  min-width: 72px;
  flex-shrink: 0;
  padding-top: 2px;
}
.detail-value {
  color: #1e293b;
  font-size: 14px;
  line-height: 1.6;
}
.detail-row--tips .detail-value {
  color: #475569;
  font-size: 13px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
  flex: 1;
}
</style>
