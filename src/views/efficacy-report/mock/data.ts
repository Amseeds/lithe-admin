import type {
  Report,
  ReportDetail,
  StatCard,
  ReportFilters,
  MockPatient,
  EfficacyRating,
  ReportStatus,
} from './types'

// ============================================================
// 固定患者池（全院100人，此处列出本模块常用的30人）
// ============================================================
export const mockPatients: MockPatient[] = [
  {
    name: '李明',
    gender: '男',
    age: 58,
    medicalRecordNo: 'LY20250001',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2019-03-15',
    diseaseDuration: 6,
    stratification: '高危层',
  },
  {
    name: '王芳',
    gender: '女',
    age: 52,
    medicalRecordNo: 'LY20250002',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2017-08-20',
    diseaseDuration: 8,
    stratification: '中危层',
  },
  {
    name: '张伟',
    gender: '男',
    age: 65,
    medicalRecordNo: 'LY20250003',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2015-11-10',
    diseaseDuration: 10,
    stratification: '高危层',
  },
  {
    name: '刘洋',
    gender: '男',
    age: 48,
    medicalRecordNo: 'LY20250004',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2021-05-08',
    diseaseDuration: 4,
    stratification: '低危层',
  },
  {
    name: '陈静',
    gender: '女',
    age: 45,
    medicalRecordNo: 'LY20250005',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2020-01-12',
    diseaseDuration: 5,
    stratification: '中危层',
  },
  {
    name: '赵强',
    gender: '男',
    age: 61,
    medicalRecordNo: 'LY20250006',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2018-07-22',
    diseaseDuration: 7,
    stratification: '高危层',
  },
  {
    name: '周敏',
    gender: '女',
    age: 55,
    medicalRecordNo: 'LY20250007',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2016-04-18',
    diseaseDuration: 9,
    stratification: '中危层',
  },
  {
    name: '吴斌',
    gender: '男',
    age: 70,
    medicalRecordNo: 'LY20250008',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2014-09-30',
    diseaseDuration: 11,
    stratification: '高危层',
  },
  {
    name: '郑超',
    gender: '男',
    age: 42,
    medicalRecordNo: 'LY20250009',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2022-02-14',
    diseaseDuration: 3,
    stratification: '低危层',
  },
  {
    name: '孙丽',
    gender: '女',
    age: 50,
    medicalRecordNo: 'LY20250010',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2019-06-25',
    diseaseDuration: 6,
    stratification: '中危层',
  },
  {
    name: '林峰',
    gender: '男',
    age: 55,
    medicalRecordNo: 'LY20250011',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2018-03-10',
    diseaseDuration: 7,
    stratification: '高危层',
  },
  {
    name: '黄霞',
    gender: '女',
    age: 47,
    medicalRecordNo: 'LY20250012',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2020-09-05',
    diseaseDuration: 5,
    stratification: '低危层',
  },
  {
    name: '徐杰',
    gender: '男',
    age: 53,
    medicalRecordNo: 'LY20250013',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2017-12-20',
    diseaseDuration: 8,
    stratification: '中危层',
  },
  {
    name: '马超',
    gender: '男',
    age: 68,
    medicalRecordNo: 'LY20250014',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2013-06-15',
    diseaseDuration: 12,
    stratification: '高危层',
  },
  {
    name: '朱琳',
    gender: '女',
    age: 44,
    medicalRecordNo: 'LY20250015',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2021-08-30',
    diseaseDuration: 4,
    stratification: '低危层',
  },
  {
    name: '胡平',
    gender: '男',
    age: 57,
    medicalRecordNo: 'LY20250016',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2019-01-18',
    diseaseDuration: 6,
    stratification: '中危层',
  },
  {
    name: '郭敏',
    gender: '女',
    age: 62,
    medicalRecordNo: 'LY20250017',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2016-11-08',
    diseaseDuration: 9,
    stratification: '高危层',
  },
  {
    name: '高健',
    gender: '男',
    age: 40,
    medicalRecordNo: 'LY20250018',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2023-02-28',
    diseaseDuration: 2,
    stratification: '低危层',
  },
  {
    name: '梁艳',
    gender: '女',
    age: 49,
    medicalRecordNo: 'LY20250019',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2020-04-12',
    diseaseDuration: 5,
    stratification: '中危层',
  },
  {
    name: '宋军',
    gender: '男',
    age: 64,
    medicalRecordNo: 'LY20250020',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2015-08-22',
    diseaseDuration: 10,
    stratification: '高危层',
  },
  {
    name: '唐静',
    gender: '女',
    age: 46,
    medicalRecordNo: 'LY20250021',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2021-11-15',
    diseaseDuration: 4,
    stratification: '低危层',
  },
  {
    name: '韩磊',
    gender: '男',
    age: 51,
    medicalRecordNo: 'LY20250022',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2018-06-30',
    diseaseDuration: 7,
    stratification: '中危层',
  },
  {
    name: '冯勇',
    gender: '男',
    age: 72,
    medicalRecordNo: 'LY20250023',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2012-04-18',
    diseaseDuration: 13,
    stratification: '高危层',
  },
  {
    name: '于慧',
    gender: '女',
    age: 43,
    medicalRecordNo: 'LY20250024',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2022-07-08',
    diseaseDuration: 3,
    stratification: '低危层',
  },
  {
    name: '许刚',
    gender: '男',
    age: 59,
    medicalRecordNo: 'LY20250025',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2017-02-14',
    diseaseDuration: 8,
    stratification: '高危层',
  },
  {
    name: '谢娟',
    gender: '女',
    age: 54,
    medicalRecordNo: 'LY20250026',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2019-09-22',
    diseaseDuration: 6,
    stratification: '中危层',
  },
  {
    name: '曾强',
    gender: '男',
    age: 66,
    medicalRecordNo: 'LY20250027',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2014-12-05',
    diseaseDuration: 11,
    stratification: '高危层',
  },
  {
    name: '丁娜',
    gender: '女',
    age: 41,
    medicalRecordNo: 'LY20250028',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2023-05-20',
    diseaseDuration: 2,
    stratification: '低危层',
  },
  {
    name: '邓辉',
    gender: '男',
    age: 56,
    medicalRecordNo: 'LY20250029',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2018-10-12',
    diseaseDuration: 7,
    stratification: '中危层',
  },
  {
    name: '彭涛',
    gender: '男',
    age: 69,
    medicalRecordNo: 'LY20250030',
    diabetesType: '2型糖尿病',
    diagnosisDate: '2013-03-28',
    diseaseDuration: 12,
    stratification: '高危层',
  },
]

