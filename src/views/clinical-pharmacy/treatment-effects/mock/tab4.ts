import type { Patient, PatientDetail, FollowUpRecord, EfficacyReport, EfficacyLevel, OverallStatus, PatientCategory, RiskLevel } from './types'

// Tab4 全量患者列表 - 200患者中抽取50人展示
export function generatePatientList(): Patient[] {
  const patients: Patient[] = []
  const baseDate = new Date('2026-03-28')

  const names = [
    '王磊', '李梅', '张伟', '刘芳', '陈明', '杨丽', '黄强', '周敏', '吴浩', '郑红',
    '孙杰', '马丽', '朱刚', '胡萍', '林峰', '何静', '高建', '罗燕', '徐鹏', '余婷',
    '许刚', '沈芳', '韩磊', '邓梅', '蒋伟', '姜丽', '熊强', '唐敏', '钱华', '汤磊',
    '李建国', '王秀英', '张志强', '刘淑芬', '陈德明', '赵桂兰', '杨伟东', '孙丽娟',
    '周建国', '吴秀珍', '郑志强', '冯淑英', '林德伟', '何桂芳', '高俊杰', '罗秀兰',
  ]

  const categories: PatientCategory[] = ['年轻低危', '老年衰弱', '肾功能不全', '妊娠期', '手术期', '心血管高危']
  const categoryNames: Record<PatientCategory, string> = {
    年轻低危: '年轻低危', 老年衰弱: '老年衰弱', 肾功能不全: '肾功能不全',
    妊娠期: '妊娠期', 手术期: '手术期', 心血管高危: '心血管高危',
  }
  const efficacyLevels: EfficacyLevel[] = ['优秀达标', '稳定达标', '部分达标', '未达标', '高风险异常']
  const overallStatuses: OverallStatus[] = ['达标', '未达标', '部分达标']
  const doctors = ['张明', '李华', '王芳', '刘伟', '陈静', '杨洋', '赵敏', '周杰']

  // 疗效分布：优秀10人、稳定15人、部分12人、未达标8人、高风险5人
  const distribution = [
    { level: '优秀达标', count: 10, status: '达标' as OverallStatus, hba1cRange: [5.0, 6.2] },
    { level: '稳定达标', count: 15, status: '达标' as OverallStatus, hba1cRange: [6.0, 7.5] },
    { level: '部分达标', count: 12, status: '部分达标' as OverallStatus, hba1cRange: [7.0, 8.5] },
    { level: '未达标', count: 8, status: '未达标' as OverallStatus, hba1cRange: [8.5, 10.0] },
    { level: '高风险异常', count: 5, status: '未达标' as OverallStatus, hba1cRange: [9.5, 11.0] },
  ]

  let id = 1
  let nameIndex = 0

  distribution.forEach((group) => {
    for (let i = 0; i < group.count; i++) {
      const categoryIndex = Math.floor(Math.random() * categories.length)
      const category = categories[categoryIndex]
      const age = getAgeByCategory(category)
      const hba1c = (Math.random() * (group.hba1cRange[1] - group.hba1cRange[0]) + group.hba1cRange[0]).toFixed(1)
      const followUpDays = Math.floor(Math.random() * 118)

      const followUpDate = new Date(baseDate)
      followUpDate.setDate(followUpDate.getDate() - followUpDays)

      patients.push({
        id,
        name: names[nameIndex % names.length] + (nameIndex >= names.length ? Math.floor(nameIndex / names.length) : ''),
        medicalRecordNo: `2026${String(id).padStart(5, '0')}`,
        age,
        gender: Math.random() > 0.5 ? '男' : '女',
        category,
        categoryName: categoryNames[category],
        diabetesType: getDiabetesType(category),
        diseaseDuration: `${Math.floor(Math.random() * 15) + 1}年`,
        latestHba1c: hba1c,
        efficacyLevel: group.level,
        overallStatus: group.status,
        lastFollowUpDate: formatDate(followUpDate),
        mainDoctor: doctors[Math.floor(Math.random() * doctors.length)],
      })
      id++
      nameIndex++
    }
  })

  return patients
}

function getAgeByCategory(category: PatientCategory): number {
  switch (category) {
    case '年轻低危': return Math.floor(Math.random() * 15) + 25
    case '老年衰弱': return Math.floor(Math.random() * 10) + 70
    case '肾功能不全': return Math.floor(Math.random() * 15) + 50
    case '妊娠期': return Math.floor(Math.random() * 10) + 25
    case '手术期': return Math.floor(Math.random() * 20) + 45
    case '心血管高危': return Math.floor(Math.random() * 15) + 55
    default: return 50
  }
}

