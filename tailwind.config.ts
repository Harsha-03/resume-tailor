import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        editorial: ["var(--font-editorial)", "serif"],
      },
      colors: {
        ink: {
          base: "#0a0a0a",
          elevated: "#131312",
          surface: "rgba(245, 241, 232, 0.04)",
        },
        bone: {
          DEFAULT: "#f5f1e8",
          muted: "#a8a39a",
          dim: "#6b6760",
        },
        clay: {
          DEFAULT: "#d97757",
          soft: "rgba(217, 119, 87, 0.12)",
          glow: "rgba(217, 119, 87, 0.25)",
          deep: "#c4623f",
        },
        moss: "#6ba577",
        sand: "#d4a373",
        rust: "#c47e6e",
      },
    },
  },
  plugins: [],
};

export default config;
