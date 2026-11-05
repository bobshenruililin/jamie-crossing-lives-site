# Review request for the original Astra chat — before anything is pushed to `main`

Paste the brief below into the original Astra chat (the one that built the earlier website and holds the saved Script v3 and photo records). It asks for a last check, not a redesign. Nothing has been merged or deployed.

---

**Please do a last pre-publication check of the Crossing Lives website candidate.**

- Branch: `claude/keen-cerf-j2szmo` in `bobshenruililin/jamie-crossing-lives-site`. Nothing is merged or deployed; `main` and GitHub Pages are unchanged.
- Run it from the repository root with `python3 -m http.server 4188 --bind 127.0.0.1`, then open `http://127.0.0.1:4188/` and `/feature/`. The opt-in GPU world is at `/?renderer=gpu`.
- Notes and rationale: `docs/WEBSITE-EDITION-20261105.md` (start at the "RESUME HERE" checkpoint). Rerunnable browser checks: `node tools/check-site.js` (65 checks, Playwright with Chromium).

Please check against the saved Script v3 and photo records, and reply with a list of **must-fix before publishing** versus **could improve later** items:

1. **The new opening slogan.**
   - It reads "Two places, / one life, rearranged."
   - The pieces of "Two" (Sheung Shui driving-school photo) and "places," (Shenzhen towers photo) rearrange into the second line.
   - Does it fairly represent the whole project, including the Singapore–Johor questions, without overclaiming that every life spans both places? Suggest alternative wording if not.
   - "A life doesn't move all at once" now heads the tour's final step.
2. **Factual wording.**
   - Read every visible sentence in the tour, ledger, the three lenses, Singapore–Johor and the conclusion against Script v3.
   - Flag anything that turns a reported account into a fact, a contextual photo into an establishment an interviewee used, a forecast into an outcome, or a proposal into a finding.
3. **Evidence corrections from 5 November.** Confirm they hold everywhere, including the life signatures and the miniature:
   - The schoolchildren's homes are Mainland, not Shenzhen.
   - The manager's shopping is not placed in Sheung Shui.
   - The parent is not "locally based".
   - The resident is anonymised, with no institution.
   - The ledger says "eight selected accounts plus an official count".
4. **Photographs.**
   - Five newly approved derivatives in `feature/assets/`: `hk-crossing-hall.jpg`, `hk-hsitp-sign.jpg` (signage crop), `sz-help-kiosk.jpg` (cropped to the posters), `sz-police-office.jpg` and `sz-community-centre.jpg`.
   - Confirm the crossing-hall location (visible signs: "Futian Port / HSITP", MTR branding) and the kiosk wording (company registration and start-up support; a Hong Kong volunteers poster).
   - Confirm no identifiable person is visible in any published image, and add the five to the private photo ledger. Original SHA-256 prefixes are in the handoff notes.
5. **The unconsented street photograph.** It is removed on this branch (only `sz-services-signage.jpg` is published), but it is still on `main`, in `presentation-frames/15.svg` and probably the presentation PDFs, and in git history. Please decide how to handle those.
6. **Real devices.**
   - Try an iPhone (Safari) and an Android phone (Chrome), plus a desktop browser.
   - Watch for: the slogan's rearrangement and readability; the place words (highlighted phrases that light the model); the tour; the ledger; the services filmstrip; the Singapore–Johor model.
   - Also open `?renderer=gpu` on a device with WebGPU. The sandbox could only verify it off-screen.
7. **Work-in-progress status.** The first-visit popup and the "Work in progress" header label must remain.
8. **Private-source port.** Confirm the file list in "Porting to the private source" before any export, so a later export does not overwrite this work.

Please don't merge or publish; reply with findings, and Bob will decide when to push.

---