function getDiabetesType(category: PatientCategory): string {
  switch (category) {
    case '妊娠期': return '妊娠糖尿病'
    case '年轻低危': return Math.random() > 0.3 ? '2型糖尿病' : '1型糖尿病'
    default: return '2型糖尿病'
  }
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 生成患者详情数据
export function generatePatientDetail(patient: Patient): PatientDetail {
  return {
    basicInfo: {
      姓名: patient.name,
      性别: patient.gender,
      年龄: patient.age,
      病历号: patient.medicalRecordNo,
      糖尿病类型: patient.diabetesType,
      病程: patient.diseaseDuration,
      所属分层: patient.category,
      最近HbA1c结果: patient.latestHba1c + '%',
      综合疗效评级: patient.efficacyLevel,
      整体达标情况: patient.overallStatus,
    },
    indicators: [
      { 指标名称: '空腹血糖', 个人目标值: '6.5', 最近检测值: '7.2', 上次检测值: '7.0', 变化幅度: '+0.2', 是否达标: '否', 异常等级: '低风险' as RiskLevel },
      { 指标名称: '餐后2小时血糖', 个人目标值: '9.0', 最近检测值: '10.5', 上次检测值: '10.2', 变化幅度: '+0.3', 是否达标: '否', 异常等级: '低风险' as RiskLevel },
      { 指标名称: '糖化血红蛋白', 个人目标值: '7.0', 最近检测值: patient.latestHba1c, 上次检测值: (parseFloat(patient.latestHba1c) - 0.3).toFixed(1), 变化幅度: '+0.3', 是否达标: parseFloat(patient.latestHba1c) <= 7.0 ? '是' : '否', 异常等级: parseFloat(patient.latestHba1c) > 8.5 ? '高风险' as RiskLevel : parseFloat(patient.latestHba1c) > 7.0 ? '低风险' as RiskLevel : '低风险' as RiskLevel },
      { 指标名称: '血糖波动幅度', 个人目标值: '2.5', 最近检测值: '3.2', 上次检测值: '3.0', 变化幅度: '+0.2', 是否达标: '否', 异常等级: '低风险' as RiskLevel },
      { 指标名称: '总胆固醇', 个人目标值: '4.5', 最近检测值: '4.8', 上次检测值: '4.9', 变化幅度: '-0.1', 是否达标: '是', 异常等级: '低风险' as RiskLevel },
      { 指标名称: '甘油三酯', 个人目标值: '1.5', 最近检测值: '1.6', 上次检测值: '1.7', 变化幅度: '-0.1', 是否达标: '是', 异常等级: '低风险' as RiskLevel },
      { 指标名称: '低密度脂蛋白', 个人目标值: '2.8', 最近检测值: '3.0', 上次检测值: '3.1', 变化幅度: '-0.1', 是否达标: '是', 异常等级: '低风险' as RiskLevel },
      { 指标名称: '高密度脂蛋白', 个人目标值: '1.2', 最近检测值: '1.1', 上次检测值: '1.1', 变化幅度: '0', 是否达标: '否', 异常等级: '低风险' as RiskLevel },
      { 指标名称: '谷丙转氨酶', 个人目标值: '35', 最近检测值: '32', 上次检测值: '33', 变化幅度: '-1', 是否达标: '是', 异常等级: '低风险' as RiskLevel },
      { 指标名称: '谷草转氨酶', 个人目标值: '35', 最近检测值: '30', 上次检测值: '31', 变化幅度: '-1', 是否达标: '是', 异常等级: '低风险' as RiskLevel },
      { 指标名称: '血肌酐', 个人目标值: '95', 最近检测值: '88', 上次检测值: '90', 变化幅度: '-2', 是否达标: '是', 异常等级: '低风险' as RiskLevel },
      { 指标名称: 'eGFR', 个人目标值: '90', 最近检测值: '92', 上次检测值: '90', 变化幅度: '+2', 是否达标: '是', 异常等级: '低风险' as RiskLevel },
      { 指标名称: '尿微量白蛋白/肌酐', 个人目标值: '3.0', 最近检测值: '2.8', 上次检测值: '2.9', 变化幅度: '-0.1', 是否达标: '是', 异常等级: '低风险' as RiskLevel },
      { 指标名称: '收缩压', 个人目标值: '130', 最近检测值: '135', 上次检测值: '138', 变化幅度: '-3', 是否达标: '是', 异常等级: '低风险' as RiskLevel },
      { 指标名称: '舒张压', 个人目标值: '80', 最近检测值: '82', 上次检测值: '85', 变化幅度: '-3', 是否达标: '是', 异常等级: '低风险' as RiskLevel },
      { 指标名称: '体重', 个人目标值: '75', 最近检测值: '78', 上次检测值: '79', 变化幅度: '-1', 是否达标: '否', 异常等级: '低风险' as RiskLevel },
      { 指标名称: 'BMI', 个人目标值: '24.0', 最近检测值: '25.2', 上次检测值: '25.5', 变化幅度: '-0.3', 是否达标: '否', 异常等级: '低风险' as RiskLevel },
      { 指标名称: '腰围', 个人目标值: '85', 最近检测值: '88', 上次检测值: '89', 变化幅度: '-1', 是否达标: '否', 异常等级: '低风险' as RiskLevel },
    ],
    currentMedication: {
      用药方案: '二甲双胍 500mg bid + 达格列净 10mg qd',
      用药时长: '12个月',
      用药依从性: '规律',
      历史不良反应: '无',
      用药风险提示: '注意监测肾功能',
    },
    followUpRecords: generateFollowUpRecords(),
    efficacyReports: generateEfficacyReports(),
  }
}

// 生成随访记录
function generateFollowUpRecords(): FollowUpRecord[] {
  const records: FollowUpRecord[] = []
  const baseDate = new Date('2026-03-28')
  const conclusions = ['血糖控制可', 'HbA1c下降趋势良好', '需加强饮食控制', '建议调整用药方案', '并发症筛查无异常']
  const suggestions = ['继续当前方案', '减少主食摄入', '增加运动', '下周复诊调整药物', '完善并发症检查']
  const doctors = ['张明', '李华', '王芳', '刘伟', '陈静']

  for (let i = 0; i < 10; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() - i * 30 - Math.floor(Math.random() * 10))

    records.push({
      随访日期: formatDate(date),
      随访医生: doctors[Math.floor(Math.random() * doctors.length)],
      疗效评估结论: conclusions[Math.floor(Math.random() * conclusions.length)],
      治疗调整建议: suggestions[Math.floor(Math.random() * suggestions.length)],
    })
  }

  return records
}

