import { get, post, del } from '@/utils/request'

// 资料分类
export const CATEGORY_OPTIONS = [
  { label: '基础知识', value: '1' },
  { label: '饮食管理', value: '2' },
  { label: '运动指导', value: '3' },
  { label: '用药指导', value: '4' },
  { label: '并发症预防', value: '5' },
  { label: '心理健康', value: '6' },
  { label: '其他', value: '7' },
] as const

// 教育资料
export interface EducationMaterial {
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
export interface EducationQueryParams {
  title?: string
  category?: string
  CheckFavorites?: '0' | '1' // 0: 全部, 1: 收藏 (注意大写 C)
  pageNum: number
  pageSize: number
}

// 分页响应
export interface EducationPageResponse {
  list: EducationMaterial[]
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

// 获取资料列表
export function getEducationList(params: EducationQueryParams) {
  return get<EducationPageResponse>('/api/education/page', params as unknown as Record<string, unknown>)
}

// 创建资料（上传）- 注意：FormData 需要特殊处理
export function createEducation(data: FormData) {
  return post('/api/education/upload', data as unknown as Record<string, unknown>)
}

// 删除资料
export function deleteEducation(id: string) {
  return del<null>(`/api/education/${id}`)
}

// 收藏/取消收藏
export function toggleFavorite(id: string) {
  return post<null>(`/api/education/${id}/favorite`)
}

// 获取下载地址
export function getDownloadUrl(id: string) {
  return `/api/education/${id}/download`
}
