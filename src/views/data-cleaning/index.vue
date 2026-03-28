<script setup lang="ts">
import { ref, reactive } from 'vue'
import { NCard, NForm, NFormItem, NDatePicker, NButton, NAlert, NSpin } from 'naive-ui'
import dayjs from 'dayjs'
import { download } from '@/utils/request'
import { cleanData, getTaskStatus } from '@/api/dataCleaning'

const promptText = ref('')
const isProcessing = ref(false)
const processStatus = ref<'processing' | 'success' | 'error'>('processing')

const queryParams = reactive({
  startTime: dayjs().add(-1, 'day').valueOf(),
  endTime: dayjs().valueOf(),
})

const handleSearch = async () => {
  promptText.value = '数据清洗中...'
  processStatus.value = 'processing'
  isProcessing.value = true

  const startTime = dayjs(queryParams.startTime).format('YYYY-MM-DD HH:mm:ss')
  const endTime = dayjs(queryParams.endTime).format('YYYY-MM-DD HH:mm:ss')

  console.log('获取资料列表:', { startTime, endTime })

  const { code, data } = await cleanData({ startTime, endTime })

  console.log(data, 'data===')

  if (code === 200) {
    pollTaskStatus(data.taskId)
  }
}

const pollTaskStatus = async (taskId: string) => {
  const { code, data } = await getTaskStatus(taskId)
  console.log(data, 'data===')

  if (code === 200) {
    if (data.status === 'PROCESSING') {
      setTimeout(() => {
        pollTaskStatus(taskId)
      }, 5000)
    }
    if (data.status === 'COMPLETED') {
      console.log('清洗完成,接口返回内容为：', data)
      await downloadFile(data.downloadUrl)
      promptText.value = '数据清洗完成'
      processStatus.value = 'success'
      isProcessing.value = false
    }
    if (data.status === 'FAILED') {
      promptText.value = '数据清洗失败'
      processStatus.value = 'error'
      isProcessing.value = false
    }
  }
}

const downloadFile = async (url: string) => {
  await download({ url })
}

const handleReset = () => {
  queryParams.startTime = dayjs().add(-1, 'day').valueOf()
  queryParams.endTime = dayjs().valueOf()
  promptText.value = ''
  processStatus.value = 'processing'
}
</script>

<template>
  <div class="p-4">
    <NCard class="mb-4">
      <NForm
        inline
        :show-feedback="false"
      >
        <NFormItem label="开始时间">
          <NDatePicker
            v-model:value="queryParams.startTime"
            type="datetime"
            clearable
          />
        </NFormItem>
        <NFormItem label="结束时间">
          <NDatePicker
            v-model:value="queryParams.endTime"
            type="datetime"
            clearable
          />
        </NFormItem>
        <NFormItem>
          <NButton
            style="margin-right: 12px"
            @click="handleReset"
          >
            重置
          </NButton>
          <NButton
            type="primary"
            :loading="isProcessing"
            @click="handleSearch"
          >
            查询
          </NButton>
        </NFormItem>
      </NForm>
    </NCard>

    <NCard v-if="promptText">
      <div class="flex items-center justify-center py-8">
        <NSpin
          v-if="isProcessing"
          size="medium"
          class="mr-3"
        />
        <NAlert
          :type="processStatus === 'processing' ? 'info' : processStatus === 'success' ? 'success' : 'error'"
          :show-icon="!isProcessing"
        >
          {{ promptText }}
        </NAlert>
      </div>
    </NCard>
  </div>
</template>
