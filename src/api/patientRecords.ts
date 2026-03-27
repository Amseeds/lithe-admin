import { get } from '@/utils/request'

export interface PatientRecord {
  zyh: string // 住院号
  name: string // 姓名
  sex: string // 性别
  age: number // 年龄
  admissionDate: string // 入院时间
  nation?: string // 民族
  marriage?: string // 婚姻状况
  informant?: string // 报告人
  job?: string // 职业
  workUnit?: string // 工作单位
  reliability?: string // 可靠性
  address?: string // 地址
  lasDtoList?: LasDto[] // 病历内容列表
}

export interface LasDto {
  caseContent: string // 病历内容标题
  medicalCaseContent: string // 病历内容
}

export interface PatientListResponse {
  list: PatientRecord[]
  total: number
}

export interface PatientQueryParams {
  zyh?: string // 住院号
  name?: string // 姓名
  pageNum: number
  pageSize: number
}

/**
 * 获取患者列表
 */
export const getPatientList = (params: PatientQueryParams) =>
  get<PatientListResponse>('/api/v1/las/getLas', params as unknown as Record<string, unknown>)

/**
 * 获取患者详情
 */
export const getPatientDetail = (params: { zyh: string }) =>
  get<PatientRecord>('/api/v1/las/getLasById', params as unknown as Record<string, unknown>)
