/* Lens C — relationships and support.
   Two accounts, placed by what each person described (Script v3, slide 18).
   City placement shows reported connections—not frequency, distance,
   relationship strength or a representative pattern. */
import { tieIcons } from './ties-icons.js';
import { evidenceGlyph, esc } from './grammar.js';

const PROFILES = [
  {
    id: 'resident', label: 'Resident with Shenzhen ties',
    hk: [{ icon: 'rental', label: 'Rented home', kind: 'base' }, { icon: 'work', label: 'Work', kind: 'base' }],
    sz: [{ icon: 'property', label: 'Property', kind: 'tie' }, { icon: 'family', label: 'Close family', kind: 'tie' }, { icon: 'friends', label: 'Friends', kind: 'tie' }, { icon: 'activities', label: 'Shopping and activities', kind: 'tie' }],
    reading: 'She works and rents in Hong Kong—but described Shenzhen as home.',
    note: 'Property is her explanation of home. A regular commute is not established.'
  },
  {
    id: 'guide', label: 'Guide who moved north',
    hk: [{ icon: 'family', label: 'Family visits', kind: 'tie' }],
    sz: [{ icon: 'home', label: 'Home', kind: 'base' }, { icon: 'community', label: 'Community life', kind: 'tie' }, { icon: 'guiding', label: 'Guiding friendships', kind: 'tie' }],
    moved: true,
    reading: 'Moving home did not move every connection.',
    note: 'Her guiding workplace is not established in this account.'
  }
];

const tile = item => `<li class="tie tie-${item.kind}"><span class="tie-icon" aria-hidden="true"><svg viewBox="0 0 120 112" focusable="false">${tieIcons[item.icon]}</svg></span><span class="tie-label">${esc(item.label)}</span></li>`;

export function initTies(host) {
  host.innerHTML = `<figure class="ties">
    <div class="ties-switch" role="group" aria-label="Choose whose ties to explore">${PROFILES.map((p, i) => `<button type="button" data-profile="${p.id}" aria-pressed="${i === 0}">${esc(p.label)}</button>`).join('')}</div>
    <div class="ties-board">
      <div class="ties-city city-hk"><h3>Hong Kong</h3><ul></ul></div>
      <span class="ties-boundary" aria-hidden="true"><span class="ties-moved" hidden>Home moved <svg viewBox="0 0 40 12"><path d="M1 6h34M30 1l6 5-6 5"/></svg></span></span>
      <div class="ties-city city-sz"><h3>Shenzhen</h3><ul></ul></div>
    </div>
    <p class="ties-reading" aria-live="polite"></p>
  </figure>`;
  const figure = host.firstElementChild;
  const [hk, sz] = figure.querySelectorAll('.ties-city ul');
  const buttons = [...figure.querySelectorAll('[data-profile]')];
  function set(id) {
    const p = PROFILES.find(x => x.id === id);
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.profile === id)));
    hk.innerHTML = p.hk.map(tile).join('');
    sz.innerHTML = p.sz.map(tile).join('');
    hk.setAttribute('aria-label', `${p.label}: reported ties in Hong Kong`);
    sz.setAttribute('aria-label', `${p.label}: reported ties in Shenzhen`);
    figure.querySelector('.ties-moved').hidden = !p.moved;
    figure.querySelector('.ties-reading').textContent = p.reading;
    figure.dataset.profile = id;
    figure.classList.remove('is-swapping'); void figure.offsetWidth; figure.classList.add('is-swapping');
  }
  figure.addEventListener('click', event => { const b = event.target.closest('[data-profile]'); if (b) set(b.dataset.profile); });
  figure.querySelector('.ties-switch').addEventListener('keydown', event => {
    const i = buttons.indexOf(document.activeElement);
    if (i < 0 || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const next = buttons[(i + 1) % buttons.length];
    next.focus(); set(next.dataset.profile);
  });
  set('resident');
}

/* Singapore–Johor forecast: hatched bars mark a projection, not realised spending. */
export function initForecast(host) {
  const rows = [
    { label: 'Singapore consumers spending in Johor Bahru', value: 1050, display: 'S$1.05bn', side: 'out' },
    { label: 'Johor Bahru consumers spending in Singapore', value: 756, display: 'S$756m', side: 'in' }
  ];
  host.innerHTML = `<figure class="forecast">
    <p class="fc-kicker">${evidenceGlyph('forecast')} Forecast extra spending each year, once the RTS Link opens</p>
    <ol class="fc-rows">${rows.map(r => `<li class="fc-row fc-${r.side}"><span class="fc-label">${esc(r.label)}</span><span class="fc-track"><span class="fc-bar" style="width:${r.value / 1200 * 100}%"></span></span><strong>${r.display}</strong></li>`).join('')}</ol>
    <div class="fc-axis" aria-hidden="true"><span></span><span class="fc-axis-track"><b style="left:0">0</b><b style="left:50%">S$600m</b><b style="left:100%">S$1.2bn</b></span><span></span></div>
    <p class="fc-net">Net, about <strong>S$290 million</strong> more consumer spending would flow out of Singapore than in—a forecast, not lost GDP.</p>
    <figcaption>A study commissioned by SBF, RAS and SRA, July 2026. <a href="https://www.sbf.org.sg/newsroom/media/press-releases/detail/rts-link-could-reshape-cross-border-consumer-spending--spotlighting-both-opportunities-and-challenges-for-singapore-retail-and-f-b" target="_blank" rel="noopener">Summary ↗</a> <a href="https://www.sbf.org.sg/docs/default-source/advocacy-policy/sbf-rts-study_final-report-16-jul.pdf?sfvrsn=b7ba6722_1" target="_blank" rel="noopener">Full report ↗</a></figcaption>
  </figure>`;
}
