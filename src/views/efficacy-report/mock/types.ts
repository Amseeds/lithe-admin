// 报告状态枚举
export type ReportStatus = 'draft' | '已归档' | '未归档'

// 报告类型枚举
export type ReportType = 'monthly' | 'quarterly' | 'annual' | 'followup'

// 疗效评级枚举
export type EfficacyRating = 'excellent' | 'stable' | 'partial' | 'failed'

// 归档状态枚举
export type ArchiveStatus = 'archived' | 'not_archived'

// 报告基础信息
export interface Report {
  id: string
  reportNo: string // 报告编号
  patientName: string
  patientGender: string
  patientAge: number
  medicalRecordNo: string // 病历号
  diabetesType: string // 糖尿病类型
  diagnosisDate: string // 确诊时间
  diseaseDuration: number // 病程(年)
  stratification: string // 所属分层
  reportType: ReportType
  reportPeriodStart: string // 报告周期开始
  reportPeriodEnd: string // 报告周期结束
  generateDoctor: string // 生成医生
  generateTime: string // 生成时间
  department: string // 所属科室
  reportStatus: ReportStatus
  efficacyRating: EfficacyRating
  archiveStatus: ArchiveStatus
}

// 控糖目标基准
export interface GlucoseControlTarget {
  hba1c: string // 糖化血红蛋白目标
  fastingGlucose: string // 空腹血糖目标
  postprandialGlucose: string // 餐后2h血糖目标
  bloodPressure: string // 血压目标
  ldlCholesterol: string // 低密度脂蛋白胆固醇目标
}

// 核心指标数据
export interface CoreIndicator {
  hba1cAvg: string // 糖化血红蛋白平均值
  hba1cRate: string // 糖化血红蛋白达标率
  fastingGlucoseAvg: string // 空腹血糖平均值
  fastingGlucoseRate: string // 空腹血糖达标率
  postprandialGlucoseAvg: string // 餐后2h血糖平均值
  postprandialGlucoseRate: string // 餐后2h血糖达标率
  bloodPressureStatus: string // 血压达标情况
  lipidStatus: string // 血脂达标情况
}

// 用药安全性
export interface MedicationSafety {
  compliance: string // 用药依从性
  adverseReactions: number // 药物不良反应次数
  liverKidneyAbnormal: string // 肝肾功能异常
  drugInteractionRisk: string // 药物联用风险
}

// 胰岛功能变化
export interface IsletFunction {
  fastingCPeptide: string // 空腹C肽平均值
  changeTrend: string // 较上周期变化
  functionStatus: string // 胰岛功能状态
}

// 并发症情况
export interface Complications {
  newComplications: string // 新发并发症
  existingComplications: string // 原有并发症
  existingStatus: string // 原有并发症状态
  currentStage: string // 当前分期
}

// 治疗方案调整建议
export interface TreatmentSuggestions {
  glucoseControl: string // 控糖方案调整建议
  lifestyle: string // 生活方式干预建议
  followup: string // 随访复查建议
}

// 归档信息
export interface ArchiveInfo {
  electronicSignature: string // 医生电子签名
  archiveStatus: string // 归档状态
  version: string // 报告版本号
  remark: string // 备注
}

// 报告完整详情
export interface ReportDetail {
  // 报告头部
  reportTitle: string
  reportNo: string
  patientName: string
  patientGender: string
  patientAge: number
  medicalRecordNo: string
  diabetesType: string
  diagnosisDate: string
  diseaseDuration: number
  stratification: string
  reportPeriodStart: string
  reportPeriodEnd: string
  generateDoctor: string
  generateTime: string
  department: string

  // 一、核心控糖目标基准
  glucoseControlTarget: GlucoseControlTarget

  // 二、本周期治疗效果评估
  coreIndicator: CoreIndicator
  medicationSafety: MedicationSafety
  efficacyRating: EfficacyRating

  // 三、本周期疾病进展情况
  isletFunction: IsletFunction
  complications: Complications
  diseaseProgression: string

  // 四、治疗方案调整建议
  treatmentSuggestions: TreatmentSuggestions

  // 五、归档信息
  archiveInfo: ArchiveInfo
}

// 统计卡片数据
export interface StatCard {
  title: string
  value: number
  change: string
  changeType: 'increase' | 'decrease' | 'neutral'
}

// 筛选表单数据
export interface ReportFilters {
  dateRange: string // 近1个月/近3个月/近6个月/近1年
  reportType: string // 报告类型
  reportStatus: string // 报告状态
  searchKeyword: string // 患者姓名/病历号搜索
}

// Mock患者基础数据
export interface MockPatient {
  name: string
  gender: string
  age: number
  medicalRecordNo: string
  diabetesType: string
  diagnosisDate: string
  diseaseDuration: number
  stratification: string
}
