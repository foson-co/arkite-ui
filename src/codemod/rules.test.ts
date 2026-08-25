import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import { Project, ts } from 'ts-morph'
import { describe, expect, it } from 'vitest'

import { applyRulesToSourceFile, fromErrorRules, TODO_MARKER, type FileOutcome } from './rules'
import { runCodemod } from './run'

function apply(
  code: string,
  extraFiles: Record<string, string> = {}
): { text: string; outcome: FileOutcome } {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
  })
  for (const [filePath, content] of Object.entries(extraFiles)) {
    project.createSourceFile(filePath, content)
  }
  const sf = project.createSourceFile('/app.tsx', code)
  const outcome = applyRulesToSourceFile(sf)
  return { text: sf.getFullText(), outcome }
}

function hit(outcome: FileOutcome, rule: string): { changes: number; todos: number } {
  return outcome.hits[rule]
}

describe('規則 1:Alert', () => {
  it('variant="error" → "destructive"、onDismiss → onClose', () => {
    const { text, outcome } = apply(
      `import { Alert } from '@arkite-ui/core'
export const A = () => <Alert variant="error" onDismiss={close}>msg</Alert>
`
    )
    expect(text).toBe(
      `import { Alert } from '@arkite-ui/core'
export const A = () => <Alert variant="destructive" onClose={close}>msg</Alert>
`
    )
    expect(hit(outcome, 'alert-variant-destructive').changes).toBe(1)
    expect(hit(outcome, 'alert-onclose').changes).toBe(1)
  })

  it("variant={'error'} 表達式形式也會轉換並保留單引號", () => {
    const { text } = apply(
      `import { Alert } from '@arkite-ui/core'
export const A = () => <Alert variant={'error'} />
`
    )
    expect(text).toContain(`<Alert variant={'destructive'} />`)
  })

  it('干擾項:同名自有 Alert(非 arkite import)完全不動', () => {
    const code = `import { Alert } from './alert'
export const A = () => <Alert variant="error" onDismiss={close} />
`
    const { text, outcome } = apply(code)
    expect(text).toBe(code)
    expect(outcome.changed).toBe(false)
  })
})

describe('規則 2:Progress / CircularProgress', () => {
  it('兩個元件的 variant="error" 都轉為 destructive', () => {
    const { text } = apply(
      `import { CircularProgress, Progress } from '@arkite-ui/core'
export const A = () => (
  <div>
    <Progress value={50} variant="error" />
    <CircularProgress value={50} variant="error" />
  </div>
)
`
    )
    expect(text).toContain('<Progress value={50} variant="destructive" />')
    expect(text).toContain('<CircularProgress value={50} variant="destructive" />')
  })

  it('CircularProgress size={數值} → diameter;size="sm" 不動', () => {
    const { text, outcome } = apply(
      `import { CircularProgress } from '@arkite-ui/core'
export const A = ({ n }: { n: number }) => (
  <div>
    <CircularProgress size={24} />
    <CircularProgress size={n} />
    <CircularProgress size="sm" />
  </div>
)
`
    )
    expect(text).toContain('<CircularProgress diameter={24} />')
    expect(text).toContain('<CircularProgress diameter={n} />')
    expect(text).toContain('<CircularProgress size="sm" />')
    expect(hit(outcome, 'circular-progress-diameter').changes).toBe(2)
  })

  it('size={無法判定型別的表達式} → TODO 註解,不改', () => {
    const { text, outcome } = apply(
      `import { CircularProgress } from '@arkite-ui/core'
export const A = ({ s }: { s: unknown }) => (
  <CircularProgress
    value={10}
    size={s}
  />
)
`
    )
    expect(text).toContain('size={s}')
    expect(text).not.toContain('diameter={')
    expect(text).toContain(`// ${TODO_MARKER}`)
    expect(hit(outcome, 'circular-progress-diameter').todos).toBe(1)
  })
})

describe('規則 3:Tabs', () => {
  it('onValueChange → onChange;干擾項自有 Tabs 不動', () => {
    const { text } = apply(
      `import { Tabs } from '@arkite-ui/core'
import { Tabs as OwnTabs } from './tabs'
export const A = () => (
  <div>
    <Tabs onValueChange={setTab} />
    <OwnTabs onValueChange={setTab} />
  </div>
)
`
    )
    expect(text).toContain('<Tabs onChange={setTab} />')
    expect(text).toContain('<OwnTabs onValueChange={setTab} />')
  })
})

