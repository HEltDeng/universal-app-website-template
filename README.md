# Universal App Website Template

A reusable, responsive website template for apps and digital products.

这是一个 Vite 多页面静态官网模板。界面布局、响应式导航、左侧移动抽屉、图标快捷入口、深浅色、卡片和动画已保留。品牌和内容通过 JSON 配置在开发与构建时生成，无需改 HTML/CSS。无需后端、环境变量或第三方云服务。

## 快速开始

安装 Node.js 22.13+（推荐当前受支持的 LTS），然后执行：

```bash
git clone https://github.com/HEltDeng/universal-app-website-template.git
cd universal-app-website-template
npm install
npm run dev
```

仓库目前是 Private，clone 需要已有访问权限。打开终端显示的本地地址。配置修改后自动刷新。

## 配置入口

主要改 `site.config.json`，页面额外文案改 `content/*.json`。JSON 使用双引号，不支持注释、尾逗号或函数。配置不接受原始 HTML，文本会自动转义。

| 要修改什么 | 配置位置 |
| --- | --- |
| 网站名称、短名称、简介 | `brand.name` / `brand.shortName` / `brand.description` |
| 域名 | `domain`，HTTPS 且不要写页面路径 |
| Logo、App 图标、favicon | `assets.logo` / `assets.appIcon` / `assets.favicon` |
| 首页主视觉、分享图片 | `assets.hero` / `assets.socialPreview` |
| 字体 | `theme.fonts` |
| 主题颜色 | `theme.colors`；暗色 `theme.dark` |
| 顶部导航 | `navigation` |
| 右上角快捷图标 | `headerActions` |
| 首页 | `hero` 与 `content/index.json` |
| 功能 | `features`；分区布局选择 `featureSections` |
| 下载 | `download` |
| GitHub | `github.url` |
| 联系方式、可选二维码 | `support` |
| 页脚 | `footer` |
| SEO | `seo`、`domain`、`content/<页面>.json` 的 `title` / `description` |
| 更新日志、公告 | `content/releases.json` / `content/announcements.json` |
| 手册入口 | `manual.url` |

## 修改品牌

统一品牌资源目录为 `public/brand/`：

| 文件 | 用途 | 建议 |
| --- | --- | --- |
| `logo.svg` | Header 网站 Logo | 正方形；默认显示 38×38 |
| `app-icon.svg` | 下载卡片 App Icon | 正方形；建议至少 256×256 |
| `favicon.svg` | 浏览器标签页图标 | SVG、PNG 或 ICO |
| `hero-app.svg` | 首页手机主视觉 | 默认纵横比 1200:2664 |
| `social-preview.svg` | 社交分享卡片 | 正式分享建议换成 1200×630 PNG/JPG |

可以直接替换同名文件；改扩展名时同步修改 `assets`。浏览器路径不带 `public`，例如 `/brand/logo.png`。示例 SVG 中的文字属于图片本身，换站时请替换图片。

## 修改网站名称

修改 `brand.name`、`brand.shortName` 和 `brand.description`。Hero 的大标题可以是不同的营销标题，因此单独修改 `hero.title`；版权行单独修改 `footer.copyright`。页面 title 自动组合页面名称、品牌和 `seo.titleSuffix`。

## 修改字体

只改 `theme.fonts.sans`、`display`、`mono`。默认中文系统字体回退链保留。`display` 默认继承 sans。不会改变字号、字重、行高或断点。自托管字体可放 `public/fonts/`；如需要引入新的字体文件加载规则，再添加对应 `@font-face`，日常选择字体仍在配置中完成。

## 修改颜色

日常换色只改 `theme.colors` 中的 `primary`、`primary-hover`、`background`、`surface`、`text`、`text-secondary`、`border`。这些值统一映射到既有样式。

`theme.dark` 配置暗色语义色；`theme.light` 是现有语义变量的映射。`theme.palette` 收纳原设计的渐变、透明度、边框与特殊状态色；需要完整调整整套配色时在这里改，不用搜索 CSS。默认值保持原界面配色。圆角、间距、字号、断点和动画仍由原样式负责。

## 修改导航

