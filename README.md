# helloModa

Conversational AI stylist — turns mood, occasion, wardrobe, and budget into
curated outfit direction. Part of helloCorp.

## Run

```bash
cd hellomoda
npm install
npm run dev
```

Open the printed localhost URL.

## Stack

- **Vite + React 18** — component-based, fast HMR.
- **Tailwind CSS** — design tokens live in `tailwind.config.js`.
- Fonts (Fraunces / Inter / IBM Plex Mono) load from Google Fonts in `index.html`.

## Structure

```
src/
  App.jsx                     app shell, view routing, wardrobe state
  data/seed.js                mock data (style memory, messages, wardrobe)
  lib/iconMap.jsx             garment-icon resolver
  components/
    Sidebar.jsx               brand, style memory, nav, today's intent
    Icons.jsx                 inline stroke icon set (no deps)
    chat/
      ChatView.jsx            header + chips + messages + composer
      MessageBubble.jsx       user / AI bubbles
      RecommendationCards.jsx outfit suggestion cards
      Composer.jsx            input + quick prompts
      LookContextPanel.jsx    right panel: silhouette / palette / risk
    wardrobe/
      WardrobeView.jsx        grid, search, category filters
      WardrobeItemCard.jsx    item tile (favorite / remove)
      AddItemModal.jsx        add a piece
```

## Design language

Warm ivory canvas, espresso sidebar, blush accent. Editorial serif display
(Fraunces) against monospaced data labels — shares helloCorp's DNA.

## Next ideas

- Saved Looks gallery · real image uploads for wardrobe · outfit preview render
  in the context panel · wire chat to a model API · per-look budget tracking.
```
