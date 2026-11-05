# Three visual studies · 6 November 2026

The reviewed website runtime, commit `721631f`, was deployed to the existing GitHub Pages site at Bob's explicit request. The Work in progress label and first-visit popup remain. The following experiments are separate comparisons, **not adopted changes to the main reading path**.

Review: [`experiments/20261106/`](../experiments/20261106/index.html). Each study has a Current / Proposal switch, an interactive page, desktop screenshots and a phone-size capture. The full-size link opens the same study without the review frame. No feedback is sent to a server.

## What is being compared

| Study | Observed issue | Experiment | Trade-off |
| --- | --- | --- | --- |
| 01 · Title | The first line becomes a faint dashed outline after its photographs move. | Leave a solid ink silhouette behind. Preserve the same tiles, photographs, travel, hover/rewind, replay and photo viewer. | More readable at rest; less of the original ghost effect. |
| 02 · Pupil count | The school-level breakdown crosses the School pin in the native GPU scene. | Put the three counts in a separate strip below the drawing. Retain all 16,139 points, the crossing and the model controls. | Clearer quantities, with a little less vertical drawing space. |
| 03 · Guide | The concise tour leaves out useful context behind a choice. | Add a collapsed “What changed for her?” note, with three short details and a family-visits link back to the model. | More depth on request; a longer section when expanded. |

The reference is the approved Opus design itself. Its palette, type, photographs, model geometry, evidence language and native interactions remain the starting point. No external visual assets, new framework or motion library were introduced.

The guide's public paraphrases are supported by saved Script v3, Lens A and Lens C, and the fuller account in Appendix 2: a long-held ambition, earlier career expectations, financial preparation and a qualification lead through friends. No salary amounts, institution, invented chronological detail or new participant identifier is added. Raw source records remain private.

## Actual verification

- The live main website returned HTTP 200 and displayed the new edition, WIP popup, corrected pupil scope and infrequent-crossing cue. The photo viewer and Enlarge at 844×390 worked, without page overflow or observed JavaScript errors.
- The isolated comparison passed **23/23 checks**, including actual rendering changes, reduced-motion replay, title photograph access, native GPU count-key placement, school evidence, disclosure controls, keyboard use, model links, the phone-width control and 320/390/844/1440px review-page widths.
- Desktop captures: **1440×900, DPR 1**, Chrome **157.0.8103.38**, macOS **15.7.7**, arm64. The pupil comparison used native, headed **WebGPU on Apple Metal**; no off-screen or unsafe-renderer mode.
- Phone captures: **390×844, DPR 1**, Chrome touch/viewport emulation with reduced motion. These are **not physical-phone tests**.
- Every proposed desktop treatment and the phone compositions were viewed. Replay and source-photo opening remain functional; the guide's link opens “Family in Hong Kong”. The separate count strip does not overlap the School pin.
- The initial comparison test read three iframe responses too early. A diagnostic run confirmed the actual interactions worked; the rerunnable test now waits for the relevant state before asserting it.
- Known existing issue: the missing site favicon can return 404. Physical iPhones/Android devices, Safari, Firefox and screen-reader behavior are not verified. If WebGPU is unavailable, the comparison identifies the SVG fallback and points readers to the captured GPU screenshots.

## Reproduce or adopt selectively

```sh
python3 -m http.server 4188 --bind 127.0.0.1
# Open http://127.0.0.1:4188/experiments/20261106/
node tools/check-visual-studies.js
# Optional: CHROME_PATH=/path/to/chrome HEADFUL=1 node tools/check-visual-studies.js
```

The test needs Playwright. `HEADFUL=1` permits native WebGPU testing; headless fallback is reported rather than called a GPU pass.

- `tools/build-visual-studies.py` creates the isolated `study.html` from the reviewed root page, adjusts links and adds the guide disclosure. It does not edit the root page.
- Only the study page's import map selects the experimental `photo-type.js` and `miniature.js`. Their shared research data, images and other modules come from the current site. `study.css` and `study-bridge.js` apply only inside the comparison.
- For adoption, transfer the selected component changes into `feature/`, remove study-only switches, and regenerate `/feature/` with `tools/sync-feature-alias.py`. Do not copy the lab modules wholesale: their import paths deliberately point back to the main site.
- The older private-source runtime has still not been ported. Do not export over the current public runtime or erase the comparison. Use the port list in [the edition notes](WEBSITE-EDITION-20261105.md#porting-to-the-private-source-appfeature).

No presentation, PDF, photograph or photo label was changed for these experiments. Bob's choice of which proposals to adopt remains pending.
