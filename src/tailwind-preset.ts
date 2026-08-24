/**
 * Arkite UI Tailwind CSS v4 preset (JS compat layer).
 *
 * Tailwind v4 uses CSS-first configuration. The recommended way to
 * consume Arkite UI is to import the CSS file:
 *
 *   @import "@arkite-ui/core/styles.css";
 *
 * If you need a JS config (e.g. for tooling or legacy compat),
 * you can reference this preset via the @config directive:
 *
 *   @config "@arkite-ui/core/tailwind";
 *
 * @deprecated Prefer importing the CSS file directly in Tailwind v4.
 */
const arkiteConfig = {
  darkMode: 'class' as const,
  content: [] as string[],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          soft: 'hsl(var(--destructive-soft))',
          'soft-foreground': 'hsl(var(--destructive-soft-foreground))',
          border: 'hsl(var(--destructive-border))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
          soft: 'hsl(var(--success-soft))',
          'soft-foreground': 'hsl(var(--success-soft-foreground))',
          border: 'hsl(var(--success-border))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
          soft: 'hsl(var(--warning-soft))',
          'soft-foreground': 'hsl(var(--warning-soft-foreground))',
          border: 'hsl(var(--warning-border))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
          soft: 'hsl(var(--info-soft))',
          'soft-foreground': 'hsl(var(--info-soft-foreground))',
          border: 'hsl(var(--info-border))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        'chart-1': 'hsl(var(--chart-1))',
        'chart-2': 'hsl(var(--chart-2))',
        'chart-3': 'hsl(var(--chart-3))',
        'chart-4': 'hsl(var(--chart-4))',
        'chart-5': 'hsl(var(--chart-5))',
        'status-online': 'hsl(var(--status-online))',
        'status-offline': 'hsl(var(--status-offline))',
        'status-busy': 'hsl(var(--status-busy))',
        'status-away': 'hsl(var(--status-away))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.18)',
        'sticky-left': '-2px 0 4px -2px rgb(0 0 0 / 0.1)',
        'sticky-header': '0 1px 0 0 hsl(var(--border))',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        fast: '100ms',
        normal: '150ms',
        slow: '300ms',
      },
    },
  },
  plugins: [],
}

export default arkiteConfig
