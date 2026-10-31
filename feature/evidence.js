const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

/** Build one of the two data stories from the research-data.json snapshot. */
export function initEvidence(element, researchData) {
  const datasets = new Map((researchData?.datasets || []).map(item => [item.id, item]));
  const singapore = element.dataset.evidence === 'singapore';
  const ids = singapore ? ['flows'] : ['journeys', 'retail', 'restaurants', 'capacity'];
  if (ids.some(id => !datasets.has(id))) {
    element.innerHTML = '<p class="evi-error">The evidence data could not be loaded.</p>';
    return;
  }

  let selected = singapore ? 'gross' : 'journeys';
  let paused = document.documentElement.dataset.motion === 'off';
  let changed = false;
  const motion = event => {
    paused = Boolean(event.detail?.paused);
    element.classList.toggle('evi-paused', paused);
  };
  document.addEventListener('crossing:motion', motion);

  const sourceDetails = data => `<details class="evi-details"><summary>Notes and sources</summary><p>${escapeHTML(data.caveat)}</p>${data.id === 'capacity' ? `<p>${escapeHTML(data.summary)}</p>` : ''}<p class="evi-sources">${data.sources.map(source => `<a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(source.label)} ↗</a>`).join(' ')}</p></details>`;
  const controls = (options, current) => `<div class="evi-controls" role="group" aria-label="${singapore ? 'Forecast view' : 'Choose a dataset'}">${options.map(([id, label]) => `<button type="button" data-evi-view="${id}" aria-pressed="${id === current}">${label}</button>`).join('')}</div>`;
  const chartHK = data => {
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
      return `<div class="evi-chart evi-net"><div class="evi-axis"><span>0</span><span>600</span><span>S$1,200m</span></div><div class="evi-net-label">Forecast outgoing less forecast incoming</div><div class="evi-overlap-wrap"><div class="evi-overlap"><span class="evi-net-total" style="--width:${outWidth}%"></span><span class="evi-net-offset" style="--width:${inWidth}%"></span></div></div><div class="evi-key"><span><i class="evi-key-in"></i> S$756m incoming offsets outgoing</span><span><i class="evi-key-out"></i> Approx. S$290m net outflow</span></div></div>`;
    }
    return `<div class="evi-chart evi-flows"><div class="evi-axis"><span>0</span><span>600</span><span>S$1,200m</span></div>${data.items.map((item, i) => `<div class="evi-row"><span class="evi-row-label">${escapeHTML(item.label)}</span><div class="evi-track"><span class="evi-bar ${i ? 'evi-incoming' : ''}" style="--width:${item.value / 1200 * 100}%"></span></div><strong>${escapeHTML(item.display)}</strong></div>`).join('')}</div>`;
  };
  const shortCaveats = { journeys: 'Departures are crossings, not unique people.', retail: 'Different periods; these figures do not establish a cause.', restaurants: 'Receipt value, not profit or volume; causes are not identified.', capacity: 'A 2024 accounting snapshot, not a measure of profit or resilience.', flows: 'Forecast additional consumer spending, not GDP or realised spending.' };
  const editorialTitles = {journeys:'Crossings, not unique people.',retail:'Retail across three periods.',restaurants:'Restaurant receipts diverge.',capacity:'Room to respond.',flows:'Two directions. One balance.'};
  function render() {
    const data = datasets.get(singapore ? 'flows' : selected);
    const options = singapore ? [['gross', 'Gross flows'], ['net', 'Net balance']] : [['journeys', 'Departures'], ['retail', 'Retail'], ['restaurants', 'Restaurants'], ['capacity', 'Capacity']];
    element.classList.toggle('evi-paused', paused);
    element.classList.toggle('evi-changed', changed);
    element.innerHTML = `<div class="evi-frame ${singapore ? 'evi-sg' : 'evi-hk'}">${controls(options, selected)}<div class="evi-heading"><h3>${escapeHTML(editorialTitles[data.id] || data.title)}</h3></div><div class="evi-metadata"><p class="evi-scope">${singapore ? 'FORECAST · ' : ''}${escapeHTML(data.eyebrow)}</p><p class="evi-unit">${escapeHTML(data.unit)}</p></div>${singapore ? chartSG(data) : chartHK(data)}<div class="evi-bottom"><div><p>${escapeHTML(data.id === 'capacity' ? 'After the selected recorded costs, the two size groups had different amounts remaining per HK$100 of receipts.' : data.summary)}</p><p class="evi-caveat">${escapeHTML(shortCaveats[data.id])}</p></div>${sourceDetails(data)}</div></div>`;
  }
  const click = event => {
    const button = event.target.closest('[data-evi-view]');
    if (!button || !element.contains(button) || button.dataset.eviView === selected) return;
    selected = button.dataset.eviView;
    changed = true;
    render();
    element.querySelector(`[data-evi-view="${selected}"]`)?.focus();
  };
  element.addEventListener('click', click);
  render();
  return { destroy() { element.removeEventListener('click', click); document.removeEventListener('crossing:motion', motion); } };
}
