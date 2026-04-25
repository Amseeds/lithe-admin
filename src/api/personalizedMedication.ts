import { get, post } from '@/utils/request'

/**
 * 获取个性化用药方案仪表盘数据
 * @param params
 * @returns
 */
export const getDashboardData = () => get(`/api/guidance/stat`)

/**
 * 新增个性化用药方案
 * @param params
 * @returns
 */
export const createLifestyleGuidance = (params) => post(`/api/medication/add`, params)

/**
 * 删除个性化用药方案
 * @param params
 * @returns
 */
export const deletePlan = (id) => get(`/api/medication/delete/${id}`)

/**
 * 修改个性化用药方案
 * @param params
 * @returns
 */
export const editPlan = (params) => post(`/api/medication/update`, params)

/**
 * 获取个性化用药方案列表
 * @param params
 * @returns
 */
export const getPlanList = (params) => get('/api/medication/list', params)

/**
 * 获取个性化用药方案详情
 * @param params
 * @returns
 */
export const getPlanDetail = (id) => get(`/api/medication/get/${id}`)

/**
 * 获取未制定方案列表患者列表
 * @param params
 * @returns
 */
export const getUnplannedPatients = () => get('/api/medication/PatientSwithoutAPlan')
