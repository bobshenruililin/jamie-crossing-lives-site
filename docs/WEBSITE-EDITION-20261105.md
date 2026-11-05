# Crossing Lives — website edition of 5 November 2026

Branch `claude/keen-cerf-j2szmo`. A coherent rebuild of the story layer, aligned with Script v3 (checked 2 November 2026). The presentation, `research.html`, `samples/`, PDFs and QR assets are untouched.

## Preview

```sh
# from the repository root
python3 -m http.server 4188 --bind 127.0.0.1
# open http://127.0.0.1:4188/  and  http://127.0.0.1:4188/feature/
```

Branch preview without a checkout (a third-party CDN; not reachable from the sandbox I worked in, so untested): https://raw.githack.com/bobshenruililin/jamie-crossing-lives-site/claude/keen-cerf-j2szmo/index.html

GitHub Pages serves `main` only, so the live site changes only on merge.

Screenshots: [`docs/edition-20261105/`](edition-20261105/) (desktop 1440×900; phone 390×844 at 2×).

## The idea

The research says a cross-border life is a *combination*: people place home, work, purchases and relationships on different sides of a boundary, one part at a time. So the site now shows that directly, in one visual language:

1. **A miniature of the fieldwork** (opening). The loved spatial model stays the spine, but its generic buildings now each stand for a place in the research: homes in Fanling, shops in Sheung Shui, a driving school advertising licence conversion, the crossing at Futian, repair specialists, restaurants, a street of services, a follow-up clinic. Each has an evidence marker; selecting it opens what the research says about that place, and the field photograph where one exists. The title and the model share the first screen.
2. **A tour of five examples**, following v3's arrangements: cross-border user, northbound mover, worker or student (the official pupil count, clearly marked as not an interview), Hong Kong base with Mainland ties, and the locally based. The camera moves to each life; places light up, arcs show what crosses, and what an account does not establish stays visibly unplaced.
3. **The ledger**: all nine accounts side by side, each part of life on its side of the boundary, hollow where unknown. Highlighting a part of life (home, work, purchases, ties) reveals the pattern with one carefully worded sentence. This answers "what do these people combine, and where does the evidence end?" in one view.
4. **Three lenses** with v3's clear claims as headlines instead of punchy phrases:
   - **A · Choices**: reasons that draw an activity across vs keep it local (six accounts), a dumbbell of the CUHK spending shares, and who businesses serve.
   - **B · Services**: a trail from Sheung Shui through the crossing into Shenzhen; each stop opens its evidence and inspectable photo details; the documented follow-up-care loop.
   - **C · Relationships**: the relationship icons, the guide's path into new circles, and the lasting-ties hypothesis, marked as a hypothesis.
5. **Singapore–Johor** carries the lens questions across, with the RTS forecast hatched as a forecast.
6. **The research desk**: the twelve collections grouped into four shelves (method, evidence, places, what next). Modules load only when opened.

**Evidence key.** Every claim carries a small glyph — account, observed, published figure, forecast, question, not established — so readers can see the kind of evidence without walls of grey caveats. Limits stay next to the claim they qualify.

## Checkpoint 3 — let the layout explain

Bob’s note: less secondary labelling; text only where it carries insight. This pass removed or merged most small grey text.

- **Unknowns are layout, not lists.** Parts of a life an account doesn’t place float as hollow ghosts over the boundary gap in the miniature, with a drop line to the border. The first step explains the convention once.
- **The ledger groups rows into arrangement bands**, so the framework appears five times, not under every name. On phones a sticky Hong Kong | Shenzhen header replaces per-row side labels, and hollow marks sit beside each name.
- **The services trail is a filmstrip of the field photographs** running across the crossing. Stops without a photo are dashed tiles, so the kind of evidence shows without a caption.
- **Direct labels replace legends** (the spending dumbbell). Takeaways lost their "What lens X suggests" labels; the rule and type carry them.
- **Caveats moved into the sentence they qualify.**
  - "Weighing lower earnings against…" for the guide.
  - "—not only in Shenzhen—" for the pupils.
  - "a forecast, not lost GDP" for the RTS net figure.
  - Step source lines and duplicate decks went.
- **One integrity line is kept where a misreading is likely:**
  - the ledger ("illustrations, not a sample");
  - the conclusion;
  - the help point's untested referrals;
  - the care pilot ("joining isn't evidence of outcomes").
- **The in-page work-in-progress strip is removed**, because the requested status signals — the first-visit popup and the persistent header label — remain. It's easy to restore if wanted.
- **A one-time sway of the model** replaces "drag to turn".
- **Deep links now wait** for components above them to mount, so they land in the right place.

