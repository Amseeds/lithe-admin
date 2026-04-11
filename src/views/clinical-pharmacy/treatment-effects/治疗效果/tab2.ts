import type { MetabolicIndex, AbnormalPatient, PatientCategory, RiskLevel } from './types'

// 糖代谢指标
export const glucoseMetabolicIndices: MetabolicIndex[] = [
  {
    name: '空腹血糖',
    unit: 'mmol/L',
    standardCount: 145,
    standardRate: '72.5%',
    standardRateChange: '+2.3%',
    abnormalCount: 55,
    abnormalRate: '27.5%',
    abnormalRateChange: '-2.3%',
    normalRange: [3.9, 7.0],
    target: 6.5,
  },
  {
    name: '餐后2小时血糖',
    unit: 'mmol/L',
    standardCount: 138,
    standardRate: '69.0%',
    standardRateChange: '-1.5%',
    abnormalCount: 62,
    abnormalRate: '31.0%',
    abnormalRateChange: '+1.5%',
    normalRange: [4.4, 10.0],
    target: 9.0,
  },
  {
    name: '糖化血红蛋白（HbA1c）',
    unit: '%',
    standardCount: 150,
    standardRate: '75.0%',
    standardRateChange: '+1.8%',
    abnormalCount: 50,
    abnormalRate: '25.0%',
    abnormalRateChange: '-1.8%',
    normalRange: [4.0, 6.5],
    target: 7.0,
  },
  {
    name: '血糖波动幅度',
    unit: 'mmol/L',
    standardCount: 128,
    standardRate: '64.0%',
    standardRateChange: '-0.8%',
    abnormalCount: 72,
    abnormalRate: '36.0%',
    abnormalRateChange: '+0.8%',
    normalRange: [0, 3.0],
    target: 2.5,
  },
]

// 脂质代谢指标
export const lipidMetabolicIndices: MetabolicIndex[] = [
  {
    name: '总胆固醇',
    unit: 'mmol/L',
    standardCount: 156,
    standardRate: '78.0%',
    standardRateChange: '+1.2%',
    abnormalCount: 44,
    abnormalRate: '22.0%',
    abnormalRateChange: '-1.2%',
    normalRange: [0, 5.2],
    target: 4.5,
  },
  {
    name: '甘油三酯',
    unit: 'mmol/L',
    standardCount: 162,
    standardRate: '81.0%',
    standardRateChange: '+0.5%',
    abnormalCount: 38,
    abnormalRate: '19.0%',
    abnormalRateChange: '-0.5%',
    normalRange: [0, 1.7],
    target: 1.5,
  },
  {
    name: '低密度脂蛋白胆固醇',
    unit: 'mmol/L',
    standardCount: 148,
    standardRate: '74.0%',
    standardRateChange: '-0.3%',
    abnormalCount: 52,
    abnormalRate: '26.0%',
    abnormalRateChange: '+0.3%',
    normalRange: [0, 3.4],
    target: 2.8,
  },
  {
    name: '高密度脂蛋白胆固醇',
    unit: 'mmol/L',
    standardCount: 155,
    standardRate: '77.5%',
    standardRateChange: '+0.8%',
    abnormalCount: 45,
    abnormalRate: '22.5%',
    abnormalRateChange: '-0.8%',
    normalRange: [1.0, 99.0],
    target: 1.2,
  },
]

