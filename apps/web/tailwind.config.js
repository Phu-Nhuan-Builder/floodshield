/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        flood: {
          low: "#FFF176",
          medium: "#FFB300",
          high: "#F44336",
          critical: "#B71C1C",
          safe: "#4CAF50",
        },
        mekong: {
          blue: "#1565C0",
          teal: "#00695C",
          mud: "#795548",
        },
      },
      fontFamily: {
        sans: ["Be Vietnam Pro", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "flood-wave": "floodWave 2s ease-in-out infinite",
      },
      keyframes: {
        floodWave: {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
