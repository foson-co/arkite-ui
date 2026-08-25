/**
 * @arkite-ui/core v1.0 codemod CLI runner。
 *
 * 用法(在 arkite-ui repo 根目錄):
 *   pnpm codemod:v1 <目標專案路徑> [--dry-run]
 *
 * 行為:
 * - 優先載入目標的 tsconfig.json;找不到(或沒列出任何檔案)時,
 *   改用 glob 掃描整個目標資料夾的 *.{ts,tsx}(略過 node_modules/dist 等)。
 * - 逐檔套用 src/codemod/rules.ts 的規則;--dry-run 只回報不寫檔。
 * - 結束印出每條規則的變更數與 TODO 標記數。
 */
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import { Project, ts } from 'ts-morph'

import { applyRulesToSourceFile, fromErrorRules, rules, TODO_MARKER, type RuleHit } from './rules'

/** 具名規則集:v1(破壞性遷移,預設)、from-error(選用的 toast.fromError 採用) */
export const RULE_SETS = {
  v1: rules,
  'from-error': fromErrorRules,
} as const

export type RuleSetName = keyof typeof RULE_SETS

export interface CodemodReport {
  target: string
  mode: 'dry-run' | 'write'
  fileCount: number
  changedFiles: string[]
  totals: Record<string, RuleHit>
  totalChanges: number
  totalTodos: number
  errors: Array<{ filePath: string; message: string }>
}

const IGNORED_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'out',
  'coverage',
  'storybook-static',
  'venv',
  '.venv',
])

// 不限定 src/:Next.js 常見 app/、pages/、components/ 直接放專案根目錄,
// 只掃 src/ 會把這類專案回報成「0 檔案、沒有變更」的假成功
function collectSourceFilePaths(dir: string, acc: string[]): void {
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || IGNORED_DIRS.has(entry.name)) continue
      collectSourceFilePaths(path.join(dir, entry.name), acc)
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      acc.push(path.join(dir, entry.name))
    }
  }
}

function createProject(target: string): Project {
  const tsconfigPath = path.join(target, 'tsconfig.json')
  if (fs.existsSync(tsconfigPath)) {
    try {
      const project = new Project({
        tsConfigFilePath: tsconfigPath,
        skipFileDependencyResolution: true,
      })
      const hasFiles = project.getSourceFiles().some((sf) => !sf.getFilePath().endsWith('.d.ts'))
      if (hasFiles) return project
    } catch {
      // tsconfig 壞掉或載入失敗 → 改走 glob
    }
  }
  const project = new Project({
    skipFileDependencyResolution: true,
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      allowJs: false,
      skipLibCheck: true,
    },
  })
  const paths: string[] = []
  collectSourceFilePaths(target, paths)
  for (const filePath of paths) project.addSourceFileAtPath(filePath)
  return project
}

export function runCodemod(
  targetDir: string,
  options: { dryRun?: boolean; ruleSet?: RuleSetName } = {}
): CodemodReport {
  const dryRun = options.dryRun ?? false
  const ruleSet = RULE_SETS[options.ruleSet ?? 'v1']
  const target = path.resolve(targetDir)
  if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
    throw new Error(`目標路徑不存在或不是資料夾:${target}`)
  }
  const project = createProject(target)
  const targetPrefix = `${target.split(path.sep).join('/')}/`
  const sourceFiles = project
    .getSourceFiles()
    .filter((sf) => {
      const filePath = sf.getFilePath()
      return (
        filePath.startsWith(targetPrefix) &&
        !filePath.includes('/node_modules/') &&
        !filePath.endsWith('.d.ts')
      )
    })
    .sort((a, b) => a.getFilePath().localeCompare(b.getFilePath()))

  const totals: Record<string, RuleHit> = {}
  for (const rule of ruleSet) totals[rule.name] = { changes: 0, todos: 0 }
  const changedFiles: string[] = []
  const errors: CodemodReport['errors'] = []

  for (const sf of sourceFiles) {
    try {
      const outcome = applyRulesToSourceFile(sf, ruleSet)
      for (const [name, hit] of Object.entries(outcome.hits)) {
        totals[name].changes += hit.changes
        totals[name].todos += hit.todos
      }
      if (outcome.changed) {
        changedFiles.push(sf.getFilePath())
        if (!dryRun) sf.saveSync()
      }
    } catch (err) {
      errors.push({
        filePath: sf.getFilePath(),
        message: err instanceof Error ? err.message : String(err),
      })
    }
  }

  const totalChanges = Object.values(totals).reduce((sum, hit) => sum + hit.changes, 0)
  const totalTodos = Object.values(totals).reduce((sum, hit) => sum + hit.todos, 0)
  return {
    target,
    mode: dryRun ? 'dry-run' : 'write',
    fileCount: sourceFiles.length,
    changedFiles,
    totals,
    totalChanges,
    totalTodos,
    errors,
  }
}

