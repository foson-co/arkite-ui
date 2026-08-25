// Server Component on purpose — this page proves two RSC boundaries:
// 1. `@arkite-ui/core/tokens` is server-safe (plain values, no
//    "use client" banner — a banner here would break this import).
// 2. Client components from the main entry compose into a server tree.
import { colors } from '@arkite-ui/core/tokens'
import { Demo } from './demo'

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">arkite-ui Next.js smoke</h1>
      <p className="mt-2 text-sm">
        Server-rendered token value: <code data-testid="server-token">{colors.light.primary}</code>
      </p>
      <Demo />
    </main>
  )
}
