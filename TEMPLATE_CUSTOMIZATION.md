# 5 分钟换成新产品

主要只改四处：`site.config.json`、`content/`、`public/brand/`、`public/screenshots/`。

1. **换 Logo**：替换 `public/brand/logo.svg`；换文件名就改 `assets.logo`。
2. **换 App Icon**：替换 `public/brand/app-icon.svg`；同时换 favicon 和 social-preview。路径在 `assets`。
3. **改网站名称**：改 `brand.name`、`shortName`、`description`，再改 `hero.title` 与 `footer.copyright`。
4. **改主题颜色和字体**：改 `theme.colors`、`theme.dark` 和 `theme.fonts`。细部颜色集中在 `theme.palette`。
5. **改导航和右上三个 Icon**：改 `navigation` 和 `headerActions`。只换目标时改 href；图标名称来自 `public/assets/icons/`。`@support` 和 `@github` 自动读联系方式与 GitHub。
6. **改首页文字**：改 `hero`，再看 `content/index.json`。CTA 的 label 和 href 放在 primaryAction / secondaryAction。
7. **改功能**：改 `features[].items`，增加/删除卡片直接改数组。新分组的 id 加入 `featureSections[].groupIds`。原有网格和并排结构保留。
8. **换产品截图**：放入 `public/screenshots/`；主视觉改 `assets.hero`，功能配图改对应 item.image。路径不要带 public。
9. **改下载链接**：改 `download.url` 和版本、大小、SHA-256。暂未发布就留空，模板会显示禁用状态。
10. **改 GitHub / 联系方式**：改 `github.url`、`support.email`，检查 `footer` 和 `manual.url`。

最后检查 `domain`、`seo`、`content/*.json` 的页面文字、隐私/条款和 `content/releases.json`。更新日志是示例，不是真实发行记录；公告默认关闭。`CONTENT_FIELDS.md` 可查全部文案位置。品牌图片里的占位文字要随图片一起替换。

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
```

用桌面和手机各看一遍导航、三个图标、下载和全部页面。确认正式内容后再开启 `seo.indexable`。将 dist 上传到自己的静态站点即可。

不要把 `.env`、密钥、生产数据库、APK 缓存和个人截图目录整体提交到 Git。模板不需要任何凭据。
