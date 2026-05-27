import type { ComplicationSubCard, ComplicationStageDistribution, ComplicationDetailPatient, PatientCategory, ComplicationStage } from './types'

// Tab3: 微血管并发症 - 4张统计卡片
export const microvascularCards: ComplicationSubCard[] = [
  { title: '糖尿病肾病患者', value: '38', unit: '人', rate: '19.0%', change: '+1.2%', subTitle: '总患者数/占比' },
  { title: '视网膜病变患者', value: '32', unit: '人', rate: '16.0%', change: '+0.5%', subTitle: '总患者数/占比' },
  { title: '周围神经病变患者', value: '28', unit: '人', rate: '14.0%', change: '-0.3%', subTitle: '总患者数/占比' },
  { title: '年内新发/进展', value: '18', unit: '人次', rate: '9.0%', change: '+0.8%', subTitle: '近1年新发+分期进展人次' },
]

// Tab3: 大血管并发症 - 4张统计卡片
export const macrovascularCards: ComplicationSubCard[] = [
  { title: '冠心病患者', value: '22', unit: '人', rate: '11.0%', change: '+0.8%', subTitle: '总患者数/占比' },
  { title: '脑梗患者', value: '15', unit: '人', rate: '7.5%', change: '+0.3%', subTitle: '总患者数/占比' },
  { title: '外周血管病变患者', value: '12', unit: '人', rate: '6.0%', change: '-0.2%', subTitle: '总患者数/占比' },
  { title: '年内新发/进展', value: '10', unit: '人次', rate: '5.0%', change: '+0.5%', subTitle: '近1年新发+分期进展人次' },
]

// 微血管并发症分期分布柱状图数据
export const microvascularStageDistribution: ComplicationStageDistribution[] = [
  { complicationName: '糖尿病肾病', early: 15, mid: 14, late: 9 },
  { complicationName: '视网膜病变', early: 14, mid: 12, late: 6 },
  { complicationName: '周围神经病变', early: 12, mid: 10, late: 6 },
]

// 大血管并发症分期分布柱状图数据
export const macrovascularStageDistribution: ComplicationStageDistribution[] = [
  { complicationName: '冠心病', early: 8, mid: 9, late: 5 },
  { complicationName: '脑梗', early: 6, mid: 5, late: 4 },
  { complicationName: '外周血管病变', early: 5, mid: 4, late: 3 },
]

// 微血管并发症进展患者明细列表
export const microvascularProgressPatients: ComplicationDetailPatient[] = [
  { id: 1, name: '李建国', medicalRecordNo: '20260001', age: 58, category: '心血管高危' as PatientCategory, complicationName: '糖尿病肾病', currentStage: '晚期' as ComplicationStage, changeFromLast: '中期→晚期', lastCheckDate: '2026-03-15' },
  { id: 2, name: '王秀英', medicalRecordNo: '20260005', age: 72, category: '老年衰弱' as PatientCategory, complicationName: '视网膜病变', currentStage: '中期' as ComplicationStage, changeFromLast: '早期→中期', lastCheckDate: '2026-03-10' },
  { id: 3, name: '张志强', medicalRecordNo: '20260012', age: 65, category: '肾功能不全' as PatientCategory, complicationName: '糖尿病肾病', currentStage: '中期' as ComplicationStage, changeFromLast: '早期→中期', lastCheckDate: '2026-03-08' },
  { id: 4, name: '刘淑芬', medicalRecordNo: '20260018', age: 45, category: '年轻低危' as PatientCategory, complicationName: '周围神经病变', currentStage: '早期' as ComplicationStage, changeFromLast: '新发', lastCheckDate: '2026-03-12' },
  { id: 5, name: '陈德明', medicalRecordNo: '20260023', age: 68, category: '心血管高危' as PatientCategory, complicationName: '糖尿病肾病', currentStage: '中期' as ComplicationStage, changeFromLast: '早期→中期', lastCheckDate: '2026-03-05' },
  { id: 6, name: '杨伟东', medicalRecordNo: '20260034', age: 62, category: '肾功能不全' as PatientCategory, complicationName: '视网膜病变', currentStage: '晚期' as ComplicationStage, changeFromLast: '中期→晚期', lastCheckDate: '2026-03-02' },
  { id: 7, name: '孙丽娟', medicalRecordNo: '20260041', age: 48, category: '年轻低危' as PatientCategory, complicationName: '糖尿病肾病', currentStage: '早期' as ComplicationStage, changeFromLast: '新发', lastCheckDate: '2026-03-20' },
  { id: 8, name: '周建国', medicalRecordNo: '20260047', age: 75, category: '老年衰弱' as PatientCategory, complicationName: '周围神经病变', currentStage: '中期' as ComplicationStage, changeFromLast: '早期→中期', lastCheckDate: '2026-03-07' },
  { id: 9, name: '冯淑英', medicalRecordNo: '20260063', age: 43, category: '年轻低危' as PatientCategory, complicationName: '糖尿病肾病', currentStage: '中期' as ComplicationStage, changeFromLast: '早期→中期', lastCheckDate: '2026-03-16' },
  { id: 10, name: '林德伟', medicalRecordNo: '20260069', age: 70, category: '老年衰弱' as PatientCategory, complicationName: '视网膜病变', currentStage: '早期' as ComplicationStage, changeFromLast: '新发', lastCheckDate: '2026-03-09' },
  { id: 11, name: '何桂芳', medicalRecordNo: '20260075', age: 58, category: '肾功能不全' as PatientCategory, complicationName: '糖尿病肾病', currentStage: '晚期' as ComplicationStage, changeFromLast: '中期→晚期', lastCheckDate: '2026-03-11' },
  { id: 12, name: '韩伟明', medicalRecordNo: '20260105', age: 61, category: '肾功能不全' as PatientCategory, complicationName: '视网膜病变', currentStage: '中期' as ComplicationStage, changeFromLast: '早期→中期', lastCheckDate: '2026-03-13' },
]