// 医生列表
const doctors = ['张建国', '李秀英', '王志强', '刘文娟', '陈晓东', '周永峰']

// 报告类型映射
const reportTypeMap: Record<string, string> = {
  monthly: '月度随访',
  quarterly: '季度评估',
  annual: '年度全面',
  followup: '复诊专项',
}

// 疗效评级映射
const efficacyRatingMap: Record<EfficacyRating, string> = {
  excellent: '优秀达标',
  stable: '稳定达标',
  partial: '部分达标',
  failed: '未达标',
}

// 归档状态映射
const archiveStatusMap: Record<string, string> = {
  archived: '已归档',
  not_archived: '未归档',
}

// 状态映射
const reportStatusMap: Record<ReportStatus, string> = {
  草稿: '草稿',
  已归档: '已归档',
  已作废: '已作废',
}

// 生成日期随机函数
function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return date.toISOString().split('T')[0]
}

// 生成报告编号
function generateReportNo(index: number): string {
  return `LXBG-2026${String(index).padStart(6, '0')}`
}

// 生成50条报告数据
function generateReports(): Report[] {
  const reports: Report[] = []
  const startDate = new Date('2025-12-01')
  const endDate = new Date('2026-03-31')

  // 预定义状态分布：草稿10个，已归档35个，已作废5个
  const statusPool: ReportStatus[] = [
    ...Array(10).fill('draft' as ReportStatus),
    ...Array(35).fill('archived' as ReportStatus),
    ...Array(5).fill('obsolete' as ReportStatus),
  ]

  // 预定义疗效评级分布
  const ratingPool: EfficacyRating[] = [
    'excellent',
    'excellent',
    'excellent',
    'stable',
    'stable',
    'stable',
    'stable',
    'stable',
    'partial',
    'partial',
    'partial',
    'failed',
  ]

  for (let i = 0; i < 50; i++) {
    const patient = mockPatients[i % mockPatients.length]
    const status = statusPool[i]
    const rating = ratingPool[i % ratingPool.length]
    const reportTypes: Array<'monthly' | 'quarterly' | 'annual' | 'followup'> = [
      'monthly',
      'quarterly',
      'annual',
      'followup',
    ]
    const reportType = reportTypes[i % 4]
    const generateTime = randomDate(startDate, endDate)

    // 根据报告类型确定周期
    let periodStart = ''
    let periodEnd = ''
    if (reportType === 'monthly') {
      const d = new Date(generateTime)
      d.setDate(1)
      periodStart = d.toISOString().split('T')[0]
      d.setMonth(d.getMonth() + 1)
      d.setDate(d.getDate() - 1)
      periodEnd = d.toISOString().split('T')[0]
    } else if (reportType === 'quarterly') {
      const d = new Date(generateTime)
      const quarter = Math.floor(d.getMonth() / 3)
      d.setMonth(quarter * 3)
      d.setDate(1)
      periodStart = d.toISOString().split('T')[0]
      d.setMonth(d.getMonth() + 3)
      d.setDate(d.getDate() - 1)
      periodEnd = d.toISOString().split('T')[0]
    } else if (reportType === 'annual') {
      const d = new Date(generateTime)
      d.setMonth(0)
      d.setDate(1)
      periodStart = d.toISOString().split('T')[0]
      d.setMonth(11)
      d.setDate(31)
      periodEnd = d.toISOString().split('T')[0]
    } else {
      const d = new Date(generateTime)
      d.setDate(d.getDate() - 7)
      periodStart = d.toISOString().split('T')[0]
      periodEnd = generateTime
    }

    reports.push({
      id: `report-${i + 1}`,
      reportNo: generateReportNo(i + 1),
      patientName: patient.name,
      patientGender: patient.gender,
      patientAge: patient.age,
      medicalRecordNo: patient.medicalRecordNo,
      diabetesType: patient.diabetesType,
      diagnosisDate: patient.diagnosisDate,
      diseaseDuration: patient.diseaseDuration,
      stratification: patient.stratification,
      reportType,
      reportPeriodStart: periodStart,
      reportPeriodEnd: periodEnd,
      generateDoctor: doctors[i % doctors.length],
      generateTime,
      department: '内分泌科',
      reportStatus: status,
      efficacyRating: rating,
      archiveStatus: status === 'archived' ? 'archived' : 'not_archived',
    })
  }

  return reports
}

