# helloModa — Overview

*Ground-truth planning doc for this venture. The `brain` vault's `helloModa.md` note links here — if the two disagree, this file wins. Last updated: 2026-09-19.*

## What this is

An AI-powered personal styling ecosystem: users describe an occasion in natural language,
get a photorealistic AI-generated outfit visualization, and can shop the closest real,
purchasable match — plus a digital closet, calendar-driven proactive styling, and eventually
a peer-to-peer rent/resell marketplace. Full concept in the original business plan (attached
2026-09-18); this doc set turns that into a build plan.

## Where it stands today

- **Repo:** `silviuiux/helloModa`, branch `claude/trusting-wozniak-kqier8`, 4 commits.
- **What exists:** A polished static UI shell — Vite + React 18 + Tailwind, chat view +
  digital closet view, "visionOS glass" aesthetic already established. All data is hardcoded
  mock data in `src/data/seed.js`. No backend, no auth, no database, no LLM calls, no image
  generation, no real retailer integration. It's a design prototype, not a product.
- **What the vault (`brain` repo) already decided, before this session:** stack = Next.js +
  Supabase, monetization = affiliate model. The current repo is on a *different* stack
  (Vite, no backend) — so it's throwaway/earlier exploration relative to that decision, not
  a foundation to build on as-is. Its UI and component structure are still a good design
  reference to port from.
- **Context:** helloModa is one of five ventures under HELLO-CORP (helloHoreca, helloModa,
  helloDesign, helloIT, helloNews). Your day job is UX work at **Fashion Days** (part of the
  eMAG ecosystem) — genuinely useful insider knowledge of fashion e-commerce, but also the
  source of a conflict-of-interest constraint (see `06-risks-legal.md`).

## Decisions locked in for this plan

Made 2026-09-19, in this session:

1. **Scope: full vision.** Build toward the complete business plan — generative
   visualization, CV-based real-inventory matching, digital closet, and circular marketplace
   — not a stripped-down MVP. Staged across phases (`03-roadmap.md`), not all at once.
2. **Stack: Next.js + Supabase**, matching the prior vault decision. The existing Vite UI
   gets ported into a Next.js App Router project, not iterated on in place.
3. **Posture: low-profile.** No public launch, no marketing, no use of Fashion Days
   catalog/vendor knowledge, until the employment contract has been checked for
   non-compete/conflict-of-interest terms. Build and test privately (private beta, invite-only)
   in the meantime. See `06-risks-legal.md` for the specific things this constrains.
4. **Resourcing: solo builder, willing to spend $100s–$1000s/month** on paid APIs and
   infra. No co-founder/hire assumed yet. This rules out anything requiring an ML team
   (e.g. self-hosting/fine-tuning SDXL) in favor of hosted inference APIs, and rules out
   free-tier-only infra where it would meaningfully slow the build.

## Document map

| Doc | Covers |
|---|---|
| `01-architecture.md` | System components and how they talk to each other |
| `02-tech-stack.md` | Concrete technology choices, with reasoning and alternatives |
| `03-roadmap.md` | Phased build plan from current state to full vision, with exit criteria |
| `04-data-model.md` | Core database schema |
| `05-integrations-affiliates.md` | Retailer data, affiliate networks, catalog ingestion |
| `06-risks-legal.md` | Fashion Days conflict, IP/likeness, GDPR, marketplace liability |
| `07-costs-budget.md` | Monthly cost estimate by phase |
| `08-changelog.md` | Living log — append only, never rewritten |

## Open questions still to resolve (not blocking, but track them)

- Employment contract review (non-compete / IP assignment) — needed before any public step.
- Which affiliate networks actually have Romanian/EU fashion retailers with good terms
  (ShopStyle Collective and CJ skew US-heavy — needs real research, not assumption).
- Whether "helloAvatar" (a user's digital twin) needs a distinct consent/likeness flow
  before any EU user can generate one (GDPR special-category biometric data — see risks doc).
