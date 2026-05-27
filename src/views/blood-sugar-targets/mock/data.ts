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
    name: '总览',
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
    ],
  },
  {
    key: 't1dm',
    name: '1型糖尿病（T1DM）',
    children: [
      { key: 't1dm-children', name: '儿童青少年' },
      { key: 't1dm-adult', name: '成人' },
      { key: 't1dm-elderly', name: '老年人' },
      // { key: 't1dm-brittle', name: '脆性糖尿病' },
    ],
  },
  {
    key: 'gdm',
    name: '妊娠相关糖尿病',
    children: [
      // { key: 'gdm-pgdm', name: '孕前糖尿病合并妊娠' },
      // { key: 'gdm-odm', name: '妊娠期显性糖尿病' },
      // { key: 'gdm-only', name: '妊娠期糖尿病' },
      { key: 'gdm-only', name: '妊娠相关糖尿病' },
    ],
  },
  // {
  //   key: 'st',
  //   name: '特殊类型糖尿病',
  //   children: [
  //     { key: 'st-monogenic', name: '单基因糖尿病' },
  //     { key: 'st-mitochondrial', name: '线粒体糖尿病' },
  //     { key: 'st-pancreatic', name: '胰源性糖尿病' },
  //     { key: 'st-other', name: '其他特殊类型' },
  //   ],
  // },
  // {
  //   key: 'ss',
  //   name: '特殊场景临时目标',
  //   children: [
  //     { key: 'ss-perioperative', name: '围手术期' },
  //     { key: 'ss-critical', name: '住院/危重症' },
  //     { key: 'ss-infection', name: '急性感染/应激状态' },
  //     { key: 'ss-hypoglycemia', name: '低血糖恢复期' },
  //   ],
  // },
  // {
  //   key: 'prediabetes',
  //   name: '糖尿病前期',
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

  // ==================== 1型糖尿病分类 ====================
  't1dm-children': {
    key: 't1dm-children',
    name: '儿童青少年T1DM',
    parentPath: ['1型糖尿病（T1DM）'],
    definition: '年龄<18岁，诊断1型糖尿病的儿童和青少年患者，需终身依赖胰岛素治疗，血糖波动大',
    targets: [
      { name: 'HbA1c', value: '<6.5%~7.0%' },
      { name: '空腹血糖', value: '4.0~7.0 mmol/L' },
      { name: '餐后2小时血糖', value: '5.0~10.0 mmol/L' },
      { name: '睡前血糖', value: '6.0~8.0 mmol/L' },
      { name: '特别注意', value: '避免低血糖，尊重成长发育需求' },
    ],
  },
  't1dm-adult': {
    key: 't1dm-adult',
    name: '成人T1DM',
    parentPath: ['1型糖尿病（T1DM）'],
    definition:
      '年龄18-65岁，诊断1型糖尿病的成年患者，病程较长，胰岛功能完全丧失，需强化胰岛素治疗',
    targets: [
      { name: 'HbA1c', value: '<7.0%' },
      { name: '空腹血糖', value: '4.0~7.0 mmol/L' },
      { name: '餐后2小时血糖', value: '5.0~10.0 mmol/L' },
      { name: '睡前血糖', value: '6.0~8.0 mmol/L' },
    ],
  },
  't1dm-elderly': {
    key: 't1dm-elderly',
    name: '老年T1DM',
    parentPath: ['1型糖尿病（T1DM）'],
    definition: '年龄≥65岁，诊断1型糖尿病的老年患者，病程通常>40年，合并多种并发症，低血糖风险高',
    targets: [
      { name: 'HbA1c', value: '<7.5%~8.0%' },
      { name: '空腹血糖', value: '5.0~8.0 mmol/L' },
      { name: '睡前血糖', value: '7.0~10.0 mmol/L' },
      { name: '优先目标', value: '避免严重低血糖' },
    ],
  },
  't1dm-brittle': {
    key: 't1dm-brittle',
    name: '脆性糖尿病',
    parentPath: ['1型糖尿病（T1DM）'],
    definition: '血糖波动剧烈，反复发生低血糖或糖尿病酮症酸中毒（DKD），常规治疗难以稳定控制',
    targets: [
      { name: 'HbA1c', value: '<8.5%' },
      { name: '空腹血糖波动', value: '<5.0 mmol/L日内波动' },
      { name: '重点目标', value: '减少急性并发症，稳定血糖' },
      { name: '血糖控制策略', value: '个体化，宁高勿低' },
    ],
  },

  // ==================== 妊娠相关糖尿病分类 ====================
  'gdm-pgdm': {
    key: 'gdm-pgdm',
    name: '孕前糖尿病合并妊娠',
    parentPath: ['妊娠相关糖尿病'],
    definition: '孕前已诊断1型或2型糖尿病，在计划妊娠或妊娠期间血糖控制不佳的患者',
    targets: [
      { name: 'HbA1c', value: '<6.0%~6.5%' },
      { name: '空腹血糖', value: '3.3~5.4 mmol/L' },
      { name: '餐后1小时血糖', value: '<7.8 mmol/L' },
      { name: '餐后2小时血糖', value: '<6.7~7.1 mmol/L' },
      { name: '特别注意', value: '孕前3个月开始补充叶酸' },
    ],
  },
  'gdm-odm': {
    key: 'gdm-odm',
    name: '妊娠期显性糖尿病',
    parentPath: ['妊娠相关糖尿病'],
    definition: '妊娠期间首次发现血糖达到非孕期糖尿病诊断标准的患者',
    targets: [
      { name: 'HbA1c', value: '<6.0%~6.5%' },
      { name: '空腹血糖', value: '3.3~5.4 mmol/L' },
      { name: '餐后2小时血糖', value: '<6.7 mmol/L' },
      { name: '控糖策略', value: '饮食+运动，必要时胰岛素' },
    ],
  },
  'gdm-only': {
    key: 'gdm-only',
    name: '妊娠期糖尿病',
    parentPath: ['妊娠相关糖尿病'],
    definition: '妊娠前糖代谢正常，妊娠期首次发现血糖升高的患者，是最常见的妊娠期糖尿病类型',
    targets: [
      { name: '空腹血糖', value: '<5.3 mmol/L' },
      { name: '餐后1小时血糖', value: '<7.8 mmol/L' },
      { name: '餐后2小时血糖', value: '<6.7 mmol/L' },
      { name: 'HbA1c', value: '<5.5%~6.0%' },
    ],
  },

  // ==================== 特殊类型糖尿病分类 ====================
  'st-monogenic': {
    key: 'st-monogenic',
    name: '单基因糖尿病',
    parentPath: ['特殊类型糖尿病'],
    definition: '由单基因突变引起的糖尿病，包括MODY（青年发病的成年型糖尿病）、新生儿糖尿病等',
    targets: [
      { name: 'HbA1c', value: '<6.5%~7.0%' },
      { name: '空腹血糖', value: '4.0~7.0 mmol/L' },
      { name: '餐后2小时血糖', value: '<8.0~10.0 mmol/L' },
      { name: '治疗特点', value: '部分可用磺脲类药物替代胰岛素' },
    ],
  },
  'st-mitochondrial': {
    key: 'st-mitochondrial',
    name: '线粒体糖尿病',
    parentPath: ['特殊类型糖尿病'],
    definition: '线粒体基因突变导致的糖尿病，常伴有耳聋、母系遗传等特点',
    targets: [
      { name: 'HbA1c', value: '<7.0%' },
      { name: '空腹血糖', value: '5.0~7.0 mmol/L' },
      { name: '餐后2小时血糖', value: '<10.0 mmol/L' },
      { name: '注意事项', value: '避免使用双胍类，优选胰岛素' },
    ],
  },
  'st-pancreatic': {
    key: 'st-pancreatic',
    name: '胰源性糖尿病',
    parentPath: ['特殊类型糖尿病'],
    definition: '胰腺外分泌疾病导致胰岛β细胞功能受损引起的糖尿病（3c型糖尿病）',
    targets: [
      { name: 'HbA1c', value: '<7.0%~7.5%' },
      { name: '空腹血糖', value: '5.0~8.0 mmol/L' },
      { name: '餐后2小时血糖', value: '<10.0~12.0 mmol/L' },
      { name: '胰酶替代', value: '同时补充胰酶改善营养吸收' },
    ],
  },
  'st-other': {
    key: 'st-other',
    name: '其他特殊类型',
    parentPath: ['特殊类型糖尿病'],
    definition: '包括药物相关性糖尿病、内分泌疾病相关性糖尿病等其他特殊原因导致的糖尿病',
    targets: [
      { name: 'HbA1c', value: '<7.0%~8.0%' },
      { name: '空腹血糖', value: '5.0~7.5 mmol/L' },
      { name: '餐后2小时血糖', value: '<10.0 mmol/L' },
      { name: '核心原则', value: '治疗原发病，控制血糖' },
    ],
  },

  // ==================== 特殊场景临时目标 ====================
  'ss-perioperative': {
    key: 'ss-perioperative',
    name: '围手术期',
    parentPath: ['特殊场景临时目标'],
    definition: '接受外科手术的糖尿病患者，术前、术中、术后血糖管理需特别关注',
    targets: [
      { name: '术前目标', value: '空腹血糖5.0~8.0 mmol/L' },
      { name: '术中目标', value: '7.0~10.0 mmol/L' },
      { name: '术后目标', value: '空腹<7.8，餐后<10.0 mmol/L' },
      { name: '注意事项', value: '大型手术需调整为胰岛素治疗' },
    ],
  },
  'ss-critical': {
    key: 'ss-critical',
    name: '住院/危重症',
    parentPath: ['特殊场景临时目标'],
    definition: '住院期间或危重症监护患者，血糖管理目标需个体化制定',
    targets: [
      { name: '一般住院目标', value: '7.8~10.0 mmol/L' },
      { name: '危重症目标', value: '7.8~10.0 mmol/L' },
      { name: '严格控制', value: '重症患者：6.0~8.0 mmol/L' },
      { name: '宽松目标', value: '低血糖风险高：<12.0 mmol/L' },
    ],
  },
  'ss-infection': {
    key: 'ss-infection',
    name: '急性感染/应激状态',
    parentPath: ['特殊场景临时目标'],
    definition: '急性感染、创伤、应激事件期间的糖尿病患者，血糖应激性升高',
    targets: [
      { name: '急性感染期目标', value: '空腹5.0~10.0，餐后<13.0 mmol/L' },
      { name: '应激状态', value: '可放宽至<14.0 mmol/L' },
      { name: '感染控制后', value: '逐步收紧目标至常规标准' },
      { name: '重点监测', value: '酮体，预防DKA' },
    ],
  },
  'ss-hypoglycemia': {
    key: 'ss-hypoglycemia',
    name: '低血糖恢复期',
    parentPath: ['特殊场景临时目标'],
    definition: '发生严重低血糖后或低血糖高风险期的短期血糖管理',
    targets: [
      { name: '恢复期目标', value: '空腹5.0~8.0 mmol/L' },
      { name: '睡前血糖', value: '6.0~10.0 mmol/L' },
      { name: '短期策略', value: '宁高勿低，避免再次低血糖' },
      { name: '持续时间', value: '通常1-2周后调整回常规目标' },
    ],
  },

  // ==================== 糖尿病前期 ====================
  prediabetes: {
    key: 'prediabetes',
    name: '糖尿病前期',
    parentPath: [],
    definition: '空腹血糖受损（IFG）或糖耐量减低（IGT）状态，是糖尿病的高危人群',
    targets: [
      { name: '空腹血糖', value: '3.9~6.1 mmol/L' },
      { name: '餐后2小时血糖', value: '<7.8 mmol/L' },
      { name: 'HbA1c', value: '5.7%~6.4%' },
      { name: '干预目标', value: '体重下降3%~5%，每周运动150分钟' },
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

  // 1型糖尿病统计
  't1dm-children': {
    total: 8,
    controlled: 5,
    uncontrolled: 3,
    hypoglycemiaRisk: 3,
    rate: '63%',
    proportion: '4.0%',
  },
  't1dm-adult': {
    total: 15,
    controlled: 9,
    uncontrolled: 6,
    hypoglycemiaRisk: 4,
    rate: '60%',
    proportion: '7.5%',
  },
  't1dm-elderly': {
    total: 6,
    controlled: 3,
    uncontrolled: 3,
    hypoglycemiaRisk: 4,
    rate: '50%',
    proportion: '3.0%',
  },
  't1dm-brittle': {
    total: 4,
    controlled: 1,
    uncontrolled: 3,
    hypoglycemiaRisk: 4,
    rate: '25%',
    proportion: '2.0%',
  },

  // 妊娠相关糖尿病统计
  'gdm-pgdm': {
    total: 5,
    controlled: 4,
    uncontrolled: 1,
    hypoglycemiaRisk: 1,
    rate: '80%',
    proportion: '2.5%',
  },
  'gdm-odm': {
    total: 3,
    controlled: 2,
    uncontrolled: 1,
    hypoglycemiaRisk: 0,
    rate: '67%',
    proportion: '1.5%',
  },
  'gdm-only': {
    total: 12,
    controlled: 10,
    uncontrolled: 2,
    hypoglycemiaRisk: 2,
    rate: '83%',
    proportion: '6.0%',
  },

  // 特殊类型糖尿病统计
  'st-monogenic': {
    total: 4,
    controlled: 3,
    uncontrolled: 1,
    hypoglycemiaRisk: 0,
    rate: '75%',
    proportion: '2.0%',
  },
  'st-mitochondrial': {
    total: 2,
    controlled: 1,
    uncontrolled: 1,
    hypoglycemiaRisk: 1,
    rate: '50%',
    proportion: '1.0%',
  },
  'st-pancreatic': {
    total: 3,
    controlled: 2,
    uncontrolled: 1,
    hypoglycemiaRisk: 1,
    rate: '67%',
    proportion: '1.5%',
  },
  'st-other': {
    total: 2,
    controlled: 1,
    uncontrolled: 1,
    hypoglycemiaRisk: 0,
    rate: '50%',
    proportion: '1.0%',
  },

  // 特殊场景临时目标统计
  'ss-perioperative': {
    total: 8,
    controlled: 5,
    uncontrolled: 3,
    hypoglycemiaRisk: 2,
    rate: '63%',
    proportion: '4.0%',
  },
  'ss-critical': {
    total: 6,
    controlled: 4,
    uncontrolled: 2,
    hypoglycemiaRisk: 3,
    rate: '67%',
    proportion: '3.0%',
  },
  'ss-infection': {
    total: 5,
    controlled: 2,
    uncontrolled: 3,
    hypoglycemiaRisk: 1,
    rate: '40%',
    proportion: '2.5%',
  },
  'ss-hypoglycemia': {
    total: 4,
    controlled: 2,
    uncontrolled: 2,
    hypoglycemiaRisk: 3,
    rate: '50%',
    proportion: '2.0%',
  },

  // 糖尿病前期统计
  prediabetes: {
    total: 20,
    controlled: 12,
    uncontrolled: 8,
    hypoglycemiaRisk: 1,
    rate: '60%',
    proportion: '10.0%',
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

  // T1DM 儿童青少年
  {
    id: 21,
    name: '小雨',
    medicalRecordNo: '2026001301',
    age: 10,
    gender: '女',
    category: 't1dm-children',
    categoryName: '儿童青少年T1DM',
    diabetesType: '1型糖尿病',
    diseaseCourse: '2年',
    hba1c: '6.5%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },
  {
    id: 22,
    name: '乐乐',
    medicalRecordNo: '2026001302',
    age: 15,
    gender: '男',
    category: 't1dm-children',
    categoryName: '儿童青少年T1DM',
    diabetesType: '1型糖尿病',
    diseaseCourse: '3年',
    hba1c: '7.0%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },
  {
    id: 23,
    name: '小美',
    medicalRecordNo: '2026001303',
    age: 8,
    gender: '女',
    category: 't1dm-children',
    categoryName: '儿童青少年T1DM',
    diabetesType: '1型糖尿病',
    diseaseCourse: '1年',
    hba1c: '6.8%',
    fastingStatus: '未达标',
    targetStatus: '生效中',
  },

  // T1DM 成人
  {
    id: 24,
    name: '李婷',
    medicalRecordNo: '2026001311',
    age: 28,
    gender: '女',
    category: 't1dm-adult',
    categoryName: '成人T1DM',
    diabetesType: '1型糖尿病',
    diseaseCourse: '10年',
    hba1c: '6.8%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },
  {
    id: 25,
    name: '张强',
    medicalRecordNo: '2026001312',
    age: 35,
    gender: '男',
    category: 't1dm-adult',
    categoryName: '成人T1DM',
    diabetesType: '1型糖尿病',
    diseaseCourse: '15年',
    hba1c: '7.2%',
    fastingStatus: '未达标',
    targetStatus: '生效中',
  },
  {
    id: 26,
    name: '王雪',
    medicalRecordNo: '2026001313',
    age: 30,
    gender: '女',
    category: 't1dm-adult',
    categoryName: '成人T1DM',
    diabetesType: '1型糖尿病',
    diseaseCourse: '8年',
    hba1c: '6.5%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },

  // T1DM 老年人
  {
    id: 27,
    name: '马大爷',
    medicalRecordNo: '2026001321',
    age: 70,
    gender: '男',
    category: 't1dm-elderly',
    categoryName: '老年T1DM',
    diabetesType: '1型糖尿病',
    diseaseCourse: '45年',
    hba1c: '7.8%',
    fastingStatus: '未达标',
    targetStatus: '生效中',
  },
  {
    id: 28,
    name: '赵奶奶',
    medicalRecordNo: '2026001322',
    age: 68,
    gender: '女',
    category: 't1dm-elderly',
    categoryName: '老年T1DM',
    diabetesType: '1型糖尿病',
    diseaseCourse: '40年',
    hba1c: '7.5%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },

  // T1DM 脆性糖尿病
  {
    id: 29,
    name: '杨先生',
    medicalRecordNo: '2026001331',
    age: 42,
    gender: '男',
    category: 't1dm-brittle',
    categoryName: '脆性糖尿病',
    diabetesType: '1型糖尿病',
    diseaseCourse: '25年',
    hba1c: '9.0%',
    fastingStatus: '未达标',
    targetStatus: '生效中',
  },
  {
    id: 30,
    name: '刘女士',
    medicalRecordNo: '2026001332',
    age: 38,
    gender: '女',
    category: 't1dm-brittle',
    categoryName: '脆性糖尿病',
    diabetesType: '1型糖尿病',
    diseaseCourse: '20年',
    hba1c: '8.5%',
    fastingStatus: '未达标',
    targetStatus: '已过期',
  },

  // GDM 孕前糖尿病合并妊娠
  {
    id: 31,
    name: '吴女士',
    medicalRecordNo: '2026001401',
    age: 30,
    gender: '女',
    category: 'gdm-pgdm',
    categoryName: '孕前糖尿病合并妊娠',
    diabetesType: '2型糖尿病合并妊娠',
    diseaseCourse: '5年',
    hba1c: '6.2%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },
  {
    id: 32,
    name: '郑女士',
    medicalRecordNo: '2026001402',
    age: 28,
    gender: '女',
    category: 'gdm-pgdm',
    categoryName: '孕前糖尿病合并妊娠',
    diabetesType: '1型糖尿病合并妊娠',
    diseaseCourse: '8年',
    hba1c: '6.5%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },

  // GDM 妊娠期显性糖尿病
  {
    id: 33,
    name: '孙女士',
    medicalRecordNo: '2026001411',
    age: 32,
    gender: '女',
    category: 'gdm-odm',
    categoryName: '妊娠期显性糖尿病',
    diabetesType: '妊娠期显性糖尿病',
    diseaseCourse: '妊娠期发现',
    hba1c: '6.8%',
    fastingStatus: '未达标',
    targetStatus: '生效中',
  },

  // GDM 妊娠期糖尿病
  {
    id: 34,
    name: '周女士',
    medicalRecordNo: '2026001421',
    age: 26,
    gender: '女',
    category: 'gdm-only',
    categoryName: '妊娠期糖尿病',
    diabetesType: '妊娠期糖尿病',
    diseaseCourse: '妊娠24周诊断',
    hba1c: '5.5%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },
  {
    id: 35,
    name: '钱女士',
    medicalRecordNo: '2026001422',
    age: 29,
    gender: '女',
    category: 'gdm-only',
    categoryName: '妊娠期糖尿病',
    diabetesType: '妊娠期糖尿病',
    diseaseCourse: '妊娠26周诊断',
    hba1c: '5.8%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },
  {
    id: 36,
    name: '吴孕妇',
    medicalRecordNo: '2026001423',
    age: 31,
    gender: '女',
    category: 'gdm-only',
    categoryName: '妊娠期糖尿病',
    diabetesType: '妊娠期糖尿病',
    diseaseCourse: '妊娠28周诊断',
    hba1c: '6.2%',
    fastingStatus: '未达标',
    targetStatus: '生效中',
  },

  // 特殊类型糖尿病
  {
    id: 37,
    name: '小杰',
    medicalRecordNo: '2026001501',
    age: 16,
    gender: '男',
    category: 'st-monogenic',
    categoryName: '单基因糖尿病',
    diabetesType: 'MODY3型',
    diseaseCourse: '3年',
    hba1c: '6.3%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },
  {
    id: 38,
    name: '阿华',
    medicalRecordNo: '2026001502',
    age: 22,
    gender: '男',
    category: 'st-mitochondrial',
    categoryName: '线粒体糖尿病',
    diabetesType: '线粒体糖尿病',
    diseaseCourse: '4年',
    hba1c: '7.0%',
    fastingStatus: '未达标',
    targetStatus: '生效中',
  },
  {
    id: 39,
    name: '老陈',
    medicalRecordNo: '2026001503',
    age: 55,
    gender: '男',
    category: 'st-pancreatic',
    categoryName: '胰源性糖尿病',
    diabetesType: '胰源性糖尿病（3c型）',
    diseaseCourse: '慢性胰腺炎后2年',
    hba1c: '7.2%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },
  {
    id: 40,
    name: '阿德',
    medicalRecordNo: '2026001504',
    age: 45,
    gender: '男',
    category: 'st-other',
    categoryName: '其他特殊类型',
    diabetesType: '药物相关性糖尿病',
    diseaseCourse: '长期使用激素后1年',
    hba1c: '7.5%',
    fastingStatus: '未达标',
    targetStatus: '生效中',
  },

  // 特殊场景临时目标
  {
    id: 41,
    name: '林先生',
    medicalRecordNo: '2026001601',
    age: 58,
    gender: '男',
    category: 'ss-perioperative',
    categoryName: '围手术期',
    diabetesType: '2型糖尿病',
    diseaseCourse: '10年',
    hba1c: '7.5%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },
  {
    id: 42,
    name: '张女士',
    medicalRecordNo: '2026001602',
    age: 62,
    gender: '女',
    category: 'ss-critical',
    categoryName: '住院/危重症',
    diabetesType: '2型糖尿病',
    diseaseCourse: '15年',
    hba1c: '8.0%',
    fastingStatus: '未达标',
    targetStatus: '生效中',
  },
  {
    id: 43,
    name: '李先生',
    medicalRecordNo: '2026001603',
    age: 50,
    gender: '男',
    category: 'ss-infection',
    categoryName: '急性感染/应激状态',
    diabetesType: '2型糖尿病',
    diseaseCourse: '8年',
    hba1c: '9.5%',
    fastingStatus: '未达标',
    targetStatus: '生效中',
  },
  {
    id: 44,
    name: '王大爷',
    medicalRecordNo: '2026001604',
    age: 70,
    gender: '男',
    category: 'ss-hypoglycemia',
    categoryName: '低血糖恢复期',
    diabetesType: '2型糖尿病',
    diseaseCourse: '12年',
    hba1c: '7.0%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },

  // 糖尿病前期
  {
    id: 45,
    name: '赵先生',
    medicalRecordNo: '2026001701',
    age: 48,
    gender: '男',
    category: 'prediabetes',
    categoryName: '糖尿病前期',
    diabetesType: '糖尿病前期',
    diseaseCourse: '初诊',
    hba1c: '6.0%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },
  {
    id: 46,
    name: '刘女士',
    medicalRecordNo: '2026001702',
    age: 45,
    gender: '女',
    category: 'prediabetes',
    categoryName: '糖尿病前期',
    diabetesType: '糖尿病前期',
    diseaseCourse: '初诊',
    hba1c: '5.8%',
    fastingStatus: '达标',
    targetStatus: '生效中',
  },
  {
    id: 47,
    name: '陈先生',
    medicalRecordNo: '2026001703',
    age: 52,
    gender: '男',
    category: 'prediabetes',
    categoryName: '糖尿病前期',
    diabetesType: '糖尿病前期',
    diseaseCourse: '初诊',
    hba1c: '6.3%',
    fastingStatus: '未达标',
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
        .map(() => Number((targetMin + Math.random() * (targetMax - targetMin)).toFixed(1))),
      postprandial: Array(14)
        .fill(0)
        .map(() => Number((targetMax + Math.random() * 2).toFixed(1))),
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

// 生成患者分类饼图数据（按一级分类汇总）
export const getPatientCategoryPieData = () => {
  // 按一级分类汇总
  const level1Categories = menuCategories.filter((c) => c.key !== 'overview')

  return level1Categories
    .map((cat) => {
      let total = 0
      if (cat.children && cat.children.length > 0) {
        // 有子分类，汇总所有子分类的患者数
        cat.children.forEach((child) => {
          const stats = categoryStatistics[child.key]
          if (stats) {
            total += stats.total
          }
        })
      } else {
        // 没有子分类，直接取统计数据
        const stats = categoryStatistics[cat.key]
        if (stats) {
          total = stats.total
        }
      }
      return {
        name: cat.name,
        value: total,
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
