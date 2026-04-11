// 患者分层（与控糖目标、治疗效果模块一致）
export type PatientCategory =
  | '年轻低危'
  | '老年衰弱'
  | '肾功能不全'
  | '妊娠期'
  | '手术期'
  | '心血管高危'

// 并发症类型
export type ComplicationType =
  | '无并发症'
  | '微血管并发症'
  | '大血管并发症'
  | '多并发症合并'

// 胰岛功能分级
export type PancreaticFunctionLevel = '正常' | '轻度减退' | '中度减退' | '重度减退'

// 并发症分期
export type ComplicationStage = '无' | '早期' | '中期' | '晚期'

// 进展风险等级
export type ProgressRiskLevel = '高进展风险' | '中进展风险' | '低进展风险'

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
  complicationType: ComplicationType
  pancreaticFunction: PancreaticFunctionLevel
  cPeptideLevel: string
  isHighRisk: boolean
  lastCheckDate: string
  mainDoctor: string
}

// 并发症统计卡片
export interface ComplicationStatCard {
  name: string
  definition: string
  count: number
  percentage: string
  change: string
}

// 胰岛功能统计卡片
export interface PancreaticStatCard {
  name: string
  count: number
  percentage: string
  change: string
}

// 并发症进展患者（TOP20/高进展风险）
export interface ComplicationProgressPatient {
  id: number
  name: string
  medicalRecordNo: string
  age: number
  category: PatientCategory
  complicationType: string
  progressStatus: string
  discoveryDate: string
}

// 胰岛功能明细患者
export interface PancreaticFunctionPatient {
  id: number
  name: string
  medicalRecordNo: string
  age: number
  category: PatientCategory
  pancreaticLevel: PancreaticFunctionLevel
  baselineCPeptide: string
  latestCPeptide: string
  declineRate: string
  testDate: string
}

// 并发症分期分布
export interface ComplicationStageDistribution {
  complicationName: string
  early: number
  mid: number
  late: number
}

// 并发症进展患者明细（Tab3）
export interface ComplicationDetailPatient {
  id: number
  name: string
  medicalRecordNo: string
  age: number
  category: PatientCategory
  complicationName: string
  currentStage: ComplicationStage
  changeFromLast: string
  lastCheckDate: string
}

// Tab3二级Tab统计卡片
export interface ComplicationSubCard {
  title: string
  value: string
  unit: string
  rate: string
  change: string
  subTitle: string
}

// 并发症时间轴事件
export interface ComplicationTimelineEvent {
  date: string
  title: string
  content: string
  type: 'new' | 'progress' | 'stable'
}

// C肽检测记录
export interface CPeptideRecord {
  date: string
  value: string
}

// 并发症检查对比记录
export interface ExaminationResult {
  examItem: string
  examDate: string
  currentResult: string
  previousResult: string
  changeTrend: string
  abnormityLevel: ProgressRiskLevel
}

// 随访进展评估记录
export interface ProgressFollowUpRecord {
  followUpDate: string
  followUpDoctor: string
  progressConclusion: string
  treatmentAdvice: string
}

// 患者进展详情（弹窗数据）
export interface PatientProgressDetail {
  basicInfo: {
    name: string
    gender: '男' | '女'
    age: number
    medicalRecordNo: string
    diabetesType: string
    diseaseDuration: string
    category: PatientCategory
    complicationType: ComplicationType
    pancreaticFunction: PancreaticFunctionLevel
    latestCPeptide: string
    lastCheckDate: string
  }
  complicationTimeline: ComplicationTimelineEvent[]
  cPeptideTrend: { months: string[]; values: string[]; baseline: number }
  examinationResults: ExaminationResult[]
  followUpRecords: ProgressFollowUpRecord[]
}
