import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Zinc palette matching Figma exactly
        'zinc-50': '#fafafa',
        'zinc-100': '#f4f4f5',
        'zinc-200': '#e4e4e7',
        'zinc-300': '#d4d4d8',
        'zinc-400': '#a1a1aa',
        'zinc-500': '#71717a',
        'zinc-600': '#52525b',
        'zinc-700': '#3f3f46',
        'zinc-800': '#27272a',
        'zinc-900': '#18181b',
        // App design tokens
        primary: '#18181b',
        surface: '#FFFFFF',
        muted: '#f4f4f5',
        border: '#f4f4f5',
        'border-mid': '#e4e4e7',
        'text-primary': '#18181b',
        'text-secondary': '#52525b',
        'text-muted': '#a1a1aa',
        // Status / accent
        'rose-figma': '#f43f5e',
        'rose-figma-bg': '#ffe4e6',
        // Figma tag colors
        'tag-indigo-bg': '#e0e7ff',
        'tag-indigo-text': '#4338ca',
        'tag-blue-bg': '#dbeafe',
        'tag-blue-text': '#1d4ed8',
        'tag-green-bg': '#d1fae5',
        'tag-green-text': '#047857',
        'tag-green2-bg': '#dcfce7',
        'tag-green2-text': '#15803d',
        'tag-red-bg': '#ffe4e6',
        'tag-red-text': '#be123c',
        'tag-orange-bg': '#ffedd5',
        'tag-orange-text': '#c2410c',
        'tag-teal-bg': '#ccfbf1',
        'tag-teal-text': '#0f766e',
        'tag-sky-bg': '#e0f2fe',
        'tag-sky-text': '#0369a1',
        'tag-purple-bg': '#eef2ff',
        'tag-purple-text': '#4338ca',
        // Legacy compatibility
        'accent-pink': '#FFB5C8',
        'accent-purple': '#C8B5FF',
        'accent-mint': '#B5FFD9',
        'status-open': '#22C55E',
        'status-closed': '#9CA3AF',
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
        '5xl': '48px',
        '6xl': '9999px',
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(0,0,0,0.08)',
        'card': '0px 8px 30px 0px rgba(0,0,0,0.04)',
        'card-sm': '0px 1px 2px 0px rgba(0,0,0,0.05)',
        'nav': '0px -10px 40px 0px rgba(0,0,0,0.03)',
        'fab': '0px 25px 50px -12px rgba(0,0,0,0.25)',
        'modal': '0px 25px 50px -12px rgba(0,0,0,0.25)',
        'btn': '0px 10px 15px -3px rgba(24,24,27,0.1), 0px 4px 6px -4px rgba(24,24,27,0.1)',
      },
      backdropBlur: {
        'header': '12px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}
export default config
