#!/bin/bash
# release-finish.sh - 發版收尾（在 `pnpm release:cut` 之後、CI 把版本送進 npm 暫存區後執行）
#
#   1. 等 CI 把 vX.Y.Z 送進 npm 暫存區，顯示內容，核准（2FA）或拒絕
#   2. 確認 npm 上真的裝得到
#   3. 同步 GitHub 鏡像（main + tag）→ 觸發 ui.foson.co 重新部署
#   4. starter 金絲雀：arkite-admin-starter 升到新版，lint／format／typecheck／test／audit／build
#      全過才推 main → 觸發 starter.foson.co 重新部署
#   5. 確認兩個網站都已更新
#
# 為什麼拆成 cut／finish 兩段：npm 改為暫存發布（CI 只能 stage，owner 以 2FA 核准才上線）。
# 在核准前推 GitHub 或升 starter，公開門面會宣告一個 npm 還裝不到的版本，starter 也會安裝失敗；
# 核准若被拒，GitHub 上也已經有 tag。所以「公開出去」的動作一律在確認 npm 可安裝之後。
#
# Usage:
#   pnpm release:finish            # 核准並完成發版
#   pnpm release:finish --reject   # 拒絕暫存版（GitHub、starter、網站都不動）
#
# 環境變數：
#   ARKITE_STARTER_DIR  starter 的本機 checkout（預設：與本 repo 同層的 arkite-admin-starter）
#   GITHUB_PUSH_USER    推 GitHub 用的 gh 帳號（預設 daith，foson-co org owner）

set -uo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PKG="@arkite-ui/core"
NPMJS="https://registry.npmjs.org/"
# `npm stage` 需要 npm >= 11.15。必須釘確切版本：`npx npm@11` 會沿用本機已裝的舊 11.x（沒有 stage）。
NPM_PIN="npm@11.21.0"
GH_USER="${GITHUB_PUSH_USER:-daith}"
STARTER_REPO="foson-co/arkite-admin-starter"
STARTER_URL="https://starter.foson.co/"
SITE_URL="https://ui.foson.co/"

MODE="${1:-}"
case "$MODE" in
  "" | --reject) ;;
  *)
    printf "usage: %s [--reject]\n" "$0" >&2
    exit 2
    ;;
esac

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1
STARTER_DIR="${ARKITE_STARTER_DIR:-$(dirname "$ROOT")/arkite-admin-starter}"

npmx() { npx -y "$NPM_PIN" "$@"; }
fail() {
  printf "${RED}✗ %s${NC}\n" "$1" >&2
  exit 1
}
step() { printf "\n${YELLOW}[%s] %s${NC}\n" "$1" "$2"; }
ok() { printf "${GREEN}✓ %s${NC}\n" "$1"; }

# 只有本腳本登入的 npm session 才在結束時登出（`npm login` 會在 ~/.npmrc 留 token）
LOGGED_IN_BY_US=0
STARTER_WT=""
cleanup() {
  if [ "$LOGGED_IN_BY_US" = 1 ]; then
    npm logout --registry "$NPMJS" > /dev/null 2>&1 && printf "\n${GREEN}✓ 已 npm logout（~/.npmrc 不留 token）${NC}\n"
  fi
}
trap cleanup EXIT

printf "\n========================================\n"
printf "    Arkite UI — Release Finish\n"
printf "========================================\n"

# ---------------------------------------------------------------------------
step "1/6" "前置檢查"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
[ "$BRANCH" = "main" ] || fail "必須在 main（目前：$BRANCH）"
[ -z "$(git status --porcelain)" ] || fail "工作目錄不乾淨"
git fetch origin main --tags --quiet || fail "git fetch origin 失敗"
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] || fail "本地 main 與 origin/main 不同步，請先 git pull"

