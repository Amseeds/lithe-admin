import type {
  Patient,
  PatientCategory,
  EfficacyLevel,
  OverallStatus,
} from './types'

// 患者分层
export const patientCategories: PatientCategory[] = [
  '年轻低危',
  '老年衰弱',
  '肾功能不全',
  '妊娠期',
  '手术期',
  '心血管高危',
]

// 患者分层名称映射
export const categoryNames: Record<PatientCategory, string> = {
  年轻低危: '年轻低危',
  老年衰弱: '老年衰弱',
  肾功能不全: '肾功能不全',
  妊娠期: '妊娠期',
  手术期: '手术期',
  心血管高危: '心血管高危',
}

// 糖尿病类型
export const diabetesTypes = [
  '1型糖尿病',
  '2型糖尿病',
  '妊娠糖尿病',
  '特殊类型糖尿病',
]

// 医生姓名列表
export const doctorNames = [
  '张明',
  '李华',
  '王芳',
  '刘伟',
  '陈静',
  '杨洋',
  '赵敏',
  '周杰',
  '吴婷',
  '孙强',
]

// 患者姓名列表
export const patientNames = [
  '王磊',
  '李梅',
  '张伟',
  '刘芳',
  '陈明',
  '杨丽',
  '黄强',
  '周敏',
  '吴浩',
  '郑红',
  '孙杰',
  '马丽',
  '朱刚',
  '胡萍',
  '林峰',
  '何静',
  '高建',
  '罗燕',
  '徐鹏',
  '余婷',
  '许刚',
  '沈芳',
  '韩磊',
  '邓梅',
  '蒋伟',
  '姜丽',
  '熊强',
  '唐敏',
  '钱华',
  '汤磊',
]

// 综合疗效评级
export const efficacyLevels: EfficacyLevel[] = [
  '优秀达标',
  '稳定达标',
  '部分达标',
  '未达标',
  '高风险异常',
]

// 整体达标情况
export const overallStatuses: OverallStatus[] = ['达标', '未达标', '部分达标']

// 生成200患者的基础数据
export function generatePatients(): Patient[] {
  const patients: Patient[] = []
  const baseDate = new Date('2026-03-28')

  // 疗效分布：优秀40人、稳定60人、部分50人、未达标35人、高风险15人
  const efficacyDistribution: { level: EfficacyLevel; count: number; statuses: OverallStatus[] }[] = [
    { level: '优秀达标', count: 40, statuses: ['达标'] },
    { level: '稳定达标', count: 60, statuses: ['达标'] },
    { level: '部分达标', count: 50, statuses: ['部分达标'] },
    { level: '未达标', count: 35, statuses: ['未达标'] },
    { level: '高风险异常', count: 15, statuses: ['未达标'] },
  ]

  let id = 1

  efficacyDistribution.forEach((group) => {
    for (let i = 0; i < group.count; i++) {
      const categoryIndex = Math.floor(Math.random() * patientCategories.length)
      const category = patientCategories[categoryIndex]
      const name = patientNames[Math.floor(Math.random() * patientNames.length)]
      const age = getAgeByCategory(category)
      const hba1c = getHba1cByEfficacy(group.level)
      const followUpDays = Math.floor(Math.random() * 118) // 2025-12-01 to 2026-03-28

      const followUpDate = new Date(baseDate)
      followUpDate.setDate(followUpDate.getDate() - followUpDays)

      patients.push({
        id,
        name: `${name}${i > 0 ? i : ''}`,
        medicalRecordNo: `2026${String(id).padStart(5, '0')}`,
        age,
        gender: Math.random() > 0.5 ? '男' : '女',
        category,
        categoryName: categoryNames[category],
        diabetesType: getDiabetesType(category),
        diseaseDuration: getDiseaseDuration(age),
        latestHba1c: hba1c,
        efficacyLevel: group.level,
        overallStatus: group.statuses[0],
        lastFollowUpDate: formatDate(followUpDate),
        mainDoctor: doctorNames[Math.floor(Math.random() * doctorNames.length)],
      })
      id++
    }
  })

  return patients
}

// 根据分层获取年龄
function getAgeByCategory(category: PatientCategory): number {
  switch (category) {
    case '年轻低危':
      return Math.floor(Math.random() * 15) + 25 // 25-40
    case '老年衰弱':
      return Math.floor(Math.random() * 10) + 70 // 70-80
    case '肾功能不全':
      return Math.floor(Math.random() * 15) + 50 // 50-65
    case '妊娠期':
      return Math.floor(Math.random() * 10) + 25 // 25-35
    case '手术期':
      return Math.floor(Math.random() * 20) + 45 // 45-65
    case '心血管高危':
      return Math.floor(Math.random() * 15) + 55 // 55-70
    default:
      return 50
  }
}

// 根据疗效等级获取HbA1c值
function getHba1cByEfficacy(level: EfficacyLevel): string {
  switch (level) {
    case '优秀达标':
      return (Math.random() * 1.2 + 5.0).toFixed(1) // 5.0-6.2
    case '稳定达标':
      return (Math.random() * 1.5 + 6.0).toFixed(1) // 6.0-7.5
    case '部分达标':
      return (Math.random() * 1.5 + 7.0).toFixed(1) // 7.0-8.5
    case '未达标':
      return (Math.random() * 1.5 + 8.5).toFixed(1) // 8.5-10.0
    case '高风险异常':
      return (Math.random() * 1.0 + 9.5).toFixed(1) // 9.5-11.0
    default:
      return '7.0'
  }
}

// 根据分层获取糖尿病类型
function getDiabetesType(category: PatientCategory): string {
  switch (category) {
    case '妊娠期':
      return '妊娠糖尿病'
    case '年轻低危':
      return Math.random() > 0.3 ? '2型糖尿病' : '1型糖尿病'
    case '肾功能不全':
    case '心血管高危':
      return '2型糖尿病'
    default:
      return '2型糖尿病'
  }
}

// 获取病程
function getDiseaseDuration(age: number): string {
  const duration = Math.floor((age - 25) / 5) + Math.floor(Math.random() * 5)
  return `${Math.max(1, duration)}年`
}

// 格式化日期
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 导出200患者数据
export const patients200 = generatePatients()
