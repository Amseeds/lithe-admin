<script setup lang="ts">
import {
  NDrawer,
  NDrawerContent,
  NInput,
  NSelect,
  NSpace,
  NButton,
  NDivider,
  NDataTable,
  NDatePicker,
  useMessage,
  type DataTableColumns,
  type SelectOption,
} from 'naive-ui'
import { h, ref, watch } from 'vue'
import dayjs from 'dayjs'

import type { MedicationPlan } from './mock/types'
import { getPatientList, type PatientQueryParams } from '@/api/patientRecords'
import { createLifestyleGuidance, editPlan } from '@/api/personalizedMedication'

interface MedicationDetailItem {
  drugName: string
  usageDosage: string
  frequency: string
}

const props = defineProps<{
  show: boolean
  patientId?: string
  plan?: MedicationPlan | null
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  success: []
}>()

const message = useMessage()

const drawerTitle = ref('新建用药方案')
const stratificationOptions = [
  { label: '年轻低危', value: '年轻低危' },
  { label: '老年衰弱', value: '老年衰弱' },
  { label: '肾功能不全', value: '肾功能不全' },
  { label: '妊娠期', value: '妊娠期' },
  { label: '手术期', value: '手术期' },
  { label: '心血管高危', value: '心血管高危' },
]

const planCycleOptions = [
  { label: '周', value: '周' },
  { label: '月', value: '月' },
  { label: '季度', value: '季度' },
  { label: '年', value: '年' },
]

const patientOptions = ref<(SelectOption & { patientName?: string })[]>([])
const patientLoading = ref(false)
const selectedPatient = ref<string | null>(null)
const selectedPatientName = ref('')
const selectedStratum = ref<string | null>(null)
const selectedCycle = ref<string | null>(null)
const hba1cTarget = ref('')
const fastingBloodTarget = ref('')
const status = ref('2')
const startTime = ref<number | null>(null)
const endTime = ref<number | null>(null)

const medicationColumns: DataTableColumns<MedicationDetailItem> = [
  {
    title: '药物名称',
    key: 'drugName',
    width: 140,
    render: (row, index) =>
      h(NInput, {
        value: row.drugName,
        placeholder: '药物名称',
        size: 'small',
        onUpdateValue: (val) => {
          medicationList.value[index].drugName = val
        },
      }),
  },
  {
    title: '用法用量',
    key: 'usageDosage',
    width: 140,
    render: (row, index) =>
      h(NInput, {
        value: row.usageDosage,
        placeholder: '用法用量',
        size: 'small',
        onUpdateValue: (val) => {
          medicationList.value[index].usageDosage = val
        },
      }),
  },
  {
    title: '频次',
    key: 'frequency',
    width: 120,
    render: (row, index) =>
      h(NInput, {
        value: row.frequency,
        placeholder: '频次',
        size: 'small',
        onUpdateValue: (val) => {
          medicationList.value[index].frequency = val
        },
      }),
  },
  {
    title: '操作',
    key: 'action',
    width: 60,
    render: (_, index) =>
      h(
        NButton,
        {
          size: 'small',
          type: 'error',
          text: true,
          onClick: () => medicationList.value.splice(index, 1),
        },
        () => '删除',
      ),
  },
]

const medicationList = ref<MedicationDetailItem[]>([])

function addMedicationRow() {
  medicationList.value.push({
    drugName: '',
    usageDosage: '',
    frequency: '',
  })
}

const loadPatientList = async (searchValue: string) => {
  patientLoading.value = true
  try {
    const params: PatientQueryParams = {
      zyh: searchValue,
      pageNum: 1,
      pageSize: 100,
    }
    const { data } = await getPatientList(params)
    const list = data.list || []
    patientOptions.value = list.map((item) => ({
      label: `${item.name} (${item.zyh})`,
      value: item.zyh,
      patientName: item.name,
    }))
  } catch (error) {
    message.error('获取患者列表失败')
    console.error(error)
  } finally {
    patientLoading.value = false
  }
}

const handlePatientSearch = (query: string) => {
  loadPatientList(query)
}

const handlePatientChange = (value: string) => {
  const target = patientOptions.value.find((x) => x.value === value)
  if (target) {
    selectedPatientName.value = target.patientName || ''
  } else {
    selectedPatientName.value = ''
  }
}

watch(
  () => props.show,
  (val) => {
    if (val) {
      console.log(props, 'props=====')
      if (props.plan) {
        drawerTitle.value = '编辑用药方案'
        selectedPatient.value = props.plan.patientId
        selectedPatientName.value = props.plan.patientName || ''
        selectedStratum.value = (props.plan as any).stratification || null
        selectedCycle.value = props.plan.planCycle || null
        hba1cTarget.value = props.plan.hba1cTarget || ''
        fastingBloodTarget.value = props.plan.fastingBloodSugarTarget || ''
        status.value = String(props.plan.status) || '2'
        startTime.value = props.plan.startTime ? new Date(props.plan.startTime).getTime() : null
        endTime.value = props.plan.endTime ? new Date(props.plan.endTime).getTime() : null
        medicationList.value = props.plan.detailList || []
        if (props.plan.patientId) {
          patientOptions.value = [
            {
              label: `${props.plan.patientName} (${props.plan.patientId})`,
              value: props.plan.patientId,
              patientName: props.plan.patientName,
            },
          ]
        }
      } else {
        drawerTitle.value = '新建用药方案'
        selectedPatient.value = null
        selectedPatientName.value = ''
        selectedStratum.value = null
        selectedCycle.value = null
        hba1cTarget.value = ''
        fastingBloodTarget.value = ''
        startTime.value = null
        endTime.value = null
        medicationList.value = []
        patientOptions.value = []
        if (props.patientId) {
          selectedPatient.value = props.patientId
          loadPatientList(props.patientId)
        }
      }
    }
  },
)

