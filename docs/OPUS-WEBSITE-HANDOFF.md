# Crossing Lives — website handoff to Opus

Checked 5 November 2026. This is a starting point for your judgment, not a prescribed redesign.

## Why we are making this

Jamie Ko researches everyday life across Hong Kong–Shenzhen, with questions for Singapore–Johor. Bob leads the visualization alongside dot/GPT. The audience includes AsiaGlobal Fellows, academics and policy-minded readers, plus people arriving through the presentation's QR code.

We want an engaging, credible visual research story: readers should understand something through seeing and interacting, feel the specificity of the fieldwork, and easily inspect the evidence. The ambition is the editorial care of a strong newspaper or magazine interactive, with an original visual identity. WSJ/New Yorker/Webby references express a quality aspiration; there is no publishing commission or award claim.

Success feels like: “I understand what these people combine across two places, why it matters, and where the evidence ends—and I want to explore further.” Bob also wants this to become work we are proud to show in our portfolio. Clarity and substance matter more than appearing sophisticated.

## Your ownership

Own the website's next creative and technical iteration. Use your judgment; challenge our structure, wording, interaction design and implementation. You do not need to preserve a weak choice because we already built it. Start by experiencing the live site, then make a coherent improvement rather than only supplying a critique. Leave a branch and working preview/checkpoint for collaboration. This invitation is website-focused; the presentation is a separate deliverable.

Promising territory, not a checklist: make the spatial experience reveal more of the actual research; connect selected evidence to the visual story without adding a reading wall; make the research depth easier to discover; improve mobile composition and the consistency of interactions.

## What the feedback actually says

**Confirmed direction:** audience first; one coherent visual language; meaningful interactions; authentic field photographs preferred; easy navigation and visible research depth. Bob especially likes the miniature spatial model, the direct title-to-interaction opening, and expressive motion when it explains something. The small relationship icons, inspectable photo details and spending comparison are useful foundations.

**Lessons from rejected iterations:** large generated illustrations felt pasted in; long explanatory interludes weakened the opening; decorative curves lacked a clear purpose; punchy but vague phrases and emphatic design obscured meaning. Let the insight earn its visual emphasis. More content is not automatically an improvement.

**Current explicit status requirement:** retain the QR destination and clearly identify the website as work in progress. A dismissible first-visit popup and persistent header label were requested and are live. Acknowledgement lasts for the tab session.

**Our judgments, not fixed requirements:** progressive disclosure and the present palette are useful; retaining every section, SVG architecture, animation or typographic treatment is not mandatory. The best research-led interaction and ideal reading length are still open design questions. No user study demonstrates that the current hierarchy works.

## Actual current state

- Public website repo: https://github.com/bobshenruililin/jamie-crossing-lives-site
- Live: https://bobshenruililin.github.io/jamie-crossing-lives-site/
- Runtime baseline: `main`, `b20948371c537ca68dfaf4e55d190d2537b3fa67` (popup update). Local and remote main matched on inspection. This handoff lives on a separate documentation branch; it changes no runtime.
- Private source repo: `bobshenruililin/jamie-crossing-lives`, `main`, `7c67906046b5496260d7b32ab8fcc15f5d5d081b`. Ask Bob/dot for access or a narrowly scoped source excerpt if necessary; public access does not imply private access.
- The website is static HTML/CSS/native JavaScript modules. No npm build, framework, API key or backend is required. The apparent 3D scene is projected SVG, not WebGL or a measured geographic model.
- Current path: four selected accounts → spending → annotated field photographs → relationship atlas → Singapore–Johor questions/forecasts → research collections. The optional route game is now inside the research collection, not the opening screen.
- The presentation has 24 slides following Script v3 checked 2 November. The website narrative largely remains the earlier edition. Its footer still says the presentation was checked 1 November. Do not assume all website copy is synchronized with v3.

## Files and preview

