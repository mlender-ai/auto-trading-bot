/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // 타로 앱 브랜드 컬러 (어두운 신비로운 톤)
        brand: {
          bg:      "#0a0a0f",
          surface: "#13131a",
          card:    "#1c1c28",
          border:  "#2a2a3d",
          accent:  "#7c5cbf",
          gold:    "#c9a84c",
          text:    "#e8e8f0",
          muted:   "#8888aa",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
