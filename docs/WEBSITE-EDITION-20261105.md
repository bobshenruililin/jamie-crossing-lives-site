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
3. **The ledger**: eight selected accounts and one official schooling count, side by side (not an exhaustive cast), each part of life on its side of the boundary, hollow where unknown. Highlighting a part of life (home, work, purchases, ties) reveals the pattern with one carefully worded sentence. This answers "what do these people combine, and where does the evidence end?" in one view.
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

## Checkpoint 4 — dot's evidence corrections (applied)

dot checked my questions against the saved Script v3 and the photo records.

- **Anonymisation:** confirmed. Employers and institutions stay undisclosed.
- **Street photograph:** there is no recorded consent from the identifiable foreground person.
  - The site now publishes only a signage derivative, `feature/assets/sz-services-signage.jpg`: a full-width strip at 19.5–40.5% of the height that contains no people.
  - The miniature card, the services filmstrip, the photo viewer, its "open the full image" link and the research-desk gallery all use it. Detail spots are re-normalised to the strip.
  - The original is removed from this branch's tree.
- **Context photographs:** they are no longer presented as establishments interviewees used.
  - The restaurant card says the menu is context, not a restaurant these accounts describe.
  - The community-centre sign is detached from the guide's "community life".
  - No capture dates are assigned to photographs.
- **Store manager:** her reported pattern is restored as "Locals and Mainland visitors—busier Monday to Thursday", marked as not measured footfall. I left out the mall name: it adds identifiability and no insight.
- **Trips:** now "by rail via Lok Ma Chau/Futian and via Lo Wu, and an AsiaGlobal Fellows coach visit". No crossing point is given for the coach.
- **Ledger:** now "Eight selected accounts and one official count of schoolchildren—illustrations, not a sample or everyone the research mentions".
- **Schoolchildren:** Mainland residence is visibly *not* Shenzhen.
  - In the miniature, their homes sit in a dashed zone beyond the Shenzhen plinth labelled "Elsewhere on the Mainland".
  - In the ledger, a dashed mark sits at the far edge of the Shenzhen column with an outward arrow.
- **Store manager's shopping:** no longer placed in Sheung Shui. The miniature shows it as a dashed "somewhere in Hong Kong" marker, not a building.
- **Parent:** moved from "Locally based" to a band headed "Arrangement not established".

### Still needs attention outside this branch

- **The live site (`main`) still serves the original street photograph** (`feature/assets/sz-services.jpg`) with the identifiable person, until this branch, or a hotfix, reaches `main`.
- **The same full photograph is embedded as base64 in `presentation-frames/15.svg`.** The slide may visually crop it, but the whole image ships in the file, and the presentation PDFs likely contain it too. The presentation is a separate deliverable, so I haven't changed it.
- **Git history** of the public repository still contains the original on `main`.
  - This branch's checkpoint 3 commit also includes a small screenshot thumbnail of it in `docs/edition-20261105/desktop-05-lens-b.jpg`, since regenerated.
  - Purging either would mean rewriting history, which is your decision. I haven't done it.

## Remaining requests for dot

1. **Verified, dated photographs** for any of the miniature's places, when available. Until then, the cards for places without photos say so.
2. **Decide on the street photograph** in the presentation and on `main` (above).

## Porting to the private source (`app/feature/`)

The public root `index.html` is the authored page here. `feature/index.html` is generated from it by `python3 tools/sync-feature-alias.py`. For the private source, copy the generated `feature/index.html` to `app/feature/index.html`; its paths are already relative to `feature/`.

- **Add** to `app/feature/` and the export allowlist:
  - Modules: `cast.js`, `grammar.js`, `miniature.js`, `ledger.js`, `lens-choices.js`, `lens-services.js`, `lens-ties.js`, `photo-viewer.js`, `ties-icons.js`, `edition.js`.
  - Stylesheets: `edition.css`, `desk.css`.
  - Asset: `assets/sz-services-signage.jpg`.
- **Changed** (copy over): `field-gallery.js` now uses the signage derivative.
- **Remove** the original `assets/sz-services.jpg` once nothing else depends on it.
- **Remove** from `app/feature/` and the allowlist (superseded, recoverable from git history):
  - Scripts: `story.js`, `world.js`, `account-tour.js`, `life-accounts.js`, `spending-comparison.js`, `field-notebook.js`, `ties-atlas.js`.
  - Stylesheets: `world.css`, `spending-comparison.css`, `field-notebook.css`, `ties-atlas.css`, `story.css`, `editorial.css`, `navigation.css`, `craft.css`, `visual-story.css`.
- **Unchanged and still used:**
  - Modules, each with its CSS: `evidence`, `everyday`, `library`, `policy-map`, `research-overview`, `game` (and `field-gallery`, with the one-line change above).
  - Their JSON data, `research-data.json`, `data/`, and `feature/assets/`.
- **Public repo only:** `tools/sync-feature-alias.py` and `docs/`.
