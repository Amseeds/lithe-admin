import request from '@/utils/request'

import type { MenuMixedOptions } from '@/router/interface'

export interface UserInfo {
  avatar: string
  id: number
  name: string
  role: 'admin' | 'user' | 'guest'
  token: string | null
  menu: MenuMixedOptions[]
}

/**
 * ============================================================================
 * 前端固定菜单配置
 * ============================================================================
 * 【修改日期】2026-03-26
 * 【修改原因】临时将菜单配置改为前端固定,不再依赖后端API接口
 * 【原方案】菜单数据从后端接口 `/api/user/sign-in` 的响应中获取
 * 【新方案】菜单数据在前端固定定义,登录后直接使用
 *
 * 【恢复后端菜单配置的步骤】:
 * 1. 删除下面的 fixedMenu 常量定义
 * 2. 恢复使用后端返回的菜单数据 (注释掉 src/stores/user.ts 中使用 fixedMenu 的代码)
 * 3. 确保后端接口返回的菜单数据包含所有需要的菜单项
 * ============================================================================
 */
export const fixedMenu: MenuMixedOptions[] = [
  {
    path: 'dashboard',
    name: 'dashboard',
    icon: 'icon-[mage--dashboard-chart]',
    label: '仪表板',
    meta: {
      componentName: 'Dashboard',
      pinned: true,
      showTab: true,
    },
    component: 'dashboard/index',
  },
  {
    path: 'data-show',
    name: 'dataShow',
    label: '数据展示',
    icon: 'icon-[fluent--data-area-32-regular]',
    redirect: 'data-show/data-table',
    children: [
      {
        path: 'data-table',
        name: 'dataTable',
        icon: 'iconify ph--table',
        label: '数据表格',
        meta: {
          componentName: 'DataTable',
          title: '数据表格',
          showTab: true,
        },
        component: 'data-show/data-table/index',
      },
      {
        path: 'data-form',
        name: 'dataForm',
        icon: 'iconify ph--article',
        label: '数据表单',
        meta: {
          componentName: 'DataForm',
          title: '数据表单',
          showTab: true,
        },
        component: 'data-show/data-form/index',
      },
    ],
  },
  {
    path: 'clinical-pharmacy',
    redirect: 'clinical-pharmacy/drug-information',
    name: 'clinicalPharmacy',
    icon: 'iconify ph--first-aid',
    label: '临床药学知识库',
    children: [
      {
        path: 'drug-information',
        name: 'drugInformation',
        icon: 'iconify ph--pill',
        label: '药品信息',
        component: 'clinical-pharmacy/drug-information/index',
        meta: {
          componentName: 'DrugInformation',
          showTab: true,
        },
      },
      {
        path: 'examination-inspection',
        name: 'examinationInspection',
        icon: 'iconify ph--test-tube',
        label: '检验检查',
        component: 'clinical-pharmacy/examination-inspection/index',
        meta: {
          componentName: 'ExaminationInspection',
          showTab: true,
        },
      },
      {
        path: 'nursing-information',
        name: 'nursingInformation',
        icon: 'iconify ph--heartbeat',
        label: '护理信息',
        component: 'clinical-pharmacy/nursing-information/index',
        meta: {
          componentName: 'NursingInformation',
          showTab: true,
        },
      },
      {
        path: 'drug-interactions',
        name: 'drugInteractions',
        icon: 'iconify ph--arrows-left-right',
        label: '药物相互作用',
        component: 'clinical-pharmacy/drug-interactions/index',
        meta: {
          componentName: 'DrugInteractions',
          showTab: true,
        },
      },
      {
        path: 'adverse-drug-reactions',
        name: 'adverseDrugReactions',
        icon: 'iconify ph--warning-circle',
        label: '药物不良反应',
        component: 'clinical-pharmacy/adverse-drug-reactions/index',
        meta: {
          componentName: 'AdverseDrugReactions',
          showTab: true,
        },
      },
      {
        path: 'medication-guidance',
        name: 'medicationGuidance',
        icon: 'iconify ph--prescription',
        label: '用药指导',
        component: 'clinical-pharmacy/medication-guidance/index',
        meta: {
          componentName: 'MedicationGuidance',
          showTab: true,
        },
      },
    ],
  },
  {
    path: 'tcm-knowledge',
    redirect: 'tcm-knowledge/chinese-materia-medica',
    name: 'tcmKnowledge',
    icon: 'iconify ph--flower-lotus',
    label: '医药知识库',
    children: [
      {
        path: 'chinese-materia-medica',
        name: 'chineseMateriaMedica',
        icon: 'iconify ph--plant',
        label: '中药材',
        component: 'clinical-pharmacy/chinese-materia-medica/index',
        meta: {
          componentName: 'ChineseMateriaMedica',
          showTab: true,
        },
      },
      {
        path: 'tcm-prescriptions',
        name: 'tcmPrescriptions',
        icon: 'iconify ph--scroll',
        label: '中医方剂',
        component: 'clinical-pharmacy/tcm-prescriptions/index',
        meta: {
          componentName: 'TCMPrescriptions',
          showTab: true,
        },
      },
      {
        path: 'tcm-terminology',
        name: 'tcmTerminology',
        icon: 'iconify ph--book-open',
        label: '中医术语',
        component: 'clinical-pharmacy/tcm-terminology/index',
        meta: {
          componentName: 'TCMTerminology',
          showTab: true,
        },
      },
      {
        path: 'tcm-classics',
        name: 'tcmClassics',
        icon: 'iconify ph--books',
        label: '中医典籍',
        component: 'clinical-pharmacy/tcm-classics/index',
        meta: {
          componentName: 'TCMClassics',
          showTab: true,
        },
      },
    ],
  },
  {
    path: 'clinical-diagnosis',
    redirect: 'clinical-diagnosis/inspection-knowledge',
    name: 'clinicalDiagnosis',
    icon: 'iconify ph--stethoscope',
    label: '临床诊疗知识库',
    children: [
      {
        path: 'inspection-knowledge',
        name: 'inspectionKnowledge',
        icon: 'iconify ph--magnifying-glass',
        label: '检查知识',
        component: 'clinical-pharmacy/inspection-knowledge/index',
        meta: {
          componentName: 'InspectionKnowledge',
          showTab: true,
        },
      },
      {
        path: 'clinical-knowledge',
        name: 'clinicalKnowledge',
        icon: 'iconify ph--first-aid-kit',
        label: '临床知识',
        component: 'clinical-pharmacy/clinical-knowledge/index',
        meta: {
          componentName: 'ClinicalKnowledge',
          showTab: true,
        },
      },
      {
        path: 'lab-knowledge',
        name: 'labKnowledge',
        icon: 'iconify ph--flask',
        label: '检验知识',
        component: 'clinical-pharmacy/lab-knowledge/index',
        meta: {
          componentName: 'LabKnowledge',
          showTab: true,
        },
      },
      {
        path: 'nursing-knowledge',
        name: 'nursingKnowledge',
        icon: 'iconify ph--hands-praying',
        label: '护理知识',
        component: 'clinical-pharmacy/nursing-knowledge/index',
        meta: {
          componentName: 'NursingKnowledge',
          showTab: true,
        },
      },
      {
        path: 'diagnostic-principles',
        name: 'diagnosticPrinciples',
        icon: 'iconify ph--cross',
        label: '中西医诊疗原则',
        component: 'clinical-pharmacy/diagnostic-principles/index',
        meta: {
          componentName: 'DiagnosticPrinciples',
          showTab: true,
        },
      },
    ],
  },
  {
    path: 'patient-management',
    redirect: 'patient-management/patient-records',
    name: 'patientManagement',
    icon: 'iconify ph--user-circle',
    label: '患者管理',
    children: [
      {
        path: 'patient-records',
        name: 'patientRecords',
        icon: 'iconify ph--folder-user',
        label: '患者档案',
        component: 'clinical-pharmacy/patient-records/index',
        meta: {
          componentName: 'PatientRecords',
          showTab: true,
        },
      },
    ],
  },
  {
    path: 'pharmaceutical-care',
    redirect: 'pharmaceutical-care/personalized-medication',
    name: 'pharmaceuticalCare',
    icon: 'iconify ph--syringe',
    label: '药学服务',
    children: [
      {
        path: 'personalized-medication',
        name: 'personalizedMedication',
        icon: 'iconify ph--prescription',
        label: '个性化用药方案',
        component: 'clinical-pharmacy/personalized-medication/index',
        meta: {
          componentName: 'PersonalizedMedication',
          showTab: true,
        },
      },
      {
        path: 'medication-education',
        name: 'medicationEducation',
        icon: 'iconify ph--chat-circle-text',
        label: '用药宣教与咨询',
        component: 'clinical-pharmacy/medication-education/index',
        meta: {
          componentName: 'MedicationEducation',
          showTab: true,
        },
      },
      {
        path: 'follow-up-rules',
        name: 'followUpRules',
        icon: 'iconify ph--list-checks',
        label: '随访规则',
        component: 'clinical-pharmacy/follow-up-rules/index',
        meta: {
          componentName: 'FollowUpRules',
          showTab: true,
        },
      },
      {
        path: 'follow-up-plan',
        name: 'followUpPlan',
        icon: 'iconify ph--calendar-check',
        label: '随访计划',
        component: 'clinical-pharmacy/follow-up-plan/index',
        meta: {
          componentName: 'FollowUpPlan',
          showTab: true,
        },
      },
      {
        path: 'lifestyle-guidance',
        name: 'lifestyleGuidance',
        icon: 'iconify ph--heart',
        label: '生活方式指导',
        component: 'clinical-pharmacy/lifestyle-guidance/index',
        meta: {
          componentName: 'LifestyleGuidance',
          showTab: true,
        },
      },
    ],
  },
  {
    path: 'efficacy-assessment',
    redirect: 'efficacy-assessment/treatment-effects',
    name: 'efficacyAssessment',
    icon: 'iconify ph--chart-line-up',
    label: '疗效评估',
    children: [
      {
        path: 'treatment-effects',
        name: 'treatmentEffects',
        icon: 'iconify ph--trend-up',
        label: '治疗效果',
        component: 'clinical-pharmacy/treatment-effects/index',
        meta: {
          componentName: 'TreatmentEffects',
          showTab: true,
        },
      },
      {
        path: 'disease-progression',
        name: 'diseaseProgression',
        icon: 'iconify ph--activity',
        label: '病情进展',
        component: 'clinical-pharmacy/disease-progression/index',
        meta: {
          componentName: 'DiseaseProgression',
          showTab: true,
        },
      },
      {
        path: 'blood-sugar-targets',
        name: 'bloodSugarTargets',
        icon: 'iconify ph--drop-half-bottom',
        label: '控糖目标',
        component: 'clinical-pharmacy/blood-sugar-targets/index',
        meta: {
          componentName: 'BloodSugarTargets',
          showTab: true,
        },
      },
      {
        path: 'efficacy-report',
        name: 'efficacyReport',
        icon: 'iconify ph--file-search',
        label: '疗效报告',
        component: 'clinical-pharmacy/efficacy-report/index',
        meta: {
          componentName: 'EfficacyReport',
          showTab: true,
        },
      },
    ],
  },
  {
    path: 'safety-alert',
    redirect: 'safety-alert/alert-management',
    name: 'safetyAlert',
    icon: 'iconify ph--warning',
    label: '安全预警中心',
    children: [
      {
        path: 'alert-management',
        name: 'alertManagement',
        icon: 'iconify ph--bell',
        label: '预警管理',
        component: 'clinical-pharmacy/alert-management/index',
        meta: {
          componentName: 'AlertManagement',
          showTab: true,
        },
      },
    ],
  },
]

export async function signIn(data: { account: string; password: string }) {
  return request<UserInfo>({
    url: '/api/v1/user/login',
    method: 'post',
    data,
  })
}
