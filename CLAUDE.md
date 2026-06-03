# lithe-admin

糖尿病患者全流程个体化用药管理的药学服务平台，Vue 3 + NaiveUI + TypeScript 前端管理后台。

## 技术栈

- **框架**: Vue 3.5 Composition API + `<script setup lang="ts">`
- **构建**: Vite 8 (Rolldown) + TypeScript 5.9
- **UI 库**: NaiveUI 2.44 + Tailwind CSS v4
- **图标**: Iconify (`ph--` 前缀, Phosphor 系列)
- **网络**: Axios (标准请求) + 原生 fetch (SSE 流式)
- **状态**: Pinia 3 + @vueuse/core
- **路由**: vue-router 5 (动态路由注入)
- **图表**: ECharts 6 + vue-echarts 8
- **样式**: SCSS (scoped) + Tailwind 原子类
- **格式化**: Prettier (无分号, 单引号) + ESLint 10 (flat config)

## 常用命令

```bash
pnpm dev            # 启动开发服务器 (端口 5799)
pnpm build          # 类型检查 + 构建
pnpm preview        # 预览生产构建
npx vue-tsc --noEmit  # 仅类型检查
```

## 目录约定

```
src/
  api/          # 接口模块 (一领域一文件), index.ts 统一导出
  views/        # 页面组件 (一页面一文件夹/index.vue)
  components/   # 共享组件 (一组件一文件夹, index.ts 导出)
  composables/  # 可复用逻辑 (useSSE, useInjection 等)
  stores/       # Pinia 状态管理
  router/       # 路由 (guard.ts = 鉴权守卫, helper.ts = 菜单→路由转换)
  utils/        # 工具 (request.ts = Axios 封装)
  layout/       # 应用壳 (侧栏/顶栏/标签页)
```

## API 规范

### 标准请求 (`src/utils/request.ts`)

```ts
import { get, post } from '@/utils/request'

// GET 请求
export const getList = (params: QueryParams) =>
  get<ListResponse>('/api/v1/xxx/list', params as unknown as Record<string, unknown>)

// POST 请求 (非流式)
export const doAction = (data: ActionParams) =>
  request<ActionResult>({ url: '/api/aiuse/xxx', method: 'post', data })
```

- `request<T>()` 返回 `ResponseBody<T>` = `{ code, data: T, message }`
- 在页面中使用: `const { data } = await apiFn(...)` → `data` 就是 `T`
- GET 请求自动清理 null/undefined/空字符串参数

### SSE 流式请求

```ts
export function streamXxx(params: { patientId: string; signal?: AbortSignal }) {
  const token = localStorage.getItem('token') || ''
  const { signal, ...body } = params
  return fetch('/api/api/aiuse/xxx-stream', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })
}
```

- 返回原生 `Response`，交由 `useSSE()` composable 消费
- 流式调用模式: `const res = await streamXxx({...})` → `await startSSE('', { response: res, onMessage: cb })`

## 页面开发规范

### 标准页面结构

```vue
<script setup lang="ts">
defineOptions({ name: 'PageName' })  // 必须: 组件名

const { isMaxMd, isMaxLg } = useInjection(mediaQueryInjectionKey)
</script>

<template>
  <ScrollContainer wrapper-class="flex flex-col gap-y-4 page-class" :scrollable="isMaxLg">
    <NCard class="main-card flex-1" :size="isMaxMd ? 'small' : undefined" content-class="flex flex-col min-h-0">
      <div class="content-layout">
        <div class="left-panel">...</div>
        <div class="right-panel">...</div>
      </div>
    </NCard>
  </ScrollContainer>
</template>

<style lang="scss" scoped>
.page-class { padding: 20px 24px; background: linear-gradient(160deg, #f0f4f8 0%, #f5f7fa 100%); }
</style>
```

### 患者列表模式

- 左侧 350px 面板: 搜索框 + NDataTable + NPagination
- 列: 住院号(120) / 姓名(80) / 性别(60) / 年龄(60)
- 选中行高亮: `class: selectedPatient?.zyh === row.zyh ? 'row-selected' : ''`
- 搜索防抖: `setTimeout(300ms)`

### 样式约定

- 主卡片: `border-radius: 14px` + 微阴影 + `border: 1px solid rgba(64,158,255,0.06)`
- 文字色阶: `#1e293b`(标题) → `#334155`(正文) → `#475569`(次要) → `#64748b`(辅助)
- 边框: `#e8ecf1`(主) / `#f1f5f9`(淡)
- 交互色: `#409eff`(主蓝) / `#e8f4fd`(选中背景)
- 对比度 ≥ 4.5:1, 过渡 150-300ms, prefers-reduced-motion
- 响应式: `@media (max-width: 1024px)` 左→上 / `@media (max-width: 768px)` 调整内边距

### AI 响应区模式 (4 态)

每个使用 SSE 流式的页面都遵循: **占位态 → 加载态 → 流式态 → 错误态**

```html
<NScrollbar ref="boxRef">
  <div v-if="!text && !generating && !error">占位图标+引导文字</div>
  <div v-if="generating && !text">NSpin + 描述</div>
  <div v-if="text" class="response-content">markdown 块渲染 (##/###/列表/段落)</div>
  <div v-if="error">红色图标+错误信息+重试</div>
</NScrollbar>
```

### 菜单/路由

- 菜单定义在 `src/api/user.ts` 的 `fixedMenu` 常量中
- 新增页面流程: 在 `fixedMenu` 中添加菜单项 → `src/views/<name>/index.vue` 创建页面 → 完成
- 路由和侧栏菜单自动从 `fixedMenu` 解析生成

## 注意事项

- 不要使用 `data.data` 双重解构 — `request<T>` 直接返回 `ResponseBody<T>`, `res.data` 就是 `T`
- Tab 页模式参考 `special-population-ai-guide`: ScrollContainer > NCard > NTabs + 内容
- 用药方案面板已标准化 (序号+药名+给药途径+用量/频率色标+时间), 参考 `treatment-effectiveness`
- 文件下载使用 `download()` 而非 `request()`, 自动处理 blob 和文件名解析
