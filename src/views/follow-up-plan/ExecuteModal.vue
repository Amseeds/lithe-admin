<script setup lang="ts">
import {
  NForm,
  NFormItem,
  NSelect,
  NInput,
  NButton,
  NSwitch,
  NDataTable,
  NSpin,
  type MessageApi,
} from 'naive-ui'
import { ref, reactive, computed, onMounted, h } from 'vue'

import {
  getPlanDetail,
  executePlan,
  type FollowUpPlan,
  type FollowUpPlanDetail,
  type ExecutePlanForm,
} from '@/api/followupPlan'
import { getLabCheckItemOptions, type LabCheckItem } from '@/api/followup'

import type { DataTableColumns, FormRules } from 'naive-ui'

const props = defineProps<{
  planId: string
  mode: 'view' | 'execute'
  planData?: FollowUpPlan
  message: MessageApi
  onSuccess?: () => void
  onClose?: () => void
}>()

const isView = computed(() => props.mode === 'view')
const isLoading = ref(false)
const isSubmitting = ref(false)

// 选项数据
const labCheckItemOptions = ref<{ label: string; value: string }[]>([])

// 表单数据
const form = reactive<ExecutePlanForm & { planType?: string }>({
  planId: '',
  ruleId: '',
  userId: '',
  planType: '',
  followupMethod: '',
  labResultsList: [],
  medicationAdjustment: '',
  doctorAdvice: '',
  nextFollowupFlag: 0,
  emergencyFlag: 0,
  emergencyReason: '',
})

const rules: FormRules = {
  followupMethod: [{ required: true, message: '请选择随访方式', trigger: 'blur' }],
}

const followupMethodOptions = [
  { label: '电话随访', value: 'PHONE' },
  { label: '线上问诊', value: 'ONLINE' },
  { label: '线下门诊', value: 'OUTPATIENT' },
]

// 实验室检查表格列
const labResultsColumns: DataTableColumns<{ labName: string; labValue: string }> = [
  {
    type: 'index',
    title: '序号',
    width: 60,
  },
  {
    key: 'labName',
    title: '体检指标',
    render: (row, index) => {
      if (isView.value) {
        return row.labName || '-'
      }
      return h(NSelect, {
        value: row.labName,
        options: labCheckItemOptions.value,
        clearable: true,
        filterable: true,
        onUpdateValue: (val: string) => {
          form.labResultsList[index].labName = val
        },
      })
    },
  },
  {
    key: 'labValue',
    title: '指标值',
    width: 120,
    render: (row, index) => {
      if (isView.value) {
        return row.labValue || '-'
      }
      return h(NInput, {
        value: row.labValue,
        placeholder: '指标值',
        clearable: true,
        onUpdateValue: (val: string) => {
          form.labResultsList[index].labValue = val
        },
      })
    },
  },
  {
    key: 'actions',
    title: '操作',
    width: 80,
    hide: isView.value,
    render: (_, index) => {
      if (isView.value) return null
      return h(
        NButton,
        {
          type: 'error',
          size: 'small',
          onClick: () => deleteRow(index),
        },
        { default: () => '删除' }
      )
    },
  },
]

// 加载选项
const loadOptions = async () => {
  try {
    const res = await getLabCheckItemOptions()
    labCheckItemOptions.value = (res.data || []).map((item: LabCheckItem) => ({
      label: item.name,
      value: item.name,
    }))
  } catch (error) {
    console.error('加载选项失败:', error)
  }
}

