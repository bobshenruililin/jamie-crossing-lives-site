/* Crossing Lives: evidence-led response, measurement and further-reading instruments.
   UI summaries paraphrase the supplied research data; full wording and sources remain disclosed. */
const SVG_NS = 'http://www.w3.org/2000/svg';
const arrow = '<svg viewBox="0 0 32 24" aria-hidden="true"><path d="M2 12h26M20 4l8 8-8 8"/></svg>';
const steps = {
  'cgc-japan': ['Independent supermarkets', 'Shared organisation', 'Purchasing, logistics & IT'],
  'aic-alps': ['Community care providers', 'Pooled demand', 'Shared procurement'],
  'otop-thailand': ['Local producers', 'Development & branding', 'Routes to customers'],
  'singapore-ccp': ['Workers & employers', 'Hiring, training & support', 'A destination job'],
  'ntuc-job-security-council': ['Firms releasing staff', 'Matching & training', 'Firms recruiting'],
  'happy-bridge': ['Restaurant company', 'Worker ownership', 'Governance & working practices'],
  'vietnam-supplier-development': ['Selected local suppliers', 'Assessment & coaching', 'Buyer qualification'],
  'gogba': ['Businesses', 'Advice & training', 'Business connections'],
  'gba-youth-support': ['Eligible scheme participants', 'Appointed support partners', 'Advice, referrals & peers'],
  'connected-care': ['Eligible follow-up patients', 'HKU–Shenzhen pilot', 'Defined follow-up care'],
  'sewa-sangini': ['Mothers & care workers', 'Cooperative provision', 'Full-day childcare'],
  'aware-she': ['Donated housing resources', 'Temporary housing & support', 'Single-mother households'],
  'light-be': ['Private property resources', 'Housing & household support', 'Households facing poverty'],
  'greenprice': ['Surplus & short-dated goods', 'Supplier agreements', 'Retail sales channels'],
  'fairprice': ['Cooperative operating base', 'Procurement & logistics', 'Retail provision'],
  'fudeichi-hippo': ['Community fundraising', 'Local organisation', 'Shop & social space'],
  'home-market': ['Philanthropic support', 'Nonprofit retail', 'Essentials & inclusive work'],
  'food-angel': ['Ingredients, funds & volunteers', 'Kitchens & partners', 'Free food assistance'],
  'yangtze-fiscal-sharing': ['Joint enterprises & projects', 'Agreed retained-tax sharing', 'Participating jurisdictions'],
  'project-quest': ['Occupations with demand', 'Training & practical support', 'Placement support'],
  'preston': ['Local anchor institutions', 'Purchasing & employment', 'Local opportunity'],
  'oresunddirekt': ['Participating agencies', 'Connected guidance', 'Workers & employers'],
  'cerdanya-hospital': ['Relevant French professionals', 'Provisional recognition', 'Work at the shared hospital'],
  'greater-geneva': ['Covered workers’ payroll', 'Agreed compensation', 'Resources to France']
};
const areaSummaries = {
  'household-choices': ['Travel & spending surveys', 'Benefits, spending & travel burden', 'Understand household choices'],
  'business-adjustment': ['Business records & surveys', 'Sales, costs, staffing & survival', 'Identify adjustment needs'],
  'worker-transitions': ['Employment records & follow-up', 'Destination job, pay & retention', 'Improve workable transitions'],
  'access-to-growth': ['Registration & contract records', 'Paid work & repeat business', 'Distinguish access from earnings'],
  'everyday-services': ['Applications & targeted follow-up', 'Delayed plans & completed hand-offs', 'Prioritise practical barriers'],
  'useful-connections': ['Short voluntary follow-up', 'Useful assistance received', 'Assess help, not contacts'],
  'established-residents': ['Housing, service & employment series', 'Costs & access for existing residents', 'Examine opportunity and pressure'],
  'institutions-and-reliability': ['Case records & user confirmation', 'Resolution & interrupted access', 'Locate coordination problems']
};
const groupLabels = {
  'Customers and markets': 'Customers & markets',
  'Work and employment risks': 'Work & transitions',
  'Access for smaller local participants': 'Local opportunity',
  'Practical cross-border arrangements': 'Cross-border support',
  'Everyday essentials': 'Everyday essentials',
  'Public costs and benefits': 'Public costs & benefits'
};

