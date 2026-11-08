# Script v4 integration · 8 November 2026

Integrated the prepared November 7 website and presentation against public main
`ebad522abcbcd5d1299d3ba0a9adfc5ca7ea1d6e` on `codex/jamie-v4-20261108`.
The original patch applied cleanly. Raw scripts, comments, private artifact links
and the enclosing delivery package are excluded from this repository.

## Presentation continuity

The 24 SVG frames, PDF, presentation data, HTML player and player script are
byte-for-byte identical to the already-delivered November 7 package: 28 files.
No slide redesign or regeneration occurred during integration.

PDF SHA-256: `ebbff12a3df2daf623dbe02de25227161c34f8780bf650055a442577b351eff5`.

All 24 slides were rendered and visually inspected locally. No text bounding
box extended beyond the 1600 × 900 slide frame. Manual reveals, motion-off final
states, source notes, scene selection, old slide aliases and keyboard navigation
were checked in the browser. The separate self-contained player was also opened
directly as a local file, closing an earlier verification gap.

## Website feedback coverage

- Readable static opening; four-row symbol explanation; arrangement-level navigation.
- Model cards positioned away from their selected side, with a bounded scroll area.
- Same-paper spending comparisons, service detail with its own denominator and employment context.
- Field observations before healthcare; text-only observations have no empty photo panel.
- Government healthcare intention distinguished from programme participation and outcomes.
- Static two-account relationship comparison, with no home replay or facet switching.
- Published Singapore–Johor panels numbered to match markers 5 and 6.
- Clearer research route, with Hong Kong–Shenzhen studies before Singapore–Johor studies.
- Explicit Arup framework attribution and explanation of the adapted lenses.
- Very preliminary inquiry labelled as such; measurement menus and route game removed from the current route.
- Work-in-progress notice and header label retained.

Two additional corrections during reconciliation: opening navigation now says
“Arrangements”, and the guide’s work note retains the clarified multi-destination
schedule. It does not assign her six-month Shenzhen/Hong Kong period to one city
or invent a split. The static relationship graphic remains focused on home and ties.

The fuller guide account remains available on the website; its age-related work
episode was removed from the spoken presentation, as v4 specifies, rather than
treated as withdrawn research evidence.

## Historical review isolation

The November 6 review previously controlled the current website directly. The
v4 removal of relationship controls made that review throw an error. Its preview
now uses a frozen public runtime in `review/connected-20261106/snapshot/`, labelled
as an archive. The earlier visual experiments use the same frozen dependencies.
Original screenshots and recordings remain unchanged. The snapshot records
source hashes in `provenance.json`; presentation links lead to the current files.

## Checks and limits

- Source feedback checks: **26/26**.
- Website interactions and layouts: **97/97** on `/` and **97/97** on `/feature/`.
- Presentation player: **84/84**; separate direct-file offline player: **83/83**.
- Archived review: **24/24**; isolated visual studies: **23/23** (WebGPU observed).
- Both website entry points have valid local resource links; changed JavaScript parses.
- Original delivered presentation files match; source links expose no private documents.
- `git diff --check` passes.

Two test assumptions were corrected: a final short research panel can be fully
visible at the document bottom without reaching the header; and a native dialog’s
queued close event must complete before checking its saved acknowledgement.
Neither required weakening the reader-facing behavior or changing the popup.

Layouts were exercised at widths from 320 to 1440 pixels, with emulated touch
where appropriate. These are Mac Chrome checks, not physical-phone, screen-reader,
Safari or Firefox tests. Native Microsoft PowerPoint was not tested; the venue
PowerPoint remains the separately delivered fixed-layout copy. The 25-minute
timing is an authoring plan, not a measured rehearsal.

The older private authoring/export pipeline has not been ported. It must not
overwrite these v4 audience files until that work is reconciled explicitly.
