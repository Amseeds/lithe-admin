// 患者分层（与控糖目标模块一致）
export type PatientCategory =
  | '年轻低危'
  | '老年衰弱'
  | '肾功能不全'
  | '妊娠期'
  | '手术期'
  | '心血管高危'

// 疗效评级
export type EfficacyLevel =
  | '优秀达标'
  | '稳定达标'
  | '部分达标'
  | '未达标'
  | '高风险异常'

// 整体达标情况
export type OverallStatus = '达标' | '未达标' | '部分达标'

// 风险等级
export type RiskLevel = '高风险' | '中风险' | '低风险'

// 处理状态
export type HandleStatus = '待处理' | '处理中' | '已处理'

// 患者基础信息
export interface Patient {
  id: number
  name: string
  medicalRecordNo: string
  age: number
  gender: '男' | '女'
  category: PatientCategory
  categoryName: string
  diabetesType: string
  diseaseDuration: string
  latestHba1c: string
  efficacyLevel: EfficacyLevel
  overallStatus: OverallStatus
  lastFollowUpDate: string
  mainDoctor: string
}

// 代谢指标数据
export interface MetabolicIndex {
  name: string
  unit: string
  standardCount: number
  standardRate: string
  standardRateChange: string
  abnormalCount: number
  abnormalRate: string
  abnormalRateChange: string
  normalRange: [number, number]
  target: number
}

// 异常患者明细
export interface AbnormalPatient {
  name: string
  medicalRecordNo: string
  age: number
  category: PatientCategory
  latestValue: string
  personalTarget: string
  abnormalLevel: RiskLevel
  previousValue: string
  changeRate: string
  testDate: string
}

// 用药不良反应记录
export interface DrugAdverseReaction {
  id: number
  name: string
  medicalRecordNo: string
  drugUsed: string
  adverseReactionType: string
  occurrenceTime: string
  treatment: string
  outcome: string
}

// 用药高风险患者
export interface HighRiskPatient {
  id: number
  name: string
  medicalRecordNo: string
  combinedDrugs: string
  riskType: string
  riskLevel: RiskLevel
  handleStatus: HandleStatus
}

// 随访记录
export interface FollowUpRecord {
  followUpDate: string
  followUpDoctor: string
  efficacyConclusion: string
  treatmentAdvice: string
}

// 历史疗效报告
export interface EfficacyReport {
  reportDate: string
  reportType: string
  coreConclusion: string
}

// 患者详情数据
export interface PatientDetail {
  basicInfo: {
    name: string
    gender: '男' | '女'
    age: number
    medicalRecordNo: string
    diabetesType: string
    diseaseDuration: string
    category: PatientCategory
    latestHbA1c: string
    comprehensiveEfficacyLevel: EfficacyLevel
    overallStandardStatus: OverallStatus
  }
  indicators: Array<{
    indicatorName: string
    personalTarget: string
    latestValue: string
    previousValue: string
    changeRate: string
    isStandard: '是' | '否'
    abnormalLevel: RiskLevel
  }>
  currentMedication: {
    medicationPlan: string
    medicationDuration: string
    medicationCompliance: string
    historicalAdverseReactions: string
    medicationRiskWarning: string
  }
  followUpRecords: FollowUpRecord[]
  efficacyReports: EfficacyReport[]
}
