/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Near-white canvas + paper surfaces
        canvas: "#fbfbfd",
        paper: "#ffffff",
        // Lavender-grey surface scale (tints, pills, placeholders)
        lav: {
          50: "#f6f5fb",
          100: "#eeedf6",
          200: "#e4e2f0",
          300: "#d7d4e9",
          400: "#bcb7da",
          500: "#9b95c6",
        },
        // Charcoal ink for actions / active states
        ink: "#272631",
        muted: "#807e8c",
        faint: "#b4b2c0",
        // Periwinkle accent — used sparingly
        accent: {
          DEFAULT: "#6f69ac",
          soft: "#cecae8",
          tint: "#edebf7",
        },
        line: "#ececf1",
        hair: "#f2f1f7",
      },
      fontFamily: {
        display: ['Fraunces', 'Iowan Old Style', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        label: "0.16em",
      },
      borderRadius: {
        xl2: "20px",
        xl3: "28px",
      },
      boxShadow: {
        panel: "0 1px 2px rgba(39,38,49,0.04), 0 18px 40px -24px rgba(39,38,49,0.22)",
        soft: "0 1px 2px rgba(39,38,49,0.04), 0 10px 24px -18px rgba(39,38,49,0.20)",
        lift: "0 2px 4px rgba(39,38,49,0.05), 0 24px 50px -26px rgba(39,38,49,0.28)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulse_dot: {
          "0%": { boxShadow: "0 0 0 0 rgba(25,163,107,0.45)" },
          "70%": { boxShadow: "0 0 0 7px rgba(25,163,107,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(25,163,107,0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.2,0.7,0.2,1) both",
        "pulse-dot": "pulse_dot 2.4s infinite",
      },
    },
  },
  plugins: [],
};