describe('規則 4:LoadingOverlay', () => {
  it('visible={x} 與裸 visible 都改為 open', () => {
    const { text } = apply(
      `import { LoadingOverlay } from '@arkite-ui/core'
export const A = () => (
  <div>
    <LoadingOverlay visible={isLoading} />
    <LoadingOverlay visible />
  </div>
)
`
    )
    expect(text).toContain('<LoadingOverlay open={isLoading} />')
    expect(text).toContain('<LoadingOverlay open />')
  })
})

describe('規則 5:Toggle → Switch', () => {
  it('import 與 JSX 開閉標籤一起改名', () => {
    const { text } = apply(
      `import { Toggle } from '@arkite-ui/core'
export const A = () => <Toggle checked>on</Toggle>
`
    )
    expect(text).toBe(
      `import { Switch } from '@arkite-ui/core'
export const A = () => <Switch checked>on</Switch>
`
    )
  })

  it('檔內已 import Switch 時合併(移除 Toggle specifier)', () => {
    const { text } = apply(
      `import { Switch, Toggle } from '@arkite-ui/core'
export const A = () => (
  <div>
    <Toggle checked />
    <Switch checked={false} />
  </div>
)
`
    )
    expect(text).toContain(`import { Switch } from '@arkite-ui/core'`)
    expect(text).not.toContain('Toggle')
    expect(text).toContain('<Switch checked />')
    expect(text).toContain('<Switch checked={false} />')
  })

  it('干擾項:自有 Toggle(非 arkite)不動', () => {
    const code = `import { Toggle } from './ui/Toggle'
export const A = () => <Toggle checked />
`
    const { text, outcome } = apply(code)
    expect(text).toBe(code)
    expect(outcome.changed).toBe(false)
  })
})

describe('規則 6:ImperativeToastContainer → ToastContainer', () => {
  it('元件與型別一起改名(含 type import 與型別註記)', () => {
    const { text } = apply(
      `import { ImperativeToastContainer, type ImperativeToastContainerProps } from '@arkite-ui/core'
const props: ImperativeToastContainerProps = { position: 'top-right' }
export const A = () => <ImperativeToastContainer {...props} />
`
    )
    expect(text).toBe(
      `import { ToastContainer, type ToastContainerProps } from '@arkite-ui/core'
const props: ToastContainerProps = { position: 'top-right' }
export const A = () => <ToastContainer {...props} />
`
    )
  })
})

describe('規則 7:CommandDialog onOpenChange → TODO', () => {
  it('不自動改,插入 TODO 註解並計數', () => {
    const { text, outcome } = apply(
      `import { CommandDialog } from '@arkite-ui/core'
export const A = () => (
  <CommandDialog
    open={isOpen}
    onOpenChange={setOpen}
  />
)
`
    )
    expect(text).toContain('onOpenChange={setOpen}')
    expect(text).toContain(`// ${TODO_MARKER} CommandDialog 的 onOpenChange`)
    expect(hit(outcome, 'command-dialog-onclose').todos).toBe(1)
    expect(hit(outcome, 'command-dialog-onclose').changes).toBe(0)
  })

  it('重跑不會重複插入 TODO(冪等)', () => {
    const first = apply(
      `import { CommandDialog } from '@arkite-ui/core'
export const A = () => (
  <CommandDialog
    onOpenChange={setOpen}
  />
)
`
    )
    const second = apply(first.text)
    expect(second.text).toBe(first.text)
    expect(hit(second.outcome, 'command-dialog-onclose').todos).toBe(0)
  })
})

describe('規則 8:FormField / FormMessage error → errorMessage', () => {
  it('字串字面量與模板轉換,其他表達式標 TODO,裸 error 不動', () => {
    const { text, outcome } = apply(
      `import { FormField, FormMessage } from '@arkite-ui/core'
export const A = () => (
  <div>
    <FormField label="名稱" error="必填" />
    <FormField label="Email" error={\`格式錯誤:\${reason}\`} />
    <FormField label="電話" error={hasError} />
    <FormField label="地址" error />
    <FormMessage error="太長" />
  </div>
)
`
    )
    expect(text).toContain('<FormField label="名稱" errorMessage="必填" />')
    expect(text).toContain('errorMessage={`格式錯誤:${reason}`}')
    expect(text).toContain('error={hasError}')
    expect(text).toContain('<FormField label="地址" error />')
    expect(text).toContain('<FormMessage errorMessage="太長" />')
    expect(hit(outcome, 'form-error-message').changes).toBe(3)
    expect(hit(outcome, 'form-error-message').todos).toBe(1)
  })
})

