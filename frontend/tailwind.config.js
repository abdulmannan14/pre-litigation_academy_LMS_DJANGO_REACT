/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D9A08A',
        secondary: '#A55850',
        secondaryDark: '#7D3830',
        accent: '#EBB8B3',
        accentLight: '#F7EBE8',
        background: '#FAF6F4',
        textDark: '#111111',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
