<!--
* @description  参数1
* @fileName  index
* @author 刘仕强
* @date 2026-04-21 19:34:53
* @version V1.0.0
!-->

<template>
  <div>菜单管理</div>
</template>

<script setup>
const props = defineProps({
  defaultBoolProp: {
    type: Boolean,
    default: false,
  },
  defaultStringProp: {
    type: String,
    default: '',
  },
  defaultObjectProp: {
    type: Object,
    default: () => {},
  },
})
</script>

<style lang="scss" scoped></style>
