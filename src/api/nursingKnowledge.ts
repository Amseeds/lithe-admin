import { get } from '@/utils/request'

export interface NursingCategory {
  id: number
  categoryName: string
  categoryCode: string
  sortOrder: number
  createTime: string
  updateTime: string
}

export interface NursingItem {
  id: number
  categoryId: number
  diseaseName: string
  nursingOverview: string
  etiologyPathogenesis: string
  pathophysiology: string
  clinicalManifestation: string
  auxiliaryExamination: string
  expectedGoals: string
  nursingMeasures: string
  nursingEvaluation: string
  knowledgeExtension: string
  sortOrder: number
  createTime: string
  updateTime: string
}

export interface NursingListData {
  list: NursingItem[]
  total: number
  pageNum: number
  pageSize: number
  pages: number
}

export const getNursingCategories = () =>
  get<NursingCategory[]>('/api/knowledge/nursing/categories')

export const getNursingList = (params: {
  categoryId: number
  pageNum: number
  pageSize: number
}) =>
  get<NursingListData>(
    '/api/knowledge/nursing/page',
    params as unknown as Record<string, unknown>,
  )