// 肝肾功能指标
export const liverKidneyIndices: MetabolicIndex[] = [
  {
    name: '谷丙转氨酶（ALT）',
    unit: 'U/L',
    standardCount: 178,
    standardRate: '89.0%',
    standardRateChange: '+0.5%',
    abnormalCount: 22,
    abnormalRate: '11.0%',
    abnormalRateChange: '-0.5%',
    normalRange: [0, 40],
    target: 35,
  },
  {
    name: '谷草转氨酶（AST）',
    unit: 'U/L',
    standardCount: 180,
    standardRate: '90.0%',
    standardRateChange: '+0.3%',
    abnormalCount: 20,
    abnormalRate: '10.0%',
    abnormalRateChange: '-0.3%',
    normalRange: [0, 40],
    target: 35,
  },
  {
    name: '血肌酐',
    unit: 'μmol/L',
    standardCount: 168,
    standardRate: '84.0%',
    standardRateChange: '-0.8%',
    abnormalCount: 32,
    abnormalRate: '16.0%',
    abnormalRateChange: '+0.8%',
    normalRange: [44, 132],
    target: 95,
  },
  {
    name: '肾小球滤过率（eGFR）',
    unit: 'mL/min/1.73m²',
    standardCount: 170,
    standardRate: '85.0%',
    standardRateChange: '-0.5%',
    abnormalCount: 30,
    abnormalRate: '15.0%',
    abnormalRateChange: '+0.5%',
    normalRange: [90, 99.0],
    target: 90,
  },
  {
    name: '尿微量白蛋白/肌酐比值',
    unit: 'mg/mmol',
    standardCount: 172,
    standardRate: '86.0%',
    standardRateChange: '+0.2%',
    abnormalCount: 28,
    abnormalRate: '14.0%',
    abnormalRateChange: '-0.2%',
    normalRange: [0, 3.5],
    target: 3.0,
  },
]

// 其他配套指标
export const otherIndices: MetabolicIndex[] = [
  {
    name: '收缩压',
    unit: 'mmHg',
    standardCount: 152,
    standardRate: '76.0%',
    standardRateChange: '+1.5%',
    abnormalCount: 48,
    abnormalRate: '24.0%',
    abnormalRateChange: '-1.5%',
    normalRange: [0, 140],
    target: 130,
  },
  {
    name: '舒张压',
    unit: 'mmHg',
    standardCount: 158,
    standardRate: '79.0%',
    standardRateChange: '+0.8%',
    abnormalCount: 42,
    abnormalRate: '21.0%',
    abnormalRateChange: '-0.8%',
    normalRange: [0, 90],
    target: 80,
  },
  {
    name: '体重',
    unit: 'kg',
    standardCount: 140,
    standardRate: '70.0%',
    standardRateChange: '-1.2%',
    abnormalCount: 60,
    abnormalRate: '30.0%',
    abnormalRateChange: '+1.2%',
    normalRange: [0, 85],
    target: 75,
  },
  {
    name: 'BMI',
    unit: 'kg/m²',
    standardCount: 144,
    standardRate: '72.0%',
    standardRateChange: '-0.5%',
    abnormalCount: 56,
    abnormalRate: '28.0%',
    abnormalRateChange: '+0.5%',
    normalRange: [0, 24.9],
    target: 24.0,
  },
  {
    name: '腰围',
    unit: 'cm',
    standardCount: 146,
    standardRate: '73.0%',
    standardRateChange: '-0.8%',
    abnormalCount: 54,
    abnormalRate: '27.0%',
    abnormalRateChange: '+0.8%',
    normalRange: [0, 90],
    target: 85,
  },
]

