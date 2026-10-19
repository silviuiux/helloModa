Generated hero images for the `/what-to-wear` guides live here as
`{slug}-hero.jpg`, one per guide in `src/data/guides.js`.

They are optional. `src/lib/guideHero.js` (`guideHeroPublicPath`) is the
switch: a page uses the jpg only when this file exists, and otherwise paints
the committed SVG in `GuideHeroArt.jsx` from the guide's palette. Do not
point an `<img>` at the jpg path yourself.

Generate them later, when Replicate credit is available:

```
REPLICATE_API_TOKEN=... node scripts/generate-guide-images.mjs
```

Commit the jpgs. The next build picks them up. No other code change.
