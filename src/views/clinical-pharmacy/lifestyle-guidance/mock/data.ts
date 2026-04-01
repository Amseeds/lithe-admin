import type {
  LifestylePlan,
  PlanDetail,
  StatCard,
  UnplannedPatient,
  LowExecutionPatient,
  ExecutionRecord,
  FollowUpRecord,
  GuidanceItem,
  BarChartData,
  PieChartData,
} from './types'

// ============================================================
// 公共基础数据
// ============================================================

export const stratificationList = ['年轻低危', '老年衰弱', '肾功能不全', '妊娠期', '手术期', '心血管高危'] as const

export const planStatusMap: Record<string, string> = {
  not_created: '未制定',
  created: '已制定',
  archived: '已归档',
  expired: '已过期',
}

export const executionLevelMap: Record<string, string> = {
  high: '高（≥80%）',
  medium: '中（50%~79%）',
  low: '低（＜50%）',
}

// ============================================================
// 4张核心统计卡片
// ============================================================
export const statCards: StatCard[] = [
  { title: '方案覆盖总人数', value: 76, change: '+5', changeType: 'increase' },
  { title: '本月新建方案数', value: 12, change: '+3', changeType: 'increase' },
  { title: '方案平均执行率', value: '72.5%', change: '+2.1%', changeType: 'increase' },
  { title: '未制定方案患者数', value: 24, change: '-2', changeType: 'decrease' },
]

// ============================================================
// Tab1: 柱状图数据 - 不同分层方案覆盖
// ============================================================
export const barChartData: BarChartData[] = [
  { category: '年轻低危', total: 18, planned: 16 },
  { category: '老年衰弱', total: 22, planned: 17 },
  { category: '肾功能不全', total: 15, planned: 12 },
  { category: '妊娠期', total: 8, planned: 7 },
  { category: '手术期', total: 5, planned: 4 },
  { category: '心血管高危', total: 20, planned: 14 },
]

// ============================================================
// Tab1: 饼图数据 - 执行率分布
// ============================================================
export const pieChartData: PieChartData[] = [
  { name: '高（≥80%）', value: 28 },
  { name: '中（50%~79%）', value: 34 },
  { name: '低（＜50%）', value: 14 },
]

// ============================================================
// Tab1: 未制定方案患者列表（15人）
// ============================================================
export const unplannedPatients: UnplannedPatient[] = [
  { patientName: '周建华', medicalRecordNo: 'P20240035', stratification: '年轻低危', age: 38, gender: '男' },
  { patientName: '刘美玲', medicalRecordNo: 'P20240052', stratification: '老年衰弱', age: 72, gender: '女' },
  { patientName: '赵志刚', medicalRecordNo: 'P20240068', stratification: '肾功能不全', age: 55, gender: '男' },
  { patientName: '孙晓燕', medicalRecordNo: 'P20240073', stratification: '心血管高危', age: 61, gender: '女' },
  { patientName: '吴国庆', medicalRecordNo: 'P20240081', stratification: '老年衰弱', age: 78, gender: '男' },
  { patientName: '陈丽萍', medicalRecordNo: 'P20240089', stratification: '年轻低危', age: 42, gender: '女' },
  { patientName: '张明辉', medicalRecordNo: 'P20240093', stratification: '手术期', age: 58, gender: '男' },
  { patientName: '李秀芳', medicalRecordNo: 'P20240097', stratification: '肾功能不全', age: 63, gender: '女' },
  { patientName: '王德才', medicalRecordNo: 'P20240102', stratification: '心血管高危', age: 66, gender: '男' },
  { patientName: '杨秋月', medicalRecordNo: 'P20240108', stratification: '老年衰弱', age: 75, gender: '女' },
  { patientName: '黄伟杰', medicalRecordNo: 'P20240115', stratification: '年轻低危', age: 35, gender: '男' },
  { patientName: '郑淑华', medicalRecordNo: 'P20240121', stratification: '妊娠期', age: 31, gender: '女' },
  { patientName: '马长顺', medicalRecordNo: 'P20240128', stratification: '肾功能不全', age: 59, gender: '男' },
  { patientName: '林小燕', medicalRecordNo: 'P20240133', stratification: '心血管高危', age: 64, gender: '女' },
  { patientName: '何永强', medicalRecordNo: 'P20240139', stratification: '老年衰弱', age: 80, gender: '男' },
]