// 50条报告数据
export const reportList: Report[] = generateReports()

// 统计卡片数据（固定数值）
export const statCards: StatCard[] = [
  { title: '已生成报告总数', value: 128, change: '+12', changeType: 'increase' },
  { title: '本月新增报告数', value: 23, change: '+5', changeType: 'increase' },
  { title: '已归档报告数', value: 108, change: '+8', changeType: 'increase' },
  { title: '草稿待完成数', value: 15, change: '-3', changeType: 'decrease' },
]

// 根据报告生成详情数据
export function generateReportDetail(report: Report): ReportDetail {
  const complianceOptions = ['高', '中', '低']
  const compliance = complianceOptions[report.id.charCodeAt(7) % 3]

  let overallAssessment = '稳定可控'
  if (report.efficacyRating === 'excellent') overallAssessment = '稳定可控'
  else if (report.efficacyRating === 'stable') overallAssessment = '稳定可控'
  else if (report.efficacyRating === 'partial') overallAssessment = '缓慢进展'
  else overallAssessment = '快速进展'

  return {
    reportTitle: `2型糖尿病患者${reportTypeMap[report.reportType]}报告`,
    reportNo: report.reportNo,
    patientName: report.patientName,
    patientGender: report.patientGender,
    patientAge: report.patientAge,
    medicalRecordNo: report.medicalRecordNo,
    diabetesType: report.diabetesType,
    diagnosisDate: report.diagnosisDate,
    diseaseDuration: report.diseaseDuration,
    stratification: report.stratification,
    reportPeriodStart: report.reportPeriodStart,
    reportPeriodEnd: report.reportPeriodEnd,
    generateDoctor: report.generateDoctor,
    generateTime: report.generateTime,
    department: report.department,

    glucoseControlTarget: {
      hba1c: '<7.0%',
      fastingGlucose: '4.4~7.2',
      postprandialGlucose: '<10.0',
      bloodPressure: '<130/80',
      ldlCholesterol: '<2.6',
    },

    coreIndicator: {
      hba1cAvg: '6.8',
      hba1cRate: '85.0',
      fastingGlucoseAvg: '6.5',
      fastingGlucoseRate: '88.0',
      postprandialGlucoseAvg: '9.2',
      postprandialGlucoseRate: '82.0',
      bloodPressureStatus: '达标',
      lipidStatus: '达标',
    },
    medicationSafety: {
      compliance,
      adverseReactions: 0,
      liverKidneyAbnormal: '无',
      drugInteractionRisk: '无',
    },
    efficacyRating: report.efficacyRating,

    isletFunction: {
      fastingCPeptide: '385.2',
      changeTrend: '稳定',
      functionStatus: '无明显变化',
    },
    complications: {
      newComplications: '无新发并发症',
      existingComplications: '糖尿病视网膜病变1期',
      existingStatus: '稳定',
      currentStage: '早期',
    },
    diseaseProgression: overallAssessment,

    treatmentSuggestions: {
      glucoseControl: '维持当前控糖方案，继续使用二甲双胍联合格列美脲，定期监测血糖变化。',
      lifestyle: '建议每日坚持有氧运动不少于30分钟，控制主食摄入量在200g以内，保持规律作息。',
      followup: '建议每月定期复查空腹血糖及餐后2小时血糖，每3个月复查糖化血红蛋白及血脂系列。',
    },

    archiveInfo: {
      electronicSignature: report.generateDoctor,
      archiveStatus: report.archiveStatus === 'archived' ? '已归档' : '未归档',
      version: 'V1.0',
      remark: '本报告仅作为临床诊疗参考，不做其他用途',
    },
  }
}