// 糖代谢异常患者明细 - 空腹血糖
export const fastingGlucoseAbnormalPatients: AbnormalPatient[] = [
  { name: '李建国', medicalRecordNo: '20260001', age: 58, category: '心血管高危' as PatientCategory, latestValue: '12.5', personalTarget: '6.5', abnormalLevel: '高风险' as RiskLevel, previousValue: '11.8', changeRate: '+0.7', testDate: '2026-03-15' },
  { name: '王秀英', medicalRecordNo: '20260005', age: 72, category: '老年衰弱' as PatientCategory, latestValue: '11.2', personalTarget: '7.0', abnormalLevel: '中风险' as RiskLevel, previousValue: '10.8', changeRate: '+0.4', testDate: '2026-03-10' },
  { name: '张志强', medicalRecordNo: '20260012', age: 65, category: '肾功能不全' as PatientCategory, latestValue: '14.2', personalTarget: '7.0', abnormalLevel: '高风险' as RiskLevel, previousValue: '13.5', changeRate: '+0.7', testDate: '2026-03-08' },
  { name: '刘淑芬', medicalRecordNo: '20260018', age: 45, category: '年轻低危' as PatientCategory, latestValue: '10.5', personalTarget: '6.0', abnormalLevel: '中风险' as RiskLevel, previousValue: '10.2', changeRate: '+0.3', testDate: '2026-03-12' },
  { name: '陈德明', medicalRecordNo: '20260023', age: 68, category: '心血管高危' as PatientCategory, latestValue: '13.8', personalTarget: '7.0', abnormalLevel: '高风险' as RiskLevel, previousValue: '12.5', changeRate: '+1.3', testDate: '2026-03-05' },
  { name: '赵桂兰', medicalRecordNo: '20260028', age: 55, category: '手术期' as PatientCategory, latestValue: '11.5', personalTarget: '7.0', abnormalLevel: '中风险' as RiskLevel, previousValue: '11.0', changeRate: '+0.5', testDate: '2026-03-18' },
  { name: '杨伟东', medicalRecordNo: '20260034', age: 62, category: '肾功能不全' as PatientCategory, latestValue: '15.2', personalTarget: '7.0', abnormalLevel: '高风险' as RiskLevel, previousValue: '14.0', changeRate: '+1.2', testDate: '2026-03-02' },
  { name: '孙丽娟', medicalRecordNo: '20260041', age: 48, category: '年轻低危' as PatientCategory, latestValue: '9.8', personalTarget: '6.0', abnormalLevel: '中风险' as RiskLevel, previousValue: '9.5', changeRate: '+0.3', testDate: '2026-03-20' },
  { name: '周建国', medicalRecordNo: '20260047', age: 75, category: '老年衰弱' as PatientCategory, latestValue: '10.8', personalTarget: '7.5', abnormalLevel: '中风险' as RiskLevel, previousValue: '10.5', changeRate: '+0.3', testDate: '2026-03-07' },
  { name: '吴秀珍', medicalRecordNo: '20260052', age: 52, category: '心血管高危' as PatientCategory, latestValue: '12.2', personalTarget: '7.0', abnormalLevel: '高风险' as RiskLevel, previousValue: '11.5', changeRate: '+0.7', testDate: '2026-03-14' },
  { name: '郑志强', medicalRecordNo: '20260058', age: 60, category: '手术期' as PatientCategory, latestValue: '11.8', personalTarget: '7.0', abnormalLevel: '中风险' as RiskLevel, previousValue: '11.2', changeRate: '+0.6', testDate: '2026-03-01' },
  { name: '冯淑英', medicalRecordNo: '20260063', age: 43, category: '年轻低危' as PatientCategory, latestValue: '11.5', personalTarget: '6.0', abnormalLevel: '高风险' as RiskLevel, previousValue: '10.8', changeRate: '+0.7', testDate: '2026-03-16' },
  { name: '林德伟', medicalRecordNo: '20260069', age: 70, category: '老年衰弱' as PatientCategory, latestValue: '10.5', personalTarget: '7.5', abnormalLevel: '中风险' as RiskLevel, previousValue: '10.2', changeRate: '+0.3', testDate: '2026-03-09' },
  { name: '何桂芳', medicalRecordNo: '20260075', age: 58, category: '肾功能不全' as PatientCategory, latestValue: '13.5', personalTarget: '7.0', abnormalLevel: '高风险' as RiskLevel, previousValue: '12.8', changeRate: '+0.7', testDate: '2026-03-11' },
  { name: '高俊杰', medicalRecordNo: '20260081', age: 50, category: '心血管高危' as PatientCategory, latestValue: '12.8', personalTarget: '7.0', abnormalLevel: '高风险' as RiskLevel, previousValue: '12.0', changeRate: '+0.8', testDate: '2026-03-19' },
]

