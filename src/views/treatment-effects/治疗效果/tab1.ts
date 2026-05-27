import type { EfficacyLevel, RiskLevel, PatientCategory } from './types'

// 疗效分级统计卡片数据
export const efficacyCards = [
  {
    level: '优秀达标' as EfficacyLevel,
    count: 40,
    proportion: '20.0%',
    change: '+2.5%',
    standard: '所有核心指标均达到严格控糖标准，近3个月无异常波动',
  },
  {
    level: '稳定达标' as EfficacyLevel,
    count: 60,
    proportion: '30.0%',
    change: '+1.5%',
    standard: '核心指标均达到个人控糖目标，近3个月无严重异常',
  },
  {
    level: '部分达标' as EfficacyLevel,
    count: 50,
    proportion: '25.0%',
    change: '-0.5%',
    standard: '糖化血红蛋白达标，其他部分指标未达标',
  },
  {
    level: '未达标' as EfficacyLevel,
    count: 35,
    proportion: '17.5%',
    change: '-1.2%',
    standard: '糖化血红蛋白未达到个人控糖目标',
  },
  {
    level: '高风险异常' as EfficacyLevel,
    count: 15,
    proportion: '7.5%',
    change: '-0.3%',
    standard: '严重低血糖/高血糖、肝肾功能新发异常、严重药物不良反应',
  },
]

// 疗效影响因素柱状图数据
export const efficacyFactorsChart = {
  xAxis: ['不同患者分层', '用药依从性高低', '有无并发症', '不同用药方案'],
  series: [
    {
      name: '优秀达标+稳定达标',
      data: [58.5, 72.3, 48.2, 65.8],
    },
    {
      name: '部分达标',
      data: [26.3, 18.5, 28.6, 22.4],
    },
    {
      name: '未达标+高风险',
      data: [15.2, 9.2, 23.2, 11.8],
    },
  ],
}

// 近6个月疗效趋势折线图数据
export const efficacyTrendChart = {
  xAxis: ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'],
  series: [
    {
      name: '优秀达标+稳定达标',
      data: [42.5, 45.0, 47.5, 48.5, 49.0, 50.0],
    },
    {
      name: '部分达标',
      data: [28.0, 27.0, 26.5, 26.0, 25.5, 25.0],
    },
    {
      name: '未达标+高风险',
      data: [29.5, 28.0, 26.0, 25.5, 25.5, 25.0],
    },
  ],
}

// 未达标患者TOP20数据
export const unachievedTop20 = [
  { name: '李建国', medicalRecordNo: '20260001', age: 58, category: '心血管高危' as PatientCategory, exceededIndicator: 'HbA1c 9.8%', lastFollowUpDate: '2026-03-15' },
  { name: '王秀英', medicalRecordNo: '20260005', age: 72, category: '老年衰弱' as PatientCategory, exceededIndicator: 'HbA1c 10.2%', lastFollowUpDate: '2026-03-10' },
  { name: '张志强', medicalRecordNo: '20260012', age: 65, category: '肾功能不全' as PatientCategory, exceededIndicator: '空腹血糖 12.5mmol/L', lastFollowUpDate: '2026-03-08' },
  { name: '刘淑芬', medicalRecordNo: '20260018', age: 45, category: '年轻低危' as PatientCategory, exceededIndicator: 'HbA1c 9.5%', lastFollowUpDate: '2026-03-12' },
  { name: '陈德明', medicalRecordNo: '20260023', age: 68, category: '心血管高危' as PatientCategory, exceededIndicator: '餐后血糖 18.6mmol/L', lastFollowUpDate: '2026-03-05' },
  { name: '赵桂兰', medicalRecordNo: '20260028', age: 55, category: '手术期' as PatientCategory, exceededIndicator: 'HbA1c 10.8%', lastFollowUpDate: '2026-03-18' },
  { name: '杨伟东', medicalRecordNo: '20260034', age: 62, category: '肾功能不全' as PatientCategory, exceededIndicator: '空腹血糖 14.2mmol/L', lastFollowUpDate: '2026-03-02' },
  { name: '孙丽娟', medicalRecordNo: '20260041', age: 48, category: '年轻低危' as PatientCategory, exceededIndicator: 'HbA1c 9.2%', lastFollowUpDate: '2026-03-20' },
  { name: '周建国', medicalRecordNo: '20260047', age: 75, category: '老年衰弱' as PatientCategory, exceededIndicator: '血糖波动幅度 5.8mmol/L', lastFollowUpDate: '2026-03-07' },
  { name: '吴秀珍', medicalRecordNo: '20260052', age: 52, category: '心血管高危' as PatientCategory, exceededIndicator: 'HbA1c 10.5%', lastFollowUpDate: '2026-03-14' },
  { name: '郑志强', medicalRecordNo: '20260058', age: 60, category: '手术期' as PatientCategory, exceededIndicator: '餐后血糖 16.8mmol/L', lastFollowUpDate: '2026-03-01' },
  { name: '冯淑英', medicalRecordNo: '20260063', age: 43, category: '年轻低危' as PatientCategory, exceededIndicator: '空腹血糖 11.5mmol/L', lastFollowUpDate: '2026-03-16' },
  { name: '林德伟', medicalRecordNo: '20260069', age: 70, category: '老年衰弱' as PatientCategory, exceededIndicator: 'HbA1c 9.8%', lastFollowUpDate: '2026-03-09' },
  { name: '何桂芳', medicalRecordNo: '20260075', age: 58, category: '肾功能不全' as PatientCategory, exceededIndicator: 'HbA1c 10.1%', lastFollowUpDate: '2026-03-11' },
  { name: '高俊杰', medicalRecordNo: '20260081', age: 50, category: '心血管高危' as PatientCategory, exceededIndicator: '血糖波动幅度 6.2mmol/L', lastFollowUpDate: '2026-03-19' },
  { name: '罗秀兰', medicalRecordNo: '20260087', age: 66, category: '手术期' as PatientCategory, exceededIndicator: '餐后血糖 17.5mmol/L', lastFollowUpDate: '2026-03-04' },
  { name: '徐志强', medicalRecordNo: '20260093', age: 54, category: '年轻低危' as PatientCategory, exceededIndicator: 'HbA1c 9.6%', lastFollowUpDate: '2026-03-17' },
  { name: '沈桂英', medicalRecordNo: '20260099', age: 73, category: '老年衰弱' as PatientCategory, exceededIndicator: '空腹血糖 13.8mmol/L', lastFollowUpDate: '2026-03-06' },
  { name: '韩伟明', medicalRecordNo: '20260105', age: 61, category: '肾功能不全' as PatientCategory, exceededIndicator: 'HbA1c 10.3%', lastFollowUpDate: '2026-03-13' },
  { name: '邓秀芬', medicalRecordNo: '20260111', age: 47, category: '年轻低危' as PatientCategory, exceededIndicator: '餐后血糖 16.2mmol/L', lastFollowUpDate: '2026-03-21' },
]

