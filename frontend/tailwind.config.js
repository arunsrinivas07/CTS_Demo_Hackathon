/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
        },
        brand: {
          blue: '#2563EB',
          darkBlue: '#1D4ED8',
          lightBlue: '#EFF6FF',
          teal: '#06B6D4',
          cyan: '#0891B2',
          bg: '#F8FAFC',
        },
        risk: {
          high: '#DC2626',
          highBg: '#FEF2F2',
          medium: '#F59E0B',
          mediumBg: '#FFFBEB',
          low: '#16A34A',
          lowBg: '#F0FDF4',
          critical: '#991B1B',
          criticalBg: '#FEE2E2',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