// 餐后2小时血糖异常患者
export const postprandialGlucoseAbnormalPatients: AbnormalPatient[] = [
  { name: '陈德明', medicalRecordNo: '20260023', age: 68, category: '心血管高危' as PatientCategory, latestValue: '18.6', personalTarget: '9.0', abnormalLevel: '高风险' as RiskLevel, previousValue: '17.2', changeRate: '+1.4', testDate: '2026-03-05' },
  { name: '郑志强', medicalRecordNo: '20260058', age: 60, category: '手术期' as PatientCategory, latestValue: '16.8', personalTarget: '9.0', abnormalLevel: '高风险' as RiskLevel, previousValue: '16.0', changeRate: '+0.8', testDate: '2026-03-01' },
  { name: '罗秀兰', medicalRecordNo: '20260087', age: 66, category: '手术期' as PatientCategory, latestValue: '17.5', personalTarget: '9.0', abnormalLevel: '高风险' as RiskLevel, previousValue: '16.8', changeRate: '+0.7', testDate: '2026-03-04' },
  { name: '邓秀芬', medicalRecordNo: '20260111', age: 47, category: '年轻低危' as PatientCategory, latestValue: '16.2', personalTarget: '8.0', abnormalLevel: '高风险' as RiskLevel, previousValue: '15.5', changeRate: '+0.7', testDate: '2026-03-21' },
  { name: '徐志强', medicalRecordNo: '20260093', age: 54, category: '年轻低危' as PatientCategory, latestValue: '15.5', personalTarget: '8.0', abnormalLevel: '高风险' as RiskLevel, previousValue: '14.8', changeRate: '+0.7', testDate: '2026-03-17' },
]

// HbA1c异常患者
export const hba1cAbnormalPatients: AbnormalPatient[] = [
  { name: '李建国', medicalRecordNo: '20260001', age: 58, category: '心血管高危' as PatientCategory, latestValue: '9.8', personalTarget: '7.0', abnormalLevel: '高风险' as RiskLevel, previousValue: '9.5', changeRate: '+0.3', testDate: '2026-03-15' },
  { name: '王秀英', medicalRecordNo: '20260005', age: 72, category: '老年衰弱' as PatientCategory, latestValue: '10.2', personalTarget: '7.5', abnormalLevel: '高风险' as RiskLevel, previousValue: '9.8', changeRate: '+0.4', testDate: '2026-03-10' },
  { name: '刘淑芬', medicalRecordNo: '20260018', age: 45, category: '年轻低危' as PatientCategory, latestValue: '9.5', personalTarget: '6.5', abnormalLevel: '高风险' as RiskLevel, previousValue: '9.2', changeRate: '+0.3', testDate: '2026-03-12' },
  { name: '赵桂兰', medicalRecordNo: '20260028', age: 55, category: '手术期' as PatientCategory, latestValue: '10.8', personalTarget: '7.0', abnormalLevel: '高风险' as RiskLevel, previousValue: '10.2', changeRate: '+0.6', testDate: '2026-03-18' },
  { name: '孙丽娟', medicalRecordNo: '20260041', age: 48, category: '年轻低危' as PatientCategory, latestValue: '9.2', personalTarget: '6.5', abnormalLevel: '高风险' as RiskLevel, previousValue: '8.8', changeRate: '+0.4', testDate: '2026-03-20' },
  { name: '吴秀珍', medicalRecordNo: '20260052', age: 52, category: '心血管高危' as PatientCategory, latestValue: '10.5', personalTarget: '7.0', abnormalLevel: '高风险' as RiskLevel, previousValue: '10.0', changeRate: '+0.5', testDate: '2026-03-14' },
  { name: '冯淑英', medicalRecordNo: '20260063', age: 43, category: '年轻低危' as PatientCategory, latestValue: '11.5', personalTarget: '6.5', abnormalLevel: '高风险' as RiskLevel, previousValue: '10.8', changeRate: '+0.7', testDate: '2026-03-16' },
  { name: '林德伟', medicalRecordNo: '20260069', age: 70, category: '老年衰弱' as PatientCategory, latestValue: '9.8', personalTarget: '7.5', abnormalLevel: '高风险' as RiskLevel, previousValue: '9.5', changeRate: '+0.3', testDate: '2026-03-09' },
  { name: '何桂芳', medicalRecordNo: '20260075', age: 58, category: '肾功能不全' as PatientCategory, latestValue: '10.1', personalTarget: '7.0', abnormalLevel: '高风险' as RiskLevel, previousValue: '9.8', changeRate: '+0.3', testDate: '2026-03-11' },
  { name: '韩伟明', medicalRecordNo: '20260105', age: 61, category: '肾功能不全' as PatientCategory, latestValue: '10.3', personalTarget: '7.0', abnormalLevel: '高风险' as RiskLevel, previousValue: '9.8', changeRate: '+0.5', testDate: '2026-03-13' },
  { name: '徐志强', medicalRecordNo: '20260093', age: 54, category: '年轻低危' as PatientCategory, latestValue: '9.6', personalTarget: '6.5', abnormalLevel: '高风险' as RiskLevel, previousValue: '9.2', changeRate: '+0.4', testDate: '2026-03-17' },
  { name: '沈桂英', medicalRecordNo: '20260099', age: 73, category: '老年衰弱' as PatientCategory, latestValue: '9.8', personalTarget: '7.5', abnormalLevel: '高风险' as RiskLevel, previousValue: '9.5', changeRate: '+0.3', testDate: '2026-03-06' },
]

