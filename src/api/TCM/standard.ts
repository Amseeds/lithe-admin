import { get, post, del } from '@/utils/request'

// 中医药标准
export interface TcmStandard {
  id: number
  originalName: string
  storedPath: string
  categoryId: number
  fileSize: number
  uploadTime: string
}

// 查询参数
export interface StandardQueryParams {
  keyword?: string
  categoryId?: string | null
  pageNum: number
  pageSize: number
}

// 分页响应
export interface Response {
  list: TcmStandard[]
  total: number
}

// 获取标准文件列表
export function getList(params: StandardQueryParams) {
  return get<Response>('/api/standards/list', params as unknown as Record<string, unknown>)
}
