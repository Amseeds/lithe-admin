// ==================== 三级菜单结构定义 ====================
// 菜单树形结构
export interface MenuCategory {
  key: string
  name: string
  children?: MenuCategory[]
}

// 叶子节点分类定义
export interface CategoryDefinition {
  key: string
  name: string
  parentPath: string[] // 面包屑路径
  definition: string
  targets: Array<{ name: string; value: string }>
}

// 分类统计数据
export interface CategoryStatistics {
  total: number
  controlled: number
  uncontrolled: number
  hypoglycemiaRisk: number
  rate: string
  proportion: string
}

// 患者数据
export interface PatientData {
  id: number
  name: string
  medicalRecordNo: string
  age: number
  gender: string
  category: string
  categoryName: string
  diabetesType: string
  diseaseCourse: string
  hba1c: string
  fastingStatus: '达标' | '未达标'
  targetStatus: '生效中' | '已过期'
}

// 患者详情
export interface PatientDetail {
  name: string
  gender: string
  age: number
  medicalRecordNo: string
  diabetesType: string
  diseaseCourse: string
  category: string
  categoryName: string
  latestHba1c: string
  bloodGlucoseData: {
    dates: string[]
    fasting: number[]
    postprandial: number[]
    targetMin: number
    targetMax: number
  }
  hba1cHistory: Array<{
    date: string
    result: string
    isControlled: string
    note: string
  }>
  targetAdjustHistory: Array<{
    date: string
    beforeTarget: string
    afterTarget: string
    reason: string
    doctor: string
  }>
}

// ==================== 三级菜单配置 ====================
export const menuCategories: MenuCategory[] = [
  {
    key: 'overview',
    name: '模块总览',
  },
  {
    key: 't2dm',
    name: '2型糖尿病（T2DM）',
    children: [
      { key: 't2dm-adult', name: '普通成人' },
      { key: 't2dm-elderly-healthy', name: '老年健康型' },
      { key: 't2dm-elderly-impaired', name: '老年功能受损型' },
      { key: 't2dm-elderly-frail', name: '老年衰弱型' },
      { key: 't2dm-children', name: '儿童青少年' },
      { key: 't2dm-cardiorenal', name: '合并心肾并发症' },
      // { key: 't2dm-microvascular', name: '合并微血管并发症' },
      // { key: 't2dm-obesity', name: '肥胖/代谢综合征' },
    ],
  },
  // TODO: 后续添加其他分类
  // {
  //   key: 't1dm',
  //   name: '1型糖尿病（T1DM）',
  //   children: [...]
  // },
]

