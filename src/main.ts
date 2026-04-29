import './assets/main.css'

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
import { PiniaColada } from '@pinia/colada'
import { createApp } from 'vue'

import { setupEventBus } from '@/event-bus'
import { setupRouterGuard } from '@/router/guard'
import { pinia } from '@/stores'
import { checkVersion } from '@/utils/checkVersion'

import VxeUIBase from 'vxe-pc-ui'
import 'vxe-pc-ui/es/style.css'

import VxeUITable from 'vxe-table'
import 'vxe-table/es/style.css'

import App from './App.vue'
import router from './router'

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

async function setupApp() {
  checkVersion()

  const app = createApp(App)

  app.use(VxeUIBase).use(VxeUITable)

  app.use(pinia)
  app.use(PiniaColada, {
    queryOptions: {
      refetchOnWindowFocus: false,
    },
  })

  app.use(router)

  setupRouterGuard(router)

  setupEventBus()

  await router.isReady()

  if (window.loaderElement) {
    window.loaderElement.remove()
    window.loaderElement = null
  }

  app.mount('#app')
}

setupApp()
