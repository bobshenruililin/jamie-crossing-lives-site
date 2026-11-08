# Website feedback edition · 7 November 2026

This is a local review candidate. No publication, repository push or deployment is part of this update. Presentation changes are handled separately.

## Reader-facing changes

- Static opening title; four signature rows explained; arrangements distinguished from individual accounts.
- Map evidence cards open opposite the selected city's side when space allows, with bounded scrolling and a sticky close control. This is a modest overlap improvement, not a miniature redesign.
- Alipay comparisons use the same March 2025 paper and January–May 2024 selected sample: services 49% / 12%, retail plus dining 42% / 86% (Mainland / Hong Kong). Life services are approximately 80% / 25% of services spending, with a separate denominator and practical examples. No exact values are invented for unlabeled bars. The user-profile question remains a hypothesis.
- June 2025/2026 persons-engaged comparisons added. The official F&B change is under +0.05%; rounded totals do not trace workers after closures.
- Lens B opens with field observations, then government policy intention and the follow-up pilot. Arrival-form and tuition accounts remain text, without empty photo placeholders.
- Lens C shows both accounts in a static graphic. The guide's work itinerary is omitted from that simplified graphic. House flight, replay, profile switching and facet controls are removed.
- Singapore–Johor published panels are numbered 5 and 6. Studies are grouped Hong Kong–Shenzhen first, then Singapore–Johor. Arup's framework is explicitly the source of adapted lenses, not a score.
- Abrupt end-of-lens links, measurement/menu sections and the route game are removed from the reader route. The research desk has a named return link. Future inquiry and learning exchange ideas are very preliminary, with no new commitments.
- Public anonymity, pupil residence boundaries, photograph derivatives and source qualifications are retained. Historical research assets remain preserved outside the simplified route.

## Verification

- `node tools/check-feedback.js`: **24/24 source checks passed**.
- `node --check` passed for changed JavaScript and both test files.
- Website-scoped `git diff --check` passed.
- `/feature/` regenerated from the root source.
- **43/43 cloud Chrome checks passed**, covering all nine retained research shelves, source separation, privacy regressions, source notes, field photographs and Escape/focus, care and contact keyboard controls, chapter Back/Forward, menu dismissal, both entry points and deep-linked shelves.
- Rendered desktop opening, map card, spending charts and research groups inspected. Phone-width spending, text-only services and static relationships inspected. Iframe viewports at 320, 390, 768 and 1100px had no horizontal document overflow after a narrow-header fix.

Phone sizes were viewport inspections, not physical-device or touch emulation. Safari, Firefox, a screen reader and the optional GPU renderer were not tested. The standalone Playwright aggregate `tools/check-site.js` was updated to match the new interface but was not run in this environment; the 43 browser checks used the available cloud-browser interface instead. Preserved historical review recordings are not new captures of this edition.
