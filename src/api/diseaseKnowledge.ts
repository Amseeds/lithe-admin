import { get } from '@/utils/request'

export interface DiseaseDepartment {
  id: number
  departmentName: string
  departmentCode: string | null
  sortOrder: number
  createTime: string
  updateTime: string
}

export interface DiseaseItem {
  id: number
  departmentId: number
  diseaseName: string
  diseaseAbbr: string
  aliasName: string
  icd10Code: string
  diseaseOverview: string
  epidemiology: string
  etiology: string
  pathogenesis: string
  clinicalManifestation: string
  complications: string
  auxiliaryExamination: string
  auxiliaryInspection: string
  diagnosticCriteria: string
  differentialDiagnosis: string
  treatmentPlan: string
  prevention: string
  prognosis: string
  sortOrder: number
  createTime: string
  updateTime: string
}

export interface DiseaseListData {
  list: DiseaseItem[]
  total: number
  pageNum: number
  pageSize: number
  pages: number
}

export const getDiseaseDepartments = () =>
  get<DiseaseDepartment[]>('/api/knowledge/disease/departments')

export const getDiseaseList = (params: {
  departmentId?: number | null
  diseaseName?: string
  pageNum: number
  pageSize: number
}) =>
  get<DiseaseListData>(
    '/api/knowledge/disease/page',
    params as unknown as Record<string, unknown>,
  )
