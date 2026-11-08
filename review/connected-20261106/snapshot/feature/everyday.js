const evdEscape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function initEveryday(element, researchData) {
  const datasets = new Map((researchData?.datasets || []).map(d => [d.id, d]));
  const school = datasets.get('pupils');
  const care = datasets.get('care');
  const requested = element.dataset.everydayView;
  const fixed = Boolean(requested);
  if ((fixed && !['school', 'care'].includes(requested)) || (!fixed && (!school || !care)) || (requested === 'school' && !school) || (requested === 'care' && !care)) {
    element.innerHTML = '<p class="evd-caption">The everyday access data could not be loaded.</p>';
    return {destroy() {}};
  }
  let mode = requested || 'school', changed = false;
  const links = sources => (sources || []).map(s => `<a href="${evdEscape(s.url)}" target="_blank" rel="noopener noreferrer">${evdEscape(s.label)} ↗</a>`).join(' ');
  function draw() {
    const schoolItems = school?.items || [];
    const pupilTotal = schoolItems[0]?.display || '';
    const data = mode === 'school' ? school : care;
    const breakdown = `<dl class="evd-breakdown">${schoolItems.slice(1).map(item => `<div><dt>${evdEscape(item.label)}</dt><dd>${evdEscape(item.display)}</dd></div>`).join('')}</dl>`;
    const picture = mode === 'school' ? `<div class="evd-school"><div class="evd-place"><span>Residence</span><strong>Mainland</strong><small>Not necessarily Shenzhen</small></div><div class="evd-connection" aria-hidden="true"><span></span><i></i><span></span></div><div class="evd-place evd-place-end"><span>School</span><strong>Hong Kong</strong></div><div class="evd-count"><strong>${evdEscape(pupilTotal)}</strong><span>cross-boundary pupils<br>travelling daily</span></div></div>${breakdown}<p class="evd-caption">September 2024 snapshot · 2024/25 school year</p>` : `<div class="evd-care">${care.items.map(item => `<div class="evd-care-line"><span class="evd-marker" aria-hidden="true">•</span><div><strong>${evdEscape(item.display)}</strong><span>${evdEscape(item.label)}</span><small>${evdEscape(item.detail)}</small></div></div>`).join('')}</div><p class="evd-caption">Distinct measures and reporting dates</p>`;
    const controls = fixed ? '' : `<div class="evd-switch" role="group" aria-label="Everyday connection"><button type="button" data-evd="school" aria-pressed="${mode === 'school'}">School</button><button type="button" data-evd="care" aria-pressed="${mode === 'care'}">Care</button></div>`;
    element.innerHTML = `<div class="evd-shell ${changed ? 'evd-changed' : ''}${fixed ? ' evd-fixed' : ''}">${controls}<p class="evd-type">${mode === 'school' ? 'Official statistics · school survey' : 'Programme use · government replies'}</p><div class="evd-stage">${picture}</div><p class="evd-boundary">${evdEscape(data.caveat)}</p><details class="evd-notes"><summary>Sources and method</summary><p>${mode === 'school' ? 'The Education Bureau school survey counts pupils travelling daily across the boundary. Earlier collections covered different districts and reference months, so the snapshot is not a directly comparable trend.' : evdEscape(care.summary)}</p><p class="evd-links">${links(data.sources)}</p></details></div>`;
  }
  function click(event) { const button = event.target.closest('[data-evd]'); if (fixed || !button || !element.contains(button) || button.dataset.evd === mode || !['school', 'care'].includes(button.dataset.evd)) return; mode = button.dataset.evd; changed = true; draw(); element.querySelector(`[data-evd="${mode}"]`)?.focus({preventScroll:true}); }
  function motion(event) { element.classList.toggle('evd-paused', Boolean(event.detail?.paused)); }
  element.classList.toggle('evd-paused', document.documentElement.dataset.motion === 'off');
  element.addEventListener('click', click); document.addEventListener('crossing:motion', motion); draw();
  return {destroy() { element.removeEventListener('click', click); document.removeEventListener('crossing:motion', motion); }};
}