// 高风险异常患者列表
export const highRiskPatients = [
  { name: '张建华', medicalRecordNo: '20260003', age: 65, category: '心血管高危' as PatientCategory, abnormalType: '严重低血糖', riskLevel: '高风险' as RiskLevel, handleStatus: '处理中' },
  { name: '李秀英', medicalRecordNo: '20260008', age: 78, category: '老年衰弱' as PatientCategory, abnormalType: '肝功能新发异常', riskLevel: '高风险' as RiskLevel, handleStatus: '待处理' },
  { name: '王志强', medicalRecordNo: '20260015', age: 62, category: '肾功能不全' as PatientCategory, abnormalType: '严重高血糖', riskLevel: '高风险' as RiskLevel, handleStatus: '已处理' },
  { name: '刘桂兰', medicalRecordNo: '20260021', age: 55, category: '手术期' as PatientCategory, abnormalType: '药物不良反应', riskLevel: '高风险' as RiskLevel, handleStatus: '处理中' },
  { name: '陈伟东', medicalRecordNo: '20260027', age: 70, category: '老年衰弱' as PatientCategory, abnormalType: '肾功能新发异常', riskLevel: '高风险' as RiskLevel, handleStatus: '待处理' },
  { name: '赵淑珍', medicalRecordNo: '20260033', age: 48, category: '年轻低危' as PatientCategory, abnormalType: '严重低血糖', riskLevel: '高风险' as RiskLevel, handleStatus: '已处理' },
  { name: '杨俊杰', medicalRecordNo: '20260039', age: 58, category: '心血管高危' as PatientCategory, abnormalType: '严重高血糖', riskLevel: '高风险' as RiskLevel, handleStatus: '处理中' },
  { name: '孙秀英', medicalRecordNo: '20260045', age: 75, category: '老年衰弱' as PatientCategory, abnormalType: '药物不良反应', riskLevel: '高风险' as RiskLevel, handleStatus: '待处理' },
  { name: '周志强', medicalRecordNo: '20260051', age: 52, category: '肾功能不全' as PatientCategory, abnormalType: '肝肾功能新发异常', riskLevel: '高风险' as RiskLevel, handleStatus: '已处理' },
  { name: '吴桂芳', medicalRecordNo: '20260057', age: 68, category: '手术期' as PatientCategory, abnormalType: '严重低血糖', riskLevel: '高风险' as RiskLevel, handleStatus: '处理中' },
]