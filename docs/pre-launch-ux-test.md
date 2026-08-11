# Pre-launch UX test (Step 15)

Use this script with **3–5 people who have never seen Meritt Pros**. Do not explain the product first. One facilitator, one note-taker.

## North-star comprehension

After each screen, ask exactly:

> **What do you think Meritt does?**

**Target (good):** Something close to *"It shows me who I can trust based on their current reputation."*

**Red flags (copy/UX still sounds like a review site):**

- "It's a review website."
- "It's like Yelp."
- "It's a star-rating site."
- "It's just a directory."

---

## Session flow (~25–35 minutes)

| # | Screen | URL (local) | What to do | Notes to capture |
|---|--------|-------------|------------|------------------|
| 1 | Homepage | `/` | Let them scroll 30s, then ask the question. | Do they mention **trust**, **current**, **reputation**? |
| 2 | Search | `/search` | Pick a profession/location if needed; browse 2–3 cards. Ask the question. | Is **current tier** obvious before name? |
| 3 | Public profile | `/u/{slug}` | Open one pro from search. Scroll full page. Ask the question. | Order: identity → reputation → why → history → about → feedback? |
| 4 | Feedback form | `/review/{slug}` | Do **not** submit unless they volunteer; read the form. Ask the question. | "Experience" vs stars? Link to reputation? |
| 5 | Pro dashboard | `/dashboard` | **Facilitator demo** or logged-in test account. Ask the question. | "What is my reputation right now?" clear? |

### Optional follow-ups (only if time)

- "Would you hire this person based on this page? Why?"
- "What would you do next as the professional on the dashboard?"

---

## Per-screen pass checklist (facilitator)

### 1. Homepage

- [ ] Hero says trust / current reputation (not "top rated" or stars)
- [ ] Primary CTA is consumer-first ("Find a professional")
- [ ] Featured section reads as **current reputation**, not lifetime popularity

### 2. Search results

- [ ] Tier or current reputation visible without opening profile
- [ ] No numeric star average on cards
- [ ] "View reputation" (or equivalent) is clear

### 3. Public profile

- [ ] **Current reputation** is the dominant signal
- [ ] "Updated this month" (or similar) visible
- [ ] How the tier works is discoverable without hunting
- [ ] 12-month timeline reads as **history**, not a game
- [ ] Recent client feedback is present but not louder than reputation

### 4. Feedback form

- [ ] Great / Good / Poor (or equivalent)—not promote/demote
- [ ] Copy ties feedback to **current reputation**, not a star score

### 5. Professional dashboard

- [ ] Opens with current tier and what changed
- [ ] Next tier guidance is understandable
- [ ] Actions point to collecting **verified** feedback, not "get more reviews"

---

## Scoring sheet (copy per participant)

```
Participant: __________  Date: __________

Screen 1 — Homepage
  Answer (verbatim):
  Green / Yellow / Red:

Screen 2 — Search
  Answer (verbatim):
  Green / Yellow / Red:

Screen 3 — Profile
  Answer (verbatim):
  Green / Yellow / Red:

Screen 4 — Feedback form
  Answer (verbatim):
  Green / Yellow / Red:

Screen 5 — Dashboard
  Answer (verbatim):
  Green / Yellow / Red:

Overall: Ready for soft launch?  Yes / Not yet
Top 3 confusions:
1.
2.
3.
```

**Green** = north-star or close. **Yellow** = trust/reputation but vague. **Red** = review site / Yelp / stars / directory only.

---

## Internal smoke test (engineering)

Before sessions, verify in dev or staging:

```bash
npm run build
npm run test
```

Manual clicks:

1. `/` — loads, CTAs work
2. `/search` — results or empty state
3. `/u/{slug}` — reputation hero + timeline
4. `/review/{slug}` — experience form renders
5. `/dashboard` — reputation panel (requires login)

---

## After the sessions

1. Tally **Red** answers by screen—fix copy on those screens first.
2. If **search** or **profile** score Red, revisit Steps 6 and 10.
3. If **feedback form** scores Red, revisit Step 5 vocabulary.
4. If **dashboard** scores Red, revisit Step 11.

Re-run with at least 2 new participants after changes.
