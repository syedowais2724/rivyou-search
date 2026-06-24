/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#5B4FE8",
        accent: "#FF6B35",
        surface: "#F0F4FF",
        cardbg: "#FFFFFF",
        textprimary: "#1A1040",
        textmuted: "#6B7280",
        success: "#10B981",
        tagpill: {
          bg: "#EEF2FF",
          text: "#5B4FE8",
        },
        tier1: {
          bg: "#D1FAE5",
          text: "#065F46",
        },
        tier2: {
          bg: "#FEF3C7",
          text: "#92400E",
        },
        tier3: {
          bg: "#EDE9FE",
          text: "#5B21B6",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Space Grotesk", "sans-serif"],
      }
    },
  },
  plugins: [],
}
