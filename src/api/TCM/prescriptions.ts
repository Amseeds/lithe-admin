import { get, post, del } from '@/utils/request'

// 中医方剂
export interface TcmPrescription {
  id: number
  prescriptionName: string
  storedPath: string
  categoryId: number
  fileSize: number
  uploadTime: string
}

// 查询参数
export interface PrescriptionQueryParams {
  prescriptionName?: string
  categoryId?: string | null
  pageNum: number
  pageSize: number
}

// 分页响应
export interface PrescriptionPageResponse {
  list: TcmPrescription[]
  total: number
}

// 获取标准文件列表
export function getList(params: PrescriptionQueryParams) {
  return get<PrescriptionPageResponse>(
    '/api/tcm-prescription/list',
    params as unknown as Record<string, unknown>,
  )
}
