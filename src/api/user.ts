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
  // {
  //   path: 'dashboard',
  //   name: 'dashboard',
  //   icon: 'icon-[mage--dashboard-chart]',
  //   label: '仪表板',
  //   meta: {
  //     componentName: 'Dashboard',
  //     pinned: true,
  //     showTab: true,
  //   },
  //   component: 'dashboard/index',
  // },

  {
    path: 'pharmacy-knowledge-base',
    redirect: 'pharmacy-knowledge-base/clinical-pharmacy',
    name: 'pharmacyKnowledgeBase',
    icon: 'icon-[ph--books]',
    label: '医药学知识库',
    children: [
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
            label: '药品说明书',
            component: 'drug-information/index',
            meta: {
              componentName: 'DrugInformation',
              showTab: true,
            },
          },
          {
            path: 'medication-instructions',
            name: 'medicationInstructions',
            icon: 'iconify ph--clipboard-text',
            label: '用药交代实用手册',
            component: 'medication-instructions/index',
            meta: {
              componentName: 'MedicationInstructions',
              showTab: true,
            },
          },
          {
            path: 'adverse-drug-reactions',
            name: 'adverseDrugReactions',
            icon: 'iconify ph--warning-octagon',
            label: '药物不良反应',
            component: 'adverse-drug-reactions/index',
            meta: {
              componentName: 'AdverseDrugReactions',
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
        label: '中医药知识库',
        children: [
          {
            path: 'chinese-materia-medica',
            name: 'chineseMateriaMedica',
            icon: 'iconify ph--plant',
            label: '中药材',
            component: 'chinese-materia-medica/index',
            meta: {
              componentName: 'ChineseMateriaMedica',
              showTab: true,
            },
          },
          {
            path: 'tcm-prescriptions',
            name: 'tcmPrescriptions',
            icon: 'iconify ph--prescription',
            label: '中医方剂',
            component: 'tcm-prescriptions/index',
            meta: {
              componentName: 'TCMPrescriptions',
              showTab: true,
            },
          },
          {
            path: 'tcm-terminology',
            name: 'tcmTerminology',
            icon: 'iconify ph--translate',
            label: '中医标准',
            component: 'tcm-terminology/index',
            meta: {
              componentName: 'TCMTerminology',
              showTab: true,
            },
          },
          {
            path: 'chinese-medical-works',
            name: 'chineseMedicalWorks',
            icon: 'iconify ph--book-open-text',
            label: '中医著作',
            component: 'chinese-medical-works/index',
            meta: {
              componentName: 'ChineseMedicalWorks',
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
            path: 'disease-knowledge',
            name: 'diseaseKnowledge',
            icon: 'iconify ph--virus',
            label: '疾病知识',
            component: 'disease-knowledge/index',
            meta: {
              componentName: 'DiseaseKnowledge',
              showTab: true,
            },
          },
          {
            path: 'inspection-knowledge',
            name: 'inspectionKnowledge',
            icon: 'iconify ph--magnifying-glass',
            label: '检查知识',
            component: 'inspection-knowledge/index',
            meta: {
              componentName: 'InspectionKnowledge',
              showTab: true,
            },
          },
          // {
          //   path: 'clinical-knowledge',
          //   name: 'clinicalKnowledge',
          //   icon: 'iconify ph--first-aid-kit',
          //   label: '临床知识',
          //   component: 'clinical-knowledge/index',
          //   meta: {
          //     componentName: 'ClinicalKnowledge',
          //     showTab: true,
          //   },
          // },
          {
            path: 'lab-knowledge',
            name: 'labKnowledge',
            icon: 'iconify ph--flask',
            label: '检验知识',
            component: 'lab-knowledge/index',
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
            component: 'nursing-knowledge/index',
            meta: {
              componentName: 'NursingKnowledge',
              showTab: true,
            },
          },
          // {
          //   path: 'diagnostic-principles',
          //   name: 'diagnosticPrinciples',
          //   icon: 'iconify ph--cross',
          //   label: '中西医诊疗原则',
          //   component: 'diagnostic-principles/index',
          //   meta: {
          //     componentName: 'DiagnosticPrinciples',
          //     showTab: true,
          //   },
          // },
        ],
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
        component: 'patient-records/index',
        meta: {
          componentName: 'PatientRecords',
          showTab: true,
        },
      },
      {
        path: 'follow-up-rules',
        name: 'followUpRules',
        icon: 'iconify ph--list-checks',
        label: '随访规则',
        component: 'follow-up-rules/index',
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
        component: 'follow-up-plan/index',
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
        component: 'lifestyle-guidance/index',
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
    label: '糖尿病疗效及安全评估',
    children: [
      // {
      //   path: 'blood-sugar-targets',
      //   name: 'bloodSugarTargets',
      //   icon: 'iconify ph--drop-half-bottom',
      //   label: '控糖目标',
      //   component: 'blood-sugar-targets/index',
      //   meta: {
      //     componentName: 'BloodSugarTargets',
      //     showTab: true,
      //   },
      // },
      // {
      //   path: 'disease-progression',
      //   name: 'diseaseProgression',
      //   icon: 'iconify ph--activity',
      //   label: '病情进展',
      //   component: 'disease-progression/index',
      //   meta: {
      //     componentName: 'DiseaseProgression',
      //     showTab: true,
      //   },
      // },
      // {
      //   path: 'treatment-effects',
      //   name: 'treatmentEffects',
      //   icon: 'iconify ph--trend-up',
      //   label: '治疗效果',
      //   component: 'treatment-effects/index',
      //   meta: {
      //     componentName: 'TreatmentEffects',
      //     showTab: true,
      //   },
      // },
      {
        path: 'efficacy-report',
        name: 'efficacyReport',
        icon: 'iconify ph--file-search',
        label: '疗效报告',
        component: 'efficacy-report/index',
        meta: {
          componentName: 'EfficacyReport',
          showTab: true,
        },
      },
      {
        path: 'special-population-ai-guide',
        name: 'specialPopulationAiMedication',
        icon: 'iconify ph--users-three',
        label: '特殊人群AI用药指导',
        component: 'special-population-ai-guide/index',
        meta: {
          componentName: 'SpecialPopulationAiMedication',
          showTab: true,
        },
      },
      {
        path: 'ai-drug-guide',
        name: 'aiDrugGuide',
        icon: 'iconify ph--robot',
        label: '合并其他疾病的AI用药指导',
        component: 'ai-drug-guide/index',
        meta: {
          componentName: 'AiDrugGuide',
          showTab: true,
        },
      },
      {
        path: 'glucose-visit-reminder',
        name: 'bloodSugarVisitReminder',
        icon: 'iconify ph--calendar-check',
        label: '血糖管理就诊提醒',
        component: 'glucose-visit-reminder/index',
        meta: {
          componentName: 'BloodSugarVisitReminder',
          showTab: true,
        },
      },
      {
        path: 'treatment-effectiveness',
        name: 'medicationEffectiveness',
        icon: 'iconify ph--chart-line-up',
        label: '药物治疗方案有效性',
        component: 'treatment-effectiveness/index',
        meta: {
          componentName: 'MedicationEffectiveness',
          showTab: true,
        },
      },
    ],
  },
  {
    path: 'pharmaceutical-care',
    redirect: 'pharmaceutical-care/ai-drug-reminder',
    name: 'pharmaceuticalCare',
    icon: 'iconify ph--syringe',
    label: '糖尿病药学服务管理',
    children: [
      // {
      //   path: 'personalized-medication',
      //   name: 'personalizedMedication',
      //   icon: 'iconify ph--prescription',
      //   label: '个性化用药方案',
      //   component: 'personalized-medication/index',
      //   meta: {
      //     componentName: 'PersonalizedMedication',
      //     showTab: true,
      //   },
      // },
      // {
      //   path: 'medication-education',
      //   name: 'medicationEducation',
      //   icon: 'iconify ph--chat-circle-text',
      //   label: '用药宣教与咨询',
      //   component: 'medication-education/index',
      //   meta: {
      //     componentName: 'MedicationEducation',
      //     showTab: true,
      //   },
      // },

      {
        path: 'health-education',
        name: 'scienceEducation',
        icon: 'iconify ph--book-open-text',
        label: '科普教育',
        component: 'health-education/index',
        meta: {
          componentName: 'ScienceEducation',
          showTab: true,
        },
      },
      {
        path: 'ai-drug-reminder',
        name: 'aiDrugReminder',
        icon: 'iconify ph--bell-ringing',
        label: 'AI用药提醒与药物咨询',
        component: 'ai-drug-reminder/index',
        meta: {
          componentName: 'AiDrugReminder',
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
    label: '糖尿病用药安全预警',
    children: [
      {
        path: 'alert-management',
        name: 'alertManagement',
        icon: 'iconify ph--bell',
        label: '预警管理',
        component: 'alert-management/index',
        meta: {
          componentName: 'AlertManagement',
          showTab: true,
        },
      },
      {
        path: 'adverse-reaction-warning',
        name: 'adverseReactionEducation',
        icon: 'iconify ph--warning-octagon',
        label: '不良反应预警与教育',
        component: 'adverse-reaction-warning/index',
        meta: {
          componentName: 'AdverseReactionEducation',
          showTab: true,
        },
      },
      {
        path: 'interaction-education',
        name: 'interactionEducation',
        icon: 'iconify ph--arrows-left-right',
        label: '相互作用识别与教育',
        component: 'interaction-education/index',
        meta: {
          componentName: 'InteractionEducation',
          showTab: true,
        },
      },
    ],
  },
  // {
  //   path: 'eight-business-scenarios',
  //   redirect: 'eight-business-scenarios/treatment-effectiveness',
  //   name: 'eightBusinessScenarios',
  //   icon: 'iconify ph--grid-four',
  //   label: '八大业务场景',
  //   children: [
  //     {
  //       path: 'treatment-effectiveness',
  //       name: 'medicationEffectiveness',
  //       icon: 'iconify ph--chart-line-up',
  //       label: '药物治疗方案有效性',
  //       component: 'treatment-effectiveness/index',
  //       meta: {
  //         componentName: 'MedicationEffectiveness',
  //         showTab: true,
  //       },
  //     },
  //   ],
  // },
  // {
  //   path: 'data-cleaning',
  //   redirect: 'data-cleaning/cleaning',
  //   name: 'dataCleaning',
  //   icon: 'iconify ph--broom',
  //   label: '数据清洗',
  //   children: [
  //     {
  //       path: 'cleaning',
  //       name: 'cleaning',
  //       icon: 'iconify ph--broom',
  //       label: '数据清洗',
  //       component: 'data-cleaning/index',
  //       meta: {
  //         componentName: 'DataCleaning',
  //         showTab: true,
  //       },
  //     },
  //   ],
  // },
]

export async function signIn(data: { username: string; password: string }) {
  return request<UserInfo>({
    url: '/api/v1/user/login',
    method: 'post',
    data,
  })
}
