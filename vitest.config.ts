import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'

import { playwright } from '@vitest/browser-playwright'

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    projects: [
      // Unit tests (jsdom)
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.test.{ts,tsx}'],
          environment: 'jsdom',
          setupFiles: ['./src/test-setup.ts'],
          // GitLab's shared runners are disabled, so CI runs on whichever
          // self-hosted box the pipeline is currently routed to — measured at
          // ~8x slower per operation than a dev machine, with harder stalls
          // under contention. The 5s default turned that into red jobs on
          // green code: a different test each run, none reproducible locally.
          // Deliberately generous, and not pinned to one runner's speed —
          // this is headroom for the machine, not licence for slow tests.
          testTimeout: 20_000,
          coverage: {
            provider: 'v8',
            include: ['src/components/**', 'src/hooks/**', 'src/stores/**'],
            exclude: ['src/stories/**', 'src/**/*.stories.tsx'],
            reporter: ['text', 'html', 'json-summary'],
          },
        },
      },
      // Keyboard interaction specs re-run in a real browser — jsdom's
      // focus and key semantics differ from Chromium's, so the APG specs
      // must hold in both. Same files as the unit run, real DOM truth.
      {
        extends: true,
        test: {
          name: 'keyboard-browser',
          include: ['src/**/*.keyboard.test.tsx'],
          // Same runner, same reasoning as `unit` above.
          testTimeout: 20_000,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['./src/test-setup.ts'],
        },
      },
      // Storybook browser tests
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
})