编辑 `navigation` 数组，每项为 `{ "page": "features", "href": "features.html", "label": "功能介绍" }`。首页的 `page` 值为 `home`。其他页面值与文件名一致。导航顺序同步到桌面和移动端，当前页面有 Active 状态。移动端保留汉堡按钮、遮罩、左侧抽屉、关闭按钮、Escape 与快捷入口。

## 修改右上角快捷图标

编辑 `site.config.json` 的 `headerActions`。默认依次为明暗、联系、公告、QQ、GitHub，共五个入口。位置、点击区域、Hover、Tooltip 和移动适配由保留的 Header 样式控制，不需要改组件。

```json
[
  { "type": "theme", "icon": "moon", "label": "明暗模式" },
  { "type": "link", "icon": "mail", "label": "联系我们", "href": "@support" },
  { "type": "announcement", "icon": "bell-ring", "label": "公告" },
  { "type": "community", "icon": "qq", "label": "QQ 联系" },
  { "type": "link", "icon": "github", "label": "GitHub", "href": "@github", "newTab": true }
]
```

`@support` 读取 `support.email`，`@github` 读取 `github.url`，也可直接写页面、HTTPS 或 mailto 地址。`newTab: true` 自动添加 `noopener noreferrer`。`icon` 填 `public/assets/icons/` 内 SVG 的文件名，不带扩展名。可按同样结构替换各项，或按需增减；图标数量较多或标题过长时请复查手机布局。

已启用的功能类型：`announcement`（图标建议 `bell-ring`，读取本地公告），`community`（读取 `support.community`，显示可选联系弹窗）。移动端明暗按钮保留在 Header，其余入口随原模式出现在抽屉中。类型对应的状态提示（如明暗或无公告）由交互逻辑动态更新。

## 修改首页

`hero` 包括标题、副标题、介绍、badge、两个 CTA、概要列表及手机图旁的文字。主视觉路径为 `assets.hero`。`content/index.json` 包括产品说明、未来展望等补充文字。它们完全独立于布局。

## 修改功能

**在 `features[].items` 中添加功能。** 每项包含 `icon`、`title`、`description`、`image`、`imageAlt`。`image` 为空时不显示图片。

`features` 是功能分组，`id` 必须唯一。默认保留 6 项网格、3 项网格以及两组并排 2 项网格。可任意增加/删除分组内的卡片，不需要改 HTML。`preview: true` 的分组显示在首页。

增加整个分组时，复制一个分组，改 `id`，然后把该 id 加到 `featureSections[].groupIds`。`featureSections` 选择既有整宽、浅底或并排分区；无需新写 CSS。删除分组时同步移除 groupIds 引用。计数和首页锚点自动生成。

## 修改下载地址

修改 `download.url`、`version`、`displayVersion`、`releaseDate`、`size`、`sha256`、`platform`。下载按钮文字为 `label`，空地址提示为 `unavailableLabel`。文件大小和校验值必须对应实际文件；模板不包含 APK，也不会伪造下载成功。默认地址为空，按钮明确禁用。iOS 地址单独填 `iosUrl`。可填 HTTPS 地址或 `public/` 下文件的绝对站内路径。

## 修改 GitHub

修改 `github.url`。默认是通用 GitHub 平台首页，不指向任何实际业务项目。

## 添加截图

替换 `public/screenshots/` 内文件，修改 `screenshots` 配置或功能卡片的 `image`。主视觉通过 `assets.hero` 单独选择，也可以指向 `/screenshots/01-home.png`。默认不增加额外相册布局；图片显示在现有主视觉和功能卡片位置。详见目录内 README。

## 修改联系方式

修改 `support.email`、邮件主题 `subject` 和 `complaintSubject`。默认 `hello@example.com` 是占位地址，不能用于真实收件。可选支持页二维码/链接在 `support` 内配置；留空保留空状态，不会联系任何生产服务。

## 配置 QQ 联系按钮

默认 Header 已显示 QQ 图标；手机端入口在汉堡菜单内。点击后使用既有弹窗展示联系人、群号和二维码；不会直接发送消息或自动加入群聊。

在 `support.community` 中设置：

