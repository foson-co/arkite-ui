import { describe, it, expect } from 'vitest'
import ts from 'typescript'
import { resolve } from 'node:path'

/**
 * Public API surface snapshot.
 *
 * Walks every export of src/index.ts and emits a sorted, stable report:
 * values with their type signatures, interfaces/type aliases with their
 * members expanded one level. Renaming, removing, or retyping anything
 * public — including a single prop on a Props interface — fails this
 * test until the snapshot is deliberately regenerated:
 *
 *     pnpm vitest run src/api-surface.test.ts -u
 *
 * The snapshot diff then documents the API change in the merge request.
 */

const ENTRY = resolve(__dirname, 'index.ts')

const TYPE_FORMAT =
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
  ts.TypeFormatFlags.WriteArrowStyleSignature

/**
 * Split a type string on its top-level `|`, ignoring separators nested inside
 * brackets, generics, or string literals. `=>` is not a closing angle bracket.
 */
export function splitTopLevelUnion(text: string): string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0
  let quote: string | null = null

  for (let i = 0; i < text.length; i++) {
    const c = text[i]

    if (quote) {
      if (c === quote && text[i - 1] !== '\\') quote = null
      continue
    }
    if (c === '"' || c === "'" || c === '`') {
      quote = c
    } else if (c === '(' || c === '[' || c === '{' || c === '<') {
      depth++
    } else if (c === ')' || c === ']' || c === '}') {
      depth--
    } else if (c === '>' && text[i - 1] !== '=') {
      depth--
    } else if (c === '|' && depth === 0 && text[i - 1] === ' ' && text[i + 1] === ' ') {
      parts.push(text.slice(start, i - 1))
      start = i + 2
    }
  }

  parts.push(text.slice(start))
  return parts
}

/**
 * Put a union's members in a stable order.
 *
 * TypeScript does not guarantee the order of union constituents — it follows
 * the order the types happened to be created, which varies with resolution
 * order between machines and runs. That made this snapshot flake in CI:
 * `"default" | "destructive"` locally, `"destructive" | "default"` on the
 * runner, producing a diff that reads exactly like a deliberate API change and
 * invites someone to `-u` over a real one. Declaration order was never part of
 * what the snapshot is for, so sorting costs nothing and removes the report's
 * only nondeterminism.
 *
 * Deliberately top-level only. Unions nested inside generics could reorder too,
 * but normalizing them means parsing the type string recursively, and a bug in
 * that parser would silently weaken the guard — a worse failure than the flake
 * it prevents. If a nested one ever flakes, that is the moment to pay the cost.
 */
export function normalizeUnion(text: string): string {
  const parts = splitTopLevelUnion(text)
  if (parts.length < 2) return text

  // `undefined`/`null` sort last so an optional prop still reads the way
  // TypeScript writes it (`"sm" | "md" | undefined`) instead of burying the
  // nullish member mid-list.
  const rank = (p: string) => (p === 'undefined' || p === 'null' ? 1 : 0)

  return parts
    .map((p) => p.trim())
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b, 'en'))
    .join(' | ')
}