// ── CLI ────────────────────────────────────────────────────────────

function write(line = ''): void {
  process.stdout.write(`${line}\n`)
}

function formatReport(report: CodemodReport): void {
  const names = Object.keys(report.totals)
  const nameWidth = Math.max(...names.map((n) => n.length)) + 2
  write()
  write('@arkite-ui/core codemod 報告')
  write(`目標:${report.target}(掃描 ${report.fileCount} 個檔案,模式:${report.mode})`)
  write()
  write(`${'規則'.padEnd(nameWidth + 2)}變更  TODO`)
  for (const name of names) {
    const hit = report.totals[name]
    const marker = hit.changes > 0 || hit.todos > 0 ? '●' : ' '
    write(
      `${marker} ${name.padEnd(nameWidth)}${String(hit.changes).padStart(4)}  ${String(hit.todos).padStart(4)}`
    )
  }
  write(`${'─'.repeat(nameWidth + 12)}`)
  write(
    `  ${'合計'.padEnd(nameWidth - 2)}${String(report.totalChanges).padStart(4)}  ${String(report.totalTodos).padStart(4)}`
  )
  write()
  if (report.changedFiles.length > 0) {
    write(report.mode === 'dry-run' ? '將變更的檔案(未寫入):' : '已變更的檔案:')
    for (const filePath of report.changedFiles) write(`  - ${filePath}`)
  } else {
    write('沒有檔案需要變更。')
  }
  if (report.totalTodos > 0) {
    write()
    write(`有 ${report.totalTodos} 處無法安全自動轉換,已標 ${TODO_MARKER.slice(0, -1)} 註解,`)
    write(`請全域搜尋「${TODO_MARKER}」逐一人工處理後刪除註解。`)
  }
  if (report.errors.length > 0) {
    write()
    write('處理失敗的檔案(已略過):')
    for (const e of report.errors) write(`  - ${e.filePath}:${e.message}`)
  }
  if (report.mode === 'write' && report.changedFiles.length > 0) {
    write()
    write('建議接著在目標專案跑 typecheck / lint / prettier 收尾。')
  }
  write()
}

function main(): void {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const rulesFlag = args.find((a) => a.startsWith('--rules='))
  const ruleSetName = (rulesFlag?.slice('--rules='.length) ?? 'v1') as RuleSetName
  const unknownFlags = args.filter(
    (a) => a.startsWith('--') && a !== '--dry-run' && !a.startsWith('--rules=')
  )
  const positional = args.filter((a) => !a.startsWith('--'))
  if (positional.length !== 1 || unknownFlags.length > 0 || !(ruleSetName in RULE_SETS)) {
    write('用法:pnpm codemod:v1 <目標專案路徑> [--dry-run]')
    write('   或:pnpm codemod:from-error <目標專案路徑> [--dry-run]')
    process.exitCode = 1
    return
  }
  try {
    const report = runCodemod(positional[0], { dryRun, ruleSet: ruleSetName })
    formatReport(report)
    if (ruleSetName === 'from-error' && report.totalChanges > 0) {
      write('提醒:toast.fromError 需要 app 啟動處註冊解析器(一次):')
      write('  toast.configure({ formatError: getErrorMessage })')
      write()
    }
  } catch (err) {
    write(err instanceof Error ? err.message : String(err))
    process.exitCode = 1
  }
}

const invokedPath = process.argv[1]
if (invokedPath != null && path.resolve(invokedPath) === fileURLToPath(import.meta.url)) {
  main()
}
