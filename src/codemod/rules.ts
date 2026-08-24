/**
 * @arkite-ui/core v1.0 破壞性變更 codemod — 轉換規則(純函式,不做 I/O)。
 *
 * 安全第一原則:所有 JSX / 識別字轉換,都先確認該名稱 import 自
 * '@arkite-ui/core'(或其 re-export 模組),同名的專案自有元件一律不動。
 * 無法安全自動化的用法插入 `// TODO(arkite-v1): ...` 註解並計數,絕不用猜的。
 *
 * 此目錄不從 src/index.ts 匯出、也不在 tsup entry 內,不會進 npm 打包。
 */
import {
  Node,
  QuoteKind,
  SyntaxKind,
  type CallExpression,
  type ImportSpecifier,
  type JsxAttribute,
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type NoSubstitutionTemplateLiteral,
  type SourceFile,
  type StringLiteral,
} from 'ts-morph'

export const TODO_MARKER = 'TODO(arkite-v1):'

const ARKITE_MODULE_RE = /^@arkite-ui\/core(\/|$)/

type JsxTagElement = JsxOpeningElement | JsxSelfClosingElement

export interface TodoRequest {
  /** 插入註解的目標節點 */
  node: Node
  message: string
  /** attr: 插在 JSX 屬性前;line: 插在節點所在行之前 */
  kind: 'attr' | 'line'
}

export interface Rule {
  name: string
  description: string
  /** 執行安全的自動轉換,回傳變更數(會就地修改 AST) */
  transform(sf: SourceFile): number
  /** 在轉換後的最終 AST 上偵測需要人工處理的位置(純偵測,不修改) */
  collectTodos?(sf: SourceFile): TodoRequest[]
}

// ── import 來源判定 ────────────────────────────────────────────────

function isArkiteSpecifier(spec: string): boolean {
  return ARKITE_MODULE_RE.test(spec)
}

/** 檔案內是否以 localName import 了 arkite 的某個名稱(供 re-export 判定用) */
function importsNameFromArkite(sf: SourceFile, localName: string, depth: number): boolean {
  for (const decl of sf.getImportDeclarations()) {
    for (const ni of decl.getNamedImports()) {
      const local = ni.getAliasNode()?.getText() ?? ni.getName()
      if (local !== localName) continue
      if (isArkiteSpecifier(decl.getModuleSpecifierValue())) return true
      if (depth > 0) {
        const modSf = decl.getModuleSpecifierSourceFile()
        if (modSf != null && fileReexportsFromArkite(modSf, ni.getName(), depth - 1)) return true
      }
    }
  }
  return false
}

/** 模組檔案是否(直接或間接)把 arkite 的 exportedName 再匯出 */
function fileReexportsFromArkite(modSf: SourceFile, exportedName: string, depth: number): boolean {
  for (const ed of modSf.getExportDeclarations()) {
    const spec = ed.getModuleSpecifierValue()
    if (spec != null && isArkiteSpecifier(spec)) {
      const named = ed.getNamedExports()
      if (named.length === 0) return true // export * from '@arkite-ui/core'
      for (const ne of named) {
        const exported = ne.getAliasNode()?.getText() ?? ne.getName()
        if (exported === exportedName) return true
      }
    } else if (spec != null) {
      if (depth <= 0) continue
      const next = ed.getModuleSpecifierSourceFile()
      if (next == null) continue
      const named = ed.getNamedExports()
      if (named.length === 0) {
        if (fileReexportsFromArkite(next, exportedName, depth - 1)) return true
      } else {
        for (const ne of named) {
          const exported = ne.getAliasNode()?.getText() ?? ne.getName()
          if (exported === exportedName && fileReexportsFromArkite(next, ne.getName(), depth - 1)) {
            return true
          }
        }
      }
    } else {
      // export { X }(X 於檔內 import 自 arkite)
      for (const ne of ed.getNamedExports()) {
        const exported = ne.getAliasNode()?.getText() ?? ne.getName()
        if (exported === exportedName && importsNameFromArkite(modSf, ne.getName(), depth)) {
          return true
        }
      }
    }
  }
  return false
}

export interface ArkiteImport {
  /** 檔內實際使用的名稱(named import 的別名或原名) */
  localName: string
  specifier: ImportSpecifier
}

/** 若檔案有從 '@arkite-ui/core'(或其 re-export)import exportedName,回傳其資訊 */
export function arkiteImportInfo(sf: SourceFile, exportedName: string): ArkiteImport | undefined {
  for (const decl of sf.getImportDeclarations()) {
    const hit = decl.getNamedImports().find((ni) => ni.getName() === exportedName)
    if (hit == null) continue
    let fromArkite = isArkiteSpecifier(decl.getModuleSpecifierValue())
    if (!fromArkite) {
      const modSf = decl.getModuleSpecifierSourceFile()
      fromArkite = modSf != null && fileReexportsFromArkite(modSf, exportedName, 2)
    }
    if (fromArkite) {
      return { localName: hit.getAliasNode()?.getText() ?? exportedName, specifier: hit }
    }
  }
  return undefined
}

