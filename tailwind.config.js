/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx}"],
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
        // Purple-tinted ink for text (softened)
        ink: "#34304a",
        muted: "#8c89a0",
        faint: "#b2afc0",
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
        script: ['"Yuyu Short"', 'cursive'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        label: "0.16em",
      },
      maxWidth: {
        // The chat/wardrobe content column — see docs/09-conversation-design.md.
        content: "1160px",
      },
      borderRadius: {
        xl2: "20px",
        xl3: "28px",
        // Chat "speech bubble" corner: rounded everywhere except the
        // bottom-left, which stays square as a tail/anchor point. For
        // LARGE surfaces only — photos, hero images, big cards (roughly
        // 250px+ tall) — where 128px is comfortably under half the box and
        // reads as a deliberate large rounded corner.
        bubble: "128px 128px 128px 0px",
        // Same idea, mirrored: square top-right instead. Large surfaces
        // only, same reasoning as `bubble`.
        "bubble-reply": "128px 0px 128px 128px",
        // Small-element version of the same shape: text bubbles, buttons,
        // chips (roughly 30-90px tall). 128px on something that short gets
        // clamped to exactly half its height, which is a full semicircle —
        // it reads as a pill/circle, not a rounded square (caught
        // 2026-09-22, direct request). 14px stays visibly less than half
        // the height of even the smallest chip in the app (~32px), so the
        // corner is a deliberate small curve, not a clamp artifact.
        "bubble-sm": "14px 14px 14px 0px",
        "bubble-reply-sm": "14px 0px 14px 14px",
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
        // Landing-page occasion marquee — the track renders its children
        // twice, so -50% lands exactly on the seam and loops invisibly.
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.2,0.7,0.2,1) both",
        "pulse-dot": "pulse_dot 2.4s infinite",
        marquee: "marquee 90s linear infinite",
      },
    },
  },
  plugins: [],
};