VERSION=$(node -p "require('./package.json').version")
TAG="v${VERSION}"
git rev-parse -q --verify "refs/tags/${TAG}" > /dev/null || fail "本地沒有 ${TAG}——是否還沒跑 pnpm release:cut？"
git ls-remote --exit-code --tags origin "refs/tags/${TAG}" > /dev/null || fail "GitLab 上沒有 ${TAG}"
# tag 必須在 main 的歷史上（不要求等於 HEAD：release:cut 之後 main 可能已有新 commit，
# 例如合併了不影響套件內容的 MR）。發布的是 tag 那一版，npm 上的內容以 tag pipeline 為準。
git merge-base --is-ancestor "$TAG" HEAD || fail "${TAG} 不在目前 main 的歷史上"
TAG_VERSION=$(git show "${TAG}:package.json" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.parse(s).version))')
[ "$TAG_VERSION" = "$VERSION" ] || fail "main 的 package.json 是 ${VERSION}，但 ${TAG} 是 ${TAG_VERSION}——main 上可能已經有下一版，請指定正確的版本"
ok "${PKG}@${VERSION}（${TAG} 已在 GitLab）"

if [ "$MODE" != "--reject" ]; then
  git remote get-url github > /dev/null 2>&1 || fail "找不到 github remote（foson-co/arkite-ui）"
  gh auth token --user "$GH_USER" > /dev/null 2>&1 || fail "gh 沒有 ${GH_USER} 帳號的登入（gh auth login）"
  [ -d "$STARTER_DIR/.git" ] || [ -f "$STARTER_DIR/.git" ] || fail "找不到 starter checkout：$STARTER_DIR（可設 ARKITE_STARTER_DIR）"
  ok "GitHub remote、gh（${GH_USER}）、starter checkout 都在"
fi

already_live() { npm view "${PKG}@${VERSION}" version --registry "$NPMJS" > /dev/null 2>&1; }

# ---------------------------------------------------------------------------
if [ "$MODE" = "--reject" ]; then step "2/6" "npm 暫存版：檢視並拒絕"; else step "2/6" "npm 暫存版：檢視並核准"; fi
if already_live && [ "$MODE" != "--reject" ]; then
  ok "${PKG}@${VERSION} 已在 npmjs（先前已核准），略過核准"
