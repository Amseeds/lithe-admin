// ============================================================
// 个性化用药方案模块 - 类型定义
// ============================================================

// 患者分层（与全系统一致）
export type PatientCategory =
  | '年轻低危'
  | '老年衰弱'
  | '肾功能不全'
  | '妊娠期'
  | '手术期'
  | '心血管高危'

// 方案状态
export type PlanStatus = '未制定' | '生效中' | '已过期' | '已归档'

// 规范评级
export type ComplianceGrade = '规范' | '基本规范' | '不规范'

// 用药方案主列表
export interface MedicationPlan {
  方案编号: string
  患者姓名: string
  病历号: string
  性别: '男' | '女'
  年龄: number
  所属分层: PatientCategory
  方案周期: string
  制定医生: string
  方案状态: PlanStatus
  规范评级: ComplianceGrade
  制定日期: string
  到期日期: string
}

// 用药明细
export interface MedicationDetail {
  药物名称: string
  药物类别: string
  规格: string
  用法用量: string
  给药频次: string
  备注: string
}

// 方案详情（弹窗展示 - 7个板块）
export interface PlanDetail {
  // 一、患者基本信息
  basicInfo: {
    患者姓名: string
    性别: '男' | '女'
    年龄: number
    病历号: string
    所属分层: PatientCategory
    糖尿病类型: string
    病程: string
    方案编号: string
    方案状态: PlanStatus
    方案周期: string
    制定医生: string
    制定日期: string
  }
  // 二、控糖目标展示（仅展示，不做制定）
  glucoseTarget: {
    HbA1c目标: string
    空腹血糖目标: string
    餐后2h血糖目标: string
    血压目标: string
    LDLC目标: string
  }
  // 三、当前用药方案
  currentMedication: {
    用药方案概述: string
    用药明细: MedicationDetail[]
    用药时长: string
    依从性评估: string
  }
  // 四、方案规范评级依据
  complianceAssessment: {
    规范评级: ComplianceGrade
    评级依据: string[]
    指南推荐方案: string
    与指南差异: string
  }
  // 五、用药安全提示
  safetyAlerts: {
    肝功能状态: string
    肾功能状态: string
    低血糖风险评估: string
    药物相互作用提示: string
    禁忌症排查: string
    不良反应记录: string
  }
  // 六、方案调整记录
  adjustmentHistory: Array<{
    调整日期: string
    调整原因: string
    调整内容: string
    调整医生: string
  }>
  // 七、随访计划
  followUpPlan: {
    下次随访日期: string
    随访频次: string
    随访监测指标: string[]
    备注: string
  }
}

// 统计卡片
export interface StatCard {
  title: string
  value: number | string
  change: string
  changeType: 'increase' | 'decrease' | 'neutral'
}

// 图表数据 - 柱状图（不同分层方案覆盖）
export interface BarChartData {
  分层: string
  患者总数: number
  已覆盖: number
}

// 图表数据 - 饼图（降糖药物使用类型分布）
export interface PieChartData {
  name: string
  value: number
}

// 未制定用药方案患者
export interface UnplannedPatient {
  患者姓名: string
  病历号: string
  年龄: number
  性别: string
  所属分层: PatientCategory
  糖尿病类型: string
  最近HbA1c: string
}

// 高风险/不规范方案患者
export interface RiskPatient {
  患者姓名: string
  病历号: string
  所属分层: PatientCategory
  方案编号: string
  风险类型: string
  风险等级: '高' | '中' | '低'
  当前方案: string
  处理状态: string
}

// 用药执行统计卡片（Tab4）
export interface ExecutionStatCard {
  title: string
  value: number
  subtitle: string
  change: string
  changeType: 'increase' | 'decrease' | 'neutral'
}

// 用药执行与随访明细（Tab4）
export interface ExecutionRecord {
  id: number
  方案编号: string
  患者姓名: string
  病历号: string
  所属分层: PatientCategory
  方案状态: PlanStatus
  用药依从性: string
  依从性评分: number
  最近一次服药: string
  漏服次数: number
  最近随访日期: string
  随访医生: string
  不良反应: string
  操作状态: string
}

// 随访记录弹窗数据（Tab4）
export interface FollowUpRecord {
  id: number
  随访日期: string
  随访类型: string
  随访医生: string
  患者姓名: string
  病历号: string
  空腹血糖: string
  餐后2h血糖: string
  HbA1c: string
  用药依从性: string
  方案执行情况: string
  不良反应: string
  调整建议: string
  下次随访计划: string
}

// 标准化用药模板（Tab3 - 7个分层对应7个模板）
export interface MedicationTemplate {
  分层名称: string
  适用人群: string
  推荐用药方案: string
  一线药物选择: string[]
  二线药物选择: string[]
  联合用药原则: string
  禁用药物: string[]
  特殊注意事项: string[]
  随访监测要求: string
  控糖目标参考: string
}
