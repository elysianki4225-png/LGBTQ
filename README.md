# 光谱档案 · Spectrum Archive

> 一个不收集隐私、无 Cookie、无第三方脚本的 **LGBTQ+ 中文资料站**。覆盖全部性少数身份与跨性别议题，包含一份尽量中立、可核查的「中国跨性别现状」长文；Material Design 3 风格，支持明暗主题与响应式阅读；纯静态，可托管在 GitHub Pages，也可用一条命令部署到自己的服务器。

- **在线体验（GitHub Pages）**：<https://elysianki4225-png.github.io/LGBTQ/>
- **一键部署（VPS）**：
  ```bash
  curl -fsSL https://raw.githubusercontent.com/elysianki4225-png/LGBTQ/main/deploy/install.sh | sudo bash
  ```
  默认自动检测公网 IP、用 `nip.io` 生成主机名并申请 Let's Encrypt 证书；也支持自有域名与自有证书，详见 [部署说明](https://elysianki4225-png.github.io/LGBTQ/deploy/)。
- **许可**：代码 [MIT](LICENSE-CODE)，文字内容 [CC BY-SA 4.0](LICENSE-CONTENT)

---

## 目录

- [这是什么](#这是什么)
- [内容结构](#内容结构)
- [隐私承诺](#隐私承诺)
- [设计与可访问性](#设计与可访问性)
- [本地构建](#本地构建)
- [部署](#部署)
- [AI 构建声明](#ai-构建声明)
- [准确性与免责声明](#准确性与免责声明)
- [参与与纠错](#参与与纠错)

---

## 这是什么

一个非官方、非营利的社区资料项目，不隶属于任何政党、宗教、国家机构或商业公司，不接受广告与赞助。

它想解决的三个具体问题：

1. **信息碎片化**：中文互联网上的 LGBTQ+ 资料散落在百科、论坛、短视频与匿名帖中，经常过期、带强烈立场或被平台清理。
2. **隐私风险**：很多相关站点加载统计、广告与社交插件，对处于敏感环境的使用者并不友好。
3. **中立性缺失**：讨论中国或其他地区的现状时，容易变成单向宣传。本站尝试把「法律文本 / 行政与司法实践 / 社群调查 / 国际报道 / 不同立场的争论」分开呈现，并标注每条信息的局限。

覆盖范围包括：女同性恋、男同性恋、双性恋、跨性别（含跨性别女性、跨性别男性、非二元）、酷儿、间性人、无性恋/芳香、泛性恋、性别流动、浪漫倾向等；不遗漏跨性别相关的医疗、证件、法律、家庭与社群议题。

## 内容结构

| 页面 | 内容 |
| --- | --- |
| [`/`](https://elysianki4225-png.github.io/LGBTQ/) | 首页：设计承诺、内容地图、关键数据、中国速览、安全提示 |
| [`/identities/`](https://elysianki4225-png.github.io/LGBTQ/identities/) | 身份图谱：性别认同、表达、指派性别、性倾向、浪漫倾向；L/G/B/T/Q/I/A/+；跨性别谱系；间性；语言与迷思 |
| [`/china/`](https://elysianki4225-png.github.io/LGBTQ/china/) | 中国专题：法律文本、2022 医疗规范、证件流程、就业与教育、家庭与转换治疗、媒体审查、司法个案、四种立场、20 项来源 |
| [`/rights/`](https://elysianki4225-png.github.io/LGBTQ/rights/) | 权益：国际人权框架、四种性别承认模式、14 个司法辖区比较、婚姻、反歧视、体育与单性别空间、青少年医疗、言论与救济 |
| [`/health/`](https://elysianki4225-png.github.io/LGBTQ/health/) | 健康：诊断与去病理化、医疗选项、HRT 效果与监测（不写剂量）、手术、心理健康、性与生殖健康、就医判断 |
| [`/support/`](https://elysianki4225-png.github.io/LGBTQ/support/) | 支持：危机步骤、热线（12356 等）、暴力与跟踪、心理支持、住房与就业、社群、家庭、如何帮助别人 |
| [`/ally/`](https://elysianki4225-png.github.io/LGBTQ/ally/) | 盟友：语言、工作/学校/家庭/医疗/网络/媒体场景、犯错修复、困难对话、争议参与 |
| [`/history/`](https://elysianki4225-png.github.io/LGBTQ/history/) | 历史：前现代、医学化与刑事化、石墙、HIV/AIDS、中国时间线、亚洲与全球、符号 |
| [`/data/`](https://elysianki4225-png.github.io/LGBTQ/data/) | 数据：人口估算、2021 调查、心理健康、就业、医疗可及性、ILGA 2026、如何读数字 |
| [`/news/`](https://elysianki4225-png.github.io/LGBTQ/news/) | 新闻：2024—2026 关键事件、事实核查方法、来源清单、三种叙事 |
| [`/resources/`](https://elysianki4225-png.github.io/LGBTQ/resources/) | 资源：热线、法律、医疗、社群、书影音、研究、隐私工具、可靠性判断 |
| [`/glossary/`](https://elysianki4225-png.github.io/LGBTQ/glossary/) | 词汇表：40+ 词条，支持本地搜索与分类筛选 |
| [`/security/`](https://elysianki4225-png.github.io/LGBTQ/security/) | 安全与隐私：数据流、威胁模型、防护清单、快速离开 |
| [`/deploy/`](https://elysianki4225-png.github.io/LGBTQ/deploy/) | 部署：GitHub Pages、VPS 一键脚本、自有证书、nip.io、加固清单 |
| [`/faq/`](https://elysianki4225-png.github.io/LGBTQ/faq/) | 常见问题：19 个高频问题 |
| [`/about/`](https://elysianki4225-png.github.io/LGBTQ/about/) | 关于：编辑原则、AI 声明、技术栈、可访问性、许可 |
| `/search/` | 站内搜索：本地匹配，查询不上传 |

## 隐私承诺

本站**没有**账号、表单、评论、统计、广告、Cookie、第三方字体与第三方脚本；不读取剪贴板、摄像头、麦克风或定位；不做指纹识别。

- 搜索索引是静态 JSON，首次输入时才下载，匹配全部在浏览器本地完成，查询词不进入网址、Cookie 或任何请求。
- 主题偏好（`spectrum.theme`）只写入你自己的 `localStorage`，可随时清除。
- 内容安全策略（CSP）限制脚本与资源只能来自本站。
- 没有 `setInterval`、`WebSocket` 或常驻监听；所有监听器挂在同一个 `AbortController` 上，`pagehide` 时统一移除，避免内存泄漏。

**但仍需注意**：你所在网络的服务商、单位网关、托管平台（GitHub Pages）与你点击的外链仍可能记录请求。本站无法消除这些风险，详见[安全页](https://elysianki4225-png.github.io/LGBTQ/security/)。

## 设计与可访问性

- Material Design 3 令牌（颜色、排版、形状、阴影、动效），浅色 / 深色 / 跟随系统三种模式。
- 全部图标为内联 SVG symbol，**不使用 emoji 作为界面图标**；不加载任何图标 CDN。
- 系统字体栈（包含中文回退），无远程字体请求。
- 语义化 HTML、跳过链接、可见焦点、键盘可用的导航与抽屉、`aria-live` 状态播报、表格 `caption`。
- 尊重 `prefers-reduced-motion`、`forced-colors` 与打印场景。
- 响应式：手机、平板、桌面；导航在窄屏折叠为抽屉。

## 本地构建

需要 Node.js 18+。**零依赖**，无需 `npm install`。

```bash
git clone https://github.com/elysianki4225-png/LGBTQ.git
cd LGBTQ
node tools/build.mjs
```

构建会在仓库根目录生成静态站点（`index.html`、各页面目录、`404.html`、`sitemap.xml`、`robots.txt`、`site.webmanifest`、`assets/data/search-index.json`）。

本地预览（任选其一）：

```bash
npx serve .            # 需要网络下载一次 serve
python3 -m http.server 8080
```

> 直接双击 `index.html` 也能读正文，但站内搜索依赖 `fetch`，在 `file://` 下会被浏览器拦截；请用上面的本地服务器。

常用命令：

```bash
node tools/build.mjs                              # 重新构建
npx html-validate "index.html" "*/index.html"     # HTML 校验
node --check assets/js/app.js                     # 语法检查
```

编辑内容：

- `src/site.config.mjs` — 站点元数据与页面清单（导航、标题、SEO 描述）
- `src/pages/*.html` — 页面正文（构建时自动生成标题 id、目录、搜索索引）
- `src/layout.html` — 页面外壳与 CSP
- `src/icons.svg` — SVG 图标 sprite
- `assets/css/*.css` — 设计令牌与样式分层（`tokens` / `base` / `components` / `pages` / `content`）
- `assets/js/*.js` — 交互（主题、抽屉、快速离开、复制、筛选、搜索）

## 部署

### GitHub Pages（当前在线演示）

推送 `main` 分支后由 GitHub Pages 自动发布：

<https://elysianki4225-png.github.io/LGBTQ/>

### VPS 一键部署

```bash
# 无域名：自动用 <公网IP>.nip.io + Let's Encrypt
curl -fsSL https://raw.githubusercontent.com/elysianki4225-png/LGBTQ/main/deploy/install.sh | sudo bash

# 自有域名
DOMAIN=lgbtq.example.org EMAIL=you@example.org \
  sudo -E bash deploy/install.sh

# 自有证书（跳过 ACME）
DOMAIN=lgbtq.example.org \
CERT_PATH=/root/certs/fullchain.pem \
KEY_PATH=/root/certs/privkey.pem \
  sudo -E bash deploy/install.sh

# 只跑 HTTP（内网 / 测试）
DOMAIN=none sudo -E bash deploy/install.sh
```

脚本会安装 nginx 与 certbot、下载站点静态文件、写入一个启用安全头的 nginx 配置、申请或安装证书、reload 服务。**不收集数据、不安装统计、不执行下载内容中的其他脚本**。支持 Debian 12+ / Ubuntu 22.04+。

其他变量：`SITE_ROOT`、`REPO_REF`、`ARCHIVE_URL`、`ENABLE_HSTS`、`NGINX_SITE`、`SKIP_PACKAGES`、`DRY_RUN`（只看将要执行的操作）。

参考配置见 [`deploy/nginx.conf`](deploy/nginx.conf)。

## AI 构建声明

**本项目的代码与大部分文字由 AI 辅助生成**，再由维护者整理、校对与修订。

AI 会犯错：可能引用不存在的来源、混淆时间线、把争议写成定论。我们通过以下方式降低风险：优先引用官方文件与一手来源、标注日期与样本、在争议议题上并列支持与批评双方的理由、明确区分事实与观点。但**不能保证内容完全无误**。

请把本站当作研究起点，而不是最终裁决。涉及医疗、法律、安全或庇护决定时，请咨询有资质的专业人士与当地社群。

## 准确性与免责声明

- 本站**不提供**医疗、法律或心理治疗服务，也不构成任何形式的专业建议。
- 法律、政策与医疗规范会变化；页面标注「更新于 2026 年 10 月 31 日」，引用前请核对官方最新文本。
- 社群调查（如《2021 全国跨性别健康调研报告》）为便利样本，不能外推为全国人口数据。
- 外部链接仅作索引，本站不对第三方内容、隐私政策或可用性负责。
- 本站不对任何国家、政党或政治立场背书；对具体法律与政策的批评不针对任何群体的成员。

## 参与与纠错

- [提交 Issue](https://github.com/elysianki4225-png/LGBTQ/issues)：事实错误、失效链接、可访问性问题、措辞建议。
- [安全报告](https://github.com/elysianki4225-png/LGBTQ/security/advisories/new)：隐私或安全问题，请勿在公开 Issue 中披露敏感细节。
- 请在 Issue 中附上可核查的来源链接；不要提交身份证、病历、裸照、精确地址或他人的个人信息。

---

<sub>非官方社区项目 · 代码 MIT · 内容 CC BY-SA 4.0 · 不收集数据 · 由 AI 辅助构建</sub>