// ==================== 叶子节点分类定义 ====================
export const categoryDefinitions: Record<string, CategoryDefinition> = {
  // 2型糖尿病分类
  't2dm-adult': {
    key: 't2dm-adult',
    name: '普通成人T2DM标准目标',
    parentPath: ['2型糖尿病（T2DM）'],
    definition:
      '年龄18-64岁，新诊断或病程较短（<10年），无严重并发症，无低血糖风险，肝肾功能正常的2型糖尿病患者',
    targets: [
      { name: 'HbA1c', value: '<7.0%' },
      { name: '空腹血糖', value: '4.4~7.0 mmol/L' },
      { name: '餐后2小时血糖', value: '<10.0 mmol/L' },
      { name: '血压', value: '<130/80 mmHg' },
    ],
  },
  't2dm-elderly-healthy': {
    key: 't2dm-elderly-healthy',
    name: '老年健康型T2DM',
    parentPath: ['2型糖尿病（T2DM）'],
    definition:
      '年龄≥65岁，认知功能完好，功能状态独立，预期寿命较长，无严重并发症的老年2型糖尿病患者',
    targets: [
      { name: 'HbA1c', value: '<7.5%' },
      { name: '空腹血糖', value: '5.0~7.5 mmol/L' },
      { name: '餐后2小时血糖', value: '<10.0 mmol/L' },
    ],
  },
  't2dm-elderly-impaired': {
    key: 't2dm-elderly-impaired',
    name: '老年功能受损型T2DM',
    parentPath: ['2型糖尿病（T2DM）'],
    definition:
      '年龄≥65岁，存在轻度认知障碍或功能依赖，合并多种慢性疾病，预期寿命中等的老年2型糖尿病患者',
    targets: [
      { name: 'HbA1c', value: '<8.0%' },
      { name: '空腹血糖', value: '5.5~8.5 mmol/L' },
      { name: '餐后2小时血糖', value: '<11.1 mmol/L' },
    ],
  },
  't2dm-elderly-frail': {
    key: 't2dm-elderly-frail',
    name: '老年衰弱型T2DM',
    parentPath: ['2型糖尿病（T2DM）'],
    definition:
      '年龄≥65岁，明显衰弱状态，中重度认知障碍，生活不能自理，反复低血糖发作，预期寿命有限的老年2型糖尿病患者',
    targets: [
      { name: 'HbA1c', value: '<8.5%' },
      { name: '空腹血糖', value: '5.5~10.0 mmol/L' },
      { name: '餐后2小时血糖', value: '<13.9 mmol/L' },
      { name: '优先目标', value: '避免低血糖' },
    ],
  },
  't2dm-children': {
    key: 't2dm-children',
    name: '儿童青少年T2DM',
    parentPath: ['2型糖尿病（T2DM）'],
    definition: '年龄<18岁，诊断2型糖尿病的儿童和青少年患者，需兼顾生长发育和血糖控制',
    targets: [
      { name: 'HbA1c', value: '<6.5%' },
      { name: '空腹血糖', value: '4.4~6.1 mmol/L' },
      { name: '餐后2小时血糖', value: '<7.8 mmol/L' },
      { name: '特别注意', value: '避免低血糖影响发育' },
    ],
  },
  't2dm-cardiorenal': {
    key: 't2dm-cardiorenal',
    name: '合并心肾并发症T2DM',
    parentPath: ['2型糖尿病（T2DM）'],
    definition:
      '合并冠心病、心力衰竭、脑卒中、慢性肾脏病（CKD 3期及以上）等心肾并发症的2型糖尿病患者',
    targets: [
      { name: 'HbA1c', value: '<7.0~8.0%' },
      { name: '空腹血糖', value: '5.0~7.5 mmol/L' },
      { name: '餐后2小时血糖', value: '<10.0 mmol/L' },
      { name: '血压目标', value: '<130/80 mmHg' },
      { name: '优先规避', value: '低血糖风险' },
    ],
  },
}

// ==================== 分类统计数据 ====================
export const categoryStatistics: Record<string, CategoryStatistics> = {
  't2dm-adult': {
    total: 52,
    controlled: 38,
    uncontrolled: 14,
    hypoglycemiaRisk: 4,
    rate: '73%',
    proportion: '26.0%',
  },
  't2dm-elderly-healthy': {
    total: 28,
    controlled: 20,
    uncontrolled: 8,
    hypoglycemiaRisk: 3,
    rate: '71%',
    proportion: '14.0%',
  },
  't2dm-elderly-impaired': {
    total: 22,
    controlled: 12,
    uncontrolled: 10,
    hypoglycemiaRisk: 6,
    rate: '55%',
    proportion: '11.0%',
  },
  't2dm-elderly-frail': {
    total: 18,
    controlled: 8,
    uncontrolled: 10,
    hypoglycemiaRisk: 8,
    rate: '44%',
    proportion: '9.0%',
  },
  't2dm-children': {
    total: 12,
    controlled: 9,
    uncontrolled: 3,
    hypoglycemiaRisk: 2,
    rate: '75%',
    proportion: '6.0%',
  },
  't2dm-cardiorenal': {
    total: 38,
    controlled: 22,
    uncontrolled: 16,
    hypoglycemiaRisk: 10,
    rate: '58%',
    proportion: '19.0%',
  },
}

