'use strict';

(() => {
  const byId = (id) => document.getElementById(id);
  const string = (value) => typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';
  const list = (value) => Array.isArray(value) ? value : [];
  const numberLabel = (index) => String(index + 1).padStart(2, '0');
  const announce = (message) => { byId('interaction-status').textContent = message; };
  const palette = { aqua: '#acdcd3', orange: '#ef704f', ivory: '#f3efe5', grid: '#3d6264', muted: '#adc7bc', ink: '#082f35' };
  const shortDatasetNames = { journeys: 'Journeys', retail: 'Retail', restaurants: 'Restaurants', capacity: 'Business capacity', work: 'Work', care: 'Care', flows: 'Two-way spending' };
  let arrangements = [];
  let datasets = [];
  let cases = [];
  let selectedCase = '';
  let measurement = { areas: [], regions: [], principles: [] };
  let reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let motionChosen = false;

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = string(content);
    return node;
  }

  function publicUrl(value) {
    try {
      const url = new URL(string(value));
      if (!['https:', 'http:'].includes(url.protocol)) return null;
      if (['docs.google.com', 'drive.google.com'].includes(url.hostname.toLowerCase())) return null;
      if (url.username || url.password) return null;
      return url.href;
    } catch { return null; }
  }

  function renderSources(host, sources) {
    host.replaceChildren();
    list(sources).forEach((source) => {
      const url = publicUrl(source && source.url);
      if (!url) return;
      const anchor = element('a', '', source.label || new URL(url).hostname);
      anchor.href = url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      host.append(anchor);
    });
    host.hidden = !host.childElementCount;
  }

  function appendCopy(host, value) {
    if (Array.isArray(value)) {
      const ul = element('ul');
      value.forEach((item) => { if (string(item)) ul.append(element('li', '', item)); });
      host.append(ul);
    } else {
      host.append(element('p', '', value));
    }
  }

  function empty(host, message) {
    host.replaceChildren(element('p', 'loading-note', message));
  }

  async function fetchJson(path) {
    const response = await fetch(new URL(path, document.baseURI));
    if (!response.ok) throw new Error(path + ' unavailable (' + response.status + ')');
    return response.json();
  }

  function focusListKeys(host, selector, horizontal = false) {
    host.addEventListener('keydown', (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const forward = horizontal ? 'ArrowRight' : 'ArrowDown';
      const backward = horizontal ? 'ArrowLeft' : 'ArrowUp';
      if (![forward, backward, 'Home', 'End'].includes(event.key)) return;
      const buttons = [...host.querySelectorAll(selector)];
      const current = buttons.indexOf(document.activeElement);
      if (current < 0) return;
      event.preventDefault();
      let target = current;
      if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = buttons.length - 1;
      else target = Math.max(0, Math.min(buttons.length - 1, current + (event.key === forward ? 1 : -1)));
      buttons[target].focus();
    });
  }

  function selectArrangement(index, shouldAnnounce = true) {
    const item = arrangements[index];
    if (!item) return;
    byId('arrangement-options').querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    byId('arrangement-number').textContent = numberLabel(index);
    byId('arrangement-title').textContent = string(item.title);
    ['home', 'work', 'use', 'ties'].forEach((key) => { byId('life-' + key).textContent = string(item[key]) || 'Not specified'; });
    byId('arrangement-note').textContent = string(item.note);
    if (shouldAnnounce) announce('Selected arrangement: ' + item.title);
  }

  function buildArrangements() {
    const host = byId('arrangement-options');
    host.replaceChildren();
    if (!arrangements.length) {
      empty(host, 'The arrangement records are not available yet.');
      byId('arrangement-detail').hidden = true;
      return;
    }
    arrangements.forEach((item, index) => {
      const button = element('button', 'arrangement-button');
      button.type = 'button';
      button.setAttribute('aria-pressed', 'false');
      const arrow = element('span', 'option-arrow', '↗');
      arrow.setAttribute('aria-hidden', 'true');
      button.append(element('span', 'option-number', numberLabel(index)), element('span', '', item.title), arrow);
      button.addEventListener('click', () => selectArrangement(index));
      host.append(button);
    });
    selectArrangement(0, false);
  }

  const svgNamespace = 'http://www.w3.org/2000/svg';
  function svgElement(tag, attributes, content) {
    const node = document.createElementNS(svgNamespace, tag);
    Object.entries(attributes || {}).forEach(([key, value]) => node.setAttribute(key, String(value)));
    if (content !== undefined) node.textContent = string(content);
    return node;
  }

  function chartText(svg, x, y, value, options = {}) {
    const text = svgElement('text', Object.assign({ x, y, fill: palette.ivory, 'font-family': 'Barlow, sans-serif', 'font-size': 18 }, options), value);
    svg.append(text);
    return text;
  }

  function wrappedChartText(svg, x, y, value, maxCharacters = 28) {
    const words = string(value).split(/\s+/);
    const lines = [];
    let current = '';
    words.forEach((word) => {
      if (current && (current + ' ' + word).length > maxCharacters) { lines.push(current); current = word; }
      else current += (current ? ' ' : '') + word;
    });
    if (current) lines.push(current);
    const text = svgElement('text', { x, y, fill: palette.ivory, 'font-family': 'Barlow, sans-serif', 'font-size': 18 });
    lines.forEach((line, index) => text.append(svgElement('tspan', { x, dy: index ? 23 : -(lines.length - 1) * 11 }, line)));
    svg.append(text);
  }

  function chartShell(dataset, height) {
    const svg = svgElement('svg', { class: 'data-chart', viewBox: '0 0 1000 ' + height, role: 'img', 'aria-labelledby': 'chart-title chart-description' });
    svg.append(svgElement('title', { id: 'chart-title' }, dataset.title));
    svg.append(svgElement('desc', { id: 'chart-description' }, dataset.unit + '. ' + dataset.items.map((item) => item.label + ': ' + item.display).join('; ') + '. ' + dataset.caveat));
    const scroller = element('div', 'chart-scroll');
    scroller.tabIndex = 0;
    scroller.setAttribute('role', 'region');
    scroller.setAttribute('aria-label', 'Chart; scroll horizontally on small screens. Reported values are also in View the data.');
    scroller.append(svg);
    byId('chart-host').append(scroller);
    byId('chart-host').append(element('p', 'chart-pan-hint', 'Swipe to explore the chart; reported values are below in “View the data”.'));
    return svg;
  }

  function niceMaximum(value) {
    if (!(value > 0)) return 1;
    const power = Math.pow(10, Math.floor(Math.log10(value)));
    const fraction = value / power;
    return (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) * power;
  }

  function axisNumber(value) {
    return new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(Object.is(value, -0) ? 0 : value);
  }

  function itemColor(item, negative, index) {
    if (/^#[0-9a-f]{6}$/i.test(string(item.color))) return item.color;
    return negative ? palette.orange : index % 2 === 0 ? palette.aqua : '#7bbab0';
  }

  function drawBars(dataset) {
    const items = dataset.items.filter((item) => Number.isFinite(item.value));
    const hasNegative = items.some((item) => item.value < 0);
    const diverging = dataset.kind === 'diverging' || hasNegative;
    const extent = niceMaximum(Math.max(...items.map((item) => Math.abs(item.value)), 0));
    const domainMin = diverging ? -extent : 0;
    const domainMax = extent;
    const left = 280;
    const width = 570;
    const height = Math.max(300, items.length * 103 + 112);
    const top = 35;
    const bottom = height - 55;
    const x = (value) => left + (value - domainMin) / (domainMax - domainMin) * width;
    const svg = chartShell(dataset, height);
    const ticks = diverging ? [-extent, -extent / 2, 0, extent / 2, extent] : [0, extent / 4, extent / 2, extent * .75, extent];
    ticks.forEach((value) => {
      svg.append(svgElement('line', { x1: x(value), x2: x(value), y1: top, y2: bottom, stroke: value === 0 ? palette.ivory : palette.grid, 'stroke-width': value === 0 ? 1.5 : 1, 'stroke-dasharray': value === 0 ? '' : '3 7' }));
      chartText(svg, x(value), height - 22, axisNumber(value), { 'text-anchor': 'middle', fill: palette.muted, 'font-size': 15 });
    });
    items.forEach((item, index) => {
      const y = 83 + index * 103;
      const valueX = x(item.value);
      wrappedChartText(svg, 0, y + 5, item.label);
      svg.append(svgElement('rect', { x: Math.min(x(0), valueX), y: y - 22, width: Math.abs(valueX - x(0)), height: 44, fill: itemColor(item, item.value < 0, index) }));
      chartText(svg, 995, y + 10, item.display || axisNumber(item.value), { 'text-anchor': 'end', 'font-family': 'Display, sans-serif', 'font-weight': 700, 'font-size': 34, fill: item.value < 0 ? palette.orange : palette.aqua });
    });
    byId('chart-host').append(element('p', 'chart-caption', diverging ? 'Bars extend from zero. Negative and positive values share the same scale.' : 'Bar lengths begin at zero and use one common scale.'));
  }

  function drawFlows(dataset) {
    const items = dataset.items.filter((item) => Number.isFinite(item.value) && item.value >= 0);
    if (items.length !== 2) { drawBars(dataset); return; }
    const maximum = Math.max(...items.map((item) => item.value), 1);
    const plotLeft = 70;
    const plotRight = 820;
    const plotWidth = plotRight - plotLeft;
    const svg = chartShell(dataset, 390);
    items.forEach((item, index) => {
      const y = 100 + index * 155;
      const length = item.value / maximum * plotWidth;
      const head = Math.min(24, length);
      const half = 22;
      let points;
      if (index === 0) {
        const tip = plotLeft + length;
        points = [[plotLeft,y-half],[tip-head,y-half],[tip,y],[tip-head,y+half],[plotLeft,y+half]];
      } else {
        const tip = plotRight - length;
        points = [[plotRight,y-half],[tip+head,y-half],[tip,y],[tip+head,y+half],[plotRight,y+half]];
      }
      chartText(svg, plotLeft, y - 47, item.label, { 'font-size': 20 });
      svg.append(svgElement('line', { x1: plotLeft, x2: plotRight, y1: y, y2: y, stroke: palette.grid, 'stroke-width': 1 }));
      svg.append(svgElement('polygon', { points: points.map((point) => point.join(',')).join(' '), fill: index === 0 ? palette.aqua : palette.orange }));
      chartText(svg, 995, y + 11, item.display, { 'text-anchor': 'end', 'font-family': 'Display, sans-serif', 'font-size': 37, fill: index === 0 ? palette.aqua : palette.orange });
    });
    chartText(svg, plotLeft, 325, 'Shared length scale · S$ million', { 'font-size': 13, fill: palette.muted });
    const axisY = 365;
    svg.append(svgElement('line', { x1: plotLeft, x2: plotRight, y1: axisY, y2: axisY, stroke: palette.muted, 'stroke-width': 1 }));
    [0, maximum / 2, maximum].forEach((value) => {
      const tickX = plotLeft + value / maximum * plotWidth;
      svg.append(svgElement('line', { x1: tickX, x2: tickX, y1: axisY - 4, y2: axisY + 4, stroke: palette.muted }));
      chartText(svg, tickX, axisY - 12, axisNumber(value), { 'font-size': 13, fill: palette.muted, 'text-anchor': 'middle' });
    });
    byId('chart-host').append(element('p', 'chart-caption', 'Arrow lengths share a magnitude scale. Directions are labelled; these are not geographic routes.'));
  }

  function drawMetrics(dataset) {
    const grid = element('div', 'metric-grid');
    dataset.items.forEach((item, index) => {
      const metric = element('div', 'metric');
      metric.append(element('span', 'metric-marker', numberLabel(index) + ' / DISTINCT MEASURE'), element('p', 'metric-label', item.label), element('p', 'metric-value', item.display || item.value));
      if (string(item.detail)) metric.append(element('p', 'metric-detail', item.detail));
      grid.append(metric);
    });
    byId('chart-host').append(grid, element('p', 'chart-caption', 'Separate measures. The tiles are not a shared scale, a total or a sequence.'));
  }

  function renderDataTable(dataset) {
    const table = element('table');
    const caption = element('caption', 'sr-only', dataset.title + '. ' + dataset.unit);
    const head = element('thead');
    const header = element('tr');
    ['Measure / period', 'Reported value', 'Detail'].forEach((label) => {
      const th = element('th', '', label);
      th.scope = 'col';
      header.append(th);
    });
    head.append(header);
    const body = element('tbody');
    dataset.items.forEach((item) => {
      const row = element('tr');
      const name = element('th', '', item.label);
      name.scope = 'row';
      row.append(name, element('td', '', item.display || item.value), element('td', '', item.detail || '—'));
      body.append(row);
    });
    table.append(caption, head, body);
    byId('data-table-host').replaceChildren(table);
  }

  function selectDataset(index, shouldAnnounce = true) {
    const dataset = datasets[index];
    if (!dataset) return;
    byId('dataset-options').querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    byId('dataset-eyebrow').textContent = string(dataset.eyebrow);
    byId('dataset-title').textContent = string(dataset.title);
    byId('dataset-index').textContent = numberLabel(index);
    byId('dataset-unit').textContent = 'Unit: ' + string(dataset.unit);
    byId('dataset-summary').textContent = string(dataset.summary);
    byId('dataset-caveat').textContent = string(dataset.caveat);
    byId('chart-host').replaceChildren();
    if (dataset.kind === 'metrics') drawMetrics(dataset);
    else if (dataset.kind === 'flows') drawFlows(dataset);
    else drawBars(dataset);
    renderDataTable(dataset);
    renderSources(byId('dataset-sources'), dataset.sources);
    if (shouldAnnounce) announce('Evidence view: ' + dataset.title + ' Unit: ' + dataset.unit);
    scheduleProgress();
  }

  function buildDatasets() {
    const host = byId('dataset-options');
    host.replaceChildren();
    if (!datasets.length) {
      empty(host, 'The evidence records are not available yet.');
      byId('dataset-panel').hidden = true;
      return;
    }
    datasets.forEach((dataset, index) => {
      const button = element('button', 'dataset-button', shortDatasetNames[dataset.id] || dataset.title);
      button.type = 'button';
      button.setAttribute('aria-pressed', 'false');
      button.title = string(dataset.title);
      button.addEventListener('click', () => selectDataset(index));
      host.append(button);
    });
    selectDataset(0, false);
  }

  function selectCase(id, shouldAnnounce = true) {
    const item = cases.find((record) => record.id === id);
    if (!item) return;
    selectedCase = id;
    byId('case-list').querySelectorAll('button').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.caseId === id)));
    byId('response-map-canvas').querySelectorAll('button').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.caseId === id)));
    const panel = byId('case-detail');
    panel.replaceChildren();
    if (byId('response-map').open) {
      const back = element('button', 'back-to-map', 'Back to response map ↑');
      back.type = 'button';
      back.addEventListener('click', () => {
        const node = [...byId('response-map-canvas').querySelectorAll('button')].find((button) => button.dataset.caseId === selectedCase);
        if (node) node.focus({ preventScroll: true });
        byId('response-map').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
      panel.append(back);
    }
    const tags = element('div', 'case-tags');
    [item.region, item.evidenceType].forEach((tag) => { if (string(tag)) tags.append(element('span', 'evidence-tag', tag)); });
    panel.append(tags, element('h3', '', item.name), element('p', 'case-mechanism', item.mechanism));
    [['What the evidence establishes', item.evidence, ''], ['Limits to keep in view', item.limit, ' limit']].forEach(([label, value, extra]) => {
      const block = element('div', 'case-copy' + extra);
      block.append(element('h4', '', label));
      appendCopy(block, value);
      panel.append(block);
    });
    const sources = element('div', 'source-links');
    sources.setAttribute('aria-label', 'Case sources');
    renderSources(sources, item.sources);
    panel.append(sources);
    if (shouldAnnounce) announce('Selected case: ' + item.name + '. ' + item.evidenceType + '.');
    scheduleProgress();
  }

  function filterCases() {
    const problem = byId('case-problem').value;
    const region = byId('case-region').value;
    const filtered = cases.filter((item) => (!problem || item.problem === problem) && (!region || item.region === region));
    renderResponseMap(filtered);
    byId('case-count').textContent = filtered.length + ' of ' + cases.length + ' cases';
    const host = byId('case-list');
    host.replaceChildren();
    if (!filtered.length) {
      empty(host, 'No cases match both filters. Try another region or problem.');
      empty(byId('case-detail'), 'Choose “All problems” or “All regions” to widen the view.');
      selectedCase = '';
      scheduleProgress();
      return;
    }
    filtered.forEach((item) => {
      const button = element('button', 'case-button');
      button.type = 'button';
      button.dataset.caseId = item.id;
      button.setAttribute('aria-pressed', 'false');
      const copy = element('span');
      copy.append(element('strong', '', item.name), element('small', '', item.region + ' · ' + item.problem));
      button.append(element('span', '', numberLabel(cases.indexOf(item))), copy);
      button.addEventListener('click', () => selectCase(item.id));
      host.append(button);
    });
    selectCase(filtered.some((item) => item.id === selectedCase) ? selectedCase : filtered[0].id, false);
  }

  function renderResponseMap(filtered) {
    const host = byId('response-map-canvas');
    const legend = byId('map-legend');
    host.replaceChildren();
    legend.replaceChildren();
    const types = [...new Set(cases.map((item) => item.evidenceType))];
    const typeClass = (item) => 'evidence-kind-' + types.indexOf(item.evidenceType);
    types.forEach((type, index) => legend.append(element('span', 'map-legend-item evidence-kind-' + index, type)));
    const problems = [...new Set(cases.map((item) => item.problem))].filter((problem) => !byId('case-problem').value || problem === byId('case-problem').value);
    const width = 1160;
    const height = problems.length * 116 + 12;
    host.style.height = height + 'px';
    const graphic = svgElement('svg', { class: 'map-connections', viewBox: '0 0 ' + width + ' ' + height, 'aria-hidden': 'true' });
    host.append(graphic);
    problems.forEach((problem, row) => {
      const rowItems = filtered.filter((item) => item.problem === problem);
      const y = row * 116 + 35;
      const label = element('div', 'map-category');
      label.style.top = (y - 18) + 'px';
      label.append(element('strong', '', problem), element('span', '', rowItems.length + (rowItems.length === 1 ? ' case' : ' cases')));
      host.append(label);
      graphic.append(svgElement('line', { x1: 0, x2: width, y1: y + 74, y2: y + 74, stroke: '#cad0c5', 'stroke-width': 1 }));
      if (!rowItems.length) {
        const none = element('p', 'map-empty-lane', 'No cases in this filter');
        none.style.top = (y - 8) + 'px';
        host.append(none);
        return;
      }
      const lastX = 310 + (rowItems.length - 1) * 110;
      graphic.append(svgElement('path', { d: 'M235 ' + y + ' H' + lastX, stroke: '#829d92', 'stroke-width': 1.5, fill: 'none' }));
      graphic.append(svgElement('circle', { cx: 235, cy: y, r: 3, fill: '#307e79' }));
      rowItems.forEach((item, index) => {
        const button = element('button', 'map-case-node ' + typeClass(item));
        button.type = 'button';
        button.dataset.caseId = item.id;
        button.style.left = (310 + index * 110 - 44) + 'px';
        button.style.top = (y - 23) + 'px';
        button.setAttribute('aria-label', item.name + '. ' + item.evidenceType + '. Select to read evidence and limits.');
        button.setAttribute('aria-pressed', String(item.id === selectedCase));
        button.title = item.name + ' · ' + item.region + ' · ' + item.evidenceType;
        button.append(element('span', 'map-node-number', numberLabel(cases.indexOf(item))), element('span', 'map-node-name', item.name));
        button.addEventListener('click', () => {
          selectCase(item.id);
          byId('case-detail').focus({ preventScroll: true });
          byId('case-detail').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        });
        host.append(button);
      });
    });
    scheduleProgress();
  }

  function buildCaseFilters() {
    ['problem', 'region'].forEach((key) => {
      const select = byId('case-' + key);
      [...new Set(cases.map((item) => string(item[key])).filter(Boolean))].forEach((value) => {
        const option = element('option', '', value);
        option.value = value;
        select.append(option);
      });
    });
    filterCases();
  }

  function renderRegion() {
    const item = measurement.regions.find((record) => record.id === byId('measure-region').value);
    const host = byId('region-note');
    host.replaceChildren();
    if (!item) return;
    const copy = element('div');
    copy.append(element('p', '', item.approach), element('p', 'region-caveat', item.caveat));
    host.append(element('h3', '', item.name), copy);
    announce('Regional measurement approach: ' + item.name);
    scheduleProgress();
  }

  function renderMeasurement() {
    const item = measurement.areas.find((record) => record.id === byId('measure-area').value);
    const host = byId('measure-detail');
    host.replaceChildren();
    if (!item) return;
    host.append(element('h3', '', item.name));
    const grid = element('div', 'measure-grid');
    [['What to track', item.track, ''], ['Existing records to begin with', item.records, ''], ['What decision it can inform', item.decision, ''], ['Limits and interpretation', item.limit, ' limit']].forEach(([label, value, extra]) => {
      const block = element('div', 'measure-block' + extra);
      block.append(element('h4', '', label));
      appendCopy(block, value);
      grid.append(block);
    });
    host.append(grid);
    announce('Measurement area: ' + item.name);
    scheduleProgress();
  }

  function buildMeasurement() {
    ['regions', 'areas'].forEach((key) => {
      const select = byId(key === 'regions' ? 'measure-region' : 'measure-area');
      select.replaceChildren();
      measurement[key].forEach((item) => {
        const option = element('option', '', item.name);
        option.value = item.id;
        select.append(option);
      });
      select.disabled = !measurement[key].length;
    });
    const principles = byId('measure-principles');
    principles.replaceChildren();
    measurement.principles.forEach((principle) => principles.append(element('li', '', principle)));
    const sourceHost = byId('measure-sources');
    renderSources(sourceHost, measurement.sources);
    renderRegion();
    renderMeasurement();
    if (!measurement.areas.length) empty(byId('measure-detail'), 'The measurement records are not available yet.');
  }

  function buildFuture(records) {
    const host = byId('future-list');
    host.replaceChildren();
    if (!records.length) { empty(host, 'The further-reading records are not available yet.'); return; }
    records.forEach((item, index) => {
      const entry = element('details', 'future-entry');
      const summary = element('summary');
      const title = element('span', 'future-name', item.name);
      title.append(element('span', 'future-places', item.places));
      const symbol = element('span', 'future-toggle', '+');
      symbol.setAttribute('aria-hidden', 'true');
      summary.append(element('span', 'future-number', numberLabel(index)), title, symbol);
      const body = element('div', 'future-body');
      const aside = element('div');
      const sources = element('div', 'source-links');
      renderSources(sources, item.sources || (item.source ? [item.source] : []));
      aside.append(element('p', 'future-caveat', item.caveat), sources);
      body.append(element('p', 'future-question', item.question), aside);
      entry.append(summary, body);
      entry.addEventListener('toggle', scheduleProgress);
      host.append(entry);
    });
  }

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  function setMotion(reduced) {
    reduceMotion = reduced;
    document.body.dataset.motion = reduced ? 'off' : 'on';
    document.documentElement.style.scrollBehavior = reduced ? 'auto' : 'smooth';
    byId('motion-toggle').textContent = reduced ? 'Motion off' : 'Motion on';
    byId('motion-toggle').setAttribute('aria-pressed', String(!reduced));
    if (reduced) document.querySelectorAll('.reveal').forEach((node) => node.classList.add('is-visible'));
  }

  function initializeReveals() {
    if (!('IntersectionObserver' in window)) { setMotion(true); return; }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: .08 });
    document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));
    setMotion(reduceMotion);
  }

  const rail = document.querySelector('.chapter-rail');
  const chapters = [...document.querySelectorAll('.chapter')];
  let progressQueued = false;
  function updateProgress() {
    progressQueued = false;
    const length = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    rail.style.setProperty('--progress', String(Math.max(0, Math.min(1, window.scrollY / length))));
    let active = '';
    chapters.forEach((chapter) => { if (chapter.getBoundingClientRect().top <= window.innerHeight * .38) active = chapter.id; });
    rail.querySelectorAll('a').forEach((anchor) => {
      if (anchor.getAttribute('href') === '#' + active) anchor.setAttribute('aria-current', 'location');
      else anchor.removeAttribute('aria-current');
    });
  }

  function scheduleProgress() {
    if (!progressQueued) { progressQueued = true; window.requestAnimationFrame(updateProgress); }
  }

  byId('case-problem').addEventListener('change', filterCases);
  byId('case-region').addEventListener('change', filterCases);
  byId('response-map').addEventListener('toggle', () => {
    if (selectedCase) selectCase(selectedCase, false);
    scheduleProgress();
  });
  byId('measure-area').addEventListener('change', renderMeasurement);
  byId('measure-region').addEventListener('change', renderRegion);
  byId('motion-toggle').addEventListener('click', () => { motionChosen = true; setMotion(!reduceMotion); });
  motionQuery.addEventListener('change', (event) => { if (!motionChosen) setMotion(event.matches); });
  focusListKeys(byId('arrangement-options'), 'button');
  focusListKeys(byId('dataset-options'), 'button', true);
  focusListKeys(byId('case-list'), 'button');
  focusListKeys(byId('response-map-canvas'), 'button', true);
  window.addEventListener('scroll', scheduleProgress, { passive: true });
  window.addEventListener('resize', scheduleProgress);
  window.addEventListener('load', scheduleProgress);
  chapters.forEach((chapter) => chapter.setAttribute('tabindex', '-1'));
  initializeReveals();
  scheduleProgress();

  async function start() {
    const results = await Promise.allSettled([
      fetchJson('research-data.json'),
      fetchJson('data/response-cases.json'),
      fetchJson('data/measurement-menu.json'),
    ]);
    if (results[0].status === 'fulfilled') {
      const data = results[0].value;
      arrangements = list(data.arrangements);
      datasets = list(data.datasets).map((dataset) => Object.assign({}, dataset, { items: list(dataset.items) }));
      buildArrangements();
      buildDatasets();
      buildFuture(list(data.future));
    } else {
      empty(byId('arrangement-options'), 'The arrangement records could not be loaded. Please refresh the local preview when the data is available.');
      byId('arrangement-detail').hidden = true;
      empty(byId('dataset-options'), 'The evidence records could not be loaded.');
      byId('dataset-panel').hidden = true;
      empty(byId('future-list'), 'The further-reading records could not be loaded.');
      console.error(results[0].reason);
    }
    if (results[1].status === 'fulfilled') {
      cases = list(results[1].value);
      buildCaseFilters();
    } else {
      byId('case-problem').disabled = true;
      byId('case-region').disabled = true;
      byId('case-count').textContent = 'Cases unavailable';
      empty(byId('case-detail'), 'The response records could not be loaded. Please refresh when the local data is available.');
      console.error(results[1].reason);
    }
    if (results[2].status === 'fulfilled') {
      const data = results[2].value;
      measurement = { areas: list(data.areas), regions: list(data.regions), principles: list(data.principles), sources: list(data.sources) };
      buildMeasurement();
    } else {
      byId('measure-region').disabled = true;
      byId('measure-area').disabled = true;
      empty(byId('measure-detail'), 'The measurement records could not be loaded. Please refresh when the local data is available.');
      console.error(results[2].reason);
    }
    scheduleProgress();
  }

  void start();
})();