// ============================================================
// Tab1: 低执行率TOP20
// ============================================================
export const lowExecutionPatients: LowExecutionPatient[] = [
  { rank: 1, patientName: '钱国强', medicalRecordNo: 'P20240012', executionRate: 18, planNo: 'SHFA-2026010012', mainProblem: '饮食控制不达标' },
  { rank: 2, patientName: '孟祥云', medicalRecordNo: 'P20240018', executionRate: 22, planNo: 'SHFA-2026010018', mainProblem: '运动依从性差' },
  { rank: 3, patientName: '冯桂英', medicalRecordNo: 'P20240025', executionRate: 28, planNo: 'SHFA-2026010025', mainProblem: '作息紊乱' },
  { rank: 4, patientName: '蒋志远', medicalRecordNo: 'P20240031', executionRate: 31, planNo: 'SHFA-2026010031', mainProblem: '饮食+运动均不达标' },
  { rank: 5, patientName: '沈丽华', medicalRecordNo: 'P20240037', executionRate: 34, planNo: 'SHFA-2026010037', mainProblem: '体重管理失败' },
  { rank: 6, patientName: '韩文斌', medicalRecordNo: 'P20240042', executionRate: 38, planNo: 'SHFA-2026010042', mainProblem: '未戒烟限酒' },
  { rank: 7, patientName: '唐玉珍', medicalRecordNo: 'P20240047', executionRate: 41, planNo: 'SHFA-2026010047', mainProblem: '睡眠质量差' },
  { rank: 8, patientName: '董建华', medicalRecordNo: 'P20240053', executionRate: 43, planNo: 'SHFA-2026010053', mainProblem: '饮食控制不达标' },
  { rank: 9, patientName: '彭明远', medicalRecordNo: 'P20240058', executionRate: 45, planNo: 'SHFA-2026010058', mainProblem: '运动量不足' },
  { rank: 10, patientName: '萧雅琴', medicalRecordNo: 'P20240062', executionRate: 47, planNo: 'SHFA-2026010062', mainProblem: '心理压力大' },
  { rank: 11, patientName: '曹国栋', medicalRecordNo: 'P20240066', executionRate: 48, planNo: 'SHFA-2026010066', mainProblem: '饮食控制不达标' },
  { rank: 12, patientName: '袁秀兰', medicalRecordNo: 'P20240071', executionRate: 49, planNo: 'SHFA-2026010071', mainProblem: '运动依从性差' },
  { rank: 13, patientName: '邓志刚', medicalRecordNo: 'P20240076', executionRate: 50, planNo: 'SHFA-2026010076', mainProblem: '作息紊乱' },
  { rank: 14, patientName: '许国平', medicalRecordNo: 'P20240079', executionRate: 51, planNo: 'SHFA-2026010079', mainProblem: '体重管理失败' },
  { rank: 15, patientName: '傅晓红', medicalRecordNo: 'P20240083', executionRate: 52, planNo: 'SHFA-2026010083', mainProblem: '未戒烟' },
  { rank: 16, patientName: '苏德明', medicalRecordNo: 'P20240086', executionRate: 53, planNo: 'SHFA-2026010086', mainProblem: '饮食控制不达标' },
  { rank: 17, patientName: '卢美英', medicalRecordNo: 'P20240090', executionRate: 55, planNo: 'SHFA-2026010090', mainProblem: '运动量不足' },
  { rank: 18, patientName: '蒋文明', medicalRecordNo: 'P20240094', executionRate: 56, planNo: 'SHFA-2026010094', mainProblem: '睡眠质量差' },
  { rank: 19, patientName: '蔡秋华', medicalRecordNo: 'P20240098', executionRate: 57, planNo: 'SHFA-2026010098', mainProblem: '心理压力大' },
  { rank: 20, patientName: '贾志强', medicalRecordNo: 'P20240101', executionRate: 58, planNo: 'SHFA-2026010101', mainProblem: '饮食+运动均不达标' },
]

// ============================================================
// Tab2: 50条方案列表
// ============================================================

