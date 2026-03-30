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
  达标人数: number
  达标率: string
  达标率涨跌: string
  异常人数: number
  异常率: string
  异常率涨跌: string
  正常范围: [number, number]
  目标值: number
}

// 异常患者明细
export interface AbnormalPatient {
  患者姓名: string
  病历号: string
  年龄: number
  所属分层: PatientCategory
  最近检测值: string
  个人目标值: string
  异常等级: RiskLevel
  上次检测值: string
  变化幅度: string
  检测时间: string
}

// 用药不良反应记录
export interface DrugAdverseReaction {
  id: number
  患者姓名: string
  病历号: string
  所用药物: string
  不良反应类型: string
  发生时间: string
  处理措施: string
  转归情况: string
}

// 用药高风险患者
export interface HighRiskPatient {
  id: number
  患者姓名: string
  病历号: string
  联用药物: string
  风险类型: string
  风险等级: RiskLevel
  处理状态: HandleStatus
}

// 随访记录
export interface FollowUpRecord {
  随访日期: string
  随访医生: string
  疗效评估结论: string
  治疗调整建议: string
}

// 历史疗效报告
export interface EfficacyReport {
  报告日期: string
  报告类型: string
  核心结论: string
}

// 患者详情数据
export interface PatientDetail {
  basicInfo: {
    姓名: string
    性别: '男' | '女'
    年龄: number
    病历号: string
    糖尿病类型: string
    病程: string
    所属分层: PatientCategory
    最近HbA1c结果: string
    综合疗效评级: EfficacyLevel
    整体达标情况: OverallStatus
  }
  indicators: Array<{
    指标名称: string
    个人目标值: string
    最近检测值: string
    上次检测值: string
    变化幅度: string
    是否达标: '是' | '否'
    异常等级: RiskLevel
  }>
  currentMedication: {
    用药方案: string
    用药时长: string
    用药依从性: string
    历史不良反应: string
    用药风险提示: string
  }
  followUpRecords: FollowUpRecord[]
  efficacyReports: EfficacyReport[]
}
