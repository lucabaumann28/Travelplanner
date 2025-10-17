import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#0A84FF",
        ink: "#1D1D1F",
        cloud: "#F5F5F7",
      },
      maxWidth: {
        "6xl": "72rem",
      },
      boxShadow: {
        glow: "0 25px 70px -35px rgba(10, 132, 255, 0.55)",
        card: "0 35px 90px -60px rgba(15, 23, 42, 0.45)",
        inner: "inset 0 1px 0 rgba(255,255,255,0.6)",
      },
      borderRadius: {
        xl2: "1.75rem",
      },
      backdropBlur: {
        apple: "28px",
      },
    },
  },
  plugins: [typography],
};

export default config;
