/* CUHK research release, Figure 3, 19 June 2025. Exact printed shares;
   transcription and source-version limits: authoring/alipay-spending-20261101.json.
   Shares refer to recorded spending within each location, not a common budget. */
const categories = [
  {id: 'services', label: 'Services', mainland: 47, hongKong: 12,
    insight: 'Services were the largest Mainland category—close to half.'},
  {id: 'retail', label: 'Retail', mainland: 28, hongKong: 58,
    insight: 'Retail made up the largest share in Hong Kong.'},
  {id: 'food-beverages', label: 'Food & beverages', mainland: 16, hongKong: 29,
    insight: 'Food and beverages took a larger share of Hong Kong spending.'},
  {id: 'other', label: 'Other sectors', mainland: 9, hongKong: 2,
    insight: 'Other sectors accounted for a small share in both places.'}
];
const places = [
  {id: 'mainland', label: 'Mainland China'},
  {id: 'hongKong', label: 'Hong Kong'}
];
const sourceUrl = 'https://socsc.cuhk.edu.hk/voicedetails/research-release-on-hong-kong-travelers-in-mainland-china-official-data-e-wallet-data-model-analysis-reveals-hong-kong-residents-mainland-consumption-trends/';
let instance = 0;

function panelMarkup(place, uid) {
  return `<section class="spc-panel spc-${place.id}" aria-labelledby="${uid}-${place.id}">
    <h4 id="${uid}-${place.id}">${place.label}</h4>
    <ul class="spc-plot" aria-label="${place.label}: share of recorded spending">
      ${categories.map(category => `<li class="spc-row${category.id === 'services' ? ' is-selected' : ''}" data-category="${category.id}">
        <span class="spc-category">${category.label}</span>
        <div class="spc-measure"><span class="spc-track" aria-hidden="true"><span class="spc-bar" style="width:${category[place.id] / 60 * 100}%"></span></span><strong class="spc-value">${category[place.id]}%</strong></div>
      </li>`).join('')}
    </ul>
    <div class="spc-axis" aria-hidden="true"><span>0</span><span>20</span><span>40</span><span>60%</span></div>
  </section>`;
}

/** Paired descriptive shares. Selection changes emphasis, never the scale or data. */
export function initSpendingComparison(host) {
  if (!host) return {setCategory() { return false; }, destroy() {}};
  const uid = `spending-comparison-${++instance}`;
  const figure = document.createElement('figure');
  figure.className = 'spc-comparison';
  figure.setAttribute('aria-labelledby', `${uid}-title`);
  figure.innerHTML = `<header class="spc-heading"><p class="spc-kicker" id="${uid}-title">Recorded spending / CUHK · published June 2025</p></header>
    <div class="spc-controls" role="group" aria-label="Compare a spending category">${categories.map(category => `<button type="button" data-spending-category="${category.id}" aria-pressed="${category.id === 'services'}" aria-controls="${uid}-charts">${category.label}</button>`).join('')}</div>
    <div class="spc-charts" id="${uid}-charts">${places.map(place => panelMarkup(place, uid)).join('')}</div>
    <p class="spc-insight" aria-live="polite" aria-atomic="true">${categories[0].insight}</p>
    <figcaption class="spc-caption">Share of recorded spending within each location · seasoned AlipayHK users</figcaption>
    <details class="spc-source"><summary>Source and limits</summary>
      <p>CUHK research release, Figure 3 · 19 June 2025. Services are 47% of Mainland spending, not a majority. Hong Kong shares total 101% because the published labels are rounded; the chart preserves them.</p>
      <p>The denominator is recorded spending within each place. These selected AlipayHK users do not represent all residents or all spending. “Seasoned” means registered and started before 30 June 2021, with transactions after 1 January 2022. The Mainland description specifies users with Mainland transactions; identical membership in both panels is not established. The release does not state Figure 3’s observation window.</p>
      <p>Mainland China is broader than Shenzhen. These shares do not measure spending displaced from Hong Kong, explain individual motives or establish a causal effect.</p>
      <a href="${sourceUrl}" target="_blank" rel="noopener">Read the CUHK release and original figure ↗</a>
    </details>`;
  host.replaceChildren(figure);

  const buttons = [...figure.querySelectorAll('[data-spending-category]')];
  const rows = [...figure.querySelectorAll('.spc-row')];
  const insight = figure.querySelector('.spc-insight');
  let selected = 'services';
  let destroyed = false;

  function setCategory(id) {
    const category = categories.find(item => item.id === id);
    if (!category || destroyed) return false;
    if (id === selected) return true;
    selected = id;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.spendingCategory === id)));
    rows.forEach(row => row.classList.toggle('is-selected', row.dataset.category === id));
    // Always retain all eight exact values, so the comparison works without an action.
    insight.textContent = category.insight;
    return true;
  }

  function click(event) {
    const button = event.target.closest('button[data-spending-category]');
    if (button && figure.contains(button)) setCategory(button.dataset.spendingCategory);
  }
  function keydown(event) {
    const index = buttons.indexOf(event.target);
    if (index < 0) return;
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + buttons.length - 1) % buttons.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = buttons.length - 1;
    else return;
    event.preventDefault();
    setCategory(buttons[next].dataset.spendingCategory);
    buttons[next].focus();
  }
  figure.addEventListener('click', click);
  figure.addEventListener('keydown', keydown);

  return {
    setCategory,
    destroy() {
      destroyed = true;
      figure.removeEventListener('click', click);
      figure.removeEventListener('keydown', keydown);
      figure.remove();
    }
  };
}