const patientPool = [
  { name: '王建国', no: 'P20240001', str: '年轻低危' as const, age: 36, g: '男' },
  { name: '李秀英', no: 'P20240002', str: '老年衰弱' as const, age: 73, g: '女' },
  { name: '张伟', no: 'P20240003', str: '心血管高危' as const, age: 62, g: '男' },
  { name: '陈淑芬', no: 'P20240004', str: '肾功能不全' as const, age: 57, g: '女' },
  { name: '刘德华', no: 'P20240005', str: '年轻低危' as const, age: 40, g: '男' },
  { name: '赵丽娟', no: 'P20240006', str: '妊娠期' as const, age: 32, g: '女' },
  { name: '孙强', no: 'P20240007', str: '手术期' as const, age: 56, g: '男' },
  { name: '周美华', no: 'P20240008', str: '老年衰弱' as const, age: 76, g: '女' },
  { name: '吴志明', no: 'P20240009', str: '心血管高危' as const, age: 65, g: '男' },
  { name: '郑丽华', no: 'P20240010', str: '肾功能不全' as const, age: 54, g: '女' },
  { name: '冯国华', no: 'P20240011', str: '年轻低危' as const, age: 39, g: '男' },
  { name: '褚玉兰', no: 'P20240013', str: '老年衰弱' as const, age: 71, g: '女' },
  { name: '卫国庆', no: 'P20240014', str: '心血管高危' as const, age: 63, g: '男' },
  { name: '蒋淑珍', no: 'P20240015', str: '肾功能不全' as const, age: 58, g: '女' },
  { name: '沈德明', no: 'P20240016', str: '年轻低危' as const, age: 37, g: '男' },
  { name: '韩秀芬', no: 'P20240017', str: '妊娠期' as const, age: 29, g: '女' },
  { name: '杨志强', no: 'P20240019', str: '手术期' as const, age: 52, g: '男' },
  { name: '朱美玲', no: 'P20240020', str: '老年衰弱' as const, age: 74, g: '女' },
  { name: '秦国庆', no: 'P20240021', str: '心血管高危' as const, age: 67, g: '男' },
  { name: '尤桂芳', no: 'P20240022', str: '肾功能不全' as const, age: 60, g: '女' },
  { name: '许志远', no: 'P20240023', str: '年轻低危' as const, age: 34, g: '男' },
  { name: '何丽娟', no: 'P20240024', str: '老年衰弱' as const, age: 77, g: '女' },
  { name: '吕建华', no: 'P20240026', str: '心血管高危' as const, age: 64, g: '男' },
  { name: '施淑英', no: 'P20240027', str: '肾功能不全' as const, age: 56, g: '女' },
  { name: '张伟明', no: 'P20240028', str: '年轻低危' as const, age: 41, g: '男' },
  { name: '孔繁秀', no: 'P20240029', str: '老年衰弱' as const, age: 70, g: '女' },
  { name: '曹志刚', no: 'P20240030', str: '心血管高危' as const, age: 66, g: '男' },
  { name: '严丽华', no: 'P20240032', str: '肾功能不全' as const, age: 53, g: '女' },
  { name: '华国强', no: 'P20240033', str: '年轻低危' as const, age: 38, g: '男' },
  { name: '金秀兰', no: 'P20240034', str: '老年衰弱' as const, age: 75, g: '女' },
]

const doctors = ['张晓明', '李芳华', '王建国', '陈丽萍', '刘伟明']

const statuses: Array<'created' | 'archived' | 'expired'> = ['created', 'archived', 'expired']

export const planList: LifestylePlan[] = Array.from({ length: 50 }, (_, i) => {
  const p = patientPool[i % patientPool.length]
  const statusIdx = i < 25 ? 0 : i < 40 ? 1 : 2
  const status = statuses[statusIdx]
  const month = String(Math.floor(i / 4) + 12).padStart(2, '0')
  const day = String((i % 28) + 1).padStart(2, '0')
  const startMonth = month === '12' ? '12' : month === '13' ? '01' : month === '14' ? '02' : '03'
  const startYear = startMonth === '12' ? '2025' : '2026'
  const endYear = Number(startMonth) + 3 > 12 ? '2026' : startYear
  const endMonth = String((Number(startMonth) + 2) > 12 ? (Number(startMonth) + 2 - 12) : Number(startMonth) + 2).padStart(2, '0')
  const rate = status === 'created' ? 60 + Math.floor(Math.random() * 35) : status === 'archived' ? 70 + Math.floor(Math.random() * 28) : 20 + Math.floor(Math.random() * 40)

  return {
    id: `plan-${i + 1}`,
    planNo: `SHFA-2026${String(i + 1).padStart(4, '0')}`,
    patientName: p.name,
    medicalRecordNo: p.no,
    stratification: p.str,
    planPeriodStart: `${startYear}-${startMonth}-${day}`,
    planPeriodEnd: `${endYear}-${endMonth}-${day}`,
    createDoctor: doctors[i % doctors.length],
    planStatus: status,
    executionRate: rate,
  }
})

