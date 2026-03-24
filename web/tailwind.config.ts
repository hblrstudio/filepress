import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: "#f5f5f7",
          card: "#ffffff",
          border: "#d1d1d6",
          accent: "#007aff",
          "accent-hover": "#0066d6",
          "accent-light": "#e5f0ff",
          text: "#1d1d1f",
          secondary: "#8e8e93",
          success: "#34c759",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
