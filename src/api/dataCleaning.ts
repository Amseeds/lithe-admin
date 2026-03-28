import { get } from '@/utils/request'

export interface DataCleaningParams {
  startTime: string
  endTime: string
}

export interface TaskStatusResponse {
  taskId: string
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED'
  downloadUrl?: string
}

/**
 * 开始数据清洗
 */
export function cleanData(params: DataCleaningParams) {
  return get<TaskStatusResponse>('/api/v1/clean/processDataInBatchesByDays', params)
}

/**
 * 获取任务状态
 */
export function getTaskStatus(taskId: string) {
  return get<TaskStatusResponse>(`/api/v1/clean/status/${taskId}`)
}
