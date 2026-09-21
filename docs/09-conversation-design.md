# helloModa — Conversation & Layout Design Rules

The governing spec for how the chat experience behaves and looks. Established
2026-09-19 from XD mockups, replacing the earlier multi-card recommendation
grid. **When behavior needs to change, update this doc and the corresponding
code together** — the two authoritative code locations are:

- `src/lib/stylist.js` — the schema/system prompt governing what the AI returns
- `src/components/chat/*` — how a turn renders

## Core rule: one outfit direction per turn

Each assistant turn is a single, focused outfit recommendation — not a grid of
interchangeable product cards. A turn has:

1. **Title** — a short (1–4 word) evocative phrase, e.g. "Vineyard wedding,"
   "Chic direction," "West coast ease." Rendered in a script/handwritten
   display face (`font-script`, currently **Mr De Haviland**, free on Google
   Fonts, swapped 2026-09-21 from an earlier Bonheur Royale stand-in by
   direct request — swap the `script` token in `tailwind.config.js` again if
   the brand face ever changes), large, as the turn's visual anchor. This is
   the *only* place the script face is used now — the "thinking" line
   (below) was moved to the body font 2026-09-21, since a cursive face reads
   badly at small status-text sizes.
2. **Narrative** — 2–4 sentences, editorial voice, explaining the direction
   and why it answers the occasion/mood/constraint the user gave.
3. **Hero visual** — one image representing the outfit in its setting, laid
   out **beside** the title/narrative in a two-column split (`sm:grid-cols-2`
   in `MessageBubble.jsx`) — image left, content right. Collapses to a
   single stacked column below the `sm` breakpoint. **Real photorealistic
   generation, shipped 2026-09-20** (`OutfitHero.jsx` → `POST
   /api/generate-image` → Replicate, `src/lib/imageGen.js`) — the turn's
   title/narrative/pieces render immediately from the chat response, then
   generation kicks off via the `useOutfitImage` hook
   (`src/lib/useOutfitImage.js`, split out of `OutfitHero.jsx` 2026-09-21).
   **While generating, `ThinkingLine` shows in the text column** (below the
   narrative) instead of a badge inside the image box — the whole
   image+actions row stays hidden until generation settles (ready or
   failed), then reveals at once. Generated images are cached (Storage +
   `outfit_recommendations.generated_image_url`), so revisiting a turn or an
   older conversation never re-generates — it just loads the cached one.
   Aspect ratio is **3:2 landscape**, set to match on both sides
   (`imageGen.js`'s `aspect_ratio` param *and* `OutfitHero.jsx`'s container)
   after a mismatch briefly cropped generated figures — **keep these two in
   sync**, a display-only crop change needs the generation param changed
   too, not just CSS.
   The turn itself has **no container/card chrome** — the image and text sit
   directly on the page background, not inside a bordered/glass box. Applies
   to the revealed "Find items" grid too: flat images with a caption below,
   no bordered tile. **Corner language**: the hero image, and the
   turn's buttons (Retry / Find Outfit / quick-reply chips), use the
   `rounded-bubble` token (`tailwind.config.js`, 128px, square bottom-left)
   — see "Bubble corner language" below.
4. **Actions row** — thumbs up/down, "Retry," and "Find Outfit" (if pieces
   exist) all in one inline row below the narrative, revealed together with
   the hero image once generation settles.
5. **Quick-reply chips** — 2–4 AI-authored follow-up prompts specific to
   *this* turn (e.g. "Show me something more casual," "Keep it under $150"),
   not a static global list. Clicking one sends it as the next message
   immediately.