// 根据筛选条件过滤报告
export function filterReports(filters: ReportFilters): Report[] {
  return reportList.filter((report) => {
    if (filters.dateRange) {
      const now = new Date('2026-03-31')
      let monthsBack = 3
      if (filters.dateRange === '近1个月') monthsBack = 1
      else if (filters.dateRange === '近3个月') monthsBack = 3
      else if (filters.dateRange === '近6个月') monthsBack = 6
      else if (filters.dateRange === '近1年') monthsBack = 12

      const cutoffDate = new Date(now)
      cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack)
      const reportDate = new Date(report.generateTime)
      if (reportDate < cutoffDate) return false
    }

    if (filters.reportType && filters.reportType !== 'all') {
      const typeMap: Record<string, string> = {
        月度随访: 'monthly',
        季度评估: 'quarterly',
        年度全面: 'annual',
        复诊专项: 'followup',
      }
      if (report.reportType !== typeMap[filters.reportType]) return false
    }

    if (filters.reportStatus && filters.reportStatus !== 'all') {
      const statusMap: Record<string, string> = {
        草稿: 'draft',
        已归档: 'archived',
        已作废: 'obsolete',
      }
      if (report.reportStatus !== statusMap[filters.reportStatus]) return false
    }

    if (filters.searchKeyword) {
      const kw = filters.searchKeyword.toLowerCase()
      if (
        !report.patientName.toLowerCase().includes(kw) &&
        !report.medicalRecordNo.toLowerCase().includes(kw)
      ) {
        return false
      }
    }

    return true
  })
}

// 生成新报告
let newReportCounter = 51
export function createNewReport(data: {
  patientIndex: number
  reportType: 'monthly' | 'quarterly' | 'annual' | 'followup'
  status: 'draft' | 'archived'
}): Report {
  const patient = mockPatients[data.patientIndex % mockPatients.length]
  const now = '2026-03-31'
  const id = `report-new-${newReportCounter}`
  newReportCounter++

  return {
    id,
    reportNo: generateReportNo(newReportCounter),
    patientName: patient.name,
    patientGender: patient.gender,
    patientAge: patient.age,
    medicalRecordNo: patient.medicalRecordNo,
    diabetesType: patient.diabetesType,
    diagnosisDate: patient.diagnosisDate,
    diseaseDuration: patient.diseaseDuration,
    stratification: patient.stratification,
    reportType: data.reportType,
    reportPeriodStart: '2026-03-01',
    reportPeriodEnd: '2026-03-31',
    generateDoctor: doctors[0],
    generateTime: now,
    department: '内分泌科',
    reportStatus: data.status,
    efficacyRating: 'stable',
    archiveStatus: data.status === 'archived' ? 'archived' : 'not_archived',
  }
}

// 导出辅助映射
export { reportTypeMap, efficacyRatingMap, archiveStatusMap, reportStatusMap }
