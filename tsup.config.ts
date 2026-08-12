import { defineConfig, type Options } from 'tsup'

const shared: Partial<Options> = {
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  external: [
    'react',
    'react-dom',
    'zustand',
    'lucide-react',
    'framer-motion',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-popover',
    '@radix-ui/react-tooltip',
    '@tanstack/react-virtual',
    'cmdk',
  ],
}

// No `clean` here: tsup runs array configs in parallel (Promise.all), so one
// config's clean can race the other's already-written output and wipe it.
// The build script runs `pnpm run clean` before tsup instead.
export default defineConfig([
  // Component entries — RSC client modules, so they carry the banner.
  {
    ...shared,
    entry: {
      index: 'src/index.ts',
      motion: 'src/motion.ts',
    },
    banner: { js: '"use client";' },
  },
  // Pure-data entries — server-safe by design. A "use client" banner here
  // would turn token values into client references and break Server
  // Component imports (`import { colors } from '@arkite-ui/core/tokens'`).
  {
    ...shared,
    entry: {
      'tailwind-preset': 'src/tailwind-preset.ts',
      tokens: 'src/tokens/index.ts',
      // Theme generation without the component library: the `theme apply`
      // CLI and any build script need createTheme/themeToCSS in plain Node,
      // where importing the React entry would need react resolvable.
      theme: 'src/theme/index.ts',
    },
  },
])