// ============================================================
// 方案详情生成
// ============================================================

const dietPlans = [
  { dailyCalorie: '1600~1800 kcal', carbohydrate: '50%~55%', protein: '15%~20%', fat: '25%~30%', mealDistribution: '早餐1/5、午餐2/5、晚餐2/5', dietNotes: '限制精制糖摄入，选择低GI食物，每日蔬菜不少于500g' },
  { dailyCalorie: '1400~1600 kcal', carbohydrate: '45%~50%', protein: '20%', fat: '30%', mealDistribution: '早餐1/3、午餐1/3、晚餐1/3', dietNotes: '严格控制碳水总量，增加膳食纤维，每日全谷物占主食50%以上' },
  { dailyCalorie: '1800~2000 kcal', carbohydrate: '55%~60%', protein: '15%', fat: '25%~30%', mealDistribution: '早餐30%、午餐40%、晚餐30%', dietNotes: '均衡膳食，适量优质蛋白，限制油炸食品摄入' },
]

const exercisePlans = [
  { exerciseType: '有氧运动（快走、慢跑）', frequency: '每周5~7天', duration: '每次30~45分钟', intensity: '中等强度（心率达到最大心率的50%~70%）', exerciseNotes: '餐后1小时开始运动，避免空腹运动，运动前后监测血糖' },
  { exerciseType: '有氧运动（游泳、骑行）', frequency: '每周3~5天', duration: '每次20~30分钟', intensity: '低至中等强度', exerciseNotes: '从低强度开始逐步增加，避免剧烈运动，运动时随身携带糖果' },
  { exerciseType: '抗阻训练+有氧运动', frequency: '每周3天有氧+2天抗阻', duration: '有氧30分钟，抗阻20分钟', intensity: '中等强度', exerciseNotes: '抗阻训练在非连续日进行，注意运动后拉伸放松' },
]

export function generatePlanDetail(plan: LifestylePlan): PlanDetail {
  const p = patientPool.find(item => item.no === plan.medicalRecordNo)
  const diet = dietPlans[plan.id.charCodeAt(5) % 3]
  const exercise = exercisePlans[plan.id.charCodeAt(6) % 3]
  const bmi = (20 + Math.random() * 8).toFixed(1)
  const targetWeight = (55 + Math.random() * 15).toFixed(0)
  const currentWeight = (Number(targetWeight) + Math.random() * 10 - 3).toFixed(1)

  return {
    planNo: plan.planNo,
    patientName: plan.patientName,
    medicalRecordNo: plan.medicalRecordNo,
    gender: p?.g || '男',
    age: p?.age || 50,
    stratification: plan.stratification,
    planPeriodStart: plan.planPeriodStart,
    planPeriodEnd: plan.planPeriodEnd,
    createDoctor: plan.createDoctor,
    createTime: plan.planPeriodStart,
    dietPlan: diet,
    exercisePlan: exercise,
    weightManagement: {
      currentWeight: `${currentWeight}kg`,
      targetWeight: `${targetWeight}kg`,
      bmi: bmi,
      weightGoal: Number(currentWeight) > Number(targetWeight) ? '减重' : '维持',
    },
    sleepManagement: {
      sleepTime: '22:00~22:30',
      wakeTime: '06:00~06:30',
      sleepDuration: '7~8小时',
      sleepNotes: '保持规律作息，睡前避免使用电子设备，营造安静睡眠环境',
    },
    habitManagement: {
      smokingStatus: '已戒烟' ,
      drinkingStatus: '已限酒',
      habitAdvice: '继续保持戒烟状态，每日饮酒量不超过25g（男性）/15g（女性），建议完全戒酒',
    },
    personalizedAdvice: `根据${plan.patientName}患者当前${plan.stratification}分层特点，建议重点${plan.stratification === '年轻低危' ? '加强运动干预和饮食管理，建立良好的生活习惯' : plan.stratification === '老年衰弱' ? '注意营养均衡，适度运动，防止跌倒，定期监测血糖' : plan.stratification === '肾功能不全' ? '控制蛋白质摄入量，选择优质低蛋白饮食，限制钠盐摄入' : plan.stratification === '心血管高危' ? '严格控制血压和血脂，低盐低脂饮食，规律有氧运动' : plan.stratification === '妊娠期' ? '保证母婴营养需求，控制血糖波动，避免低血糖发生' : '术后逐步恢复活动，注意伤口护理，严格控制血糖水平'}。`,
  }
}

