import { get } from '@/utils/request'

// 查询参数
export interface AdverseReactionQueryParams {
  pageNum?: number
  pageSize?: number
  Type?: string // 1: 药物不良反应信息通报, 2: 药物警戒快讯
  description?: string
  [property: string]: any
}

// 不良反应资料
export interface AdverseReactionMaterial {
  id: number
  fileName: string
  filePath: string
  fileSize: number
  viewCount: number
  downloadCount: number
  description: string
  isActive: number
  createTime: string
  updateTime: string
  type: string // 1: 药物不良反应信息通报, 2: 药物警戒快讯
}

// 分页响应
export interface AdverseReactionPageResponse {
  pageNum: number
  pageSize: number
  pages: number
  total: number
  list: AdverseReactionMaterial[]
}

// 获取列表
export function getAdverseReactionList(params: AdverseReactionQueryParams) {
  return get<AdverseReactionPageResponse>('/api/adverse-reaction/list', params as unknown as Record<string, unknown>)
}
