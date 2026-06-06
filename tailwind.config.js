/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // 프리미엄 미니멀 디자인을 위한 세련된 다크/라이트 톤앤매너
        brand: {
          light: "#6366f1", // Indigo
          DEFAULT: "#4f46e5",
          dark: "#4338ca",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.slate.700"),
            a: {
              color: theme("colors.brand.DEFAULT"),
              "&:hover": {
                color: theme("colors.brand.dark"),
              },
            },
          },
        },
      }),
    },
  },
  plugins: [],
};
