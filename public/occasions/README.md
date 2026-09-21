Generated hero images for the home-screen occasion carousel
(`src/components/chat/EmptyState.jsx`) live here as `{slug}-hero.jpg`, one
per entry in `src/data/occasions.js`.

Not committed by default — generate them with:

```
REPLICATE_API_TOKEN=... node scripts/generate-occasion-images.mjs
```

Cards work fine without these files (`ImageWithFallback.jsx` falls back to
an illustrated `GarmentArt` placeholder) — this is a visual upgrade, not a
dependency.
