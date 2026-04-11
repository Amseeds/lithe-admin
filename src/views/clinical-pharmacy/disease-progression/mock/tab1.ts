import type { ComplicationStatCard, ComplicationProgressPatient, PatientCategory } from './types'

// Tab1: 6张并发症统计卡片
export const complicationCards: ComplicationStatCard[] = [
  {
    name: '无并发症患者',
    definition: '确诊糖尿病后，未出现任何糖尿病相关慢性并发症的患者',
    count: 52,
    percentage: '26.0%',
    change: '+1.5%',
  },
  {
    name: '微血管并发症患者',
    definition: '合并糖尿病肾病、视网膜病变、周围神经病变的患者',
    count: 68,
    percentage: '34.0%',
    change: '-0.8%',
  },
  {
    name: '大血管并发症患者',
    definition: '合并冠心病、脑梗、外周血管病变的患者',
    count: 38,
    percentage: '19.0%',
    change: '+0.5%',
  },
  {
    name: '多并发症合并患者',
    definition: '同时合并 2 种及以上糖尿病慢性并发症的患者',
    count: 24,
    percentage: '12.0%',
    change: '-0.3%',
  },
  {
    name: '胰岛功能衰退患者',
    definition: 'C 肽水平较基线下降超过 30% 的患者',
    count: 56,
    percentage: '28.0%',
    change: '+1.2%',
  },
  {
    name: '高进展风险患者',
    definition: '近 1 年出现并发症新发/加重的患者',
    count: 32,
    percentage: '16.0%',
    change: '+0.8%',
  },
]

// 并发症类型分布饼图数据
export const complicationDistribution = {
  data: [
    { name: '无并发症', value: 52 },
    { name: '微血管并发症', value: 68 },
    { name: '大血管并发症', value: 38 },
    { name: '多并发症合并', value: 24 },
    { name: '仅胰岛功能衰退', value: 18 },
  ],
}

// 近1年并发症新发/进展趋势折线图数据
export const complicationTrendChart = {
  xAxis: ['2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'],
  series: [
    { name: '微血管新发', data: [3, 2, 4, 2, 3, 1, 2, 3, 2, 4, 2, 3] },
    { name: '大血管新发', data: [1, 2, 1, 1, 2, 1, 0, 1, 2, 1, 1, 2] },
    { name: '分期进展', data: [4, 3, 5, 3, 4, 2, 3, 4, 3, 5, 3, 4] },
  ],
}

// 并发症新发/进展患者TOP20
export const complicationProgressTop20: ComplicationProgressPatient[] = [
  { id: 1, name: '李建国', medicalRecordNo: '20260001', age: 58, category: '心血管高危' as PatientCategory, complicationType: '糖尿病肾病', progressStatus: '中期→晚期', discoveryDate: '2026-03-15' },
  { id: 2, name: '王秀英', medicalRecordNo: '20260005', age: 72, category: '老年衰弱' as PatientCategory, complicationType: '视网膜病变', progressStatus: '早期→中期', discoveryDate: '2026-03-10' },
  { id: 3, name: '张志强', medicalRecordNo: '20260012', age: 65, category: '肾功能不全' as PatientCategory, complicationType: '冠心病', progressStatus: '新发', discoveryDate: '2026-03-08' },
  { id: 4, name: '刘淑芬', medicalRecordNo: '20260018', age: 45, category: '年轻低危' as PatientCategory, complicationType: '周围神经病变', progressStatus: '新发', discoveryDate: '2026-03-12' },
  { id: 5, name: '陈德明', medicalRecordNo: '20260023', age: 68, category: '心血管高危' as PatientCategory, complicationType: '糖尿病肾病', progressStatus: '早期→中期', discoveryDate: '2026-03-05' },
  { id: 6, name: '赵桂兰', medicalRecordNo: '20260028', age: 55, category: '手术期' as PatientCategory, complicationType: '外周血管病变', progressStatus: '新发', discoveryDate: '2026-03-18' },
  { id: 7, name: '杨伟东', medicalRecordNo: '20260034', age: 62, category: '肾功能不全' as PatientCategory, complicationType: '视网膜病变', progressStatus: '中期→晚期', discoveryDate: '2026-03-02' },
  { id: 8, name: '孙丽娟', medicalRecordNo: '20260041', age: 48, category: '年轻低危' as PatientCategory, complicationType: '糖尿病肾病', progressStatus: '新发', discoveryDate: '2026-03-20' },
  { id: 9, name: '周建国', medicalRecordNo: '20260047', age: 75, category: '老年衰弱' as PatientCategory, complicationType: '冠心病', progressStatus: '早期→中期', discoveryDate: '2026-03-07' },
  { id: 10, name: '吴秀珍', medicalRecordNo: '20260052', age: 52, category: '心血管高危' as PatientCategory, complicationType: '周围神经病变', progressStatus: '早期→中期', discoveryDate: '2026-03-14' },
  { id: 11, name: '郑志强', medicalRecordNo: '20260058', age: 60, category: '手术期' as PatientCategory, complicationType: '脑梗', progressStatus: '新发', discoveryDate: '2026-03-01' },
  { id: 12, name: '冯淑英', medicalRecordNo: '20260063', age: 43, category: '年轻低危' as PatientCategory, complicationType: '糖尿病肾病', progressStatus: '早期→中期', discoveryDate: '2026-03-16' },
  { id: 13, name: '林德伟', medicalRecordNo: '20260069', age: 70, category: '老年衰弱' as PatientCategory, complicationType: '视网膜病变', progressStatus: '新发', discoveryDate: '2026-03-09' },
  { id: 14, name: '何桂芳', medicalRecordNo: '20260075', age: 58, category: '肾功能不全' as PatientCategory, complicationType: '冠心病', progressStatus: '中期→晚期', discoveryDate: '2026-03-11' },
  { id: 15, name: '高俊杰', medicalRecordNo: '20260081', age: 50, category: '心血管高危' as PatientCategory, complicationType: '糖尿病肾病', progressStatus: '新发', discoveryDate: '2026-03-19' },
  { id: 16, name: '罗秀兰', medicalRecordNo: '20260087', age: 66, category: '手术期' as PatientCategory, complicationType: '外周血管病变', progressStatus: '早期→中期', discoveryDate: '2026-03-04' },
  { id: 17, name: '徐志强', medicalRecordNo: '20260093', age: 54, category: '年轻低危' as PatientCategory, complicationType: '周围神经病变', progressStatus: '新发', discoveryDate: '2026-03-17' },
  { id: 18, name: '沈桂英', medicalRecordNo: '20260099', age: 73, category: '老年衰弱' as PatientCategory, complicationType: '糖尿病肾病', progressStatus: '中期→晚期', discoveryDate: '2026-03-06' },
  { id: 19, name: '韩伟明', medicalRecordNo: '20260105', age: 61, category: '肾功能不全' as PatientCategory, complicationType: '视网膜病变', progressStatus: '早期→中期', discoveryDate: '2026-03-13' },
  { id: 20, name: '邓秀芬', medicalRecordNo: '20260111', age: 47, category: '年轻低危' as PatientCategory, complicationType: '脑梗', progressStatus: '新发', discoveryDate: '2026-03-21' },
]