describe('規則 9:ImageUpload error → errorMessage', () => {
  it('字串字面量轉換;boolean 字面量不動也不標 TODO', () => {
    const { text, outcome } = apply(
      `import { ImageUpload } from '@arkite-ui/core'
export const A = () => (
  <div>
    <ImageUpload error="圖片太大" />
    <ImageUpload error={true} />
  </div>
)
`
    )
    expect(text).toContain('<ImageUpload errorMessage="圖片太大" />')
    expect(text).toContain('<ImageUpload error={true} />')
    expect(hit(outcome, 'image-upload-error-message').changes).toBe(1)
    expect(hit(outcome, 'image-upload-error-message').todos).toBe(0)
  })
})

describe('規則 10:DataTable expandable → renderExpandedRow', () => {
  it('箭頭函式與函式型別的識別字改名;布林形式(含布林識別字)不動', () => {
    const { text, outcome } = apply(
      `import { DataTable } from '@arkite-ui/core'
const renderRow = (row: { id: string }) => <p>{row.id}</p>
const hasDetails = true as boolean
export const A = () => (
  <div>
    <DataTable rows={rows} expandable={(row) => <p>{row.id}</p>} />
    <DataTable rows={rows} expandable={renderRow} />
    <DataTable rows={rows} expandable={hasDetails} />
    <DataTable rows={rows} expandable />
    <DataTable rows={rows} expandable={true} />
    <DataTable rows={rows} expandable={false} />
  </div>
)
`
    )
    expect(text).toContain('renderExpandedRow={(row) => <p>{row.id}</p>}')
    expect(text).toContain('renderExpandedRow={renderRow}')
    expect(text).toContain('expandable={hasDetails}')
    expect(text).toContain('expandable />')
    expect(text).toContain('expandable={true}')
    expect(text).toContain('expandable={false}')
    expect(hit(outcome, 'data-table-render-expanded-row').changes).toBe(2)
    expect(hit(outcome, 'data-table-render-expanded-row').todos).toBe(0)
  })

  it('無法判定的表達式(含解析不出型別的識別字)標 TODO', () => {
    const { text, outcome } = apply(
      `import { DataTable } from '@arkite-ui/core'
declare const canExpand: any
declare const renderRow: any
export const A = () => (
  <div>
    <DataTable rows={rows} expandable={canExpand && renderRow} />
    <DataTable rows={rows} expandable={renderRow} />
  </div>
)
`
    )
    expect(text).toContain('expandable={canExpand && renderRow}')
    expect(text).toContain('expandable={renderRow}')
    expect(text).toContain(`// ${TODO_MARKER}`)
    expect(hit(outcome, 'data-table-render-expanded-row').todos).toBe(2)
  })
})

describe('規則 11:Tree onCheckChange → onSelectionChange', () => {
  it('屬性改名', () => {
    const { text } = apply(
      `import { Tree } from '@arkite-ui/core'
export const A = () => <Tree data={nodes} onCheckChange={setChecked} />
`
    )
    expect(text).toContain('<Tree data={nodes} onSelectionChange={setChecked} />')
  })
})

describe('規則 12:Pagination mode → variant', () => {
  it('屬性改名,值保留', () => {
    const { text } = apply(
      `import { Pagination } from '@arkite-ui/core'
export const A = () => <Pagination page={1} total={10} mode="compact" />
`
    )
    expect(text).toContain('<Pagination page={1} total={10} variant="compact" />')
  })
})

describe("規則 13:Timeline variant: 'default' → 'muted'", () => {
  it('內聯陣列字面量會轉換,其他 variant 值不動', () => {
    const { text, outcome } = apply(
      `import { Timeline } from '@arkite-ui/core'
export const A = () => (
  <Timeline
    items={[
      { title: 'a', variant: 'default' },
      { title: 'b', variant: 'success' },
      { title: 'c', variant: 'default' },
    ]}
  />
)
`
    )
    expect(text).toContain(`{ title: 'a', variant: 'muted' }`)
    expect(text).toContain(`{ title: 'b', variant: 'success' }`)
    expect(text).toContain(`{ title: 'c', variant: 'muted' }`)
    expect(hit(outcome, 'timeline-variant-muted').changes).toBe(2)
  })

  it('items 由變數傳入 → TODO 註解,不動', () => {
    const { text, outcome } = apply(
      `import { Timeline } from '@arkite-ui/core'
export const A = () => (
  <Timeline
    items={history}
  />
)
`
    )
    expect(text).toContain('items={history}')
    expect(text).toContain(`// ${TODO_MARKER} Timeline items`)
    expect(hit(outcome, 'timeline-variant-muted').todos).toBe(1)
  })
})

