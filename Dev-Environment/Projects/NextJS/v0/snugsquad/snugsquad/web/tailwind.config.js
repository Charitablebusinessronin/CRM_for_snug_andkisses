/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { 
        sm: '640px', 
        md: '768px', 
        lg: '1024px', 
        xl: '1280px', 
        '2xl': '1536px' 
      },
    },
    extend: {
      colors: {
        background: '#d7c7ed', // brand-surface
        foreground: '#0f172a', // slate-900
        muted: '#f1f5f9', // slate-100
        border: '#e2e8f0', // slate-200
        ring: '#3b2352', // brand primary
        
        brand: {
          primary: '#3b2352',
          surface: '#d7c7ed',
          accent: '#d4af37',
          on: '#ffffff',
        },
        semantic: {
          bg: '#d7c7ed',
          fg: '#0f172a',
          muted: '#f1f5f9',
          border: '#e2e8f0',
          ring: '#3b2352',
          success: '#16A34A',
          warning: '#D97706',
          danger: '#DC2626',
        },
      },
      fontFamily: {
        heading: ['Merriweather', 'ui-serif', 'Georgia', 'serif'],
        body: ['Lato', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        ui: ['Nunito Sans', 'ui-sans-serif', 'system-ui'],
        script: ['Dancing Script', 'cursive'],
      },
      borderRadius: {
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        pill: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 12px -2px rgb(0 0 0 / 0.10)',
        focus: '0 0 0 3px rgb(59 35 82 / 0.4)', // brand ring
      },
      fontSize: {
        h1: ['3rem', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        h2: ['2.25rem', { lineHeight: '1.15', fontWeight: '700' }],
        h3: ['1.875rem', { lineHeight: '1.2', fontWeight: '700' }],
        h4: ['1.5rem', { lineHeight: '1.25', fontWeight: '600' }],
        h5: ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        h6: ['1.125rem', { lineHeight: '1.35', fontWeight: '600' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

