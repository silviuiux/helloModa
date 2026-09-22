# helloModa — Copy deck

*Every user-facing string in the product, with the rewrite that shipped 2026-09-22. This is
the source of truth for copy. If you change a string in code, update its row here. For the
stylist's own reply voice, see `09-conversation-design.md`.*

---

## 1. Positioning

**One line:** helloModa is the AI stylist that starts in your closet.

**The promise, in order of importance**

1. **Your wardrobe first.** Every look is built from clothes you already own.
2. **One confident look.** You get one decision per answer, not a catalogue of options.
3. **Painted on you.** The look is shown on your own watercolour avatar (helloAvatar).
4. **One piece, if any.** It only suggests buying something when there's a real gap. It's a
   real product from a real shop, at its real price.
5. **It keeps.** Your style journal and closet insights (cost per wear, never-worn pieces)
   make every future decision smarter.

**Who it's for:** people with a full wardrobe and "nothing to wear". They don't want to be
sold to, and they want to walk into the room feeling sure.

**The enemy:** style apps that are shops wearing a stylist's badge.

---

## 2. Voice

| Do | Don't |
|---|---|
| Talk like a friend who happens to be a stylist: warm, direct, a little witty | Sound like a SaaS dashboard ("Leverage AI-powered outfit curation") |
| Name concrete things: *rooftop at 9pm*, *carry-on only*, *wine bar* | Use abstractions like "elevate your style journey" |
| Sell the outcome: *walk in sure*, *see it on you* | Sell the tech: "CLIP-embedded", "generative", "LLM" |
| Be honest about limits: *invite-only*, *coming soon*, *example closet* | Make claims the product can't back up |
| Use lower-case script lines for warmth (*hello —*, *what are we dressing for?*) | Put exclamation marks on everything |

**Hard rules**

- Never promise a flow that doesn't exist. For example, there is no "request an invite" form,
  only a shared invite code, so the CTA is "Join with your invite".
- Never cite a number the product can't prove. The closet-insights figures on the landing
  page are labelled "example closet".
- Spelling is British English (watercolour, colour). The product is EU-based, and the
  landing page already used it.
- The one exception is the avatar modal's "Watercolor avatar" heading. It stays as it is so it
  keeps matching the saved avatar style name in the code.

---

## 3. Landing page (`src/app/LandingPage.jsx` + `src/components/landing/*`)

### Navigation and hero

