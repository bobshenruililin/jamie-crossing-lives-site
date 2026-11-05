# Opus: make the whole story as revealing as A

6 November 2026 · Website direction and current-state handoff from Bob and dot

**Bob has confirmed that “Part A” means A / Livelihoods and choices. He finds it substantially stronger than the later sections and wants you to bring your creative judgment to the whole website.** This is an invitation to build, not merely critique. Own the visual narrative, interactions and implementation. Challenge this diagnosis wherever your own inspection suggests something better.

## The work and the ambition

Crossing Lives is the web companion to Jamie Ko’s exploratory AsiaGlobal Fellows research: fieldwork and conversations around Hong Kong–Shenzhen, alongside published evidence, leading to questions for Singapore–Johor. Jamie owns the research; Bob is the visualization collaborator. The audience includes academic and policy readers, as well as people encountering the research for the first time. The aspiration is the clarity and visual authorship of an excellent newspaper interactive—not a claim of any publisher’s involvement.

Success feels like: **“I can see how parts of a life cross a boundary while other parts remain, understand why that matters, and inspect the evidence when I want to.”** Firsthand photographs, particular accounts, an explorable miniature, and the distinction between what is known and what remains open make this project special.

Jamie’s most important guidance: identify the message first; give it the clearest visual emphasis; avoid impressive-looking treatment of empty or imprecise phrases. Bob wants genuine visual discovery, not more prose to read or controls to operate. The current amount of content is broadly welcome. He explicitly disliked an earlier revision that inserted a text-heavy layer between the opening title and model, and generated images that felt foreign to the page.

**Scope: the website.** Slides, PDFs and presentation exports are not part of this assignment. You have room to recompose sections, change their sequence, and create original web-native interactions. No requirement to preserve every existing component or to turn every section into a chart.

## Why A may feel better

This is an editorial diagnosis supported by code and rendered-page inspection, **not a user study**.

| Section | Verified implementation | Our reading / opportunity |
| --- | --- | --- |
| **A / Choices** | `lens-choices.js` renders six accounts together, with stable Hong Kong / Shenzhen columns, directly associated reasons, qualifications and a distinct conditional treatment. A spending chart places two series on a shared quantitative scale. `index.html` then connects this to business accounts and takeaways. | The reader can compare before clicking. Position, repetition and the chart do explanatory work. The sequence moves from motives to spending composition to different business experiences. Preserve that specificity and coherent progression. |
| **B / Services** | Nine stops in `lens-services.js` lead to one replaceable photo/text panel; `renderStop('help')` is the initial state. Other explanations require selecting more stops. A separate care-loop diagram follows. | The photographs are valuable, but the first experience is closer to a catalogue than an explanation of how support works. The care loop already shows a mechanism. Could the whole section make needs, provision and cross-border dependencies similarly visible, while preserving photo inspection? |
| **C / Relationships** | `lens-ties.js` switches between two profiles, replacing both cities’ icon lists. The guide’s home moves while family connections remain. The subsequent “new circles” account is largely a numbered prose panel and activity tags in `index.html`. | The icons communicate *where*. The research about *how connections enable participation* arrives mainly as text. Develop the existing meaningful move into a stronger account of what changes, what persists, and how a new opportunity becomes accessible. Keep individual accounts distinct. |
| **Singapore–Johor / research** | `echo.js` pairs numbered model markers with questions and forecast information. Twelve research collections load on demand across four shelves. | Preserve the contrast between findings here and questions elsewhere. Improve the reader’s route to the relevant evidence and the final payoff if useful; do not imply that the Hong Kong accounts establish Johor outcomes. |

A’s headline also presents a tension: some activities move, while routines remain. B’s broad statement that services help people is less particular to this research; C’s geographical distribution partly repeats the opening premise. A stronger organizing insight may matter more than a new visual effect.

An instructive detail: in the inspected default states, A contained about **307 visible words**, B **173**, and C **174**. This is a rough DOM count, excluding unopened content, not a readability score. A’s advantage is not simply brevity. More of its words are organized into comparisons rather than asking the reader to assemble the relationship themselves.