// ============================================================
// Tab4: 执行跟踪统计卡片
// ============================================================
export const executionStatCards: StatCard[] = [
  { title: '本月执行检查人次', value: 128, change: '+15', changeType: 'increase' },
  { title: '执行达标率', value: '68.8%', change: '+3.2%', changeType: 'increase' },
  { title: '饮食达标率', value: '72.5%', change: '+1.8%', changeType: 'increase' },
  { title: '运动达标率', value: '61.2%', change: '-0.5%', changeType: 'decrease' },
]

// ============================================================
// Tab4: 执行跟踪明细（30条）
// ============================================================
const execPatients = patientPool.slice(0, 30)

export const executionRecords: ExecutionRecord[] = Array.from({ length: 30 }, (_, i) => {
  const p = execPatients[i % execPatients.length]
  const plan = planList[i % planList.length]
  const month = String(i < 10 ? 1 : i < 20 ? 2 : 3).padStart(2, '0')
  const day = String((i % 28) + 1).padStart(2, '0')
  const dietScore = 55 + Math.floor(Math.random() * 40)
  const exerciseScore = 45 + Math.floor(Math.random() * 45)
  const overallRate = Math.round((dietScore + exerciseScore) / 2 + (Math.random() * 10 - 5))

  return {
    id: `exec-${i + 1}`,
    planNo: plan.planNo,
    patientName: p.name,
    medicalRecordNo: p.no,
    checkDate: `2026-${month}-${day}`,
    executionRate: Math.min(100, Math.max(20, overallRate)),
    dietScore,
    exerciseScore,
    weightStatus: Math.random() > 0.5 ? '达标' : '未达标',
    sleepStatus: Math.random() > 0.4 ? '良好' : '需改善',
    selfManagementScore: 50 + Math.floor(Math.random() * 45),
    overallRating: overallRate >= 80 ? '优秀' : overallRate >= 60 ? '良好' : overallRate >= 40 ? '一般' : '较差',
  }
})

// ============================================================
// Tab4: 随访记录生成
// ============================================================

const followUpTypes = ['电话随访', '门诊随访', '微信随访', '家庭访视']
const complianceOptions = ['完全依从', '基本依从', '部分依从', '不依从']
const issuesList = [
  '近期饮食控制有所放松，需加强教育',
  '运动量较前期有所增加，鼓励继续保持',
  '血糖波动较大，建议调整饮食结构',
  '睡眠质量改善明显，整体状态良好',
  '体重控制达标，继续保持当前方案',
  '工作压力较大，建议适当调整生活节奏',
  '已按时监测血糖，自我管理能力提升',
  '偶尔忘记服药，需加强用药提醒',
]

const nextPlans = [
  '继续当前方案，1个月后复查',
  '增加运动频率至每周5次，2周后电话随访',
  '调整饮食方案，增加优质蛋白比例，3周后复查',
  '建议参加糖尿病健康教育课程，1个月后门诊复查',
  '加强血糖自我监测，每日至少监测2次，2周后电话随访',
]

