/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.tsx",
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1D4ED8",
        secondary: "#137DD3",
        black: "#454545",
        gray: "#ACACAC"
      },
      fontFamily: {
        poppins_medium: ["poppins_medium"],
        poppins_regular: ["poppins_regular"],
        poppins_semibold: ["poppins_semibold"],
      }
    },
  },
  plugins: [],
}
