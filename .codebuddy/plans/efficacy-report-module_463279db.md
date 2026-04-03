---
name: efficacy-report-module
overview: 开发疗效报告(efficacy-report)模块，包含筛选栏、统计卡片、报告主列表(50条Mock)、报告详情弹窗(6个医疗合规板块)、报告生成抽屉，全部使用纯前端Mock数据。
design:
  architecture:
    framework: vue
  styleKeywords:
    - 企业级管理后台
    - 简洁专业
    - 白色卡片布局
    - 医疗系统风格
  fontSystem:
    fontFamily: PingFang SC, Microsoft YaHei, sans-serif
    heading:
      size: 16px
      weight: 600
    subheading:
      size: 14px
      weight: 500
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#409EFF"
    background:
      - "#F5F5F5"
      - "#FFFFFF"
    text:
      - "#303133"
      - "#606266"
      - "#909399"
    functional:
      - "#67C23A"
      - "#E6A23C"
      - "#F56C6C"
      - "#409EFF"
todos:
  - id: create-mock-types
    content: 创建 mock/types.ts，定义 Report、ReportDetail、ReportStatus 等全部类型
    status: completed
  - id: create-mock-data
    content: 创建 mock/data.ts，包含50条报告Mock数据、4张卡片统计、报告详情生成函数、新报告生成函数
    status: completed
    dependencies:
      - create-mock-types
  - id: implement-index-vue
    content: 实现 index.vue 主组件，包含筛选栏、统计卡片、报告列表、详情弹窗、生成抽屉全部UI和交互逻辑
    status: completed
    dependencies:
      - create-mock-data
---

## 产品概述

疗效报告模块（efficacy-report），单页面全承载的疗效报告管理界面，包含报告列表管理、报告详情查看和报告生成功能。

## 核心功能

- 顶部筛选栏：5个筛选项（报告生成时间范围、报告类型、报告状态、患者姓名/病历号搜索框、查询/重置按钮），右对齐放置"生成新报告"按钮
- 4张统计卡片：已生成报告总数、本月新增报告数、已归档报告数、草稿待完成数，展示核心数值+较上月变化
- 报告主列表：NDataTable实现，固定8列（报告编号、患者信息、报告类型/周期、生成信息、报告状态、疗效评级、归档状态、操作），Mock 50条数据；操作列按状态动态展示按钮（草稿：编辑/预览/删除/归档，已归档：查看详情/导出PDF/打印，已作废：查看详情）
- 报告详情弹窗：仅点击"查看详情/预览"触发弹出，包含6个医疗合规板块（患者基本信息、治疗方案与用药情况、核心指标检测结果、疗效综合评估、并发症筛查情况、治疗建议与随访计划），底部导出PDF/打印/关闭按钮，已归档报告不可编辑
- 报告生成抽屉：从右侧弹出，含患者选择/报告类型/报告周期/治疗方案调整建议表单，点击"生成并归档"弹出成功提示并给列表新增1条Mock数据

## 约束条件

- 100%纯前端Mock数据，禁止任何API请求
- 全院患者总人数100人，与其他模块一致
- 日期范围：2025-12-01 至 2026-03-31
- 禁止AI/智能/自动生成相关代码
- 禁止复杂动画、冗余自定义样式

## 技术栈

- Vue 3 Composition API (`<script setup lang="ts">`)
- Naive UI 组件库（NCard, NDataTable, NModal, NDrawer, NDrawerContent, NSelect, NInput, NButton, NTag, NDescriptions, NDescriptionsItem, NGrid, NGi, NForm, NFormItem, NDatePicker, NTimePicker, NSpace, NDivider）
- TypeScript 类型定义
- dayjs 日期处理
- 纯 CSS scoped 样式（复用现有模块样式模式）

## 实现方案

采用单组件+分离Mock数据文件的模式，与项目现有模块（treatment-effects、disease-progression）保持一致。Mock数据抽离到 `mock/` 子目录，类型定义在 `mock/types.ts`，全部Mock数据在 `mock/data.ts` 中，主组件 `index.vue` 承载全部UI逻辑。

### 关键技术决策

1. **操作列按钮**：使用 `h()` 函数渲染，根据行数据 `报告状态` 动态渲染不同按钮组合
2. **报告生成交互**：点击"生成并归档"后，用 `unshift()` 向列表数组头部插入1条已归档状态的Mock数据，并用 Naive UI 的 `useMessage()` 弹出成功提示
3. **报告详情弹窗**：通过 `currentReportDetail` ref 存储当前查看的报告详情数据，仅在点击时赋值，默认不加载
4. **筛选功能**：仅做样式展示，查询/重置按钮无实际过滤逻辑
5. **表格列宽**：8列分配需确保总宽不超过容器宽度，避免溢出问题