// ── JSX / AST 共用工具 ─────────────────────────────────────────────

function jsxTagsFor(sf: SourceFile, localName: string): JsxTagElement[] {
  const tags: JsxTagElement[] = [
    ...sf.getDescendantsOfKind(SyntaxKind.JsxOpeningElement),
    ...sf.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement),
  ]
  return tags.filter((el) => el.getTagNameNode().getText() === localName)
}

function getJsxAttr(el: JsxTagElement, name: string): JsxAttribute | undefined {
  const attr = el.getAttribute(name)
  return attr != null && Node.isJsxAttribute(attr) ? attr : undefined
}

interface AttrEntry {
  component: string
  element: JsxTagElement
  attr: JsxAttribute
}

/** 找出「確定 import 自 arkite 的元件」身上的指定 JSX 屬性 */
function arkiteJsxAttrEntries(
  sf: SourceFile,
  components: readonly string[],
  prop: string
): AttrEntry[] {
  const entries: AttrEntry[] = []
  for (const component of components) {
    const info = arkiteImportInfo(sf, component)
    if (info == null) continue
    for (const element of jsxTagsFor(sf, info.localName)) {
      const attr = getJsxAttr(element, prop)
      if (attr != null) entries.push({ component, element, attr })
    }
  }
  return entries
}

/**
 * ts-morph 每次 AST 操作後既有節點會失效,因此以「每輪只做一個編輯、
 * 重新查詢」的方式跑到穩定為止。editOnce 至多做一個編輯並回傳是否有編輯。
 */
function editUntilStable(editOnce: () => boolean): number {
  let changes = 0
  for (let i = 0; i < 10_000; i++) {
    if (!editOnce()) return changes
    changes++
  }
  return changes
}

function unwrapExpression(node: Node): Node {
  let current = node
  for (;;) {
    if (
      Node.isParenthesizedExpression(current) ||
      Node.isAsExpression(current) ||
      Node.isSatisfiesExpression(current)
    ) {
      current = current.getExpression()
    } else {
      return current
    }
  }
}

type StringLike = StringLiteral | NoSubstitutionTemplateLiteral

/** 取出屬性值中的字串字面量(value="x"、value={'x'}、value={`x`};不含插值模板) */
function attrStringLiteralNode(attr: JsxAttribute): StringLike | undefined {
  const init = attr.getInitializer()
  if (init == null) return undefined
  if (Node.isStringLiteral(init)) return init
  if (Node.isJsxExpression(init)) {
    const expr = init.getExpression()
    if (
      expr != null &&
      (Node.isStringLiteral(expr) || Node.isNoSubstitutionTemplateLiteral(expr))
    ) {
      return expr
    }
  }
  return undefined
}

/** 換掉字串字面量的值,保留原本的引號 / 反引號風格 */
function replaceStringValue(lit: StringLike, newValue: string): void {
  if (Node.isStringLiteral(lit)) {
    const quote = lit.getQuoteKind() === QuoteKind.Single ? "'" : '"'
    lit.replaceWithText(`${quote}${newValue}${quote}`)
  } else {
    lit.replaceWithText(`\`${newValue}\``)
  }
}

// ── 規則工廠 ───────────────────────────────────────────────────────

function propRenameRule(
  name: string,
  description: string,
  components: readonly string[],
  renames: ReadonlyArray<readonly [string, string]>
): Rule {
  return {
    name,
    description,
    transform(sf) {
      let total = 0
      for (const [oldProp, newProp] of renames) {
        total += editUntilStable(() => {
          const entry = arkiteJsxAttrEntries(sf, components, oldProp).find(
            ({ element }) => getJsxAttr(element, newProp) == null
          )
          if (entry == null) return false
          entry.attr.getNameNode().replaceWithText(newProp)
          return true
        })
      }
      return total
    },
    collectTodos(sf) {
      // 新舊 prop 同時存在時不能自動改(會產生重複 prop),標 TODO
      const todos: TodoRequest[] = []
      for (const [oldProp, newProp] of renames) {
        for (const entry of arkiteJsxAttrEntries(sf, components, oldProp)) {
          if (getJsxAttr(entry.element, newProp) != null) {
            todos.push({
              node: entry.attr,
              kind: 'attr',
              message: `${entry.component} 同時存在 ${oldProp} 與 ${newProp};v1.0 移除 ${oldProp},請手動合併`,
            })
          }
        }
      }
      return todos
    },
  }
}

function propStringValueRule(
  name: string,
  description: string,
  components: readonly string[],
  prop: string,
  oldValue: string,
  newValue: string
): Rule {
  return {
    name,
    description,
    transform(sf) {
      return editUntilStable(() => {
        for (const { attr } of arkiteJsxAttrEntries(sf, components, prop)) {
          const lit = attrStringLiteralNode(attr)
          if (lit != null && lit.getLiteralValue() === oldValue) {
            replaceStringValue(lit, newValue)
            return true
          }
        }
        return false
      })
    },
  }
}

