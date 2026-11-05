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
- `tools/check-site.js`: 51 checks passing on both `/` and `/feature/` (checkpoint 5; earlier checkpoints ran 41):
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

## Checkpoint 9 — the slogan rearranges itself; text that lights the model · RESUME HERE

**Opening slogan:** "Two places, / *one life, rearranged.*" (Bob's idea: a two-line slogan for the whole project whose first line's photos and colours rearrange into the second).
- The project's arrangements framework becomes the opening gesture:
  - "Two" is cut from the Sheung Shui driving-school photograph (rust, Hong Kong);
  - "places," from the Shenzhen towers (teal).
- After it settles, every piece lifts off and recomposes "one life, rearranged.", deliberately mixing rust and teal, so the second line is a collage of both places' photographs.
- The first line stays as a dashed outline, the arrangement that was: the same ghost grammar the site uses for "not established".
- Every piece is still a real photograph: hover line 2 for true colour and its source, and click a piece to open the photograph it came from.
- Hovering the outline pulls the pieces back; a ↺ button replays. Reduced motion shows the final state.
- The real `<h1>` reads "Two places, one life, rearranged."
- "A life doesn't move all at once." now heads the tour's payoff step, above the five signatures.

**Place words.** Phrases in the opening deck and the tour that name a place are highlighted in their side's colour (rust or teal). Hovering or focusing one lights that building in the miniature; activating it opens the building's evidence (on phones, it brings the model into view). The text and the model work as one instrument.

**Also:** a "Signs toward the port" stop in the services trail uses the crossing-hall photos as wayfinding, without asserting which side of the boundary it is.

**Checks:** 65, all passing on `/` and `/feature/`; no overflow at 320 or 390px.

**Before pushing to `main`:** send `docs/REVIEW-REQUEST-ASTRA.md` to the original Astra chat for a last check.

## Checkpoint 8 — type cut from field photographs; life signatures; a cleaner frame

**Type made of the fieldwork** (`feature/photo-type.js`).
- The title's letterforms are filled with field photographs and coloured by side of the boundary:
  - "A life" from the Sheung Shui driving school (Hong Kong, rust);
  - "doesn't move" from the crossing hall and its HSITP sign (ink);
  - "all at once." from Shenzhen towers, a posted menu and the Lianhua Ercun community centre (teal).
- The letters are cut into small tiles that settle one at a time, so the title literally does not move all at once.
- Hover or focus shows a word in true colour and names its photograph; activating it opens the photograph.
- The real `<h1>` text stays for assistive technology, search and no-JavaScript readers.
- The same treatment extends to each lens letter (A, B, C), built from that lens's photographs; clicking a letter cycles them.
- It reuses the existing Barlow Condensed and Instrument Serif glyphs as masks, with no new font dependency.

**Life signatures** (`feature/signature.js`).
- Each account gets a four-lane glyph, top to bottom home, work, purchases and relationships, across a dashed boundary:
  - a half-disc to the left is Hong Kong, to the right Shenzhen;
  - a whole disc spans both;
  - a dashed ghost is not established;
  - a hatched mark pushed past Shenzhen is Mainland-not-only-Shenzhen.
- They appear in every ledger row (with a key), in each tour step, and as a row of five in "Five examples".
- The ledger's part-of-life highlight also dims the other lanes.
- They are generated from `cast.js`, so evidence corrections flow through automatically; the checks assert the pupils' and the manager's signatures.

**Frame.**
- Desktop always shows the whole model; only stages narrower than 720px move in close.
- Extra bottom clearance keeps the HONG KONG / SHENZHEN labels off the plinths.
- The scene edges fade softly instead of hard-cutting.
- Pins no longer lag behind the model while it turns (the CSS transform transition is removed).
- These apply to both renderers.

**Photos added** (Bob approved the shortlist on 6 November). Public derivatives are resized, and two are cropped to exclude people. Captions use visible signage only; originals are unchanged in the private source.

