const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

/** Build one of the two data stories from the research-data.json snapshot. */
export function initEvidence(element, researchData) {
  const datasets = new Map((researchData?.datasets || []).map(item => [item.id, item]));
  const singapore = element.dataset.evidence === 'singapore';
  const options = singapore ? [['gross', 'Gross flows'], ['net', 'Net balance']] : [['journeys', 'Departures'], ['retail', 'Retail'], ['restaurants', 'Restaurants'], ['capacity', 'Capacity'], ['work', 'Workers']];
  const requested = element.dataset.evidenceView;
  const fixed = Boolean(requested);
  const scriptScope = fixed && element.dataset.evidenceScope === 'script';
  const ids = singapore ? ['flows'] : fixed ? [requested] : options.map(([id]) => id);
  if ((fixed && !options.some(([id]) => id === requested)) || ids.some(id => !datasets.has(id))) {
    element.innerHTML = '<p class="evi-error">The evidence data could not be loaded.</p>';
    return { destroy() {} };
  }

  let selected = requested || (singapore ? 'gross' : 'journeys');
  let paused = document.documentElement.dataset.motion === 'off';
  let changed = false;
  const motion = event => {
    paused = Boolean(event.detail?.paused);
    element.classList.toggle('evi-paused', paused);
  };
  document.addEventListener('crossing:motion', motion);

  const sourceDetails = data => `<details class="evi-details"><summary>Sources and method</summary>${data.id === 'capacity' ? `<p>${escapeHTML(data.summary)}</p>` : ''}<p class="evi-sources">${data.sources.map(source => `<a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(source.label)} ↗</a>`).join(' ')}</p></details>`;
  const controls = (options, current) => fixed ? '' : `<div class="evi-controls" role="group" aria-label="${singapore ? 'Forecast view' : 'Choose a dataset'}">${options.map(([id, label]) => `<button type="button" data-evi-view="${id}" aria-pressed="${id === current}">${label}</button>`).join('')}</div>`;
  const chartHK = data => {
    if (data.id === 'work') {
      return `<div class="evi-chart evi-metrics" aria-label="${escapeHTML(data.unit)}">${data.items.map(item => `<section class="evi-metric"><h4>${escapeHTML(item.label)}</h4><strong>${escapeHTML(item.display)}</strong><p>${escapeHTML(item.detail)}</p></section>`).join('')}</div>`;
    }
    if (data.id === 'journeys') {
      return `<div class="evi-chart evi-journeys" aria-label="${escapeHTML(data.unit)}"><div class="evi-axis"><span>0</span><span>50</span><span>100 million</span></div>${data.items.map(item => `<div class="evi-row"><span class="evi-row-label">${escapeHTML(item.label)}</span><div class="evi-track"><span class="evi-bar" style="--width:${item.value}%"></span></div><strong>${escapeHTML(item.display)}</strong></div>`).join('')}</div>`;
    }
    const limit = 10;
    return `<div class="evi-chart evi-diverging" aria-label="${escapeHTML(data.unit)}"><div class="evi-axis"><span>−${limit}</span><span>0</span><span>+${limit}</span></div>${data.items.map(item => `<div class="evi-row"><span class="evi-row-label">${escapeHTML(item.label)}</span><div class="evi-track"><span class="evi-zero"></span><span class="evi-bar ${item.value < 0 ? 'evi-negative' : 'evi-positive'}" style="--width:${Math.abs(item.value) / (limit * 2) * 100}%"></span></div><strong>${escapeHTML(item.display)}</strong></div>`).join('')}</div>`;
  };
  const chartSG = data => {
    const [outgoing, incoming] = data.items;
    const outWidth = outgoing.value / 1200 * 100;
    const inWidth = incoming.value / 1200 * 100;
    if (selected === 'net') {
      return `<div class="evi-chart evi-net"><div class="evi-axis"><span>0</span><span>600</span><span>S$1,200m</span></div><div class="evi-net-label">Forecast outgoing less forecast incoming</div><div class="evi-overlap-wrap"><div class="evi-net-total-label" style="--end:${outWidth}%"><strong>${escapeHTML(outgoing.display)}</strong><span>forecast outgoing</span></div><div class="evi-overlap" role="img" aria-label="S$1.05 billion forecast outgoing, offset by S$756 million incoming. The source estimates approximately S$290 million net outflow; rounded inputs imply S$294 million."><span class="evi-net-total" style="--width:${outWidth}%"></span><span class="evi-net-offset" style="--width:${inWidth}%"></span></div><div class="evi-net-values"><p><i class="evi-key-in" aria-hidden="true"></i><strong>${escapeHTML(incoming.display)}</strong><span>incoming offset</span></p><p><i class="evi-key-out" aria-hidden="true"></i><strong>≈S$290m</strong><span>source net estimate</span></p></div></div></div>`;
    }
    return `<div class="evi-chart evi-flows"><div class="evi-axis"><span>0</span><span>600</span><span>S$1,200m</span></div>${data.items.map((item, i) => `<div class="evi-row"><span class="evi-row-label">${escapeHTML(item.label)}</span><div class="evi-track"><span class="evi-bar ${i ? 'evi-incoming' : ''}" style="--width:${item.value / 1200 * 100}%"></span></div><strong>${escapeHTML(item.display)}</strong></div>`).join('')}</div>`;
  };
  const editorialTitles = {journeys:'85.8 million departures in 2025.',retail:'Retail changed across three periods.',restaurants:'Restaurant receipts moved differently.',capacity:'Different amounts remained after selected costs.',work:'A vacancy is not yet a workable alternative.',flows:'Spending is forecast to move both ways.'};
  const evidenceTypes = {capacity:'Author calculation · official accounts',flows:'Forecast'};
  const visibleCaveat = data => data.id === 'flows' ? 'A forecast of additional spending, not realised spending, GDP or measured JS-SEZ effects. Rounded published inputs give S$294m; the study reports about S$290m.' : data.caveat;
  function render() {
    let data = datasets.get(singapore ? 'flows' : selected);
    const scriptRetail = scriptScope && data.id === 'retail';
    if (scriptRetail) data = {...data,
      items:data.items.filter(item => /^202[45] · full year$/.test(item.label)),
      summary:'Retail-sales value fell in 2024 and rose in 2025. These are citywide full-year comparisons.',
      caveat:'Value, not volume. Retail excludes most services and purchases abroad. These figures do not identify Shenzhen as a cause.',
      sources:data.sources.filter(source => source.url.includes('620-67001')).map(source => ({...source, label:'C&SD · Table 620-67001'}))
    };
    const title = scriptRetail ? 'Retail fell, then rose.' : editorialTitles[data.id] || data.title;
    const forecastKey = singapore ? '<p class="evi-forecast-key"><i aria-hidden="true"></i><span>Hatching marks a forecast. Solid ends mark point estimates; no uncertainty range is shown.</span></p>' : '';
    element.classList.toggle('evi-paused', paused);
    element.classList.toggle('evi-changed', changed);
    element.innerHTML = `<div class="evi-frame ${singapore ? 'evi-sg' : 'evi-hk'}${fixed ? ' evi-fixed' : ''}">${controls(options, selected)}<div class="evi-heading"><p class="evi-type">${escapeHTML(evidenceTypes[data.id] || 'Official statistics')}</p><h3>${escapeHTML(title)}</h3></div><div class="evi-metadata"><p class="evi-scope">${escapeHTML(data.eyebrow)}</p><p class="evi-unit">${escapeHTML(data.unit)}</p></div>${forecastKey}${singapore ? chartSG(data) : chartHK(data)}<div class="evi-bottom"><div><p>${escapeHTML(data.id === 'capacity' ? 'After the selected recorded costs, the two size groups had different amounts remaining per HK$100 of receipts.' : data.summary)}</p><p class="evi-caveat">${escapeHTML(visibleCaveat(data))}</p></div>${sourceDetails(data)}</div></div>`;
  }
  const click = event => {
    const button = event.target.closest('[data-evi-view]');
    if (fixed || !button || !element.contains(button) || button.dataset.eviView === selected || !options.some(([id]) => id === button.dataset.eviView)) return;
    selected = button.dataset.eviView;
    changed = true;
    render();
    element.querySelector(`[data-evi-view="${selected}"]`)?.focus({preventScroll:true});
  };
  element.addEventListener('click', click);
  render();
  return { destroy() { element.removeEventListener('click', click); document.removeEventListener('crossing:motion', motion); } };
}
