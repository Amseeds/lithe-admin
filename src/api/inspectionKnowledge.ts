import { get } from '@/utils/request'

export interface InspectionCategory {
  id: number
  categoryName: string
  categoryCode: string
  sortOrder: number
  createTime: string
  updateTime: string
}

export interface InspectionItem {
  id: number
  categoryId: number
  subcategoryName: string
  itemName: string
  itemNameEn: string
  principle: string
  clinicalSignificance: string
  relatedDiseases: string
  sortOrder: number
  createTime: string
  updateTime: string
}

export interface InspectionListData {
  list: InspectionItem[]
  total: number
  pageNum: number
  pageSize: number
  pages: number
}

/**
 * 获取检查知识分类列表
 */
export const getInspectionCategories = () =>
  get<InspectionCategory[]>('/api/knowledge/examination/categories')

/**
 * 分页查询检查知识列表
 */
export const getInspectionList = (params: {
  categoryId: number
  pageNum: number
  pageSize: number
}) =>
  get<InspectionListData>(
    '/api/knowledge/examination/page',
    params as unknown as Record<string, unknown>,
  )
