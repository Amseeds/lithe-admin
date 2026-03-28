<script setup lang="ts">
import { NDescriptions, NDescriptionsItem } from 'naive-ui'
import type { ChineseMateriaMedica } from '@/api/chineseMateriaMedica'

defineOptions({
  name: 'ChineseMateriaMedicaDetailModal',
})

const props = defineProps<{
  info: ChineseMateriaMedica | null
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
      <NDescriptionsItem label="编号">
        {{ info?.id ?? '-' }}
      </NDescriptionsItem>
      <NDescriptionsItem label="名称">
        {{ info?.name ?? '-' }}
      </NDescriptionsItem>
      <NDescriptionsItem label="别名">
        <div class="whitespace-pre-wrap">{{ info?.aliasNames ?? '-' }}</div>
      </NDescriptionsItem>
      <NDescriptionsItem label="性味">
        <div class="whitespace-pre-wrap">{{ info?.natureFlavor ?? '-' }}</div>
      </NDescriptionsItem>
      <NDescriptionsItem label="归经">
        <div class="whitespace-pre-wrap">{{ info?.meridianTropism ?? '-' }}</div>
      </NDescriptionsItem>
      <NDescriptionsItem label="功能主治">
        <div class="whitespace-pre-wrap">{{ info?.functionsIndications ?? '-' }}</div>
      </NDescriptionsItem>
      <NDescriptionsItem label="用法用量">
        <div class="whitespace-pre-wrap">{{ info?.usageDosage ?? '-' }}</div>
      </NDescriptionsItem>
      <NDescriptionsItem label="注意事项">
        <div class="whitespace-pre-wrap">{{ info?.precautions ?? '-' }}</div>
      </NDescriptionsItem>
      <NDescriptionsItem label="过量信息">
        <div class="whitespace-pre-wrap">{{ info?.overdoseInfo ?? '-' }}</div>
      </NDescriptionsItem>
      <NDescriptionsItem label="性状描述">
        <div class="whitespace-pre-wrap">{{ info?.description ?? '-' }}</div>
      </NDescriptionsItem>
      <NDescriptionsItem label="配伍禁忌">
        <div class="whitespace-pre-wrap">{{ info?.incompatibleHerbs ?? '-' }}</div>
      </NDescriptionsItem>
      <NDescriptionsItem label="来源文件">
        <div class="whitespace-pre-wrap">{{ info?.sourceFile ?? '-' }}</div>
      </NDescriptionsItem>
      <NDescriptionsItem label="创建时间">
        {{ info?.createdAt ? new Date(info.createdAt).toLocaleString('zh-CN') : '-' }}
      </NDescriptionsItem>
    </NDescriptions>
  </div>
</template>