// 加载详情
const loadDetail = async () => {
  if (!props.planId) return
  isLoading.value = true
  try {
    const res = await getPlanDetail(props.planId)
    const data = res.data
    form.planId = data.planId
    form.ruleId = data.ruleId
    form.userId = String(data.userId)
    form.planType = data.planType
    form.followupMethod = data.followupMethod
    form.labResultsList = data.labResultsList || []
    form.medicationAdjustment = data.medicationAdjustment || ''
    form.doctorAdvice = data.doctorAdvice || ''
  } catch (error) {
    console.error('加载详情失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 初始化
onMounted(() => {
  loadOptions()
  if (props.mode === 'view') {
    loadDetail()
  } else if (props.planData) {
    // 执行模式，使用传入的数据
    form.planId = props.planData.planId
    form.ruleId = props.planData.ruleId
    form.userId = String(props.planData.userId)
    form.planType = props.planData.planType
    form.followupMethod = props.planData.followupMethod
    form.labResultsList = []
  }
})

// 添加检查项
const handleAdd = () => {
  form.labResultsList.push({ labName: '', labValue: '' })
}

// 删除检查项
const deleteRow = (index: number) => {
  form.labResultsList.splice(index, 1)
}

// 提交
const handleSubmit = async () => {
  if (!form.followupMethod) {
    props.message.error('请选择随访方式')
    return
  }

  isSubmitting.value = true
  try {
    const submitData: ExecutePlanForm = {
      planId: form.planId,
      ruleId: form.ruleId,
      userId: form.userId,
      planType: form.planType || '',
      followupMethod: form.followupMethod,
      labResultsList: form.labResultsList.filter((item) => item.labName),
      medicationAdjustment: form.medicationAdjustment,
      doctorAdvice: form.doctorAdvice,
      nextFollowupFlag: form.nextFollowupFlag,
      emergencyFlag: form.emergencyFlag,
      emergencyReason: form.emergencyReason,
    }

    await executePlan(submitData)
    props.message.success('随访执行成功！')
    props.onSuccess?.()
  } catch (error: unknown) {
    console.error('提交失败:', error)
    const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
    props.message.error(errorMessage || '提交失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <NSpin :show="isLoading">
    <div class="p-2">
      <NForm
        :model="form"
        :rules="rules"
        label-placement="left"
        label-width="100"
        :disabled="isView"
      >
        <NFormItem
          label="住院号"
          path="userId"
        >
          <NInput
            :value="form.userId"
            disabled
            placeholder="住院号"
          />
        </NFormItem>
        <NFormItem
          label="随访类型"
          path="planType"
        >
          <NInput
            :value="form.planType"
            disabled
            placeholder="随访类型"
          />
        </NFormItem>
        <NFormItem
          label="随访方式"
          path="followupMethod"
        >
          <NSelect
            v-model:value="form.followupMethod"
            :options="followupMethodOptions"
            placeholder="请选择随访方式"
          />
        </NFormItem>
        <NFormItem label="实验室检查">
          <NButton
            v-if="!isView"
            type="primary"
            size="small"
            @click="handleAdd"
          >
            + 检查
          </NButton>
        </NFormItem>
        <div class="mb-4">
          <NDataTable
            :columns="labResultsColumns.filter((col) => !col.hide)"
            :data="form.labResultsList"
            size="small"
          />
        </div>
        <NFormItem
          label="用药调整内容"
          path="medicationAdjustment"
        >
          <NInput
            v-model:value="form.medicationAdjustment"
            placeholder="请输入用药调整内容"
          />
        </NFormItem>
        <NFormItem
          label="医生建议"
          path="doctorAdvice"
        >
          <NInput
            v-model:value="form.doctorAdvice"
            placeholder="请输入医生建议"
          />
        </NFormItem>
        <NFormItem
          label="紧急情况"
          path="emergencyFlag"
        >
          <NSwitch
            v-model:value="form.emergencyFlag"
            :checked-value="1"
            :unchecked-value="0"
          />
        </NFormItem>
        <NFormItem
          v-if="form.emergencyFlag"
          label="紧急情况说明"
          path="emergencyReason"
        >
          <NInput
            v-model:value="form.emergencyReason"
            placeholder="请输入紧急情况说明"
          />
        </NFormItem>
        <NFormItem
          label="创建下次随访"
          path="nextFollowupFlag"
        >
          <NSwitch
            v-model:value="form.nextFollowupFlag"
            :checked-value="1"
            :unchecked-value="0"
          />
        </NFormItem>
      </NForm>
      <div
        v-if="!isView"
        class="flex justify-end gap-2"
      >
        <NButton @click="props.onClose?.()">取消</NButton>
        <NButton
          type="primary"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          @click="handleSubmit"
        >
          确定
        </NButton>
      </div>
    </div>
  </NSpin>
</template>