describe('規則 14:TenantSwitcher', () => {
  it('currentTenant → value、onSelect → onChange', () => {
    const { text } = apply(
      `import { TenantSwitcher } from '@arkite-ui/core'
export const A = () => (
  <TenantSwitcher tenants={tenants} currentTenant={tenant} onSelect={setTenant} />
)
`
    )
    expect(text).toContain(
      '<TenantSwitcher tenants={tenants} value={tenant} onChange={setTenant} />'
    )
  })
})

describe('規則 15:toast API', () => {
  it('useToast() 回傳值:.clear() → .dismissAll()、第二參數字串/模板包成 { description }', () => {
    const { text, outcome } = apply(
      `import { useToast } from '@arkite-ui/core'
export function useSave() {
  const toast = useToast()
  const onDone = () => toast.success('儲存成功', \`編號 \${id}\`)
  const onFail = () => toast.error('失敗', '請重試')
  const onClear = () => toast.clear()
  return { onDone, onFail, onClear }
}
`
    )
    expect(text).toContain("toast.success('儲存成功', { description: `編號 ${id}` })")
    expect(text).toContain("toast.error('失敗', { description: '請重試' })")
    expect(text).toContain('toast.dismissAll()')
    expect(hit(outcome, 'toast-dismiss-all').changes).toBe(1)
    expect(hit(outcome, 'toast-description-option').changes).toBe(2)
  })

  it('解構 { clear } → { dismissAll } 並改呼叫點;其餘解構不動', () => {
    const { text } = apply(
      `import { useToast } from '@arkite-ui/core'
export function useX() {
  const { clear, success } = useToast()
  return () => {
    clear()
    success('hi')
  }
}
`
    )
    expect(text).toContain('const { dismissAll, success } = useToast()')
    expect(text).toContain('dismissAll()')
    expect(text).toContain("success('hi')")
    expect(text).not.toContain('clear')
  })

  it('import 的 toast 物件:JSX 第二參數包裝;物件字面量與單參數不動', () => {
    const { text } = apply(
      `import { toast } from '@arkite-ui/core'
export const f = () => {
  toast.info('提示', <b>粗體</b>)
  toast.show('t', { description: 'd' })
  toast.warning('only-title')
}
`
    )
    expect(text).toContain("toast.info('提示', { description: <b>粗體</b> })")
    expect(text).toContain("toast.show('t', { description: 'd' })")
    expect(text).toContain("toast.warning('only-title')")
  })

  it('無法判定的第二參數 → TODO;toast.error 方法名保留', () => {
    const { text, outcome } = apply(
      `import { toast } from '@arkite-ui/core'
export function f(msg: string) {
  toast.error('失敗', msg)
}
`
    )
    expect(text).toContain("toast.error('失敗', msg)")
    expect(text).toContain(`// ${TODO_MARKER} toast 便捷方法第二參數`)
    expect(hit(outcome, 'toast-description-option').todos).toBe(1)
  })

  it('干擾項:非 arkite 的 useToast / toast 完全不動', () => {
    const code = `import { useToast } from './toast'
export function useX() {
  const toast = useToast()
  toast.clear()
  toast.success('a', 'b')
  const cache = new Map()
  cache.clear()
}
`
    const { text, outcome } = apply(code)
    expect(text).toBe(code)
    expect(outcome.changed).toBe(false)
  })

  it('干擾項:同檔另一 scope 的同名 toast(函式參數)不動,arkite 的照改', () => {
    const { text } = apply(
      `import { useToast } from '@arkite-ui/core'
export function useSave() {
  const toast = useToast()
  return () => toast.clear()
}
export function other(toast: { clear: () => void; success: (a: string, b: string) => void }) {
  toast.clear()
  toast.success('a', 'b')
}
`
    )
    // arkite 的 useToast() 回傳值:改名
    expect(text).toContain('return () => toast.dismissAll()')
    // 同名參數:方法與第二參數都不動
    expect(text).toContain('toast.clear()')
    expect(text).toContain("toast.success('a', 'b')")
  })
})