function make(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}
function button(text, className, action) {
  const element = make('button', className, text);
  element.type = 'button';
  element.addEventListener('click', action);
  return element;
}
function svgIcon(kind) {
  const paths = {
    start: '<path d="M6 30V15l14-8 14 8v15H6Zm9 0V20h10v10M6 15h28"/>',
    join: '<circle cx="20" cy="20" r="7"/><path d="M20 3v10m0 14v10M3 20h10m14 0h10M8 8l7 7m10 10 7 7M8 32l7-7m10-10 7-7"/>',
    end: '<path d="M8 32V8h24v24H8Zm6-17h12m-12 6h12m-12 6h7"/>',
    records: '<path d="M8 7h20l5 5v23H8V7Zm20 0v7h5M14 19h13M14 25h13M14 30h8"/>',
    track: '<path d="M7 10h26v25H7V10Zm0 8h26M14 5v10M26 5v10M13 25l5 4 9-8"/>',
    decide: '<path d="M7 20h11m0 0 9-11m-9 11 9 11M21 9h6v6M21 31h6v-6"/><circle cx="6" cy="20" r="3"/>'
  };
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 40 40');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = paths[kind] || paths.join;
  return svg;
}
function sourcesList(sources) {
  const list = make('ul', 'lib-sources');
  (sources || []).forEach(source => {
    let url;
    try { url = new URL(source.url); } catch { return; }
    if (!['https:', 'http:'].includes(url.protocol)) return;
    const li = make('li');
    const a = make('a', '', source.label || url.hostname);
    a.href = url.href; a.target = '_blank'; a.rel = 'noopener';
    li.append(a); list.append(li);
  });
  return list;
}
function disclosure(title, fields, sources) {
  const details = make('details', 'lib-details');
  details.append(make('summary', '', title));
  const body = make('div', 'lib-detail-body');
  fields.filter(([, value]) => value).forEach(([label, value]) => {
    const block = make('div', 'lib-detail-item');
    block.append(make('h4', '', label), make('p', '', value)); body.append(block);
  });
  if (sources?.length) body.append(sourcesList(sources));
  details.append(body); return details;
}
function sequence(labels, captions, kinds = ['start', 'join', 'end']) {
  const diagram = make('ol', 'lib-sequence');
  labels.forEach((label, i) => {
    const item = make('li', `lib-node lib-node-${i}`);
    const icon = make('div', 'lib-node-icon'); icon.append(svgIcon(kinds[i]));
    item.append(icon, make('span', 'lib-node-caption', captions[i]), make('strong', 'lib-node-label', label));
    if (i < labels.length - 1) { const join = make('span', 'lib-join'); join.innerHTML = arrow; item.append(join); }
    diagram.append(item);
  });
  return diagram;
}
function pressed(buttons, selected) { buttons.forEach((item, i) => item.setAttribute('aria-pressed', String(i === selected))); }
function motionControls(container) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  const set = value => container.classList.toggle('lib-motion-off', value || query.matches);
  const event = e => set(Boolean(e.detail?.paused));
  const change = () => set(document.documentElement.dataset.motion === 'off');
  set(document.documentElement.dataset.motion === 'off');
  document.addEventListener('crossing:motion', event);
  window.addEventListener('crossing:motion', event);
  query.addEventListener('change', change);
  return { pause: set, destroy() { document.removeEventListener('crossing:motion', event); window.removeEventListener('crossing:motion', event); query.removeEventListener('change', change); } };
}

