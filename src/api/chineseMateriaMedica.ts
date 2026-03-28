import { get } from '@/utils/request'

// 中药材信息
export interface ChineseMateriaMedica {
  id: string
  name: string
  aliasNames?: string
  natureFlavor?: string
  meridianTropism?: string
  functionsIndications?: string
  usageDosage?: string
  precautions?: string
  overdoseInfo?: string
  description?: string
  incompatibleHerbs?: string
  sourceFile?: string
  createdAt?: string
}

// 查询参数
export interface ChineseMateriaMedicaQueryParams {
  drugName?: string
  pageNum: number
  pageSize: number
}

// 分页响应
export interface ChineseMateriaMedicaPageResponse {
  list: ChineseMateriaMedica[]
  total: number
}

// 获取中药材列表
export function getChineseMateriaMedicaList(params: ChineseMateriaMedicaQueryParams) {
  return get<ChineseMateriaMedicaPageResponse>('/api/v1/tcmmedicine/gettcmmedicine', params as unknown as Record<string, unknown>)
}