// ── 值分類(判斷能否安全自動轉換) ─────────────────────────────────

function classifySizeValue(attr: JsxAttribute): 'numeric' | 'string' | 'unknown' | 'none' {
  const init = attr.getInitializer()
  if (init == null) return 'none'
  if (Node.isStringLiteral(init)) return 'string'
  if (!Node.isJsxExpression(init)) return 'unknown'
  const expr = init.getExpression()
  if (expr == null) return 'none'
  const inner = unwrapExpression(expr)
  if (
    Node.isStringLiteral(inner) ||
    Node.isNoSubstitutionTemplateLiteral(inner) ||
    Node.isTemplateExpression(inner)
  ) {
    return 'string'
  }
  if (Node.isNumericLiteral(inner)) return 'numeric'
  if (Node.isPrefixUnaryExpression(inner) && Node.isNumericLiteral(inner.getOperand())) {
    return 'numeric'
  }
  try {
    const type = inner.getType()
    if (type.isNumber() || type.isNumberLiteral()) return 'numeric'
    if (type.isString() || type.isStringLiteral()) return 'string'
  } catch {
    // 型別解析失敗 → 走 unknown(標 TODO)
  }
  return 'unknown'
}

function classifyErrorValue(attr: JsxAttribute): 'string' | 'boolean' | 'unknown' | 'none' {
  const init = attr.getInitializer()
  if (init == null) return 'none' // 布林 shorthand,屬新契約,不動
  if (Node.isStringLiteral(init)) return 'string'
  if (!Node.isJsxExpression(init)) return 'unknown'
  const expr = init.getExpression()
  if (expr == null) return 'none'
  const inner = unwrapExpression(expr)
  if (
    Node.isStringLiteral(inner) ||
    Node.isNoSubstitutionTemplateLiteral(inner) ||
    Node.isTemplateExpression(inner)
  ) {
    return 'string'
  }
  const kind = inner.getKind()
  if (kind === SyntaxKind.TrueKeyword || kind === SyntaxKind.FalseKeyword) return 'boolean'
  return 'unknown'
}

function classifyExpandableValue(attr: JsxAttribute): 'function' | 'boolean' | 'unknown' | 'none' {
  const init = attr.getInitializer()
  if (init == null) return 'none' // 裸 expandable = 布林,不動
  if (!Node.isJsxExpression(init)) return 'unknown'
  const expr = init.getExpression()
  if (expr == null) return 'none'
  const inner = unwrapExpression(expr)
  const kind = inner.getKind()
  if (kind === SyntaxKind.TrueKeyword || kind === SyntaxKind.FalseKeyword) return 'boolean'
  if (Node.isIdentifier(inner) && inner.getText() === 'undefined') return 'boolean'
  if (Node.isArrowFunction(inner) || Node.isFunctionExpression(inner)) return 'function'
  // 識別字等其他表達式:布林值是合法現行用法(expandable: boolean | fn),
  // 只有可呼叫的值才是舊用法,必須問型別;解析不了就標 TODO,不用猜的
  try {
    const type = inner.getType()
    if (type.isBoolean() || type.isBooleanLiteral()) return 'boolean'
    if (type.getCallSignatures().length > 0) return 'function'
  } catch {
    // 型別解析失敗 → 走 unknown(標 TODO)
  }
  return 'unknown'
}

// ── import / 識別字改名(Toggle → Switch 等) ──────────────────────

/**
 * 把 import 自 arkite 的 oldName 連同檔內所有參照改為 newName;
 * 若檔內已 import newName 則合併(移除舊 specifier)。
 * 回傳變更數(參照數 + import 本身)。
 */
function renameArkiteExport(sf: SourceFile, oldName: string, newName: string): number {
  const info = arkiteImportInfo(sf, oldName)
  if (info == null) return 0
  const spec = info.specifier
  if (spec.getAliasNode() != null) {
    // import { Toggle as T } → import { Switch as T }:參照全走別名,只改 specifier
    spec.setName(newName)
    return 1
  }
  const existing = arkiteImportInfo(sf, newName)
  const merge = existing != null && existing.specifier.getAliasNode() == null
  // 收集綁定到這個 import specifier 的識別字參照(JSX 開閉標籤、型別註記皆是 Identifier)
  const ranges: Array<[number, number]> = []
  for (const id of sf.getDescendantsOfKind(SyntaxKind.Identifier)) {
    if (id.getText() !== oldName) continue
    if (id.getFirstAncestorByKind(SyntaxKind.ImportDeclaration) != null) continue
    const parent = id.getParent()
    const isTagName =
      (Node.isJsxOpeningElement(parent) ||
        Node.isJsxSelfClosingElement(parent) ||
        Node.isJsxClosingElement(parent)) &&
      parent.getTagNameNode() === id
    const sym = id.getSymbol()
    const boundToSpec = sym?.getDeclarations().some((d) => d === spec) ?? false
    // symbol 解析不到的 JSX 標籤退回名稱比對(import 來源已確認是 arkite)
    if (boundToSpec || (isTagName && sym == null)) {
      ranges.push([id.getStart(), id.getEnd()])
    }
  }
  ranges.sort((a, b) => b[0] - a[0])
  for (const [start, end] of ranges) sf.replaceText([start, end], newName)
  // 前面的 replaceText 使節點失效,重新取得 import specifier 再收尾
  const fresh = arkiteImportInfo(sf, oldName)
  if (fresh != null) {
    if (merge) {
      const decl = fresh.specifier.getImportDeclaration()
      fresh.specifier.remove()
      if (
        decl.getNamedImports().length === 0 &&
        decl.getDefaultImport() == null &&
        decl.getNamespaceImport() == null
      ) {
        decl.remove()
      }
    } else {
      fresh.specifier.setName(newName)
    }
  }
  return ranges.length + 1
}

