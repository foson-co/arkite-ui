#!/usr/bin/env node

/**
 * @arkite-ui/core init CLI
 *
 * Sets up Arkite UI in a new or existing project:
 * 1. Detects package manager
 * 2. Installs @arkite-ui/core + required peer deps
 * 3. Writes CSS theme file with tokens
 * 4. Writes theme setup helper
 *
 * Usage:
 *   npx @arkite-ui/core init
 *   npx @arkite-ui/core init --pm bun
 */

import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { execSync } from 'node:child_process'

const cwd = process.cwd()

// ─── Helpers ───

function log(msg) {
  console.log(`\x1b[36m◆\x1b[0m ${msg}`)
}

function success(msg) {
  console.log(`\x1b[32m✓\x1b[0m ${msg}`)
}

function warn(msg) {
  console.log(`\x1b[33m⚠\x1b[0m ${msg}`)
}

function detectPM() {
  if (existsSync(join(cwd, 'bun.lockb')) || existsSync(join(cwd, 'bun.lock'))) return 'bun'
  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) return 'pnpm'
  if (existsSync(join(cwd, 'yarn.lock'))) return 'yarn'
  return 'npm'
}

function installCmd(pm, deps) {
  const d = deps.join(' ')
  switch (pm) {
    case 'bun': return `bun add ${d}`
    case 'pnpm': return `pnpm add ${d}`
    case 'yarn': return `yarn add ${d}`
    default: return `npm install ${d}`
  }
}

// ─── Args ───

const args = process.argv.slice(2)
const command = args[0]

if (command === 'theme') {
  const { runTheme } = await import('./theme.mjs')
  await runTheme(args.slice(1), cwd)
  process.exit(0)
}

if (command !== 'init') {
  const { themeHelp } = await import('./theme.mjs')
  console.log(`
\x1b[1m@arkite-ui/core CLI\x1b[0m

Commands:
  init          Set up Arkite UI in your project
  init --pm     Specify package manager (npm|yarn|pnpm|bun)
  theme apply   Generate CSS variables from arkite.theme.json

Usage:
  npx @arkite-ui/core init
  npx @arkite-ui/core init --pm bun
${themeHelp()}`)
  process.exit(0)
}

const pmFlag = args.indexOf('--pm')
const pm = pmFlag !== -1 ? args[pmFlag + 1] : detectPM()
const dryRun = args.includes('--dry-run')

log(`Detected package manager: ${pm}`)

// ─── Step 1: Install dependencies ───

const deps = [
  '@arkite-ui/core',
  'lucide-react',
  'tailwindcss@^4',
  'tw-animate-css',
  'zustand',
]

if (dryRun) {
  log(`(dry-run) skipping install, would run: ${installCmd(pm, deps)}`)
} else {
  log('Installing dependencies...')
  try {
    execSync(installCmd(pm, deps), { cwd, stdio: 'inherit' })
    success('Dependencies installed')
  } catch {
    warn('Failed to install some dependencies. You may need to install them manually:')
    console.log(`  ${installCmd(pm, deps)}`)
  }
}

// ─── Step 2: Write CSS file ───

const cssDir = resolve(cwd, 'src/styles')
const cssPath = join(cssDir, 'arkite.css')

if (existsSync(cssPath)) {
  warn(`${cssPath} already exists, skipping`)
} else {
  mkdirSync(cssDir, { recursive: true })

  const cssContent = `@import "tailwindcss";
@import "tw-animate-css";
@import "@arkite-ui/core/styles.css";

/*
 * Override theme tokens here:
 *
 * :root {
 *   --primary: 250 100% 65%;
 *   --radius: 0.5rem;
 * }
 *
 * Or use createTheme() at runtime:
 *
 * import { createTheme, applyTheme } from '@arkite-ui/core'
 * const theme = createTheme({ primary: '#FF6B00' })
 * applyTheme(theme)
 */
`
  writeFileSync(cssPath, cssContent, 'utf-8')
  success(`Created ${cssPath}`)
}

// ─── Step 3: Write theme setup file ───

const themePath = resolve(cwd, 'src/lib/theme.ts')

if (existsSync(themePath)) {
  warn(`${themePath} already exists, skipping`)
} else {
  mkdirSync(resolve(cwd, 'src/lib'), { recursive: true })

  const themeContent = `import { createTheme, applyTheme, applyDarkTheme, type ThemePreset } from '@arkite-ui/core'

/**
 * Your application theme.
 * Customize the primary and accent colors to match your brand.
 *
 * @see https://arkite-ui.dev/docs/theming
 */
export const appTheme: ThemePreset = createTheme({
  name: 'app',
  primary: '#635bff',   // Change to your brand color
  accent: '#00d4aa',    // Change to your accent color
  radius: '0.5rem',
})

/**
 * Apply theme to the document.
 * Call this in your app's entry point (e.g., main.tsx or layout.tsx).
 */
export function setupTheme(dark = false) {
  if (dark) {
    document.documentElement.classList.add('dark')
    applyDarkTheme(appTheme)
  } else {
    document.documentElement.classList.remove('dark')
    applyTheme(appTheme)
  }
}
`
  writeFileSync(themePath, themeContent, 'utf-8')
  success(`Created ${themePath}`)
}

// ─── Step 4: Check for CSS import ───

const possibleEntries = [
  'src/main.tsx', 'src/main.ts',
  'src/index.tsx', 'src/index.ts',
  'src/app/layout.tsx',
]

let entryFile = null
for (const f of possibleEntries) {
  const p = resolve(cwd, f)
  if (existsSync(p)) {
    entryFile = p
    break
  }
}

if (entryFile) {
  const content = readFileSync(entryFile, 'utf-8')
  if (!content.includes('arkite.css') && !content.includes('@arkite-ui/core/styles')) {
    warn(`Don't forget to import the CSS in your entry file:`)
    console.log(`  \x1b[2mimport './styles/arkite.css'\x1b[0m  \x1b[90m// add to ${entryFile}\x1b[0m`)
  }
}

// ─── Done ───

console.log('')
success('Arkite UI is ready!')
console.log('')
console.log('  Next steps:')
console.log('  1. Import CSS in your entry file:')
console.log(`     \x1b[2mimport './styles/arkite.css'\x1b[0m`)
console.log('  2. Start using components:')
console.log(`     \x1b[2mimport { Button } from '@arkite-ui/core'\x1b[0m`)
console.log('  3. Customize your theme in src/lib/theme.ts')
console.log('')
