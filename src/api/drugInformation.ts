import { get } from '@/utils/request'

// 药品信息
export interface DrugInformation {
  drugId: string
  drugCode: string
  drugName: string
  drugCategory?: string
  drugIngredients?: string
  indication?: string
  packageInsert?: string
  adr?: string
  contraindication?: string
  warningsAndPrecautions?: string
  useInPregnancyAndLactation?: string
  pediatricUse?: string
  geriatricUse?: string
  drugInteractions?: string
  updateTime?: string
}

// 查询参数
export interface DrugQueryParams {
  drugName?: string
  pageNum: number
  pageSize: number
}

// 分页响应
export interface DrugPageResponse {
  list: DrugInformation[]
  total: number
}

// 获取药品列表
export function getDrugList(params: DrugQueryParams) {
  return get<DrugPageResponse>('/api/v1/drugs/selectdrug', params as unknown as Record<string, unknown>)
}