// ── toast API ──────────────────────────────────────────────────────

const TOAST_METHODS = new Set(['show', 'success', 'error', 'warning', 'info'])

const WRAPPABLE_KINDS = new Set<SyntaxKind>([
  SyntaxKind.StringLiteral,
  SyntaxKind.NoSubstitutionTemplateLiteral,
  SyntaxKind.TemplateExpression,
  SyntaxKind.JsxElement,
  SyntaxKind.JsxSelfClosingElement,
  SyntaxKind.JsxFragment,
])

/** node 的 symbol 是否綁定到 decl(識別字與宣告同名不算,要同一個綁定) */
function isBoundTo(node: Node, decl: Node): boolean {
  return (
    node
      .getSymbol()
      ?.getDeclarations()
      .some((d) => d === decl) ?? false
  )
}

/**
 * 檔內「確定來自 arkite」的 toast 物件宣告:import 的 toast specifier、
 * useToast() 回傳值的變數宣告。呼叫點用 symbol 綁定比對這些宣告,
 * 同名但不同來源的物件(函式參數、其他函式庫的 toast)不會誤中。
 */
function toastObjectDeclarations(sf: SourceFile): Set<Node> {
  const decls = new Set<Node>()
  const direct = arkiteImportInfo(sf, 'toast')
  if (direct != null) decls.add(direct.specifier)
  const hook = arkiteImportInfo(sf, 'useToast')
  if (hook != null) {
    for (const vd of sf.getDescendantsOfKind(SyntaxKind.VariableDeclaration)) {
      const init = vd.getInitializer()
      if (init == null || !Node.isCallExpression(init)) continue
      const callee = init.getExpression()
      if (!Node.isIdentifier(callee) || !isBoundTo(callee, hook.specifier)) continue
      if (Node.isIdentifier(vd.getNameNode())) decls.add(vd)
    }
  }
  return decls
}

/** identifier 是否參照到 arkite 的 toast 物件(以宣告綁定判定,非名稱比對) */
function isArkiteToastRef(node: Node, decls: Set<Node>): boolean {
  if (!Node.isIdentifier(node)) return false
  return (
    node
      .getSymbol()
      ?.getDeclarations()
      .some((d) => decls.has(d)) ?? false
  )
}

interface ToastMethodCall {
  call: CallExpression
  second: Node
}

function toastMethodCalls(sf: SourceFile): ToastMethodCall[] {
  const decls = toastObjectDeclarations(sf)
  if (decls.size === 0) return []
  const out: ToastMethodCall[] = []
  for (const call of sf.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    const target = call.getExpression()
    if (!Node.isPropertyAccessExpression(target)) continue
    if (!TOAST_METHODS.has(target.getName())) continue
    if (!isArkiteToastRef(target.getExpression(), decls)) continue
    const args = call.getArguments()
    if (args.length < 2) continue
    out.push({ call, second: args[1] })
  }
  return out
}

function classifyToastSecondArg(arg: Node): 'wrap' | 'skip' | 'unknown' {
  if (WRAPPABLE_KINDS.has(arg.getKind())) return 'wrap'
  const inner = unwrapExpression(arg)
  if (Node.isObjectLiteralExpression(inner)) return 'skip' // 已是 options 物件
  if (inner.getKind() === SyntaxKind.NullKeyword) return 'skip'
  if (Node.isIdentifier(inner) && inner.getText() === 'undefined') return 'skip'
  return 'unknown'
}

// ── 規則清單 ───────────────────────────────────────────────────────

const toggleToSwitchRule: Rule = {
  name: 'toggle-to-switch',
  description: 'Toggle → Switch(import 與 JSX 一起改,已有 Switch 則合併)',
  transform(sf) {
    return renameArkiteExport(sf, 'Toggle', 'Switch')
  },
}

const imperativeToastContainerRule: Rule = {
  name: 'imperative-toast-container',
  description: 'ImperativeToastContainer(Props) → ToastContainer(Props)',
  transform(sf) {
    return (
      renameArkiteExport(sf, 'ImperativeToastContainer', 'ToastContainer') +
      renameArkiteExport(sf, 'ImperativeToastContainerProps', 'ToastContainerProps')
    )
  },
}

