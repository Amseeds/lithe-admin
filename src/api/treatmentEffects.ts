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
 * 获取单个患者治疗效果评估详情
 */
export const getTreatmentEffectsDetail = (params) =>
  post(`/api/v1/treatment-effect/evaluate`, params)
/**
 * 获取单个患者治疗效果-核心指标达标对比总表
 */
export const getIndicatorComparisonData = (params) =>
  post(`/api/v1/treatment-effect/indicator-comparison`, params)

// /**
//  * 执行随访
//  */
// export const executePlan = (data: ExecutePlanForm) =>
//   post<null>('/api/followup-execution/execute', data as unknown as Record<string, unknown>)
