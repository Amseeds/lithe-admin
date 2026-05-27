<script setup lang="ts">
import {
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NDatePicker,
  NButton,
  useMessage,
  type FormRules,
  type FormInst,
} from 'naive-ui'
import { ref, reactive, watch, computed } from 'vue'

import {
  getLabCheckItemOptions,
  getFollowupContentOptions,
  generatePlan,
  createPlan,
  type FollowUpForm,
  type LabCheckItem,
  type FollowupContent,
} from '@/api'



// 表单数据类型
interface LocalForm {
  ruleId: string
  userId: string
  planType: 'ROUTINE' | 'EMERGENCY' | 'REVIEW'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'SPECIAL'
  labCheckItemsList: string[]
  followupContentList: string[]
  scheduledTime: string | null // 格式化时间字符串
  followupMethod: 'PHONE' | 'ONLINE' | 'OUTPATIENT'
  remark: string
  status: string
}

const props = defineProps<{
  show: boolean
  userId: string
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  success: []
}>()

const message = useMessage()
const formRef = ref<FormInst | null>(null)

// 选项数据
const labCheckItemOptions = ref<{ label: string; value: string }[]>([])
const followupContentOptions = ref<{ label: string; value: string }[]>([])

// 表单数据
const form = reactive<LocalForm>({
  ruleId: '',
  userId: '',
  planType: 'ROUTINE',
  riskLevel: 'LOW',
  labCheckItemsList: [],
  followupContentList: [],
  scheduledTime: null,
  followupMethod: 'PHONE',
  remark: '',
  status: 'PENDING',
})

// 表单验证规则
const rules: FormRules = {
  planType: [{ required: true, message: '请选择随访类型', trigger: 'blur' }],
  riskLevel: [{ required: true, message: '请选择风险等级', trigger: 'blur' }],
  labCheckItemsList: [{ required: true, message: '请选择检查项目', trigger: 'blur', type: 'array' }],
  followupContentList: [{ required: true, message: '请选择随访内容', trigger: 'blur', type: 'array' }],
  scheduledTime: [{ required: true, message: '请选择计划随访时间', trigger: ['blur', 'change'] }],
  followupMethod: [{ required: true, message: '请选择随访方式', trigger: 'blur' }],
}

// 随访类型选项
const planTypeOptions = [
  { label: '常规随访', value: 'ROUTINE' },
  { label: '紧急随访', value: 'EMERGENCY' },
  { label: '复查', value: 'REVIEW' },
]

// 风险等级选项
const riskLevelOptions = [
  { label: '低', value: 'LOW' },
  { label: '中', value: 'MEDIUM' },
  { label: '高', value: 'HIGH' },
  { label: '特殊人群', value: 'SPECIAL' },
]

// 随访方式选项
const followupMethodOptions = [
  { label: '电话随访', value: 'PHONE' },
  { label: '线上问诊', value: 'ONLINE' },
  { label: '线下门诊', value: 'OUTPATIENT' },
]

// 弹窗显示状态
const dialogVisible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val),
})

// 加载选项数据
const loadOptions = async () => {
  try {
    const [labRes, contentRes] = await Promise.all([
      getLabCheckItemOptions(),
      getFollowupContentOptions(),
    ])
    labCheckItemOptions.value = (labRes.data || []).map((item: LabCheckItem) => ({
      label: item.name,
      value: item.name,
    }))
    followupContentOptions.value = (contentRes.data || []).map((item: FollowupContent) => ({
      label: item.contentName,
      value: item.contentName,
    }))
  } catch (error) {
    console.error('加载选项失败:', error)
  }
}

// 加载默认随访计划
const loadDefaultPlan = async () => {
  if (!props.userId) return
  try {
    const { data } = await generatePlan({ userId: props.userId })
    form.ruleId = data.ruleId || ''
    form.userId = String(data.userId || props.userId)
    form.planType = (data.planType as FollowUpForm['planType']) || 'ROUTINE'
    form.riskLevel = (data.riskLevel as FollowUpForm['riskLevel']) || 'LOW'
    form.labCheckItemsList = data.labCheckItemsList || []
    form.followupContentList = data.followupContentList || []
    form.scheduledTime = data.scheduledTime || null
    form.followupMethod = (data.followupMethod as FollowUpForm['followupMethod']) || 'PHONE'
  } catch (error) {
    console.error('加载默认计划失败:', error)
    form.userId = String(props.userId)
  }
}

// 监听弹窗打开
watch(dialogVisible, (val) => {
  if (val) {
    loadOptions()
    loadDefaultPlan()
  }
})

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    if (!form.scheduledTime) {
      message.error('请选择计划随访时间')
      return
    }

    const res = await createPlan(form as FollowUpForm)

    // 检查接口返回是否成功
    if (res.code === 200 || res.code === 201) {
      message.success('新增随访计划成功！')
      emit('success')
      dialogVisible.value = false
    } else {
      message.error(res.message || '新增随访计划失败')
    }
  } catch (error: unknown) {
    console.error('提交失败:', error)
    const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
    message.error(errorMessage || '提交失败，请重试')
  }
}

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
}
</script>

<template>
  <NModal
    v-model:show="dialogVisible"
    preset="card"
    title="新增随访计划"
    style="width: 500px; max-width: 90vw"
    :bordered="false"
  >
    <NForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-placement="left"
      label-width="90"
    >
      <NFormItem
        label="住院号"
        path="userId"
      >
        <NInput
          v-model:value="form.userId"
          disabled
          placeholder="住院号"
        />
      </NFormItem>
      <NFormItem
        label="随访类型"
        path="planType"
      >
        <NSelect
          v-model:value="form.planType"
          :options="planTypeOptions"
          placeholder="请选择随访类型"
        />
      </NFormItem>
      <NFormItem
        label="风险等级"
        path="riskLevel"
      >
        <NSelect
          v-model:value="form.riskLevel"
          :options="riskLevelOptions"
          placeholder="请选择风险等级"
        />
      </NFormItem>
      <NFormItem
        label="检查项目"
        path="labCheckItemsList"
      >
        <NSelect
          v-model:value="form.labCheckItemsList"
          :options="labCheckItemOptions"
          multiple
          filterable
          placeholder="请选择检查项目"
        />
      </NFormItem>
      <NFormItem
        label="随访内容"
        path="followupContentList"
      >
        <NSelect
          v-model:value="form.followupContentList"
          :options="followupContentOptions"
          multiple
          filterable
          placeholder="请选择随访内容"
        />
      </NFormItem>
      <NFormItem
        label="计划时间"
        path="scheduledTime"
      >
        <NDatePicker
          v-model:formatted-value="form.scheduledTime"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="选择日期和时间"
          class="w-full"
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
      <NFormItem
        label="备注"
        path="remark"
      >
        <NInput
          v-model:value="form.remark"
          placeholder="请输入备注"
        />
      </NFormItem>
    </NForm>
    <template #footer>
      <div class="flex justify-end gap-2">
        <NButton @click="handleClose">关闭</NButton>
        <NButton
          type="primary"
          @click="handleSubmit"
        >
          确定
        </NButton>
      </div>
    </template>
  </NModal>
</template>
