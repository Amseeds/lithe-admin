<script setup lang="ts">
import { NDescriptions, NDescriptionsItem, NButton, NSpace } from 'naive-ui'
import type { DrugInformation } from '@/api/drugInformation'

defineOptions({
  name: 'DrugDetailModal',
})

const props = defineProps<{
  drugInfo: DrugInformation | null
}>()

const emit = defineEmits<{
  close: []
}>()

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <NDescriptions
      label-placement="left"
      :column="1"
      bordered
      label-style="width: 120px"
      content-style="background-color: #fafafa"
    >
      <NDescriptionsItem label="药品名称">
        {{ drugInfo?.drugName ?? '-' }}
      </NDescriptionsItem>
      <NDescriptionsItem label="药物成分">
        <div class="whitespace-pre-wrap">{{ drugInfo?.drugIngredients ?? '-' }}</div>
      </NDescriptionsItem>
      <NDescriptionsItem label="适应症">
        <div class="whitespace-pre-wrap">{{ drugInfo?.indication ?? '-' }}</div>
      </NDescriptionsItem>
      <NDescriptionsItem label="使用说明">
        <div class="whitespace-pre-wrap">{{ drugInfo?.packageInsert ?? '-' }}</div>
      </NDescriptionsItem>
      <NDescriptionsItem label="不良反应">
        <div class="whitespace-pre-wrap">{{ drugInfo?.adr ?? '-' }}</div>
      </NDescriptionsItem>
      <NDescriptionsItem label="禁忌">
        <div class="whitespace-pre-wrap">{{ drugInfo?.contraindication ?? '-' }}</div>
      </NDescriptionsItem>
      <NDescriptionsItem label="注意事项">
        <div class="whitespace-pre-wrap">{{ drugInfo?.warningsAndPrecautions ?? '-' }}</div>
      </NDescriptionsItem>
      <NDescriptionsItem label="孕妇使用">
        <div class="whitespace-pre-wrap">{{ drugInfo?.useInPregnancyAndLactation ?? '-' }}</div>
      </NDescriptionsItem>
      <NDescriptionsItem label="儿童使用">
        <div class="whitespace-pre-wrap">{{ drugInfo?.pediatricUse ?? '-' }}</div>
      </NDescriptionsItem>
      <NDescriptionsItem label="老年人使用">
        <div class="whitespace-pre-wrap">{{ drugInfo?.geriatricUse ?? '-' }}</div>
      </NDescriptionsItem>
      <NDescriptionsItem label="相互作用">
        <div class="whitespace-pre-wrap">{{ drugInfo?.drugInteractions ?? '-' }}</div>
      </NDescriptionsItem>
    </NDescriptions>
    <!-- <div class="flex justify-end">
      <NSpace>
        <NButton @click="handleClose">关闭</NButton>
      </NSpace>
    </div> -->
  </div>
</template>
