# When lives span a border

Working presentation and research website for Jamie Ko’s AsiaGlobal Fellows research.
Research and presentation: Jamie Ko. Visualization: Bob.

The current edition follows **Script v4 and Jamie’s 7 November feedback**. It draws on
**sixteen individual and group conversation occasions**, three Shenzhen trips, a
Hong Kong–Shenzhen Innovation and Technology Park visit and a Sheung Shui walk,
alongside published research. Sixteen counts occasions, not unique people. Wider
AGF sessions inform the closing reflections separately.

The study is exploratory and Hong Kong-centred, informing questions for
Singapore–Johor. Accounts, observations, statistics, programme descriptions,
forecasts and preliminary ideas retain their different meanings. The website
and its first-visit notice remain marked **Work in progress**.

## Open the website and presentation

Serve the repository root:

```sh
python3 -m http.server 4188 --bind 127.0.0.1
```

- `/` — current visual research story; `/feature/` is the equivalent entry point.
- `/presentation.html` — 24 slides with manual reveals, source notes and a slide picker.
- `/presentation.pdf` — matching static v4 deck, with all evidence visible.
- `/research.html` — earlier data companion, retained as a reference.

The planned presentation duration is 25 minutes, not a measured rehearsal. The
separately delivered venue PowerPoint preserves the slide layout but has no
editable text or interactive reveals. The original r2154 PDF is retained at
`presentation-r2154.pdf`.

Edit `index.html`, then run `python3 tools/sync-feature-alias.py` to update the
alias. Website components live in `feature/`; public account descriptions are in
`feature/cast.js`. The miniature is an explanatory illustration, not measured
geography. Field photographs were supplied by Bob and Jamie. Font licences are
in `fonts/`.

## Verify changes

The browser checks use Playwright with Chromium; `CHROME_PATH` can select an
installed Chrome executable. With the server running:

```sh
node tools/check-feedback.js
node tools/check-site.js
node tools/check-site.js http://127.0.0.1:4188/feature/
node tools/check-presentation.js
node tools/check-connected-review.js
node tools/check-visual-studies.js
```

[Website changes](docs/WEBSITE-FEEDBACK-20261107.md),
[presentation changes](docs/PRESENTATION-V4.md), and
[integration checks](docs/V4-INTEGRATION-20261108.md) record the scope and limits.

## Historical design reviews

The [November 6 review](review/connected-20261106/) runs a frozen candidate in
`snapshot/`; its original screenshots and recordings are preserved. The
[earlier experiments](experiments/20261106/) also use that frozen runtime.
They are historical comparisons, not the current reader experience. Removed
animation, measurement menus and the route game remain only in these archives
and earlier reference assets.

This public repository contains only audience materials and public sources.
Raw research, script comments and editable authoring sources remain separate.
The older private exporter must not overwrite this edition until its source
and allowlist have been ported. This working draft is not final research approval
by Jamie.
