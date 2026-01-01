/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#f8fafc",
        foreground: "#0f172a",

        card: "#ffffff",
        border: "#e2e8f0",

        primary: "#0ea5e9",
        "primary-foreground": "#ffffff",

        accent: "#f97316",
        "accent-foreground": "#ffffff",

        muted: "#f1f5f9",
        "muted-foreground": "#64748b",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