describe('採用規則:toast-from-error(獨立規則集,不在 v1 內)', () => {
  function applyFromError(code: string): string {
    const project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
    })
    const sf = project.createSourceFile('/app.tsx', code)
    applyRulesToSourceFile(sf, fromErrorRules)
    return sf.getFullText()
  }

  it('模板字串:前綴(去尾冒號)進 prefix、err 進第一參數', () => {
    const text = applyFromError(
      `import { useToast } from '@arkite-ui/core'
export function useSave() {
  const toast = useToast()
  return (err: unknown) => toast.error(\`儲存失敗：\${getErrorMessage(err)}\`)
}
`
    )
    expect(text).toContain("toast.fromError(err, { prefix: '儲存失敗' })")
  })

  it('第二參數為物件字面量時屬性併入新 options', () => {
    const text = applyFromError(
      `import { toast } from '@arkite-ui/core'
export const f = (e: unknown) => toast.error(\`載入失敗:\${getErrorMessage(e)}\`, { duration: 0 })
`
    )
    expect(text).toContain("toast.fromError(e, { prefix: '載入失敗', duration: 0 })")
  })

  it('裸呼叫與字串串接形式', () => {
    const text = applyFromError(
      `import { toast } from '@arkite-ui/core'
export const f = (e: unknown) => {
  toast.error(getErrorMessage(e))
  toast.error('刪除失敗: ' + getErrorMessage(e))
}
`
    )
    expect(text).toContain('toast.fromError(e)\n')
    expect(text).toContain("toast.fromError(e, { prefix: '刪除失敗' })")
  })

  it('清理失去引用的 getErrorMessage import;仍有引用則保留', () => {
    const cleaned = applyFromError(`import { toast } from '@arkite-ui/core'
import { getErrorMessage } from '@arkite/utils'
export const f = (e: unknown) => toast.error(\`失敗:\${getErrorMessage(e)}\`)
`)
    expect(cleaned).toContain('toast.fromError')
    expect(cleaned).not.toContain('getErrorMessage')
    expect(cleaned).not.toContain('@arkite/utils')

    const kept = applyFromError(`import { toast } from '@arkite-ui/core'
import { getErrorMessage } from '@arkite/utils'
export const f = (e: unknown) => {
  toast.error(\`失敗:\${getErrorMessage(e)}\`)
  console.warn(getErrorMessage(e))
}
`)
    expect(kept).toContain("import { getErrorMessage } from '@arkite/utils'")
    expect(kept).toContain('console.warn(getErrorMessage(e))')
  })

  it('干擾項:非 arkite toast、多插值模板、插值後有尾字 → 不動', () => {
    const code = `import { useToast } from './toast'
declare const toast2: { error: (m: string) => void }
export function useX(err: unknown, ctx: string) {
  const toast = useToast()
  toast.error(\`失敗:\${getErrorMessage(err)}\`)
  toast2.error(\`失敗:\${getErrorMessage(err)}\`)
}
`
    expect(applyFromError(code)).toBe(code)
    const multi = `import { toast } from '@arkite-ui/core'
export const f = (e: unknown, ctx: string) => {
  toast.error(\`\${ctx}失敗:\${getErrorMessage(e)}\`)
  toast.error(\`失敗:\${getErrorMessage(e)}(請重試)\`)
}
`
    expect(applyFromError(multi)).toBe(multi)
  })

  it('v1 規則集不包含此規則(跑 v1 不會改寫)', () => {
    const code = `import { toast } from '@arkite-ui/core'
export const f = (e: unknown) => toast.error(\`失敗:\${getErrorMessage(e)}\`)
`
    const { text } = apply(code)
    expect(text).toBe(code)
  })

  it('runCodemod ruleSet 分流:from-error 規則集實跑寫檔', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arkite-codemod-'))
    fs.mkdirSync(path.join(dir, 'src'))
    const file = path.join(dir, 'src', 'save.ts')
    fs.writeFileSync(
      file,
      `import { toast } from '@arkite-ui/core'
export const f = (e: unknown) => toast.error(\`儲存失敗:\${getErrorMessage(e)}\`)
`
    )
    try {
      const report = runCodemod(dir, { ruleSet: 'from-error' })
      expect(Object.keys(report.totals)).toEqual(['toast-from-error'])
      expect(report.totalChanges).toBe(1)
      expect(fs.readFileSync(file, 'utf8')).toContain("toast.fromError(e, { prefix: '儲存失敗' })")
    } finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('re-export 安全性', () => {
  it('經由消費端自己的 re-export 模組 import 也會被轉換', () => {
    const { text } = apply(
      `import { Tabs } from './ui'
export const A = () => <Tabs onValueChange={setTab} />
`,
      { '/ui.ts': `export { Tabs } from '@arkite-ui/core'\n` }
    )
    expect(text).toContain('<Tabs onChange={setTab} />')
  })

  it('re-export 模組沒匯出該名稱時不轉換', () => {
    const code = `import { Tabs } from './ui'
export const A = () => <Tabs onValueChange={setTab} />
`
    const { text } = apply(code, { '/ui.ts': `export { Alert } from '@arkite-ui/core'\n` })
    expect(text).toBe(code)
  })
})

describe('整體 smoke:runner 完整流程(真實檔案系統)', () => {
  const COMPREHENSIVE = `import { Alert, DataTable, TenantSwitcher, Toggle, useToast } from '@arkite-ui/core'

export const Page = () => {
  const toast = useToast()
  const notify = () => toast.success('OK', '完成')
  return (
    <div>
      <Alert variant="error" onDismiss={notify}>msg</Alert>
      <Toggle checked />
      <DataTable rows={[]} expandable={(row) => <p>{row}</p>} />
      <TenantSwitcher tenants={[]} currentTenant={t} onSelect={setT} />
    </div>
  )
}
`
  const DISTRACTOR = `import { Alert } from './alert'

export const Own = () => <Alert variant="error" />
`

  it('dry-run 回報命中但不寫檔;實跑會寫檔且干擾檔不動', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arkite-codemod-'))
    const srcDir = path.join(dir, 'src')
    fs.mkdirSync(srcDir)
    const appPath = path.join(srcDir, 'app.tsx')
    const ownPath = path.join(srcDir, 'own.tsx')
    fs.writeFileSync(appPath, COMPREHENSIVE)
    fs.writeFileSync(ownPath, DISTRACTOR)
    try {
      const dry = runCodemod(dir, { dryRun: true })
      expect(dry.mode).toBe('dry-run')
      expect(dry.fileCount).toBe(2)
      expect(dry.changedFiles).toHaveLength(1)
      expect(dry.changedFiles[0].endsWith('/src/app.tsx')).toBe(true)
      expect(dry.totals['alert-variant-destructive'].changes).toBe(1)
      expect(dry.totals['alert-onclose'].changes).toBe(1)
      expect(dry.totals['toggle-to-switch'].changes).toBeGreaterThan(0)
      expect(dry.totals['data-table-render-expanded-row'].changes).toBe(1)
      expect(dry.totals['tenant-switcher-props'].changes).toBe(2)
      expect(dry.totals['toast-description-option'].changes).toBe(1)
      // dry-run 不寫檔
      expect(fs.readFileSync(appPath, 'utf8')).toBe(COMPREHENSIVE)

      const wet = runCodemod(dir, { dryRun: false })
      expect(wet.changedFiles).toHaveLength(1)
      const after = fs.readFileSync(appPath, 'utf8')
      expect(after).toContain('variant="destructive"')
      expect(after).toContain('onClose={notify}')
      expect(after).toContain('<Switch checked />')
      expect(after).toContain('import { Alert, DataTable, TenantSwitcher, Switch, useToast }')
      expect(after).toContain('renderExpandedRow={(row) => <p>{row}</p>}')
      expect(after).toContain('value={t} onChange={setT}')
      expect(after).toContain("toast.success('OK', { description: '完成' })")
      // 干擾檔不動
      expect(fs.readFileSync(ownPath, 'utf8')).toBe(DISTRACTOR)

      // 再跑一次:冪等,無新變更
      const again = runCodemod(dir, { dryRun: true })
      expect(again.changedFiles).toHaveLength(0)
      expect(again.totalChanges).toBe(0)
    } finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })

  it('glob fallback:沒有 src/ 的專案(app/ 在根目錄)也掃得到', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arkite-codemod-'))
    const appDir = path.join(dir, 'app')
    fs.mkdirSync(appDir)
    fs.writeFileSync(path.join(appDir, 'page.tsx'), COMPREHENSIVE)
    try {
      const dry = runCodemod(dir, { dryRun: true })
      expect(dry.fileCount).toBe(1)
      expect(dry.changedFiles).toHaveLength(1)
    } finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })
})
