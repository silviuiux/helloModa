# helloModa — Cost Estimate

Rough monthly estimates by phase, assuming low private-beta volume (dozens to low hundreds of
active users). Real usage-based costs (LLM, image-gen) will need re-measuring once actual usage
patterns exist — treat these as planning numbers, not commitments.

## Phase 0–1 (Foundations + Wedding Guest MVP, no image generation yet)

| Item | Estimate |
|---|---|
| Vercel (Pro, for team/analytics features) | $20/mo |
| Supabase (Pro tier, EU region) | $25/mo |
| Claude API (chat, low volume beta) | ~$20–60/mo |
| Domain | ~$1–2/mo (annual) |
| Trigger.dev / Inngest | $0 (free tier covers this volume) |
| Sentry | $0 (free tier) |
| PostHog | $0 (free tier) |
| Stripe | 0 fixed cost (2.9%+30¢ per transaction, once subscriptions exist) |
| **Total** | **~$70–110/mo** |

## Phase 2 (+ image generation)

| Item | Estimate |
|---|---|
| Everything above | ~$70–110/mo |
| Hosted SDXL generation (fal.ai/Replicate), est. $0.01–0.05/image, ~500–2000 images/mo at beta scale | ~$10–100/mo |
| **Total** | **~$100–200/mo** |

## Phase 3 (+ CV matching, avatar, calendar)

| Item | Estimate |
|---|---|
| Everything above | ~$100–200/mo |
| CLIP embedding calls (catalog sync + per-recommendation matching) | ~$10–30/mo |
| Google Calendar API | $0 (free tier sufficient) |
| **Total** | **~$120–250/mo** |

## Phase 4 (+ marketplace)

| Item | Estimate |
|---|---|
| Everything above | ~$120–250/mo |
| Stripe Connect (payout fees, on top of standard processing) | usage-based, no fixed cost |
| Legal consultation (one-time, not monthly) | budget separately — see `06-risks-legal.md` |
| **Total** | **~$120–250/mo** + one-time legal cost |

## Fits the stated budget

All of this comfortably fits "$100s–$1000s/month" — even Phase 4 stays well under $1,000/mo at
private-beta scale. The main lever if costs run higher than expected is image-generation
volume (Phase 2 onward) — worth instrumenting cost-per-user from day one of Phase 2 (PostHog +
a simple cost-tracking log) so you catch it early rather than at the invoice.

## What would meaningfully change this

- Public launch (Phase 5) at real scale — LLM and image-gen costs scale with active users,
  re-estimate before removing the invite gate.
- Any move to self-hosted GPU inference — only worth it once hosted per-image cost × volume
  exceeds a dedicated GPU instance's monthly cost; not relevant at beta scale.
