/* Lens A — livelihoods and choices.
   1. Reasons: what each account says draws an activity across, and what keeps
      it local. Paraphrased from Script v3, slide 10.
   2. Basket: CUHK research release, Figure 3 (19 June 2025). Exact printed
      shares; shares of recorded spending within each location, not a common
      budget. Hong Kong's rounded labels total 101% and are preserved. */
import { byId } from './cast.js';
import { evidenceGlyph, esc } from './grammar.js';

const REASONS = [
  { id: 'repair',      sz: ['Parts and expertise for older equipment'] },
  { id: 'dining',      sz: ['Choice · space · price'], note: 'Online options, too, when local shops lack stock.' },
  { id: 'guide',       sz: ['Preferred work · lower living costs'], note: 'Lower earnings too; she prepared before moving.' },
  { id: 'manager',     hk: ['Most shopping stays local'], sz: ['Meals, about once a month'] },
  { id: 'ss-resident', hk: ['Crowding limits crossings'], note: 'Visits are infrequent.' },
  { id: 'parent',      hk: ['A child’s Hong Kong activities leave little time'], szMaybe: ['Might visit, with childcare and half a day'] }
];

export function initReasons(host) {
  const rows = REASONS.map(row => {
    const person = byId[row.id];
    const hk = (row.hk || []).map(t => `<li class="reason">${esc(t)}</li>`).join('');
    const sz = [...(row.sz || []).map(t => `<li class="reason">${esc(t)}</li>`), ...(row.szMaybe || []).map(t => `<li class="reason is-conditional">${esc(t)}</li>`)].join('');
    return `<li class="rs-row">
      <ul class="rs-hk" aria-label="Keeps it local">${hk}</ul>
      <p class="rs-who">${esc(person.name)}</p>
      <ul class="rs-sz" aria-label="Draws them across">${sz}</ul>
      ${row.note ? `<p class="rs-note">${esc(row.note)}</p>` : ''}
    </li>`;
  }).join('');
  host.innerHTML = `<figure class="reasons">
    <div class="rs-head" aria-hidden="true"><span class="rs-head-hk">Keeps it in Hong Kong</span><span class="rs-head-sz">Draws it to Shenzhen</span></div>
    <ol class="rs-rows">${rows}</ol>
  </figure>`;
  const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { host.firstElementChild.classList.add('is-seen'); observer.disconnect(); } });
  }, { threshold: .25 }) : null;
  if (observer) observer.observe(host); else host.firstElementChild.classList.add('is-seen');
}

const CATEGORIES = [
  { id: 'services', label: 'Services', mainland: 47, hk: 12 },
  { id: 'retail', label: 'Retail', mainland: 28, hk: 58 },
  { id: 'food', label: 'Food & beverages', mainland: 16, hk: 29 },
  { id: 'other', label: 'Other sectors', mainland: 9, hk: 2 }
];
const SOURCE = 'https://socsc.cuhk.edu.hk/voicedetails/research-release-on-hong-kong-travelers-in-mainland-china-official-data-e-wallet-data-model-analysis-reveals-hong-kong-residents-mainland-consumption-trends/';
const MAX = 60;

export function initBasket(host) {
  const ticks = [0, 20, 40, 60];
  const rows = CATEGORIES.map((c, index) => {
    const series = name => index === 0 ? `<i class="bk-series">${name}</i>` : '';
    const lo = Math.min(c.mainland, c.hk), hi = Math.max(c.mainland, c.hk);
    const mainlandHigher = c.mainland > c.hk;
    return `<li class="bk-row" data-category="${c.id}" tabindex="0" aria-label="${esc(c.label)}: Mainland China ${c.mainland}%, Hong Kong ${c.hk}% of recorded spending">
      <span class="bk-label">${esc(c.label)}</span>
      <span class="bk-track" aria-hidden="true">
        ${ticks.map(t => `<i class="bk-grid" style="left:${t / MAX * 100}%"></i>`).join('')}
        <span class="bk-span ${mainlandHigher ? 'to-mainland' : 'to-hk'}" style="left:${lo / MAX * 100}%;width:${(hi - lo) / MAX * 100}%"></span>
        <span class="bk-dot dot-mainland ${mainlandHigher ? 'is-high' : 'is-low'}" style="left:${c.mainland / MAX * 100}%">${series('Mainland')}<b>${c.mainland}%</b></span>
        <span class="bk-dot dot-hk ${mainlandHigher ? 'is-low' : 'is-high'}" style="left:${c.hk / MAX * 100}%">${series('Hong Kong')}<b>${c.hk}%</b></span>
      </span>
    </li>`;
  }).join('');
  host.innerHTML = `<figure class="basket">
    <ol class="bk-rows">${rows}</ol>
    <div class="bk-axis" aria-hidden="true"><span></span><span class="bk-axis-track">${ticks.map(t => `<b style="left:${t / MAX * 100}%">${t}${t === MAX ? '%' : ''}</b>`).join('')}</span></div>
    <div class="visually-hidden"><table><caption>Share of recorded spending within each location, seasoned AlipayHK users</caption><thead><tr><th scope="col">Category</th><th scope="col">Mainland China</th><th scope="col">Hong Kong</th></tr></thead><tbody>${CATEGORIES.map(c => `<tr><th scope="row">${esc(c.label)}</th><td>${c.mainland}%</td><td>${c.hk}%</td></tr>`).join('')}</tbody></table></div>
    <figcaption>${evidenceGlyph('published')} Share of recorded spending within each place, among seasoned AlipayHK users · CUHK, June 2025</figcaption>
    <details class="source-note"><summary>Source and limits</summary>
      <p>Services are 47% of recorded Mainland spending—the largest category, not a majority. Hong Kong’s published labels are rounded and total 101%; the chart keeps them as printed.</p>
      <p>“Seasoned” users registered and started before 30 June 2021, with transactions after 1 January 2022. These users do not represent all residents or all spending, and identical membership in both panels is not established. Mainland China is broader than Shenzhen.</p>
      <p>The shares do not measure spending displaced from Hong Kong, explain individual motives or establish a causal effect.</p>
      <a href="${SOURCE}" target="_blank" rel="noopener">Read the CUHK release and original figure ↗</a>
    </details>
  </figure>`;
}