const circularProgressDiameterRule: Rule = {
  name: 'circular-progress-diameter',
  description: 'CircularProgress size={數值} → diameter={數值}(size="sm"|"md"|"lg" 不動)',
  transform(sf) {
    return editUntilStable(() => {
      const entry = arkiteJsxAttrEntries(sf, ['CircularProgress'], 'size').find(
        (e) => classifySizeValue(e.attr) === 'numeric' && getJsxAttr(e.element, 'diameter') == null
      )
      if (entry == null) return false
      entry.attr.getNameNode().replaceWithText('diameter')
      return true
    })
  },
  collectTodos(sf) {
    return arkiteJsxAttrEntries(sf, ['CircularProgress'], 'size')
      .filter((e) => classifySizeValue(e.attr) === 'unknown')
      .map((e) => ({
        node: e.attr,
        kind: 'attr' as const,
        message:
          'CircularProgress 的 size 於 v1.0 僅接受 "sm" | "md" | "lg";若此值是數值,請改用 diameter',
      }))
  },
}

const commandDialogRule: Rule = {
  name: 'command-dialog-onclose',
  description: 'CommandDialog onOpenChange → onClose(簽名不同,僅標 TODO)',
  transform: () => 0,
  collectTodos(sf) {
    return arkiteJsxAttrEntries(sf, ['CommandDialog'], 'onOpenChange').map((e) => ({
      node: e.attr,
      kind: 'attr' as const,
      message:
        'CommandDialog 的 onOpenChange((open: boolean) => void)已移除,請手動改寫為 onClose(() => void)',
    }))
  },
}

function errorMessageRule(name: string, components: readonly string[]): Rule {
  return {
    name,
    description: `${components.join('/')} error={字串} → errorMessage(其他表達式標 TODO)`,
    transform(sf) {
      return editUntilStable(() => {
        const entry = arkiteJsxAttrEntries(sf, components, 'error').find(
          (e) =>
            classifyErrorValue(e.attr) === 'string' && getJsxAttr(e.element, 'errorMessage') == null
        )
        if (entry == null) return false
        entry.attr.getNameNode().replaceWithText('errorMessage')
        return true
      })
    },
    collectTodos(sf) {
      return arkiteJsxAttrEntries(sf, components, 'error')
        .filter((e) => classifyErrorValue(e.attr) === 'unknown')
        .map((e) => ({
          node: e.attr,
          kind: 'attr' as const,
          message: `${e.component} 的 error 於 v1.0 起為 boolean;若此處傳的是錯誤訊息字串,請改用 errorMessage`,
        }))
    },
  }
}

const dataTableRule: Rule = {
  name: 'data-table-render-expanded-row',
  description: 'DataTable expandable={函式/識別字} → renderExpandedRow(布林形式不動)',
  transform(sf) {
    return editUntilStable(() => {
      const entry = arkiteJsxAttrEntries(sf, ['DataTable'], 'expandable').find(
        (e) =>
          classifyExpandableValue(e.attr) === 'function' &&
          getJsxAttr(e.element, 'renderExpandedRow') == null
      )
      if (entry == null) return false
      entry.attr.getNameNode().replaceWithText('renderExpandedRow')
      return true
    })
  },
  collectTodos(sf) {
    return arkiteJsxAttrEntries(sf, ['DataTable'], 'expandable')
      .filter((e) => classifyExpandableValue(e.attr) === 'unknown')
      .map((e) => ({
        node: e.attr,
        kind: 'attr' as const,
        message:
          'DataTable 的 expandable 於 v1.0 起僅接受 boolean;若此表達式的值是函式,請改用 renderExpandedRow',
      }))
  },
}

const timelineRule: Rule = {
  name: 'timeline-variant-muted',
  description: "Timeline 內聯 items 的 variant: 'default' → 'muted'(變數傳入標 TODO)",
  transform(sf) {
    return editUntilStable(() => {
      for (const { attr } of arkiteJsxAttrEntries(sf, ['Timeline'], 'items')) {
        const arr = timelineItemsArray(attr)
        if (arr == null) continue
        for (const el of arr.getElements()) {
          if (!Node.isObjectLiteralExpression(el)) continue
          const prop = el.getProperty('variant')
          if (prop == null || !Node.isPropertyAssignment(prop)) continue
          const value = prop.getInitializer()
          if (
            value != null &&
            (Node.isStringLiteral(value) || Node.isNoSubstitutionTemplateLiteral(value)) &&
            value.getLiteralValue() === 'default'
          ) {
            replaceStringValue(value, 'muted')
            return true
          }
        }
      }
      return false
    })
  },
  collectTodos(sf) {
    return arkiteJsxAttrEntries(sf, ['Timeline'], 'items')
      .filter(({ attr }) => {
        const init = attr.getInitializer()
        if (init == null || !Node.isJsxExpression(init)) return false
        const expr = init.getExpression()
        return expr != null && timelineItemsArray(attr) == null
      })
      .map(({ attr }) => ({
        node: attr,
        kind: 'attr' as const,
        message:
          "Timeline items 的 variant: 'default' 已於 v1.0 改為 'muted',請檢查此變數的來源資料",
      }))
  },
}