// 高进展风险患者列表
export const highRiskProgressPatients: ComplicationProgressPatient[] = [
  { id: 1, name: '张建华', medicalRecordNo: '20260003', age: 65, category: '心血管高危' as PatientCategory, complicationType: '糖尿病肾病+冠心病', progressStatus: '双重进展', discoveryDate: '2026-03-10' },
  { id: 2, name: '李秀英', medicalRecordNo: '20260008', age: 78, category: '老年衰弱' as PatientCategory, complicationType: '视网膜病变+肾病', progressStatus: '双重进展', discoveryDate: '2026-03-05' },
  { id: 3, name: '王志强', medicalRecordNo: '20260015', age: 62, category: '肾功能不全' as PatientCategory, complicationType: '糖尿病肾病', progressStatus: '快速恶化', discoveryDate: '2026-03-12' },
  { id: 4, name: '刘桂兰', medicalRecordNo: '20260021', age: 55, category: '手术期' as PatientCategory, complicationType: '冠心病+神经病变', progressStatus: '新发+进展', discoveryDate: '2026-03-18' },
  { id: 5, name: '陈伟东', medicalRecordNo: '20260027', age: 70, category: '老年衰弱' as PatientCategory, complicationType: '外周血管病变', progressStatus: '快速进展', discoveryDate: '2026-03-02' },
  { id: 6, name: '赵淑珍', medicalRecordNo: '20260033', age: 48, category: '年轻低危' as PatientCategory, complicationType: '视网膜病变', progressStatus: '早期→中期', discoveryDate: '2026-03-15' },
  { id: 7, name: '杨俊杰', medicalRecordNo: '20260039', age: 58, category: '心血管高危' as PatientCategory, complicationType: '冠心病', progressStatus: '不稳定心绞痛', discoveryDate: '2026-03-08' },
  { id: 8, name: '孙秀英', medicalRecordNo: '20260045', age: 75, category: '老年衰弱' as PatientCategory, complicationType: '肾病+神经病变', progressStatus: '双重进展', discoveryDate: '2026-03-20' },
  { id: 9, name: '周志强', medicalRecordNo: '20260051', age: 52, category: '肾功能不全' as PatientCategory, complicationType: '糖尿病肾病', progressStatus: 'eGFR快速下降', discoveryDate: '2026-03-03' },
  { id: 10, name: '吴桂芳', medicalRecordNo: '20260057', age: 68, category: '手术期' as PatientCategory, complicationType: '脑梗', progressStatus: '再发风险高', discoveryDate: '2026-03-11' },
]