| Slot | Before | After |
|---|---|---|
| Nav link | Try it | See it style |
| Nav CTA | Request an invite | Join the beta |
| Hero kicker | Private beta — invite only | Your AI stylist · private beta |
| Hero headline | *hello —* you already own the outfit. | *(kept. It's the strongest line on the page.)* |
| Hero body | helloModa is a conversational AI stylist. Tell it what's coming up — it styles a real look from the clothes already in your wardrobe, paints you a picture of it, and names the one piece worth buying. | Tell helloModa where you're going. It builds the look from clothes you already own, paints it on you so you can see it before you get dressed, and only suggests buying something when your wardrobe genuinely can't cover it. |
| Primary CTA | Request an invite | Join with your invite |
| Secondary | Have an invite? Sign in | Already a member? Sign in |
| Callout 01 | Starts in your closet / Styles from what you own first. | Your closet first / Every look starts with what you own. |
| Callout 02 | One look per turn / A direction, not a product wall. | One confident look / Not forty tabs of maybes. |
| Callout 03 | Painted, not stock / Every look rendered in watercolour. | Painted on you / Your face, your build, in watercolour. |
| Callout 04 | Names one piece to buy / Only when your closet can't. | One piece, if any / Only when there's a real gap. |

### Trust band

| Before | After |
|---|---|
| 20 — occasions covered out of the box | 20 — occasions ready to style, or type your own |
| 1 — styled look per turn, never a product wall | 1 — decisive look per answer, never a product wall |
| EU — Frankfurt — where your data stays | 0 — sponsored picks, made-up prices or fake shops |
| 0 — invented prices or fake retailers | EU — your data is stored in Frankfurt |

"Where your data stays" was dropped. Styling and painting call US-hosted model APIs, so
"stays" over-promised. "Is stored" is exactly true.

### Positioning statement

| Before | After |
|---|---|
| **The difference** — Most styling apps are a shop with advice bolted on. helloModa starts inside your wardrobe, and only goes shopping when it *has to.* | **Why helloModa** — Most style apps are shops wearing a stylist's badge. helloModa works for your wardrobe, not a retailer — and only sends you shopping when it *has to.* |

### How it works (`StickyStage.jsx` + `StageVisuals.jsx`)

| Step | Before | After |
|---|---|---|
| 01 | **The occasion** — Start with what's actually happening. / …Say it the way you'd say it to a friend — no tags, no filters, no style quiz. | **Tell it** — Say where you're going, like you'd tell a friend. / A rooftop birthday at 9pm. A vineyard wedding in June. A first-round interview on Tuesday. No style quiz, no filters, no forty questions — just the occasion, in your own words. |
| 02 | **Your closet** — It reaches for what you own first. / Every piece you've added is CLIP-embedded… | **Your closet** — It shops your wardrobe first. / Snap your clothes once and helloModa learns them by how they actually look — colour, cut, texture — not by a label you had to type. Every look starts there. Buying something new is the last resort, not the point. |
| 03 | **The look** — One direction, not a catalogue. / A single styled look per turn, written in a real editorial voice… | **The look** — One confident look, painted on you. / Not a mood board, not twelve products in a grid — one decisive outfit, explained the way a good stylist would. Then it's painted in watercolour on your own avatar, so you see it on you before you get dressed. |
| 04 | **The gap** — Then the one piece worth adding. / …No invented prices, no affiliate wall dressed up as advice. | **The gap** — And the one piece worth buying — if any. / Open the look to see what came from your wardrobe and what, if anything, is genuinely missing. When it does suggest something, it's a real product from a real shop, at its real price. No sponsored picks, no endless scroll. |
| 05 | **Later** — Every look stays, and stays editable. / Past conversations live on as an outfit history… | **Your journal** — Every look, kept — and still open. / Each look lands in your style journal with its painting. Open any of them to pick the conversation back up — swap the shoes, dress it down, restyle it for next time. |

Changes to the scene micro-copy:

| Before | After |
|---|---|
| the welcome screen | pick an occasion — or type your own |
| 3 of 6 matched | 3 pieces you own |
| Matched on how the pieces actually look — not a category label. | Recognised by how each piece looks — colour, cut, texture. |
| Retry / Find outfit | Restyle / See the pieces |
| find outfit — expanded | the pieces |
| Three you own, one worth buying. No fabricated prices, no wall of products. | Three you already own. One worth buying. That's the whole list. |
| hello—outfits | your style journal |
| Tap to pick the conversation back up where it stopped. | Open to restyle it or pick the chat back up. |
| Every look you've ever been given, still editable. | Every look you've been styled, kept in one place. |

### Occasions

| Before | After |
|---|---|
| **Range** — Twenty occasions, ready before you ask. | **Occasions** — Twenty occasions, ready when you are. |
| Weddings and interviews, yes — but also the rooftop birthday, the 90's throwback party, the pumpkin-patch date. Anything you'd actually get dressed for. | The wedding and the interview, obviously. But also the rooftop birthday, the 90s throwback party, the pumpkin-patch date — or anything else, in your own words. If you'd get dressed for it, helloModa can style it. |

### What you get (`DetailHighlights.jsx`) — rebuilt

The old section, **"Details — The small decisions, on purpose."**, sold the *design system*:
corner geometry, three typefaces, graceful image fallbacks and the house watercolour style.
That's interesting to a designer, but it doesn't make anyone sign up. It's replaced with
**"What you get — Everything a great stylist does. None of the pressure."** and five benefit
cards. Each card shows a small, live specimen of the real feature.

| Card | Title | Body |
|---|---|---|
| helloAvatar | See it on you, not on a model. | Add a photo and your measurements once. helloModa paints a watercolour avatar with your face, hair and real build — not a default slim-and-athletic body — and dresses it in every look it styles for you. The photo is deleted as soon as the painting is done. |
| Closet insights | Know what your clothes really cost. | Add what you paid and log when you wear something. helloModa shows your cost per wear, what your wardrobe is worth, and the pieces you never reach for — so the next purchase is a smarter one. *(Specimen figures are labelled "example closet".)* |
| Style journal | Every look, kept. | Each look you're styled lands in your journal with its painting and its story. Come back before the next wedding, the next trip, the next Tuesday — and restyle it in one message. |
| Honest shopping | It only sends you shopping when it has to. | The look is styled first, from what you own. Only if something is genuinely missing does helloModa point to one real product from a real shop, at its real price. Some links earn helloModa a small commission — that never decides what gets recommended. |
| Always listening | A stylist that feels present. | helloModa isn't a chat box with a logo. It breathes while it waits, leans in while you type, and gathers itself while it styles — so you always know it's with you, without a spinner in sight. |

The orb captions changed from waiting / you're typing / styling your look to **ready when you
are / hearing you out / styling your look**.

### Demo, closing and footer

| Slot | Before | After |
|---|---|---|
| Demo kicker + title | Try it — Have a go, no account needed. | See it style — Watch it style a real occasion. |
| Demo body | Pick an occasion and watch a real turn play out — the same components the signed-in app renders, replayed here. | Tap an occasion and see exactly what you'd get: the look, the reasoning, the pieces, and what to ask next. These are real answers from the app, replayed — no sign-up needed. |
| Demo empty state | Tap an occasion below to see helloModa style it — this is a real turn from the app, replayed here. | Tap an occasion below and watch helloModa style it — a real answer from the app, replayed. |
| Closing kicker | Invite only, for now | Private beta |
| Closing headline | come get *dressed.* | *(kept)* |
| Closing body | helloModa is in private beta while the styling gets sharper. Request an invite and we'll open a seat. | helloModa is invite-only while we sharpen the styling. Got a code? You're one step away. No code yet? Ask whoever sent you here — they can pass theirs on. |
| Footer blurb | A conversational AI stylist that starts in your wardrobe. Part of helloCorp. | The AI stylist that starts in your wardrobe — and paints the look on you. A helloCorp company. |
| Footer links | Try it / Request an invite | See it style / Join with an invite |
| Legal line | © helloModa — private beta · data hosted in the EU | © helloModa · private beta · data stored in the EU |

### Meta (`src/app/layout.jsx`)

| Field | Before | After |
|---|---|---|
| Title | helloModa — AI stylist | helloModa — the AI stylist that starts in your closet |
| Description | helloModa — a conversational AI stylist that turns mood, occasion, wardrobe and budget into curated outfit direction. Part of helloCorp. | Tell helloModa where you're going. It styles a look from clothes you already own, paints it on you in watercolour, and only suggests buying something when your wardrobe can't cover it. |

---

## 4. Chat — the intro and the conversation

| Slot | Before | After |
|---|---|---|
| Intro kicker | helloModa — your stylist | your stylist is in |
| Intro headline | hello, {name}. *what are we dressing for?* | *(kept)* |
| Intro body | Describe an occasion and I'll style a look from your closet — plus the one piece worth adding. | Tell me the occasion, the vibe or the weather. I'll build the look from your wardrobe, paint it on you, and only suggest something new if it's genuinely missing. |
| Card hover | style this → | style me → |
| Starter 1 | What should I wear to a black-tie gala? | Black-tie gala on Saturday — but I hate heels |
| Starter 2 | Help me pack for a beach weekend | Beach weekend, carry-on only. What do I pack? |
| Starter 3 | I need an outfit for a work presentation | Presenting to the leadership team on Thursday |
| Starter 4 | Something for a first date, not too much | First date at a wine bar, not too try-hard |
| Composer placeholder | Describe an occasion, a mood, a place… | Where are you going? An occasion, a mood, the weather… |
| Composer while sending | styling your look… | *(kept)* |
| Image loader | painting the look | painting your look |
| Reply buttons | Retry / Find outfit / Hide pieces | Restyle / See the pieces / Hide pieces |
| Feedback | Good match / Not for me | *(kept)* |
| Thinking phrases | 20 phrases | *(kept, plus 3 new:)* Raiding your wardrobe · Checking the dress code · Mixing the paints |
| Empty history menu | No conversations yet. | No looks yet — your first one starts here. |
| Share text | Check out helloModa — an AI stylist that shops your closet. | Styled by helloModa — the AI stylist that starts in your closet. |
| Server error | Something went wrong. Please try again. | That one didn't go through — mind sending it again? |
| Network error | Couldn't reach the server. Please try again. | I can't reach helloModa right now. Check your connection and try again. |

The starters are now specific and a little opinionated, with a constraint in each (no heels,
carry-on, not try-hard). That shows people they can talk to it like a person, which is the
product's biggest differentiator. They're also better test prompts.

---

## 5. App surfaces

| Surface | Before | After |
|---|---|---|
| Journal subtitle | Your style journal — every look, kept. | Every look you've been styled, kept. Open one to restyle it. |
| Journal empty | No outfits yet — start a conversation and your looks will show up here. | No looks yet. Tell helloModa where you're going and your first one lands here. |
| Wardrobe search | Search pieces… | Search your wardrobe… |
| Wardrobe empty | Nothing here yet. | Your wardrobe is empty — for now. Add a few pieces and every look starts with them. |
| Add item intro | Snap a photo and helloModa fills in the details — or log it manually. | Snap a photo and helloModa fills in the rest — or add the details yourself. |
| Price hint | Powers cost-per-wear on this piece — skip it, add it anytime. | Unlocks cost per wear for this piece. Optional — add it anytime. |
| Tagging failed | Couldn't auto-tag that photo — fill in the details below. | Couldn't read that photo — add the details below instead. |
| Avatars Pro upsell | Add family members with Pro / Style outfits for up to 3 more people, each with their own avatar and measurements. | Style the whole family with Pro / Add up to 3 more people — partner, kids, parents — each with their own avatar, sizes and measurements. |
| Avatar modal (self) | Your measurements power fit — a photo (optional) paints your watercolor avatar. | Your measurements shape how every look fits. Add a photo (optional) and helloModa paints you in watercolour — the photo is deleted right after. |
| Avatar modal (family) | Their measurements power fit for outfits styled on their behalf. | Their measurements shape how every look fits them when you style on their behalf. |
| Repaint hint | Not quite right? Repaints with the same photo. | Not quite you? Repaint from the same photo. |
| Usage note | …adds unlimited messages and image generations… | …adds unlimited styling and image generations… |
| Global error | Something went wrong. / helloModa hit an unexpected error. We've been notified. | That wasn't supposed to happen. / helloModa hit an unexpected snag. Try again — your wardrobe and looks are safe. |

"We've been notified" was dropped because no error reporting is wired to that page.

---

## 6. Auth and guides

| Surface | Before | After |
|---|---|---|
| Login subtitle | Private beta — sign in to continue. | Welcome back. Your wardrobe missed you. |
| Login footer | No account yet? Register | Have an invite code? Create your account |
| Register subtitle | Invite-only private beta — create your account. | You're invited. Create your account and get styled in minutes. |
| Register (new line) | — | No code? helloModa is invite-only for now — ask whoever sent you here. |
| Guides index body | Outfit dressing depends more on the specific occasion than most advice admits… | What works at a beach wedding looks wrong at a job interview — so generic style advice only gets you so far. Pick your occasion for specific, practical guidance: what to wear, what to skip, and how to handle the weather and the setting. |
| Guide header CTA | Try helloModa | Join the beta |
| Guide end CTA | Try helloModa | Get this styled for you |
| Guide showcase note | This is what a helloModa turn looks like — describe your own occasion and get one specific direction, pulling from your closet first, not a grid of generic options. | This is what a helloModa answer looks like. Describe your own version of this occasion and get one specific look — built from your wardrobe first, painted on you, not a grid of generic options. |

---

## 7. Kept as-is, on purpose

- **Functional labels:** Save, Cancel, Done, Add item, Remove item, Sign out, Profile, the
  form field names (Height (cm), Waist (cm), Top size…) and the example placeholders
  (e.g. M, e.g. US 8). They're already clear, and changing them only adds churn.
- **Developer-facing console strings** such as "Failed to load wardrobe:". Users never see
  these.
- **Server-side validation messages** (e.g. "That invite code isn't valid.") are already
  plain and direct.

## 8. Not covered by this pass

- **The nine occasion guide articles** (`src/data/guides.js`). These are long-form SEO
  content, written for search intent. They need their own editorial pass and should not be
  bulk-rewritten.
- **The 20 occasion prompts and labels** (`src/data/occasions.js`). Each prompt is sent
  verbatim to the stylist as the first message, so changing them changes the styling output.
  Tune them together with the stylist prompt.
- **The stylist's own reply voice.** That's covered in `09-conversation-design.md` and the
  system prompt in `src/lib/stylist.js`.
