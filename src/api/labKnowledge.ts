import { get } from '@/utils/request'

export interface LabCategory {
  id: number
  catName: string
}

export interface LabSubject {
  id: number
  catId: number
  subName: string
}

export interface LabItem {
  id: number
  itemName: string
  specimen: string
  refRange: string
  clinicalText: string
}

export type LabCategoryList = LabCategory[]
export type LabSubjectList = LabSubject[]
export type LabItemList = LabItem[]

/**
 * 获取检验组分类列表
 */
export const getCategoryList = () =>
  get<LabCategoryList>('/api/v1/labcategory/getcategorylist')

/**
 * 获取检验组下的子类项目
 */
export const getLabSubject = (id: number) =>
  get<LabSubjectList>('/api/v1/labcategory/getLabSubject', { id } as unknown as Record<string, unknown>)

/**
 * 获取子类下的检验项目详情
 */
export const getLabItems = (id: number) =>
  get<LabItemList>('/api/v1/labcategory/getLabitem', { id } as unknown as Record<string, unknown>)
