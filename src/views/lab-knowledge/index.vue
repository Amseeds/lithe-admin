<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ScrollContainer } from '@/components'
import { useInjection } from '@/composables'
import { getCategoryList, getLabSubject, getLabItems, type LabItem } from '@/api/labKnowledge'
import {
  NCard,
  NTree,
  NDataTable,
  NScrollbar,
  NSpin,
  type TreeOption,
  type DataTableColumns,
} from 'naive-ui'
import { mediaQueryInjectionKey } from '@/injection'

defineOptions({ name: 'LabKnowledge' })

const { isMaxMd, isMaxLg } = useInjection(mediaQueryInjectionKey)

// ===================== Tree 数据 =====================
const treeData = ref<TreeOption[]>([])
const treeLoading = ref(false)
const selectedKey = ref<string | null>(null)
const loadedIds = new Set<number>()

async function loadCategories() {
  treeLoading.value = true
  try {
    const { data } = await getCategoryList()
    treeData.value = data.map((cat) => ({
      key: `cat-${cat.id}`,
      label: cat.catName,
      isLeaf: false,
      catId: cat.id,
    }))
  } finally {
    treeLoading.value = false
  }
}

function handleLoad(node: TreeOption): Promise<void> {
  return new Promise<void>((resolve) => {
    const n = node as TreeOption & { catId?: number }
    if (!n.catId || loadedIds.has(n.catId)) {
      resolve()
      return
    }
    loadedIds.add(n.catId)
    getLabSubject(n.catId).then(({ data }) => {
      node.children = data.map((sub) => ({
        key: `sub-${sub.id}`,
        label: sub.subName,
        isLeaf: true,
        subId: sub.id,
      }))
      resolve()
    })
  })
}

// ===================== 表格数据 =====================
const tableData = ref<LabItem[]>([])
const tableLoading = ref(false)
const selectedLabel = ref('')

async function handleSelect(keys: string[], nodes: TreeOption[]) {
  if (!nodes.length) return
  const node = nodes[0] as TreeOption & { subId?: number }
  if (!node.subId) return
  selectedKey.value = keys[0]
  selectedLabel.value = node.label as string
  tableLoading.value = true
  try {
    const { data } = await getLabItems(node.subId)
    tableData.value = data
  } finally {
    tableLoading.value = false
  }
}

const columns: DataTableColumns<LabItem> = [
  { title: '检验项目', key: 'itemName', width: 200, ellipsis: { tooltip: true } },
  { title: '标本', key: 'specimen', width: 80 },
  { title: '参考区间', key: 'refRange', width: 200 },
  { title: '临床意义', key: 'clinicalText', minWidth: 300 },
]

onMounted(() => {
  loadCategories()
})
</script>

<template>
  <ScrollContainer
    wrapper-class="flex flex-col gap-y-4 lab-knowledge-page"
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
          <div class="panel-header"><span class="panel-title">检验项目分类</span></div>
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
                :selected-keys="selectedKey ? [selectedKey] : []"
                :on-load="handleLoad"
                @update:selected-keys="handleSelect"
              />
            </NSpin>
          </NScrollbar>
        </div>

        <!-- 右侧: 检验项目详情 -->
        <div class="right-panel">
          <div
            v-if="!selectedLabel"
            class="empty-state"
          >
            <span class="placeholder-icon iconify ph--flask" />
            <p class="placeholder-title">检验项目详情</p>
            <p class="placeholder-desc">请在左侧选择检验子类查看详细项目信息</p>
          </div>
          <template v-else>
            <div class="table-header">
              <span class="table-header-icon iconify ph--flask" />
              <span>{{ selectedLabel }}</span>
              <span class="table-count">{{ tableData.length }} 个项目</span>
            </div>
            <NScrollbar class="table-wrapper">
              <NDataTable
                :columns="columns"
                :data="tableData"
                :loading="tableLoading"
                size="small"
                :bordered="false"
                class="lab-table"
              />
            </NScrollbar>
          </template>
        </div>
      </div>
    </NCard>
  </ScrollContainer>
</template>

<style lang="scss" scoped>
.lab-knowledge-page {
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
.lab-table {
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
