export interface RoleRecord {
  id: number
  name: string
  status: 0 | 1
  remark: string
  created_at: string
  menu_ids: number[]
}

let mockRoles: RoleRecord[] = [
  { id: 1, name: '超级管理员', status: 1, remark: '系统最高权限角色', created_at: '2024-01-01 00:00:00', menu_ids: [1, 2, 3, 4, 5] },
  { id: 2, name: '普通管理员', status: 1, remark: '日常管理角色', created_at: '2024-01-15 10:30:00', menu_ids: [1, 2, 3] },
  { id: 3, name: '数据查看员', status: 1, remark: '仅拥有数据查看权限', created_at: '2024-02-01 14:20:00', menu_ids: [1] },
  { id: 4, name: '内容编辑', status: 0, remark: '内容管理相关权限', created_at: '2024-03-10 09:15:00', menu_ids: [2, 3] },
  { id: 5, name: '访客', status: 1, remark: '仅可查看仪表板', created_at: '2024-04-20 16:45:00', menu_ids: [] },
  { id: 6, name: '系统维护员', status: 0, remark: '系统维护专用角色', created_at: '2024-05-05 11:00:00', menu_ids: [1, 4] },
]

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let nextId = 7

export async function getRoleList(params?: { name?: string; id?: number }) {
  await delay()
  let filtered = [...mockRoles]
  if (params?.name) {
    filtered = filtered.filter((r) => r.name.includes(params.name!))
  }
  if (params?.id) {
    filtered = filtered.filter((r) => r.id === params.id)
  }
  return {
    code: 0,
    message: 'success',
    data: filtered,
  }
}

export async function createRole(data: { name: string; status: 0 | 1; remark: string; menu_ids: number[] }) {
  await delay()
  const role: RoleRecord = {
    id: nextId++,
    name: data.name,
    status: data.status,
    remark: data.remark,
    created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
    menu_ids: data.menu_ids,
  }
  mockRoles.unshift(role)
  return { code: 0, message: 'success', data: role }
}

export async function updateRole(id: number, data: { name: string; status: 0 | 1; remark: string; menu_ids: number[] }) {
  await delay()
  const index = mockRoles.findIndex((r) => r.id === id)
  if (index === -1) {
    return { code: 1, message: '角色不存在', data: null }
  }
  mockRoles[index] = { ...mockRoles[index], ...data }
  return { code: 0, message: 'success', data: mockRoles[index] }
}

export async function deleteRole(id: number) {
  await delay()
  const index = mockRoles.findIndex((r) => r.id === id)
  if (index === -1) {
    return { code: 1, message: '角色不存在', data: null }
  }
  mockRoles.splice(index, 1)
  return { code: 0, message: 'success', data: null }
}
