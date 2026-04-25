import { get, post } from '@/utils/request'

/**
 * 获取疗效报告列表
 */
// export const getReportList = (params) => get('/api/diabetes/report/page', params)

// 获取控糖目标仪表盘数据
export const getDashboardData = (params) => post(`/api/diabetes/dashboard`, params)

// 查询
// export const getEfficacyReport = (reportId) => get(`/api/diabetes/report/detail/${reportId}`)

/**
 * 获取随访计划详情
 */
export const getPlanDetail = (params) => post(`/api/diabetes/getdetail`, params)

// /**
//  * 执行随访
//  */
// export const executePlan = (data: ExecutePlanForm) =>
//   post<null>('/api/followup-execution/execute', data as unknown as Record<string, unknown>)
