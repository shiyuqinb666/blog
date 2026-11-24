#!/usr/bin/env bash
# ============================================================
# 一键把本站发布到 GitHub（仓库 + Pages）
#
#   export GH_TOKEN=ghp_xxxx          # 需要 repo 与 workflow 权限
#   ./deploy.sh                       # 默认仓库名 blog、分支 main
#
# 可选环境变量：
#   REPO=my-blog     仓库名（默认 blog；想挂根域名就填 <用户名>.github.io）
#   USER_NAME=xxx    GitHub 用户名（默认读 API /whoami）
#   BRANCH=main      分支名
#   PRIVATE=0        1 = 建私有仓库
#   SKIP_PAGES=1     只推代码，不动 Pages 设置
# ============================================================
set -euo pipefail

cd "$(dirname "$0")"

REPO="${REPO:-blog}"
BRANCH="${BRANCH:-main}"
API="https://api.github.com"

say() { printf '\033[36m▸ %s\033[0m\n' "$*"; }
ok()  { printf '\033[32m✔ %s\033[0m\n' "$*"; }
die() { printf '\033[31m✘ %s\033[0m\n' "$*" >&2; exit 1; }

# ---------- 1. 凭据 ----------
TOKEN="${GH_TOKEN:-${GITHUB_TOKEN:-}}"
if [ -z "$TOKEN" ]; then
  cat <<'EOF'
缺少访问令牌。到 https://github.com/settings/tokens 新建一个 classic token，
勾选 repo 与 workflow，然后：

  export GH_TOKEN=ghp_xxxxxxxx
  ./deploy.sh
EOF
  exit 1
fi

api() { # api METHOD PATH [BODY]
  local method="$1" path="$2" body="${3:-}"
  if [ -n "$body" ]; then
    curl -sS -X "$method" -H "Authorization: Bearer $TOKEN" \
      -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" \
      -d "$body" "$API$path"
  else
    curl -sS -X "$method" -H "Authorization: Bearer $TOKEN" \
      -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" \
      "$API$path"
  fi
}

# ---------- 2. 身份 ----------
if [ -z "${USER_NAME:-}" ]; then
  USER_NAME="$(api GET /user | sed -n 's/.*"login"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)"
fi
[ -n "$USER_NAME" ] || die "拿不到 GitHub 用户名，检查 token 是否有效"
ok "账号：$USER_NAME"

# ---------- 3. 建仓（已存在就跳过）----------
PRIVATE_JSON=false
[ "${PRIVATE:-0}" = "1" ] && PRIVATE_JSON=true
CODE="$(curl -sS -o /tmp/gh_repo.json -w '%{http_code}' \
  -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  "$API/repos/$USER_NAME/$REPO")"
if [ "$CODE" = "404" ]; then
  say "创建仓库 $USER_NAME/$REPO"
  api POST /user/repos "{\"name\":\"$REPO\",\"private\":$PRIVATE_JSON,\"description\":\"Personal site: projects & notes\",\"auto_init\":false}" \
    | grep -q '"full_name"' || die "建仓失败（token 是否勾了 repo 权限？）"
  ok "仓库已创建"
else
  ok "仓库已存在，直接推送"
fi

# ---------- 4. 提交并推送 ----------
git rev-parse --git-dir >/dev/null 2>&1 || git init -q -b "$BRANCH"
git config user.name  >/dev/null 2>&1 || git config user.name  "$USER_NAME"
git config user.email >/dev/null 2>&1 || git config user.email "$USER_NAME@users.noreply.github.com"
git checkout -q -B "$BRANCH" 2>/dev/null || true
git add -A
git diff --cached --quiet || git commit -q -m "feat: 个人站点上线（$(date +%F)）"
git remote remove origin 2>/dev/null || true
git remote add origin "https://x-access-token:$TOKEN@github.com/$USER_NAME/$REPO.git"
git push -q -u origin "$BRANCH" --force
ok "已推送到 $USER_NAME/$REPO ($BRANCH)"

# 去掉 token，避免留在 .git/config 里
git remote set-url origin "https://github.com/$USER_NAME/$REPO.git"

# ---------- 5. 打开 Pages（Source = GitHub Actions）----------
if [ "${SKIP_PAGES:-0}" != "1" ]; then
  say "配置 GitHub Pages（Build source: GitHub Actions）"
  api PUT "/repos/$USER_NAME/$REPO/pages" '{"build_type":"workflow"}' >/dev/null 2>&1 \
    || api POST "/repos/$USER_NAME/$REPO/pages" '{"build_type":"workflow"}' >/dev/null 2>&1 \
    || echo "（Pages 接口没成功，去 Settings → Pages 手动选 GitHub Actions 即可）"
  ok "Pages 已指向工作流"
fi

# ---------- 6. 结果 ----------
URL="https://$USER_NAME.github.io/$REPO/"
[ "$REPO" = "$USER_NAME.github.io" ] && URL="https://$USER_NAME.github.io/"
echo
ok "全部完成"
echo "  仓库：https://github.com/$USER_NAME/$REPO"
echo "  站点：$URL"
echo "  首次构建约 30–90 秒，在 Actions 页面能看到进度。"
