let overviewInstance = 0;

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function sourceLink(source) {
  const url = new URL(source.url);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Unsupported research source URL');
  const link = node('a', '', `${source.label} ↗`);
  link.href = url.href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

/** Optional research-map depth. Publication order is separate from data periods. */
export async function mountResearchOverview(host, suppliedData) {
  if (!host) return {destroy() {}};
  const data = suppliedData || await fetch(new URL('./research-overview-data.json?v=20261107-feedback', import.meta.url)).then(response => {
    if (!response.ok) throw new Error(`Research map could not load (${response.status})`);
    return response.json();
  });
  if (!data.studies?.length || !data.framework?.lenses?.length) throw new Error('Research map data are incomplete');

  const uid = `research-overview-${++overviewInstance}`;
  const shell = node('div', 'ro-shell');
  const introduction = node('p', 'ro-introduction', data.scope);
  const publicationLabel = node('p', 'ro-timeline-label', 'Hong Kong–Shenzhen first · Singapore–Johor as a separate research context');
  const timeline = node('div', 'ro-timeline');
  timeline.setAttribute('role', 'group');
  timeline.setAttribute('aria-label', 'Choose a study in the research map');
  const stage = node('article', 'ro-study');
  stage.id = `${uid}-study`;
  stage.setAttribute('aria-labelledby', `${uid}-title`);
  const live = node('p', 'ro-status');
  live.setAttribute('role', 'status');
  let selected = 0;
  const regionLists = new Map();
  for (const region of ['Hong Kong–Shenzhen', 'Singapore–Johor']) {
    const group = node('section', 'ro-region');
    group.append(node('h4', 'ro-region-title', region));
    const choices = node('div', 'ro-region-choices');
    group.append(choices); timeline.append(group); regionLists.set(region, choices);
  }
  const buttons = data.studies.map((study, index) => {
    const button = node('button', 'ro-choice');
    button.type = 'button';
    button.dataset.study = study.id;
    button.setAttribute('aria-pressed', String(index === 0));
    button.setAttribute('aria-controls', stage.id);
    button.append(node('span', 'ro-year', study.year), node('span', 'ro-choice-title', study.selector));
    regionLists.get(study.region).append(button);
    return button;
  });

  function render(changed = false) {
    const study = data.studies[selected];
    buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === selected)));
    const identity = node('div', 'ro-identity');
    const heading = node('h4', 'ro-title', study.title);
    heading.id = `${uid}-title`;
    identity.append(node('p', 'ro-type', study.type), heading, node('p', 'ro-authors', study.authors), node('p', 'ro-contribution', study.contribution));
    const metadata = node('dl', 'ro-metadata');
    [['Publication', study.publication], ['Evidence period', study.dataPeriod], ['Geography', study.geography], ['Method', study.method]].forEach(([label, value]) => {
      const row = node('div');
      row.append(node('dt', '', label), node('dd', '', value));
      metadata.append(row);
    });
    const boundary = node('p', 'ro-boundary');
    boundary.append(node('strong', '', 'Keep the comparison bounded. '), document.createTextNode(study.limit));
    const sources = node('div', 'ro-sources');
    study.sources.forEach(source => sources.append(sourceLink(source)));
    stage.replaceChildren(identity, metadata, boundary, sources);
    if (changed) {
      stage.classList.remove('ro-changed');
      // The new content is immediately available; only a short visual feedback cue animates.
      void stage.offsetWidth;
      stage.classList.add('ro-changed');
      live.textContent = `Selected: ${study.authors}, ${study.publication}.`;
    }
  }

  const framework = data.framework;
  const frameworkSection = node('section', 'ro-framework');
  const frameworkHeading = node('h4', 'ro-framework-title', framework.title);
  const frameworkIntro = node('div', 'ro-framework-intro');
  frameworkIntro.append(node('p', 'ro-type', 'How the study adapts a framework'), frameworkHeading, node('p', '', framework.introduction));
  const lenses = node('ol', 'ro-lenses');
  framework.lenses.forEach(lens => {
    const item = node('li');
    item.append(node('strong', '', lens.name), node('span', '', lens.themes));
    lenses.append(item);
  });
  const frameworkBoundary = node('p', 'ro-boundary', framework.limit);
  const frameworkSource = node('div', 'ro-sources');
  frameworkSource.append(sourceLink({label:framework.source, url:framework.url}));
  frameworkSection.append(frameworkIntro, lenses, node('p', 'ro-institutions', framework.institutions), frameworkBoundary, frameworkSource);
  shell.append(introduction, publicationLabel, timeline, stage, live, frameworkSection);
  host.replaceChildren(shell);
  render();

  const click = event => {
    const button = event.target.closest('[data-study]');
    if (!button || !timeline.contains(button)) return;
    const next = data.studies.findIndex(study => study.id === button.dataset.study);
    if (next < 0 || next === selected) return;
    selected = next;
    render(true);
  };
  const motion = event => shell.classList.toggle('ro-motion-off', Boolean(event.detail?.paused));
  shell.classList.toggle('ro-motion-off', document.documentElement.dataset.motion === 'off');
  timeline.addEventListener('click', click);
  document.addEventListener('crossing:motion', motion);
  return {destroy() { timeline.removeEventListener('click', click); document.removeEventListener('crossing:motion', motion); host.replaceChildren(); }};
}
