import type { DrugAdverseReaction, HighRiskPatient, RiskLevel, HandleStatus } from './types'

// 用药安全核心统计卡片
export const medicationSafetyCards = [
  {
    title: '药物不良反应发生情况',
    value: '28',
    unit: '人次',
    rate: '14.0%',
    change: '-2.1%',
    subTitle: '近3个月总人次/发生率',
  },
  {
    title: '用药相关肝肾功能异常',
    value: '12',
    unit: '人',
    rate: '6.0%',
    change: '+0.8%',
    subTitle: '近3个月新发异常人数/占比',
  },
  {
    title: '用药依从性达标率',
    value: '156',
    unit: '人',
    rate: '78.0%',
    change: '+3.5%',
    subTitle: '按医嘱规律用药患者占比',
  },
  {
    title: '药物相互作用风险人次',
    value: '15',
    unit: '人次',
    rate: '7.5%',
    change: '-1.2%',
    subTitle: '近3个月检出风险人次/处理率',
  },
]

// 不同降糖药不良反应发生率柱状图
export const adverseReactionChart = {
  xAxis: ['二甲双胍', '磺脲类', 'DPP-4抑制剂', 'SGLT-2抑制剂', 'GLP-1受体激动剂'],
  series: [
    {
      name: '不良反应发生率',
      data: [8.5, 15.2, 5.8, 6.2, 12.5],
    },
  ],
}

// 用药依从性与疗效达标率相关性折线图
export const complianceEfficacyChart = {
  xAxis: ['高依从性', '中依从性', '低依从性'],
  series: [
    {
      name: '疗效达标率',
      data: [85.5, 62.3, 35.8],
    },
  ],
}

// 药物不良反应记录列表
export const drugAdverseReactions: DrugAdverseReaction[] = [
  { id: 1, name: '张秀英', medicalRecordNo: '20260002', drugUsed: '二甲双胍', adverseReactionType: '胃肠道反应', occurrenceTime: '2026-03-10', treatment: '餐后服用，减量', outcome: '好转' },
  { id: 2, name: '李志强', medicalRecordNo: '20260007', drugUsed: '格列齐特', adverseReactionType: '低血糖', occurrenceTime: '2026-03-08', treatment: '调整剂量', outcome: '好转' },
  { id: 3, name: '王桂芳', medicalRecordNo: '20260013', drugUsed: '西格列汀', adverseReactionType: '皮疹', occurrenceTime: '2026-03-12', treatment: '抗过敏治疗', outcome: '痊愈' },
  { id: 4, name: '刘俊杰', medicalRecordNo: '20260019', drugUsed: '达格列净', adverseReactionType: '泌尿系统感染', occurrenceTime: '2026-03-05', treatment: '抗感染治疗', outcome: '好转' },
  { id: 5, name: '陈丽娟', medicalRecordNo: '20260025', drugUsed: '利拉鲁肽', adverseReactionType: '恶心呕吐', occurrenceTime: '2026-03-15', treatment: '对症治疗', outcome: '好转' },
  { id: 6, name: '赵伟东', medicalRecordNo: '20260031', drugUsed: '二甲双胍', adverseReactionType: '维生素B12缺乏', occurrenceTime: '2026-03-03', treatment: '补充维生素B12', outcome: '好转' },
  { id: 7, name: '杨秀珍', medicalRecordNo: '20260037', drugUsed: '格列美脲', adverseReactionType: '体重增加', occurrenceTime: '2026-03-18', treatment: '饮食控制', outcome: '稳定' },
  { id: 8, name: '孙国强', medicalRecordNo: '20260043', drugUsed: '利格列汀', adverseReactionType: '关节痛', occurrenceTime: '2026-03-07', treatment: '对症治疗', outcome: '好转' },
  { id: 9, name: '周桂兰', medicalRecordNo: '20260049', drugUsed: '恩格列净', adverseReactionType: '糖尿病酮症酸中毒', occurrenceTime: '2026-03-01', treatment: '住院治疗', outcome: '好转' },
  { id: 10, name: '吴志强', medicalRecordNo: '20260055', drugUsed: '二甲双胍', adverseReactionType: '乳酸酸中毒', occurrenceTime: '2026-03-20', treatment: '住院治疗', outcome: '痊愈' },
  { id: 11, name: '郑秀英', medicalRecordNo: '20260061', drugUsed: '格列吡嗪', adverseReactionType: '低血糖', occurrenceTime: '2026-03-11', treatment: '调整剂量', outcome: '好转' },
  { id: 12, name: '冯德伟', medicalRecordNo: '20260067', drugUsed: '阿格列汀', adverseReactionType: '肝功能异常', occurrenceTime: '2026-03-14', treatment: '保肝治疗', outcome: '好转' },
  { id: 13, name: '林桂芳', medicalRecordNo: '20260073', drugUsed: '卡格列净', adverseReactionType: '会阴部真菌感染', occurrenceTime: '2026-03-06', treatment: '抗真菌治疗', outcome: '痊愈' },
  { id: 14, name: '何俊杰', medicalRecordNo: '20260079', drugUsed: '艾塞那肽', adverseReactionType: '注射部位反应', occurrenceTime: '2026-03-16', treatment: '更换注射部位', outcome: '好转' },
  { id: 15, name: '高丽娟', medicalRecordNo: '20260085', drugUsed: '二甲双胍', adverseReactionType: '贫血', occurrenceTime: '2026-03-09', treatment: '补充铁剂和叶酸', outcome: '好转' },
]