export function generateFollowUpRecords(patientName: string): FollowUpRecord[] {
  const count = 2 + Math.floor(Math.random() * 3)
  return Array.from({ length: count }, (_, i) => ({
    id: `fu-${Date.now()}-${i}`,
    patientName,
    medicalRecordNo: `P2024${String(Math.floor(Math.random() * 200) + 1).padStart(4, '0')}`,
    followUpDate: `2026-${String(3 - i).padStart(2, '0')}-${String(10 + i * 8).padStart(2, '0')}`,
    followUpType: followUpTypes[Math.floor(Math.random() * followUpTypes.length)],
    followUpDoctor: doctors[Math.floor(Math.random() * doctors.length)],
    weight: `${(55 + Math.random() * 20).toFixed(1)}kg`,
    fastingGlucose: `${(5 + Math.random() * 4).toFixed(1)} mmol/L`,
    hba1c: `${(5.5 + Math.random() * 3).toFixed(1)}%`,
    dietCompliance: complianceOptions[Math.floor(Math.random() * complianceOptions.length)],
    exerciseCompliance: complianceOptions[Math.floor(Math.random() * complianceOptions.length)],
    currentIssues: issuesList[Math.floor(Math.random() * issuesList.length)],
    nextPlan: nextPlans[Math.floor(Math.random() * nextPlans.length)],
  }))
}