// 大血管并发症进展患者明细列表
export const macrovascularProgressPatients: ComplicationDetailPatient[] = [
  { id: 1, name: '张志强', medicalRecordNo: '20260012', age: 65, category: '肾功能不全' as PatientCategory, complicationName: '冠心病', currentStage: '早期' as ComplicationStage, changeFromLast: '新发', lastCheckDate: '2026-03-08' },
  { id: 2, name: '赵桂兰', medicalRecordNo: '20260028', age: 55, category: '手术期' as PatientCategory, complicationName: '外周血管病变', currentStage: '早期' as ComplicationStage, changeFromLast: '新发', lastCheckDate: '2026-03-18' },
  { id: 3, name: '周建国', medicalRecordNo: '20260047', age: 75, category: '老年衰弱' as PatientCategory, complicationName: '冠心病', currentStage: '中期' as ComplicationStage, changeFromLast: '早期→中期', lastCheckDate: '2026-03-07' },
  { id: 4, name: '何桂芳', medicalRecordNo: '20260075', age: 58, category: '肾功能不全' as PatientCategory, complicationName: '冠心病', currentStage: '晚期' as ComplicationStage, changeFromLast: '中期→晚期', lastCheckDate: '2026-03-11' },
  { id: 5, name: '郑志强', medicalRecordNo: '20260058', age: 60, category: '手术期' as PatientCategory, complicationName: '脑梗', currentStage: '早期' as ComplicationStage, changeFromLast: '新发', lastCheckDate: '2026-03-01' },
  { id: 6, name: '邓秀芬', medicalRecordNo: '20260111', age: 47, category: '年轻低危' as PatientCategory, complicationName: '脑梗', currentStage: '早期' as ComplicationStage, changeFromLast: '新发', lastCheckDate: '2026-03-21' },
  { id: 7, name: '罗秀兰', medicalRecordNo: '20260087', age: 66, category: '手术期' as PatientCategory, complicationName: '外周血管病变', currentStage: '中期' as ComplicationStage, changeFromLast: '早期→中期', lastCheckDate: '2026-03-04' },
  { id: 8, name: '陈伟东', medicalRecordNo: '20260027', age: 70, category: '老年衰弱' as PatientCategory, complicationName: '外周血管病变', currentStage: '中期' as ComplicationStage, changeFromLast: '早期→中期', lastCheckDate: '2026-03-02' },
]