// 用药高风险患者列表
export const highRiskMedicationPatients: HighRiskPatient[] = [
  { id: 1, name: '张建华', medicalRecordNo: '20260003', combinedDrugs: '二甲双胍+格列齐特+阿司匹林', riskType: '多重药物相互作用', riskLevel: '高风险' as RiskLevel, handleStatus: '处理中' as HandleStatus },
  { id: 2, name: '李秀英', medicalRecordNo: '20260008', combinedDrugs: '达格列净+利尿剂', riskType: '低血糖风险', riskLevel: '高风险' as RiskLevel, handleStatus: '待处理' as HandleStatus },
  { id: 3, name: '王志强', medicalRecordNo: '20260015', combinedDrugs: '二甲双胍+酒精', riskType: '乳酸酸中毒风险', riskLevel: '高风险' as RiskLevel, handleStatus: '已处理' as HandleStatus },
  { id: 4, name: '刘桂兰', medicalRecordNo: '20260021', combinedDrugs: '格列美脲+布洛芬', riskType: '低血糖风险', riskLevel: '中风险' as RiskLevel, handleStatus: '处理中' as HandleStatus },
  { id: 5, name: '陈伟东', medicalRecordNo: '20260027', combinedDrugs: '利拉鲁肽+胰岛素', riskType: '低血糖风险', riskLevel: '中风险' as RiskLevel, handleStatus: '待处理' as HandleStatus },
  { id: 6, name: '赵淑珍', medicalRecordNo: '20260033', combinedDrugs: '西格列汀+氯吡格雷', riskType: '药物相互作用', riskLevel: '高风险' as RiskLevel, handleStatus: '已处理' as HandleStatus },
  { id: 7, name: '杨俊杰', medicalRecordNo: '20260039', combinedDrugs: '二甲双胍+造影剂', riskType: '肾功能恶化风险', riskLevel: '高风险' as RiskLevel, handleStatus: '处理中' as HandleStatus },
  { id: 8, name: '孙秀英', medicalRecordNo: '20260045', combinedDrugs: '格列齐特+β受体阻滞剂', riskType: '低血糖风险', riskLevel: '中风险' as RiskLevel, handleStatus: '待处理' as HandleStatus },
  { id: 9, name: '周志强', medicalRecordNo: '20260051', combinedDrugs: '恩格列净+SGLT-2抑制剂联用', riskType: '酮症酸中毒风险', riskLevel: '高风险' as RiskLevel, handleStatus: '已处理' as HandleStatus },
  { id: 10, name: '吴桂芳', medicalRecordNo: '20260057', combinedDrugs: '二甲双胍+西咪替丁', riskType: '药物相互作用', riskLevel: '中风险' as RiskLevel, handleStatus: '处理中' as HandleStatus },
]