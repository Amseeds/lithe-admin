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
  { 并发症名称: '糖尿病肾病', 早期: 15, 中期: 14, 晚期: 9 },
  { 并发症名称: '视网膜病变', 早期: 14, 中期: 12, 晚期: 6 },
  { 并发症名称: '周围神经病变', 早期: 12, 中期: 10, 晚期: 6 },
]

// 大血管并发症分期分布柱状图数据
export const macrovascularStageDistribution: ComplicationStageDistribution[] = [
  { 并发症名称: '冠心病', 早期: 8, 中期: 9, 晚期: 5 },
  { 并发症名称: '脑梗', 早期: 6, 中期: 5, 晚期: 4 },
  { 并发症名称: '外周血管病变', 早期: 5, 中期: 4, 晚期: 3 },
]

// 微血管并发症进展患者明细列表
export const microvascularProgressPatients: ComplicationDetailPatient[] = [
  { id: 1, 患者姓名: '李建国', 病历号: '20260001', 年龄: 58, 所属分层: '心血管高危' as PatientCategory, 并发症名称: '糖尿病肾病', 当前分期: '晚期' as ComplicationStage, 较上次变化: '中期→晚期', 最近检查日期: '2026-03-15' },
  { id: 2, 患者姓名: '王秀英', 病历号: '20260005', 年龄: 72, 所属分层: '老年衰弱' as PatientCategory, 并发症名称: '视网膜病变', 当前分期: '中期' as ComplicationStage, 较上次变化: '早期→中期', 最近检查日期: '2026-03-10' },
  { id: 3, 患者姓名: '张志强', 病历号: '20260012', 年龄: 65, 所属分层: '肾功能不全' as PatientCategory, 并发症名称: '糖尿病肾病', 当前分期: '中期' as ComplicationStage, 较上次变化: '早期→中期', 最近检查日期: '2026-03-08' },
  { id: 4, 患者姓名: '刘淑芬', 病历号: '20260018', 年龄: 45, 所属分层: '年轻低危' as PatientCategory, 并发症名称: '周围神经病变', 当前分期: '早期' as ComplicationStage, 较上次变化: '新发', 最近检查日期: '2026-03-12' },
  { id: 5, 患者姓名: '陈德明', 病历号: '20260023', 年龄: 68, 所属分层: '心血管高危' as PatientCategory, 并发症名称: '糖尿病肾病', 当前分期: '中期' as ComplicationStage, 较上次变化: '早期→中期', 最近检查日期: '2026-03-05' },
  { id: 6, 患者姓名: '杨伟东', 病历号: '20260034', 年龄: 62, 所属分层: '肾功能不全' as PatientCategory, 并发症名称: '视网膜病变', 当前分期: '晚期' as ComplicationStage, 较上次变化: '中期→晚期', 最近检查日期: '2026-03-02' },
  { id: 7, 患者姓名: '孙丽娟', 病历号: '20260041', 年龄: 48, 所属分层: '年轻低危' as PatientCategory, 并发症名称: '糖尿病肾病', 当前分期: '早期' as ComplicationStage, 较上次变化: '新发', 最近检查日期: '2026-03-20' },
  { id: 8, 患者姓名: '周建国', 病历号: '20260047', 年龄: 75, 所属分层: '老年衰弱' as PatientCategory, 并发症名称: '周围神经病变', 当前分期: '中期' as ComplicationStage, 较上次变化: '早期→中期', 最近检查日期: '2026-03-07' },
  { id: 9, 患者姓名: '冯淑英', 病历号: '20260063', 年龄: 43, 所属分层: '年轻低危' as PatientCategory, 并发症名称: '糖尿病肾病', 当前分期: '中期' as ComplicationStage, 较上次变化: '早期→中期', 最近检查日期: '2026-03-16' },
  { id: 10, 患者姓名: '林德伟', 病历号: '20260069', 年龄: 70, 所属分层: '老年衰弱' as PatientCategory, 并发症名称: '视网膜病变', 当前分期: '早期' as ComplicationStage, 较上次变化: '新发', 最近检查日期: '2026-03-09' },
  { id: 11, 患者姓名: '何桂芳', 病历号: '20260075', 年龄: 58, 所属分层: '肾功能不全' as PatientCategory, 并发症名称: '糖尿病肾病', 当前分期: '晚期' as ComplicationStage, 较上次变化: '中期→晚期', 最近检查日期: '2026-03-11' },
  { id: 12, 患者姓名: '韩伟明', 病历号: '20260105', 年龄: 61, 所属分层: '肾功能不全' as PatientCategory, 并发症名称: '视网膜病变', 当前分期: '中期' as ComplicationStage, 较上次变化: '早期→中期', 最近检查日期: '2026-03-13' },
]

// 大血管并发症进展患者明细列表
export const macrovascularProgressPatients: ComplicationDetailPatient[] = [
  { id: 1, 患者姓名: '张志强', 病历号: '20260012', 年龄: 65, 所属分层: '肾功能不全' as PatientCategory, 并发症名称: '冠心病', 当前分期: '早期' as ComplicationStage, 较上次变化: '新发', 最近检查日期: '2026-03-08' },
  { id: 2, 患者姓名: '赵桂兰', 病历号: '20260028', 年龄: 55, 所属分层: '手术期' as PatientCategory, 并发症名称: '外周血管病变', 当前分期: '早期' as ComplicationStage, 较上次变化: '新发', 最近检查日期: '2026-03-18' },
  { id: 3, 患者姓名: '周建国', 病历号: '20260047', 年龄: 75, 所属分层: '老年衰弱' as PatientCategory, 并发症名称: '冠心病', 当前分期: '中期' as ComplicationStage, 较上次变化: '早期→中期', 最近检查日期: '2026-03-07' },
  { id: 4, 患者姓名: '何桂芳', 病历号: '20260075', 年龄: 58, 所属分层: '肾功能不全' as PatientCategory, 并发症名称: '冠心病', 当前分期: '晚期' as ComplicationStage, 较上次变化: '中期→晚期', 最近检查日期: '2026-03-11' },
  { id: 5, 患者姓名: '郑志强', 病历号: '20260058', 年龄: 60, 所属分层: '手术期' as PatientCategory, 并发症名称: '脑梗', 当前分期: '早期' as ComplicationStage, 较上次变化: '新发', 最近检查日期: '2026-03-01' },
  { id: 6, 患者姓名: '邓秀芬', 病历号: '20260111', 年龄: 47, 所属分层: '年轻低危' as PatientCategory, 并发症名称: '脑梗', 当前分期: '早期' as ComplicationStage, 较上次变化: '新发', 最近检查日期: '2026-03-21' },
  { id: 7, 患者姓名: '罗秀兰', 病历号: '20260087', 年龄: 66, 所属分层: '手术期' as PatientCategory, 并发症名称: '外周血管病变', 当前分期: '中期' as ComplicationStage, 较上次变化: '早期→中期', 最近检查日期: '2026-03-04' },
  { id: 8, 患者姓名: '陈伟东', 病历号: '20260027', 年龄: 70, 所属分层: '老年衰弱' as PatientCategory, 并发症名称: '外周血管病变', 当前分期: '中期' as ComplicationStage, 较上次变化: '早期→中期', 最近检查日期: '2026-03-02' },
]
