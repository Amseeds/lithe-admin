import { get } from '@/utils/request'

// 科室分类 (返回 string[])
export const getCategories = () =>
  get<string[]>('/api/v1/druguser/categories')

// 药品列表项
export interface DrugItem {
  id: number
  categoryName: string
  sequenceNo: number
  drugName: string
  specification: string
  unit: string
  origin: string
  medicationTips: string
  sourceFile: string
  createTime: string
  updateTime: string
}

export interface DrugListData {
  list: DrugItem[]
  total: number
  pageNum: number
  pageSize: number
  pages: number
}

// 按科室查询药品 (分页)
export const getDrugsByCategory = (params: {
  categoryName: string
  pageNum: number
  pageSize: number
}) => get<DrugListData>(
  '/api/v1/druguser/by-category/page',
  params as unknown as Record<string, unknown>,
)

// 搜索药品详情
export const searchDrugDetail = (params: { keyword: string }) =>
  get<DrugListData>(
    '/api/v1/druguser/search/page',
    params as unknown as Record<string, unknown>,
  )
