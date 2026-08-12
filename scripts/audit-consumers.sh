#!/usr/bin/env bash
#
# Consumer adoption audit — the repeatable half of docs/DX_AUDIT.md.
#
# The 2026-08-07 audit produced numbers (62 files with a hand-rolled <table>,
# 0/9 projects on useServerTable) that were gathered by hand, so nothing could
# re-measure them later and claim a change with a straight face. This script
# fixes the method in place: same projects, same patterns, same output shape,
# so two runs are comparable and a fix can be shown to have landed — or not.
#
# Usage:  ./scripts/audit-consumers.sh [workspace-root]
#         (default root: ~/workspace/work)
#
# Counts are FILES, not occurrences. Read a raw-<table> count next to the
# DataTable count for the same project: a project can legitimately have both.

set -euo pipefail

ROOT="${1-$HOME/workspace/work}"

# The nine consumers the 2026-08-07 audit covered, in its order.
PROJECTS=(
  ark-connect/web
  ark-crew/web
  ark-finance/frontend
  ark-harvest/web
  ark-museum/apps/web
  ark-museum/apps/field
  ark-rendoc-web/web
  ark-shield/web
  chronoark-one/frontend
)

# Recorded 2026-08-07 raw-<table> file counts, for the delta column.
# Projects absent from this map had no recorded baseline.
baseline_tables() {
  case "$1" in
    ark-connect/web) echo 5 ;;
    ark-finance/frontend) echo 51 ;;
    ark-harvest/web) echo 1 ;;
    ark-rendoc-web/web) echo 5 ;;
    *) echo "" ;;
  esac
}

# Files under a project's src/ matching a pattern. Never counts node_modules.
count_files() {
  local dir="$1" pattern="$2"
  if [ ! -d "$dir/src" ]; then
    echo 0
    return
  fi
  # grep exits 1 on no matches, which is a valid result here, not an error.
  local matched
  matched=$(grep -rlE "$pattern" "$dir/src" \
    --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' \
    2>/dev/null || true)
  if [ -z "$matched" ]; then
    echo 0
  else
    printf '%s\n' "$matched" | wc -l | tr -d ' '
  fi
}

printf '%-24s %-10s %8s %6s %10s %8s %10s %12s\n' \
  PROJECT VERSION 'raw<table>' 'Δ' 'DataTable' 'Table' 'srvTable' 'AdminLayout'
printf '%.0s─' {1..96}; echo

total_raw=0
total_baseline=0

for project in "${PROJECTS[@]}"; do
  dir="$ROOT/$project"

  if [ ! -d "$dir" ]; then
    printf '%-24s %-10s %8s\n' "$project" "MISSING" "—"
    continue
  fi

  version=$(grep -oE '"@arkite-ui/core": *"[^"]*"' "$dir/package.json" 2>/dev/null |
    head -1 | sed 's/.*"\^*\([0-9][^"]*\)".*/\1/' || true)
  if [ -z "$version" ]; then version="none"; fi

  raw=$(count_files "$dir" '<table[ >]')
  datatable=$(count_files "$dir" '\bDataTable\b')
  table=$(count_files "$dir" '<Table[ >]|<TableBody\b')
  server=$(count_files "$dir" '\buseServerTable\b')
  layout=$(count_files "$dir" '\bAdminLayout\b')

  base=$(baseline_tables "$project")
  if [ -n "$base" ]; then
    delta=$((raw - base))
    if [ "$delta" -gt 0 ]; then delta="+$delta"; fi
    total_baseline=$((total_baseline + base))
  else
    delta="—"
  fi
  total_raw=$((total_raw + raw))

  printf '%-24s %-10s %8s %6s %10s %8s %10s %12s\n' \
    "$project" "$version" "$raw" "$delta" "$datatable" "$table" "$server" "$layout"
done

printf '%.0s─' {1..96}; echo
echo "raw <table> files: $total_raw   (2026-08-07 baseline across recorded projects: $total_baseline)"
echo
echo "Columns are file counts under src/. 'srvTable' is useServerTable — the"
echo "server-pagination hook that had 0 users at baseline; it is the single"
echo "clearest signal that a shipped fix reached the consumers."
