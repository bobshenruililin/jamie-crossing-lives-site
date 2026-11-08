/* Lens A — livelihoods and choices.
   Reasons are paraphrased accounts. Spending comparisons use the March 2025
   Gao, Han and Song working paper, January–May 2024 selected AlipayHK users.
   Exact prose-supported values and approximate service shares stay distinct. */
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

const SOURCE = 'https://www.michael-song.org/uploads/4/8/1/4/48141215/hongkongers_in_mainland.pdf#page=12';

/* Use prose-supported figures from the same paper/sample, not the different
   CUHK release. Do not assign precise values to Figure 8's unlabelled bars. */
export function initBasket(host) {
  const bar = (place, value, tone, approximate = false) => `<div class="spend-row"><span>${place}</span><div class="spend-track"><i class="${tone}" style="width:${value}%"></i></div><b>${approximate ? '≈' : ''}${value}%</b></div>`;
  host.innerHTML = `<figure class="basket basket-clear">
    <p class="bk-period">Selected AlipayHK cross-border spenders · January–May 2024</p>
    <div class="spend-panels">
      <section aria-label="Services as a share of all recorded spending"><h4>Services</h4><p class="spend-unit">Share of all recorded spending in each place</p>${bar('Mainland China',49,'sz')}${bar('Hong Kong',12,'hk')}<p class="spend-question">Who uses these services? Occasional visits, or lives spanning both places?</p></section>
      <section aria-label="Retail and dining as a share of all recorded spending"><h4>Retail + dining</h4><p class="spend-unit">Share of all recorded spending in each place</p>${bar('Mainland China',42,'sz')}${bar('Hong Kong',86,'hk')}</section>
    </div>
    <section class="service-breakdown" aria-label="Life services as a share of services spending"><h4>Inside services: life services</h4><p class="spend-unit"><b>Different denominator:</b> share of services spending only</p>${bar('Mainland China',80,'sz',true)}${bar('Hong Kong',25,'hk',true)}<p class="life-examples"><b>Examples:</b> cleaning and garment care; personal care and beauty; water, electricity and gas bills.</p><p class="fine">The remaining services include medical, educational, recreational, car and repair, business, other professional and other services. No precise shares are assigned to the paper’s unlabelled bars.</p></section>
    <figcaption>${evidenceGlyph('published')} Gao, Han &amp; Song, March 2025, Figure 8 and accompanying text. Each bar has a zero baseline and a 100% scale.</figcaption>
    <details class="source-note"><summary>Source and limits</summary><p>Services account for 49% of selected users’ recorded Mainland spending. Life services account for approximately 80% of those services, or roughly 40% of all Mainland spending. These denominators are not interchangeable.</p><p>Selected AlipayHK cross-border spenders are not all Hong Kong residents or all spending. Mainland China is broader than Shenzhen. The published breakdown does not identify which people maintain lives on both sides, or how much Hong Kong spending was displaced.</p><a href="${SOURCE}" target="_blank" rel="noopener">Read the paper, Figure 8 (PDF page 12) ↗</a></details>
  </figure>`;
}
