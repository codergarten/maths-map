# Maths Map 🧭

> See where your child stands in maths — and the next steps to grow.

**🇦🇺 Maths Map is built for the Australian context — specifically the Victorian Curriculum.** It maps your child against the **Victorian Curriculum F–10 (Version 2.0), Mathematics**, as published by the **Victorian Curriculum and Assessment Authority (VCAA)**. Level 1 (≈ Year 1) in this version. Source of truth, always current: <https://f10.vcaa.vic.edu.au/>

**Maths Map is a free, mobile-first web app for parents** of children in the early years of Australian schooling. It maps your child against the **Victorian Curriculum F–10 (2.0), Mathematics, Level 1** (≈ Year 1), shows you what they know securely, what's wobbly, and gives you simple at-home ways to build it.

Sit with your child, run the 25–35 minute check-in (or pause and come back), and get a gap report you can act on — or take to the next parent–teacher night.

## FAQ (short answers)

**What curriculum is this?** The Victorian Curriculum F–10 (Version 2.0) Mathematics — VCAA, Australia. Source: <https://f10.vcaa.vic.edu.au/>.

**Outside Victoria?** Mostly transferable (other states derive from ACARA), but codes and levels are Victorian — treat it as a check-in, not an official alignment.

**Is it a test or diagnostic?** No. A parent-guided check-in. Not NAPLAN, not validated, not a judgement of potential.

**Is it private?** Yes — everything stays on your device. No accounts, no servers, no analytics, no ads. Backup (⬇️) regularly.

**How were the questions written?** Original items mapped 1:1 to official VCAA content descriptions and elaborations. Not peer-reviewed; use alongside school, not instead of it.

**What if my child struggles broadly?** Talk to their teacher — and use Maths Map as the conversation-starter. See `llms.txt` for the agent-facing summary and `src/faq.ts` for the full in-app FAQ (also rendered for parents inside the app).

## What it does

- **Multi-child profiles** — every child in the family, their own history, on one device
- **A full Level 1 check-in** — 75 items across the five Level 1 strands (Number, Algebra, Measurement, Space, Statistics); on-screen taps for your child, hands-on "kitchen table" tasks observed by you (counting buttons, play shop, surveys)
- **A parent-friendly gap report** — per content description: what they can do, what to watch, and 3 at-home activities (built from the VCAA elaborations, translated for the kitchen table)
- **Term-by-term tracking** — same items every sitting, so you can actually see the line move
- **A printable A4 report** — strand summary, strengths, focus areas — for parent–teacher night
- **Works offline, installs like an app** — no accounts, no cloud, no subscription
- **Your data stays on your device** — nothing is uploaded; a manual Backup button exports it as a file

## What it is **not** (please read)

- **Not a validated diagnostic or standardised test** (like NAPLAN). It measures coverage of Level 1 content descriptions — nothing more.
- **Not a school report, and not medical or educational advice.** If most codes come out "Needs work", or maths tears happen every sitting, please talk to your child's teacher (and, where relevant, your GP).
- **Not affiliated with or endorsed by the Victorian Curriculum and Assessment Authority (VCAA) or any school.** Curriculum codes and content are © VCAA, licensed CC-BY-NC 3.0 — **non-commercial use only**.
- **Built for parents, not classrooms.** No marking, no rostering, no class dashboards. (If you're a teacher, it can still *show* you where one child sits, but it isn't a teaching tool.)

If your child is struggling across the board, the teacher sees the whole year — this app sees your kitchen table. Neither picture is complete alone; use them together.

## Using it

1. Open the app and tap **Add a child** (name, year level, avatar).
2. Tap the child, then **Start the Level 1 check-in**. Read questions aloud if your child prefers; no timers, no coaching.
3. The **gap dashboard** is for you (grown-ups) — traffic-light on every Level 1 content description, with at-home activities to close the gaps. Print the **A4 report** whenever you want one.
4. Re-run the check-in once a term (plus once mid-term if you'd like). Backup regularly (⬇️ in the footer).

Or install it: open in Chrome/Safari on your phone → **Add to Home Screen** → it behaves like a native app and works offline.

## Privacy & data

All profiles, answers and history live in your browser's local storage on your device. There is no server collecting this, no analytics, no ads, no account. Clearing browser data erases it — use **⬇️ Backup** to keep a JSON copy, and **⬆️ Restore** to bring it back (works across devices).

## Hosting your own copy

It's a static site — any static host works (GitHub Pages, Netlify, Vercel, Render, your own nginx).

```bash
npm ci            # install
npm run dev       # local development
npm run build     # type-check + production build → dist/
npm run preview   # serve the production build locally
```

**Render (free tier):** New → Static Site → connect this repo → Build Command `npm ci && npm run build` → Publish Directory `dist` → deploy. That's it.

## Project layout

| Path | Purpose |
|---|---|
| `data/curriculum.json` | Generated VCAA curriculum data (all levels; Level 1 used by the app) |
| `data/item-bank-level-1.json` | The 75 Level 1 assessment items (original, mapped to VC2 codes) |
| `data/level-1-guidance.json` | Per-code parent guidance: plain words, watch-fors, at-home activities |
| `pipeline/build_curriculum.py` | Regenerates `curriculum.json` from VCAA's CSV export |
| `pipeline/validate_item_bank.py` | Structural checks on the item bank |
| `pipeline/make_icons.py` | Regenerates app icons |
| `review/Level-1-Content-Pack.md` | Human-readable review pack for all Level 1 content |
| `public/llms.txt` | Agent-facing summary (what it is, limits, licence) — discoverable via `robots.txt` |
| `src/faq.ts` | Parent FAQ (rendered in-app as FAQ modal + mirrored as JSON-LD in `index.html`) |
| `src/` | React + TypeScript PWA (Vite) |

To regenerate curriculum data you need VCAA's `VC2_AS-CD-Elab_11-11-2026.csv`, downloadable from <https://f10.vcaa.vic.edu.au/>. It is not committed to this repository.

## Licences & attribution

- Curriculum content, codes and elaborations: **© VCAA**, licensed **CC-BY-NC 3.0 Australia** (<https://f10.vcaa.vic.edu.au/about/copyright>) — non-commercial use only, attribution required.
- Maths Map code, original items, activity ideas and design: yours to use, modify and share for non-commercial family or personal learning purposes. Not for commercial resale, and not for turning VCAA content into a paid product.

*Maths Map is made by parents, for parents. It complements — never replaces — your child's teacher.*

## Updating this repo (maintainer note)

The canonical app lives inside the `codergarten-site` monorepo under `comms/Core/Teach/Resources/VIC Curriculum/Maths Map`. To publish to `codergarten/maths-map`:

```bash
git subtree split --prefix="comms/Core/Teach/Resources/VIC Curriculum/Maths Map" -b maths-map -force
git push https://github.com/codergarten/maths-map.git maths-map:main
```

(The standalone repo is generated from the monorepo — don't edit it directly; changes would be overwritten on the next split.)
