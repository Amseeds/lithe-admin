<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ScrollContainer } from '@/components'
import { useInjection } from '@/composables'
import {
  getInspectionCategories,
  getInspectionList,
  type InspectionItem,
} from '@/api/inspectionKnowledge'
import {
  NCard,
  NTree,
  NDataTable,
  NScrollbar,
  NSpin,
  NPagination,
  type TreeOption,
  type DataTableColumns,
} from 'naive-ui'
import { mediaQueryInjectionKey } from '@/injection'

defineOptions({ name: 'InspectionKnowledge' })

const { isMaxMd, isMaxLg } = useInjection(mediaQueryInjectionKey)

// ===================== 分类树 =====================
const treeData = ref<TreeOption[]>([])
const treeLoading = ref(false)
const selectedCatId = ref(0)
const selectedCatName = ref('')

async function loadCategories() {
  treeLoading.value = true
  try {
    const { data } = await getInspectionCategories()
    treeData.value = data.map((cat) => ({
      key: `cat-${cat.id}`,
      label: cat.categoryName,
      isLeaf: true,
      catId: cat.id,
    }))
  } finally {
    treeLoading.value = false
  }
}

function handleSelect(_keys: string[], nodes: TreeOption[]) {
  if (!nodes.length) return
  const n = nodes[0] as TreeOption & { catId?: number }
  if (!n.catId) return
  selectedCatId.value = n.catId
  selectedCatName.value = n.label as string
  tablePage.value = 1
  loadList()
}

// ===================== 知识列表 =====================
const tableData = ref<InspectionItem[]>([])
const tableLoading = ref(false)
const tablePage = ref(1)
const tableTotal = ref(0)
const tablePageSize = 10

async function loadList() {
  tableLoading.value = true
  try {
    const { data } = await getInspectionList({
      categoryId: selectedCatId.value,
      pageNum: tablePage.value,
      pageSize: tablePageSize,
    })
    tableData.value = data.list || []
    tableTotal.value = data.total || 0
  } finally {
    tableLoading.value = false
  }
}

// 列定义（根据实际响应字段调整 key 名）
const columns: DataTableColumns<InspectionItem> = [
  {
    title: '子分类名称',
    key: 'subcategoryName',
    width: 140,
    render(row) {
      return row.subcategoryName || '-'
    },
  },
  { title: '检查项目', key: 'itemName', width: 180, ellipsis: { tooltip: true } },
  {
    title: '检测原理',
    key: 'principle',
    width: 260,
    render(row) {
      return row.principle || '-'
    },
  },
  {
    title: '临床意义',
    key: 'clinicalSignificance',
    minWidth: 300,
    render(row) {
      return row.clinicalSignificance || '-'
    },
  },
  {
    title: '相关疾病',
    key: 'relatedDiseases',
    width: 220,
    render(row) {
      return row.relatedDiseases || '-'
    },
  },
]

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
        <!-- 左侧: 分类树 -->
        <div class="left-panel">
          <div class="panel-header"><span class="panel-title">检查知识分类</span></div>
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

        <!-- 右侧: 知识列表 -->
        <div class="right-panel">
          <div
            v-if="!selectedCatId"
            class="empty-state"
          >
            <span class="placeholder-icon iconify ph--magnifying-glass" />
            <p class="placeholder-title">检查知识详情</p>
            <p class="placeholder-desc">请在左侧选择分类查看该分类下的检查知识列表</p>
          </div>
          <template v-else>
            <div class="table-header">
              <span class="table-header-icon iconify ph--magnifying-glass" />
              <span>{{ selectedCatName }}</span>
              <span class="table-count">{{ tableTotal }} 条记录</span>
            </div>
            <NScrollbar class="table-wrapper">
              <NDataTable
                :columns="columns"
                :data="tableData"
                :loading="tableLoading"
                size="small"
                :bordered="false"
                class="inspection-table"
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
                @update:page="loadList"
              />
            </div>
          </template>
        </div>
      </div>
    </NCard>
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
  width: 220px;
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

.inspection-table {
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
</style>
