# 药物警戒快讯 HTML 文件整理流程

## 整体架构

```
抓取列表页 → 提取详情URL → 批量抓取详情页 → 后处理构建本地站点
```

## 环境依赖

| 工具 | 用途 | 安装 |
|------|------|------|
| Firecrawl CLI | 网页抓取（含 JS 渲染） | 需 API Key |
| Node.js (v22+) | 运行处理脚本 | - |
| tsx | TypeScript 直接执行 | `npx tsx` |
| SingleFile（浏览器插件） | 获取完整计算后 CSS | Chrome/Firefox 扩展商店 |

## 脚本文件

```
scripts/
├── extract-jjkx-urls.ts      # 从列表页提取所有详情页 URL
├── scrape-jjkx-details.ts    # 批量抓取详情页
└── build-jjkx-site.ts        # 后处理构建本地站点
```

---

## 步骤 1：抓取列表页

用 firecrawl 逐个抓取 14 个列表页的 HTML。

```bash
# 目录
mkdir -p .firecrawl/jjkx-list-pages

# 第1页（主页）
firecrawl scrape "https://www.cdr-adr.org.cn/drug_1/aqjs_1/drug_aqjs_jjkx/" \
  --format html --wait-for 3000 -o .firecrawl/jjkx-list-pages/index.html

# 第2-14页（index_1.html ~ index_13.html）
firecrawl scrape "https://www.cdr-adr.org.cn/drug_1/aqjs_1/drug_aqjs_jjkx/index_1.html" \
  --format html --wait-for 3000 -o .firecrawl/jjkx-list-pages/index_1.html

# ... 重复至 index_13.html
```

共 14 页，每页约 20 条，合计约 277 期。

---

## 步骤 2：提取详情页 URL

运行 `scripts/extract-jjkx-urls.ts`：

```bash
npx tsx scripts/extract-jjkx-urls.ts
```

解析 14 个列表页 HTML，用正则提取所有详情链接：

```
/drug_aqjs_jjkx\/(\d{6})\/t(\d{8}_\d+)\.html/g
```

去重后输出到 `.firecrawl/jjkx-detail-urls.json`。

---

## 步骤 3：批量抓取详情页

运行 `scripts/scrape-jjkx-details.ts`：

```bash
npx tsx scripts/scrape-jjkx-details.ts
```

- 以每批 8 个并发调用 firecrawl，批次间隔约 5 秒
- 保存到 `.firecrawl/jjkx-details/{YYYYMM}/t{id}.html`
- 失败 URL 最多重试 3 轮
- 最终约 277 个文件

---

## 步骤 4：后处理构建本地站点

运行 `scripts/build-jjkx-site.ts`：

```bash
npx tsx scripts/build-jjkx-site.ts
```

### 4a 准备工作：获取站点完整 CSS

firecrawl 只捕获到原始内联样式，缺少网站的关键样式（Chrome 内置错误页 CSS 和站点 CSS 类定义）。需要用 **SingleFile 浏览器插件** 手动保存两份页面：

1. **列表页** — 获取导航、列表条目、分页等样式
2. **详情页** — 获取横幅背景、文章正文等样式

将两个 SingleFile 文件放在 `public/assets/` 目录下，构建脚本自动从中提取 CSS 并合并为 `jjkx-site.css`。

### 4b 后处理流程

| 步骤 | 处理内容 |
|------|---------|
| 1 | 读取 firecrawl 输出的 HTML（兼容 JSON 包装和纯 HTML 两种格式） |
| 2 | 下载站点图片到 `images/`（logo.gif、weixin.png 等 7 个） |
| 3 | 下载文章内嵌图片到 `uploads/`（扫描详情页中的 W0\* 图片，去重下载，约 484 个） |
| 4 | 提取横幅背景图（从详情页 SingleFile 提取 `logobg-bg.png`） |
| 5 | 从 SingleFile 提取并合并完整 CSS（列表页 + 详情页） |
| 6 | URL 重写：将所有绝对 URL 改为相对路径 |
| 7 | 注入 CSS：在 `<body>` 前插入 `jjkx-site.css` 引用 |
| 8 | 清理 Chrome 错误页模板元素（隐藏 `zhbg`、`interstitial-wrapper` 等） |
| 9 | 替换 WAF 注入的 IP 标题为实际文章标题 |
| 10 | 移除 `subframe=""`、`content is blocked` 等注入内容 |

### URL 重写规则

| 原始 URL | 列表页路径 | 详情页路径 |
|---------|-----------|-----------|
| `https://www.cdr-adr.org.cn/images/{f}` | `images/{f}` | `../../images/{f}` |
| `.../drug_aqjs_jjkx/index_N.html` | `index_N.html` | `../../index_N.html` |
| `.../{YYYYMM}/t{id}.html`（详情链接） | `details/{YYYYMM}/t{id}.html` | `../../details/{YYYYMM}/t{id}.html`（同级页面） |
| `.../{YYYYMM}/W0*.jpg`（文章图片） | - | `../../uploads/W0*.jpg` |
| `../../../../images/X`（相对路径） | `images/X` | `../../images/X` |
| 搜索表单 `action="/so/s"` | `action="#"` | `action="#"` |

---

## 输出目录结构

```
output/jjkx/
├── index.html                         # 列表第1页
├── index_1.html ~ index_13.html       # 列表第2-14页
├── jjkx-site.css                      # 完整站点样式（从SingleFile提取合并）
├── images/
│   ├── logo.gif                       # 网站 logo
│   ├── weixin.png                     # 微信图标
│   ├── gzh.jpg                        # 公众号二维码
│   ├── list_dot15.gif                 # 列表项图标
│   ├── u41.jpg / u54.png              # 背景装饰
│   ├── favicon.ico                    # 网站图标
│   └── logobg-bg.png                  # 顶部横幅背景（从SingleFile提取）
├── uploads/                           # 文章内嵌图片（~484个）
│   ├── W020111013451039343933.jpg
│   ├── W020240730354872701533.png
│   └── ...
└── details/                           # 277个详情页
    └── {YYYYMM}/                      # 按年月分目录
        └── t{YYYYMMDD}_{id}.html
```

---

## 常见问题

### 为什么不能直接用 firecrawl 的 CSS？

这个网站通过 CDN/WAF 代理，页面被包裹在 **Chrome 错误页模板**（class `neterror`、`interstitial-wrapper` 等）中。线上访问时 Chrome 会自动应用其内置的错误页 CSS，但 firecrawl 只捕获原始 HTML，拿不到这些浏览器内置样式。

### 为什么需要 SingleFile？

SingleFile 在浏览器中运行，能捕获**完整的计算后 CSS**，包括：
- Chrome 内置错误页样式（`*{margin:0px auto}` 等全局规则）
- 站点自身的 CSS 类定义（导航 `.nav`、列表 `.liS1`、横幅 `.logobg` 等）
- 所有背景图以 data URL 形式嵌入，确保离线可用

### 图片路径规则

详情页比列表页深两级目录（`details/{YYYYMM}/`），所以图片路径需要加 `../../` 前缀。CSS 文件和图片都在 `output/jjkx/` 根目录，CSS 中引用图片用 `images/` 前缀，对列表页和详情页都生效。

### 隐藏的 Chrome 错误页元素

网站 HTML 中包含 `zhbg`（40px 高的遮罩层）、`interstitial-wrapper`、`error-code`、`icon` 等 Chrome 错误页元素。需要设置 `display:none` 隐藏，否则会遮挡页面内容或导致大块空白。