function handleClose() {
  emit('update:show', false)
}

function handleSaveDraft() {
  status.value = '1'
  handleCreatePlan()
}

async function handleCreatePlan() {
  if (!selectedPatient.value) {
    message.warning('请选择患者')
    return
  }
  if (!startTime.value || !endTime.value) {
    message.warning('请选择方案周期')
    return
  }
  if (medicationList.value.length === 0) {
    message.warning('请至少添加一条用药明细')
    return
  }

  const formData: any = {
    patientId: selectedPatient.value,
    patientName: selectedPatientName.value,
    planCycle: selectedCycle.value || '',
    hba1cTarget: hba1cTarget.value || '',
    fastingBloodSugarTarget: fastingBloodTarget.value || '',
    status: status.value,
    detailList: medicationList.value,
    startTime: startTime.value ? dayjs(startTime.value).format('YYYY-MM-DD') : '',
    endTime: endTime.value ? dayjs(endTime.value).format('YYYY-MM-DD') : '',
  }

  if (props.plan?.id) {
    formData.id = props.plan.id
  }

  try {
    if (props.plan?.id) {
      const { code } = await editPlan(formData)
      if (code === 200) {
        emit('success')
        emit('update:show', false)
        message.success('修改成功')
      }
    } else {
      const { code } = await createLifestyleGuidance(formData)
      if (code === 200) {
        emit('success')
        emit('update:show', false)
        message.success('方案生成成功')
      }
    }
  } catch (error) {
    message.error(props.plan?.id ? '修改方案失败' : '创建方案失败')
    console.error(error)
  }
}
</script>

<template>
  <NDrawer
    :show="show"
    placement="right"
    :width="560"
    @update:show="(val) => emit('update:show', val)"
  >
    <NDrawerContent
      :title="drawerTitle"
      closable
    >
      <div class="drawer-form">
        <div class="form-item">
          <label><span class="required-mark">*</span>患者选择</label>
          <NSelect
            v-model:value="selectedPatient"
            :options="patientOptions"
            :loading="patientLoading"
            placeholder="输入住院号搜索患者"
            filterable
            remote
            clearable
            @search="handlePatientSearch"
            @update:value="handlePatientChange"
          />
        </div>
        <div class="form-item">
          <label><span class="required-mark">*</span>方案周期</label>
          <NSpace>
            <NDatePicker
              v-model:value="startTime"
              type="date"
              placeholder="开始日期"
              style="width: 150px"
            />
            <span>至</span>
            <NDatePicker
              v-model:value="endTime"
              type="date"
              placeholder="结束日期"
              style="width: 150px"
            />
          </NSpace>
        </div>
        <!-- <div class="form-item">
          <label>患者分层</label>
          <NSelect
            v-model:value="selectedStratum"
            :options="stratificationOptions"
            placeholder="请选择患者分层"
          />
        </div> -->
        <NDivider>控糖目标</NDivider>
        <div class="form-item">
          <label>HbA1c目标(%)</label>
          <NInput
            v-model:value="hba1cTarget"
            placeholder="请输入HbA1c目标值"
          />
        </div>
        <div class="form-item">
          <label>空腹血糖目标(mmol/L)</label>
          <NInput
            v-model:value="fastingBloodTarget"
            placeholder="请输入空腹血糖目标值"
          />
        </div>
        <NDivider>用药明细<span class="required-mark">*</span></NDivider>
        <div class="form-item">
          <div class="medication-table-header">
            <NButton
              size="small"
              type="primary"
              @click="addMedicationRow"
            >
              + 添加药物
            </NButton>
          </div>
          <NDataTable
            :columns="medicationColumns"
            :data="medicationList"
            size="small"
            :bordered="true"
            style="width: 100%"
          />
        </div>
        <div class="form-item">
          <label>安全提示</label>
          <div class="section-note">
            请确保所选药物无禁忌症，注意肝肾功能、药物相互作用等安全因素
          </div>
        </div>
      </div>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="handleClose">取消</NButton>
          <NButton @click="handleSaveDraft">保存草稿</NButton>
          <NButton
            type="primary"
            @click="handleCreatePlan"
          >
            生成并生效
          </NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped>
.drawer-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item label {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.required-mark {
  color: #f56c6c;
  margin-right: 2px;
}

.section-note {
  padding: 10px 12px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.medication-table-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}
</style>
