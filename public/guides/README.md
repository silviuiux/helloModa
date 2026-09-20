Generated hero images for the `/what-to-wear` guides live here as
`{slug}-hero.jpg`, one per guide in `src/data/guides.js`.

Not committed by default — generate them with:

```
REPLICATE_API_TOKEN=... node scripts/generate-guide-images.mjs
```

Pages work fine without these files (`GuideHeroImage.jsx` falls back to an
illustrated placeholder) — this is a visual upgrade, not a dependency.
