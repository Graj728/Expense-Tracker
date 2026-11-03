/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ledger: {
          bg: '#F5F6FB',         // page background, soft light lavender-grey
          shell: '#FFFFFF',      // header / surface white
          shellLight: '#F0F1F9', // hover state on light surfaces
          paper: '#FFFFFF',      // card background
          paperDark: '#F0F1F9',  // subtle card hover / secondary surface
          rule: '#E3E5F0',       // borders / dividers
          ink: '#1F2430',        // primary text
          inkFaint: '#6B7280',   // secondary text
          credit: '#0FA968',     // vibrant emerald — income
          creditDark: '#0B7F4F',
          debit: '#F0653E',      // vibrant coral — expense
          debitDark: '#C74A28',
          gold: '#F5A623',       // small accents / badges
          primary: '#5B5BD6',    // vibrant indigo — brand accent
          primaryDark: '#4645B0',
          primaryLight: '#EEEEFB'
        }
      },
      fontFamily: {
        display: ['Lora', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      borderRadius: {
        card: '1.25rem'
      }
    }
  },
  plugins: []
}