| 字段 | 含义 |
| --- | --- |
| `qqEnabled` | 设置为 true 后展示已配置的联系方式；默认 false 显示待配置状态 |
| `qqPersonalNumber` | 对外公开的个人 QQ 号，可留空 |
| `qqPersonalUrl` | 个人联系的 HTTPS 链接，可留空 |
| `qqGroupNumber` | 对外公开的群号，可复制 |
| `qqGroupUrl` | QQ 官方生成的 HTTPS 加群链接 |
| `qqGroupQrImage` | 站内二维码图片，例如 `/brand/qq-group.png` |

把二维码放到 `public/brand/qq-group.png`，配置路径不带 public。也支持 `/screenshots/` 及原有 `/assets/images/`、`/assets/icons/` 目录。二维码路径不接受外链、目录跳转或编码路径。模板不附带真实群号、加群地址或二维码。

弹窗标题、说明和图片替代文字自动使用 `brand.name`。不需要 QQ 时，从 `headerActions` 删除 `type: "community"` 的项即可。公告数组为空时，公告按钮保持禁用状态；填入本地公告后自动启用。

## 修改 Footer

修改 `footer.links`、`footer.entries`（三张快捷入口卡片）、`footer.copyright`。备案仅在 `footer.filing` 中有真实配置时显示，模板不含备案号。底部版本自动读取下载配置。

## 页面内容与 SEO

保留首页、功能、下载、更新日志、指南、联系、鸣谢、支持、合作、隐私、条款、手册共 12 个页面。FAQ 在指南内。所有额外页面文字在 `content/<文件名>.json` 的 `text` 中，字段按原元素/位置命名；直接查看当前文字即可定位。`CONTENT_FIELDS.md` 提供完整字段索引。

页面 `title`、`description` 管理该页搜索标题和描述；`seo.titleSuffix`、`seo.locale`、`domain`、`assets.socialPreview` 管理公共信息。构建输出 canonical、OpenGraph、robots、sitemap 和 Web Manifest。默认 `seo.indexable: false`，避免示例站被索引。正式换站完成后再改为 true。所有页面标题与正文在构建产物中直接存在，不依赖 JS 替换。

更新日志编辑 `content/releases.json`。公告编辑 `content/announcements.json`，如：

```json
[{ "id": "welcome", "title": "新版本公告", "content": "公告正文", "publishedAt": "2026-09-11", "updatedAt": "2026-09-11" }]
```

公告保持原有详情弹窗与已读交互，通过站内入口打开，不请求生产 API。默认空数组，不显示公告。隐私和条款只是示例内容，发布具体产品前请填写该产品真实适用的内容。

## 本地开发

```bash
npm run dev
npm run lint
npm test
```

Lint 检查 JS 语法、JSON、配置和所有模板。Test 覆盖转义、嵌套列表、第二产品配置、功能数量变化、不安全链接与主题输入。可重复安装用 `npm ci`。

## Build

```bash
npm run build
npm run preview
```

构建产物在 `dist/`，不提交 Git。不要直接双击根目录 HTML；这些文件是 Vite 入口，内容来自 `src/pages/`。开发预览与生产构建共用同一套配置渲染。

## Deploy

将 `dist/` 上传到任何支持静态文件的托管服务，保留 `.html` 页面和资源目录。服务器默认文档设置为 `index.html`。这是多页面站，不需要 SPA fallback；不存在的路径应返回 404。模板按域名根路径部署；如需子路径托管，请先调整并测试基础路径。

本模板不包含部署凭据、服务器地址或自动发布绑定，不执行 DNS 或生产部署。

## 目录

```text
site.config.json          品牌、功能、主题、公共链接
content/                  页面文字、公告、更新日志
public/brand/             品牌资源
public/screenshots/       示例截图
public/assets/icons/      保留的界面图标
src/pages/                保留的页面布局模板
assets/styles/site.css    保留的响应式样式和交互状态
assets/scripts/site.js    保留的导航、主题、指南、弹窗交互
scripts/                  构建渲染、配置验证、lint
tests/                    可重复的模板测试
```

## 许可与公开状态

目前作为私人模板保存，未向模板整体附加开源授权。Lucide 图标许可完整保留于 `THIRD_PARTY_NOTICES.md`。原界面的设计/实现来源尚需进一步确认；**PUBLIC READY: NO**。公开前须确认继承 UI 的再分发权限，并复核平台标识使用。业务数据和凭据清洗通过不等于第三方授权已核清。
