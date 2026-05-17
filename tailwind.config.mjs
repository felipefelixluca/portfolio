/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte,md,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A',
        paper: '#F4F1EA',
        rule: '#1A1A1A',
        bauhaus: {
          red: '#E2231A',
          yellow: '#FFCC00',
          blue: '#002FA7',
        },
        muted: '#5C5C5C',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Bauhaus-flavored type scale, tight tracking on display
        'display-2xl': ['clamp(3.5rem, 8vw, 6.5rem)', { lineHeight: '0.92', letterSpacing: '-0.02em' }],
        'display-xl': ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '0.95', letterSpacing: '-0.015em' }],
        'display-lg': ['clamp(1.875rem, 3.5vw, 2.75rem)', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
        'eyebrow': ['0.75rem', { lineHeight: '1', letterSpacing: '0.18em' }],
      },
      borderRadius: {
        none: '0',
        DEFAULT: '0',
      },
      maxWidth: {
        page: '1280px',
        prose: '68ch',
      },
      spacing: {
        rule: '1px',
        'rule-2': '2px',
      },
    },
  },
  plugins: [],
};
