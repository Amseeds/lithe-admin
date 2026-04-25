import { get, post } from '@/utils/request'

/**
 * 获取生活方式指导仪表盘数据
 * @param params
 * @returns
 */
export const getDashboardData = () => get(`/api/v1/patientwarn/stat`)

/**
 * 更新预警状态
 * @param params
 * @returns
 */
export const updateWarningStatus = (params) => get(`/api/v1/patientwarn/updatestatus`, params)

/**
 * 获取未制定方案列表患者列表
 * @param params
 * @returns
 */
export const getWarningLing = (params) => get('/api/v1/patientwarn/getall', params)

/**
 * 新增生活方式指导
 * @param params
 * @returns
 */
export const createLifestyleGuidance = (params) => post(`/api/guidance/add`, params)

/**
 * 删除生活方式指导
 * @param params
 * @returns
 */
export const deletePlan = (params) => get(`/api/v1/patientwarn/updatestatus`, params)

/**
 * 修改生活方式指导
 * @param params
 * @returns
 */
export const editPlan = (params) => post(`/api/guidance/update`, params)

/**
 * 获取生活方式指导列表
 * @param params
 * @returns
 */
export const getGuidancePlan = (params) => get('/api/guidance/list', params)

/**
 * 获取生活方式指导详情
 * @param params
 * @returns
 */
export const getLifestyleGuidanceDetail = (id) => get(`/api/guidance/get/${id}`)
