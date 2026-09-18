import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "'DM Sans'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["var(--font-display)", "'Space Grotesk'", "sans-serif"],
        serif: ["var(--font-serif)", "'Instrument Serif'", "Georgia", "serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: "#faf9f6",
        surface: "#ffffff",
        subtle: "#f5f4ef",
        ink: {
          950: "#11100f",
          900: "#1c1a17",
          800: "#2b2824",
          700: "#44403a",
          500: "#787268",
          400: "#a39e94",
        },
        border: "rgba(28, 26, 23, 0.08)",
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
      },
      borderRadius: {
        "xl": "0.75rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        "soft-sm": "0 1px 2px rgba(28, 26, 23, 0.03), 0 1px 3px rgba(28, 26, 23, 0.02)",
        "soft-md": "0 6px 20px -3px rgba(28, 26, 23, 0.05), 0 2px 6px -1px rgba(28, 26, 23, 0.02)",
        "soft-lg": "0 14px 34px -4px rgba(28, 26, 23, 0.06), 0 4px 12px -2px rgba(28, 26, 23, 0.02)",
        "card": "0 0 0 1px rgba(28, 26, 23, 0.06), 0 2px 6px rgba(28, 26, 23, 0.02)",
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.025em",
        normal: "0em",
        wide: "0.025em",
        wider: "0.05em",
      },
    },
  },
  plugins: [],
};

export default config;