### 数据流

- 初始化：从 `mock/data.ts` 导入50条报告数据 → `ref` 存储列表
- 生成报告：抽屉表单提交 → 构造新报告对象 → `unshift` 到列表 → 关闭抽屉 → 弹出提示
- 查看详情：点击操作列按钮 → 从 `generateReportDetail()` 生成详情数据 → 赋值 `currentReportDetail` → 打开弹窗

## 目录结构

```
src/views/clinical-pharmacy/efficacy-report/
├── index.vue           # [MODIFY] 主组件，承载全部页面UI和交互逻辑
└── mock/
    ├── types.ts        # [NEW] 类型定义：Report、ReportDetail、ReportStatus、EfficacyGrade等
    └── data.ts         # [NEW] Mock数据：50条报告列表、4张卡片统计、患者名列表、报告详情生成函数
```

### types.ts 关键类型

```typescript
export type ReportStatus = '草稿' | '已归档' | '已作废'
export type EfficacyGrade = '优秀' | '良好' | '一般' | '较差'
export type ReportType = '月度随访' | '季度评估' | '年度全面' | '复诊专项'

export interface Report {
  报告编号: string
  患者姓名: string
  病历号: string
  患者年龄: number
  报告类型: ReportType
  报告周期: string
  生成人: string
  生成日期: string
  报告状态: ReportStatus
  疗效评级: EfficacyGrade
  归档日期: string | null
  归档人: string | null
}

export interface ReportDetail {
  basicInfo: { 患者姓名: string; 病历号: string; 性别: string; 年龄: number; ... }
  treatmentPlan: { 当前用药方案: string; 用药时长: string; ... }
  indicatorResults: Array<{ 检测项目: string; 检测结果: string; 目标值: string; 是否达标: string; }>
  efficacyAssessment: { 综合评级: string; 评估结论: string; ... }
  complicationScreening: Array<{ 筛查项目: string; 筛查结果: string; }>
  treatmentAdvice: { 治疗建议: string; 随访计划: string; ... }
}
```

### data.ts 关键导出

- `reportCards`: 4张统计卡片数据
- `reportList`: 50条报告Mock数据
- `generateReportDetail(report: Report): ReportDetail`: 根据报告生成详情
- `generateNewReport(): Report`: 生成一条新报告数据

## 设计风格

采用与项目现有模块（treatment-effects、disease-progression）一致的简洁企业级风格。白色卡片背景、圆角边框、灰色背景容器。筛选栏为白色横条，按钮使用 Naive UI 默认主题色。

## 页面布局

### 顶部筛选栏

- 横向排列5个筛选项，右侧放置"生成新报告"按钮（type="primary"）
- 筛选项：时间范围下拉(140px)、报告类型下拉(140px)、报告状态下拉(120px)、搜索框(160px)、查询/重置按钮

### 统计卡片区域

- 4张卡片等宽并排（grid 4列），每张展示标题+大号数值+较上月变化
- 左侧彩色竖条装饰，hover 微上浮效果

### 报告列表

- NDataTable 全宽展示，固定8列
- 状态列使用 NTag 彩色标签区分（草稿-默认/已归档-成功/已作废-错误）
- 疗效评级列使用 NTag（优秀-成功/良好-信息/一般-警告/较差-错误）
- 操作列 fixed="right"，按状态动态渲染2-4个按钮

### 报告详情弹窗

- NModal preset="card"，宽度 960px
- 6个 NCard 区域纵向排列，每个区域含标题和内容
- 已归档状态下全部内容只读

### 报告生成抽屉

- NDrawer 从右侧弹出，宽度 520px
- NForm 表单布局，底部3个按钮（取消/保存草稿/生成并归档）

## Skill

- **vue-best-practices**
- Purpose: 确保 Vue3 Composition API + TypeScript 最佳实践
- Expected outcome: 生成符合项目规范的 `<script setup lang="ts">` 组件代码，正确使用 ref/computed/h 等组合式 API
- **vue-development-guides**
- Purpose: 确保 Naive UI 组件使用和组件设计模式正确
- Expected outcome: NDataTable 列定义、NModal/NDrawer 弹窗交互、表格 render 函数等符合最佳实践