A also needs judgment: its reason-pill widths are not quantities; its spending data concerns **Mainland** spending, not a Shenzhen-only estimate; and its selected accounts are not a representative sample. Borrow the explanatory principle, not every visual form.

### Authorship: what the history actually supports

All three lens modules were introduced together in Claude-authored commit `9e88667` (“Checkpoint 1: fieldwork miniature, ledger and three-lens edition”). The same rebuild contains A, B and C. The history therefore does not support a simple “Opus made A; another model made the rest” explanation. Git identifies the author as Claude, not the exact model. Bob attributes the rebuild to Opus. We are asking you to extend the strongest qualities of your own edition.

### One concrete implementation gap

`PROFILES[].note` in `feature/lens-ties.js` contains two qualifications, but `initTies()` never renders them:

- The resident’s account does not establish a regular commute.
- The guide’s account does not establish her guiding workplace.

This is a data-to-view omission, not proof that the current visible text states the opposite. Preserve those limits in a concise, contextual way as you redesign. Related account information is maintained in both `cast.js` and lens-specific data; watch for drift rather than adding another competing copy.

## Your creative ownership

Give B and C the same quality of visual reasoning as A, and make the journey through the full site feel authored as one piece. The following are **invitations, not prescribed layouts**:

- B could expose a reader’s need and the kind of support available, with photographs serving as inspectable evidence. Do not stitch unrelated observations and a published health programme into one invented person’s journey.
- C could make continuity and change legible in a stable composition, then reveal the guide’s route into a new circle. Avoid implying measured relationship strength, frequency or causation that we do not have.
- Let scrolling and interaction change understanding: reveal a contrast, follow a dependency, compare an account, or inspect proof. A polished static state is also valuable. More motion is not itself the goal.

Keep the strong assets: immediate title-to-model entry; the miniature and its evidence cards; authentic field photographs and detail inspection; the palette and type relationships; the small characterful icons; useful chapter navigation; the ledger’s treatment of unknowns; and research depth on request. They can be redesigned when a stronger idea warrants it. Do not force quantitative graphics onto qualitative evidence just to resemble A.

## Current repository and preview — start here

