<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

import { CollapseTransition } from '@/components'
import { toRefsPreferencesStore } from '@/stores'

defineOptions({
  name: 'Navigation',
})

const appName = import.meta.env.VITE_APP_NAME

const AsyncNavigationButton = defineAsyncComponent(() => import('./NavigationButton.vue'))
const AsyncHorizontalMenu = defineAsyncComponent(() => import('./HorizontalMenu.vue'))
const AsyncBreadcrumb = defineAsyncComponent(() => import('./Breadcrumb.vue'))

const { showNavigationButton, breadcrumb, navigationMode } = toRefsPreferencesStore()
</script>
<template>
  <nav class="flex h-9 flex-1 items-center">
    <CollapseTransition :display="showNavigationButton && navigationMode === 'sidebar'">
      <AsyncNavigationButton />
    </CollapseTransition>
    <CollapseTransition :display="breadcrumb.show && navigationMode === 'sidebar'">
      <AsyncBreadcrumb />
    </CollapseTransition>
    <span
      v-if="navigationMode === 'sidebar'"
      class="flex-1 truncate text-center text-xl"
    >
      {{ appName }}
    </span>
    <CollapseTransition :display="navigationMode === 'horizontal'">
      <AsyncHorizontalMenu />
    </CollapseTransition>
  </nav>
</template>
