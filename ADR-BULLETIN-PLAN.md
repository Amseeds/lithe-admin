# 药品不良反应通报信息库 — 实施跟踪

## Phase 1: 数据采集

### 1.1 抓取所有列表页（8页）
- [x] 第1页 — cdr-search-list.md (84行)
- [x] 第2页 — cdr-list-page-2.md (84行)
- [x] 第3页 — cdr-list-page-3.md (84行)
- [x] 第4页 — cdr-list-page-4.md (84行)
- [x] 第5页 — cdr-list-page-5.md (84行)
- [x] 第6页 — cdr-list-page-6.md (84行)
- [x] 第7页 — cdr-list-page-7.md (84行)
- [x] 第8页 — cdr-list-page-8.md (66行，末页)

### 1.2 从列表页提取所有详情URL
- [x] 解析所有列表页，提取详情链接
- [x] 汇总去重，确认总数：**77条** (all-detail-urls.txt)

### 1.3 批量抓取所有详情页
- [x] 抓取全部详情页内容 — **77/77 成功**（含13条重试）
- [x] 文件存放：`.firecrawl/cdr-details/` (77个 .md 文件)

### 1.4 数据解析与结构化
- [x] 编写解析脚本 `scripts/parse-adr-bulletins.ts`
- [x] 生成 `public/data/adr-bulletins/index.json` (77条)
- [x] 生成 `public/data/adr-bulletins/{id}.json` (77个详情文件)
- [x] 生成 `public/data/adr-bulletins/stats.json` (统计摘要)
- [x] 数据完整性校验 — 77/77 条，日期范围 2005-05-31 ~ 2020-06-15
- [x] 修复多格式兼容解析（单行<br>格式 / 多行markdown格式）
- [x] 已知限制：第15期原文为.doc附件，源网站未提供正文
- [x] **已解决**：编写.doc二进制UTF-16LE文本提取 + OLE2元数据清理，第15期成功提取10,302字

**产出物**:
- `.firecrawl/cdr-details/` — 77个原始详情 markdown
- `public/data/adr-bulletins/index.json` — 列表索引（不含全文，~60KB）
- `public/data/adr-bulletins/{id}.json` — 77个完整详情（含全文，总计 ~1.5MB）
- `public/data/adr-bulletins/stats.json` — 年度分布、药品频次统计
- `scripts/parse-adr-bulletins.ts` — 可重复运行的解析脚本

---

### 1.5 迁移文档
- [x] 清理 `.firecrawl/` 临时文件
- [x] 编写 `ADR-DATA-MIGRATION.md`（完整数据流程+迁移指南）

---

### 1.6 导出列表索引
- [x] 从 `output/jjkx/` 和 `output/xxtb/` 列表页提取所有记录
- [x] 生成 `output/all-records.json`（226条→修复后334条）
- [x] 修复了含 `<font>` 标签的老页面提取问题
- [x] 补充缺失列表页（Firecrawl抓取第4-8页），xxtb记录补全至77条
- [x] 补充20个缺失详情HTML到 `output/xxtb/details/`

---

## Phase 2: 前端 API 层
- [ ] 创建 `src/api/adverseDrugReactions.ts`
- [ ] 更新 `src/api/index.ts` 导出

## Phase 3: 前端 UI
- [ ] 重写列表页 `index.vue`
- [ ] 新建详情模态框 `DetailModal.vue`
- [ ] 注册菜单项 `src/api/user.ts`
- [ ] type-check + build 验证

## Phase 4: RAG 系统（后续）
- [ ] 待规划