- **Repository:** [bobshenruililin/jamie-crossing-lives-site](https://github.com/bobshenruililin/jamie-crossing-lives-site)
- **Reviewed main commit:** `008d77bac15c6ab371e07b4375db54c32d52b2af`. Main and GitHub Pages already contain the reviewed edition. Older “nothing merged” notes describe historical checkpoints.
- **This handoff branch:** `docs/opus-section-direction-20261106`, based on that main commit. This update contains documentation and review captures only; no runtime changes.
- **Live:** [main story](https://bobshenruililin.github.io/jamie-crossing-lives-site/), [A](https://bobshenruililin.github.io/jamie-crossing-lives-site/#choices), [B](https://bobshenruililin.github.io/jamie-crossing-lives-site/#services), [C](https://bobshenruililin.github.io/jamie-crossing-lives-site/#ties). `/feature/` is an equivalent entry point; `/?renderer=gpu` enables the optional GPU model.
- **Unadopted studies:** [three live comparisons](https://bobshenruililin.github.io/jamie-crossing-lives-site/experiments/20261106/) for title legibility, GPU pupil-count placement, and optional guide context. Bob has not selected them. Evaluate freely; do not treat them as approved changes or copy their experiment-specific imports wholesale.

Start a fresh implementation branch from current `main`; check for newer commits before working. The older `claude/keen-cerf-j2szmo` branch predates subsequent evidence and responsive fixes. The public worktree was clean at the start of this handoff. Do not overwrite the separate private authoring repository or its uncommitted photo-ledger work.

| Files | Purpose |
| --- | --- |
| `index.html` | Authored story, including lens headlines, C’s circles and conclusion |
| `feature/edition.js`, `edition.css`, `grammar.js` | Page orchestration, shared visual system, evidence and motion helpers |
| `feature/lens-choices.js`, `lens-services.js`, `lens-ties.js`, `ties-icons.js` | The three lens renderers and C’s icon artwork |
| `feature/cast.js`, `signature.js`, `ledger.js` | Public account paraphrases, photo records, life signatures and comparison |
| `feature/miniature.js`, `world-gpu.js`, `photo-type.js`, `echo.js` | Opening world, optional GPU renderer, photo title and Johor model |
| `tools/sync-feature-alias.py` | Generates `feature/index.html` from root; do not maintain both manually |

In `edition.css`, compare `.rs-row`’s stable three-column grammar with `.tr-view`’s replacement panel and `.ties-city ul`’s auto-filled icon grid. These are different reading tasks built with the same visual system, not differences in framework sophistication. Most of A’s explanatory value is present without animation.

**Export hazard:** the private source’s older `app/feature/` has not been ported to this edition. Exporting it now can overwrite this work. Use the [private-source port list](WEBSITE-EDITION-20261105.md#porting-to-the-private-source-appfeature) when synchronization is actually undertaken. The public runtime is the working implementation baseline.

## Evidence and publication boundaries

The visual direction is open; research meaning is not a design variable. Use the existing public paraphrases and source links. Ask dot to check private Script v3 / Appendix 2 if a new claim needs support. Do not place private documents, raw interviews, identifying details or new original photographs into this public repo.

Preserve the corrections already made: pupil homes are Mainland, city unspecified; the manager’s shopping is not assigned to Sheung Shui; the parent’s arrangement is not established; the resident has no disclosed institution; the ledger contains eight selected accounts plus an official count. Observations, reported experiences, published figures, forecasts and proposals remain distinct. Locations in the miniature are illustrative, not measured geography.

The **Work in progress** masthead label and first-visit popup remain required. Bob and Jamie have deferred some photo/consent decisions; this brief does not settle them or authorize changes to presentation images, PDFs or git history. The live draft is publicly reachable, but it is not Jamie’s final approval.

## Run, verify and leave a useful checkpoint

No application build is required; serve the repository root:

```sh
python3 -m http.server 4188 --bind 127.0.0.1
# http://127.0.0.1:4188/ and /feature/
```

With Node and Playwright/Chromium available:

```sh
python3 tools/sync-feature-alias.py
node tools/check-site.js
node tools/check-site.js http://127.0.0.1:4188/feature/
# If changing the existing comparison:
node tools/check-visual-studies.js
```

The test files document dependency setup. `CHROME_PATH` can select an installed Chrome; `HEADFUL=1` on the visual-studies check permits native GPU inspection. Treat fallback rendering as fallback, not a WebGPU pass.

**Verification already recorded:** 88/88 core checks on each local entry point; 23/23 comparison checks locally and live; earlier live smoke checks; native Chrome/Apple Metal GPU captures. [Details and limits](VISUAL-STUDIES-20261106.md).

**This review:** inspected current live sections in Chrome 157 at 1440×900 and 390×844, with reduced motion; exercised guide switching and a service-panel change; no observed page errors or page-width overflow. [Selected captures](opus-direction-20261106/README.md) ground the design discussion. The complete regression suite was not rerun for this documentation-only update. Physical phones, Safari, Firefox and a screen reader remain unverified; a missing favicon is a known issue. Do not describe viewport emulation as a real-device test.

Build a convincing candidate, inspect it in the browser, and leave a small number of meaningful commits. At each useful checkpoint record: what the reader now understands; files changed; actual preview/interaction captures; evidence questions; checks run and their limits; branch and commit. Update tests when intended interactions change, while retaining evidence and accessibility coverage. Bob will review the candidate before another merge/deployment.

For help, leave a concrete request in your checkpoint or response for **dot**, relayed by Bob: the image’s narrative purpose, required subject/crop and dimensions; the exact claim needing source verification; or the test/device you cannot access. Dot can locate approved field photos, check private research, help generate clearly illustrative artwork, or inspect the result. Do not invent a participant, claim a contextual photo shows their actual premises, or wait for a new asset when the existing evidence can carry a strong design.

**The brief is a starting point. Use your judgment to make the experience clearer, more particular to this research, and more memorable.**
