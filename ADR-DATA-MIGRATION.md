# 药品不良反应通报数据 — 迁移与开发文档

## 项目概述

从国家药品不良反应监测中心官网 (cdr-adr.org.cn) 采集"药品不良反应信息通报"系列公告，结构化处理后供前端查询和后续 RAG 系统使用。

**数据来源**: https://www.cdr-adr.org.cn/was5/web/search?searchscope=DOCTITLE&channelid=287053&searchword=药品不良反应信息通报

**当前状态**: Phase 1（数据采集与解析）已完成，后续 Phases 待执行。

---

## 目录结构

```
lithe-admin/
├── ADR-BULLETIN-PLAN.md              # 实施跟踪文件（各步骤完成状态）
│
├── .firecrawl/                       # 原始采集数据（已加入.gitignore）
│   ├── cdr-search-list.md            # 搜索列表第1页（markdown）
│   ├── cdr-list-page-{2..8}.md       # 搜索列表第2-8页
│   ├── cdr-details/                  # 77条详情页原始markdown（77个文件）
│   ├── P020191118549795829783.doc     # 第15期.doc附件（原始二进制）
│   ├── issue15.doc                   # 同上（副本）
│   └── issue15-extracted.txt         # 第15期.doc提取的纯文本（参考用）
│
├── scripts/
│   └── parse-adr-bulletins.ts        # 数据解析脚本（可重复运行）
│
├── public/data/adr-bulletins/        # 结构化输出数据
│   ├── index.json                    # 列表索引（77条摘要，不含全文）
│   ├── stats.json                    # 统计信息
│   └── {id}.json                     # 77条完整详情（含全文）
│
└── src/
    ├── api/                          # Phase 2: 待创建 API 层
    └── views/clinical-pharmacy/
        └── adverse-drug-reactions/   # Phase 3: 待重写的前端页面
            └── index.vue             # 当前为占位页面
```

---

## 数据采集流程

### 依赖

| 工具 | 用途 | 安装方式 |
|------|------|---------|
| **Firecrawl CLI** | 网页抓取（含JS渲染） | 需登录配置API Key |
| **Node.js** (v22+) | 解析脚本运行环境 | - |
| **tsx** | TypeScript直接执行 | `npx tsx` 自动安装 |

### 完整抓取命令

```bash
# 1. 抓取搜索列表页（8页）
firecrawl scrape \
  "https://www.cdr-adr.org.cn/was5/web/search?page=1&channelid=287053&searchword=%E8%8D%AF%E5%93%81%E4%B8%8D%E8%89%AF%E5%8F%8D%E5%BA%94%E4%BF%A1%E6%81%AF%E9%80%9A%E6%8A%A5&keyword=%E8%8D%AF%E5%93%81%E4%B8%8D%E8%89%AF%E5%8F%8D%E5%BA%94%E4%BF%A1%E6%81%AF%E9%80%9A%E6%8A%A5&was_custom_expr=DOCTITLE%3D%28%E8%8D%AF%E5%93%81%E4%B8%8D%E8%89%AF%E5%8F%8D%E5%BA%94%E4%BF%A1%E6%81%AF%E9%80%9A%E6%8A%A5%29&perpage=10&outlinepage=10&orderby=-CRTIME" \
  --only-main-content -o .firecrawl/cdr-search-list.md

# 第2-8页，URL中 page= 参数依次变化，其他参数相同
# 每个页面单独指定输出文件名 cdr-list-page-{N}.md

# 2. 从列表页提取所有详情URL
grep -oE 'http://www\.cdr-adr\.org\.cn/drug_1/aqjs_1/drug_aqjs_xxtb/[0-9]+/t[0-9_]+\.html' \
  .firecrawl/cdr-search-list.md .firecrawl/cdr-list-page-*.md \
  | sed 's/.*http/http/' | sort -u > .firecrawl/all-detail-urls.txt

# 3. 分批抓取详情页（建议每批13条，避免ECONNRESET）
split -l 13 .firecrawl/all-detail-urls.txt .firecrawl/batch_
for f in .firecrawl/batch_*; do
  firecrawl scrape $(cat $f) --only-main-content
  sleep 3  # 避免触发服务器限流
done

# 4. 将生成的详情文件移动到 cdr-details/ 目录
mv .firecrawl/cdr-adr.org.cn-drug_*.md .firecrawl/cdr-details/

# 5. 特殊处理：第15期需要下载 .doc 附件
# 详情页链接指向 .doc 文件，URL见该期页面中 [详情请点击] 链接
# 使用Node.js下载后，解析脚本会自动处理
```

### 常见问题

- **ECONNRESET**: CDR服务器限流，减少并发、重试失败的URL
- **文件名冲突**: 列表页URL参数不同但路径相同，需显式指定 `-o` 输出文件名
- **第15期.doc**: 唯一以附件形式存储的一期，需手动下载.doc到 `.firecrawl/` 目录

---

## 数据解析

### 运行脚本

```bash
npx tsx scripts/parse-adr-bulletins.ts
```

### 脚本工作流程

