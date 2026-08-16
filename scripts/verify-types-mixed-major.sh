#!/bin/bash
# verify-types-mixed-major.sh — prove core's .d.ts resolve React types per consumer
# Usage: ./scripts/verify-types-mixed-major.sh
#
# WHY THIS EXISTS
#
# Our .d.ts import React's types instead of inlining them:
#
#     import { ReactNode, ... } from 'react';   // dist/index.d.ts
#
# so `ReactNode` is resolved in the CONSUMER's install tree. Which copy of
# @types/react that lands on is decided by pnpm's linking, and that is exactly
# what `typecheck:react19` cannot see — that job type-checks core against one
# React at a time, inside our own repo. It passes whether or not the peer is
# declared correctly. This script covers the gap it leaves.
#
# The failure it pins (reported by ark-museum, GitLab #22, on 0.21.1): with
# @types/react undeclared as a peer, pnpm left core's variant directory without
# one, so resolution walked up to the single hoisted copy in
# .pnpm/node_modules/ — one version for the entire repo. Any workspace on a
# different React major then got someone else's ReactNode:
#
#     error TS2322: Type 'React.ReactNode' is not assignable to type
#       'import(".../@types+react@18.3.31/...").ReactNode'.
#       Type 'bigint' is not assignable to type 'ReactNode'.
#
# (`bigint` is the tell — React 19 added it to ReactNode.)
#
# This builds a throwaway workspace with two apps on DIFFERENT React majors,
# both consuming a packed tarball of the current working tree, and requires
# both to type-check. Removing "@types/react" from peerDependencies must make
# this fail — if it doesn't, the test has stopped testing anything.

set -uo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

REPO="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

printf "\n========================================\n"
printf "  Arkite UI — Mixed React Major Types\n"
printf "========================================\n\n"

# --- guard: the declaration this whole script defends -----------------------
if ! node -e "process.exit(require('$REPO/package.json').peerDependencies['@types/react'] ? 0 : 1)"; then
  printf "${RED}✗${NC} @types/react is missing from peerDependencies\n"
  printf "  Without it, consumers on a second React major get TS2322 on every\n"
  printf "  ReactNode prop. See the comment at the top of this script.\n\n"
  exit 1
fi
printf "${GREEN}✓${NC} @types/react declared as a peer dependency\n"

# --- pack the current working tree ------------------------------------------
printf "  Packing @arkite-ui/core ...\n"
if ! (cd "$REPO" && pnpm pack --pack-destination "$WORK" > "$WORK/pack.log" 2>&1); then
  printf "${RED}✗${NC} pnpm pack failed\n"; tail -20 "$WORK/pack.log"; exit 1
fi
TGZ="$(ls "$WORK"/*.tgz | head -1)"

# --- throwaway workspace: apps/web on 19, apps/field on 18 ------------------
mkdir -p "$WORK/ws/apps/web" "$WORK/ws/apps/field"
printf 'packages:\n  - "apps/*"\n' > "$WORK/ws/pnpm-workspace.yaml"
printf '{ "name": "mixed-major-fixture", "private": true, "version": "0.0.0" }\n' > "$WORK/ws/package.json"

emit_app() {
  local dir="$1" react="$2" types="$3"
  cat > "$WORK/ws/apps/$dir/package.json" <<EOF
{
  "name": "app-$dir",
  "private": true,
  "version": "0.0.0",
  "dependencies": {
    "@arkite-ui/core": "file:$TGZ",
    "react": "^$react",
    "react-dom": "^$react",
    "lucide-react": "^0.460.0",
    "zustand": "^5.0.1",
    "tailwindcss": "^4.2.1",
    "@radix-ui/react-popover": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@tanstack/react-virtual": "^3.10.0"
  },
  "devDependencies": {
    "@types/react": "^$types",
    "@types/react-dom": "^$types",
    "typescript": "^5.7.2"
  }
}
EOF
  cat > "$WORK/ws/apps/$dir/tsconfig.json" <<'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src"]
}
EOF
  mkdir -p "$WORK/ws/apps/$dir/src"
  # Build a ReactNode from the APP's own @types/react, hand it to a core prop.
  # Same shape as the AppShell TS2322 in the original report.
  cat > "$WORK/ws/apps/$dir/src/App.tsx" <<'EOF'
import type { ReactNode } from 'react';
import { Alert } from '@arkite-ui/core';

const heading: ReactNode = 'hello';

export function App() {
  return <Alert title={heading} customIcon={heading} />;
}
EOF
}

emit_app web   19.2.0 19.2.0
emit_app field 18.3.1 18.3.0

printf "  Installing fixture (web=React 19, field=React 18) ...\n"
if ! (cd "$WORK/ws" && pnpm install --ignore-scripts > "$WORK/install.log" 2>&1); then
  printf "${RED}✗${NC} fixture install failed\n"; tail -20 "$WORK/install.log"; exit 1
fi

# --- show what pnpm actually linked (this is the mechanism under test) ------
printf "\n  Linked @types/react per core variant:\n"
for v in "$WORK"/ws/node_modules/.pnpm/@arkite-ui+core@*/node_modules; do
  if [ -e "$v/@types/react/package.json" ]; then
    node -p "'    ' + require('$v/@types/react/package.json').version" 2>/dev/null
  else
    printf "    ABSENT — resolution will fall through to the hoisted copy\n"
  fi
done

# --- the assertion ----------------------------------------------------------
printf "\n"
FAILED=0
for app in web field; do
  out="$(cd "$WORK/ws/apps/$app" && ./node_modules/.bin/tsc --noEmit 2>&1)"
  if [ -z "$out" ]; then
    printf "${GREEN}✓${NC} apps/%s type-checks against core\n" "$app"
  else
    printf "${RED}✗${NC} apps/%s FAILED\n" "$app"
    printf "%s\n" "$out" | head -8 | sed 's/^/      /'
    FAILED=1
  fi
done

printf "\n"
if [ "$FAILED" -ne 0 ]; then
  printf "${RED}Mixed-major type resolution is broken.${NC}\n"
  printf "Check peerDependencies['@types/react'] and peerDependenciesMeta.\n\n"
  exit 1
fi
printf "${GREEN}Both React majors resolve core's types correctly.${NC}\n\n"