function responses(container, cases) {
  if (!cases?.length) { container.append(make('p', 'lib-empty', 'The examples are unavailable. The research companion contains the source collection.')); return; }
  const groups = [...new Set(cases.map(item => item.problem))];
  let currentGroup = groups[0], currentIndex = 0;
  const filters = make('div', 'lib-filters'); filters.setAttribute('role', 'group'); filters.setAttribute('aria-label', 'Choose a practical problem');
  const content = make('div', 'lib-response-stage');
  const buttons = groups.map((group, i) => {
    const b = button(groupLabels[group] || group, 'lib-filter', () => { currentGroup = group; currentIndex = 0; pressed(buttons, i); render(); });
    b.setAttribute('aria-pressed', String(i === 0)); filters.append(b); return b;
  });
  container.append(filters, content);
  function render() {
    const available = cases.filter(item => item.problem === currentGroup);
    currentIndex = Math.min(currentIndex, available.length - 1);
    const item = available[currentIndex]; content.replaceChildren();
    const header = make('div', 'lib-case-header');
    const identity = make('div', 'lib-case-identity');
    identity.append(make('h3', 'lib-case-name', item.name));
    const meta = make('p', 'lib-case-meta'); meta.append(make('span', '', item.region), make('span', 'lib-evidence-type', item.evidenceType)); identity.append(meta);
    const navigation = make('div', 'lib-case-navigation');
    const previous = button('', 'lib-arrow lib-prev', () => { currentIndex = (currentIndex - 1 + available.length) % available.length; render(); content.querySelector('.lib-prev').focus({preventScroll:true}); }); previous.innerHTML = arrow; previous.setAttribute('aria-label', 'Previous example');
    const next = button('', 'lib-arrow lib-next', () => { currentIndex = (currentIndex + 1) % available.length; render(); content.querySelector('.lib-next').focus({preventScroll:true}); }); next.innerHTML = arrow; next.setAttribute('aria-label', 'Next example');
    navigation.append(previous, make('span', 'lib-count', `${currentIndex + 1} / ${available.length}`), next); header.append(identity, navigation);
    const label = make('label', 'lib-case-picker'); label.append(make('span', '', 'Choose an example'));
    const select = make('select'); select.setAttribute('aria-label', 'Choose a response example');
    groups.forEach(group => {
      const optgroup = make('optgroup'); optgroup.label = group;
      cases.filter(x => x.problem === group).forEach(x => { const option = make('option', '', `${x.name} · ${x.region}`); option.value = x.id; option.selected = x.id === item.id; optgroup.append(option); }); select.append(optgroup);
    });
    select.addEventListener('change', () => {
      const chosen = cases.find(x => x.id === select.value); currentGroup = chosen.problem;
      currentIndex = cases.filter(x => x.problem === currentGroup).findIndex(x => x.id === chosen.id);
      pressed(buttons, groups.indexOf(currentGroup)); render(); content.querySelector('select').focus({preventScroll:true});
    }); label.append(select);
    const labels = steps[item.id];
    content.append(header, sequence(labels || ['Participants', 'Documented arrangement', 'Provided service'], ['WHO IS INVOLVED', 'HOW IT WORKS', 'WHAT IT PROVIDES']));
    content.append(make('p', 'lib-diagram-note', item.id === 'connected-care' ? 'This sketch follows the eligible-patient pilot. Records and return referrals are separate arrangements.' : 'A mechanism sketch—not an estimate of its effect.'));
    content.append(label, disclosure('Read the evidence, limits and sources', [['Mechanism', item.mechanism], ['What is documented', item.evidence], ['What this does not establish', item.limit]], item.sources));
    const status = make('p', 'lib-screen-status', `${item.name}. ${item.region}. ${item.evidenceType}.`); status.setAttribute('role', 'status'); content.append(status);
  }
  render();
}