function buildReport(): string {
  const configPath = ts.findConfigFile(__dirname, ts.sys.fileExists, 'tsconfig.json')
  const config = configPath
    ? ts.parseJsonConfigFileContent(
        ts.readConfigFile(configPath, ts.sys.readFile).config,
        ts.sys,
        resolve(configPath, '..')
      ).options
    : {}
  const program = ts.createProgram([ENTRY], { ...config, noEmit: true })
  const checker = program.getTypeChecker()
  const source = program.getSourceFile(ENTRY)
  if (!source) throw new Error('entry not found')

  const moduleSymbol = checker.getSymbolAtLocation(source)
  if (!moduleSymbol) throw new Error('no module symbol')

  const lines: string[] = []

  for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
    const name = symbol.getName()
    const resolved = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol
    const flags = resolved.flags

    if (flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias)) {
      const decl = resolved.declarations?.[0]
      if (!decl) continue
      const type = checker.getDeclaredTypeOfSymbol(resolved)
      // Only members declared in our own source enter the report —
      // inherited React DOM/aria props are noise (and would churn the
      // snapshot on every @types/react upgrade).
      const props = type.getProperties().filter((p) =>
        p.declarations?.some((d) => {
          const f = d.getSourceFile().fileName
          return f.includes('/src/') && !f.includes('node_modules')
        })
      )
      if (props.length > 0) {
        const members = props
          .map((p) => {
            const optional = p.flags & ts.SymbolFlags.Optional ? '?' : ''
            const pDecl = p.declarations?.[0] ?? decl
            const pType = normalizeUnion(
              checker.typeToString(checker.getTypeOfSymbolAtLocation(p, pDecl), pDecl, TYPE_FORMAT)
            )
            return `  ${p.getName()}${optional}: ${pType}`
          })
          .sort()
        lines.push(`type ${name} {\n${members.join('\n')}\n}`)
      } else {
        // Unions, primitives, and other member-less aliases
        const text = normalizeUnion(checker.typeToString(type, decl, TYPE_FORMAT))
        lines.push(`type ${name} = ${text}`)
      }
    } else {
      const decl = resolved.declarations?.[0] ?? symbol.declarations?.[0]
      if (!decl) continue
      const type = checker.getTypeOfSymbolAtLocation(resolved, decl)
      const text = normalizeUnion(checker.typeToString(type, decl, TYPE_FORMAT))
      lines.push(`value ${name}: ${text}`)
    }
  }

  return lines.sort().join('\n\n') + '\n'
}

/**
 * The normalizer sits between the compiler and the guard, so a bug in it would
 * quietly change what counts as an API change. It gets its own tests.
 */
describe('union normalization', () => {
  it('sorts top-level members', () => {
    expect(normalizeUnion('"warning" | "default" | undefined')).toBe(
      '"default" | "warning" | undefined'
    )
  })

  it('keeps undefined and null at the end, where TypeScript writes them', () => {
    expect(normalizeUnion('undefined | "b" | "a"')).toBe('"a" | "b" | undefined')
    expect(normalizeUnion('null | boolean | "mobile"')).toBe('"mobile" | boolean | null')
  })

  it('leaves a non-union untouched', () => {
    expect(normalizeUnion('string')).toBe('string')
    expect(normalizeUnion('(value: string) => void')).toBe('(value: string) => void')
  })

  it('never splits inside generics, brackets, or objects', () => {
    expect(splitTopLevelUnion('Record<string, "b" | "a">')).toHaveLength(1)
    expect(splitTopLevelUnion('{ a: string | number }')).toHaveLength(1)
    expect(splitTopLevelUnion('Array<"b" | "a"> | null')).toHaveLength(2)
  })

  it('treats => as an arrow, not a closing angle bracket', () => {
    // A naive depth counter reads the `>` of `=>` as a close, goes negative,
    // and then splits inside the next generic.
    expect(splitTopLevelUnion('((v: string) => void) | Record<string, "b" | "a">')).toEqual([
      '((v: string) => void)',
      'Record<string, "b" | "a">',
    ])
  })

  it('ignores separators inside string literals', () => {
    expect(splitTopLevelUnion('"a | b" | "c"')).toEqual(['"a | b"', '"c"'])
  })

  it('is a permutation — nothing is dropped or merged', () => {
    const input = 'C | A | (x: 1 | 2) => void | B'
    const before = splitTopLevelUnion(input).map((p) => p.trim())
    const after = splitTopLevelUnion(normalizeUnion(input)).map((p) => p.trim())
    expect([...after].sort()).toEqual([...before].sort())
  })
})

describe('public API surface', () => {
  it('matches the committed snapshot (run vitest -u after intentional API changes)', async () => {
    await expect(buildReport()).toMatchFileSnapshot('../api-report.txt')
  }, 120_000)
})
