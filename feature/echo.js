/* Singapore–Johor: the same miniature, deliberately unbuilt.
   The Hong Kong–Shenzhen model is furnished by fieldwork. Here there is none
   yet, so buildings are dashed outlines and the places hold questions. The
   only filled marks are published figures: the RTS forecast (hatched arcs, a
   projection), the RTS opening target and a 2024 survey of stated interest.
   Conceptual geography: not a map, routes or measured flows. */
import { evidenceGlyph, esc, motionAllowed } from './grammar.js';

const NS = 'http://www.w3.org/2000/svg';
const TILT = .54, YAW = -.62;

/* Questions follow Script v3, slide 23. lens: A businesses, C lives, + residents. */
/* Marker and label positions were checked numerically against the arcs so
   they stay apart at phone width (see the layout note in the handoff). */
const MARKS = [
  { n: 1, lens: 'A', type: 'question', at: [262, -118, 30], text: 'What would people buy or do in Johor Bahru, and why?', note: 'Ask customers directly.' },
  { n: 2, lens: 'C', type: 'question', at: [-300, -104, 40], text: 'After a move, would spending, relationships and participation continue—and which ties stay remote?' },
  { n: 3, lens: 'C', type: 'question', at: [336, 8, 28], text: 'What new needs would Johor providers meet?' },
  { n: 4, lens: '+', type: 'question', at: [236, 116, 24], text: 'How do changing demand, jobs, housing and services affect people who already live in Johor?' },
  { n: 5, lens: 'C', type: 'published', at: [-292, 96, 26], text: '≈ 1 in 3 Singapore respondents could envisage buying a Johor Bahru home and retiring there, if travel became easier.', note: 'Stated interest in a 2024 survey, not observed moves.', href: 'https://www.linkedin.com/posts/blackbox-research_sensingsg-feb24-spotlight-on-the-sg-jb-activity-7165164423840550912-fz3R' },
  { n: 6, lens: '', type: 'published', at: [60, 40, 2], text: 'RTS Link passenger service is targeted for February 2027, subject to approvals.', href: 'https://www.lta.gov.sg/content/ltagov/en/newsroom/2026/10/news-releases/grantors-informed-rts-link-service-targeted-feb-2027.html' }
];
const OUTLINES = [
  [-366, -150, 44, 40, 100], [-306, -146, 58, 40, 62], [-232, -150, 52, 46, 118], [-366, -54, 66, 56, 40], [-276, -44, 88, 66, 48], [-170, -30, 44, 40, 30], [-360, 86, 70, 46, 64], [-262, 92, 104, 52, 26],
  [118, -150, 56, 44, 52], [192, -146, 66, 40, 34], [300, -156, 48, 46, 132], [118, -60, 86, 64, 44], [226, -54, 54, 50, 36], [304, -46, 64, 60, 30], [118, 90, 62, 48, 58], [200, 94, 46, 40, 40], [262, 90, 104, 60, 22]
];
const FLOWS = [
  { from: [-130, 6, 22], to: [130, 6, 22], lift: 120, t: .5, value: 1050, label: 'S$1.05bn', who: 'Singapore consumers spending in Johor Bahru', cls: 'out' },
  { from: [130, 30, 14], to: [-130, 30, 14], lift: 52, t: .86, value: 756, label: 'S$756m', who: 'Johor Bahru consumers spending in Singapore', cls: 'in' }
];

