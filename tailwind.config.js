/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Light lavender-gray field + paper surfaces
        canvas: "#efedf4",
        paper: "#ffffff",
        // Lavender surface scale (tints, pills, placeholders)
        lav: {
          50: "#f6f4fb",
          100: "#efedf4",
          200: "#e6e2f1",
          300: "#d8d2ec",
          400: "#c3b8e6",
          500: "#a789f4",
        },
        // Purple-tinted ink for text
        ink: "#2b2840",
        muted: "#7c7990",
        faint: "#aaa6bd",
        // Purple accent — primary actions + CTAs
        accent: {
          DEFAULT: "#a789f4",
          deep: "#8c6ae2",
          soft: "#cdbef7",
          tint: "#ece6fb",
        },
        line: "#e7e3f1",
        hair: "#f0edf7",
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
        panel: "0 1px 2px rgba(43,40,64,0.04), 0 18px 44px -22px rgba(43,40,64,0.26)",
        soft: "0 1px 2px rgba(43,40,64,0.04), 0 10px 26px -16px rgba(43,40,64,0.22)",
        lift: "0 2px 4px rgba(43,40,64,0.05), 0 30px 60px -26px rgba(43,40,64,0.34)",
        glass: "0 14px 44px -18px rgba(43,40,64,0.30), inset 0 1px 0 rgba(255,255,255,0.7)",
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
