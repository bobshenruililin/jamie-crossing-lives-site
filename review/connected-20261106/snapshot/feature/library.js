/* Crossing Lives: evidence-led response, measurement and further-reading instruments.
   UI summaries paraphrase the supplied research data; evidence and limits remain visible. */
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
  'household-choices': ['Travel & expenditure data', 'Purchases, reasons & access', 'Keep household benefits in view'],
  'business-adjustment': ['Comparable firms, including exits', 'Customers, offerings & business changes', 'Consider useful adaptations'],
  'worker-transitions': ['Employment records & follow-up', 'Next destination, earnings & hours', 'Identify groups needing help'],
  'everyday-services': ['Provider histories & user follow-up', 'Offerings, resolution & people missed', 'Improve services and reach'],
  'useful-connections': ['Voluntary follow-up, including non-participants', 'Ties, support & valued connections', 'Understand changing needs']
};
const areaLimits = {
  'household-choices': 'Define the group and coverage. Household benefits and work or business pressures can affect the same person; this is not a net-welfare calculation.',
  'business-adjustment': 'Include exits. Observed chains do not demonstrate better survival, and employment size does not identify chain ownership.',
  'worker-transitions': 'Earnings, hours and destinations are distinct. Retirement, care, training and self-employment are not automatically failed transitions.',
  'everyday-services': 'Advertised provision does not establish use or resolution. Include people who abandon the process or never reach the service.',
  'useful-connections': 'Attendance alone cannot establish stronger attachment or useful support. Include people outside organised activities.'
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
function evidenceSummary(fields, className = '') {
  const summary = make('div', `lib-evidence-summary ${className}`);
  fields.filter(([, value]) => value).forEach(([label, value]) => {
    const block = make('div', 'lib-evidence-item');
    block.append(make('h4', '', label), make('p', '', value)); summary.append(block);
  });
  return summary;
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

/* Reusable editorial mechanism families. An unmapped case keeps the concise
   sequence above: adding a family never changes its evidence or navigation. */
const mechanismFamilies = {
  'cgc-japan': 'pool',
  'aic-alps': 'pool',
  'singapore-ccp': 'transition',
  'oresunddirekt': 'guidance'
};
function mechanismSvg(markup, viewBox = '0 0 1000 360') {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.innerHTML = markup;
  return svg;
}
function mechanismLabels(items, className = '') {
  const labels = make('div', `lib-mechanism-labels ${className}`);
  items.forEach(([title, detail]) => {
    const label = make('p', 'lib-mechanism-label');
    label.append(make('strong', '', title));
    if (detail) label.append(make('span', '', detail));
    labels.append(label);
  });
  return labels;
}
function storefront(x, y, provider = false) {
  return `<g transform="translate(${x} ${y})" class="lib-pool-member">
    <path d="M-31-13h62v45h-62z" class="lib-mech-surface"/>
    <path d="M-36-13l7-22h58l7 22z" class="lib-mech-fill-soft"/>
    <path d="M-22-32l-4 19m15-19-2 19M0-32v19m11-19 2 19m9-19 4 19" class="lib-mech-fine"/>
    ${provider ? '<path d="M-9 1h18M0-8v18" class="lib-mech-accent"/><path d="M-17 32V19h34v13"/>' : '<path d="M-21 1h14v16h-14zM5 32V1h17v31"/>'}
    <path d="M-38 33h76"/>
  </g>`;
}
function poolingMechanism(item) {
  const care = item.id === 'aic-alps';
  const figure = make('figure', `lib-mechanism lib-mechanism-pool${care ? ' lib-mechanism-care-pool' : ''}`);
  const connections = '<g class="lib-mech-connections"><path d="M159 71C290 71 274 180 399 180M164 190H399M194 300C292 300 285 180 399 180"/><path d="M601 180C708 180 694 70 799 70M601 180H799M601 180C708 180 694 290 799 290"/></g>';
  const output = care ? '<path d="M601 180H805" class="lib-mech-connections"/><g transform="translate(838 180)"><rect x="-49" y="-49" width="98" height="98" class="lib-mech-fill-soft"/><path d="M-24-13h48v36h-48zM-29-13l5-13h48l5 13M0-26v49M-24-13 0-1l24-12"/><circle cx="35" cy="-35" r="14" class="lib-mech-solid"/><path d="m29-35 4 4 8-9" class="lib-mech-inverse"/></g>' : '<g transform="translate(840 70)"><circle r="38" class="lib-mech-fill-soft"/><path d="M-19-7h38v24h-38zM-23-7l4-11h38l4 11M0-18v35"/></g><g transform="translate(840 180)"><circle r="38" class="lib-mech-fill-soft"/><path d="M-23 12v-29h29v29M6-7h12l9 11v8H6M-17 12h-6M-4 12H14"/><circle cx="-10" cy="13" r="5"/><circle cx="20" cy="13" r="5"/></g><g transform="translate(840 290)"><circle r="38" class="lib-mech-fill-soft"/><rect x="-23" y="-20" width="46" height="31"/><path d="M-10 22h20M0 11v11M-8-9h16m-16 8h9"/></g>';
  figure.append(mechanismSvg(`<path d="M65 343H932" class="lib-mech-ground"/>${care ? '<g class="lib-mech-connections"><path d="M159 71C290 71 274 180 399 180M164 190H399M194 300C292 300 285 180 399 180"/></g>' : connections}${storefront(120,70,care)}${storefront(125,189,care)}${storefront(155,299,care)}<g transform="translate(500 180)"><circle r="101" class="lib-mech-hub-ring"/><circle r="79" class="lib-mech-hub"/><path d="M-38 29v-58h76v58M-25-15h12m9 0H8m9 0h12M-25 0h12m9 0H8m9 0h12M-25 15h12m9 0H8m9 0h12M-50 30H50" class="lib-mech-inverse"/><circle cy="-101" r="5" class="lib-mech-red"/><circle cx="101" r="5" class="lib-mech-red"/><circle cx="-101" r="5" class="lib-mech-red"/></g>${output}`));
  figure.append(mechanismLabels(care ? [['Care providers','Participating organisations'],['AIC + ALPS','Pool suitable demand'],['Shared procurement','Purchase together']] : [['Supermarkets','Separate ownership'],['CGC','Shared organisation'],['Shared capabilities','Purchasing · logistics · IT']]));
  figure.append(make('figcaption', 'lib-mechanism-caption', care ? 'A shared purchasing arrangement; the drawing does not represent the number of participating providers.' : 'Share capabilities while keeping separate ownership. The drawing does not represent the number of members.'));
  return figure;
}
function transitionMechanism() {
  const figure = make('figure', 'lib-mechanism lib-mechanism-transition');
  figure.append(mechanismLabels([['Hiring','Employers'],['Occupational training','Programme partners'],['Salary support','Programme support']], 'lib-transition-supports'));
  figure.append(mechanismSvg('<path d="M105 267H895" class="lib-mech-ground"/><path d="M118 215H875" class="lib-mech-route-back"/><path d="M118 215H875" class="lib-mech-route"/><path d="m860 201 15 14-15 14" class="lib-mech-route-arrow"/><g class="lib-mech-supports"><path d="M245 29v73q0 38 40 38h80q40 0 40 40v35M500 29v186M755 29v73q0 38-40 38h-80q-40 0-40 40v35"/></g><g class="lib-mech-support-nodes"><circle cx="245" cy="29" r="18"/><circle cx="500" cy="29" r="18"/><circle cx="755" cy="29" r="18"/></g><path d="m237 28 6 6 11-12M490 29h20m-10-10v20M746 24h18m-18 10h18" class="lib-mech-inverse"/><g transform="translate(119 174)"><circle cy="-15" r="14" class="lib-mech-person"/><path d="M-25 41V16q0-15 25-15t25 15v25" class="lib-mech-person"/></g><g transform="translate(878 185)"><rect x="-33" y="-15" width="66" height="45" class="lib-mech-job"/><path d="M-13-15v-12h26v12M-33 2h66M-5-3v10h10V-3"/></g><g class="lib-mech-transition-points"><circle cx="405" cy="215" r="6"/><circle cx="500" cy="215" r="6"/><circle cx="595" cy="215" r="6"/></g>', '0 0 1000 295'));
  const ends=make('div','lib-transition-ends');ends.append(make('strong','','Worker'),make('strong','','Destination job'));figure.append(ends);
  figure.append(make('figcaption','lib-mechanism-caption','Hiring, training and salary support connect a worker to a destination job. This is a mechanism, not a guaranteed outcome or a measured timeline.'));
  return figure;
}
function guidanceMechanism() {
  const figure=make('figure','lib-mechanism lib-mechanism-guidance');
  figure.append(mechanismLabels([['Employment',''],['Tax',''],['Social insurance','']], 'lib-guidance-domains'));
  const plot=make('div','lib-guidance-plot');
  plot.append(mechanismSvg('<path d="M150 10v52q0 24 24 24h192q32 0 32 32v20M500 10v128M850 10v52q0 24-24 24H634q-32 0-32 32v20" class="lib-mech-connections"/><g class="lib-mech-inputs"><circle cx="150" cy="10" r="7"/><circle cx="500" cy="10" r="7"/><circle cx="850" cy="10" r="7"/></g><path d="M322 137h356v124H322z" class="lib-mech-guidance-desk"/><path d="M342 157h316v84H342z" class="lib-mech-fine"/><path d="M416 261v36q0 25-25 25H249q-25 0-25 25v29M584 261v36q0 25 25 25h142q25 0 25 25v29" class="lib-mech-out-connections"/><circle cx="224" cy="376" r="8" class="lib-mech-red"/><circle cx="776" cy="376" r="8" class="lib-mech-red"/>', '0 0 1000 395'));
  const centre=make('p','lib-guidance-hub');centre.append(make('strong','','Connected guidance'));plot.append(centre);figure.append(plot);
  const recipients=make('div','lib-guidance-recipients');recipients.append(make('strong','','Workers'),make('strong','','Employers'));figure.append(recipients);
  figure.append(make('figcaption','lib-mechanism-caption','Public agencies connect guidance across subjects for cross-border workers and employers. Use of guidance is not evidence of additional jobs.'));
  return figure;
}
function responseMechanism(item) {
  const family=mechanismFamilies[item.id];
  if(family==='pool') return poolingMechanism(item);
  if(family==='transition') return transitionMechanism();
  if(family==='guidance') return guidanceMechanism();
  return sequence(steps[item.id] || ['Participants','Documented arrangement','Provided service'], ['WHO IS INVOLVED','HOW IT WORKS','WHAT IT PROVIDES']);
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
  const initial = container.dataset.caseId ? cases.find(item => item.id === container.dataset.caseId) : cases[0];
  if (!initial) { container.append(make('p', 'lib-empty', 'This response example could not be loaded.')); return; }
  const fixed = container.dataset.libraryStatic === 'true';
  container.classList.toggle('lib-static', fixed);
  let currentGroup = initial.problem, selectedId = initial.id;
  const filters = make('div', 'lib-filters'); filters.setAttribute('role', 'group'); filters.setAttribute('aria-label', 'Choose a practical problem');
  const choices = make('div', 'lib-case-choices'); choices.setAttribute('role', 'group'); choices.setAttribute('aria-label', 'Choose a response example');
  const content = make('div', 'lib-response-stage');
  const buttons = groups.map((group, i) => {
    const b = button(groupLabels[group] || group, 'lib-filter', () => { setCase(cases.find(item => item.problem === group).id); });
    b.setAttribute('aria-pressed', String(group === currentGroup)); filters.append(b); return b;
  });
  if (!fixed) container.append(filters, choices);
  container.append(content);
  function setCase(id) {
    const item = cases.find(candidate => candidate.id === id);
    if (!item) return false;
    currentGroup = item.problem; selectedId = item.id;
    pressed(buttons, groups.indexOf(currentGroup)); render(); return true;
  }
  function render() {
    const available = cases.filter(item => item.problem === currentGroup);
    const item = available.find(candidate => candidate.id === selectedId);
    choices.replaceChildren();
    if (!fixed) available.forEach(candidate => {
      const choice = button('', 'lib-case-choice', () => {
        setCase(candidate.id);
        [...choices.children].find(child => child.dataset.caseId === candidate.id)?.focus({preventScroll:true});
      });
      choice.dataset.caseId = candidate.id;
      choice.setAttribute('aria-pressed', String(candidate.id === selectedId));
      choice.append(make('span', '', candidate.name), make('small', '', candidate.region));
      choices.append(choice);
    });
    content.replaceChildren();
    const header = make('div', 'lib-case-header');
    const identity = make('div', 'lib-case-identity');
    identity.append(make('h3', 'lib-case-name', item.name));
    const meta = make('p', 'lib-case-meta'); meta.append(make('span', '', item.region), make('span', 'lib-evidence-type', item.evidenceType)); identity.append(meta);
    header.append(identity);
    content.append(header, responseMechanism(item));
    if(!mechanismFamilies[item.id]) content.append(make('p', 'lib-diagram-note', item.id === 'connected-care' ? 'This sketch follows the eligible-patient pilot. Records and return referrals are separate arrangements.' : 'A mechanism sketch—not an estimate of its effect.'));
    content.append(evidenceSummary([['What is documented', item.evidence], ['What this does not establish', item.limit]]));
    content.append(disclosure('Mechanism and sources', [['Mechanism', item.mechanism]], item.sources));
    const status = make('p', 'lib-screen-status', `${item.name}. ${item.region}. ${item.evidenceType}.`); status.setAttribute('role', 'status'); content.append(status);
  }
  render();
  return {setCase};
}

function measures(container, measurement) {
  if (!measurement?.areas?.length) { container.append(make('p', 'lib-empty', 'The measurement menu is unavailable.')); return; }
  let current = 0, regionIndex = 0;
  container.append(make('p', 'lib-measure-intro', 'A focused menu for further inquiry. Choose one question and a defined group; start with existing records.'));
  const areas = make('div', 'lib-area-selector'); areas.setAttribute('role','group'); areas.setAttribute('aria-label','Choose an area to follow');
  const stage = make('div', 'lib-measure-stage');
  const regionStage = make('div', 'lib-region-stage');
  const buttons = measurement.areas.map((area, i) => { const b = button(area.name, 'lib-area', () => { current=i; pressed(buttons, current); render(); }); b.setAttribute('aria-pressed',String(i===0)); areas.append(b); return b; });
  container.append(areas, stage);
  const regionControls = make('div', 'lib-region-controls'); regionControls.setAttribute('role','group'); regionControls.setAttribute('aria-label','Choose the regional reference point');
  const regions = (measurement.regions || []).map((region,i) => { const b = button(region.name, 'lib-region-button', () => { regionIndex=i; pressed(regions, regionIndex); renderRegion(); }); b.setAttribute('aria-pressed',String(i===0)); regionControls.append(b); return b; });
  const regionSection = make('section', 'lib-regional'); regionSection.append(make('h3', '', 'The reference point matters.'), regionControls, regionStage); container.append(regionSection);
  container.append(disclosure('How to use this selective menu', (measurement.principles || []).map((text,i)=>[i === 0 ? 'Scope' : ['Existing records first','Follow defined groups','Interpret carefully','Proportionate effort'][i-1] || 'Principle', text]), measurement.sources));
  function render() {
    const area = measurement.areas[current]; stage.replaceChildren();
    stage.append(sequence(areaSummaries[area.id] || ['Existing records','Relevant outcomes','A decision'], ['RECORDS', 'OUTCOME TO FOLLOW', 'DECISION'], ['records','track','decide']));
    stage.append(evidenceSummary([['Limit', areaLimits[area.id] || area.limit]], 'lib-evidence-single'));
    stage.append(disclosure(`Measurement detail · ${area.name}`, [['Records to start with',area.records],['What to follow',area.track],['Decision it can inform',area.decision],['Full measurement limit',area.limit]]));
    const live=make('p','lib-screen-status',`Measurement area: ${area.name}`); live.setAttribute('role','status');stage.append(live);
  }
  function renderRegion() {
    const region = measurement.regions[regionIndex]; if (!region) return; regionStage.replaceChildren();
    const sg = region.id === 'singapore-johor';
    const timeline = make('div', 'lib-reference-line');
    const a=make('div','lib-reference-stop'); a.append(make('span','lib-reference-dot'),make('strong','',sg?'Pre-opening reference, if feasible':'Choose an activity or group'));
    const line=make('span','lib-reference-link'); line.innerHTML=arrow;
    const b=make('div','lib-reference-stop');b.append(make('span','lib-reference-dot'),make('strong','','Follow change over time'));
    timeline.append(a,line,b); regionStage.append(timeline);
    regionStage.append(evidenceSummary([['Comparison limit', sg ? 'Keep spending in both directions visible. Separate RTS changes from JS-SEZ investment and other developments; forecasts are not observed outcomes.' : 'No general pre-integration baseline. The accounts suggest contrasts, but their prevalence is unknown; observed change does not establish its cause.']], 'lib-evidence-single'));
    regionStage.append(disclosure('Regional approach and full limits',[['Approach',region.approach],['Full comparison limit',region.caveat]]));
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
    stage.append(evidenceSummary([['Keep the comparison bounded', item.caveat]], 'lib-evidence-single'));
    stage.append(disclosure('Further reading sources',[],item.sources));
    const live=make('p','lib-screen-status',`Future reading: ${item.name}`);live.setAttribute('role','status');stage.append(live);
  }
  render();
}

export function initLibrary(container, cases, measurement, future) {
  if (!container) return { pause() {}, setCase() {return false;}, destroy() {} };
  container.classList.add('lib-root');
  const mode=container.dataset.library;
  container.replaceChildren();
  let controller;
  if(mode==='responses')controller=responses(container,cases);
  else if(mode==='measurement')measures(container,measurement);
  else if(mode==='future')futureQuestions(container,future);
  const motion=motionControls(container);
  return { pause:motion.pause, setCase(id){return controller?.setCase(id) || false;}, destroy(){motion.destroy();container.replaceChildren();} };
}