// 血糖波动异常患者
export const glucoseVariationAbnormalPatients: AbnormalPatient[] = [
  { name: '周建国', medicalRecordNo: '20260047', age: 75, category: '老年衰弱' as PatientCategory, latestValue: '5.8', personalTarget: '2.5', abnormalLevel: '高风险' as RiskLevel, previousValue: '5.2', changeRate: '+0.6', testDate: '2026-03-07' },
  { name: '高俊杰', medicalRecordNo: '20260081', age: 50, category: '心血管高危' as PatientCategory, latestValue: '6.2', personalTarget: '2.5', abnormalLevel: '高风险' as RiskLevel, previousValue: '5.8', changeRate: '+0.4', testDate: '2026-03-19' },
  { name: '杨伟东', medicalRecordNo: '20260034', age: 62, category: '肾功能不全' as PatientCategory, latestValue: '5.5', personalTarget: '2.5', abnormalLevel: '高风险' as RiskLevel, previousValue: '5.0', changeRate: '+0.5', testDate: '2026-03-02' },
]

// 指标异常分布直方图数据生成函数
export function generateDistributionData(normalRange: [number, number], target: number) {
  const min = normalRange[0] * 0.5
  const max = normalRange[1] * 2
  const step = (max - min) / 8
  const ranges: string[] = []
  const counts: number[] = []

  for (let i = 0; i < 8; i++) {
    const start = (min + step * i).toFixed(1)
    const end = (min + step * (i + 1)).toFixed(1)
    ranges.push(`${start}-${end}`)

    // 生成正态分布数据，中间多两边少
    const midPoint = (normalRange[0] + normalRange[1]) / 2
    const distance = Math.abs((min + step * (i + 0.5)) - midPoint)
    const normalizedDistance = distance / (normalRange[1] - normalRange[0])
    const count = Math.floor(50 - normalizedDistance * 30 + Math.random() * 20)
    counts.push(Math.max(5, count))
  }

  return { ranges, counts }
}

// 近6个月指标趋势数据
export function generateTrendData(baseValue: number, target: number) {
  return {
    months: ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'],
    values: [
      (baseValue + Math.random() * 2 - 1).toFixed(1),
      (baseValue + Math.random() * 2 - 1).toFixed(1),
      (baseValue + Math.random() * 2 - 1).toFixed(1),
      (baseValue + Math.random() * 2 - 1).toFixed(1),
      (baseValue + Math.random() * 2 - 1).toFixed(1),
      (baseValue + Math.random() * 2 - 1).toFixed(1),
    ],
    target,
  }
}