// ==================== HbA1c分布数据（总览用）====================
export const hba1cDistribution = [
  { name: '<7.0%（达标）', value: 98, color: '#10b981' },
  { name: '7.0%-10.0%（未达标）', value: 68, color: '#f59e0b' },
  { name: '>10.0%（严重未达标）', value: 34, color: '#ef4444' },
]

// ==================== 通用控糖指标卡片数据（总览用）====================
export const generalIndicatorCards = [
  {
    title: '糖化血红蛋白（HbA1c）',
    target: '<7.0%',
    average: '7.2%',
    rate: '49%',
  },
  {
    title: '空腹血糖',
    target: '4.4~7.0 mmol/L',
    average: '6.8 mmol/L',
    rate: '58%',
  },
  {
    title: '餐后2小时血糖',
    target: '<10.0 mmol/L',
    average: '9.2 mmol/L',
    rate: '55%',
  },
  {
    title: '整体达标率',
    target: '',
    average: '98人',
    rate: '49%',
    change: '+2.3%',
  },
]

// ==================== 患者列表数据 ====================
export const patientList: PatientData[] = [
  // T2DM 普通成人
  {
    id: 1,
    name: '张伟',
    medicalRecordNo: '2026001234',
    age: 42,
    gender: '男',
    category: 't2dm-adult',
    categoryName: '普通成人T2DM',
    diabetesType: '2型糖尿病',
    diseaseCourse: '5年',
    hba1c: '6.8%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },
  {
    id: 2,
    name: '李明',
    medicalRecordNo: '2026001235',
    age: 38,
    gender: '男',
    category: 't2dm-adult',
    categoryName: '普通成人T2DM',
    diabetesType: '2型糖尿病',
    diseaseCourse: '3年',
    hba1c: '6.5%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },
  {
    id: 3,
    name: '王芳',
    medicalRecordNo: '2026001236',
    age: 45,
    gender: '女',
    category: 't2dm-adult',
    categoryName: '普通成人T2DM',
    diabetesType: '2型糖尿病',
    diseaseCourse: '8年',
    hba1c: '7.2%',
    fastingStatus: '未达标',
    targetStatus: '生效中',
  },
  {
    id: 4,
    name: '赵强',
    medicalRecordNo: '2026001237',
    age: 35,
    gender: '男',
    category: 't2dm-adult',
    categoryName: '普通成人T2DM',
    diabetesType: '2型糖尿病',
    diseaseCourse: '2年',
    hba1c: '6.3%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },
  {
    id: 5,
    name: '陈静',
    medicalRecordNo: '2026001238',
    age: 50,
    gender: '女',
    category: 't2dm-adult',
    categoryName: '普通成人T2DM',
    diabetesType: '2型糖尿病',
    diseaseCourse: '10年',
    hba1c: '7.5%',
    fastingStatus: '未达标',
    targetStatus: '已过期',
  },

  // T2DM 老年健康型
  {
    id: 6,
    name: '刘大爷',
    medicalRecordNo: '2026001240',
    age: 68,
    gender: '男',
    category: 't2dm-elderly-healthy',
    categoryName: '老年健康型T2DM',
    diabetesType: '2型糖尿病',
    diseaseCourse: '12年',
    hba1c: '7.2%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },
  {
    id: 7,
    name: '孙奶奶',
    medicalRecordNo: '2026001241',
    age: 70,
    gender: '女',
    category: 't2dm-elderly-healthy',
    categoryName: '老年健康型T2DM',
    diabetesType: '2型糖尿病',
    diseaseCourse: '8年',
    hba1c: '7.4%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },
  {
    id: 8,
    name: '周大爷',
    medicalRecordNo: '2026001242',
    age: 72,
    gender: '男',
    category: 't2dm-elderly-healthy',
    categoryName: '老年健康型T2DM',
    diabetesType: '2型糖尿病',
    diseaseCourse: '15年',
    hba1c: '7.8%',
    fastingStatus: '未达标',
    targetStatus: '生效中',
  },

  // T2DM 老年功能受损型
  {
    id: 9,
    name: '吴老太',
    medicalRecordNo: '2026001250',
    age: 75,
    gender: '女',
    category: 't2dm-elderly-impaired',
    categoryName: '老年功能受损型T2DM',
    diabetesType: '2型糖尿病',
    diseaseCourse: '18年',
    hba1c: '7.8%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },
  {
    id: 10,
    name: '郑大爷',
    medicalRecordNo: '2026001251',
    age: 78,
    gender: '男',
    category: 't2dm-elderly-impaired',
    categoryName: '老年功能受损型T2DM',
    diabetesType: '2型糖尿病',
    diseaseCourse: '20年',
    hba1c: '8.2%',
    fastingStatus: '未达标',
    targetStatus: '已过期',
  },
  {
    id: 11,
    name: '王老太',
    medicalRecordNo: '2026001252',
    age: 76,
    gender: '女',
    category: 't2dm-elderly-impaired',
    categoryName: '老年功能受损型T2DM',
    diabetesType: '2型糖尿病',
    diseaseCourse: '16年',
    hba1c: '8.0%',
    fastingStatus: '未达标',
    targetStatus: '生效中',
  },

  // T2DM 老年衰弱型
  {
    id: 12,
    name: '李奶奶',
    medicalRecordNo: '2026001260',
    age: 82,
    gender: '女',
    category: 't2dm-elderly-frail',
    categoryName: '老年衰弱型T2DM',
    diabetesType: '2型糖尿病',
    diseaseCourse: '25年',
    hba1c: '8.3%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },
  {
    id: 13,
    name: '张大爷',
    medicalRecordNo: '2026001261',
    age: 85,
    gender: '男',
    category: 't2dm-elderly-frail',
    categoryName: '老年衰弱型T2DM',
    diabetesType: '2型糖尿病',
    diseaseCourse: '30年',
    hba1c: '8.8%',
    fastingStatus: '未达标',
    targetStatus: '生效中',
  },

  // T2DM 儿童青少年
  {
    id: 14,
    name: '小明',
    medicalRecordNo: '2026001270',
    age: 14,
    gender: '男',
    category: 't2dm-children',
    categoryName: '儿童青少年T2DM',
    diabetesType: '2型糖尿病',
    diseaseCourse: '2年',
    hba1c: '6.2%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },
  {
    id: 15,
    name: '小红',
    medicalRecordNo: '2026001271',
    age: 16,
    gender: '女',
    category: 't2dm-children',
    categoryName: '儿童青少年T2DM',
    diabetesType: '2型糖尿病',
    diseaseCourse: '3年',
    hba1c: '6.5%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },
  {
    id: 16,
    name: '小刚',
    medicalRecordNo: '2026001272',
    age: 12,
    gender: '男',
    category: 't2dm-children',
    categoryName: '儿童青少年T2DM',
    diabetesType: '2型糖尿病',
    diseaseCourse: '1年',
    hba1c: '6.8%',
    fastingStatus: '未达标',
    targetStatus: '生效中',
  },

  // T2DM 合并心肾并发症
  {
    id: 17,
    name: '陈先生',
    medicalRecordNo: '2026001280',
    age: 58,
    gender: '男',
    category: 't2dm-cardiorenal',
    categoryName: '合并心肾并发症T2DM',
    diabetesType: '2型糖尿病',
    diseaseCourse: '15年',
    hba1c: '7.5%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },
  {
    id: 18,
    name: '刘女士',
    medicalRecordNo: '2026001281',
    age: 62,
    gender: '女',
    category: 't2dm-cardiorenal',
    categoryName: '合并心肾并发症T2DM',
    diabetesType: '2型糖尿病',
    diseaseCourse: '18年',
    hba1c: '7.8%',
    fastingStatus: '未达标',
    targetStatus: '生效中',
  },
  {
    id: 19,
    name: '王先生',
    medicalRecordNo: '2026001282',
    age: 65,
    gender: '男',
    category: 't2dm-cardiorenal',
    categoryName: '合并心肾并发症T2DM',
    diabetesType: '2型糖尿病',
    diseaseCourse: '20年',
    hba1c: '8.2%',
    fastingStatus: '未达标',
    targetStatus: '已过期',
  },
  {
    id: 20,
    name: '赵女士',
    medicalRecordNo: '2026001283',
    age: 55,
    gender: '女',
    category: 't2dm-cardiorenal',
    categoryName: '合并心肾并发症T2DM',
    diabetesType: '2型糖尿病',
    diseaseCourse: '12年',
    hba1c: '7.2%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },
]

// ==================== 患者详情数据 ====================
export const patientDetails: Record<number, PatientDetail> = {
  1: {
    name: '张伟',
    gender: '男',
    age: 42,
    medicalRecordNo: '2026001234',
    diabetesType: '2型糖尿病',
    diseaseCourse: '5年',
    category: 't2dm-adult',
    categoryName: '普通成人T2DM',
    latestHba1c: '6.8%',
    bloodGlucoseData: {
      dates: [
        '03-14',
        '03-15',
        '03-16',
        '03-17',
        '03-18',
        '03-19',
        '03-20',
        '03-21',
        '03-22',
        '03-23',
        '03-24',
        '03-25',
        '03-26',
        '03-27',
      ],
      fasting: [5.8, 6.2, 5.5, 6.0, 5.9, 6.1, 5.7, 6.3, 5.6, 6.0, 5.8, 6.2, 5.9, 6.1],
      postprandial: [7.2, 7.8, 6.9, 7.5, 7.1, 7.6, 7.0, 7.8, 6.8, 7.4, 7.2, 7.7, 7.0, 7.5],
      targetMin: 4.4,
      targetMax: 7.0,
    },
    hba1cHistory: [
      { date: '2026-03-15', result: '6.8%', isControlled: '达标', note: '血糖控制良好' },
      { date: '2026-02-10', result: '6.5%', isControlled: '达标', note: '继续保持' },
      { date: '2026-01-08', result: '6.8%', isControlled: '达标', note: '略有改善' },
      { date: '2025-12-05', result: '7.1%', isControlled: '未达标', note: '需加强饮食控制' },
    ],
    targetAdjustHistory: [
      {
        date: '2026-01-15',
        beforeTarget: 'HbA1c<7.0%',
        afterTarget: 'HbA1c<6.5%',
        reason: '血糖控制良好，提高目标',
        doctor: '王医生',
      },
    ],
  },
  6: {
    name: '刘大爷',
    gender: '男',
    age: 68,
    medicalRecordNo: '2026001240',
    diabetesType: '2型糖尿病',
    diseaseCourse: '12年',
    category: 't2dm-elderly-healthy',
    categoryName: '老年健康型T2DM',
    latestHba1c: '7.2%',
    bloodGlucoseData: {
      dates: [
        '03-14',
        '03-15',
        '03-16',
        '03-17',
        '03-18',
        '03-19',
        '03-20',
        '03-21',
        '03-22',
        '03-23',
        '03-24',
        '03-25',
        '03-26',
        '03-27',
      ],
      fasting: [6.5, 6.8, 7.0, 6.6, 7.2, 6.9, 7.1, 6.8, 7.0, 6.5, 7.3, 6.8, 7.1, 6.9],
      postprandial: [8.5, 9.0, 8.8, 9.2, 8.6, 9.1, 8.9, 9.3, 8.7, 9.0, 9.2, 8.8, 9.1, 8.9],
      targetMin: 5.0,
      targetMax: 7.5,
    },
    hba1cHistory: [
      { date: '2026-03-15', result: '7.2%', isControlled: '达标', note: '控制良好' },
      { date: '2026-02-10', result: '7.4%', isControlled: '达标', note: '稳定' },
      { date: '2026-01-08', result: '7.6%', isControlled: '达标', note: '临界值' },
    ],
    targetAdjustHistory: [
      {
        date: '2025-09-15',
        beforeTarget: 'HbA1c<8.0%',
        afterTarget: 'HbA1c<7.5%',
        reason: '身体状况良好，收紧目标',
        doctor: '李医生',
      },
    ],
  },
}

// 为其他患者生成默认详情数据
const generateDefaultPatientDetail = (patient: PatientData): PatientDetail => {
  const categoryDef = categoryDefinitions[patient.category]
  const targets = categoryDef?.targets || []
  const fastingTarget = targets.find((t) => t.name.includes('空腹'))
  let targetMin = 4.4
  let targetMax = 7.0
  if (fastingTarget?.value) {
    const match = fastingTarget.value.match(/(\d+\.?\d*)~(\d+\.?\d*)/)
    if (match) {
      targetMin = parseFloat(match[1])
      targetMax = parseFloat(match[2])
    }
  }

  return {
    name: patient.name,
    gender: patient.gender,
    age: patient.age,
    medicalRecordNo: patient.medicalRecordNo,
    diabetesType: patient.diabetesType,
    diseaseCourse: patient.diseaseCourse,
    category: patient.category,
    categoryName: patient.categoryName,
    latestHba1c: patient.hba1c,
    bloodGlucoseData: {
      dates: [
        '03-14',
        '03-15',
        '03-16',
        '03-17',
        '03-18',
        '03-19',
        '03-20',
        '03-21',
        '03-22',
        '03-23',
        '03-24',
        '03-25',
        '03-26',
        '03-27',
      ],
      fasting: Array(14)
        .fill(0)
        .map(() => targetMin + Math.random() * (targetMax - targetMin)),
      postprandial: Array(14)
        .fill(0)
        .map(() => targetMax + Math.random() * 2),
      targetMin,
      targetMax,
    },
    hba1cHistory: [
      {
        date: '2026-03-15',
        result: patient.hba1c,
        isControlled: patient.fastingStatus === '达标' ? '达标' : '未达标',
        note: '常规检查',
      },
    ],
    targetAdjustHistory: [
      {
        date: '2026-01-10',
        beforeTarget: '初始目标',
        afterTarget: categoryDef?.targets.map((t) => `${t.name}${t.value}`).join('、') || '',
        reason: '首次设定',
        doctor: '主治医师',
      },
    ],
  }
}

// 补充其他患者的详情数据
patientList.forEach((patient) => {
  if (!patientDetails[patient.id]) {
    patientDetails[patient.id] = generateDefaultPatientDetail(patient)
  }
})

// ==================== 辅助函数 ====================

// 获取所有叶子节点的 key
export const getLeafKeys = (categories: MenuCategory[]): string[] => {
  const keys: string[] = []
  const traverse = (items: MenuCategory[]) => {
    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        traverse(item.children)
      } else if (item.key !== 'overview') {
        keys.push(item.key)
      }
    })
  }
  traverse(categories)
  return keys
}

// 判断是否为叶子节点
export const isLeafNode = (key: string, categories: MenuCategory[]): boolean => {
  const findNode = (items: MenuCategory[]): MenuCategory | null => {
    for (const item of items) {
      if (item.key === key) return item
      if (item.children) {
        const found = findNode(item.children)
        if (found) return found
      }
    }
    return null
  }
  const node = findNode(categories)
  return node !== null && (!node.children || node.children.length === 0)
}

// 生成患者分类饼图数据
export const getPatientCategoryPieData = () => {
  const leafKeys = getLeafKeys(menuCategories)
  return leafKeys
    .map((key) => {
      const stats = categoryStatistics[key]
      const def = categoryDefinitions[key]
      return {
        name: def?.name || key,
        value: stats?.total || 0,
      }
    })
    .filter((item) => item.value > 0)
}

// 获取分类名称
export const getCategoryName = (key: string): string => {
  const findName = (items: MenuCategory[]): string => {
    for (const item of items) {
      if (item.key === key) return item.name
      if (item.children) {
        const name = findName(item.children)
        if (name) return name
      }
    }
    return ''
  }
  return findName(menuCategories)
}
