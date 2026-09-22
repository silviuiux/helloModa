/** @type {import('tailwindcss').Config} */
// Design system — "organic intelligence" (2026-09-22 redesign, see
// docs/08-changelog.md). Dark-first warm canvas, one amber accent, a
// geometric sans for authority, an editorial serif for the looks
// themselves, mono for anything that behaves like data. Every color is a
// solid hex on purpose: the app leans on Tailwind opacity modifiers
// (`border-line/70`, `bg-accent-tint/70`), which only work on alpha-free
// values.
export default {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Warm near-black field + slightly lifted surfaces
        canvas: "#0f0e0c",
        paper: "#171512",
        ink: "#ece8e1",
        muted: "#9c968c",
        faint: "#625d55",
        // Single accent: industrial amber. `deep` is the brighter,
        // text-legible variant on dark; `soft` is for hairline borders;
        // `tint` is an amber-warmed surface (e.g. the user's own bubble).
        accent: {
          DEFAULT: "#d4a853",
          deep: "#e8c47a",
          soft: "#6e5a33",
          tint: "#231d14",
        },
        line: "#2a2621",
        hair: "#1c1a16",
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        // The look titles — was a handwritten script face; now an editorial
        // serif, the one soft/organic voice in an otherwise sharp system.
        script: ['"Instrument Serif"', "Georgia", "serif"],
        sans: ['"Plus Jakarta Sans"', "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        label: "0.16em",
      },
      maxWidth: {
        // The chat/wardrobe content column — see docs/09-conversation-design.md.
        content: "1160px",
      },
      borderRadius: {
        xl2: "16px",
        xl3: "24px",
        // Speaker corner, kept from the previous system but sharpened:
        // rounded everywhere except one near-square corner — bottom-left
        // when you speak, top-right when helloModa answers. Large surfaces.
        bubble: "28px 28px 28px 6px",
        "bubble-reply": "28px 6px 28px 28px",
        // Small elements (text bubbles, buttons, chips) — well under half
        // their height, so they read as rounded squares, not pills.
        "bubble-sm": "14px 14px 14px 4px",
        "bubble-reply-sm": "14px 4px 14px 14px",
      },
      boxShadow: {
        panel: "0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 60px -28px rgba(0,0,0,0.8)",
        soft: "0 1px 0 rgba(255,255,255,0.05) inset, 0 12px 30px -16px rgba(0,0,0,0.7)",
        lift: "0 1px 0 rgba(255,255,255,0.06) inset, 0 34px 70px -30px rgba(0,0,0,0.9)",
        glass: "0 1px 0 rgba(255,255,255,0.06) inset, 0 18px 50px -24px rgba(0,0,0,0.75)",
        glow: "0 0 0 1px rgba(212,168,83,0.35), 0 0 32px -6px rgba(212,168,83,0.45)",
      },
      keyframes: {
        // Everything "materializes" rather than slides — a small rise plus
        // a blur that resolves, which reads as organic without bouncing.
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)", filter: "blur(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)", filter: "blur(0)" },
        },
        "word-in": {
          "0%": { opacity: "0", filter: "blur(5px)", transform: "translateY(3px)" },
          "100%": { opacity: "1", filter: "blur(0)", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        // (The orb's morph/drift/breathe keyframes live in globals.css —
        // they're referenced from plain CSS, and Tailwind only emits
        // keyframes that some `animate-*` utility actually uses.)
        // Image-generation skeleton — a soft light sweep, never a spinner.
        shimmer: {
          "0%": { backgroundPosition: "-120% 0" },
          "100%": { backgroundPosition: "220% 0" },
        },
        pulse_dot: {
          "0%": { boxShadow: "0 0 0 0 rgba(212,168,83,0.5)" },
          "70%": { boxShadow: "0 0 0 7px rgba(212,168,83,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(212,168,83,0)" },
        },
        // Landing-page occasion marquee — the track renders its children
        // twice, so -50% lands exactly on the seam and loops invisibly.
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.2,0.7,0.2,1) both",
        "fade-in": "fade-in 0.6s ease both",
        "word-in": "word-in 0.55s cubic-bezier(0.2,0.7,0.2,1) both",
        shimmer: "shimmer 2.4s cubic-bezier(0.4,0,0.2,1) infinite",
        "pulse-dot": "pulse_dot 2.4s infinite",
        marquee: "marquee 90s linear infinite",
      },
    },
  },
  plugins: [],
};