// 生成历史疗效报告
function generateEfficacyReports(): EfficacyReport[] {
  const reports: EfficacyReport[] = []
  const baseDate = new Date('2026-03-28')
  const types = ['季度评估报告', '年度评估报告', '并发症筛查报告', '用药调整评估']
  const conclusions = [
    '血糖整体达标，肝肾功能正常，继续当前治疗方案',
    'HbA1c有所下降，建议继续当前方案，3个月后复查',
    '血糖波动较大，建议调整用药方案，加强监测',
    '出现轻度肝功能异常，建议保肝治疗',
    '并发症筛查无明显异常，继续维持治疗',
  ]

  for (let i = 0; i < 5; i++) {
    const date = new Date(baseDate)
    date.setMonth(date.getMonth() - i * 3 - Math.floor(Math.random() * 2))

    reports.push({
      报告日期: formatDate(date),
      报告类型: types[Math.floor(Math.random() * types.length)],
      核心结论: conclusions[i],
    })
  }

  return reports
}

// HbA1c 12个月趋势数据
export function generateHba1cTrend(latestHba1c: string): { months: string[]; values: string[]; target: number } {
  const months = ['2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03']
  const baseValue = parseFloat(latestHba1c)
  const values: string[] = []

  for (let i = months.length - 1; i >= 0; i--) {
    const progress = (months.length - 1 - i) / (months.length - 1)
    const value = baseValue - progress * (baseValue - 7.0) + (Math.random() - 0.5) * 0.5
    values.push(value.toFixed(1))
  }

  return { months, values, target: 7.0 }
}

// 血糖波动3个月趋势数据
export function generateGlucoseTrend(): {
  months: string[]
  fastingValues: string[]
  postprandialValues: string[]
  fastingTarget: [number, number]
  postprandialTarget: [number, number]
} {
  const months = ['2026-01', '2026-02', '2026-03']
  return {
    months,
    fastingValues: ['7.2', '7.0', '7.2'],
    postprandialValues: ['10.5', '10.2', '10.5'],
    fastingTarget: [6.0, 7.0],
    postprandialTarget: [8.0, 10.0],
  }
}
