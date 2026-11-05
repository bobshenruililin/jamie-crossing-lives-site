/* The fieldwork miniature.
   A projected-SVG model of two sides of a boundary. Every building stands for
   a place that appears in the research — an account, an observation or a
   published figure — and opens the evidence behind it. Positions are authored
   for explanation: this is not a map, and no route, distance or frequency is
   measured. Pins and labels are HTML so they stay legible at any size. */
import { places, placeById, scenes, byId, photos, ARRANGEMENTS, FACETS, EVIDENCE, tour } from './cast.js';
import { evidenceGlyph, facetGlyph, make, esc, asset, motionAllowed } from './grammar.js';
import { openPhoto } from './photo-viewer.js';

const NS = 'http://www.w3.org/2000/svg';
const TILT = .54;
const YAW = -.62, YAW_MIN = -.95, YAW_MAX = -.32;

/* Footprints in model units. HK plinth x −380…−100, Shenzhen x 100…380. */
const GEOMETRY = {
  'hk-work':      { x: -368, z: -150, w: 44, d: 42, h: 128 },
  'hk-rental':    { x: -308, z: -146, w: 56, d: 38, h: 84 },
  'hk-fanling':   { x: -238, z: -152, w: 74, d: 34, h: 104 },
  'hk-family':    { x: -368, z: -58,  w: 58, d: 50, h: 32 },
  'hk-shops':     { x: -290, z: -62,  w: 98, d: 76, h: 30 },
  'hk-licence':   { x: -172, z: -40,  w: 44, d: 40, h: 26 },
  'hk-school':    { x: -368, z: 88,   w: 78, d: 46, h: 32 },
  'hk-pitch':     { x: -268, z: 92,   w: 150, d: 64, h: 4 },
  'crossing':     { x: -36,  z: 38,   w: 72, d: 44, h: 30 },
  'sz-repair':    { x: 116,  z: -150, w: 58, d: 44, h: 56 },
  'sz-dining':    { x: 190,  z: -146, w: 64, d: 40, h: 30 },
  'sz-tower':     { x: 304,  z: -156, w: 46, d: 46, h: 146 },
  'sz-leisure':   { x: 116,  z: -62,  w: 86, d: 66, h: 40 },
  'sz-home':      { x: 222,  z: -58,  w: 58, d: 50, h: 32 },
  'sz-street':    { x: 300,  z: -48,  w: 68, d: 62, h: 30 },
  'sz-clinic':    { x: 116,  z: 88,   w: 62, d: 48, h: 56 },
  'sz-tuition':   { x: 196,  z: 92,   w: 42, d: 40, h: 40 },
  'sz-community': { x: 254,  z: 90,   w: 50, d: 42, h: 24 },
  'sz-park':      { x: 318,  z: 86,   w: 54, d: 72, h: 4 }
};
/* Edges and loose points: 'mainland' lies beyond the Shenzhen plinth, because the
   pupil data cover Mainland residence, not Shenzhen; 'hk-side' is an unplaced
   point on the Hong Kong side for activities the account does not locate. */
const EDGES = { 'hk-edge': [-150, 59, 6], 'sz-edge': [150, 59, 6], mainland: [478, 30, 6], 'hk-side': [-206, 59, 4] };
const BEYOND = { x0: 404, x1: 556, z0: -150, z1: 150 };
/* Parts of a life an account does not place hover over the boundary gap. */
const GHOSTS = { home: [0, 2, 52], work: [0, -58, 52], ties: [0, -118, 52], spend: [0, -178, 52] };
const TREES = [[-200, -112, 20], [-118, -150, 18], [-112, -78, 16], [-196, 18, 17], [-120, 22, 15], [-112, 150, 18], [-372, 20, 16],
  [182, 8, 17], [290, 12, 15], [372, 18, 18], [178, -104, 16], [274, -118, 14], [370, -90, 16]];

const MATERIAL = {
  hk:   { top: '#f3ead8', side: '#b59c7d', front: '#d8c5a6', win: '#46706a' },
  sz:   { top: '#dce5db', side: '#7b9b91', front: '#b0c5b9', win: '#3e6a63' },
  lit:  { top: '#fde6b4', side: '#bf8742', front: '#ecbc6b', win: '#fff4d2' },
  dimhk:{ top: '#f0ebdf', side: '#d4c9b8', front: '#e4dbcc', win: '#c3cbc4' },
  dimsz:{ top: '#e7ebe4', side: '#bfcdc5', front: '#d5ded7', win: '#bccac3' }
};
const ROOF = { normal: ['#58786f', '#2e514b'], lit: ['#e29a46', '#a9692a'], dim: ['#c6d0ca', '#b1bdb7'] };

let uidCounter = 0;

