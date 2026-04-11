import type { PancreaticStatCard, PancreaticFunctionPatient, PatientCategory, PancreaticFunctionLevel } from './types'

// Tab2: 4张胰岛功能分级统计卡片
export const pancreaticFunctionCards: PancreaticStatCard[] = [
  { name: '胰岛功能正常', count: 68, percentage: '34.0%', change: '-1.0%' },
  { name: '胰岛功能轻度减退', count: 72, percentage: '36.0%', change: '+0.5%' },
  { name: '胰岛功能中度减退', count: 40, percentage: '20.0%', change: '+0.8%' },
  { name: '胰岛功能重度减退', count: 20, percentage: '10.0%', change: '+1.2%' },
]

// 近2年全院平均C肽水平变化趋势折线图数据
export const cPeptideTrendChart = {
  xAxis: [
    '2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09',
    '2024-10', '2024-11', '2024-12', '2025-01', '2025-02', '2025-03',
    '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09',
    '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03',
  ],
  series: [
    {
      name: '全院平均C肽',
      data: [
        2.85, 2.82, 2.80, 2.78, 2.76, 2.74,
        2.72, 2.70, 2.68, 2.66, 2.64, 2.62,
        2.60, 2.58, 2.56, 2.55, 2.53, 2.51,
        2.50, 2.48, 2.46, 2.45, 2.43, 2.42,
      ],
    },
    {
      name: '正常参考下限',
      data: Array(24).fill(1.1),
    },
  ],
}

// 胰岛功能分级占比趋势
export const pancreaticLevelTrend = {
  xAxis: ['2024-04', '2024-07', '2024-10', '2025-01', '2025-04', '2025-07', '2025-10', '2026-01', '2026-03'],
  series: [
    { name: '正常', data: [42.0, 40.5, 38.0, 37.5, 36.5, 35.5, 35.0, 34.5, 34.0] },
    { name: '轻度减退', data: [33.0, 34.0, 35.0, 35.5, 36.0, 36.0, 36.0, 36.0, 36.0] },
    { name: '中度减退', data: [17.0, 17.5, 18.5, 19.0, 19.5, 19.5, 20.0, 20.0, 20.0] },
    { name: '重度减退', data: [8.0, 8.0, 8.5, 8.0, 8.0, 9.0, 9.0, 9.5, 10.0] },
  ],
}

// 患者胰岛功能明细列表
export const pancreaticFunctionPatients: PancreaticFunctionPatient[] = [
  { id: 1, name: '李建国', medicalRecordNo: '20260001', age: 58, category: '心血管高危' as PatientCategory, pancreaticLevel: '重度减退' as PancreaticFunctionLevel, baselineCPeptide: '2.80', latestCPeptide: '0.85', declineRate: '69.6%', testDate: '2026-03-15' },
  { id: 2, name: '王秀英', medicalRecordNo: '20260005', age: 72, category: '老年衰弱' as PatientCategory, pancreaticLevel: '重度减退' as PancreaticFunctionLevel, baselineCPeptide: '2.50', latestCPeptide: '0.92', declineRate: '63.2%', testDate: '2026-03-10' },
  { id: 3, name: '张志强', medicalRecordNo: '20260012', age: 65, category: '肾功能不全' as PatientCategory, pancreaticLevel: '中度减退' as PancreaticFunctionLevel, baselineCPeptide: '2.60', latestCPeptide: '1.55', declineRate: '40.4%', testDate: '2026-03-08' },
  { id: 4, name: '刘淑芬', medicalRecordNo: '20260018', age: 45, category: '年轻低危' as PatientCategory, pancreaticLevel: '轻度减退' as PancreaticFunctionLevel, baselineCPeptide: '3.10', latestCPeptide: '2.05', declineRate: '33.9%', testDate: '2026-03-12' },
  { id: 5, name: '陈德明', medicalRecordNo: '20260023', age: 68, category: '心血管高危' as PatientCategory, pancreaticLevel: '中度减退' as PancreaticFunctionLevel, baselineCPeptide: '2.40', latestCPeptide: '1.42', declineRate: '40.8%', testDate: '2026-03-05' },
  { id: 6, name: '赵桂兰', medicalRecordNo: '20260028', age: 55, category: '手术期' as PatientCategory, pancreaticLevel: '正常' as PancreaticFunctionLevel, baselineCPeptide: '3.20', latestCPeptide: '2.85', declineRate: '10.9%', testDate: '2026-03-18' },
  { id: 7, name: '杨伟东', medicalRecordNo: '20260034', age: 62, category: '肾功能不全' as PatientCategory, pancreaticLevel: '重度减退' as PancreaticFunctionLevel, baselineCPeptide: '2.20', latestCPeptide: '0.78', declineRate: '64.5%', testDate: '2026-03-02' },
  { id: 8, name: '孙丽娟', medicalRecordNo: '20260041', age: 48, category: '年轻低危' as PatientCategory, pancreaticLevel: '轻度减退' as PancreaticFunctionLevel, baselineCPeptide: '3.50', latestCPeptide: '2.28', declineRate: '34.9%', testDate: '2026-03-20' },
  { id: 9, name: '周建国', medicalRecordNo: '20260047', age: 75, category: '老年衰弱' as PatientCategory, pancreaticLevel: '中度减退' as PancreaticFunctionLevel, baselineCPeptide: '2.10', latestCPeptide: '1.35', declineRate: '35.7%', testDate: '2026-03-07' },
  { id: 10, name: '吴秀珍', medicalRecordNo: '20260052', age: 52, category: '心血管高危' as PatientCategory, pancreaticLevel: '重度减退' as PancreaticFunctionLevel, baselineCPeptide: '2.65', latestCPeptide: '0.88', declineRate: '66.8%', testDate: '2026-03-14' },
  { id: 11, name: '郑志强', medicalRecordNo: '20260058', age: 60, category: '手术期' as PatientCategory, pancreaticLevel: '中度减退' as PancreaticFunctionLevel, baselineCPeptide: '2.35', latestCPeptide: '1.48', declineRate: '37.0%', testDate: '2026-03-01' },
  { id: 12, name: '冯淑英', medicalRecordNo: '20260063', age: 43, category: '年轻低危' as PatientCategory, pancreaticLevel: '正常' as PancreaticFunctionLevel, baselineCPeptide: '3.80', latestCPeptide: '3.15', declineRate: '17.1%', testDate: '2026-03-16' },
  { id: 13, name: '林德伟', medicalRecordNo: '20260069', age: 70, category: '老年衰弱' as PatientCategory, pancreaticLevel: '轻度减退' as PancreaticFunctionLevel, baselineCPeptide: '2.45', latestCPeptide: '1.65', declineRate: '32.7%', testDate: '2026-03-09' },
  { id: 14, name: '何桂芳', medicalRecordNo: '20260075', age: 58, category: '肾功能不全' as PatientCategory, pancreaticLevel: '中度减退' as PancreaticFunctionLevel, baselineCPeptide: '2.55', latestCPeptide: '1.52', declineRate: '40.4%', testDate: '2026-03-11' },
  { id: 15, name: '高俊杰', medicalRecordNo: '20260081', age: 50, category: '心血管高危' as PatientCategory, pancreaticLevel: '重度减退' as PancreaticFunctionLevel, baselineCPeptide: '2.30', latestCPeptide: '0.75', declineRate: '67.4%', testDate: '2026-03-19' },
]