| Asset | Contact-sheet ref | Derivative | Original SHA-256 |
|---|---|---|---|
| `hk-crossing-hall.jpg` | #1 | resized only | `190aea180d533326…` |
| `hk-hsitp-sign.jpg` | #9 | crop [0, 0.1, 1, 0.38] | `0b29938918deb0ad…` |
| `sz-help-kiosk.jpg` | #14 | crop [0.4, 0.18, 0.98, 0.93] | `978c9a408b6de50c…` |
| `sz-police-office.jpg` | #43 | resized only | `98f0328b45f94159…` |
| `sz-community-centre.jpg` | #64 | resized only | `0226d952a9b67e74…` |

- Not used: #8 (near-duplicate of #1) and #7 (crowd).
- `sz-help-kiosk.jpg` adds a Lens B trail stop, "Start-up help": the Futian service centre's posters advertise company registration and start-up support, and invite Hong Kong volunteers.
- The hall photo is deliberately *not* attached to the arrival-form stop: it is the Hong Kong side, while the arrival help was at Futian.
- **For dot:**
  - Confirm the crossing-hall location (visible signs: "Futian Port / HSITP", MTR branding) and the kiosk poster wording.
  - Add these five to the private photo ledger.

**Checks (at checkpoint 8):** `tools/check-site.js` had 60 checks; all pass on `/` and `/feature/`, with no overflow at 320 or 390px.

**Next ideas:**
- a "share your signature" card;
- signature-driven filtering of the miniature;
- real-device checks of `?renderer=gpu`.

## Checkpoint 6 (work in progress) — a live GPU miniature

Bob's direction: less a traditional website, more something inherently interactive (WebGPU), built beyond generated imagery. The experience is built from the research itself, not from generated images (large generated illustrations were rejected earlier for feeling pasted in).

**State at pause:** `feature/world-gpu.js` is a complete first draft of a WebGPU renderer for the miniature, wired into `feature/miniature.js` behind an opt-in flag. **The default site still uses the proven SVG miniature**: all 51 checks pass and nothing changes for readers. The draft has not rendered successfully yet.

**What the draft does (design intent):**
- **Same shared scene logic.** Places, footprints, cards, pins, ghosts and evidence are unchanged. Only the drawing layer swaps.
- **Rendering:**
  - Lighting with a 2048² PCF shadow map, a soft ground-contact shadow under the floating plinths, and 4× multisampling.
  - Procedural windows: dark glass by day, lamplight when an account lights that place.
  - Crossings as camera-facing ribbons that keep the grammar (dots = ties, dashes = moves, heavy = daily), with a lamp pulse showing direction only.
- **Camera and input:**
  - The camera flies between accounts.
  - Drag orbits; vertical drag tilts with a mouse.
  - Pinch, or ctrl/trackpad-pinch on the wheel, zooms; plain scrolling still scrolls the page.
  - Keyboard: arrows turn and tilt, +/− zoom, Home resets.
  - Picking is a ray against the footprints.