## Where I challenged the previous direction

- **Vague display lines replaced** ("Different places. Different baskets.") with the findings themselves ("Shenzhen draws some activities. Hong Kong routines remain.").
- **Cast expanded from four to nine**, including the people who stay locally based, because v3 treats them as part of the finding.
- **Anonymisation tightened**: "Professional with Shenzhen ties / University work" became v3's "Resident with Shenzhen ties / Work". A new neutral workplace icon replaces the university building.
- **The research is no longer a long accordion**: four shelves, with "go deeper" links from each lens into the relevant collection.
- **Implementation**: sixteen layered stylesheets became one design system (`edition.css`) plus the namespaced module styles. The 320px overflow is gone.

## Checks run (5 November, headless Chromium)

- `node --check` on all 21 JS modules; `git diff --check` clean.
- 41 scripted interaction checks, passing on both `/` and `/feature/` (re-run after checkpoint 3):
  - Popup: shows, closes, session acknowledgement, suppressed on reload; the header label persists.
  - Miniature: markers open cards; the photo viewer opens, highlights details, closes on Escape and returns focus; arrow keys turn the model; the switcher drives the tour.
  - Ledger: focus and expand.
  - Trail: stops and detail highlight.
  - Ties: toggle.
  - Motion pause.
  - All 12 shelves render.
  - Deep links, including legacy anchors (`#selective`, `#two-way`, `#arrangements`, `#responses`).
  - No console errors.
- No document overflow at 320, 390, 768 or 1440px.

**Not verified:**
- Real phones, Safari and Firefox, screen readers.
- Performance budgets.
- Editorial acceptance by Jamie.
- Every source link.

## Open issues and next steps

- The **"all five" view** is deliberately dense; it may want fewer arcs or a toggle.
- The **research-desk modules** keep their earlier internal styling; they fit, but deserve a harmonising pass.
- **Places have no photographs yet** for Sheung Shui shops, the repair specialists, restaurants (beyond one menu), tuition and the clinic. Those cards say so honestly.
- `research.html` and the presentation footer still carry older revision wording; they're out of scope for this pass.

## Requests for dot

1. **Confirm the anonymisation change** above, and that the v3 cast wording used here (dining visitors, Sheung Shui resident and shop employee, parent, property agent) is acceptable for the public site. All of it is paraphrased from the public v3 slide text in this repository; see `feature/cast.js`.
2. **Face in `sz-services.jpg`** (foreground, identifiable). It was already published. Is there clearance? If not, I'll crop it to the signage.
3. **Verified photographs** with place and date provenance, unchanged originals, any aspect ratio, for the miniature's places: Sheung Shui street or shops (31 October walk); the Futian or Lo Wu crossing; Shenzhen restaurants; a repair or electronics market.
4. **Clarify slide 12**: which account says "Landmark North · busier Monday–Thursday"? It's omitted until clarified. "Fewer crowds, in two accounts" is used as printed.
5. **Check one phrasing**: the three trips are rendered as "by rail through Futian and Lo Wu, and an AsiaGlobal Fellows coach trip" (v3: "Futian rail · Lo Wu rail · AGF coach").

## Porting to the private source (`app/feature/`)

The public root `index.html` is the authored page here. `feature/index.html` is generated from it by `python3 tools/sync-feature-alias.py`. For the private source, copy the generated `feature/index.html` to `app/feature/index.html`; its paths are already relative to `feature/`.

- **Add** to `app/feature/` and the export allowlist:
  - Modules: `cast.js`, `grammar.js`, `miniature.js`, `ledger.js`, `lens-choices.js`, `lens-services.js`, `lens-ties.js`, `photo-viewer.js`, `ties-icons.js`, `edition.js`.
  - Stylesheets: `edition.css`, `desk.css`.
- **Remove** from `app/feature/` and the allowlist (superseded, recoverable from git history):
  - Scripts: `story.js`, `world.js`, `account-tour.js`, `life-accounts.js`, `spending-comparison.js`, `field-notebook.js`, `ties-atlas.js`.
  - Stylesheets: `world.css`, `spending-comparison.css`, `field-notebook.css`, `ties-atlas.css`, `story.css`, `editorial.css`, `navigation.css`, `craft.css`, `visual-story.css`.
- **Unchanged and still used:**
  - Modules, each with its CSS: `evidence`, `everyday`, `library`, `policy-map`, `research-overview`, `field-gallery`, `game`.
  - Their JSON data, `research-data.json`, `data/`, and `feature/assets/`.
- **Public repo only:** `tools/sync-feature-alias.py` and `docs/`.
