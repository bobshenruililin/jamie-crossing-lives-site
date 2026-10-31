/* Selected geography and policy documents. No routes, travel estimates or plan polygons. */
const NS = 'http://www.w3.org/2000/svg';
let sequence = 0;
const node = (tag, className, text) => {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
};
const svgNode = (tag, attrs = {}, text) => {
  const e = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([key, value]) => e.setAttribute(key, value));
  if (text !== undefined) e.textContent = text;
  return e;
};
const link = (label, url, className = '') => {
  const e = node('a', className, label);
  e.href = url;
  e.target = '_blank';
  e.rel = 'noopener';
  return e;
};

function locator(region, id) {
  const map = region.map;
  const svg = svgNode('svg', { viewBox: map.viewBox.join(' '), role: 'img', 'aria-labelledby': `${id}-title ${id}-desc`, class: 'pm-map' });
  svg.append(svgNode('title', { id: `${id}-title` }, region.label), svgNode('desc', { id: `${id}-desc` }, region.mapAlt));
  svg.append(svgNode('rect', { width: 900, height: 560, class: 'pm-water' }));
  const land = svgNode('g', { class: 'pm-land' });
  map.features.forEach(feature => land.append(svgNode('path', { d: feature.path, class: feature.focus ? 'pm-focus-land' : '', 'fill-rule': 'evenodd' })));
  svg.append(land);
  const context = region.contextLabel;
  const water = region.waterLabel;
  svg.append(svgNode('text', { x: context.x, y: context.y, class: 'pm-place-context' }, context.text));
  svg.append(svgNode('text', { x: water.x, y: water.y, class: 'pm-water-label', 'text-anchor': 'middle' }, water.text));
  map.places.forEach(place => {
    const [x, y] = place.xy;
    svg.append(svgNode('circle', { cx: x, cy: y, r: 7, class: 'pm-city-dot' }));
    svg.append(svgNode('text', { x: place.labelXY[0], y: place.labelXY[1], class: 'pm-city-name', 'text-anchor': place.labelAnchor }, place.name));
  });
  const bar = map.scaleBar;
  svg.append(svgNode('path', { d: `M${bar.x},${bar.y - 5}v10m0,-5h${bar.width}m0,-5v10`, class: 'pm-scale-line' }));
  svg.append(svgNode('text', { x: bar.x, y: bar.y + 26, class: 'pm-scale-text' }, `${bar.km} km`));
  svg.append(svgNode('path', { d: 'M840,90V57m-7,11 7,-11 7,11', class: 'pm-scale-line' }));
  svg.append(svgNode('text', { x: 840, y: 44, 'text-anchor': 'middle', class: 'pm-scale-text' }, 'N'));
  return svg;
}

