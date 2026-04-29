<script setup lang="ts">
import { NCard } from 'naive-ui'

defineOptions({
  name: 'LargeScreen',
})
</script>
<template>
  <div class="p-4">
    <NCard>
      <div class="flex items-center justify-center h-[calc(100vh-180px)]">大屏内容</div>
    </NCard>
  </div>
</template>