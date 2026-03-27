<script setup lang="tsx">
import {
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NUpload,
  NButton,
  NSpace,
  type UploadFileInfo,
  type MessageApi,
} from 'naive-ui'
import { ref, reactive } from 'vue'

import {
  createEducation,
  CATEGORY_OPTIONS,
  type CreateEducationParams,
} from '@/api/medicationEducation'
import type { FormRules } from 'naive-ui'

const props = defineProps<{
  message: MessageApi
  onSuccess?: () => void
  onClose?: () => void
}>()

// 表单数据
const form = reactive({
  title: '',
  category: '',
  keywords: '',
  description: '',
  remark: '',
})

const formRef = ref()
const fileList = ref<UploadFileInfo[]>([])
const isSubmitting = ref(false)

// 分类选项
const categoryOptions = CATEGORY_OPTIONS.map((item) => ({
  label: item.label,
  value: item.value,
}))

// 验证规则
const rules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择资料分类', trigger: 'change' }],
  keywords: [{ required: true, message: '请输入关键词', trigger: 'blur' }],
  description: [{ required: true, message: '请输入简介', trigger: 'blur' }],
}

// 文件变化
const handleFileChange = (data: { fileList: UploadFileInfo[] }) => {
  fileList.value = data.fileList
}

// 提交
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    if (fileList.value.length === 0) {
      props.message.error('请上传附件')
      return
    }

    const file = fileList.value[0].file
    if (!file) {
      props.message.error('文件无效')
      return
    }

    isSubmitting.value = true

    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('category', form.category)
    formData.append('keywords', form.keywords)
    formData.append('description', form.description)
    if (form.remark) {
      formData.append('remark', form.remark)
    }
    formData.append('file', file)

    await createEducation(formData)
    props.message.success('新增成功！')
    props.onSuccess?.()
  } catch (error) {
    console.error('提交失败:', error)
    props.message.error('提交失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

// 重置
const handleReset = () => {
  formRef.value?.restoreValidation()
  Object.assign(form, {
    title: '',
    category: '',
    keywords: '',
    description: '',
    remark: '',
  })
  fileList.value = []
}
</script>

<template>
  <div class="p-4">
    <NForm ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="auto">
      <NFormItem label="标题" path="title">
        <NInput v-model:value="form.title" placeholder="请输入标题" />
      </NFormItem>
      <NFormItem label="资料分类" path="category">
        <NSelect
          v-model:value="form.category"
          :options="categoryOptions"
          placeholder="请选择资料分类"
        />
      </NFormItem>
      <NFormItem label="关键词" path="keywords">
        <NInput v-model:value="form.keywords" placeholder="请输入关键词" />
      </NFormItem>
      <NFormItem label="简介" path="description">
        <NInput
          v-model:value="form.description"
          type="textarea"
          placeholder="请输入简介"
          :rows="3"
        />
      </NFormItem>
      <NFormItem label="备注" path="remark">
        <NInput v-model:value="form.remark" placeholder="请输入备注" />
      </NFormItem>
      <NFormItem label="附件" path="file">
        <NUpload
          :file-list="fileList"
          :max="1"
          :default-upload="false"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          @change="handleFileChange"
        >
          <NButton>选择文件</NButton>
        </NUpload>
        <div class="mt-1 text-xs text-gray-500">
          支持格式：pdf/doc/docx/xls/xlsx/jpg/png
        </div>
      </NFormItem>
    </NForm>
    <div class="flex justify-end gap-2 mt-4">
      <NButton @click="handleReset">重置</NButton>
      <NButton type="primary" :loading="isSubmitting" @click="handleSubmit">确定</NButton>
    </div>
  </div>
</template>
