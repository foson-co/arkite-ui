#!/usr/bin/env bash
#
# 把 @arkite-ui/core 打包並送到公開 npmjs（同 arkite-frontend 的 scripts/publish-npmjs.sh）。
#
# 用法：
#   scripts/publish-npmjs.sh --dry-run   # MR 階段：打包、檢查 tarball、npm stage publish --dry-run
#   scripts/publish-npmjs.sh             # CI 的 publish:npmjs：送進 npm 暫存區，等人工 2FA 核准
#
# 前提：已 `pnpm install` 且 `pnpm run build`（dist/ 存在）。
#
# 認證：npm Trusted Publishing（OIDC）。job 的 id_tokens 提供 NPM_ID_TOKEN，npm CLI
# （>= 11.15.0，`npm stage` 的最低版本）換成一次性授權——沒有任何 npm token。
# npm 端的 Trusted Publisher 權限只給 `npm stage publish`：版本進暫存區，要 arkite-ui
# org owner 以 2FA 核准（`npm stage approve <id>` 或 npmjs.com）才上線。CI 或本檔被濫用
# 時，最多留下一個待核准的 tarball。
#
# 為什麼先 pnpm pack 再 npm stage publish tarball：pnpm pack 會處理 workspace:／catalog:
# 等 pnpm 專屬協定；OIDC 交換由 npm CLI 實作，所以最後一步交給 npm。

set -euo pipefail

NPMJS="https://registry.npmjs.org/"
MODE="${1:-}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${ROOT}/.npmjs-pack"

case "${MODE}" in
  "" | --dry-run) ;;
  *)
    echo "usage: $0 [--dry-run]" >&2
    exit 2
    ;;
esac

if [ ! -d "${ROOT}/dist" ]; then
  echo "❌ dist/ 不存在：先執行 pnpm run build" >&2
  exit 1
fi

rm -rf "${OUT}"
mkdir -p "${OUT}"
(cd "${ROOT}" && pnpm pack --pack-destination "${OUT}" >/dev/null)

name="$(node -p "require('${ROOT}/package.json').name")"
version="$(node -p "require('${ROOT}/package.json').version")"
tgz="$(ls "${OUT}"/*.tgz)"

if tar -xzOf "${tgz}" package/package.json | grep -qE '"(workspace|catalog):'; then
  echo "❌ ${name}@${version} 的 package.json 仍含 workspace:／catalog: 協定" >&2
  exit 1
fi
if ! tar -tzf "${tgz}" | grep -q '^package/dist/'; then
  echo "❌ ${name}@${version} 的 tarball 沒有 dist/" >&2
  exit 1
fi

if npm view "${name}@${version}" version --registry "${NPMJS}" "--@arkite-ui:registry=${NPMJS}" >/dev/null 2>&1; then
  echo "⏭  ${name}@${version} 已在 npmjs，略過（tarball 檢查已通過）"
  exit 0
fi

# prerelease（0.24.0-beta.1）不可落在 latest：npm 11 會直接拒絕沒帶 --tag 的 prerelease
DIST_TAG="latest"
case "${version}" in *-*) DIST_TAG="next" ;; esac

if [ "${MODE}" = "--dry-run" ]; then
  npm stage publish "${tgz}" --dry-run --access public --tag "${DIST_TAG}" --registry "${NPMJS}" "--@arkite-ui:registry=${NPMJS}"
else
  npm stage publish "${tgz}" --access public --tag "${DIST_TAG}" --registry "${NPMJS}" "--@arkite-ui:registry=${NPMJS}"
  echo "📥 ${name}@${version} 已送進 npm 暫存區，等待 2FA 核准（npm stage list ${name}）"
fi
