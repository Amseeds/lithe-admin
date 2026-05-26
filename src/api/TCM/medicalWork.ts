import { get, post, del } from '@/utils/request'

// 中医著作
export interface ChineseMedicalWork {
  materialId: string
  title: string
  keywords: string
  description: string
  category: string
  updateTime: string
  isFavorited: boolean
  fileUrl?: string
}

// 查询参数
export interface WorkQueryParams {
  title?: string
  pageNum: number
  pageSize: number
}

// 分页响应
export interface Response {
  list: ChineseMedicalWork[]
  total: number
}

// 创建资料参数
export interface CreateEducationParams {
  title: string
  category: string
  keywords: string
  description: string
  remark?: string
  file: File
}

// 获取中医著作列表
export function getList(params) {
  return get('/api/ebook/list', params as unknown as Record<string, unknown>)
}

// 上传中医著作
export function updateMaterial(data: FormData) {
  return post('/api/ebook/upload', data as unknown as Record<string, unknown>)
}

// 删除中医著作
export function deleteChineseMedicalWork(id: string) {
  return del<null>(`/api/ebook/${id}`)
}

// 获取下载地址
export function getDownloadUrl(id: string) {
  return `/api/education/${id}/download`
}
