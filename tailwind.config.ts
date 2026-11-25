import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "media",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#FAF6EE",
        parchment: "#F1E9DA",
        navy: {
          DEFAULT: "#0F1D3A",
          deep: "#091226",
          soft: "#1B2E56",
        },
        saffron: {
          DEFAULT: "#D96B27",
          light: "#F2994A",
          dark: "#B45318",
        },
        brass: {
          DEFAULT: "#B88A2E",
          light: "#E6C265",
        },
        crimson: "#9B2226",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
      },
      boxShadow: {
        editorial: "0 18px 50px -20px rgba(15, 29, 58, 0.16)",
        crest: "0 24px 60px -18px rgba(15, 29, 58, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
