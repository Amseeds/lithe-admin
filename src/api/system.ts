import request from '@/utils/request'

import type { MenuMixedOptions } from '@/router/interface'

export interface SystemMenu {
  id: number
  pid: number
  name: string
  path: string
  component?: string
  type: 'catalog' | 'menu' | 'button'
  icon?: string
  activeIcon?: string
  label: string
  meta?: {
    title?: string
    icon?: string
    activeIcon?: string
    badgeType?: string
    badge?: string
    badgeVariants?: string
    keepAlive?: boolean
    affixTab?: boolean
    hideInMenu?: boolean
    hideChildrenInMenu?: boolean
    hideInBreadcrumb?: boolean
    hideInTab?: boolean
    pinned?: boolean
  }
  authCode?: string
  status: number
  children?: SystemMenu[]
}

export async function getMenuList() {
  return request<{ data: SystemMenu[] }>({
    url: '/system/menu/list',
    method: 'get',
  })
}

export async function getMenuTree() {
  return request<{ data: MenuMixedOptions[] }>({
    url: '/menu/tree',
    method: 'get',
  })
}

export interface MenuCreatePayload {
  parent_id?: number | null
  path: string
  name: string
  label?: string | null
  icon?: string | null
  component?: string | null
  redirect?: string | null
  sort_order?: number
  menu_type?: string
  key?: string | null
  status?: number
  auth_code?: string | null
  is_visible?: boolean
  is_enabled?: boolean
  meta?: Record<string, unknown> | null
}

export async function createMenu(data: MenuCreatePayload) {
  return request({
    url: '/system/menu',
    method: 'post',
    data,
  })
}

export async function updateMenu(id: number, data: Partial<MenuCreatePayload>) {
  return request({
    url: `/system/menu/${id}`,
    method: 'put',
    data,
  })
}

export async function deleteMenu(id: number) {
  return request({
    url: `/system/menu/${id}`,
    method: 'delete',
  })
}

export interface MenuFormData {
  id?: number
  pid?: number
  name: string
  label: string
  path?: string
  component?: string
  type: 'catalog' | 'menu' | 'button'
  icon?: string
  activeIcon?: string
  authCode?: string
  status: number
  meta: {
    title?: string
    icon?: string
    activeIcon?: string
    badgeType?: string
    badge?: string
    badgeVariants?: string
    keepAlive?: boolean
    affixTab?: boolean
    hideInMenu?: boolean
    hideChildrenInMenu?: boolean
    hideInBreadcrumb?: boolean
    hideInTab?: boolean
  }
}
