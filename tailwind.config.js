/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Geist'", "system-ui", "sans-serif"],
        mono: ["'Geist Mono'", "monospace"],
      },
      colors: {
        ink: {
          50:  "#f5f4f0",
          100: "#eae8e0",
          200: "#d4d0c4",
          300: "#b8b3a0",
          400: "#96907a",
          500: "#7a7462",
          600: "#635e4e",
          700: "#504b3e",
          800: "#3c382e",
          900: "#28251e",
          950: "#141210",
        },
        accent: {
          DEFAULT: "#c84b31",
          light: "#e8604a",
          dark: "#a63a24",
        },
        done:  "#2d6a4f",
        maybe: "#b5700a",
        no:    "#9b2226",
      },
    },
  },
  plugins: [],
};
