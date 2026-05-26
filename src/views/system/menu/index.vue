<script setup lang="ts">
import { Icon } from '@iconify/vue'
import {
  NButton,
  NCard,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NPopconfirm,
  NSelect,
  NSwitch,
  NTag,
  useMessage,
} from 'naive-ui'
import { computed, h, reactive, ref, onMounted, nextTick } from 'vue'

import { ScrollContainer } from '@/components'
import { useInjection } from '@/composables'
import { mediaQueryInjectionKey } from '@/injection'
import { getMenuList, deleteMenu, createMenu, updateMenu } from '@/api'
import { useUserStore } from '@/stores'

import type { FormRules } from 'naive-ui'

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

const message = useMessage()
const deleteLoading = ref(false)
const xTableRef = ref<any>(null)
const userStore = useUserStore()

async function handleDelete(row: RowVO) {
  deleteLoading.value = true
  try {
    await deleteMenu(row.id)
    message.success('删除成功')
    await fetchMenuList()
    await nextTick()
    xTableRef.value?.setAllTreeExpand(true)
    userStore.refreshUserMenu()
  } catch {
    message.error('删除失败')
  } finally {
    deleteLoading.value = false
  }
}

onMounted(() => {
  fetchMenuList()
})

const showDrawer = ref(false)
const submitLoading = ref(false)
const formRef = ref<any>(null)
const editingId = ref<number | null>(null)

const form = reactive({
  parent_id: null as number | null,
  name: '',
  path: '',
  label: null as string | null,
  icon: null as string | null,
  component: null as string | null,
  sort_order: 0,
  menu_type: 'menu',
  status: 1,
  is_visible: true,
  is_enabled: true,
})

const menuTypeOptions = [
  { label: '菜单', value: 'menu' },
  { label: '分组', value: 'group' },
  { label: '分隔线', value: 'divider' },
  { label: '按钮', value: 'button' },
]

const parentOptions = computed(() => {
  function toOptions(items: RowVO[]): { label: string; value: number }[] {
    return items
      .filter((item) => item.id !== editingId.value)
      .map((item) => ({
        label: item.meta?.title || item.label || item.name,
        value: item.id,
      }))
  }
  return toOptions(tableData.value)
})

const rules: FormRules = {
  name: { required: true, message: '请输入路由名称', trigger: ['input', 'blur'] },
  path: { required: true, message: '请输入路由路径', trigger: ['input', 'blur'] },
}

function resetForm() {
  form.parent_id = null
  form.name = ''
  form.path = ''
  form.label = null
  form.icon = null
  form.component = null
  form.sort_order = 0
  form.menu_type = 'menu'
  form.status = 1
  form.is_visible = true
  form.is_enabled = true
  formRef.value?.restoreValidation()
}

function openCreateDrawer(parentId?: number | null) {
  editingId.value = null
  resetForm()
  form.parent_id = parentId ?? null
  showDrawer.value = true
}

