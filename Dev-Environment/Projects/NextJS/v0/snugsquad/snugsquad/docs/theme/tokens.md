# Design Tokens — Snug & Kisses CRM (Phase 1)

Goal: Unify color tokens and typography for Tailwind.
Sources: `PLANNING.md` brand section + local sign-in UI at http://localhost:5369/auth/signin.
Timestamp: 2025-08-20 01:40 ET

## Brand Palette
- Primary (plum): `#3B2352`
- Surface (lavender): `#D7C7ED`
- Accent (gold): `#D4AF37`
- On-Primary / White: `#FFFFFF`
- Neutrals: Tailwind slate/stone for chrome, borders, backgrounds
- Status:
  - Success: `#16A34A`
  - Warning: `#D97706`
  - Danger:  `#DC2626`

Notes:
- Primary on white meets contrast for headings and CTAs.
- Avoid large text blocks on pure primary; prefer surface or neutral bg with primary accents.

## Typography
- Headings: `Merriweather, ui-serif, Georgia, serif`
- Body: `Lato, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
- UI Controls: `"Nunito Sans", ui-sans-serif, system-ui`
- Accent Script (quotes only): `"Dancing Script", cursive`

Suggested scale (rem):
- h1 3.0/3.25/3.5 leading-[1.1]
- h2 2.25/2.5 leading-[1.15]
- h3 1.875 leading-[1.2]
- h4 1.5 leading-[1.25]
- h5 1.25 leading-[1.3]
- h6 1.125 leading-[1.35]
- body base 1.0 (16px), sm 0.875, xs 0.75

## Radii
- md: 0.5rem
- lg: 0.75rem
- xl: 1rem
- pill: 9999px

## Shadows
- sm: subtle elevation for cards
- md: card hover
- focus: brand-colored ring for focus-visible

## Spacing & Container
- Use Tailwind defaults; container centered with 1rem padding and responsive max widths.

## Tailwind — theme extend (proposed)

This is an excerpt for `tailwind.config.ts`. Troy: please integrate and adjust as needed.

```ts
// tailwind.config.ts (excerpt)
import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config: Config = {
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
    },
    extend: {
      colors: {
        brand: {
          primary: '#3B2352', // plum
          surface: '#D7C7ED', // lavender
          accent: '#D4AF37', // gold
          on: '#FFFFFF', // on-primary/white
        },
        semantic: {
          bg: '#FFFFFF',
          fg: '#0F172A', // slate-900
          muted: '#F1F5F9', // slate-100
          border: '#E2E8F0', // slate-200
          ring: '#3B2352',
          success: '#16A34A',
          warning: '#D97706',
          danger: '#DC2626',
        },
      },
      fontFamily: {
        heading: ['Merriweather', 'ui-serif', 'Georgia', 'serif'],
        body: ['Lato', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        ui: ['"Nunito Sans"', 'ui-sans-serif', 'system-ui'],
        script: ['"Dancing Script"', 'cursive'],
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
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('hocus', ['&:hover', '&:focus-visible'])
    }),
  ],
}

export default config
```

## Usage Guidance
- Buttons: primary bg `brand.primary`, text `brand.on`, hover use `shadow-md` and `hocus:shadow-md`.
- Cards: bg `semantic.bg` or `brand.surface` (sparingly), border `semantic.border`, text `semantic.fg`.
- Focus: use `ring-2` with `ring-[color:theme('semantic.ring')]` or `shadow-focus`.
- Quotes: use `font-script` for featured testimonials only; never in body copy.

## Handoff
- File: `docs/theme/tokens.md`
- Ready for: Tailwind config integration in Next.js scaffold.
- Blockers: None from design side. Awaiting Troy’s confirmation before component work.
