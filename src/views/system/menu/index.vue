<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { NButton, NCard, NTag } from 'naive-ui'
import { h, ref, onMounted } from 'vue'

import { ScrollContainer } from '@/components'
import { useInjection } from '@/composables'
import { mediaQueryInjectionKey } from '@/injection'
import { getMenuList } from '@/api'

defineOptions({
  name: 'SystemMenu',
})

const { isMaxMd, isMaxLg } = useInjection(mediaQueryInjectionKey)

interface RowVO {
  id: number
  pid: number
  name: string
  label: string
  path: string
  type: string
  status: number
  icon?: string
  meta?: {
    title?: string
    icon?: string
  }
}

const tableData = ref<RowVO[]>([])

const treeConfig = ref({
  rowField: 'id',
  parentField: 'pid',
  expandAll: true,
})

async function fetchMenuList() {
  try {
    const res = await getMenuList()
    tableData.value = res.data as unknown as RowVO[]
  } catch (error) {
    console.error('获取菜单列表失败:', error)
  }
}

onMounted(() => {
  fetchMenuList()
})
</script>
<template>
  <ScrollContainer
    wrapper-class="flex flex-col gap-y-2"
    :scrollable="isMaxLg"
  >
    <NCard
      title="菜单管理"
      :size="isMaxMd ? 'small' : undefined"
      style="flex: 1; min-height: 0"
      content-style="display: flex; flex-direction: column; height: 100%;"
    >
      <template #header-extra>
        <NButton type="primary">新增菜单</NButton>
      </template>
      <vxe-table
        :data="tableData"
        border
        height="100%"
        :tree-config="treeConfig"
      >
        <vxe-column
          title="菜单名称"
          width="250"
          tree-node
        >
          <template #default="{ row }">
            <component
              :is="h(Icon, { icon: row.icon || row.meta?.icon || '', class: 'size-4 mr-1' })"
              v-if="row.icon || row.meta?.icon"
            />
            {{ row.meta?.title || row.label }}
          </template>
        </vxe-column>
        <vxe-column
          field="type"
          title="类型"
          width="120"
        >
          <template #default="{ row }">
            <NTag :type="row.type === 'catalog' ? 'info' : 'default'">
              {{ row.type === 'catalog' ? '目录' : '菜单' }}
            </NTag>
          </template>
        </vxe-column>
        <vxe-column
          field="path"
          title="路径"
          width="200"
        ></vxe-column>
        <vxe-column
          title="状态"
          width="100"
        >
          <template #default="{ row }">
            <NTag :type="row.status === 1 ? 'success' : 'error'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </NTag>
          </template>
        </vxe-column>
        <vxe-column title="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2">
              <NButton size="small" type="info">新增下级</NButton>
              <NButton size="small" type="info">修改</NButton>
              <NButton size="small" type="error">删除</NButton>
            </div>
          </template>
        </vxe-column>
      </vxe-table>
    </NCard>
  </ScrollContainer>
</template>