function openEditDrawer(row: RowVO) {
  editingId.value = row.id
  form.parent_id = row.pid ?? null
  form.name = row.name
  form.path = row.path
  form.label = (row as any).label ?? row.meta?.title ?? null
  form.icon = row.meta?.icon ?? null
  form.component = (row as any).component ?? null
  form.sort_order = (row as any).sort_order ?? 0
  form.menu_type = (row as any).menu_type ?? 'menu'
  form.status = row.status ?? 1
  form.is_visible = (row as any).is_visible ?? true
  form.is_enabled = (row as any).is_enabled ?? true
  formRef.value?.restoreValidation()
  showDrawer.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  submitLoading.value = true
  try {
    const payload = {
      parent_id: form.parent_id,
      name: form.name,
      path: form.path,
      label: form.label,
      icon: form.icon,
      component: form.component,
      sort_order: form.sort_order,
      menu_type: form.menu_type,
      status: form.status,
      is_visible: form.is_visible,
      is_enabled: form.is_enabled,
    }
    if (editingId.value) {
      await updateMenu(editingId.value, payload)
      message.success('修改成功')
    } else {
      await createMenu(payload)
      message.success('新增成功')
    }
    showDrawer.value = false
    await fetchMenuList()
    await nextTick()
    xTableRef.value?.setAllTreeExpand(true)
    userStore.refreshUserMenu()
  } catch {
    message.error(editingId.value ? '修改失败' : '新增失败')
  } finally {
    submitLoading.value = false
  }
}
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
        <NButton type="primary" @click="openCreateDrawer">新增菜单</NButton>
      </template>
      <vxe-table
        ref="xTableRef"
        :data="tableData"
        border
        height="100%"
        :tree-config="treeConfig"
      >
        <vxe-column
          title="菜单名称"
          width="250"
          fixed="left"
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
          min-width="200"
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
              <NButton size="small" type="info" @click="openCreateDrawer(row.id)">新增下级</NButton>
              <NButton size="small" type="info" @click="openEditDrawer(row)">修改</NButton>
              <NPopconfirm @positive-click="handleDelete(row)">
                <template #trigger>
                  <NButton size="small" type="error" :loading="deleteLoading">删除</NButton>
                </template>
                确定删除该菜单？
              </NPopconfirm>
            </div>
          </template>
        </vxe-column>
      </vxe-table>
    </NCard>
    <NDrawer v-model:show="showDrawer" :width="480">
      <NDrawerContent :title="editingId ? '修改菜单' : '新增菜单'" :native-scrollbar="false">
        <NForm ref="formRef" :model="form" :rules="rules" label-placement="top">
          <NFormItem label="路由名称" path="name">
            <NInput v-model:value="form.name" placeholder="唯一标识，如 system_menu" />
          </NFormItem>
          <NFormItem label="路由路径" path="path">
            <NInput v-model:value="form.path" placeholder="如 /system/menu" />
          </NFormItem>
          <NFormItem label="显示名称" path="label">
            <NInput v-model:value="form.label" placeholder="菜单显示名称" />
          </NFormItem>
          <div class="flex gap-x-4">
            <NFormItem label="类型" path="menu_type" class="flex-1">
              <NSelect v-model:value="form.menu_type" :options="menuTypeOptions" />
            </NFormItem>
            <NFormItem label="父菜单" path="parent_id" class="flex-1">
              <NSelect
                v-model:value="form.parent_id"
                :options="parentOptions"
                clearable
                placeholder="顶级菜单"
              />
            </NFormItem>
          </div>
          <NFormItem label="图标" path="icon">
            <NInput v-model:value="form.icon" placeholder="图标名称" />
          </NFormItem>
          <NFormItem label="组件路径" path="component">
            <NInput v-model:value="form.component" placeholder="如 /src/views/system/menu/index.vue" />
          </NFormItem>
          <NFormItem label="排序" path="sort_order">
            <NInputNumber v-model:value="form.sort_order" min="0" class="w-full" />
          </NFormItem>
          <NFormItem label="状态" path="status">
            <NSwitch
              :value="form.status === 1"
              @update:value="(v: boolean) => (form.status = v ? 1 : 0)"
            />
          </NFormItem>
          <NFormItem label="是否可见" path="is_visible">
            <NSwitch v-model:value="form.is_visible" />
          </NFormItem>
          <NFormItem label="是否启用" path="is_enabled">
            <NSwitch v-model:value="form.is_enabled" />
          </NFormItem>
        </NForm>
        <template #footer>
          <div class="flex justify-end gap-x-4">
            <NButton @click="showDrawer = false">取消</NButton>
            <NButton type="primary" :loading="submitLoading" :disabled="submitLoading" @click="handleSubmit">
              确定
            </NButton>
          </div>
        </template>
      </NDrawerContent>
    </NDrawer>
  </ScrollContainer>
</template>