6. **"Find Outfit"** — collapsed by default. Expands the underlying
   structured pieces (still generated and stored every turn — see
   `04-data-model.md`'s `outfit_recommendation_items`) as the existing
   product-card grid, for save-to-closet / swap. The pieces exist whether or
   not the user ever expands this — decluttering the default view doesn't
   mean losing the data.

## Bubble corner language

Two mirrored `borderRadius` tokens (`tailwind.config.js`), each 128px on
three corners and square on the fourth — at typical element sizes 128px
exceeds half the box, so it just reads as "fully rounded" on the open
corners, with one sharp corner as a directional "tail":

- **`rounded-bubble`** (square bottom-left) — the user's message bubble
  (always **left-aligned**, filled purple, `bg-accent-tint`), the outfit
  hero image, and in-chat buttons/chips.
- **`rounded-bubble-reply`** (square top-right, mirrored) — a text-only
  assistant reply (always **right-aligned**, outlined not filled). Today
  this only fires for the network/API error fallbacks in `AppShell.jsx`
  (title-less, hero-less messages) — real stylist turns always have a
  title+heroPrompt (`stylist.js`'s schema requires them) so they always get
  the full two-column layout above, never this bubble. If a text-only
  assistant turn type is ever added to the schema, it gets this same
  treatment.

This is a deliberate reversal of the usual chat convention (user right,
assistant left) — established by direct request 2026-09-21. Don't
"correct" it back without checking with the user first.

**What this replaces:** the previous default view showed 2–4 product cards
inline with every reply and a right-hand "Look context" panel for assembling
multiple pieces across turns. Both are gone from the default flow — the cards
still exist (behind "Find items"), the look-builder panel does not (no
mockup called for it; the feature can come back if there's a real need,
recoverable from git history since it was a self-contained component).

## Home / empty state — now a persistent hero, not just an empty-state

`EmptyState.jsx` is **always mounted at the top of `ChatView.jsx`**, not
swapped out once the conversation has messages (changed 2026-09-21, direct
request: "the first fold elements would still be available after prompting
— basically the hero of each conversation"). Scrolling up during any
conversation, new or old, always reaches it again:

- Greeting headline (uses the signed-in user's name if set, else falls back
  gracefully).
- Short one-line product description.
- A horizontally-scrollable row of example-occasion cards (image + label,
  randomized order per mount — see `EmptyState.jsx`'s `shuffle()`) — tied to
  real GTM-relevant occasions (the business plan's "Wedding Guest" wedge and
  adjacent high-intent moments), not arbitrary examples.
- A second scrollable row of example prompt chips below the cards. Tapping
  either a card or a chip sends that prompt as the next message in whatever
  conversation is currently open — it does not start a new one.

## Layout: no top bar either — everything lives in one bottom bar

The top bar (`TopBar.jsx`) is gone too, replaced by `BottomBar.jsx` — every
control the app needs, anchored to the bottom of the screen, flanking the
composer input rather than living in a separate header:

- **Left of the input:** Home (brand mark — starts a new chat, also switches
  to the Chat view), Chat view toggle, Wardrobe view toggle (with an item-count
  badge).
- **The composer itself** — sits in the bar, not inside `ChatView`. It's
  global: typing and sending from the Wardrobe view switches to Chat and
  sends there (see `AppShell.jsx#handleSend`), so the input is always live,
  never a dead control.
- **Right of the input:** History (conversation-count badge; click opens the
  list/new-chat dropdown upward, since the bar is at the bottom), Share
  (Web Share API, falling back to clipboard copy — shares the most recent
  outfit's title+narrative as plain text; there's no public/shareable
  conversation page yet, so this never implies a link a recipient couldn't
  actually open), Account (email + sign out).
- **Responsive:** at `sm`+ it's one row (nav icons, input, utility icons).
  Below `sm` it becomes two rows — input on top, all six icons split evenly
  underneath — rather than letting the single row overflow.

Content runs in a centered column, capped at `max-w-content` (1160px,
`tailwind.config.js`) — wide enough for the two-column outfit turns above to
read as image-beside-text rather than cramped, not a dashboard-width grid.

Rationale: the previous three-column shell (sidebar + chat + look-context
panel) was information-dense in a way that fought the "one outfit at a
time" conversation model above. Moving every control into one bottom bar
(rather than top bar + in-chat composer) goes further in the same
direction — the content area above it is *only* content, ever. The column
started narrower (max-w-xl, 576px) than this — widened once the two-column
turn layout needed the room.

## How to adjust this later

- **Change what the AI returns:** edit `StylistReplySchema` and
  `STYLIST_SYSTEM_PROMPT` in `src/lib/stylist.js`. Update this doc's "one
  outfit direction per turn" section to match.
- **Change how a turn renders:** edit `src/components/chat/MessageBubble.jsx`
  and `OutfitHero.jsx`. The data shape (title/narrative/quickReplies/pieces)
  is the contract between the API route and the UI — changing the visual
  presentation shouldn't require changing the schema, and vice versa.
- **Bring back the look-builder panel / multi-card default view:** both are
  cleanly removed (not half-migrated), so this is a straightforward revert
  of the relevant commit rather than an architectural fight.
- **Change the bottom bar itself:** edit `src/components/BottomBar.jsx`. The
  send handler (`handleSend`) lives in `AppShell.jsx`, not inside `ChatView`
  or the bar — both the bar and `ChatView` just call it via props.
