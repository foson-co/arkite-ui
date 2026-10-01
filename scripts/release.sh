#!/bin/bash
# release.sh - Cut a release: changeset version → commit → tag → push
# 之後由 GitLab tag pipeline 發布：GitLab Package Registry 直接發布；npmjs 送進暫存區，
# 需 arkite-ui org owner 以 2FA 核准（npm stage approve 或 npmjs.com）才上線。
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
printf "\n${YELLOW}[1/6] 前置檢查...${NC}\n"

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
printf "\n${YELLOW}[2/6] 檢查 changesets...${NC}\n"
if ! ls .changeset/*.md 2>/dev/null | grep -v README > /dev/null; then
    printf "${RED}✗ 沒有待發布的 changeset，無事可發。${NC}\n"
    exit 1
fi
pnpm changeset status || exit 1

# Step 3: 驗證 + 測試 + build
printf "\n${YELLOW}[3/6] 驗證與測試...${NC}\n"
./scripts/verify-changesets.sh || exit 1
pnpm test || exit 1
pnpm run build || exit 1
printf "${GREEN}✓ 測試與 build 通過${NC}\n"

# Step 4: bump 版本並確認
printf "\n${YELLOW}[4/6] 消化 changesets、bump 版本...${NC}\n"
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
printf "\n${YELLOW}[5/6] commit + tag + push...${NC}\n"
git add -A
git commit -m "chore: release v${NEW_VERSION}" || exit 1
git tag "v${NEW_VERSION}" || exit 1
# 只推新 tag，避免 --tags 把本地殘留的舊 tag 一起推上去觸發舊 pipeline
git push origin main "refs/tags/v${NEW_VERSION}" || exit 1

# Step 6: 同步 GitHub 鏡像（foson-co/arkite-ui；push 會觸發 Pages 部署展示站）
# 鏡像在 foson-co org（daith 為 owner），走 daith 憑證的 gh credential helper。
# 鏡像失敗不影響發版（npm 已由 GitLab pipeline 接手），僅提示手動補推。
printf "\n${YELLOW}[6/6] 同步 GitHub 鏡像...${NC}\n"
if git remote get-url github > /dev/null 2>&1; then
    gh auth switch --user daith > /dev/null 2>&1
    if git -c credential.helper= -c credential.helper='!gh auth git-credential' \
        push github main "refs/tags/v${NEW_VERSION}"; then
        printf "${GREEN}✓ GitHub 鏡像已同步（main + v%s），Pages 部署已觸發${NC}\n" "$NEW_VERSION"
    else
        printf "${YELLOW}⚠ 鏡像推送失敗（發版不受影響），稍後手動補推：${NC}\n"
        printf "  gh auth switch --user daith && git -c credential.helper= -c credential.helper='!gh auth git-credential' push github main refs/tags/v%s\n" "$NEW_VERSION"
    fi
else
    printf "${YELLOW}⚠ 找不到 github remote，略過鏡像同步${NC}\n"
fi

printf "\n${GREEN}========================================${NC}\n"
printf "${GREEN}  v%s 已推送，GitLab CI 接手發布${NC}\n" "$NEW_VERSION"
printf "${GREEN}========================================${NC}\n"
printf "Pipeline:  https://gitlab.com/foson.co/arkite-ui/-/pipelines\n"
printf "npm:       https://www.npmjs.com/package/@arkite-ui/core\n"
printf "GitLab:    https://gitlab.com/foson.co/arkite-ui/-/packages\n"
printf "Pages:     https://ui.foson.co/\n\n"
