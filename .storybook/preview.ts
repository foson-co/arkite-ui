import type { Preview } from '@storybook/react-vite'
import { create } from 'storybook/theming'
import '../src/styles/index.css'
import { themePresets, applyTheme, applyDarkTheme, type ThemePresetName } from '../src/theme'

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Theme preset (design tokens)',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: (Object.keys(themePresets) as ThemePresetName[]).map((name) => ({
          value: name,
          title: name.charAt(0).toUpperCase() + name.slice(1),
        })),
        dynamicTitle: true,
      },
    },
    mode: {
      description: 'Color mode',
      toolbar: {
        title: 'Mode',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'default',
    mode: 'light',
  },
  decorators: [
    (Story, context) => {
      const themeName = context.globals.theme as ThemePresetName
      const preset = themePresets[themeName] ?? themePresets.default
      const dark = context.globals.mode === 'dark'
      document.documentElement.classList.toggle('dark', dark)
      if (dark) {
        applyDarkTheme(preset)
      } else {
        applyTheme(preset)
      }
      return Story()
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'error-based',
    },
    docs: {
      theme: create({
        base: 'light',
        fontBase: '"Inter", system-ui, -apple-system, sans-serif',
        fontCode: '"JetBrains Mono", ui-monospace, monospace',
        colorPrimary: '#6a4dff',
        colorSecondary: '#6a4dff',
        textColor: '#16181d',
      }),
    },
    layout: 'centered',
    options: {
      storySort: {
        order: [
          'Introduction',
          'Getting Started',
          'Recipes',
          'Accessibility',
          'Component Guidelines',
          'Foundation',
          'Form Patterns',
          'Primitives',
          'Form',
          'Layout',
          'Navigation',
          'Data Display',
          'Overlay',
          'Feedback',
          '*',
        ],
      },
    },
  },
  tags: ['autodocs'],
}

export default preview