function measures(container, measurement) {
  if (!measurement?.areas?.length) { container.append(make('p', 'lib-empty', 'The measurement menu is unavailable.')); return; }
  let current = 0, regionIndex = 0;
  container.append(make('p', 'lib-measure-intro', 'Choose the question first. Start with existing records.'));
  const areas = make('div', 'lib-area-selector'); areas.setAttribute('role','group'); areas.setAttribute('aria-label','Choose an area to follow');
  const stage = make('div', 'lib-measure-stage');
  const regionStage = make('div', 'lib-region-stage');
  const buttons = measurement.areas.map((area, i) => { const b = button(area.name, 'lib-area', () => { current=i; pressed(buttons, current); render(); }); b.setAttribute('aria-pressed',String(i===0)); areas.append(b); return b; });
  container.append(areas, stage);
  const regionControls = make('div', 'lib-region-controls'); regionControls.setAttribute('role','group'); regionControls.setAttribute('aria-label','Choose the regional reference point');
  const regions = (measurement.regions || []).map((region,i) => { const b = button(region.name, 'lib-region-button', () => { regionIndex=i; pressed(regions, regionIndex); renderRegion(); }); b.setAttribute('aria-pressed',String(i===0)); regionControls.append(b); return b; });
  const regionSection = make('section', 'lib-regional'); regionSection.append(make('h3', '', 'The reference point matters.'), regionControls, regionStage); container.append(regionSection);
  container.append(disclosure('How to use this selective menu', (measurement.principles || []).map((text,i)=>[i === 0 ? 'Scope' : ['Existing records first','Match effort to the decision','Select outcomes','Keep people and firms in view','Proportionate data use','Responsible organisations','Existing practices'][i-1] || 'Principle', text]), measurement.sources));
  function render() {
    const area = measurement.areas[current]; stage.replaceChildren();
    stage.append(sequence(areaSummaries[area.id] || ['Existing records','Relevant outcomes','A decision'], ['RECORDS', 'OUTCOME TO FOLLOW', 'DECISION'], ['records','track','decide']));
    stage.append(disclosure(`Measurement detail · ${area.name}`, [['Records to start with',area.records],['What to follow',area.track],['Decision it can inform',area.decision],['Limit',area.limit]]));
    const live=make('p','lib-screen-status',`Measurement area: ${area.name}`); live.setAttribute('role','status');stage.append(live);
  }
  function renderRegion() {
    const region = measurement.regions[regionIndex]; if (!region) return; regionStage.replaceChildren();
    const sg = region.id === 'singapore-johor';
    const timeline = make('div', 'lib-reference-line');
    const a=make('div','lib-reference-stop'); a.append(make('span','lib-reference-dot'),make('strong','',sg?'Before RTS passenger service':'Before a specific change'));
    const line=make('span','lib-reference-link'); line.innerHTML=arrow;
    const b=make('div','lib-reference-stop');b.append(make('span','lib-reference-dot'),make('strong','','Follow relevant outcomes'));
    timeline.append(a,line,b); regionStage.append(timeline);
    regionStage.append(make('p','lib-region-note',sg?'A pre-RTS reference point—not a baseline before integration.':'Use a specific change and credible comparisons. A general pre-integration baseline is unavailable.'));
    regionStage.append(disclosure('Regional approach and comparison limits',[['Approach',region.approach],['Comparison limit',region.caveat]]));
  }
  render(); renderRegion();
}

function futureQuestions(container, future) {
  if (!future?.length) { container.append(make('p','lib-empty','Further-reading avenues are unavailable.')); return; }
  let selected=0;
  const layout=make('div','lib-future-layout');
  const choices=make('div','lib-future-choices');choices.setAttribute('role','group');choices.setAttribute('aria-label','Choose a city-region for further reading');
  const stage=make('div','lib-future-stage');
  const buttons=future.map((item,i)=>{const b=button('','lib-future-choice',()=>{selected=i;pressed(buttons,selected);render()});b.append(make('span','',item.name));const icon=make('span','lib-future-arrow');icon.innerHTML=arrow;b.append(icon);b.setAttribute('aria-pressed',String(i===0));choices.append(b);return b;});
  layout.append(choices,stage);container.append(make('p','lib-future-intro','Further reading avenues, not additional findings.'),layout);
  function render(){
    const item=future[selected];stage.replaceChildren();
    const places=item.places.split('·').map(x=>x.trim());
    const constellation=make('div','lib-city-pair');constellation.setAttribute('aria-label',item.places);
    places.forEach((place,i)=>{const point=make('div','lib-city-stop');point.append(make('span','lib-city-dot'),make('span','',place));constellation.append(point);if(i<places.length-1)constellation.append(make('span','lib-city-link'));});
    stage.append(constellation,make('h3','lib-future-question',item.question));
    stage.append(disclosure('Context and further reading',[['Keep the comparison bounded',item.caveat]],item.sources));
    const live=make('p','lib-screen-status',`Future reading: ${item.name}`);live.setAttribute('role','status');stage.append(live);
  }
  render();
}

export function initLibrary(container, cases, measurement, future) {
  if (!container) return { pause() {}, destroy() {} };
  container.classList.add('lib-root');
  const mode=container.dataset.library;
  container.replaceChildren();
  if(mode==='responses')responses(container,cases);
  else if(mode==='measurement')measures(container,measurement);
  else if(mode==='future')futureQuestions(container,future);
  const motion=motionControls(container);
  return { pause:motion.pause, destroy(){motion.destroy();container.replaceChildren();} };
}
