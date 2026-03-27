/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0ea5e9',
          secondary: '#0284c7',
          gold: '#f59e0b',
          'gold-muted': '#9a7b2c',
          background: 'var(--bg-main)',
          surface: 'var(--bg-surface)',
          border: 'var(--border-main)',
        },
        uni: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        accent: {
          light: '#fbbf24',
          default: '#f59e0b',
        },
        prestige: {
          gold: '#fbbf24',
          slate: '#475569',
        },
        honor: {
          blue: '#0ea5e9',
        },
        'bg-main': 'var(--bg-main)',
        'bg-surface': 'var(--bg-surface)',
        'bg-elevated': 'var(--bg-elevated)',
        'border-main': 'var(--border-main)',
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        'text-header': 'var(--text-header)',
        'glass-bg': 'var(--glass-bg)',
        'glass-border': 'var(--glass-border)',
        'input-bg': 'var(--input-bg)',
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "System-ui", "Segoe UI", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { borderColor: 'rgba(14, 165, 233, 0.2)' },
          '100%': { borderColor: 'rgba(14, 165, 233, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out alternate infinite',
        shimmer: 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [
    ({ addBase, addUtilities, addVariant, theme }) => {
      addUtilities({
        '.border-border': {
          borderColor: "var(--border)",
        },
        '.outline-ring': {
          outlineColor: "var(--ring)",
        },
      })
      
      // Base UI Data Variants
      addVariant('data-open', '&[data-state="open"]')
      addVariant('data-closed', '&[data-state="closed"]')
      addVariant('data-active', '&[data-state="active"]')
      addVariant('data-horizontal', '&[data-orientation="horizontal"]')
      addVariant('data-vertical', '&[data-orientation="vertical"]')
      addVariant('data-placeholder', '&[data-placeholder]')
      addVariant('data-disabled', '&[data-disabled]')
      
      // Group variants for scoped components
      addVariant('group-data-horizontal', ':merge(.group)[data-orientation="horizontal"] &')
      addVariant('group-data-vertical', ':merge(.group)[data-orientation="vertical"] &')
      addVariant('group-data-active', ':merge(.group)[data-state="active"] &')
    }
  ],
}