| Area | Files in this public repo |
|---|---|
| Page structure, navigation, popup | `index.html`, `feature/index.html`, `feature/story.js` |
| Visual system and later overrides | `feature/story.css`, `navigation.css`, `craft.css`, `visual-story.css` |
| Spatial accounts | `feature/world.js`, `world.css`, `account-tour.js`, `life-accounts.js` |
| Main research interactions | `feature/spending-comparison.*`, `field-notebook.*`, `ties-atlas.*` |
| Deeper research | `feature/policy-map.*`, `research-overview.*`, `evidence.*`, `library.*`, `everyday.*`, their JSON data; `research-data.json`, `data/` |
| Existing field photographs | `feature/assets/` (11 JPEGs); additional previously published images in `samples/assets/` |
| Separate deliverables to avoid accidentally replacing | `presentation.html`, `presentation-data.json`, `presentation-frames/`, both presentation PDFs, `review.*`, `site-qr.*`, `research.html`, `samples/` |

CSS shorthand above is relative to `feature/`. There are 16 CSS links in the homepage; later overrides matter.

```sh
# From a checkout of the public repo
python3 -m http.server 4188 --bind 127.0.0.1
# Open http://127.0.0.1:4188/ and /feature/
# Optional syntax check with Node; no dependency installation needed:
for file in feature/*.js; do node --input-type=module --check < "$file" || break; done
git diff --check
```

The private source's canonical website is `app/feature/`; its `app/index.html` is the slide viewer, NOT this homepage. `scripts/export_public_site.py DESTINATION` exports an allowlisted public site into a NEW directory, rewriting relative paths. Public root and `/feature/` are equivalent entry points with different paths. If working only in the public repo, keep both working and tell dot exactly which changes must be ported to the private source before another export. Otherwise a later export can overwrite your work. New assets/modules also need the private export allowlist updated.

## Known weaknesses and verification limits

**Observed:** stale website/presentation revision wording; a 7px document-width overflow at 320px (root cause not established); many layered CSS overrides; no checked-in automated test suite or package manifest in the active public site. Old private README descriptions of an opening game and five photographs are historical, not the current layout.

**Editorial assessment:** the model's setting remains more generic than the fieldwork; much of the research is buried in a long accordion collection; similar chapter treatments can make different findings feel alike. These are invitations to investigate, not proven usability failures.

**Verified 5 November:** live popup appeared and dismissed; model, relationships and research sections rendered; policy-map disclosure opened; `/feature/` returned 200; homepage, alias HTML, story.js and visual-story.css matched local files. Headless Chrome inspections at 1440×900, 390×844 and 320×700 found no page errors or failed requests; overflow only at 320px. All 19 tracked public JS files passed syntax checks. GitHub Pages serves `main` at `/`; its last deployment succeeded for the runtime baseline.

**Earlier, 3 November:** popup close/button/Escape, focus order, reload and alias suppression, deep-link position and disabled-storage behavior were checked. **Not verified now:** every interaction/data point/source link; real phones, Safari/Firefox, screen readers, performance budgets, editorial acceptance or current research validity. A full private export was started during this handoff but not yet certified complete; do not treat a partial export comparison as a regression. There is no new deployment from this handoff.

Public working tree was clean before adding this document. Private tracked files were clean, but 158 pre-existing untracked status entries include `* 2.*` duplicates and review/output material. Do not bulk-add, clean or overwrite them. Dot retains the detailed local inventory; local previews/export folders are not canonical sources.

## Evidence, privacy and help from dot

Keep actual evidence distinct from accounts, interpretation, forecasts and proposals. Model routes and relationship icons are conceptual; the game's demand and scores are invented. Do not manufacture interview quotations, population measurements or causal effects. Verify new factual claims against sources. Firsthand photographs are evidence of visible context, not proof that pictured people are interviewees.

The private repo contains scripts, interview/source records, document comments and original-photo provenance. Do not copy those, personal identifiers, private document links, credentials or raw conversations into this public repo. Selected public assets/data can be used; request clearance and provenance for additional originals. Do not change repository visibility or contact participants.

Ask dot through Bob or the shared agent channel if one is actually available; no automatic cross-model messaging API is assumed. For images, specify the explanatory job, intended placement, aspect ratio/size, palette, transparency needs, and whether you need a verified field photo or a clearly labelled illustration. Dot can help with image generation, photo selection, source checks, research extracts and integration. Ask for missing evidence instead of filling gaps with invented detail; continue independent work while waiting.

At useful checkpoints leave: branch + commit, preview/run command, screenshots at desktop and phone widths, what changed and why it helps readers, checks actually run, unresolved issues, requested assets, and files/source mappings dot must integrate. Keep private reasoning/source notes outside the public tree. You have creative ownership; make the next version meaningfully better.