- **The schoolchildren's step (the reason for the GPU):**
  - All 16,139 pupils are drawn as individual points.
  - They start as an unlocated cloud floating over the Mainland side ("Mainland residence, location not specified", consistent with the floating-ghost grammar and dot's correction).
  - They then cross and settle on a tray in front of Hong Kong as a unit bar chart by level: 388 kindergarten, 2,577 primary, 13,174 secondary. Each point is one pupil; paths are illustrative.

**How to try it:**
- Open `/?renderer=gpu` in a WebGPU browser (recent Chrome, Edge or Safari).
- For headless testing, launch Chromium with `--enable-unsafe-webgpu`; it then uses SwiftShader.

**Update — the GPU world renders.**
- The "Device was destroyed" error was the sandbox's headless Chromium, which cannot *present* a WebGPU canvas; a bare test page loses its device the same way.
- Off-screen rendering works. A debug-only mode, `?renderer=gpu&gpu-debug=offscreen`, renders off-screen and copies pixels to a 2D canvas, so the GPU output can be screenshotted in headless tests.
- Verified this way:
  - lighting and shadows;
  - lamp-lit windows and dimming per account;
  - dotted, dashed and pulsing ribbons;
  - overlays aligned to buildings;
  - the 16,139-point cloud crossing and settling into keyed bars.
- Real-browser presentation is still unverified, so GPU stays opt-in.

**Next:**
1. Open `?renderer=gpu` on a real desktop and phone (Chrome/Edge/Safari); compare with the SVG at 1440 and 390px.
2. Tune colours against the palette.
3. Add GPU-specific checks to `tools/check-site.js`, such as a second run with `--enable-unsafe-webgpu` asserting `data-renderer="webgpu"`.
4. Only then make GPU the default where available, keeping SVG as the fallback.
5. Port `world-gpu.js` to the private source.

## Checkpoint 5 — the questions travel; the checks travel too

- **Singapore–Johor is drawn as the same miniature, deliberately unbuilt** (`feature/echo.js`).
  - Dashed outlines stand where fieldwork would go, and numbered questions sit on the places they concern, each paired with its wording beside the model.
  - The only filled marks are published figures: the RTS opening target and the 2024 survey of stated interest.
  - The RTS forecast becomes two hatched arcs in both directions, widths proportional to S$1.05bn and S$756m, coloured by destination.
  - The image says "the questions travel; the answers need local evidence" without a caption. It replaces the three text columns and the bar chart.
  - Marker and label positions were checked numerically against the arcs so they stay apart at phone width.
- **The guide's move is motion that explains.**
  - Switching to her account, her home flies from Hong Kong across the boundary into Shenzhen and leaves a dashed "Home, before the move" outline; family visits stay where they were.
  - With motion paused or reduced, the outline alone carries it.
- **`tools/check-site.js`**: 51 browser checks anyone can rerun (instructions at the top of the file).
  - Ten of them are evidence regressions from dot's corrections:
    - The unconsented street photograph is never requested.
    - Pupils' homes are Mainland, not Shenzhen, in the ledger and the miniature.
    - The manager's shopping isn't placed in Sheung Shui.
    - The parent isn't "locally based".
    - There are eight selected accounts plus an official count.
    - No institution is disclosed.
    - The trips are named correctly.
  - I confirmed these checks fail when the original photo or a Shenzhen placement for the pupils is reintroduced.
- **Fix:** a reader's own turn of the model now cancels the one-time sway hint instead of being undone by it.

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
  - Modules: `cast.js`, `grammar.js`, `miniature.js`, `ledger.js`, `lens-choices.js`, `lens-services.js`, `lens-ties.js`, `echo.js`, `photo-viewer.js`, `photo-type.js`, `signature.js`, `ties-icons.js`, `edition.js`, and `world-gpu.js` (opt-in, in development).
  - Stylesheets: `edition.css`, `desk.css`.
  - Assets: `assets/sz-services-signage.jpg`, `hk-crossing-hall.jpg`, `hk-hsitp-sign.jpg`, `sz-help-kiosk.jpg`, `sz-police-office.jpg`, `sz-community-centre.jpg`.
- **Changed** (copy over): `field-gallery.js` now uses the signage derivative.
- **Remove** the original `assets/sz-services.jpg` once nothing else depends on it.
- **Remove** from `app/feature/` and the allowlist (superseded, recoverable from git history):
  - Scripts: `story.js`, `world.js`, `account-tour.js`, `life-accounts.js`, `spending-comparison.js`, `field-notebook.js`, `ties-atlas.js`.
  - Stylesheets: `world.css`, `spending-comparison.css`, `field-notebook.css`, `ties-atlas.css`, `story.css`, `editorial.css`, `navigation.css`, `craft.css`, `visual-story.css`.
- **Unchanged and still used:**
  - Modules, each with its CSS: `evidence`, `everyday`, `library`, `policy-map`, `research-overview`, `game` (and `field-gallery`, with the one-line change above).
  - Their JSON data, `research-data.json`, `data/`, and `feature/assets/`.
- **Public repo only:** `tools/sync-feature-alias.py`, `tools/check-site.js` and `docs/`. The check script is worth porting to the private source too.