else
  if ! npmx whoami --registry "$NPMJS" > /dev/null 2>&1; then
    printf "需要以 arkite-ui org owner 登入 npm（瀏覽器 + 2FA）\n"
    npmx login --auth-type=web --registry "$NPMJS" || fail "npm login 失敗"
    LOGGED_IN_BY_US=1
  fi
  ok "npm 身分：$(npmx whoami --registry "$NPMJS" 2> /dev/null)"

  # 等 CI 的 publish:npmjs 把版本送進暫存區（最多 40 分鐘）
  STAGE_ID=""
  for i in $(seq 1 80); do
    LIST_JSON=$(npmx stage list "$PKG" --json --registry "$NPMJS" 2> /dev/null || true)
    # `npm stage list --json` 輸出 item 陣列：{ id, packageName, version, status, tag, createdAt, … }
    # （npm 11.21 lib/utils/key-values.js logStageItem）。只取同套件、同版本、尚未被拒絕的最新一筆。
    STAGE_ID=$(printf '%s' "$LIST_JSON" | node -e '
      let s = ""; process.stdin.on("data", (d) => (s += d)).on("end", () => {
        try {
          const [pkg, ver] = process.argv.slice(1);
          const items = JSON.parse(s);
          const hit = (Array.isArray(items) ? items : [])
            .filter((x) => x && x.packageName === pkg && x.version === ver && !/reject/i.test(String(x.status || "")))
            .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))[0];
          if (hit && hit.id) process.stdout.write(String(hit.id));
        } catch {}
      });' "$PKG" "$VERSION")
    [ -n "$STAGE_ID" ] && break
    [ "$i" = 1 ] && printf "等待 CI 的 publish:npmjs 把 %s 送進暫存區（每 30 秒檢查，最多 40 分鐘）" "$VERSION"
    printf "."
    sleep 30
  done
  printf "\n"
  if [ -z "$STAGE_ID" ]; then
    printf "${YELLOW}自動找不到 %s 的 stage id。暫存清單原文：${NC}\n%s\n" "$VERSION" "${LIST_JSON:-（空）}"
    printf "請確認 GitLab tag pipeline 的 publish:npmjs 已成功，或貼上 stage id（直接 Enter 中止）："
    read -r STAGE_ID
    [ -n "$STAGE_ID" ] || fail "中止"
  fi
  ok "stage id：${STAGE_ID}"

  npmx stage view "$STAGE_ID" --registry "$NPMJS" || fail "npm stage view 失敗"

  if [ "$MODE" = "--reject" ]; then
    printf "\n確定要${RED}拒絕${NC} %s@%s 嗎？(y/N) " "$PKG" "$VERSION"
    read -r CONFIRM
    { [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; } || fail "已取消"
    npmx stage reject "$STAGE_ID" --registry "$NPMJS" || fail "npm stage reject 失敗"
    printf "\n${YELLOW}已拒絕。GitHub 鏡像、starter、網站都沒有動。${NC}\n"
    printf "下一步：在 main 修正並加 changeset，再跑 pnpm release:cut 發下一個版本。\n"
    printf "（%s 這個 tag 已在 GitLab，保留不刪；不要重用 %s 這個版號。）\n" "$TAG" "$VERSION"
    exit 0
  fi

  printf "\n確定要${GREEN}核准${NC} %s@%s 上線嗎？（會要求 2FA）(y/N) " "$PKG" "$VERSION"
  read -r CONFIRM
  { [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; } || fail "已取消（暫存版保留，可稍後再跑 pnpm release:finish）"
  npmx stage approve "$STAGE_ID" --registry "$NPMJS" || fail "npm stage approve 失敗"
  ok "已核准"
fi

# ---------------------------------------------------------------------------
step "3/6" "確認 npm 上可安裝"
for i in $(seq 1 30); do
  already_live && break
  [ "$i" = 1 ] && printf "等待 registry 同步"
  printf "."
  sleep 20
done
printf "\n"
already_live || fail "10 分鐘後 npm 仍查不到 ${PKG}@${VERSION}——先不要推 GitHub；確認後重跑 pnpm release:finish"
ok "npm view ${PKG}@${VERSION} 可查到"

# 推 GitHub 用 daith 的 token，只給這一次 git 指令（不切換 gh 的 active 帳號）
gh_git() {
  GH_TOKEN="$(gh auth token --user "$GH_USER")" git -c credential.helper= -c credential.helper='!gh auth git-credential' "$@"
}

# ---------------------------------------------------------------------------
step "4/6" "同步 GitHub 鏡像（foson-co/arkite-ui：main + ${TAG}）"
gh_git push github main "refs/tags/${TAG}" || fail "推 GitHub 失敗。修好後重跑 pnpm release:finish（前面已完成的步驟會略過）"
ok "已推送；ui.foson.co 的 Pages 部署已觸發"

# ---------------------------------------------------------------------------
step "5/6" "starter 金絲雀（${STARTER_REPO}）"
git -C "$STARTER_DIR" fetch origin main --quiet || fail "starter git fetch 失敗"
CURRENT_IN_STARTER=$(git -C "$STARTER_DIR" show origin/main:package.json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const p=JSON.parse(s);process.stdout.write((p.dependencies||{})["@arkite-ui/core"]||"")})')
if [ "$CURRENT_IN_STARTER" = "^${VERSION}" ]; then
  ok "starter 已是 ^${VERSION}，略過"
  STARTER_SHA=""
else
  STARTER_WT="$(mktemp -d)/starter"
  BR="canary/arkite-ui-${VERSION}"
  git -C "$STARTER_DIR" worktree add -q -B "$BR" "$STARTER_WT" origin/main || fail "建立 starter worktree 失敗"
  (
    set -e
    cd "$STARTER_WT"
    pnpm install --no-frozen-lockfile
    pnpm add "@arkite-ui/core@^${VERSION}"
    pnpm lint
    pnpm format:check
    pnpm typecheck
    pnpm test
    pnpm audit --prod
    pnpm build
  ) || fail "金絲雀失敗：starter 升到 ${VERSION} 後有檢查沒過。發版尚未完成——worktree 保留在 ${STARTER_WT} 供檢查。npm 上的 ${VERSION} 已上線，修正請發下一個 patch。"
  git -C "$STARTER_WT" add package.json pnpm-lock.yaml
  git -C "$STARTER_WT" commit -q -m "chore: canary bump to @arkite-ui/core ${VERSION}" || fail "starter commit 失敗"
  STARTER_SHA=$(git -C "$STARTER_WT" rev-parse HEAD)
  (cd "$STARTER_WT" && gh_git push origin "HEAD:main") || fail "starter 推 main 失敗（commit ${STARTER_SHA} 在 ${STARTER_WT}）"
  git -C "$STARTER_DIR" worktree remove --force "$STARTER_WT" > /dev/null 2>&1
  git -C "$STARTER_DIR" branch -D "$BR" > /dev/null 2>&1
  ok "starter 已升到 ^${VERSION} 並推上 main（${STARTER_SHA:0:7}）；starter.foson.co 部署已觸發"
fi

# ---------------------------------------------------------------------------
step "6/6" "確認網站已更新"
SITE_OK=0
for i in $(seq 1 45); do
  if curl -fsSL --max-time 20 "$SITE_URL" 2> /dev/null | grep -q "$VERSION"; then
    SITE_OK=1
    break
  fi
  [ "$i" = 1 ] && printf "等待 ui.foson.co 顯示 %s" "$VERSION"
  printf "."
  sleep 20
done
printf "\n"
[ "$SITE_OK" = 1 ] && ok "ui.foson.co 已顯示 ${VERSION}" || printf "${YELLOW}⚠ 15 分鐘內 ui.foson.co 仍未顯示 %s，請查 GitHub Actions（deploy-storybook）${NC}\n" "$VERSION"

if [ -n "${STARTER_SHA:-}" ]; then
  RUN_OK=""
  for i in $(seq 1 45); do
    RUN_OK=$(GH_TOKEN="$(gh auth token --user "$GH_USER")" gh run list -R "$STARTER_REPO" --workflow deploy-demo.yml --limit 5 --json headSha,status,conclusion 2> /dev/null |
      node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const r=(JSON.parse(s||"[]")).find(x=>x.headSha===process.argv[1]);process.stdout.write(r?`${r.status}/${r.conclusion||""}`:"")})' "$STARTER_SHA")
    case "$RUN_OK" in completed/*) break ;; esac
    [ "$i" = 1 ] && printf "等待 starter 的 deploy-demo"
    printf "."
    sleep 20
  done
  printf "\n"
  if [ "$RUN_OK" = "completed/success" ] && curl -fsS -o /dev/null --max-time 20 "$STARTER_URL"; then
    ok "starter.foson.co 已部署（deploy-demo 成功，網站回應正常）"
  else
    printf "${YELLOW}⚠ starter deploy-demo 狀態：%s——請查 https://github.com/%s/actions${NC}\n" "${RUN_OK:-未找到}" "$STARTER_REPO"
  fi
fi

printf "\n${GREEN}========================================${NC}\n"
printf "${GREEN}  %s@%s 發版完成${NC}\n" "$PKG" "$VERSION"
printf "${GREEN}========================================${NC}\n"
printf "npm:      https://www.npmjs.com/package/%s/v/%s\n" "$PKG" "$VERSION"
printf "Pages:    %s\n" "$SITE_URL"
printf "Starter:  %s\n" "$STARTER_URL"
printf "\nCHANGELOG 若列了「可移除的 consumer workaround」，記得通知對應專案。\n\n"
