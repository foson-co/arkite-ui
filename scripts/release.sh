#!/bin/bash
# release.sh - Cut a release: changeset version → commit → tag → push（只推 GitLab）
# 之後由 GitLab tag pipeline 發布：GitLab Package Registry 直接發布；npmjs 送進暫存區。
# 接著跑 `pnpm release:finish`：核准（2FA）→ 確認 npm 可安裝 → 同步 GitHub 鏡像 →
# starter 金絲雀 → 確認網站。GitHub 鏡像刻意不在這裡推：要等 npm 真的裝得到才公開。
# Usage: pnpm release:cut

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

printf "\n"
printf "========================================\n"
printf "    Arkite UI — Release Cut\n"
printf "========================================\n"

# Step 1: 前置檢查
printf "\n${YELLOW}[1/5] 前置檢查...${NC}\n"

BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
    printf "${RED}✗ 必須在 main 分支發版（目前：%s）${NC}\n" "$BRANCH"
    exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
    printf "${RED}✗ 工作目錄不乾淨，請先 commit 或 stash。${NC}\n"
    exit 1
fi

git fetch origin main --quiet
if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
    printf "${RED}✗ 本地 main 與 origin/main 不同步，請先 pull/push。${NC}\n"
    exit 1
fi
printf "${GREEN}✓ main 分支、工作目錄乾淨、與遠端同步${NC}\n"

# Step 2: 確認有待發布的 changeset
printf "\n${YELLOW}[2/5] 檢查 changesets...${NC}\n"
if ! ls .changeset/*.md 2>/dev/null | grep -v README > /dev/null; then
    printf "${RED}✗ 沒有待發布的 changeset，無事可發。${NC}\n"
    exit 1
fi
pnpm changeset status || exit 1

# Step 3: 驗證 + 測試 + build
printf "\n${YELLOW}[3/5] 驗證與測試...${NC}\n"
./scripts/verify-changesets.sh || exit 1
pnpm test || exit 1
pnpm run build || exit 1
printf "${GREEN}✓ 測試與 build 通過${NC}\n"

# Step 4: bump 版本並確認
printf "\n${YELLOW}[4/5] 消化 changesets、bump 版本...${NC}\n"
pnpm changeset version || exit 1
NEW_VERSION=$(node -p "require('./package.json').version" 2>/dev/null)
# llms.txt 標頭帶版本號,必須在 bump 之後重新生成,否則出貨的檔案寫舊版號
pnpm run generate:llms || exit 1

if ! grep -q "^## ${NEW_VERSION}" CHANGELOG.md; then
    printf "${RED}✗ CHANGELOG.md 沒有 ${NEW_VERSION} 的條目 — changeset version 可能失敗了，中止並還原。${NC}\n"
    git checkout -- .
    exit 1
fi

printf "\n即將發布：${GREEN}v%s${NC}\n" "$NEW_VERSION"
printf "CHANGELOG 摘要：\n"
awk "/^## ${NEW_VERSION//./\\.}/{flag=1; next} /^## /{flag=0} flag" CHANGELOG.md | head -20
printf "\n確定要 commit + tag + push 嗎？(y/N) "
read -r CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    printf "${YELLOW}已取消，還原版本變更。${NC}\n"
    git checkout -- .
    exit 0
fi

# Step 5: commit + tag + push（tag pipeline 接手發布）
printf "\n${YELLOW}[5/5] commit + tag + push...${NC}\n"
git add -A
git commit -m "chore: release v${NEW_VERSION}" || exit 1
git tag "v${NEW_VERSION}" || exit 1
# 只推新 tag，避免 --tags 把本地殘留的舊 tag 一起推上去觸發舊 pipeline
git push origin main "refs/tags/v${NEW_VERSION}" || exit 1

printf "\n${GREEN}========================================${NC}\n"
printf "${GREEN}  v%s 已推到 GitLab，tag pipeline 接手${NC}\n" "$NEW_VERSION"
printf "${GREEN}========================================${NC}\n"
printf "Pipeline:  https://gitlab.com/foson.co/arkite-ui/-/pipelines\n\n"
printf "${YELLOW}發版還沒完成。${NC}等 tag pipeline 的 publish:npmjs 把版本送進 npm 暫存區後，執行：\n\n"
printf "  ${GREEN}pnpm release:finish${NC}   （核准 → 確認可安裝 → GitHub 鏡像 → starter 金絲雀 → 確認網站）\n\n"
printf "GitHub 鏡像與 starter 會在 npm 確認可安裝後才更新。\n\n"
