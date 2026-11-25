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

当前线上用的是**分支直发**：Pages 的 Source 指向 `main` 分支根目录，
推一次就自动重建（`.nojekyll` 保证静态文件原样发布，不走 Jekyll）。

### 本机凭据（只配一次）

```bash
mkdir -p ~/.dsh/secrets && chmod 700 ~/.dsh/secrets
printf '%s' 'ghp_你的token' > ~/.dsh/secrets/github.token
chmod 600 ~/.dsh/secrets/github.token
```

有了这个文件，`deploy.sh` 会自动读取，不必每次 `export`。
任何 GitHub API 调用也可以用 `~/tools/ghapi`：

```bash
ghapi /user
ghapi /repos/shiyuqinb666/blog/pages/builds/latest
```

### 发一次新版本

```bash
cd blog
./deploy.sh            # 没改动就只做一次 no-op 推送；有改动会自动 commit + push
```

可选参数：`REPO=my-blog`（换仓库名）、`PRIVATE=1`（私有仓库）、`SKIP_PAGES=1`（只推代码）。
脚本会从 token 读出用户名，推送完把 token 从 `.git/config` 里清掉。

### 改用 GitHub Actions 部署（可选）

Actions 需要能推送 `.github/workflows/pages.yml`，而当前 token 只有 `repo` 权限，
所以该文件在 `.gitignore` 里排除。想切过去：

1. 重新生成 token，额外勾选 **workflow**
2. 删掉 `.gitignore` 里的 `.github/` 一行
3. `git add .github && git commit -m "ci: 启用 Actions 部署" && git push`
4. 仓库 **Settings → Pages → Source** 改成 **GitHub Actions**

### 地址

- 仓库：https://github.com/shiyuqinb666/blog
- 站点：https://shiyuqinb666.github.io/blog/
- 想挂根地址 `https://<用户名>.github.io`：把仓库改名为 `<用户名>.github.io`

## 特性

- 深/浅色主题：跟随系统，可手动切换并记忆
- 单项目作品集结构：主卡 + 功能分组 + 技术表 + 自研组件 + 版本存档
- 移动端优先：手机单列、平板双列、桌面多列
- 滚动渐入、卡片悬停、无 JS 时内容结构依然可读
- 零依赖、零构建，首屏 4 个请求（HTML / CSS / 2 个 JS）
- 自带 404、`.nojekyll`、`robots.txt`、`sitemap.xml`、自动部署工作流

## License

站点代码与文案归作者所有。
