import type { Patient, PatientProgressDetail, PatientCategory, ComplicationType, PancreaticFunctionLevel, ProgressRiskLevel, ComplicationTimelineEvent, ProgressFollowUpRecord, ExaminationResult } from './types'

// Tab4: 全量患者列表 - 200人中展示50人
export function generatePatientList(): Patient[] {
  const patients: Patient[] = []
  const baseDate = new Date('2026-03-28')

  const names = [
    '王磊', '李梅', '张伟', '刘芳', '陈明', '杨丽', '黄强', '周敏', '吴浩', '郑红',
    '孙杰', '马丽', '朱刚', '胡萍', '林峰', '何静', '高建', '罗燕', '徐鹏', '余婷',
    '许刚', '沈芳', '韩磊', '邓梅', '蒋伟', '姜丽', '熊强', '唐敏', '钱华', '汤磊',
    '李建国', '王秀英', '张志强', '刘淑芬', '陈德明', '赵桂兰', '杨伟东', '孙丽娟',
    '周建国', '吴秀珍', '郑志强', '冯淑英', '林德伟', '何桂芳', '高俊杰', '罗秀兰',
    '徐志强', '沈桂英',
  ]

  const categories: PatientCategory[] = ['年轻低危', '老年衰弱', '肾功能不全', '妊娠期', '手术期', '心血管高危']
  const categoryNames: Record<PatientCategory, string> = {
    年轻低危: '年轻低危', 老年衰弱: '老年衰弱', 肾功能不全: '肾功能不全',
    妊娠期: '妊娠期', 手术期: '手术期', 心血管高危: '心血管高危',
  }
  const complicationTypes: ComplicationType[] = ['无并发症', '微血管并发症', '大血管并发症', '多并发症合并']
  const pancreaticLevels: PancreaticFunctionLevel[] = ['正常', '轻度减退', '中度减退', '重度减退']
  const doctors = ['张明', '李华', '王芳', '刘伟', '陈静', '杨洋', '赵敏', '周杰']

  const distribution = [
    { complication: '无并发症' as ComplicationType, pancreatic: '正常' as PancreaticFunctionLevel, count: 10 },
    { complication: '无并发症' as ComplicationType, pancreatic: '轻度减退' as PancreaticFunctionLevel, count: 5 },
    { complication: '微血管并发症' as ComplicationType, pancreatic: '轻度减退' as PancreaticFunctionLevel, count: 10 },
    { complication: '微血管并发症' as ComplicationType, pancreatic: '中度减退' as PancreaticFunctionLevel, count: 8 },
    { complication: '大血管并发症' as ComplicationType, pancreatic: '中度减退' as PancreaticFunctionLevel, count: 7 },
    { complication: '多并发症合并' as ComplicationType, pancreatic: '重度减退' as PancreaticFunctionLevel, count: 5 },
    { complication: '微血管并发症' as ComplicationType, pancreatic: '正常' as PancreaticFunctionLevel, count: 5 },
  ]

  let id = 1
  distribution.forEach((group) => {
    for (let i = 0; i < group.count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)]
      const age = getAgeByCategory(category)
      const checkDays = Math.floor(Math.random() * 90)
      const checkDate = new Date(baseDate)
      checkDate.setDate(checkDate.getDate() - checkDays)

      patients.push({
        id,
        name: names[(id - 1) % names.length],
        medicalRecordNo: `2026${String(id).padStart(5, '0')}`,
        age,
        gender: Math.random() > 0.5 ? '男' : '女',
        category,
        categoryName: categoryNames[category],
        diabetesType: category === '妊娠期' ? '妊娠糖尿病' : Math.random() > 0.3 ? '2型糖尿病' : '1型糖尿病',
        diseaseDuration: `${Math.floor(Math.random() * 15) + 1}年`,
        complicationType: group.complication,
        pancreaticFunction: group.pancreatic,
        cPeptideLevel: getCPeptideByLevel(group.pancreatic),
        isHighRisk: group.complication === '多并发症合并' || group.pancreatic === '重度减退',
        lastCheckDate: formatDate(checkDate),
        mainDoctor: doctors[Math.floor(Math.random() * doctors.length)],
      })
      id++
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

function getCPeptideByLevel(level: PancreaticFunctionLevel): string {
  switch (level) {
    case '正常': return (Math.random() * 1.5 + 2.0).toFixed(2)
    case '轻度减退': return (Math.random() * 0.8 + 1.2).toFixed(2)
    case '中度减退': return (Math.random() * 0.5 + 0.8).toFixed(2)
    case '重度减退': return (Math.random() * 0.3 + 0.5).toFixed(2)
    default: return '2.00'
  }
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 生成患者进展详情数据
export function generatePatientProgressDetail(patient: Patient): PatientProgressDetail {
  return {
    basicInfo: {
      姓名: patient.name,
      性别: patient.gender,
      年龄: patient.age,
      病历号: patient.medicalRecordNo,
      糖尿病类型: patient.diabetesType,
      病程: patient.diseaseDuration,
      所属分层: patient.category,
      并发症类型: patient.complicationType,
      胰岛功能: patient.pancreaticFunction,
      最近C肽: patient.cPeptideLevel + ' ng/mL',
      最近检查日期: patient.lastCheckDate,
    },
    complicationTimeline: generateTimeline(patient),
    cPeptideTrend: generateCPeptideTrend(patient.cPeptideLevel),
    examinationResults: generateExaminationResults(patient),
    followUpRecords: generateFollowUpRecords(),
  }
}

function generateTimeline(patient: Patient): ComplicationTimelineEvent[] {
  const events: ComplicationTimelineEvent[] = []
  const baseDate = new Date('2026-03-28')
  const complication = patient.complicationType

  if (complication !== '无并发症') {
    const complications = getComplicationList(complication)
    complications.forEach((comp, idx) => {
      const date = new Date(baseDate)
      date.setMonth(date.getMonth() - (idx * 8 + Math.floor(Math.random() * 6)))
      events.push({
        date: formatDate(date),
        title: `${comp} - ${idx === 0 ? '确诊' : '新发'}`,
        content: `检查发现${comp}早期表现，启动专项管理`,
        type: 'new',
      })
      const progressDate = new Date(date)
      progressDate.setMonth(progressDate.getMonth() + 6)
      if (progressDate < baseDate) {
        events.push({
          date: formatDate(progressDate),
          title: `${comp} - 进展`,
          content: `${comp}由早期进展至中期，需加强干预`,
          type: 'progress',
        })
      }
    })
  } else {
    const date = new Date(baseDate)
    date.setMonth(date.getMonth() - 6)
    events.push({
      date: formatDate(date),
      title: '并发症筛查',
      content: '糖尿病肾病、视网膜、神经病变筛查均未见异常',
      type: 'stable',
    })
  }

  return events.sort((a, b) => b.date.localeCompare(a.date))
}

function getComplicationList(type: ComplicationType): string[] {
  switch (type) {
    case '微血管并发症': return ['糖尿病肾病', '视网膜病变']
    case '大血管并发症': return ['冠心病']
    case '多并发症合并': return ['糖尿病肾病', '冠心病', '周围神经病变']
    default: return []
  }
}

function generateCPeptideTrend(latestCPeptide: string): { months: string[]; values: string[]; baseline: number } {
  const latest = parseFloat(latestCPeptide)
  const baseline = +(latest * 1.8 + Math.random() * 0.5).toFixed(2)
  const months = ['2024-04', '2024-07', '2024-10', '2025-01', '2025-04', '2025-07', '2025-10', '2026-01', '2026-03']
  const values: string[] = []

  months.forEach((_, i) => {
    const progress = i / (months.length - 1)
    const value = baseline - progress * (baseline - latest) + (Math.random() - 0.5) * 0.15
    values.push(Math.max(0.3, value).toFixed(2))
  })

  return { months, values, baseline }
}

function generateExaminationResults(patient: Patient): ExaminationResult[] {
  const results: ExaminationResult[] = []
  const baseDate = new Date('2026-03-28')

  const items = [
    { name: '尿微量白蛋白/肌酐', current: '3.8', last: '2.5', risk: '中进展风险' as ProgressRiskLevel },
    { name: 'eGFR', current: '78', last: '85', risk: '中进展风险' as ProgressRiskLevel },
    { name: '眼底照相', current: '微血管瘤+出血点', last: '少量微血管瘤', risk: '高进展风险' as ProgressRiskLevel },
    { name: '肌电图', current: '感觉神经传导速度下降', last: '正常', risk: '中进展风险' as ProgressRiskLevel },
    { name: '颈动脉超声', current: 'IMT 1.2mm 斑块', last: 'IMT 0.9mm', risk: '高进展风险' as ProgressRiskLevel },
    { name: 'C肽(空腹)', current: patient.cPeptideLevel, last: (parseFloat(patient.cPeptideLevel) + 0.3).toFixed(2), risk: '低进展风险' as ProgressRiskLevel },
    { name: 'C肽(餐后2h)', current: (parseFloat(patient.cPeptideLevel) * 2.5).toFixed(2), last: (parseFloat(patient.cPeptideLevel) * 2.8).toFixed(2), risk: '中进展风险' as ProgressRiskLevel },
    { name: '糖化血红蛋白', current: '7.8', last: '7.5', risk: '低进展风险' as ProgressRiskLevel },
  ]

  items.forEach((item) => {
    const date = new Date(baseDate)
    date.setDate(date.getDate() - Math.floor(Math.random() * 30))
    const trend = parseFloat(item.current) < parseFloat(item.last) ? '↓' : '↑'
    results.push({
      检查项目: item.name,
      检查日期: formatDate(date),
      本次结果: item.current,
      上次结果: item.last,
      变化趋势: trend,
      异常等级: item.risk,
    })
  })

  return results
}

function generateFollowUpRecords(): ProgressFollowUpRecord[] {
  const records: ProgressFollowUpRecord[] = []
  const baseDate = new Date('2026-03-28')
  const conclusions = [
    '并发症进展稳定，建议继续当前方案',
    'C肽水平持续下降，建议评估胰岛素启动指征',
    '糖尿病肾病进展，需调整ACEI/ARB用量',
    '视网膜病变稳定，建议定期眼底复查',
    '周围神经病变有进展，加用甲钴胺治疗',
    '胰岛功能进一步减退，启动胰岛素治疗',
    '并发症筛查未见新发异常，继续维持',
    '肾功能波动，需密切监测肌酐变化',
    '血糖控制尚可，并发症进展风险可控',
    '颈动脉斑块有进展，加强他汀类药物治疗',
  ]
  const suggestions = [
    '继续当前治疗方案，3个月后复查',
    '启动基础胰岛素，监测低血糖',
    '增加复查频率，每月检测肾功能',
    '转诊眼科，完善眼底血管造影',
    '加用营养神经药物，定期肌电图随访',
    '调整为胰岛素方案，加强血糖监测',
    '维持当前方案，半年后全面复查',
    '严格控制血压，暂停肾毒性药物',
    '加强生活方式管理，控制体重',
    '强化他汀治疗，评估颈动脉支架指征',
  ]
  const doctors = ['张明', '李华', '王芳', '刘伟', '陈静']

  for (let i = 0; i < 10; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() - i * 28 - Math.floor(Math.random() * 7))

    records.push({
      随访日期: formatDate(date),
      随访医生: doctors[i % doctors.length],
      进展评估结论: conclusions[i],
      治疗调整建议: suggestions[i],
    })
  }

  return records
}