function timelineItemsArray(attr: JsxAttribute) {
  const init = attr.getInitializer()
  if (init == null || !Node.isJsxExpression(init)) return undefined
  const expr = init.getExpression()
  if (expr == null) return undefined
  const inner = unwrapExpression(expr)
  return Node.isArrayLiteralExpression(inner) ? inner : undefined
}

const toastDismissAllRule: Rule = {
  name: 'toast-dismiss-all',
  description: 'toast/useToast() 的 .clear() → .dismissAll()(含解構)',
  transform(sf) {
    let total = editUntilStable(() => {
      const decls = toastObjectDeclarations(sf)
      if (decls.size === 0) return false
      for (const call of sf.getDescendantsOfKind(SyntaxKind.CallExpression)) {
        const target = call.getExpression()
        if (!Node.isPropertyAccessExpression(target)) continue
        if (target.getName() !== 'clear') continue
        if (!isArkiteToastRef(target.getExpression(), decls)) continue
        target.getNameNode().replaceWithText('dismissAll')
        return true
      }
      return false
    })
    total += editUntilStable(() => {
      const hook = arkiteImportInfo(sf, 'useToast')
      if (hook == null) return false
      for (const vd of sf.getDescendantsOfKind(SyntaxKind.VariableDeclaration)) {
        const init = vd.getInitializer()
        if (init == null || !Node.isCallExpression(init)) continue
        const callee = init.getExpression()
        if (!Node.isIdentifier(callee) || !isBoundTo(callee, hook.specifier)) continue
        const nameNode = vd.getNameNode()
        if (!Node.isObjectBindingPattern(nameNode)) continue
        for (const el of nameNode.getElements()) {
          const propName = el.getPropertyNameNode()
          if (propName != null) {
            // { clear: myClear } → { dismissAll: myClear }
            if (propName.getText() === 'clear') {
              propName.replaceWithText('dismissAll')
              return true
            }
            continue
          }
          const bindingId = el.getNameNode()
          if (bindingId.getText() !== 'clear') continue
          // { clear } → { dismissAll },呼叫點一併改名
          const ranges: Array<[number, number]> = [[bindingId.getStart(), bindingId.getEnd()]]
          for (const id of sf.getDescendantsOfKind(SyntaxKind.Identifier)) {
            if (id.getText() !== 'clear' || id === bindingId) continue
            const sym = id.getSymbol()
            if (sym?.getDeclarations().some((d) => d === el)) {
              ranges.push([id.getStart(), id.getEnd()])
            }
          }
          ranges.sort((a, b) => b[0] - a[0])
          for (const [start, end] of ranges) sf.replaceText([start, end], 'dismissAll')
          return true
        }
      }
      return false
    })
    return total
  },
}

const toastDescriptionRule: Rule = {
  name: 'toast-description-option',
  description:
    'toast.success/error/warning/info/show(t, 字串/模板/JSX) → 第二參數包成 { description }',
  transform(sf) {
    return editUntilStable(() => {
      const hit = toastMethodCalls(sf).find(
        ({ second }) => classifyToastSecondArg(second) === 'wrap'
      )
      if (hit == null) return false
      hit.second.replaceWithText(`{ description: ${hit.second.getText()} }`)
      return true
    })
  },
  collectTodos(sf) {
    return toastMethodCalls(sf)
      .filter(({ second }) => classifyToastSecondArg(second) === 'unknown')
      .map(({ call }) => ({
        node: call,
        kind: 'line' as const,
        message:
          'toast 便捷方法第二參數於 v1.0 起為 options 物件;若此表達式是描述文字,請包成 { description: ... }',
      }))
  },
}

// ── toast.fromError 採用規則(選用,非 v1.0 破壞性變更)───────────

/** 尾端的半形/全形冒號與空白 — prefix 變成 title 後不該帶冒號 */
function trimPrefix(text: string): string {
  return text.replace(/[\s:：、,，-]+$/u, '').trim()
}

