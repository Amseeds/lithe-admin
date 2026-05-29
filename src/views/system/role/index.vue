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
  NPopconfirm,
  NSwitch,
  NTag,
  NTree,
  useMessage,
} from 'naive-ui'
import { reactive, ref, onMounted } from 'vue'

import { ScrollContainer } from '@/components'
import { useInjection } from '@/composables'
import { mediaQueryInjectionKey } from '@/injection'
import { getRoleList, createRole, updateRole, deleteRole } from '@/api'
import { getMenuList } from '@/api'

import type { FormRules, TreeOption } from 'naive-ui'

defineOptions({
  name: 'SystemRole',
})

const { isMaxMd, isMaxLg } = useInjection(mediaQueryInjectionKey)

interface RoleRecord {
  id: number
  name: string
  status: 0 | 1
  remark: string
  created_at: string
  menu_ids: number[]
}

const tableData = ref<RoleRecord[]>([])
const loading = ref(false)
const message = useMessage()

async function fetchRoleList() {
  loading.value = true
  try {
    const res = await getRoleList()
    tableData.value = res.data
  } catch (error) {
    console.error('获取角色列表失败:', error)
    message.error('获取角色列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRoleList()
})

// --- Drawer ---
const showDrawer = ref(false)
const submitLoading = ref(false)
const formRef = ref<any>(null)
const editingId = ref<number | null>(null)

const form = reactive({
  name: '',
  status: 1 as 0 | 1,
  remark: '',
  menu_ids: [] as number[],
})

const rules: FormRules = {
  name: { required: true, message: '请输入角色名称', trigger: ['input', 'blur'] },
}

function resetForm() {
  form.name = ''
  form.status = 1
  form.remark = ''
  form.menu_ids = []
  checkedMenuIds.value = []
  formRef.value?.restoreValidation()
}

function openCreateDrawer() {
  editingId.value = null
  resetForm()
  fetchMenuTree()
  showDrawer.value = true
}

function openEditDrawer(row: RoleRecord) {
  editingId.value = row.id
  form.name = row.name
  form.status = row.status
  form.remark = row.remark
  form.menu_ids = [...row.menu_ids]
  checkedMenuIds.value = [...row.menu_ids]
  formRef.value?.restoreValidation()
  fetchMenuTree()
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
      name: form.name,
      status: form.status,
      remark: form.remark,
      menu_ids: checkedMenuIds.value,
    }
    if (editingId.value) {
      await updateRole(editingId.value, payload)
      message.success('修改成功')
    } else {
      await createRole(payload)
      message.success('新增成功')
    }
    showDrawer.value = false
    await fetchRoleList()
  } catch {
    message.error(editingId.value ? '修改失败' : '新增失败')
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(row: RoleRecord) {
  try {
    await deleteRole(row.id)
    message.success('删除成功')
    await fetchRoleList()
  } catch {
    message.error('删除失败')
  }
}

// --- Menu Tree ---
const menuTreeOptions = ref<TreeOption[]>([])
const checkedMenuIds = ref<number[]>([])

const defaultTreeOptions: TreeOption[] = [
  {
    key: 1,
    label: '仪表板',
    children: [],
  },
  {
    key: 2,
    label: '数据展示',
    children: [
      { key: 3, label: '数据表格' },
      { key: 4, label: '数据表单' },
    ],
  },
  {
    key: 5,
    label: '多级菜单',
    children: [
      { key: 6, label: '图标菜单' },
      { key: 7, label: '无图标菜单' },
    ],
  },
  {
    key: 8,
    label: '系统管理',
    children: [
      { key: 9, label: '菜单管理' },
      { key: 10, label: '角色管理' },
    ],
  },
]

function buildMenuTree(menus: any[]): TreeOption[] {
  return menus.map((menu: any) => ({
    key: menu.id,
    label: menu.meta?.title || menu.label || menu.name,
    children:
      Array.isArray(menu.children) && menu.children.length > 0
        ? buildMenuTree(menu.children)
        : undefined,
  }))
}

async function fetchMenuTree() {
  try {
    const res = await getMenuList()
    const tree = buildMenuTree(res.data as any)
    if (tree.length > 0) {
      menuTreeOptions.value = tree
      return
    }
  } catch {
    console.warn('获取菜单列表失败，使用默认菜单树')
  }
  menuTreeOptions.value = defaultTreeOptions
}

function handleCheckedKeysChange(keys: Array<string | number>) {
  checkedMenuIds.value = keys as number[]
}
</script>

<template>
  <ScrollContainer
    wrapper-class="flex flex-col gap-y-2"
    :scrollable="isMaxLg"
  >
    <NCard
      :title="`角色管理 (${tableData.length})`"
      :size="isMaxMd ? 'small' : undefined"
      style="flex: 1; min-height: 0"
      content-style="display: flex; flex-direction: column; height: 100%;"
    >
      <template #header-extra>
        <NButton
          type="primary"
          @click="openCreateDrawer"
        >
          <template #icon>
            <Icon
              icon="ph:plus"
              class="size-4"
            />
          </template>
          新增角色
        </NButton>
      </template>
      <vxe-table
        :data="tableData"
        border
        height="100%"
        :loading="loading"
      >
        <vxe-column
          type="seq"
          title="序号"
          width="70"
        />
        <vxe-column
          field="name"
          title="角色名称"
          min-width="160"
        >
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <span class="font-medium">{{ row.name }}</span>
            </div>
          </template>
        </vxe-column>
        <vxe-column
          title="状态"
          width="100"
        >
          <template #default="{ row }">
            <NTag
              :type="row.status === 1 ? 'success' : 'error'"
              :bordered="false"
              size="small"
            >
              {{ row.status === 1 ? '启用' : '禁用' }}
            </NTag>
          </template>
        </vxe-column>
        <vxe-column
          field="remark"
          title="备注"
          min-width="200"
          show-overflow="tooltip"
        />
        <vxe-column
          field="created_at"
          title="创建时间"
          width="180"
        />
        <vxe-column
          title="操作"
          width="180"
          fixed="right"
        >
          <template #default="{ row }">
            <div class="flex gap-2">
              <NButton
                size="small"
                type="info"
                @click="openEditDrawer(row)"
              >
                <template #icon>
                  <Icon
                    icon="ph:pencil-simple"
                    class="size-3.5"
                  />
                </template>
                编辑
              </NButton>
              <NPopconfirm @positive-click="handleDelete(row)">
                <template #trigger>
                  <NButton
                    size="small"
                    type="error"
                  >
                    <template #icon>
                      <Icon
                        icon="ph:trash"
                        class="size-3.5"
                      />
                    </template>
                    删除
                  </NButton>
                </template>
                确定删除角色「{{ row.name }}」？
              </NPopconfirm>
            </div>
          </template>
        </vxe-column>
      </vxe-table>
    </NCard>

    <NDrawer
      v-model:show="showDrawer"
      :width="480"
    >
      <NDrawerContent
        :title="editingId ? '修改角色' : '新增角色'"
        :native-scrollbar="false"
      >
        <NForm
          ref="formRef"
          :model="form"
          :rules="rules"
          label-placement="top"
        >
          <NFormItem
            label="角色名称"
            path="name"
          >
            <NInput
              v-model:value="form.name"
              placeholder="请输入角色名称"
            />
          </NFormItem>
          <NFormItem
            label="状态"
            path="status"
          >
            <NSwitch
              :value="form.status === 1"
              @update:value="(v: boolean) => (form.status = v ? 1 : 0)"
            >
              <template #checked>启用</template>
              <template #unchecked>禁用</template>
            </NSwitch>
          </NFormItem>
          <NFormItem
            label="备注"
            path="remark"
          >
            <NInput
              v-model:value="form.remark"
              type="textarea"
              placeholder="角色的功能描述"
              :rows="3"
            />
          </NFormItem>
          <NFormItem label="菜单权限">
            <div class="max-h-72 w-full overflow-auto rounded-lg border border-gray-200 p-3">
              <NTree
                :data="menuTreeOptions"
                checkable
                cascade
                :checked-keys="checkedMenuIds"
                @update:checked-keys="handleCheckedKeysChange"
                default-expand-all
              />
            </div>
          </NFormItem>
        </NForm>
        <template #footer>
          <div class="flex justify-end gap-x-3">
            <NButton
              quaternary
              @click="showDrawer = false"
              >取消</NButton
            >
            <NButton
              type="primary"
              :loading="submitLoading"
              :disabled="submitLoading"
              @click="handleSubmit"
            >
              保存
            </NButton>
          </div>
        </template>
      </NDrawerContent>
    </NDrawer>
  </ScrollContainer>
</template>
