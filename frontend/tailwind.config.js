/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1F2937",
          soft: "#4B5563",
        },
        canvas: "#F7F5F0",
        paper: "#FFFFFF",
        primary: {
          DEFAULT: "#0B4F6C",
          dark: "#083A50",
          light: "#DCE9EE",
        },
        accent: {
          DEFAULT: "#C98A2E",
          light: "#F3E3C8",
          dark: "#996515",
        },
        status: {
          approved: "#1E8E5A",
          "approved-bg": "#E4F4EC",
          pending: "#C77B21",
          "pending-bg": "#FBF0E1",
          rejected: "#B3261E",
          "rejected-bg": "#FAE7E6",
        },
      },
      fontFamily: {
        display: ["Tahoma", "Fraunces", "serif"],
        body: ["Tahoma", "Segoe UI", "Arial", "sans-serif"],
        sans: ["Tahoma", "Segoe UI", "Arial", "sans-serif"],
        mono: ["IBM Plex Mono", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
