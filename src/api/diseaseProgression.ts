import { get, post } from '@/utils/request'

/**
 * 获取疗效报告列表
 */
export const getReportList = (params) => get('/api/diabetes/report/page', params)

// 根据住院号生成疗效报告
export const getDiseaseProgressionOverview = (params) =>
  post(`/api/v1/PatientProgressDetail/getfenlei`, params)

// 查询
export const getEfficacyReport = (reportId) => get(`/api/diabetes/report/detail/${reportId}`)

/**
 * 获取随访计划详情
 */
export const getDiseaseProgressionDetail = (params) =>
  post(`/api/v1/PatientProgressDetail/getComplicationClassification`, params)

// /**
//  * 执行随访
//  */
// export const executePlan = (data: ExecutePlanForm) =>
//   post<null>('/api/followup-execution/execute', data as unknown as Record<string, unknown>)
