import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'arton-ruby': '#B91C1C',
        'valkyr-gold': '#D4AF37',
        'mana-sapphire': '#2563EB',
        'parchment-base': '#FDFBF7',
        'tabletop-slate': '#0F172A',
        'nat20-emerald': '#16A34A',
        'nat1-fumble': '#DC2626',
        arton: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
          950: '#450A0A',
        },
        gold: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D4AF37', // Valkyr Gold
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        mana: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        parchment: {
          light: '#FDFBF7',
          DEFAULT: '#F7F2E7',
          dark: '#EADBBA',
          border: '#D5C4A1',
        },
        tabletop: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#090D16',
        },
      },
      fontFamily: {
        serif: ['var(--font-cinzel)', 'Cinzel', 'Georgia', 'Cambria', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'fantasy-card': '0 4px 20px -2px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(212, 175, 55, 0.25)',
        'fantasy-active': '0 0 15px 2px rgba(212, 175, 55, 0.45)',
        'crit-glow': '0 0 16px 2px rgba(34, 197, 94, 0.5)',
        'fumble-glow': '0 0 16px 2px rgba(239, 68, 68, 0.5)',
      },
      backgroundImage: {
        'parchment-pattern': 'radial-gradient(#e2d5bc 1px, transparent 1px)',
        'vtt-grid':
          'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};

export default config;
