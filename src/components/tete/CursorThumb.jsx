"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// A text link that, while hovered, shows a medium thumbnail of a look
// floating beside the cursor (direct request 2026-10-02: "Pick up where we
// left off" in the welcome and the menu show that conversation's last
// generated image). The thumbnail eases after the pointer rather than
// sticking to it, tilts a touch with the direction of travel and blooms in
// from a blur — so it feels picked up, not pinned. One rAF loop only while
// hovering; nothing on touch screens or without an image. Rendered into
// <body> through a portal: the links live inside animated / depth-of-field
// filtered blocks, and a transform or filter on an ancestor would make
// `position: fixed` relative to that block instead of the viewport.
export default function CursorThumb({
  src,
  children,
  className = "",
  as: Tag = "button",
  ...props
}) {
  const thumbRef = useRef(null);
  const state = useRef({ x: 0, y: 0, tx: 0, ty: 0, raf: 0, on: false });
  const [shown, setShown] = useState(false);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    setCanHover(
      window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    );
    const s = state.current;
    return () => cancelAnimationFrame(s.raf);
  }, []);

  function loop() {
    const s = state.current;
    const el = thumbRef.current;
    if (!el) return;
    const dx = s.tx - s.x;
    s.x += dx * 0.18;
    s.y += (s.ty - s.y) * 0.18;
    const tilt = Math.max(-8, Math.min(8, dx * 0.12));
    // Above and to the right of the pointer, so it never covers the link.
    el.style.transform = `translate3d(${s.x + 26}px, ${s.y - 214}px, 0) rotate(${tilt.toFixed(2)}deg)`;
    if (s.on) s.raf = requestAnimationFrame(loop);
  }

  function enter(e) {
    if (!src || !canHover) return;
    const s = state.current;
    s.x = s.tx = e.clientX;
    s.y = s.ty = e.clientY;
    s.on = true;
    setShown(true);
    cancelAnimationFrame(s.raf);
    s.raf = requestAnimationFrame(loop);
  }
  function move(e) {
    state.current.tx = e.clientX;
    state.current.ty = e.clientY;
  }
  function leave() {
    state.current.on = false;
    setShown(false);
  }

  return (
    <>
      <Tag
        {...props}
        className={className}
        onPointerEnter={enter}
        onPointerMove={move}
        onPointerLeave={leave}
      >
        {children}
      </Tag>
      {src &&
        canHover &&
        createPortal(
          <span
            ref={thumbRef}
            aria-hidden="true"
            className="pointer-events-none fixed left-0 top-0 z-[70] block w-[150px]"
            style={{ transform: "translate3d(-999px,-999px,0)" }}
          >
            <span
              className={`block aspect-[4/5] overflow-hidden rounded-[16px] bg-[#f3eff8] shadow-[0_30px_60px_-24px_rgba(90,70,160,0.55),0_0_0_1px_rgba(43,38,51,0.05)] transition-[opacity,filter,transform] duration-300 ease-out ${
                shown
                  ? "scale-100 opacity-100 blur-0"
                  : "scale-90 opacity-0 blur-sm"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </span>
          </span>,
          document.body,
        )}
    </>
  );
}