function quoteSingle(text: string): string {
  return `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

/** expr 是否為 getErrorMessage(x) 形式的單參數呼叫;是則回傳 x */
function unwrapGetErrorMessageCall(expr: Node): Node | undefined {
  const inner = unwrapExpression(expr)
  if (!Node.isCallExpression(inner)) return undefined
  const callee = inner.getExpression()
  if (!Node.isIdentifier(callee) || callee.getText() !== 'getErrorMessage') return undefined
  const args = inner.getArguments()
  return args.length === 1 ? args[0] : undefined
}

interface FromErrorMatch {
  call: CallExpression
  objText: string
  errText: string
  prefix: string | undefined
  optionsProps: string[] | undefined
}

function matchFromErrorCall(sf: SourceFile): FromErrorMatch | undefined {
  const decls = toastObjectDeclarations(sf)
  if (decls.size === 0) return undefined
  for (const call of sf.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    const target = call.getExpression()
    if (!Node.isPropertyAccessExpression(target)) continue
    if (target.getName() !== 'error') continue
    const obj = target.getExpression()
    if (!isArkiteToastRef(obj, decls)) continue
    const args = call.getArguments()
    if (args.length === 0 || args.length > 2) continue
    // 第二參數只接受物件字面量(其屬性併入新 options),其他形狀略過
    let optionsProps: string[] | undefined
    if (args.length === 2) {
      const second = unwrapExpression(args[1])
      if (!Node.isObjectLiteralExpression(second)) continue
      optionsProps = second.getProperties().map((p) => p.getText())
    }
    const first = unwrapExpression(args[0])
    // 形狀 A:toast.error(getErrorMessage(err))
    const bare = unwrapGetErrorMessageCall(first)
    if (bare != null) {
      return {
        call,
        objText: obj.getText(),
        errText: bare.getText(),
        prefix: undefined,
        optionsProps,
      }
    }
    // 形狀 B:toast.error(`前綴:${getErrorMessage(err)}`)(單一插值、插值後無尾字)
    if (Node.isTemplateExpression(first)) {
      const spans = first.getTemplateSpans()
      if (spans.length !== 1) continue
      if (spans[0].getLiteral().getLiteralText() !== '') continue
      const err = unwrapGetErrorMessageCall(spans[0].getExpression())
      if (err == null) continue
      const prefix = trimPrefix(first.getHead().getLiteralText())
      return {
        call,
        objText: obj.getText(),
        errText: err.getText(),
        prefix: prefix === '' ? undefined : prefix,
        optionsProps,
      }
    }
    // 形狀 C:toast.error('前綴:' + getErrorMessage(err))
    if (
      Node.isBinaryExpression(first) &&
      first.getOperatorToken().getKind() === SyntaxKind.PlusToken
    ) {
      const left = unwrapExpression(first.getLeft())
      if (!Node.isStringLiteral(left) && !Node.isNoSubstitutionTemplateLiteral(left)) continue
      const err = unwrapGetErrorMessageCall(first.getRight())
      if (err == null) continue
      const prefix = trimPrefix(left.getLiteralText())
      return {
        call,
        objText: obj.getText(),
        errText: err.getText(),
        prefix: prefix === '' ? undefined : prefix,
        optionsProps,
      }
    }
  }
  return undefined
}

/**
 * 採用型 codemod:`toast.error(\`X:${getErrorMessage(err)}\`)` →
 * `toast.fromError(err, { prefix: 'X' })`。
 * 前提:app 啟動處已註冊 `toast.configure({ formatError: getErrorMessage })`
 * (runner 會在報告尾端提醒)。只認 getErrorMessage 這個名稱;其他形狀不動。
 */
const toastFromErrorRule: Rule = {
  name: 'toast-from-error',
  description: 'toast.error(`X:${getErrorMessage(err)}`) → toast.fromError(err, { prefix: "X" })',
  transform(sf) {
    let total = editUntilStable(() => {
      const hit = matchFromErrorCall(sf)
      if (hit == null) return false
      const opts: string[] = []
      if (hit.prefix != null) opts.push(`prefix: ${quoteSingle(hit.prefix)}`)
      if (hit.optionsProps != null) opts.push(...hit.optionsProps)
      const optionsText = opts.length > 0 ? `, { ${opts.join(', ')} }` : ''
      hit.call.replaceWithText(`${hit.objText}.fromError(${hit.errText}${optionsText})`)
      return true
    })
    // 清理:getErrorMessage 若已無任何參照,移除 import specifier(空了連
    // declaration 一起移),否則 type-check 會因 unused import 而紅
    for (const decl of sf.getImportDeclarations()) {
      for (const ni of decl.getNamedImports()) {
        if (ni.getName() !== 'getErrorMessage') continue
        const localName = ni.getAliasNode()?.getText() ?? ni.getName()
        const used = sf
          .getDescendantsOfKind(SyntaxKind.Identifier)
          .some(
            (id) =>
              id.getText() === localName &&
              id.getFirstAncestorByKind(SyntaxKind.ImportDeclaration) == null
          )
        if (used) continue
        const parent = ni.getImportDeclaration()
        ni.remove()
        if (
          parent.getNamedImports().length === 0 &&
          parent.getDefaultImport() == null &&
          parent.getNamespaceImport() == null
        ) {
          parent.remove()
        }
        total += 1
      }
    }
    return total
  },
}

/** 選用的採用型規則集(`pnpm codemod:from-error`),不屬於 v1.0 破壞性遷移 */
export const fromErrorRules: readonly Rule[] = [toastFromErrorRule]

export const rules: readonly Rule[] = [
  propStringValueRule(
    'alert-variant-destructive',
    'Alert variant="error" → variant="destructive"',
    ['Alert'],
    'variant',
    'error',
    'destructive'
  ),
  propRenameRule(
    'alert-onclose',
    'Alert onDismiss → onClose',
    ['Alert'],
    [['onDismiss', 'onClose']]
  ),
  propStringValueRule(
    'progress-variant-destructive',
    'Progress/CircularProgress variant="error" → variant="destructive"',
    ['Progress', 'CircularProgress'],
    'variant',
    'error',
    'destructive'
  ),
  circularProgressDiameterRule,
  propRenameRule(
    'tabs-onchange',
    'Tabs onValueChange → onChange',
    ['Tabs'],
    [['onValueChange', 'onChange']]
  ),
  propRenameRule(
    'loading-overlay-open',
    'LoadingOverlay visible → open',
    ['LoadingOverlay'],
    [['visible', 'open']]
  ),
  toggleToSwitchRule,
  imperativeToastContainerRule,
  commandDialogRule,
  errorMessageRule('form-error-message', ['FormField', 'FormMessage']),
  errorMessageRule('image-upload-error-message', ['ImageUpload']),
  dataTableRule,
  propRenameRule(
    'tree-onselectionchange',
    'Tree onCheckChange → onSelectionChange',
    ['Tree'],
    [['onCheckChange', 'onSelectionChange']]
  ),
  propRenameRule(
    'pagination-variant',
    'Pagination mode → variant',
    ['Pagination'],
    [['mode', 'variant']]
  ),
  timelineRule,
  propRenameRule(
    'tenant-switcher-props',
    'TenantSwitcher currentTenant → value、onSelect → onChange',
    ['TenantSwitcher'],
    [
      ['currentTenant', 'value'],
      ['onSelect', 'onChange'],
    ]
  ),
  toastDismissAllRule,
  toastDescriptionRule,
]

// ── 套用 + TODO 註解插入 ───────────────────────────────────────────

export interface RuleHit {
  changes: number
  todos: number
}

export interface FileOutcome {
  changed: boolean
  hits: Record<string, RuleHit>
}

/** 插入位置是否落在 JSX children 區域(該處 // 註解會變成文字,需改用 {\/* *\/}) */
function isJsxChildrenPosition(sf: SourceFile, pos: number): boolean {
  const token = sf.getDescendantAtPos(pos)
  if (token == null) return false
  if (token.getKind() === SyntaxKind.JsxText) return true
  let node: Node = token
  for (;;) {
    const parent: Node | undefined = node.getParent()
    if (parent == null || parent.getStart() !== pos) break
    node = parent
  }
  const parent = node.getParent()
  return parent != null && (Node.isJsxElement(parent) || Node.isJsxFragment(parent))
}

interface PlannedInsert {
  insertPos: number
  text: string
}

function planTodoInsert(sf: SourceFile, text: string, req: TodoRequest): PlannedInsert | undefined {
  const nodeStart = req.node.getStart()
  const lineStart = text.lastIndexOf('\n', nodeStart - 1) + 1
  const lineEndIdx = text.indexOf('\n', lineStart)
  const lineText = text.slice(lineStart, lineEndIdx === -1 ? text.length : lineEndIdx)
  const indent = /^[ \t]*/.exec(lineText)?.[0] ?? ''
  // 上一行已有相同標記 → 不重複插入(讓 codemod 可重跑)
  const prevLineEnd = lineStart - 1
  if (prevLineEnd >= 0) {
    const prevLineStart = text.lastIndexOf('\n', prevLineEnd - 1) + 1
    if (text.slice(prevLineStart, prevLineEnd).includes(TODO_MARKER)) return undefined
  }
  const comment = `// ${TODO_MARKER} ${req.message}`
  if (req.kind === 'attr') {
    // 直接插在屬性前(JSX 屬性區域允許行註解)
    return { insertPos: nodeStart, text: `${comment}\n${indent}` }
  }
  const firstNonWs = lineStart + indent.length
  if (isJsxChildrenPosition(sf, firstNonWs)) {
    return { insertPos: lineStart, text: `${indent}{/* ${TODO_MARKER} ${req.message} */}\n` }
  }
  return { insertPos: lineStart, text: `${indent}${comment}\n` }
}

/** 對單一檔案套用整組規則(先轉換、再於最終 AST 上規劃並插入 TODO 註解) */
export function applyRulesToSourceFile(
  sf: SourceFile,
  ruleSet: readonly Rule[] = rules
): FileOutcome {
  const before = sf.getFullText()
  const hits: Record<string, RuleHit> = {}
  for (const rule of ruleSet) {
    hits[rule.name] = { changes: rule.transform(sf), todos: 0 }
  }
  // TODO 全部先規劃(未插入前節點位置才有效),再由後往前插入
  const snapshot = sf.getFullText()
  const planned: PlannedInsert[] = []
  const seen = new Set<string>()
  for (const rule of ruleSet) {
    if (rule.collectTodos == null) continue
    for (const req of rule.collectTodos(sf)) {
      const plan = planTodoInsert(sf, snapshot, req)
      if (plan == null) continue
      const key = `${plan.insertPos}|${req.message}`
      if (seen.has(key)) continue
      seen.add(key)
      planned.push(plan)
      hits[rule.name].todos++
    }
  }
  planned.sort((a, b) => b.insertPos - a.insertPos)
  for (const plan of planned) {
    sf.insertText(plan.insertPos, plan.text)
  }
  return { changed: sf.getFullText() !== before, hits }
}
