// helloModa's presence — an organic, always-moving body inside a crisp
// geometric instrument. Pure CSS (globals.css `.orb*`), no canvas/WebGL and
// no animation library: it's decoration, so it has to be close to free.
//
// Layers, outside in:
//   dial      — a slow-turning ring of fine tick marks (the "instrument")
//   ring      — the 1px geometric boundary, with two orbiting satellites
//   pulses    — concentric rings that ripple outward while it's working
//   shape     — carries the state scale/filter (never the clipping element,
//               see globals.css for why)
//     body    — the morphing, clipped blob: three drifting colour fields,
//               contour "veins", an inner ripple, grain and a specular gloss
//
// state: "idle" (slow breathing), "listening" (the user is typing — swells
// and the ring brightens), "thinking" (a reply or image is being made —
// tightens, brightens, pulses surface). State changes only touch
// transitionable properties, so moving between them is a smooth blend,
// never a jump. `mini` keeps just the living body for inline sizes.
export default function Orb({ size = 96, state = "idle", mini = false, className = "" }) {
  return (
    <div
      className={`orb ${mini ? "orb--mini" : ""} ${className}`}
      data-state={state}
      style={{ "--orb-size": `${size}px` }}
      aria-hidden="true"
    >
      <div className="orb__halo" />
      {!mini && (
        <>
          <div className="orb__dial" />
          <div className="orb__pulses">
            <span />
            <span />
            <span />
          </div>
          <div className="orb__ring">
            <div className="orb__orbit orb__orbit--a">
              <span className="orb__satellite" />
            </div>
            <div className="orb__orbit orb__orbit--b">
              <span className="orb__satellite orb__satellite--small" />
            </div>
          </div>
        </>
      )}
      <div className="orb__shape">
        <div className="orb__body">
          <div className="orb__blob orb__blob--a" />
          <div className="orb__blob orb__blob--b" />
          <div className="orb__blob orb__blob--c" />
          {!mini && <div className="orb__veins" />}
          <div className="orb__ripple" />
          {!mini && <div className="orb__grain" />}
          <div className="orb__gloss" />
        </div>
      </div>
    </div>
  );
}
