import OrganicField from "./OrganicField.jsx";

// Design exploration (branch design/chat-aurora-minimal): the "modern
// minimalist + organic animated elements" atmosphere for the chat page.
// Two layers, both fixed and pointer-transparent:
//   1. Four large, very soft blurred colour blooms (globals.css's
//      "AURORA MINIMAL" section) that drift slowly — the "organic animated
//      elements" the background is built from.
//   2. OrganicField's existing wandering-cell/rising-spore/filament system,
//      re-tuned to the same multi-hue palette (`palette="aurora"`) — the
//      floating particles kept from the reference mood boards.
// Scoped to this one page: mount it inside a container with the
// `aurora-canvas` class (or just drop it in — the blobs are `fixed`
// regardless of where they're mounted) rather than touching `.app-canvas`,
// so the rest of the app's look is untouched while this is evaluated.
export default function AuroraBackground() {
  return (
    <div aria-hidden="true">
      <div className="aurora-canvas__blob aurora-canvas__blob--blush" />
      <div className="aurora-canvas__blob aurora-canvas__blob--lavender" />
      <div className="aurora-canvas__blob aurora-canvas__blob--sky" />
      <div className="aurora-canvas__blob aurora-canvas__blob--mint" />
      <OrganicField variant="page" palette="aurora" />
    </div>
  );
}
