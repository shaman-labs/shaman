import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0D1117',
        foreground: '#A3F7BF',
        card: {
          DEFAULT: '#161B22',
          foreground: '#A3F7BF',
        },
        popover: {
          DEFAULT: '#1A1F26',
          foreground: '#A3F7BF',
        },
        primary: {
          DEFAULT: '#77DD77',
          foreground: '#0D1117',
        },
        secondary: {
          DEFAULT: '#1B3A34',
          foreground: '#A3F7BF',
        },
        accent: {
          DEFAULT: '#1B3A34',
          foreground: '#A3F7BF',
        },
        muted: {
          DEFAULT: '#121417',
          foreground: '#A3F7BF',
        },
        destructive: {
          DEFAULT: '#D05C5C',
          foreground: '#0D1117',
        },
        border: '#4C665A',
        input: '#1A1F26',
        ring: '#A3F7BF',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: '#161B22',
          foreground: '#A3F7BF',
          primary: '#1B3A34',
          'primary-foreground': '#A3F7BF',
          accent: '#2A4F4A',
          'accent-foreground': '#A3F7BF',
          border: '#4C665A',
          ring: '#A3F7BF',
        },
      },
      borderRadius: {
        lg: '0.25rem',
        md: '0.2rem',
        sm: '0.1rem',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        subtle: '0 0 8px rgba(163, 247, 191, 0.2)',
        focused: '0 0 12px rgba(163, 247, 191, 0.4)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
