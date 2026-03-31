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
  患者姓名: string
  病历号: string
  年龄: number
  所属分层: PatientCategory
  并发症类型: string
  进展情况: string
  发现日期: string
}

// 胰岛功能明细患者
export interface PancreaticFunctionPatient {
  id: number
  患者姓名: string
  病历号: string
  年龄: number
  所属分层: PatientCategory
  胰岛功能分级: PancreaticFunctionLevel
  基线C肽: string
  最近C肽: string
  下降幅度: string
  检测日期: string
}

// 并发症分期分布
export interface ComplicationStageDistribution {
  并发症名称: string
  早期: number
  中期: number
  晚期: number
}

// 并发症进展患者明细（Tab3）
export interface ComplicationDetailPatient {
  id: number
  患者姓名: string
  病历号: string
  年龄: number
  所属分层: PatientCategory
  并发症名称: string
  当前分期: ComplicationStage
  较上次变化: string
  最近检查日期: string
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
  检查项目: string
  检查日期: string
  本次结果: string
  上次结果: string
  变化趋势: string
  异常等级: ProgressRiskLevel
}

// 随访进展评估记录
export interface ProgressFollowUpRecord {
  随访日期: string
  随访医生: string
  进展评估结论: string
  治疗调整建议: string
}

// 患者进展详情（弹窗数据）
export interface PatientProgressDetail {
  basicInfo: {
    姓名: string
    性别: '男' | '女'
    年龄: number
    病历号: string
    糖尿病类型: string
    病程: string
    所属分层: PatientCategory
    并发症类型: ComplicationType
    胰岛功能: PancreaticFunctionLevel
    最近C肽: string
    最近检查日期: string
  }
  complicationTimeline: ComplicationTimelineEvent[]
  cPeptideTrend: { months: string[]; values: string[]; baseline: number }
  examinationResults: ExaminationResult[]
  followUpRecords: ProgressFollowUpRecord[]
}
