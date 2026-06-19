// Lightweight inline icon set — stroke-based, 1.6 weight, inherits currentColor.
// Keeps the bundle dependency-free and the look consistent.
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Svg({ size = 18, children, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...rest}>
      {children}
    </svg>
  );
}

export const Sparkle = (p) => (
  <Svg {...p}>
    <path d="M12 3.5c.4 3.1 1.4 4.1 4.5 4.5-3.1.4-4.1 1.4-4.5 4.5-.4-3.1-1.4-4.1-4.5-4.5 3.1-.4 4.1-1.4 4.5-4.5Z" />
    <path d="M18 14.5c.2 1.6.7 2.1 2.3 2.3-1.6.2-2.1.7-2.3 2.3-.2-1.6-.7-2.1-2.3-2.3 1.6-.2 2.1-.7 2.3-2.3Z" />
  </Svg>
);

export const Chat = (p) => (
  <Svg {...p}>
    <path d="M4 5.5h16v10H9l-4 3.5V15.5H4z" />
    <path d="M8 9.5h8M8 12h5" />
  </Svg>
);

export const Hanger = (p) => (
  <Svg {...p}>
    <path d="M12 5.2a1.8 1.8 0 1 1 1.4 2.9c-.9.2-1.4.7-1.4 1.6" />
    <path d="M12 9.7 4 15.2c-.9.6-.5 2 .6 2h14.8c1.1 0 1.5-1.4.6-2L12 9.7Z" />
  </Svg>
);

export const Dress = (p) => (
  <Svg {...p}>
    <path d="M9.5 3.5 12 6l2.5-2.5" />
    <path d="M9.5 3.5 8 8l2 1.5L8.5 14M14.5 3.5 16 8l-2 1.5 1.5 4.5" />
    <path d="M8.5 14c-1 3-1.5 4.8-1.5 6h10c0-1.2-.5-3-1.5-6" />
  </Svg>
);

export const Shirt = (p) => (
  <Svg {...p}>
    <path d="M8.5 4 5 6.5 6.5 9 8 8v11h8V8l1.5 1L19 6.5 15.5 4l-1.5 1.2a3 3 0 0 1-4 0L8.5 4Z" />
  </Svg>
);

export const Bag = (p) => (
  <Svg {...p}>
    <path d="M6 8h12l-1 11H7L6 8Z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  </Svg>
);

export const Shoe = (p) => (
  <Svg {...p}>
    <path d="M3 9c1.4 0 2.2.7 3 1.6.9 1 1.8 1.4 3.4 1.7 1.6.3 3.1.5 5.1 1.4 1.8.8 3.2 1.1 4.5 1.1 1 0 1.5.5 1.5 1.2v1H3V9Z" />
    <path d="M3 9c.6 1 1.3 1.5 2 1.6" />
  </Svg>
);

export const Sliders = (p) => (
  <Svg {...p}>
    <path d="M4 8h10M18 8h2M4 16h2M10 16h10" />
    <circle cx="16" cy="8" r="2" />
    <circle cx="8" cy="16" r="2" />
  </Svg>
);

export const ArrowRight = (p) => (
  <Svg {...p}>
    <path d="M5 12h13M13 6l6 6-6 6" />
  </Svg>
);

export const Plus = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const Rain = (p) => (
  <Svg {...p}>
    <path d="M7 14a4 4 0 0 1-.4-8A5 5 0 0 1 16 6.5 3.5 3.5 0 0 1 17 13.4" />
    <path d="M8 17l-1 2M12 17l-1 2M16 17l-1 2" />
  </Svg>
);

export const Bookmark = (p) => (
  <Svg {...p}>
    <path d="M7 4h10v16l-5-3.5L7 20V4Z" />
  </Svg>
);

export const Search = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);

export const Heart = (p) => (
  <Svg {...p}>
    <path d="M12 20s-7-4.3-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7c0 5-7 9.3-7 9.3Z" />
  </Svg>
);

export const Dots = (p) => (
  <Svg {...p}>
    <circle cx="6" cy="12" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="18" cy="12" r="1" />
  </Svg>
);

export const Check = (p) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Svg>
);

export const Refresh = (p) => (
  <Svg {...p}>
    <path d="M5 8.5h5v-5" />
    <path d="M5 8.5 7.6 6A7 7 0 1 1 5.6 14" />
  </Svg>
);

export const Sun = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
  </Svg>
);