1. **解析列表页** — 从8个列表markdown中提取每条通报的期号、标题、日期、摘要、详情URL
2. **解析详情页** — 自动检测两种格式：
   - **单行格式**（较新通报）: 内容在 `<br>` 标签分隔的单行中
   - **多行格式**（较早通报）: 内容分布在多个markdown段落中
3. **特殊处理** — 当解析出的内容 <500字时，尝试从对应的 `.doc` 附件中提取文本
4. **生成输出** — 写入 `public/data/adr-bulletins/`

### .doc 附件提取原理

第15期正文存储在 OLE2 复合文档 (.doc) 中而非 HTML。提取方法：
- 读取二进制文件，按 UTF-16LE 编码扫描
- 筛选 CJK统一汉字、标点符号、ASCII可打印字符
- 以句子级标点符号（。；，等）识别有效内容边界
- 自动截断 OLE2 元数据残留（Root Entry、WordDocument 等）

如需重新下载第15期 .doc:
```bash
node -e "const https=require('https'),fs=require('fs');
https.get('https://www.cdr-adr.org.cn/drug_1/aqjs_1/drug_aqjs_xxtb/200812/P020191118549795829783.doc',
  res => { const f=fs.createWriteStream('.firecrawl/issue15.doc'); res.pipe(f); })"
```

---

## 输出数据格式

### index.json（列表索引，供前端列表页使用）

```json
[
  {
    "periodNumber": 77,
    "title": "药品不良反应信息通报（第77期） 关注垂体后叶注射液安全性问题",
    "publishDate": "2020-06-15",
    "summary": "药品不良反应信息通报制度...",
    "detailUrl": "http://www.cdr-adr.org.cn/drug_1/.../t20200615_47501.html",
    "id": "2020061547501",
    "drugs": ["垂体后叶注射液"]
  }
]
```

### {id}.json（完整详情，供详情模态框使用）

```json
{
  "periodNumber": 77,
  "title": "...",
  "publishDate": "2020-06-15",
  "summary": "...",
  "detailUrl": "http://...",
  "id": "2020061547501",
  "fullContent": "标题\n\n发布日期：...\n\n**编者按：**...",
  "drugs": ["垂体后叶注射液"]
}
```

`fullContent` 使用 `\n` 分段，`**标题**` 标记章节。可直接用 `v-html` 渲染，或按 `**` 分割为 RAG chunk。

### stats.json（统计）

```json
{
  "totalBulletins": 77,
  "dateRange": { "earliest": "2005-05-31", "latest": "2020-06-15" },
  "yearlyDistribution": { "2005": 9, "2006": 2, ... },
  "allDrugs": [{ "name": "垂体后叶注射液", "count": 1 }, ...]
}
```

---

## 迁移到新电脑

### 必须迁移的文件

| 优先级 | 路径 | 说明 |
|--------|------|------|
| ★★★ | `public/data/adr-bulletins/` | 最终结构化数据（79个JSON，~1.5MB） |
| ★★★ | `scripts/parse-adr-bulletins.ts` | 解析脚本 |
| ★★★ | `ADR-BULLETIN-PLAN.md` | 实施跟踪 |
| ★★☆ | `.firecrawl/cdr-details/` | 原始详情markdown（77个，可重新解析） |
| ★★☆ | `.firecrawl/cdr-search-list.md` + `cdr-list-page-*.md` | 原始列表markdown（8个） |
| ★★☆ | `.firecrawl/P020191118549795829783.doc` | 第15期原始.doc |
| ★☆☆ | `.firecrawl/issue15-extracted.txt` | 参考文件 |

### 在新电脑上继续工作

1. **安装依赖**:
   ```bash
   pnpm install          # 项目依赖
   npm install -g firecrawl  # 或 npx firecrawl（需配置API Key）
   ```

2. **验证数据完整性**:
   ```bash
   npx tsx scripts/parse-adr-bulletins.ts
   # 应输出: 总计: 77 条通报记录
   ```

3. **后续开发**（参考 `ADR-BULLETIN-PLAN.md`）:
   - **Phase 2**: 创建 `src/api/adverseDrugReactions.ts`，实现前端数据获取
   - **Phase 3**: 重写 `src/views/clinical-pharmacy/adverse-drug-reactions/index.vue`，新建 `DetailModal.vue`，注册菜单
   - **Phase 4**: RAG 智能问答系统开发

### 最小迁移方案

如果只关心最终结果，只需复制 `public/data/adr-bulletins/` 目录（79个JSON文件）到新电脑的对应位置，即可直接用于前端开发。原始采集文件和脚本可选择性迁移。

---

## 数据质量摘要

| 指标 | 数值 |
|------|------|
| 总通报数 | 77 条 |
| 日期范围 | 2005-05-31 ~ 2020-06-15 |
| 完整率 | 100%（0条缺漏） |
| 平均正文长度 | ~3,500 字/条 |
| 涉及药品种类 | 60+ 种 |
| 特殊处理 | 第15期为.doc附件，已成功提取10,302字 |
| 详情页格式 | 单行<br>格式 + 多行markdown格式，均已兼容 |