export function initEcho(host) {
  const project = (x, z, y = 0) => { const a = Math.cos(YAW), b = Math.sin(YAW); return [x * a - z * b, (x * b + z * a) * TILT - y]; };
  const P = (x, z, y) => project(x, z, y).map(v => v.toFixed(1)).join(',');
  const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent?.append(n); return n; };
  const poly = (pts, attrs, parent) => el('polygon', { points: pts.map(p => P(...p)).join(' '), ...attrs }, parent);
  const line = (pts, attrs, parent) => el('polyline', { points: pts.map(p => P(...p)).join(' '), fill: 'none', ...attrs }, parent);

  host.innerHTML = `<figure class="echo">
    <div class="echo-stage">
      <svg class="echo-scene" role="img" aria-labelledby="echo-title"><title id="echo-title">Singapore and Johor Bahru as an unbuilt miniature: dashed outlines where fieldwork would go, numbered questions, and two hatched forecast arcs of consumer spending in each direction.</title></svg>
      <div class="echo-overlay"></div>
      <div class="mini-sides" aria-hidden="true"><span class="side-sg">Singapore</span><span class="side-bd">The boundary</span><span class="side-jb">Johor Bahru</span></div>
    </div>
    <ol class="echo-list"></ol>
    <p class="echo-net">${evidenceGlyph('forecast')}<span>Hatched arcs: forecast extra consumer spending each year once the RTS Link opens. Net, about <b>S$290 million</b> more would flow out of Singapore than in—a forecast, not lost GDP. <a href="https://www.sbf.org.sg/docs/default-source/advocacy-policy/sbf-rts-study_final-report-16-jul.pdf?sfvrsn=b7ba6722_1" target="_blank" rel="noopener">SBF/RAS/SRA study, July 2026 ↗</a></span></p>
  </figure>`;
  const svg = host.querySelector('svg');
  const overlay = host.querySelector('.echo-overlay');
  const stage = host.querySelector('.echo-stage');
  const list = host.querySelector('.echo-list');

  // Scene
  const defs = el('defs', {}, svg);
  [['out', '#008c7a'], ['in', '#c9512d']].forEach(([id, c]) => {
    const pat = el('pattern', { id: `echo-hatch-${id}`, width: 7, height: 7, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    el('rect', { width: 7, height: 7, fill: '#f6f2e8' }, pat);
    el('rect', { width: 2.4, height: 7, fill: c }, pat);
  });
  const world = el('g', {}, svg);
  const [scx, scy] = project(0, 20, -30);
  el('ellipse', { cx: scx, cy: scy + 54, rx: 470, ry: 92, fill: '#315c4a', opacity: '.08' }, world);
  [-386, 100].forEach(x0 => {
    poly([[x0, -168, -24], [x0, 168, -24], [x0, 168, -2], [x0, -168, -2]], { fill: '#8fa39a' }, world);
    poly([[x0, 168, -24], [x0 + 286, 168, -24], [x0 + 286, 168, -2], [x0, 168, -2]], { fill: '#b7c2b2' }, world);
    poly([[x0, -168, -2], [x0 + 286, -168, -2], [x0 + 286, 168, -2], [x0, 168, -2]], { fill: '#e9e5d8' }, world);
    line([[x0, 168, -1.5], [x0 + 286, 168, -1.5]], { stroke: '#173e40', 'stroke-width': 1.6, opacity: .5 }, world);
  });
  // a slim rail bridge: the only built thing is the link itself
  poly([[-100, 0, 4], [100, 0, 4], [100, 22, 4], [-100, 22, 4]], { fill: '#e3d8c1', stroke: '#8c9b88', 'stroke-width': 1 }, world);
  [6, 16].forEach(z => line([[-100, z, 5], [100, z, 5]], { stroke: '#426d65', 'stroke-width': 1.4 }, world));
  for (let zz = -178; zz < 186; zz += 16) { if (zz > -6 && zz < 28) continue; line([[0, zz, -6], [0, zz + 7, -6]], { stroke: '#517d74', 'stroke-width': 1.4, 'stroke-opacity': .55 }, world); }
  // unbuilt outlines
  const outlines = el('g', { class: 'echo-outlines' }, world);
  const depth = (x, z) => x * Math.sin(YAW) + z * Math.cos(YAW);
  [...OUTLINES].sort((a, b) => depth(a[0] + a[2] / 2, a[1] + a[3] / 2) - depth(b[0] + b[2] / 2, b[1] + b[3] / 2)).forEach(([x, z, w, d, h]) => {
    const g = el('g', {}, outlines);
    line([[x, z, 0], [x + w, z, 0], [x + w, z + d, 0], [x, z + d, 0], [x, z, 0]], {}, g);
    line([[x, z, h], [x + w, z, h], [x + w, z + d, h], [x, z + d, h], [x, z, h]], {}, g);
    [[x, z], [x, z + d], [x + w, z + d]].forEach(([px, pz]) => line([[px, pz, 0], [px, pz, h]], {}, g));
  });
  // forecast arcs, width proportional to the forecast value
  const arcs = el('g', { class: 'echo-arcs' }, svg);
  const geometry = FLOWS.map(f => {
    const a = project(...f.from), b = project(...f.to);
    const c1 = [a[0] + (b[0] - a[0]) * .3, Math.min(a[1], b[1]) - f.lift], c2 = [a[0] + (b[0] - a[0]) * .7, Math.min(a[1], b[1]) - f.lift];
    const d = `M${a}C${c1} ${c2} ${b}`;
    const w = f.value / 1050 * 13;
    el('path', { d, fill: 'none', stroke: '#f6f2e8', 'stroke-width': w + 5, 'stroke-linecap': 'round' }, arcs);
    el('path', { d, fill: 'none', stroke: `url(#echo-hatch-${f.cls})`, 'stroke-width': w, 'stroke-linecap': 'butt', class: `echo-flow flow-${f.cls}` }, arcs);
    // labels sit near each flow's destination, so the two never collide mid-boundary
    const t = f.t, u = 1 - t;
    const mid = [0, 1].map(i => u * u * u * a[i] + 3 * u * u * t * c1[i] + 3 * u * t * t * c2[i] + t * t * t * b[i]);
    const tip = [0, 1].map(i => b[i]);
    return { f, mid, tip };
  });

  // camera: fit everything, matching the stage aspect ratio
  let vb;
  function fit() {
    const r = stage.getBoundingClientRect();
    const ratio = (r.width || 900) / (r.height || 480);
    const pts = [];
    [-386, 386].forEach(x => [-168, 168].forEach(z => [-24, 140].forEach(y => pts.push(project(x, z, y)))));
    geometry.forEach(g => pts.push(g.mid));
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    let box = { x: Math.min(...xs) - 30, y: Math.min(...ys) - 60, w: Math.max(...xs) - Math.min(...xs) + 60, h: Math.max(...ys) - Math.min(...ys) + 96 };
    if (box.w / box.h > ratio) { const h = box.w / ratio; box.y -= (h - box.h) / 2; box.h = h; } else { const w = box.h * ratio; box.x -= (w - box.w) / 2; box.w = w; }
    vb = box;
    svg.setAttribute('viewBox', `${box.x} ${box.y} ${box.w} ${box.h}`);
    place();
  }
  const pct = ([x, y]) => [(x - vb.x) / vb.w * 100, (y - vb.y) / vb.h * 100];

  // overlay: numbered markers and arc labels
  const markers = MARKS.map(m => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `echo-mark is-${m.type}`;
    b.dataset.n = m.n;
    b.innerHTML = m.type === 'question' ? `<span>${m.n}</span>` : `${evidenceGlyph('published')}<span>${m.n}</span>`;
    b.setAttribute('aria-label', `${m.n}. ${m.text}`);
    overlay.append(b);
    return b;
  });
  const flowLabels = geometry.map(g => {
    const s = document.createElement('span');
    s.className = `echo-flow-label flow-${g.f.cls}`;
    s.innerHTML = `<b>${g.f.label}</b><small>${esc(g.f.who)}</small>`;
    overlay.append(s);
    return s;
  });
  function place() {
    MARKS.forEach((m, i) => { const [l, t] = pct(project(...m.at)); markers[i].style.left = `${l}%`; markers[i].style.top = `${t}%`; });
    geometry.forEach((g, i) => { const [l, t] = pct(g.mid); flowLabels[i].style.left = `${l}%`; flowLabels[i].style.top = `${t}%`; });
  }

  list.innerHTML = MARKS.map(m => `<li class="echo-item is-${m.type}" data-n="${m.n}">
    <span class="echo-num">${m.type === 'question' ? m.n : evidenceGlyph('published')}</span>
    <div>${m.lens ? `<span class="echo-lens">${m.lens === '+' ? 'Johor residents' : m.lens === 'A' ? 'A · Businesses' : 'C · Lives across the border'}</span>` : '<span class="echo-lens">The link</span>'}<p>${esc(m.text)}</p>${m.note ? `<small>${esc(m.note)}${m.href ? ` <a href="${m.href}" target="_blank" rel="noopener">Source ↗</a>` : ''}</small>` : m.href ? `<small><a href="${m.href}" target="_blank" rel="noopener">Source ↗</a></small>` : ''}</div>
  </li>`).join('');

  // pairing: a marker and its question light up together
  const items = [...list.children];
  function light(n) {
    markers.forEach(b => b.classList.toggle('is-on', b.dataset.n === String(n)));
    items.forEach(li => li.classList.toggle('is-on', li.dataset.n === String(n)));
  }
  host.addEventListener('pointerover', e => { const t = e.target.closest('[data-n]'); light(t ? t.dataset.n : null); });
  host.addEventListener('pointerleave', () => light(null));
  host.addEventListener('focusin', e => { const t = e.target.closest('[data-n]'); if (t) light(t.dataset.n); });
  overlay.addEventListener('click', e => {
    const b = e.target.closest('.echo-mark');
    if (!b) return;
    light(b.dataset.n);
    list.querySelector(`[data-n="${b.dataset.n}"]`)?.scrollIntoView({ block: 'nearest', behavior: motionAllowed() ? 'smooth' : 'instant' });
  });

  // arrival: outlines and arcs draw in once, when seen
  const figure = host.firstElementChild;
  const seen = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) { figure.classList.add('is-seen'); seen.disconnect(); }
  }, { threshold: .35 }) : null;
  if (seen && motionAllowed()) seen.observe(stage); else figure.classList.add('is-seen');

  const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null;
  resize?.observe(stage);
  fit();
}
