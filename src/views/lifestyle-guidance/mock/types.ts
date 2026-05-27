// 方案状态
export type PlanStatus = 'not_created' | 'created' | 'archived' | 'expired'

// 患者分层
export type PatientStratification = '年轻低危' | '老年衰弱' | '肾功能不全' | '妊娠期' | '手术期' | '心血管高危'

// 执行率档位
export type ExecutionLevel = '高' | '中' | '低'

// 方案主列表
export interface LifestylePlan {
  id: string
  planNo: string // 方案编号
  patientName: string
  medicalRecordNo: string // 病历号
  stratification: PatientStratification // 所属分层
  planPeriodStart: string // 方案周期开始
  planPeriodEnd: string // 方案周期结束
  createDoctor: string // 制定医生
  planStatus: PlanStatus
  executionRate: number // 执行率百分比
}

// 方案详情 - 饮食方案
export interface DietPlan {
  dailyCalorie: string // 每日总热量
  carbohydrate: string // 碳水化合物占比
  protein: string // 蛋白质占比
  fat: string // 脂肪占比
  mealDistribution: string // 三餐分配比
  dietNotes: string // 饮食注意事项
}

// 方案详情 - 运动方案
export interface ExercisePlan {
  exerciseType: string // 运动类型
  frequency: string // 运动频率
  duration: string // 每次时长
  intensity: string // 运动强度
  exerciseNotes: string // 注意事项
}

// 方案详情 - 体重管理
export interface WeightManagement {
  currentWeight: string // 当前体重
  targetWeight: string // 目标体重
  bmi: string // BMI
  weightGoal: string // 体重目标
}

// 方案详情 - 作息管理
export interface SleepManagement {
  sleepTime: string // 建议入睡时间
  wakeTime: string // 建议起床时间
  sleepDuration: string // 建议睡眠时长
  sleepNotes: string // 睡眠注意事项
}

// 方案详情 - 戒烟限酒
export interface HabitManagement {
  smokingStatus: string // 吸烟状态
  drinkingStatus: string // 饮酒状态
  habitAdvice: string // 建议
}

// 方案完整详情
export interface PlanDetail {
  planNo: string
  patientName: string
  medicalRecordNo: string
  gender: string
  age: number
  stratification: PatientStratification
  planPeriodStart: string
  planPeriodEnd: string
  createDoctor: string
  createTime: string
  dietPlan: DietPlan
  exercisePlan: ExercisePlan
  weightManagement: WeightManagement
  sleepManagement: SleepManagement
  habitManagement: HabitManagement
  personalizedAdvice: string // 个性化建议
}

// 统计卡片
export interface StatCard {
  title: string
  value: number | string
  change: string
  changeType: 'increase' | 'decrease' | 'neutral'
}

// 筛选条件
export interface PlanFilters {
  stratification: string[]
  planStatus: string
  timeRange: string
  searchKeyword: string
}

// 未制定方案患者
export interface UnplannedPatient {
  patientName: string
  medicalRecordNo: string
  stratification: PatientStratification
  age: number
  gender: string
}

// 低执行率患者
export interface LowExecutionPatient {
  rank: number
  patientName: string
  medicalRecordNo: string
  executionRate: number
  planNo: string
  mainProblem: string
}

// 执行跟踪明细
export interface ExecutionRecord {
  id: string
  planNo: string
  patientName: string
  medicalRecordNo: string
  checkDate: string
  executionRate: number
  dietScore: number
  exerciseScore: number
  weightStatus: string
  sleepStatus: string
  selfManagementScore: number
  overallRating: string
}

// 随访记录
export interface FollowUpRecord {
  id: string
  patientName: string
  medicalRecordNo: string
  followUpDate: string
  followUpType: string
  followUpDoctor: string
  weight: string
  fastingGlucose: string
  hba1c: string
  dietCompliance: string
  exerciseCompliance: string
  currentIssues: string
  nextPlan: string
}

// 指导库内容项
export interface GuidanceItem {
  title: string
  content: string[]
}

// 柱状图数据
export interface BarChartData {
  category: string
  total: number
  planned: number
}

// 饼图数据
export interface PieChartData {
  name: string
  value: number
}
