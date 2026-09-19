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
   display face (`font-script`, currently **Caveat** — a free stand-in for
   **Liza** (Underware), which is a paid webfont this project doesn't have a
   license for; swap the `script` token in `tailwind.config.js` if/when a
   Liza license and font files exist), large, as the turn's visual anchor.
2. **Narrative** — 2–4 sentences, editorial voice, explaining the direction
   and why it answers the occasion/mood/constraint the user gave.
3. **Hero visual** — one image representing the outfit in its setting, laid
   out **beside** the title/narrative in a two-column split (`sm:grid-cols-2`
   in `MessageBubble.jsx`) rather than stacked above the text — image left,
   content right, matching the reference mockups. Collapses to a single
   stacked column below the `sm` breakpoint. **Currently a styled
   illustrated placeholder** (`OutfitHero.jsx`), not a real photorealistic
   render — real image generation (SDXL via a hosted provider) is a
   deliberately separate next step, not bundled into this layout change.
   Swapping the placeholder for a real generated image later should only
   mean changing what `OutfitHero` renders, not the surrounding turn shape.
4. **Quick-reply chips** — 2–4 AI-authored follow-up prompts specific to
   *this* turn (e.g. "Show me something more casual," "Keep it under $150"),
   not a static global list. Clicking one sends it as the next message
   immediately.
5. **"Find items for this outfit"** — collapsed by default. Expands the
   underlying structured pieces (still generated and stored every turn —
   see `04-data-model.md`'s `outfit_recommendation_items`) as the existing
   product-card grid, for save-to-closet / swap. The pieces exist whether or
   not the user ever expands this — decluttering the default view doesn't
   mean losing the data.

**What this replaces:** the previous default view showed 2–4 product cards
inline with every reply and a right-hand "Look context" panel for assembling
multiple pieces across turns. Both are gone from the default flow — the cards
still exist (behind "Find items"), the look-builder panel does not (no
mockup called for it; the feature can come back if there's a real need,
recoverable from git history since it was a self-contained component).

## Home / empty state

Before the first message in a conversation, show a welcome screen, not a
blank chat log:

- Greeting headline (uses the signed-in user's name if set, else falls back
  gracefully — see `EmptyState.jsx`).
- Short one-line product description.
- A horizontally-scrollable row of example-occasion cards (image + label) —
  tied to real GTM-relevant occasions (the business plan's "Wedding Guest"
  wedge and adjacent high-intent moments), not arbitrary examples.
- A second scrollable row of example prompt chips below the cards. Tapping
  either a card or a chip starts a conversation with that prompt.

This view is per-conversation: switching to an existing conversation shows
its history; starting a new chat shows this welcome screen again.

## Layout: no sidebar, anywhere

Replaced across the whole app (not just chat) with a minimal top bar:
brand mark, Chat/Wardrobe nav, a conversation-history control (dropdown, not
a persistent rail — multi-conversation support still exists, just doesn't
cost permanent screen space), and an account menu. Content runs in a
centered column, capped at `max-w-content` (1160px, `tailwind.config.js`) —
wide enough for the two-column outfit turns above to read as image-beside-text
rather than cramped, not a dashboard-width grid.

Rationale: the previous three-column shell (sidebar + chat + look-context
panel) was information-dense in a way that fought the "one outfit at a
time" conversation model above. A single centered column keeps attention on
the one thing being discussed. The column started narrower (max-w-xl,
576px) than this — widened once the two-column turn layout needed the room.

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
