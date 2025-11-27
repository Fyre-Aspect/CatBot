/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ChatGPT color palette
        'gpt-dark': {
          DEFAULT: '#212121',
          sidebar: '#171717',
          hover: '#2f2f2f',
          border: '#343434',
          input: '#303030',
        },
        'gpt-gray': {
          DEFAULT: '#676767',
          light: '#b4b4b4',
          lighter: '#ececec',
        },
      },
      fontFamily: {
        sans: ['Söhne', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Ubuntu', 'Cantarell', 'Noto Sans', 'sans-serif'],
      },
      fontSize: {
        'gpt': ['1rem', '1.5rem'],
      },
      maxWidth: {
        'chat': '48rem',
      },
      animation: {
        'pulse-dot': 'pulse-dot 1.4s ease-in-out infinite',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 80%, 100%': { opacity: '0' },
          '40%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
