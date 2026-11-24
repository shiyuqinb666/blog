# 随机视界 · 作品集站点

一个纯手写的静态站点：**没有框架、没有构建步骤、没有依赖**。克隆下来就是能跑的网站；改一个文件里的几行，内容和链接就全换掉。

```
blog/
├── index.html                    # 单页：Hero / 项目 / 功能 / 技术 / 关于 / 联系
├── 404.html                      # GitHub Pages 自定义 404
├── assets/
│   ├── css/style.css             # 全部样式（深色 + 浅色主题）
│   ├── js/projects.js            # ★ 唯一需要改的文件：站点信息 + 项目内容
│   ├── js/app.js                 # 渲染、链接开关、滚动动画
│   └── img/avatar.svg, favicon.svg
├── .github/workflows/pages.yml   # 推上去自动发布 GitHub Pages
├── .nojekyll                     # 跳过 Jekyll 处理
├── robots.txt / sitemap.xml      # 部署后改成真实地址
├── deploy.sh                     # 一键建仓 + 推送 + 开 Pages
└── README.md
```

## 先改这 4 行

打开 `assets/js/projects.js`，最上面的 `window.SITE`：

```js
window.SITE = {
  name: "[你的名字]",       // 站点标题、页脚署名
  github: "",               // 你的 GitHub 用户名；留空 = 全站隐藏仓库/下载/Issue 按钮
  repo: "random-video",     // 随机视界的仓库名
  email: "",                // 留空 = 隐藏「发邮件」按钮
  ...
};
```

> 留空是有意的设计：没配的链接不会渲染成死链，而是直接不显示。

再按需改 `tagline` / `bio` / `focus`，以及下面的 `window.PROJECT`（功能分组、技术要点、自研组件、版本存档）。

## 本地预览

```bash
python3 -m http.server 8080
# 打开 http://127.0.0.1:8080
```

直接双击 `index.html` 也能看（`file://` 下同样正常）。

## 部署到 GitHub Pages

### 方式 A：自带脚本（一步到位）

```bash
export GH_TOKEN=ghp_你的token      # classic token，勾 repo + workflow
./deploy.sh                        # 建仓 → 推送 → Pages 指向 GitHub Actions
```

可选：`REPO=my-blog ./deploy.sh`（改仓库名）、`PRIVATE=1 ./deploy.sh`（私有仓库）。
脚本会自动从 token 读出用户名，推送完把 token 从 `.git/config` 里清掉。

### 方式 B：手写命令

```bash
git init -b main
git add -A && git commit -m "feat: 随机视界作品集上线"
git remote add origin https://github.com/<用户名>/blog.git
git push -u origin main
```

然后仓库 **Settings → Pages → Source** 选 **GitHub Actions**。
地址：`https://<用户名>.github.io/blog/`

### 想要根地址 `https://<用户名>.github.io`

仓库名改成 `<用户名>.github.io`，其余不变。

## 特性

- 深/浅色主题：跟随系统，可手动切换并记忆
- 单项目作品集结构：主卡 + 功能分组 + 技术表 + 自研组件 + 版本存档
- 移动端优先：手机单列、平板双列、桌面多列
- 滚动渐入、卡片悬停、无 JS 时内容结构依然可读
- 零依赖、零构建，首屏 4 个请求（HTML / CSS / 2 个 JS）
- 自带 404、`.nojekyll`、`robots.txt`、`sitemap.xml`、自动部署工作流

## License

站点代码与文案归作者所有。
