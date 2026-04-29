<script setup lang="ts">
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  AxisPointerComponent,
} from 'echarts/components'

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  AxisPointerComponent,
])

defineProps<{
  option: Record<string, unknown>
  autoresize?: boolean
}>()
</script>

<template>
  <VChart
    :option="option"
    :autoresize="autoresize ?? true"
    class="app-chart"
    v-bind="$attrs"
  />
</template>

<style scoped>
.app-chart {
  width: 100%;
  height: 100%;
}
</style>
