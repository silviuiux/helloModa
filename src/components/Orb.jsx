// helloModa's presence — an organic, always-moving body inside a crisp
// geometric ring. Pure CSS (globals.css `.orb*`), no canvas/WebGL and no
// animation library: it's decoration, so it has to be close to free.
//
// state: "idle" (slow breathing), "listening" (the user is typing — swells
// and the ring brightens), "thinking" (a reply or image is being made —
// tightens, brightens, an inner ripple surfaces). State changes only touch
// transitionable properties, so moving between them is a smooth blend,
// never a jump. `mini` drops the ring/halo detail for inline sizes.
export default function Orb({ size = 96, state = "idle", mini = false, className = "" }) {
  return (
    <div
      className={`orb ${mini ? "orb--mini" : ""} ${className}`}
      data-state={state}
      style={{ "--orb-size": `${size}px` }}
      aria-hidden="true"
    >
      <div className="orb__halo" />
      <div className="orb__ring" />
      <div className="orb__body">
        <div className="orb__blob orb__blob--a" />
        <div className="orb__blob orb__blob--b" />
        <div className="orb__ripple" />
      </div>
    </div>
  );
}
