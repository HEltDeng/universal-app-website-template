# 产品截图放这里

默认 01-home.svg 是通用界面占位图，不包含真实 App 内容。

可放入 01-home.png、02-feature.png、03-profile.png 等实际截图。
首页通过 site.config.json 的 assets.hero 选择一张图；功能卡片通过 features[].items[].image 选择图片，imageAlt 写对应替代文字。其他页面已有图片位置可读取 screenshots 配置。

推荐首页纵图比例 1200:2664。卡片图片保留真实比例，不要包含个人资料或凭据。文件引用示例：/screenshots/02-feature.png。
