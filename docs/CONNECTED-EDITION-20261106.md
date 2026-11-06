# Connected Lives candidate · 6 November 2026

Website-only candidate on `codex/connected-lives-20261106`, built from main `008d77bac15c6ab371e07b4375db54c32d52b2af`. Nothing in this candidate is merged or deployed. Start the repository with `python3 -m http.server 4188 --bind 127.0.0.1`, then open [the interactive review](http://127.0.0.1:4188/review/connected-20261106/). [Screenshots and recordings](../review/connected-20261106/README.md) are also available directly in the repository.

## What the reader can now see

**B starts with a mechanism.** A care programme connects an eligible Hong Kong follow-up appointment, a Shenzhen clinic, access to records with permission, and a conditional route back. The three controls highlight that actual programme structure. Original SVG buildings are schematic illustrations, not actual architecture, a map, or a recorded patient journey. Participation figures retain their dates and are not presented as outcomes.

This is a deliberate editorial choice: the documented care pathway now precedes the field observations. It gives the section a concrete opening, then broadens to other needs. The photographs are grouped by practical task—arranging things, navigating, finding support—with their locations retained on each item. All nine examples and photo inspection remain. No existing photograph or caption was changed.

**C compares parts of a life on stable rows.** Housing, work and relationships occupy the same positions in both accounts. The guide opens the section, matching the headline about a move and continuing ties. Her home can travel; family visits stay in Hong Kong; the unknown workplace is explicitly unplaced. Selecting a facet preserves the rest as context and carries across account switches. The resident's work/rental housing and Shenzhen property/ties remain distinct. Both previously unused qualifications are now visible.

**A contact does something specific.** The guide's sequence shows a lead from friends, qualification, reluctance to offer work, and someone who intervened. The barrier is visible before clicking; controls reveal the fuller paraphrase. This is one reported experience, not a general rule. New credential and support symbols are category illustrations, not synthetic interviewee portraits or representations of a real document/encounter. Hong Kong and Shenzhen community examples remain separate.

**Questions travel with a reason.** Each Singapore–Johor question can reveal the Hong Kong–Shenzhen observation that prompted it and link back to that lens. Four questions sit together; the survey and rail target are separately labelled published context. The unbuilt miniature and two hatched spending forecasts remain. No forecast became an outcome and no Singapore–Johor finding was invented.

## Design judgment and references

The principal reference was the actual A / Choices section: stable comparisons and evidence visible before interaction. Its strength is not simply more animation: the visual already makes an argument, and the controls let the reader inspect it. Later sections had useful material, but more of their meaning depended on reading changing text. That is a design judgment from inspection, not a measured audience result.

We borrowed that clarity, not A's chart form. B uses a pathway; C uses aligned connections and a reported sequence; Johor connects questions to their origin. Colour and type continue the existing edition. Native CSS, SVG and Web Animations are sufficient; no framework or motion dependency was added.

The frontend-resources skill and the local direct-visual-craft workflow informed rendered inspection. External browsing on 6 November included [Seesaw](https://www.seesaw.website/), its [Parallel Archives entry](https://www.seesaw.website/websites/parallel-archives), and [The Evolution of Trust](https://ncase.me/trust/). Parallel's intro and Trust's opening were inspected, not their full experiences. Trust's readable illustrated symbols were a useful reference for making relationships tangible. No external artwork or code was copied; the established project remains the visual reference.

The care-first order, guide-first order and row/facet composition are provisional creative decisions for Bob's review. They are not Jamie's approval. The presentation, PDFs and private source research were not revised. The pending title/pupil/guide proposals were not adopted; their import map was repaired to keep their isolated modules working with the updated controller's cache version.

## Claim traceability

| Visible treatment | Existing support / boundary |
| --- | --- |
| Care steps and participation | Previously cited Health Bureau replies, 25 February and 31 March 2026; the existing public care component. Eligibility, permission and clinical-need conditions retained. |
| Nine service examples | Existing public `STOPS` and `cast.js` photo records; grouping is editorial, not one person's itinerary. |
| Two account layouts | Public `cast.js` and existing Lens C paraphrases; checked against saved Script v3. No new employer, institution, commute or workplace assigned. |
| The guide's qualification and help | Already-public sequence, supported by the fuller saved Appendix 2 account. The career/move chronology is not reconstructed. |
| Community participation | Existing distinct guide/Shenzhen and dining visitors/Hong Kong accounts. No measured effect inferred. |
| Johor question origins | Existing A/B/C findings and Script v3 questions. Published figures, forecasts and proposals keep their original sources and status. |

Raw source text and participant identifiers remain in the separate private research repository. The private `app/feature/` has still not been ported: do not export its older runtime over this candidate. Photo/consent and presentation-history decisions deferred to Bob and Jamie remain unresolved; this candidate does not decide them.

## Checkpoint 1 · implementation

Commit: `451ea2f35414cfc4456b236da4beade5040982aa` — the website runtime captured in the review assets.

- Browser verification: **99/99 on `/` and 99/99 on `/feature/`**, Chrome 157.0.8103.38.
- Includes 320, 390, 412, 768, 844, 1024, 1099, 1100, 1280 and 1440px layout/touch/keyboard coverage, existing source shelves and evidence regressions, and new care/account/contact/Johor interactions.
- Actual desktop and phone-emulated renders inspected, including the resident, guide, care response, field photographs and Johor layout. A phone control-order issue found in the first render was corrected so the care response remains in view.
- Added an original SVG favicon; no remaining favicon error in these two runs.
- `node --check`, `git diff --check`, and regenerated `/feature/` alias passed.

Physical phones, Safari, Firefox, a screen reader and Jamie's approval remain unverified. The optional GPU renderer is unchanged and has not been revalidated in this candidate pass. These checks establish behavior and rendering, not artistic acceptance or a user-study result.

## Checkpoint 2 · review package

- `review/connected-20261106/` contains a live iframe of the actual candidate, four scene controls, a phone-width switch, four captured before views, twelve candidate screenshots and two WebM recordings of real browser interactions.
- **13/13** capture and interaction checks passed: the home's animation actually runs, family remains stationary, pause cancels the animation, reduced motion settles, phone controls work, and the care response stays in view with its diagram.
- **22/22** review-page checks passed: the first-visit WIP notice remains, controls operate the real candidate, captures load, both videos decode, and the review page fits 320–1440px without observed browser errors.
- **23/23** earlier visual-study regression checks passed after repairing their import map. That isolated pupil study selected WebGPU in this headless Chrome run; this is not a physical-device or full production-GPU validation.
- Candidate capture source is the clean runtime at `451ea2f`, Chrome 157.0.8103.38 on macOS arm64. Screenshots use reduced motion, desktop 1440 × 1000 and phone-emulated 390 × 844 at DPR 1. Recordings use normal motion. See [capture manifest](../review/connected-20261106/assets/manifest.json).
- The four before views were captured from the published site on 6 November. `008d77b` is the fetched main revision, not an independent deployment attestation; this distinction is retained in [the before manifest](../review/connected-20261106/assets/before-manifest.json).
- No raw research, original photo archive, account identifiers or private source documents are included in this review package. Screenshots and recordings contain audience-facing website content only.

The main editorial decision for Bob is the care-first opening of B: it makes one documented mechanism immediately legible, at the cost of delaying the field photographs. The review page lets Bob compare that treatment, the aligned account layout and the contact story in context. These remain editable decisions, not requirements imposed on Jamie.

## Reproduce

```sh
python3 -m http.server 4188 --bind 127.0.0.1
node tools/check-site.js
node tools/check-site.js http://127.0.0.1:4188/feature/
node tools/check-connected-review.js
node tools/check-visual-studies.js
```

Node tests need Playwright with Chromium; `CHROME_PATH` can select installed Chrome. Edit the authored root `index.html`, then run `python3 tools/sync-feature-alias.py`. Do not edit the alias independently.

To regenerate candidate captures, run `node tools/capture-connected-review.js`; Playwright's ffmpeg is also needed for recording. `CAPTURE_DIR` can select a temporary output directory to avoid replacing the checkpoint evidence. The optional `--before` mode recaptures the currently published site and records a new timestamp; it is not a way to reconstruct an earlier deployment.