// ============================================================
// Tab3: 标准化指导库内容
// ============================================================
export const guidanceLibrary: GuidanceItem[] = [
  {
    title: '医学营养治疗指导规范',
    content: [
      '一、总热量控制：根据患者年龄、性别、身高、体重、活动量等因素计算每日所需总热量。理想体重（kg）= 身高（cm）- 105。超重/肥胖患者建议在现有饮食基础上每日减少300~500kcal。',
      '二、宏量营养素分配：碳水化合物占总热量的50%~65%，以复合碳水化合物为主，限制精制糖摄入；蛋白质占总热量的15%~20%，其中优质蛋白占50%以上；脂肪占总热量的20%~30%，限制饱和脂肪酸和反式脂肪酸摄入。',
      '三、膳食纤维：推荐每日膳食纤维摄入量25~30g，增加全谷物、豆类、蔬菜、水果摄入。',
      '四、钠盐限制：每日食盐摄入量不超过5g（合并高血压者不超过3g），减少加工食品和腌制食品摄入。',
      '五、三餐分配：建议按1/5、2/5、2/5或1/3、1/3、1/3分配，定时定量，避免暴饮暴食。',
      '六、血糖生成指数（GI）：优先选择低GI食物（GI≤55），适量中GI食物（GI 56~69），限制高GI食物（GI≥70）。',
      '七、合并肾功能不全者：适当限制蛋白质摄入量（0.6~0.8g/kg/d），以优质蛋白为主。',
    ],
  },
  {
    title: '运动治疗指导规范',
    content: [
      '一、运动评估：开始运动前应进行医学评估，包括心血管功能、眼底检查、神经病变筛查等，排除运动禁忌证。',
      '二、运动类型：以有氧运动为主（快走、慢跑、游泳、骑行），辅以抗阻训练（弹力带、哑铃），每周进行2~3次柔韧性训练。',
      '三、运动频率和时间：每周至少150分钟中等强度有氧运动，分3~5次进行，每次不少于30分钟。抗阻训练每周2~3次，隔日进行。',
      '四、运动强度：中等强度运动（心率达到最大心率50%~70%），运动时能说话但不能唱歌为适宜强度。最大心率=220-年龄。',
      '五、运动时机：建议餐后1~3小时运动，避免空腹运动（尤其使用胰岛素/促泌剂者），运动前后监测血糖。',
      '六、注意事项：运动时随身携带含糖食品，穿合适的鞋袜，运动前后做充分热身和拉伸。出现胸闷、心悸、头晕等不适立即停止。',
      '七、特殊人群：合并严重视网膜病变者避免剧烈运动和屏气动作；周围神经病变者避免负重和过度伸展运动；老年患者运动强度宜低，注意防跌倒。',
    ],
  },
  {
    title: '体重管理指导规范',
    content: [
      '一、体重评估：使用BMI评估体重状态（BMI = 体重/身高²），中国标准：正常18.5~23.9，超重24.0~27.9，肥胖≥28.0。同时结合腰围评估中心性肥胖（男性≥90cm，女性≥85cm）。',
      '二、体重目标：超重/肥胖患者建议3~6个月内减轻体重的5%~10%，每周减重0.5~1kg为宜。消瘦患者（BMI<18.5）建议逐步增加至正常范围。',
      '三、减重策略：饮食控制与运动相结合，不可盲目节食。每日能量缺口300~500kcal，长期坚持。限制含糖饮料和高能量零食摄入。',
      '四、体重监测：建议每周固定时间测量体重（清晨空腹、排尿后），记录体重变化趋势。每月评估一次减重效果，必要时调整方案。',
      '五、维持期管理：达到目标体重后进入维持期，继续保持健康饮食和规律运动，定期监测，防止体重反弹。',
      '六、药物辅助：BMI≥27的2型糖尿病患者，在生活方式干预效果不佳时可考虑使用GLP-1受体激动剂等兼具减重效果的降糖药物。',
    ],
  },
  {
    title: '作息与睡眠管理指导规范',
    content: [
      '一、规律作息：建议每日固定时间入睡和起床，包括周末。成人推荐睡眠时长7~9小时，老年患者6~8小时为宜。',
      '二、睡眠质量：保持良好的睡眠环境（安静、黑暗、温度适宜18~22℃），睡前1小时避免使用电子设备，避免睡前饮用咖啡、浓茶。',
      '三、睡眠障碍：合并失眠的糖尿病患者应先评估原因，首选非药物干预（睡眠卫生教育、认知行为疗法），必要时在医生指导下使用助眠药物。',
      '四、睡眠呼吸暂停：建议对BMI≥30或存在打鼾的糖尿病患者进行阻塞性睡眠呼吸暂停（OSA）筛查，确诊者积极治疗（CPAP等），有助于改善血糖控制。',
      '五、昼夜节律：保持规律的进食时间和运动时间有助于维持生物钟稳定，改善胰岛素敏感性。建议早餐在起床后1小时内进食。',
      '六、轮班工作者：需要轮班的患者应尽量保持轮班规律，轮班期间注意监测血糖，必要时调整用药方案。',
    ],
  },
  {
    title: '戒烟限酒与心理平衡指导规范',
    content: [
      '一、戒烟：吸烟是糖尿病大血管病变和微血管病变的重要危险因素。强烈建议所有吸烟者戒烟，包括传统香烟和电子烟。',
      '二、戒烟干预：采用"5A"干预策略（Ask询问、Advise建议、Assess评估、Assist帮助、Arrange安排随访）。可使用尼古丁替代疗法或药物辅助戒烟。',
      '三、戒酒或限酒：不建议糖尿病患者饮酒。如需饮酒，男性每日酒精摄入量不超过25g（啤酒750ml或葡萄酒250ml或白酒75ml），女性不超过15g。每周不超过2次。避免空腹饮酒。',
      '四、心理评估：建议定期评估糖尿病患者心理状态，关注焦虑、抑郁、糖尿病痛苦等心理问题。使用PHQ-9、GAD-7等量表进行筛查。',
      '五、心理干预：轻度心理问题可通过健康教育、同伴支持、放松训练等非药物方式干预；中重度焦虑/抑郁建议转介心理专科。',
      '六、自我管理支持：鼓励患者参加糖尿病自我管理教育（DSME）项目，提高自我管理能力和信心。建立医患信任关系，提供持续的情感支持。',
      '七、社会支持：鼓励家属参与患者的日常生活管理，提供家庭支持。建议患者参加糖尿病病友会或社区支持小组。',
    ],
  },
]

// ============================================================
// 新建方案（生成并生效后插入列表）
// ============================================================
export function createNewPlan(patientName: string, medicalRecordNo: string, stratification: string, doctor: string): LifestylePlan {
  const now = new Date()
  const end = new Date(now)
  end.setMonth(end.getMonth() + 3)
  const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  return {
    id: `plan-new-${Date.now()}`,
    planNo: `SHFA-2026${String(planList.length + 1).padStart(4, '0')}`,
    patientName,
    medicalRecordNo,
    stratification: stratification as any,
    planPeriodStart: formatDate(now),
    planPeriodEnd: formatDate(end),
    createDoctor: doctor,
    planStatus: 'created',
    executionRate: 0,
  }
}

// Mock患者池（用于新建方案选择）
export const mockPatientsForSelect = patientPool.map(p => ({
  label: `${p.name}（${p.no}）`,
  value: p.no,
  name: p.name,
  no: p.no,
  stratification: p.str,
  age: p.age,
  gender: p.g,
}))