export function initMiniature(host, { renderer = 'auto' } = {}) {
  const uid = `mini-${++uidCounter}`;
  host.classList.add('mini');
  host.innerHTML = `
    <div class="mini-stage" data-mini="stage">
      <p class="mini-now" data-mini="now" aria-hidden="true"></p>
      <svg class="mini-scene" data-mini="svg" role="img" aria-labelledby="${uid}-title ${uid}-desc" tabindex="0" aria-keyshortcuts="ArrowLeft ArrowRight Home">
        <title id="${uid}-title">A miniature of the fieldwork</title>
        <desc id="${uid}-desc">Hong Kong on the left and Shenzhen on the right, joined by one crossing. Each building stands for a place that appears in the research. Use the left and right arrow keys to turn the model.</desc>
        <g data-mini="world"></g><g data-mini="arcs"></g>
      </svg>
      <canvas class="mini-canvas" data-mini="canvas" hidden tabindex="0" role="img" aria-label="A miniature of the fieldwork, rendered live: Hong Kong on the left and Shenzhen on the right, joined by one crossing. Each building stands for a place in the research. Arrow keys turn it; plus and minus zoom."></canvas>
      <div class="mini-overlay" data-mini="overlay"></div>
      <div class="mini-sides" aria-hidden="true"><span class="side-hk">Hong Kong</span><span class="side-bd">The boundary</span><span class="side-sz">Shenzhen</span></div>
      <section class="mini-card" data-mini="card" hidden aria-live="polite"></section>
    </div>
    <p class="mini-status visually-hidden" data-mini="status" role="status" aria-atomic="true"></p>`;

  const $ = key => host.querySelector(`[data-mini="${key}"]`);
  const svg = $('svg'), world = $('world'), arcLayer = $('arcs'), overlay = $('overlay'), stage = $('stage');
  const card = $('card'), now = $('now'), status = $('status'), canvas = $('canvas');
  let gpu = null;
  let yaw = YAW, sceneId = 'overview', openId = null, destroyed = false;
  let vb = null, vbTarget = null, vbFrom = null, vbStart = 0, vbFrame = 0;
  let tokens = [], tokenStart = 0, tokenFrame = 0;
  const cleanups = [];
  const on = (target, type, fn, opts) => { target.addEventListener(type, fn, opts); cleanups.push(() => target.removeEventListener(type, fn, opts)); };

  const project = (x, z, y = 0) => { const a = Math.cos(yaw), b = Math.sin(yaw); return [x * a - z * b, (x * b + z * a) * TILT - y]; };
  const P = (x, z, y) => project(x, z, y).map(v => v.toFixed(1)).join(',');
  const el = (tag, attrs, parent) => { const node = document.createElementNS(NS, tag); for (const k in attrs) node.setAttribute(k, attrs[k]); parent?.append(node); return node; };
  const poly = (pts, fill, parent, extra = {}) => el('polygon', { points: pts.map(p => P(...p)).join(' '), fill, ...extra }, parent);
  const line = (pts, stroke, width, parent, extra = {}) => el('polyline', { points: pts.map(p => P(...p)).join(' '), fill: 'none', stroke, 'stroke-width': width, 'stroke-linecap': 'round', ...extra }, parent);
  function box(x, z, w, d, h, m, parent, y = 0) {
    poly([[x, z, y], [x, z + d, y], [x, z + d, y + h], [x, z, y + h]], m.side, parent);
    poly([[x, z + d, y], [x + w, z + d, y], [x + w, z + d, y + h], [x, z + d, y + h]], m.front, parent);
    poly([[x, z, y + h], [x + w, z, y + h], [x + w, z + d, y + h], [x, z + d, y + h]], m.top, parent);
  }
  function windows(x, z, w, d, h, m, parent, { rowGap = 20, colGap = 16, start = 10, skipBottom = 0 } = {}) {
    const rows = Math.max(1, Math.floor((h - start - 6) / rowGap));
    for (let r = skipBottom; r < rows; r++) {
      const wy = start + r * rowGap;
      for (let c = 0; c < Math.max(1, Math.floor((w - 8) / colGap)); c++) {
        const wx = x + 7 + c * colGap;
        poly([[wx, z + d + .2, wy], [wx + 7, z + d + .2, wy], [wx + 7, z + d + .2, wy + 9], [wx, z + d + .2, wy + 9]], m.win, parent);
      }
      for (let c = 0; c < Math.max(1, Math.floor((d - 8) / 17)); c++) {
        const wz = z + 7 + c * 17;
        poly([[x - .2, wz, wy], [x - .2, wz + 7, wy], [x - .2, wz + 7, wy + 9], [x - .2, wz, wy + 9]], m.win, parent);
      }
    }
  }
  function tree(x, z, size, parent, dim) {
    const [sx, sy] = project(x, z, 0);
    el('ellipse', { cx: sx + 5, cy: sy + 2, rx: size * .7, ry: size * .22, fill: '#173e4014' }, parent);
    line([[x, z, 0], [x, z, size * 1.2]], dim ? '#a9b4a6' : '#6c7f68', 2, parent);
    const [cx, cy] = project(x, z, size * 1.3), r = size * .62;
    el('path', { d: `M${cx - r} ${cy}Q${cx - r * 1.1} ${cy - r * .8} ${cx} ${cy - r * 1.2}Q${cx + r * 1.05} ${cy - r * .7} ${cx + r} ${cy}Q${cx + r * .8} ${cy + r * .7} ${cx} ${cy + r * .7}Q${cx - r} ${cy + r * .6} ${cx - r} ${cy}Z`, fill: dim ? '#c4cfc2' : '#6e8f76' }, parent);
    el('path', { d: `M${cx} ${cy - r * 1.2}Q${cx + r * 1.05} ${cy - r * .7} ${cx + r} ${cy}Q${cx + r * .8} ${cy + r * .7} ${cx} ${cy + r * .7}Q${cx + r * .3} ${cy - r * .1} ${cx} ${cy - r * 1.2}Z`, fill: dim ? '#b2c0b3' : '#456e60' }, parent);
  }
  function roofPitched(x, z, w, d, h, tone, parent, m) {
    const ridge = h + 26;
    poly([[x - 4, z - 4, h], [x + w / 2, z - 4, ridge], [x + w / 2, z + d + 4, ridge], [x - 4, z + d + 4, h]], tone[0], parent);
    poly([[x + w / 2, z - 4, ridge], [x + w + 4, z - 4, h], [x + w + 4, z + d + 4, h], [x + w / 2, z + d + 4, ridge]], tone[1], parent);
    poly([[x, z + d, h], [x + w, z + d, h], [x + w / 2, z + d, ridge - 2]], m.front, parent);
  }

  /* One drawing function per kind of place. */
  function drawPlace(place, state, parent) {
    const g = GEOMETRY[place.id];
    const { x, z, w, d, h } = g;
    const m = state === 'lit' ? MATERIAL.lit : state === 'dim' ? MATERIAL[`dim${place.side === 'sz' ? 'sz' : 'hk'}`] : MATERIAL[place.side === 'sz' ? 'sz' : 'hk'];
    const roof = ROOF[state] || ROOF.normal;
    const grp = el('g', { class: `mini-place is-${state}`, 'data-place': place.id }, parent);
    poly([[x + 6, z + 8, 0], [x + w + 18, z + 8, 0], [x + w + 18, z + d + 22, 0], [x + 6, z + d + 22, 0]], '#173e4012', grp);
    const accent = state === 'dim' ? '#c7cfca' : null;
    switch (place.kind) {
      case 'tower':
        box(x, z, w, d, h, m, grp); windows(x, z, w, d, h, m, grp);
        box(x + w * .22, z + d * .22, w * .5, d * .5, 8, m, grp, h);
        line([[x + w * .7, z + d * .5, h], [x + w * .7, z + d * .5, h + 22]], state === 'dim' ? '#c5cec9' : '#315b55', 1.2, grp);
        break;
      case 'slab':
        box(x, z, w, d, h, m, grp); windows(x, z, w, d, h, m, grp, { colGap: 13 });
        for (let y = 18; y < h; y += 20) line([[x, z + d + .4, y], [x + w, z + d + .4, y]], m.side, 1, grp);
        break;
      case 'estate':
        box(x, z, 32, d, h, m, grp); windows(x, z, 32, d, h, m, grp, { colGap: 12 });
        box(x + 42, z + 10, 32, d - 6, h * .72, m, grp); windows(x + 42, z + 10, 32, d - 6, h * .72, m, grp, { colGap: 12 });
        break;
      case 'house':
        box(x, z, w, d, h, m, grp); roofPitched(x, z, w, d, h, roof, grp, m);
        poly([[x + w * .42, z + d + .2, 0], [x + w * .6, z + d + .2, 0], [x + w * .6, z + d + .2, 22], [x + w * .42, z + d + .2, 22]], state === 'lit' ? '#8a4f22' : '#21484a', grp);
        windows(x, z, w, d, h, m, grp, { colGap: 30, start: 12 });
        break;
      case 'mall':
        box(x, z, w, d, h, m, grp);
        box(x - 2, z + d, w + 4, 10, 3, { top: accent || (state === 'lit' ? '#d9773a' : '#c7653e'), side: m.side, front: accent || '#a9502f' }, grp, h * .52);
        for (let i = 0; i < Math.floor(w / 22); i++) poly([[x + 6 + i * 22, z + d + .3, 4], [x + 22 + i * 22, z + d + .3, 4], [x + 22 + i * 22, z + d + .3, h * .48], [x + 6 + i * 22, z + d + .3, h * .48]], m.win, grp);
        line([[x + 6, z + d + .3, h * .78], [x + w - 6, z + d + .3, h * .78]], accent || '#e9e3cf', 3, grp);
        break;
      case 'shop':
        box(x, z, w, d, h, m, grp);
        box(x + w - 12, z + d - 2, 8, 3, 32, { top: accent || '#d23c2f', side: accent || '#9d2c22', front: accent || '#c9352a' }, grp, 6);
        box(x + 4, z + d - 1, 10, 2, 24, { top: accent || '#3f8f4f', side: accent || '#2e6a3a', front: accent || '#3f8f4f' }, grp, 4);
        poly([[x + 16, z + d + .3, 3], [x + w - 16, z + d + .3, 3], [x + w - 16, z + d + .3, 18], [x + 16, z + d + .3, 18]], m.win, grp);
        break;
      case 'school':
        poly([[x + w + 4, z, .5], [x + w + 40, z, .5], [x + w + 40, z + d, .5], [x + w + 4, z + d, .5]], state === 'dim' ? '#e6e8dc' : '#cbd6bf', grp);
        box(x, z, w, d, h, m, grp); windows(x, z, w, d, h, m, grp, { colGap: 14 });
        line([[x + w + 30, z + 8, 0], [x + w + 30, z + 8, 52]], state === 'dim' ? '#c6ceca' : '#2e514b', 1.4, grp);
        poly([[x + w + 30, z + 8, 52], [x + w + 46, z + 8, 47], [x + w + 30, z + 8, 42]], accent || (state === 'lit' ? '#d9773a' : '#c9512d'), grp);
        break;
      case 'pitch': {
        const field = state === 'dim' ? '#dfe5d6' : state === 'lit' ? '#cde09e' : '#a9c48c';
        poly([[x, z, .6], [x + 84, z, .6], [x + 84, z + d, .6], [x, z + d, .6]], field, grp);
        const ink = state === 'dim' ? '#eef0e6' : '#f6f4e8';
        line([[x + 4, z + 4, .8], [x + 80, z + 4, .8], [x + 80, z + d - 4, .8], [x + 4, z + d - 4, .8], [x + 4, z + 4, .8]], ink, 1, grp);
        line([[x + 42, z + 4, .8], [x + 42, z + d - 4, .8]], ink, 1, grp);
        poly([[x + 92, z + 8, .6], [x + w, z + 8, .6], [x + w, z + d, .6], [x + 92, z + d, .6]], state === 'dim' ? '#eee6d4' : '#ead9b0', grp);
        poly([[x + 110, z + 8, .7], [x + w, z + 8, .7], [x + w, z + d, .7], [x + 126, z + d, .7]], state === 'dim' ? '#d6e3e1' : '#9cc4c0', grp);
        break;
      }
      case 'gate':
        [[x + 4, z + 4], [x + w - 4, z + 4], [x + 4, z + d - 4], [x + w - 4, z + d - 4]].forEach(([px, pz]) => line([[px, pz, 8], [px, pz, h]], state === 'dim' ? '#c5ccc8' : '#2e514b', 1.6, grp));
        box(x + w * .36, z + d * .3, w * .28, d * .4, 16, m, grp, 8);
        box(x - 6, z - 2, w + 12, d + 4, 4, { top: state === 'lit' ? '#fde6b4' : '#e6dfcc', side: m.side, front: state === 'lit' ? '#ecbc6b' : '#c9bfa7' }, grp, h);
        break;
      case 'market':
        box(x, z, w, d, h, m, grp);
        ['#c9512d', '#2b6f8f', '#d9a43b', '#3d8b5d'].forEach((c, i) => poly([[x + 5 + i * 13, z + d + .3, h - 16], [x + 15 + i * 13, z + d + .3, h - 16], [x + 15 + i * 13, z + d + .3, h - 6], [x + 5 + i * 13, z + d + .3, h - 6]], accent || c, grp));
        windows(x, z, w, d, h - 18, m, grp, { colGap: 13 });
        break;
      case 'restaurant':
        box(x, z, w, d, h, m, grp);
        for (let i = 0; i < 6; i++) poly([[x + i * w / 6, z + d, h * .66], [x + (i + 1) * w / 6, z + d, h * .66], [x + (i + 1) * w / 6, z + d + 10, h * .48], [x + i * w / 6, z + d + 10, h * .48]], accent || (i % 2 ? '#f4ecda' : state === 'lit' ? '#d9773a' : '#c9512d'), grp);
        poly([[x + 6, z + d + .3, 3], [x + w - 6, z + d + .3, 3], [x + w - 6, z + d + .3, h * .44], [x + 6, z + d + .3, h * .44]], m.win, grp);
        if (state !== 'dim') { const [sx, sy] = project(x + w * .7, z + d * .5, h + 6); el('path', { d: `M${sx} ${sy}c-5-7 5-11 0-18M${sx + 9} ${sy + 3}c-5-7 5-11 0-18`, fill: 'none', stroke: '#a8b4ad', 'stroke-width': 1.2, 'stroke-linecap': 'round' }, grp); }
        break;
      case 'street':
        [0, 1, 2].forEach(i => {
          const sx = x + i * (w / 3), sw = w / 3 - 2;
          box(sx, z, sw, d, h - i * 3, m, grp);
          poly([[sx + 2, z + d + .3, h - i * 3 - 10], [sx + sw - 2, z + d + .3, h - i * 3 - 10], [sx + sw - 2, z + d + .3, h - i * 3 - 3], [sx + 2, z + d + .3, h - i * 3 - 3]], accent || ['#c9352a', '#2b5fa6', '#1d7fbf'][i], grp);
          poly([[sx + 4, z + d + .3, 2], [sx + sw - 4, z + d + .3, 2], [sx + sw - 4, z + d + .3, 14], [sx + 4, z + d + .3, 14]], m.win, grp);
        });
        break;
      case 'clinic':
        box(x, z, w, d, h, { ...m, top: state === 'dim' ? m.top : state === 'lit' ? m.top : '#f5f4ec', front: state === 'normal' ? '#e3e4da' : m.front }, grp);
        windows(x, z, w, d, h, m, grp, { colGap: 14, skipBottom: 1 });
        { const cx = x + w / 2; const c = accent || '#008c7a';
          poly([[cx - 3, z + d + .4, h - 22], [cx + 3, z + d + .4, h - 22], [cx + 3, z + d + .4, h - 6], [cx - 3, z + d + .4, h - 6]], c, grp);
          poly([[cx - 8, z + d + .4, h - 17], [cx + 8, z + d + .4, h - 17], [cx + 8, z + d + .4, h - 11], [cx - 8, z + d + .4, h - 11]], c, grp); }
        break;
      case 'tuition':
        box(x, z, w, d, h, m, grp); windows(x, z, w, d, h, m, grp, { colGap: 14 });
        poly([[x + 8, z + d + .4, h + 2], [x + w / 2, z + d + .4, h + 6], [x + w - 8, z + d + .4, h + 2], [x + w - 8, z + d + .4, h + 14], [x + w / 2, z + d + .4, h + 18], [x + 8, z + d + .4, h + 14]], accent || '#2b6f8f', grp);
        break;
      case 'community':
        poly([[x - 4, z + d + 2, .5], [x + w + 4, z + d + 2, .5], [x + w + 4, z + d + 16, .5], [x - 4, z + d + 16, .5]], state === 'dim' ? '#e1e7dc' : '#a9c48c', grp);
        box(x, z, w, d, h, m, grp); windows(x, z, w, d, h, m, grp, { colGap: 15 });
        line([[x + w + 8, z + d + 8, 0], [x + w + 8, z + d + 8, 30]], state === 'dim' ? '#c6ceca' : '#6b4f46', 1.4, grp);
        poly([[x + w + 8, z + d + 8, 30], [x + w + 8, z + d + 8, 18], [x + w + 8, z + d - 8, 18], [x + w + 8, z + d - 8, 30]], accent || '#b32f4c', grp);
        break;
      case 'park': {
        const water = state === 'dim' ? '#dbe6e4' : state === 'lit' ? '#b9dcd5' : '#9cc4c0';
        poly([[x + 4, z + 10, .6], [x + w - 6, z + 4, .6], [x + w, z + d * .55, .6], [x + w * .5, z + d * .7, .6], [x + 6, z + d * .5, .6]], water, grp);
        line([[x, z + d - 6, .8], [x + w, z + d - 14, .8]], state === 'dim' ? '#efece2' : '#f3ecd8', 4, grp);
        [[x + 12, z + d - 4, 16], [x + w - 10, z + d - 2, 18], [x + w * .5, z + d + 2, 14]].forEach(([tx, tz, s]) => tree(tx, tz, s, grp, state === 'dim'));
        break;
      }
    }
    return grp;
  }

  function usesMainland() { const sc = currentScene(); return sc.arcs.some(a => a.from === 'mainland' || a.to === 'mainland') || sc.pins.some(p => p.at === 'mainland'); }
  function placeState(id) {
    const scene = currentScene();
    if (!scene.lit.length) return 'normal';
    return scene.lit.includes(id) ? 'lit' : 'dim';
  }
  function currentScene() {
    if (sceneId === 'together') {
      const lit = new Set(), pins = [], arcs = [];
      tour.forEach(id => { scenes[id].lit.forEach(p => lit.add(p)); scenes[id].arcs.forEach(a => arcs.push({ ...a, text: '', thin: true })); });
      return { lit: [...lit], pins, arcs };
    }
    return scenes[sceneId] || scenes.overview;
  }
  function anchorOf(id) {
    if (id.startsWith('ghost:')) return GHOSTS[id.slice(6)];
    if (EDGES[id]) return EDGES[id];
    const g = GEOMETRY[id];
    const lift = { pitch: 10, park: 12, house: 30, gate: 8, tuition: 18, shop: 12 }[placeById[id].kind] || 6;
    return [g.x + Math.min(g.w, 84) / 2, g.z + g.d / 2, g.h + lift];
  }

  function drawWorld() {
    const frag = document.createDocumentFragment();
    const scene = currentScene();
    const dimmed = scene.lit.length > 0;
    const [scx, scy] = project(0, 20, -30);
    el('ellipse', { cx: scx, cy: scy + 54, rx: 470, ry: 92, fill: '#315c4a', opacity: '.10' }, frag);
    [['hk', -386], ['sz', 100]].forEach(([side, x0]) => {
      box(x0, -168, 286, 336, 22, { top: '#d6d4bf', side: '#7a9188', front: '#a6b3a1' }, frag, -24);
      poly([[x0 + 7, -161, 0], [x0 + 279, -161, 0], [x0 + 279, 161, 0], [x0 + 7, 161, 0]], side === 'hk' ? '#e7decb' : '#d8e2d5', frag);
      line([[x0, -168 + 336, -1.5], [x0 + 286, -168 + 336, -1.5]], side === 'hk' ? '#c9512d' : '#008c7a', 2.4, frag, { opacity: dimmed ? .55 : .85 });
      poly([[x0 + 7, 44, .3], [x0 + 279, 44, .3], [x0 + 279, 74, .3], [x0 + 7, 74, .3]], '#efeadb', frag);
      for (let xx = x0 + 16; xx < x0 + 276; xx += 22) line([[xx, 59, .5], [xx + 10, 59, .5]], '#c9c3ad', .8, frag);
    });
    if (usesMainland()) {
      const { x0, x1, z0, z1 } = BEYOND;
      poly([[x0, z0, -2], [x1, z0, -2], [x1, z1, -2], [x0, z1, -2]], '#008c7a12', frag, { stroke: '#008c7a', 'stroke-width': 1.4, 'stroke-dasharray': '6 6' });
      for (let zz = z0 + 30; zz < z1; zz += 60) line([[x0 + 24, zz, -1.5], [x1 - 24, zz + 18, -1.5]], '#008c7a33', 1, frag, { 'stroke-dasharray': '2 5' });
    }
    box(-100, 42, 200, 34, 8, { top: '#e8d8b9', side: '#8c9b88', front: '#b0bca4' }, frag, -1);
    for (let xx = -90; xx < 100; xx += 14) line([[xx, 44, 8], [xx, 74, 8]], '#ac9a7b', .7, frag);
    [43, 75].forEach(zz => { line([[-100, zz, 18], [100, zz, 18]], '#426d65', 1.6, frag); for (let xx = -96; xx <= 100; xx += 24) line([[xx, zz, 7], [xx, zz, 18]], '#426d65', 1.1, frag); });
    for (let zz = -178; zz < 186; zz += 16) { if (zz > 32 && zz < 84) continue; line([[0, zz, -6], [0, zz + 7, -6]], '#517d74', 1.4, frag, { 'stroke-opacity': '.6' }); }
    const depth = (x, z) => x * Math.sin(yaw) + z * Math.cos(yaw);
    const items = [
      ...places.map(place => { const g = GEOMETRY[place.id]; return { depth: depth(g.x + g.w / 2, g.z + g.d / 2), draw: () => drawPlace(place, placeState(place.id), frag) }; }),
      ...TREES.map(([x, z, s]) => ({ depth: depth(x, z), draw: () => tree(x, z, s, frag, dimmed) }))
    ];
    items.sort((a, b) => a.depth - b.depth).forEach(item => item.draw());
    world.replaceChildren(frag);
  }

  function arcGeometry(a, b, thin, style) {
    const pa = project(...anchorOf(a)), pb = project(...anchorOf(b));
    const dist = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]);
    const lift = ((thin ? 40 : 60) + dist * .22) * (style === 'move' ? .45 : 1);
    const c1 = [pa[0] + (pb[0] - pa[0]) * .3, Math.min(pa[1], pb[1]) - lift];
    const c2 = [pa[0] + (pb[0] - pa[0]) * .7, Math.min(pa[1], pb[1]) - lift];
    return { pa, pb, c1, c2, d: `M${pa}C${c1} ${c2} ${pb}` };
  }
  const bez = (g, t) => { const u = 1 - t; return [0, 1].map(i => u * u * u * g.pa[i] + 3 * u * u * t * g.c1[i] + 3 * u * t * t * g.c2[i] + t * t * t * g.pb[i]); };

  function drawArcs() {
    const frag = document.createDocumentFragment();
    tokens = [];
    const scene = currentScene();
    scene.arcs.forEach((arc, i) => {
      const g = arcGeometry(arc.from, arc.to, arc.thin, arc.style);
      const grp = el('g', { class: `mini-arc arc-${arc.style}${arc.thin ? ' is-thin' : ''}` }, frag);
      el('path', { d: g.d, class: 'arc-halo' }, grp);
      el('path', { d: g.d, class: 'arc-line', ...(arc.style === 'move' ? { 'marker-end': `url(#${uid}-arrow)` } : {}) }, grp);
      el('circle', { cx: g.pa[0], cy: g.pa[1], r: arc.thin ? 2.5 : 3.6, class: 'arc-end' }, grp);
      el('circle', { cx: g.pb[0], cy: g.pb[1], r: arc.thin ? 2.5 : 3.6, class: 'arc-end' }, grp);
      const token = el('circle', { r: 5, class: 'arc-token', visibility: 'hidden' }, grp);
      tokens.push({ token, g, delay: i * 120 });
      g.mid = bez(g, .5);
      arc._g = g;
    });
    const defs = el('defs', {}, frag);
    const marker = el('marker', { id: `${uid}-arrow`, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M0 1 9 5 0 9Z', fill: '#173e40' }, marker);
    arcLayer.replaceChildren(frag);
  }

  /* Camera: fit everything on wide stages; on narrow stages approach the
     places that matter to the current scene so labels remain readable. */
  function bounds(points) {
    const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
    return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  }
  function targetView() {
    const rect = stage.getBoundingClientRect();
    const W = rect.width || 900, H = rect.height || 520;
    const ratio = W / H;
    const corners = [];
    [-386, usesMainland() ? BEYOND.x1 + 10 : 386].forEach(x => [-168, 168].forEach(z => [-24, 150].forEach(y => corners.push(project(x, z, y)))));
    const whole = bounds(corners);
    const padTop = 44, padBottom = 34;
    let box = { x: whole.x - 34, y: whole.y - padTop, w: whole.w + 68, h: whole.h + padTop + padBottom };
    const scene = currentScene();
    const focusIds = [...scene.lit, ...scene.pins.map(p => p.at)].filter((v, i, a) => a.indexOf(v) === i);
    if (focusIds.length && sceneId !== 'together') {
      const pts = [];
      (scene.unplaced || []).forEach(f => pts.push(project(...GHOSTS[f])));
      if (usesMainland()) [BEYOND.x0, BEYOND.x1].forEach(x => [BEYOND.z0, BEYOND.z1].forEach(z => pts.push(project(x, z, 0), project(x, z, 40))));
      focusIds.forEach(id => { const g = GEOMETRY[id] || { x: EDGES[id][0] - 10, z: EDGES[id][1] - 10, w: 20, d: 20, h: 10 }; [g.x, g.x + g.w].forEach(x => [g.z, g.z + g.d].forEach(z => { pts.push(project(x, z, 0)); pts.push(project(x, z, g.h + 64)); })); });
      scene.arcs.forEach(arc => { const g = arcGeometry(arc.from, arc.to, false, arc.style); pts.push(g.pa, g.pb, g.c1, g.c2); });
      const f = bounds(pts);
      const minW = whole.w * (ratio < 1.2 ? .66 : .84);
      const fw = Math.min(box.w, Math.max(f.w + 120, minW));
      const cx = Math.max(box.x + fw / 2, Math.min(box.x + box.w - fw / 2, f.x + f.w / 2));
      box = { x: cx - fw / 2, y: f.y - 46, w: fw, h: f.h + 96 };
    }
    // Match the stage aspect ratio exactly so HTML overlays map 1:1.
    if (box.w / box.h > ratio) { const h = box.w / ratio; box.y -= (h - box.h) / 2; box.h = h; }
    else { const w = box.h * ratio; box.x -= (w - box.w) / 2; box.w = w; }
    return box;
  }
  function applyView(v) {
    vb = v;
    svg.setAttribute('viewBox', `${v.x.toFixed(1)} ${v.y.toFixed(1)} ${v.w.toFixed(1)} ${v.h.toFixed(1)}`);
    placeOverlays();
  }
  function moveCamera(animate) {
    vbTarget = targetView();
    cancelAnimationFrame(vbFrame);
    if (!animate || !vb || !motionAllowed()) { applyView(vbTarget); return; }
    vbFrom = { ...vb }; vbStart = performance.now();
    const step = now => {
      const t = Math.min(1, (now - vbStart) / 700), e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      applyView({ x: vbFrom.x + (vbTarget.x - vbFrom.x) * e, y: vbFrom.y + (vbTarget.y - vbFrom.y) * e, w: vbFrom.w + (vbTarget.w - vbFrom.w) * e, h: vbFrom.h + (vbTarget.h - vbFrom.h) * e });
      if (t < 1 && !destroyed) vbFrame = requestAnimationFrame(step);
    };
    vbFrame = requestAnimationFrame(step);
  }

  /* HTML overlay: one button per place, plus pins, arc labels and edges. */
  const buttons = new Map();
  places.forEach(place => {
    const button = make('button', `mini-mark side-${place.side}`);
    button.type = 'button';
    button.dataset.place = place.id;
    const type = place.photo ? 'photo' : place.published ? 'published' : place.who ? 'account' : place.observed ? 'observed' : 'account';
    button.innerHTML = `<span class="mark-dot">${evidenceGlyph(type)}</span><span class="mark-label"></span>`;
    button.setAttribute('aria-label', `${place.label}, ${place.side === 'hk' ? 'Hong Kong side' : place.side === 'sz' ? 'Shenzhen side' : 'at the crossing'}. Show the evidence.`);
    overlay.append(button);
    buttons.set(place.id, button);
  });
  const extras = make('div', 'mini-extras');
  overlay.append(extras);

  function toPct([x, y]) { return [(x - vb.x) / vb.w * 100, (y - vb.y) / vb.h * 100]; }
  /* Overlay positions for a model point [x, z, height], whichever renderer draws. */
  const pctAt = (x, z, y) => gpu ? gpu.toPct([x, z, y]) : toPct(project(x, z, y));
  /* A crossing in world space: [x, height, z] control points for the GPU ribbons. */
  function arc3d(arc) {
    const [ax, az, ay] = anchorOf(arc.from), [bx, bz, by] = anchorOf(arc.to);
    const A = [ax, ay, az], B = [bx, by, bz];
    const dist = Math.hypot(bx - ax, bz - az);
    const lift = ((arc.thin ? 40 : 60) + dist * .26) * (arc.style === 'move' ? .45 : 1);
    const lerp = t => [A[0] + (B[0] - A[0]) * t, Math.max(A[1], B[1]) + lift, A[2] + (B[2] - A[2]) * t];
    const p1 = lerp(.3), p2 = lerp(.7);
    const mid = [0, 1, 2].map(k => .125 * A[k] + .375 * p1[k] + .375 * p2[k] + .125 * B[k]);
    return { p0: A, p1, p2, p3: B, style: arc.style, thin: Boolean(arc.thin), mid };
  }
  function placeOverlays() {
    if (!vb && !gpu) return;
    const scene = currentScene();
    const stageWidth = stage.clientWidth || 800;
    const pinFor = Object.fromEntries(scene.pins.filter(p => placeById[p.at]).map(p => [p.at, p]));
    buttons.forEach((button, id) => {
      const [l, t] = pctAt(...anchorOf(id));
      button.style.left = `${l}%`; button.style.top = `${t}%`;
      const state = placeState(id), pin = pinFor[id];
      button.classList.toggle('is-lit', state === 'lit');
      button.classList.toggle('is-dim', state === 'dim');
      button.classList.toggle('has-pin', Boolean(pin));
      button.classList.toggle('is-open', openId === id);
      button.setAttribute('aria-expanded', String(openId === id));
      const label = button.querySelector('.mark-label');
      label.innerHTML = pin ? `${facetGlyph(pin.facet)}<span>${esc(pin.text)}</span>` : '';
    });
    if (gpu && sceneId === 'pupils') {
      const a = gpu.pupilAnchors();
      const label = (cls, at, html) => { const n = make('span', `mini-count ${cls}`); n.innerHTML = html; const [l, t] = pctAt(...at); n.style.left = `${l}%`; n.style.top = `${t}%`; extras.append(n); };
      if (a.flying && !a.ready) label('is-cloud', a.cloud, '<b>16,139</b> pupils · Mainland residence, location not specified');
      if (a.ready) {
        label('is-bar', a.kindergarten, '<b>388</b> kindergarten');
        label('is-bar', a.primary, '<b>2,577</b> primary');
        label('is-bar', a.secondary, '<b>13,174</b> secondary · each point is one pupil');
      }
    }
    layoutPins(stageWidth, stage.clientHeight || 500);
    extras.replaceChildren();
    if (usesMainland()) {
      const zone = make('span', 'mini-zone', 'Elsewhere on the Mainland');
      const [l, t] = pctAt(BEYOND.x1 - 20, BEYOND.z1 - 6, 0);
      zone.style.left = `${l}%`; zone.style.top = `${t}%`;
      extras.append(zone);
    }
    scene.pins.filter(p => EDGES[p.at]).forEach(pin => {
      const flag = make('span', `mini-flag is-approximate side-${EDGES[pin.at][0] < 0 ? 'hk' : 'sz'}`);
      flag.innerHTML = `${facetGlyph(pin.facet)}<span>${esc(pin.text)}</span>`;
      const [l, t] = pctAt(...EDGES[pin.at]);
      flag.style.left = `${l}%`; flag.style.top = `${t}%`;
      extras.append(flag);
    });
    const ghosts = new Set(scene.unplaced || []);
    scene.arcs.forEach(arc => { if (arc.from.startsWith('ghost:')) ghosts.add(arc.from.slice(6)); });
    ghosts.forEach(facet => {
      const ghost = make('span', 'mini-ghost');
      ghost.title = `${FACETS[facet].short}: not established in this account`;
      ghost.innerHTML = facetGlyph(facet);
      const [l, t] = pctAt(...GHOSTS[facet]);
      const [, ground] = pctAt(GHOSTS[facet][0], GHOSTS[facet][1], 0);
      ghost.style.left = `${l}%`; ghost.style.top = `${t}%`;
      ghost.style.setProperty('--drop', `${Math.max(0, (ground - t) / 100 * (stage.clientHeight || 500))}px`);
      extras.append(ghost);
    });
    scene.arcs.forEach(arc => {
      if (!arc.text || (!arc._g && !gpu)) return;
      const tag = make('span', `mini-arc-label arc-${arc.style}`, arc.text);
      const m = gpu ? arc3d(arc).mid : null;
      const [l, t] = gpu ? gpu.toPct([m[0], m[2], m[1]]) : toPct(arc._g.mid);
      tag.style.left = `${l}%`; tag.style.top = `${t}%`;
      extras.append(tag);
    });
    clampLoose(stageWidth);
  }

  function clampLoose(W) {
    extras.querySelectorAll('.mini-flag, .mini-zone').forEach(node => {
      node.style.removeProperty('--dx');
      const r = node.getBoundingClientRect(), stageBox = stage.getBoundingClientRect();
      const dx = Math.max(6 - (r.left - stageBox.left), Math.min(0, stageBox.right - 6 - r.right));
      if (dx) node.style.setProperty('--dx', `${dx}px`);
    });
  }

  /* Pins are centred over their building. Keep each inside the stage and lift
     any that would overlap an earlier one; the leader line keeps pointing at
     the building it labels. */
  function layoutPins(W, H) {
    const placed = [];
    const list = [...buttons.values()];
    list.forEach(b => { b.style.removeProperty('--dx'); b.style.removeProperty('--lift'); });
    list.filter(b => b.classList.contains('has-pin'))
      .map(b => ({ b, x: parseFloat(b.style.left) / 100 * W, y: parseFloat(b.style.top) / 100 * H, w: b.offsetWidth, h: b.offsetHeight }))
      .sort((p, q) => q.y - p.y)
      .forEach(p => {
        let left = p.x - p.w / 2;
        const dx = Math.max(6 - left, Math.min(0, W - 6 - (left + p.w)));
        left += dx;
        let lift = 0;
        for (let guard = 0; guard < 5; guard++) {
          const top = p.y - 8 - p.h - lift;
          if (!placed.some(r => left < r.right + 4 && left + p.w > r.left - 4 && top < r.bottom + 3 && top + p.h > r.top - 3)) break;
          lift += p.h + 6;
        }
        if (dx) p.b.style.setProperty('--dx', `${dx}px`);
        if (lift) p.b.style.setProperty('--lift', `${lift}px`);
        placed.push({ left, right: left + p.w, top: p.y - 8 - p.h - lift, bottom: p.y - 8 - lift });
      });
  }

  function animateTokens() {
    cancelAnimationFrame(tokenFrame);
    if (!motionAllowed() || !tokens.length) { tokens.forEach(t => t.token.setAttribute('visibility', 'hidden')); return; }
    tokenStart = performance.now();
    const step = now => {
      let running = false;
      tokens.forEach(({ token, g, delay }) => {
        const t = Math.max(0, Math.min(1, (now - tokenStart - 350 - delay) / 900));
        if (t > 0 && t < 1) { const [x, y] = bez(g, t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2); token.setAttribute('cx', x); token.setAttribute('cy', y); token.setAttribute('visibility', 'visible'); running = true; }
        else { token.setAttribute('visibility', 'hidden'); if (t === 0) running = true; }
      });
      if (running && !destroyed) tokenFrame = requestAnimationFrame(step);
    };
    tokenFrame = requestAnimationFrame(step);
  }

  function renderNow() {
    const person = byId[sceneId];
    now.innerHTML = person ? `<b>${esc(person.name)}</b>` : sceneId === 'together' ? '<b>All five together</b>' : '<b>Tap a marker for its evidence</b>';
  }

  function gpuScene() {
    const sc = currentScene();
    gpu.setScene({ lit: sc.lit, dim: sc.lit.length > 0, arcs: sc.arcs.map(arc3d), beyond: usesMainland(), pupils: sceneId === 'pupils' });
  }
  function gpuCamera(animate) {
    const sc = currentScene();
    const pts = [];
    const whole = () => [-386, usesMainland() ? BEYOND.x1 + 10 : 386].forEach(x => [-168, 168].forEach(z => [-24, 120].forEach(y => pts.push([x, y, z]))));
    const focusIds = [...sc.lit, ...sc.pins.map(p => p.at)].filter((v, i, a) => a.indexOf(v) === i);
    if (!focusIds.length || sceneId === 'together') whole();
    else {
      pts.push([-100, 0, 42], [100, 8, 76]);
      focusIds.forEach(id => { const g = GEOMETRY[id] || { x: EDGES[id][0] - 10, z: EDGES[id][1] - 10, w: 20, d: 20, h: 10 }; [g.x, g.x + Math.min(g.w, 160)].forEach(x => [g.z, g.z + g.d].forEach(z => { pts.push([x, 0, z], [x, g.h + 40, z]); })); });
      sc.arcs.map(arc3d).forEach(a => pts.push(a.p0, a.p3, a.mid));
      (sc.unplaced || []).forEach(f => { const [x, z, y] = GHOSTS[f]; pts.push([x, y + 10, z]); });
      if (usesMainland()) [BEYOND.x0, BEYOND.x1].forEach(x => [BEYOND.z0, BEYOND.z1].forEach(z => pts.push([x, 0, z])));
      if (sceneId === 'pupils') pts.push([-380, -8, 206], [-118, -8, 206], [560, 196, -150], [170, 118, 150]);
    }
    gpu.flyTo(pts, { animate });
  }
  function render({ animate = false } = {}) {
    if (destroyed) return;
    if (gpu) { gpuScene(); renderNow(); gpuCamera(animate); placeOverlays(); return; }
    drawWorld();
    drawArcs();
    renderNow();
    moveCamera(animate);
    if (animate) animateTokens();
  }

  /* The evidence card for one place. */
  function openCard(id, from) {
    const place = placeById[id];
    if (!place) return;
    openId = id;
    const sideName = place.side === 'hk' ? 'Hong Kong side' : place.side === 'sz' ? 'Shenzhen side' : 'At the crossing';
    const rows = [];
    Object.entries(place.who || {}).forEach(([pid, text]) => {
      const person = byId[pid];
      const type = person.evidence;
      const action = tour.includes(pid) ? `<button type="button" class="card-person" data-person="${pid}">${esc(person.name)}</button>` : `<span class="card-person-name">${esc(person.name)}</span>`;
      rows.push(`<li>${evidenceGlyph(type)}<div><p>${esc(text)}</p><small>${action}</small></div></li>`);
    });
    if (place.reported) rows.push(`<li>${evidenceGlyph('account')}<div><p>${esc(place.reported)}</p><small>Property agent’s account</small></div></li>`);
    if (place.observed) rows.push(`<li>${evidenceGlyph('observed')}<div><p>${esc(place.observed)}</p><small>Field observation</small></div></li>`);
    if (place.published) rows.push(`<li>${evidenceGlyph('published')}<div><p>${esc(place.published)}</p><small>Government release</small></div></li>`);
    const photo = place.photo && photos[place.photo];
    card.innerHTML = `<header><p class="card-side side-${place.side}">${sideName}</p><h3>${esc(place.label)}</h3><button type="button" class="card-close" aria-label="Close ${esc(place.label)}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15"/></svg></button></header>
      <ul class="card-evidence">${rows.join('')}</ul>
      ${photo ? `<button type="button" class="card-photo" data-photo="${place.photo}"><img src="${asset(photo.file)}" alt="" loading="lazy" decoding="async" width="${photo.width}" height="${photo.height}"><span>${evidenceGlyph('photo')}Inspect the field photograph</span></button>${place.photoNote ? `<p class="card-photo-note">${esc(place.photoNote)}</p>` : ''}` : ''}
      <p class="card-limit">Placed to explain, not mapped. Accounts are paraphrased.</p>`;
    card.hidden = false;
    status.textContent = `${place.label}. ${sideName}. ${card.querySelector('.card-evidence').textContent}`;
    placeOverlays();
    if (from) card.querySelector('.card-close').focus({ preventScroll: true });
    host.dispatchEvent(new CustomEvent('mini:place', { bubbles: true, detail: { id } }));
  }
  function closeCard(returnFocus) {
    if (!openId) return;
    const id = openId;
    openId = null;
    card.hidden = true;
    placeOverlays();
    if (returnFocus) buttons.get(id)?.focus({ preventScroll: true });
  }

  on(overlay, 'click', event => {
    const button = event.target.closest('.mini-mark');
    if (!button) return;
    if (openId === button.dataset.place) closeCard(false);
    else openCard(button.dataset.place, button);
  });
  on(card, 'click', event => {
    if (event.target.closest('.card-close')) { closeCard(true); return; }
    const photoButton = event.target.closest('[data-photo]');
    if (photoButton) { openPhoto(photoButton.dataset.photo, { from: photoButton }); return; }
    const person = event.target.closest('[data-person]');
    if (person) host.dispatchEvent(new CustomEvent('mini:request-scene', { bubbles: true, detail: { id: person.dataset.person } }));
  });
  on(host, 'keydown', event => { if (event.key === 'Escape' && openId) { event.preventDefault(); closeCard(true); } });
  on(svg, 'click', event => {
    const g = event.target.closest('[data-place]');
    if (g) openCard(g.dataset.place, null);
  });

  // Turning: horizontal drag; vertical touch stays native scrolling.
  let drag = null;
  on(svg, 'pointerdown', event => { if (event.pointerType === 'mouse' && event.button !== 0) return; drag = { x: event.clientX, y: event.clientY, last: event.clientX, active: false, id: event.pointerId }; });
  on(svg, 'pointermove', event => {
    if (!drag) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.active) {
      if (Math.abs(dx) < 6) return;
      if (event.pointerType !== 'mouse' && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
      drag.active = true; svg.setPointerCapture?.(drag.id); host.classList.add('is-turning');
    }
    turn((event.clientX - drag.last) * .0028);
    drag.last = event.clientX;
  });
  const endDrag = () => { if (drag?.active) host.classList.remove('is-turning'); drag = null; };
  on(svg, 'pointerup', endDrag); on(svg, 'pointercancel', endDrag); on(svg, 'lostpointercapture', endDrag);
  on(svg, 'keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); turn(event.key === 'ArrowRight' ? .06 : -.06); }
    if (event.key === 'Home') { event.preventDefault(); yaw = YAW; render(); }
  });
  function turn(delta) {
    swayCancelled = true; // a reader's own turn always wins over the hint
    if (gpu) { gpu.orbit(delta * 1.4); return; }
    yaw = Math.max(YAW_MIN, Math.min(YAW_MAX, yaw + delta));
    drawWorld(); drawArcs(); vbTarget = targetView(); applyView(vbTarget);
  }

  const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(() => { if (gpu) { gpu.requestFrame(); return; } cancelAnimationFrame(vbFrame); applyView(targetView()); }) : null;
  resize?.observe(stage);
  on(document, 'crossing:motion', () => { gpu?.setMotion(motionAllowed()); if (!motionAllowed()) { cancelAnimationFrame(tokenFrame); tokens.forEach(t => t.token.setAttribute('visibility', 'hidden')); } });

  let swayed = false, swayCancelled = false;
  const swayWatch = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    if (swayed || !entries.some(e => e.isIntersecting && e.intersectionRatio > .6) || !motionAllowed()) return;
    swayed = true; swayWatch.disconnect();
    const from = yaw, start = performance.now();
    const step = t => {
      if (destroyed || swayCancelled) return;
      const k = Math.min(1, (t - start) / 1800);
      yaw = from + .14 * Math.sin(Math.PI * k) * (1 - k * .15);
      drawWorld(); drawArcs(); placeOverlays();
      if (k < 1) requestAnimationFrame(step); else { yaw = from; drawWorld(); drawArcs(); placeOverlays(); }
    };
    setTimeout(() => gpu ? gpu.sway() : requestAnimationFrame(step), 700);
  }, { threshold: [.6] }) : null;
  swayWatch?.observe(stage);
  cleanups.push(() => swayWatch?.disconnect());

  render();
  document.fonts?.ready.then(() => !destroyed && !gpu && applyView(targetView()));
  tryGpu();

  /* Upgrade to the GPU renderer when available; the SVG stays the fallback. */
  function useSvg(reason) {
    if (gpu) { gpu.destroy(); gpu = null; }
    canvas.hidden = true; svg.style.display = ''; svg.removeAttribute('aria-hidden');
    host.classList.remove('is-gpu'); host.dataset.renderer = 'svg';
    if (reason) console.info('Miniature uses SVG:', reason);
    render();
  }
  async function tryGpu() {
    const forced = new URLSearchParams(location.search).get('renderer');
    // Opt-in while the WebGPU renderer is in development: add ?renderer=gpu to the URL.
    if (renderer === 'svg' || forced !== 'gpu' || !('gpu' in navigator)) { host.dataset.renderer = 'svg'; return; }
    try {
      const { createGpuWorld } = await import('./world-gpu.js?v=20261105-gpu');
      canvas.hidden = false;
      const world = await createGpuWorld(canvas, { GEOMETRY, places, TREES, BEYOND }, { onFrame: () => placeOverlays(), onLost: info => useSvg(info?.message || 'GPU device lost') });
      if (destroyed) { world.destroy(); return; }
      gpu = world;
      gpu.setMotion(motionAllowed());
      svg.style.display = 'none'; svg.setAttribute('aria-hidden', 'true');
      host.classList.add('is-gpu'); host.dataset.renderer = 'webgpu';
      render({ animate: false });
      host.dispatchEvent(new CustomEvent('mini:renderer', { bubbles: true, detail: { renderer: 'webgpu' } }));
    } catch (error) { canvas.hidden = true; useSvg(error.message); }
  }
  const pointers = new Map();
  let gpuDrag = null, pinch = null;
  on(canvas, 'pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); gpuDrag = null; return; }
    gpuDrag = { x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, active: false, id: event.pointerId, mouse: event.pointerType === 'mouse' };
  });
  on(canvas, 'pointermove', event => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinch && pointers.size === 2) { const [a, b] = [...pointers.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); gpu?.zoomBy(pinch / d); pinch = d; event.preventDefault(); return; }
    if (!gpuDrag) return;
    const dx = event.clientX - gpuDrag.x, dy = event.clientY - gpuDrag.y;
    if (!gpuDrag.active) {
      if (Math.hypot(dx, dy) < 6) return;
      if (!gpuDrag.mouse && Math.abs(dy) > Math.abs(dx)) { gpuDrag = null; return; }
      gpuDrag.active = true; canvas.setPointerCapture?.(event.pointerId); host.classList.add('is-turning'); swayCancelled = true;
    }
    gpu?.orbit((event.clientX - gpuDrag.lastX) * .0042, gpuDrag.mouse ? (event.clientY - gpuDrag.lastY) * .003 : 0);
    gpuDrag.lastX = event.clientX; gpuDrag.lastY = event.clientY;
  });
  const endGpuDrag = event => {
    const wasClick = gpuDrag && !gpuDrag.active && pointers.size === 1;
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinch = null;
    if (wasClick && gpu) { const id = gpu.pick(event.clientX, event.clientY); if (id) openCard(id, null); }
    if (gpuDrag?.active) host.classList.remove('is-turning');
    gpuDrag = null;
  };
  on(canvas, 'pointerup', endGpuDrag); on(canvas, 'pointercancel', endGpuDrag);
  on(canvas, 'wheel', event => { if (!event.ctrlKey || !gpu) return; event.preventDefault(); gpu.zoomBy(Math.exp(event.deltaY * .01)); }, { passive: false });
  on(canvas, 'keydown', event => {
    if (!gpu || event.altKey || event.metaKey) return;
    const keys = { ArrowLeft: () => turn(-.06), ArrowRight: () => turn(.06), ArrowUp: () => gpu.orbit(0, .05), ArrowDown: () => gpu.orbit(0, -.05), '+': () => gpu.zoomBy(.88), '=': () => gpu.zoomBy(.88), '-': () => gpu.zoomBy(1.14), Home: () => { gpu.zoom = 1; gpuCamera(true); } };
    if (keys[event.key]) { event.preventDefault(); swayCancelled = true; keys[event.key](); }
  });

  const api = {
    setScene(id, { animate = true } = {}) {
      if (destroyed || (!scenes[id] && id !== 'together')) return false;
      if (id === sceneId) return true;
      sceneId = id;
      closeCard(false);
      render({ animate });
      const person = byId[id];
      const unknown = (scenes[id]?.unplaced || []).map(f => FACETS[f].short.toLowerCase());
      status.textContent = person ? `${person.name}. ${person.summary}${unknown.length ? ` Not established: ${unknown.join(', ')}.` : ''}` : '';
      return true;
    },
    getScene: () => sceneId,
    openPlace: id => openCard(id, null),
    closeCard: () => closeCard(false),
    getState: () => ({ scene: sceneId, yaw, open: openId, renderer: gpu ? 'webgpu' : 'projected SVG' }),
    destroy() { destroyed = true; gpu?.destroy(); cancelAnimationFrame(vbFrame); cancelAnimationFrame(tokenFrame); resize?.disconnect(); cleanups.forEach(fn => fn()); host.replaceChildren(); host.classList.remove('mini'); }
  };
  return api;
}