/** Mount into a host with a plain-text/link fallback. Resolves to a destroy() handle. */
export async function mountPolicyMap(element, suppliedData) {
  const data = suppliedData || await fetch(new URL('./policy-map-data.json', import.meta.url)).then(response => {
    if (!response.ok) throw new Error(`Policy map data: ${response.status}`);
    return response.json();
  });
  const id = `policy-map-${++sequence}`;
  const documents = new Map(data.documents.map(d => [d.id, d]));
  const frame = node('div', 'pm-frame');
  const regionControls = node('div', 'pm-regions');
  regionControls.setAttribute('role', 'group');
  regionControls.setAttribute('aria-label', 'Choose a city-region');
  const regionButtons = data.regions.map((region, index) => {
    const b = node('button', '', region.shortLabel);
    b.type = 'button';
    b.dataset.pmRegion = index;
    b.setAttribute('aria-pressed', String(index === 0));
    b.setAttribute('aria-controls', `${id}-region`);
    regionControls.append(b);
    return b;
  });
  const regionPanel = node('div', 'pm-region-panel');
  regionPanel.id = `${id}-region`;
  const mapWrap = node('figure', 'pm-figure');
  const image = node('div', 'pm-map-wrap');
  const caption = node('figcaption', 'pm-caption');
  caption.append(node('span', '', 'Generalised locator map · selected city locations'), link('Made with Natural Earth ↗', data.meta.geography.url));
  mapWrap.append(image, caption);
  const context = node('div', 'pm-context');
  const institution = node('p', 'pm-institution');
  const regionTitle = node('h3', 'pm-region-title');
  const orientation = node('p', 'pm-orientation');
  const question = node('p', 'pm-question');
  context.append(institution, regionTitle, orientation, node('p', 'pm-small-label', 'The research question'), question);
  regionPanel.append(mapWrap, context);

  const policyArea = node('section', 'pm-policy-area');
  policyArea.setAttribute('aria-labelledby', `${id}-policy-title`);
  const header = node('div', 'pm-policy-header');
  const policyTitle = node('h3', '', 'Read the policy context');
  policyTitle.id = `${id}-policy-title`;
  header.append(policyTitle, node('p', '', 'Select a document to see its scope and the question it leaves open.'));
  const docControls = node('div', 'pm-doc-controls');
  docControls.setAttribute('role', 'group');
  docControls.setAttribute('aria-label', 'Choose a policy document');
  const docPanel = node('div', 'pm-doc-panel');
  docPanel.id = `${id}-document`;
  const docCopy = node('div', 'pm-doc-copy');
  const docMeta = node('p', 'pm-doc-meta');
  const docTitle = node('h4', 'pm-doc-title');
  const docScope = node('p', 'pm-doc-scope');
  const summary = node('p', 'pm-doc-summary');
  const mechanisms = node('ul', 'pm-mechanisms');
  const docSources = node('div', 'pm-doc-sources');
  docCopy.append(docMeta, docTitle, docScope, summary, mechanisms, docSources);
  const interpretation = node('aside', 'pm-interpretation');
  const docQuestion = node('p', 'pm-doc-question');
  const docLimit = node('p', 'pm-doc-limit');
  interpretation.append(node('p', 'pm-small-label', 'What would show it works?'), docQuestion, docLimit);
  docPanel.append(docCopy, interpretation);
  policyArea.append(header, docControls, docPanel);
  const method = node('details', 'pm-method');
  const methodSummary = node('summary', '', 'Map scope and source notes');
  const methodText = node('p', '', `${data.meta.geography.limits} The two maps use separate scales and show no policy-zone boundary. Natural Earth land outlines and city points are generalised at 1:10 million. Sources checked 31 October 2026.`);
  const methodMore = node('p', '', 'Policy documents describe intentions and arrangements. They are selected context for this inquiry, rather than additional fieldwork findings or evidence that the arrangements achieve their aims.');
  method.append(methodSummary, methodText, methodMore);
  const status = node('span', 'pm-visually-hidden');
  status.setAttribute('role', 'status');
  frame.append(regionControls, regionPanel, policyArea, method, status);

  let regionIndex = 0;
  let docIndex = 0;
  let docButtons = [];
  function selectDocument(index, announce = true) {
    docIndex = index;
    const doc = documents.get(data.regions[regionIndex].documentIds[index]);
    docButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
    docMeta.textContent = `${doc.kind} · ${doc.date}`;
    docTitle.textContent = doc.title;
    docScope.textContent = doc.scope;
    summary.textContent = doc.summary;
    mechanisms.replaceChildren(...doc.mechanisms.map(text => node('li', '', text)));
    docQuestion.textContent = doc.question;
    docLimit.textContent = doc.limit;
    docSources.replaceChildren(link(`${doc.sourceLabel} ↗`, doc.url));
    if (doc.secondUrl) docSources.append(link(`${doc.secondLabel} ↗`, doc.secondUrl));
    if (announce) status.textContent = `${doc.title}. ${doc.scope}.`;
  }
  function selectRegion(index, announce = true) {
    regionIndex = index;
    const region = data.regions[index];
    regionButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(index === i)));
    image.replaceChildren(locator(region, `${id}-${region.id}`));
    institution.textContent = region.institution;
    regionTitle.textContent = region.label;
    orientation.textContent = region.orientation;
    question.textContent = region.question;
    docButtons = region.documentIds.map((docId, i) => {
      const doc = documents.get(docId);
      const b = node('button', '');
      b.type = 'button';
      b.dataset.pmDoc = i;
      b.setAttribute('aria-controls', `${id}-document`);
      b.append(node('span', 'pm-doc-year', doc.year), node('span', 'pm-doc-choice-title', doc.title));
      return b;
    });
    docControls.replaceChildren(...docButtons);
    selectDocument(0, false);
    if (announce) status.textContent = `${region.label}. ${region.institution}. ${region.documentIds.length} policy documents available.`;
  }
  function clickRegion(event) {
    const b = event.target.closest('[data-pm-region]');
    if (b && regionControls.contains(b)) selectRegion(Number(b.dataset.pmRegion));
  }
  function clickDocument(event) {
    const b = event.target.closest('[data-pm-doc]');
    if (b && docControls.contains(b)) selectDocument(Number(b.dataset.pmDoc));
  }
  function keyChoice(event, buttons, current, choose) {
    if (!buttons.includes(event.target)) return;
    let next;
    if (event.key === 'ArrowRight') next = (current + 1) % buttons.length;
    else if (event.key === 'ArrowLeft') next = (current + buttons.length - 1) % buttons.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = buttons.length - 1;
    else return;
    event.preventDefault();
    choose(next);
    buttons[next].focus();
  }
  const keyRegion = event => keyChoice(event, regionButtons, regionIndex, selectRegion);
  const keyDocument = event => keyChoice(event, docButtons, docIndex, selectDocument);
  regionControls.addEventListener('click', clickRegion);
  regionControls.addEventListener('keydown', keyRegion);
  docControls.addEventListener('click', clickDocument);
  docControls.addEventListener('keydown', keyDocument);
  element.replaceChildren(frame);
  selectRegion(0, false);
  return { destroy() {
    regionControls.removeEventListener('click', clickRegion);
    regionControls.removeEventListener('keydown', keyRegion);
    docControls.removeEventListener('click', clickDocument);
    docControls.removeEventListener('keydown', keyDocument);
    element.replaceChildren();
  } };
}
