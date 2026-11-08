/* Isolated visual study; baseline 721631f. Not used by the main website. */
/* Type cut from field photographs.
   Each word's letterforms are filled with one field photograph, duotoned to
   the side of the boundary it belongs to, and broken into small tiles that
   settle one at a time — the title does not move all at once. Hover or focus
   shows a word in its true colour and names its photograph; activating it
   opens the photograph. The real text stays in the document for assistive
   technology, search and when canvas is unavailable. */
import { photos } from '../../review/connected-20261106/snapshot/feature/cast.js';
import { asset, esc, motionAllowed } from '../../review/connected-20261106/snapshot/feature/grammar.js';
import { openPhoto } from '../../review/connected-20261106/snapshot/feature/photo-viewer.js';

const TONES = {
  hk: [[61, 20, 8], [214, 98, 58]],
  x:  [[13, 38, 40], [96, 134, 128]],
  sz: [[6, 44, 40], [24, 156, 138]],
  ink: [[16, 42, 44], [70, 112, 106]]
};
const FONTS = { display: '700 {s}px "Barlow Condensed"', accent: 'italic 400 {s}px Instrument' };
const images = new Map();
function load(key) {
  if (!images.has(key)) images.set(key, new Promise((resolve, reject) => { const img = new Image(); img.decoding = 'async'; img.onload = () => resolve(img); img.onerror = reject; img.src = asset(photos[key].file); }));
  return images.get(key);
}
const rand = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

/* Paint one photograph, cover-fitted, into a word-sized canvas and keep only the glyphs. */
function paintWord(img, w, h, draw, tone, focus = [.5, .5]) {
  const make = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const colour = make(), duo = make();
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight) * 1.08;
  const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
  const dx = (w - dw) * focus[0], dy = (h - dh) * focus[1];
  const cctx = colour.getContext('2d', { willReadFrequently: true });
  cctx.drawImage(img, dx, dy, dw, dh);
  const dctx = duo.getContext('2d');
  const data = cctx.getImageData(0, 0, w, h);
  const out = dctx.createImageData(w, h);
  const [a, b] = TONES[tone];
  let lo = 255, hi = 0;
  for (let i = 0; i < data.data.length; i += 16) { const l = .3 * data.data[i] + .59 * data.data[i + 1] + .11 * data.data[i + 2]; lo = Math.min(lo, l); hi = Math.max(hi, l); }
  const span = Math.max(1, hi - lo);
  for (let i = 0; i < data.data.length; i += 4) {
    let l = (.3 * data.data[i] + .59 * data.data[i + 1] + .11 * data.data[i + 2] - lo) / span;
    l = .08 + .92 * Math.pow(Math.min(1, Math.max(0, l)), .95);
    out.data[i] = a[0] + (b[0] - a[0]) * l; out.data[i + 1] = a[1] + (b[1] - a[1]) * l; out.data[i + 2] = a[2] + (b[2] - a[2]) * l; out.data[i + 3] = 255;
  }
  dctx.putImageData(out, 0, 0);
  // slightly deepen the true-colour version so it stays legible on paper
  cctx.globalCompositeOperation = 'multiply'; cctx.fillStyle = '#d9d2c2'; cctx.fillRect(0, 0, w, h);
  [cctx, dctx].forEach(ctx => { ctx.globalCompositeOperation = 'destination-in'; draw(ctx); ctx.globalCompositeOperation = 'source-over'; });
  const mask = make(), mctx = mask.getContext('2d', { willReadFrequently: true });
  draw(mctx);
  return { colour, duo, mask: mctx.getImageData(0, 0, w, h).data };
}

/**
 * spec.lines: [[{ text, photo | photos, tone, font }...], ...] — each inner list starts a new line.
 * spec.size(): CSS px font size for 'display'; accent is drawn 1.12× larger.
 * spec.interactive: render keyboard-focusable word buttons (hero) or pointer-only (marks).
 */
export function mountPhotoType(host, spec) {
  host.classList.add('ptype');
  host.innerHTML = '<canvas aria-hidden="true"></canvas><div class="ptype-hits"></div><p class="ptype-chip" aria-hidden="true" hidden></p>';
  const canvas = host.querySelector('canvas'), hits = host.querySelector('.ptype-hits'), chip = host.querySelector('.ptype-chip');
  const ctx = canvas.getContext('2d');
  let words = [], tiles = [], start = 0, frame = 0, hovered = null, pointer = null, lensT = 0, destroyed = false, layoutKey = '';
  const dpr = () => Math.min(2, devicePixelRatio || 1);

  async function layout() {
    const width = host.clientWidth;
    const size = spec.size(width);
    const key = `${width}|${size}`;
    if (!width || key === layoutKey) return;
    layoutKey = key;
    const r = dpr();
    const measure = document.createElement('canvas').getContext('2d');
    const lineGap = size * (spec.leading || .9);
    const placed = [];
    let y = 0;
    spec.lines.forEach(line => {
      let x = 0, row = [], rowMax = 0;
      const flush = () => { if (!row.length) return; y += rowMax; row.forEach(w => { w.baseline = y; }); placed.push(...row); row = []; rowMax = 0; x = 0; };
      line.forEach(word => {
        const fs = word.font === 'accent' ? size * 1.12 : size;
        measure.font = FONTS[word.font || 'display'].replace('{s}', fs);
        if (measure.letterSpacing !== undefined) measure.letterSpacing = word.font === 'accent' ? '-0.025em' : '-0.022em';
        const m = measure.measureText(word.text);
        const wWidth = Math.ceil(m.width + fs * .08);
        const space = measure.measureText(' ').width * .9;
        if (x && x + wWidth > width) flush();
        row.push({ ...word, fs, x, w: wWidth });
        x += wWidth + space;
        rowMax = Math.max(rowMax, word.font === 'accent' ? lineGap * 1.1 : lineGap);
      });
      flush();
    });
    const height = Math.ceil(y + size * .26);
    canvas.width = Math.ceil(width * r); canvas.height = Math.ceil(height * r);
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
    host.style.height = `${height}px`;

    const built = await Promise.all(placed.map(async (word, i) => {
      const keys = word.photos || [word.photo];
      const imgs = await Promise.all(keys.map(load));
      const top = word.baseline - word.fs * .9, h = Math.ceil(word.fs * 1.12);
      const pw = Math.ceil(word.w * r), ph = Math.ceil(h * r);
      const draw = c => { c.font = FONTS[word.font || 'display'].replace('{s}', word.fs * r); if (c.letterSpacing !== undefined) c.letterSpacing = word.font === 'accent' ? '-0.025em' : '-0.022em'; c.fillStyle = '#000'; c.textBaseline = 'alphabetic'; c.fillText(word.text, word.fs * .02 * r, word.fs * .9 * r); };
      const layers = imgs.map((img, k) => paintWord(img, pw, ph, draw, word.tone || 'ink', word.focus?.[k]));
      return { ...word, i, keys, layers, top, h, layer: 0 };
    }));
    if (destroyed) return;
    words = built;
    // tiles: a grid in device pixels; each tile remembers its word and delay
    const cell = Math.max(3, Math.round((spec.cell || size / 24) * r));
    const seeded = rand(97);
    tiles = [];
    words.forEach(word => {
      const mask = word.layers[0].mask, pw = word.layers[0].duo.width, ph = word.layers[0].duo.height;
      for (let cy = 0; cy < ph; cy += cell) for (let cx = 0; cx < pw; cx += cell) {
        let on = false;
        for (let sy = 0; sy < cell && !on; sy += Math.max(1, cell >> 1)) for (let sx = 0; sx < cell && !on; sx += Math.max(1, cell >> 1)) {
          const px = Math.min(pw - 1, cx + sx), py = Math.min(ph - 1, cy + sy);
          if (mask[(py * pw + px) * 4 + 3] > 40) on = true;
        }
        if (!on) continue;
        tiles.push({ word, sx: cx, sy: cy, x: word.x * r + cx, y: word.top * r + cy, cell, delay: word.i * 170 + seeded() * 820, dy: -(18 + seeded() * 48) * r, dx: (seeded() - .5) * 14 * r });
      }
    });
    hits.replaceChildren(...words.map(word => {
      const photo = photos[word.keys[0]];
      const el = document.createElement(spec.interactive ? 'button' : 'span');
      el.className = 'ptype-hit';
      if (spec.interactive) { el.type = 'button'; el.setAttribute('aria-label', `“${word.text}” — letters cut from a field photograph: ${photo.caption} Open the photograph.`); }
      Object.assign(el.style, { left: `${word.x}px`, top: `${word.top}px`, width: `${word.w}px`, height: `${word.h}px` });
      el.dataset.word = word.i;
      return el;
    }));
    if (!start) start = performance.now() + 120;
    if (!motionAllowed()) start = -1e6;
    host.classList.add('is-ready');
    kick();
  }

  const easeOut = t => 1 - Math.pow(1 - t, 3);
  function draw(now) {
    frame = 0;
    if (destroyed) return;
    const r = dpr();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let busy = false;
    // seamless at rest; the tiles show while settling and under the pointer
    const seam = .6;
    lensT += ((hovered !== null ? 1 : 0) - lensT) * .18;
    if (Math.abs(lensT - (hovered !== null ? 1 : 0)) > .01) busy = true;
    for (const t of tiles) {
      const k = Math.min(1, Math.max(0, (now - start - t.delay) / 640));
      if (k < 1) busy = true;
      if (k <= 0) continue;
      const e = easeOut(k);
      let x = t.x + t.dx * (1 - e), y = t.y + t.dy * (1 - e), s = t.cell + seam - (1 - e) * t.cell * .3;
      const isHover = hovered === t.word.i;
      if (pointer && isHover) {
        const ddx = (t.x + t.cell / 2) - pointer[0] * r, ddy = (t.y + t.cell / 2) - pointer[1] * r, d = Math.hypot(ddx, ddy), R = 54 * r;
        if (d < R) { const lift = (1 - d / R) * lensT; s = t.cell * (1 - lift * .28); x += (t.cell - s) / 2 + ddx / d * lift * 5 * r; y += (t.cell - s) / 2 + ddy / d * lift * 5 * r - lift * 3 * r; }
      }
      const layer = t.word.layers[t.word.layer];
      ctx.globalAlpha = Math.min(1, k * 1.6);
      ctx.drawImage(isHover ? layer.colour : layer.duo, t.sx, t.sy, t.cell, t.cell, x, y, s, s);
    }
    ctx.globalAlpha = 1;
    if (busy) frame = requestAnimationFrame(draw);
  }
  const kick = () => { if (!frame && !destroyed) frame = requestAnimationFrame(draw); };

  function show(i, from) {
    hovered = i;
    if (i === null) { chip.hidden = true; kick(); return; }
    const word = words[i];
    const photo = photos[word.keys[word.layer]];
    chip.innerHTML = `<b>${esc(photo.where)}</b> ${esc(photo.caption)}${spec.interactive ? ' <span>Open ↗</span>' : ''}`;
    chip.hidden = false;
    chip.style.left = `${Math.min(word.x, Math.max(0, host.clientWidth - 280))}px`;
    chip.style.top = `${spec.chipBelow === false ? word.top + word.h + 2 : host.clientHeight + 6}px`;
    kick();
  }
  host.addEventListener('pointermove', e => {
    const b = host.getBoundingClientRect();
    pointer = [e.clientX - b.left, e.clientY - b.top];
    const hit = e.target.closest?.('.ptype-hit');
    const i = hit ? Number(hit.dataset.word) : null;
    if (i !== hovered) show(i); else kick();
  });
  host.addEventListener('pointerleave', () => { pointer = null; show(null); });
  hits.addEventListener('focusin', e => { const hit = e.target.closest('.ptype-hit'); if (hit) { pointer = null; show(Number(hit.dataset.word)); } });
  hits.addEventListener('focusout', () => show(null));
  hits.addEventListener('click', e => {
    const hit = e.target.closest('.ptype-hit');
    if (!hit) return;
    const word = words[Number(hit.dataset.word)];
    if (word.keys.length > 1 && !spec.interactive) { word.layer = (word.layer + 1) % word.keys.length; show(word.i); return; }
    openPhoto(word.keys[word.layer], { from: hit });
  });

  const fontsReady = Promise.all([document.fonts?.load('700 40px "Barlow Condensed"'), document.fonts?.load('italic 40px Instrument')].filter(Boolean));
  fontsReady.then(layout).catch(() => host.classList.add('is-failed'));
  const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(() => fontsReady.then(layout)) : null;
  resize?.observe(host.parentElement || host);
  document.addEventListener('crossing:motion', () => { if (!motionAllowed()) start = -1e6; kick(); });
  return { destroy() { destroyed = true; resize?.disconnect(); cancelAnimationFrame(frame); host.replaceChildren(); } };
}

/* ------------------------------------------------------------------------
   Rearrangement: the tiles of one line become the next.
   Line 1 is cut from photographs, word by word. Its pieces then lift off and
   recompose line 2, mixing the photographs of both places, while line 1
   stays behind as a dashed outline — the arrangement that was. Every piece
   of line 2 is still a fragment of a real photograph: hover to see which,
   activate to open it. Hover the outline to pull the pieces back. */
function placeLines(lines, width, size, leading, measure) {
  const placed = [];
  let y = 0;
  lines.forEach(line => {
    let x = 0, row = [], rowMax = 0;
    const flush = () => { if (!row.length) return; y += rowMax; row.forEach(w => { w.baseline = y; }); placed.push(...row); row = []; rowMax = 0; x = 0; };
    line.forEach(word => {
      const fs = (word.font === 'accent' ? 1.12 : 1) * size * (word.scale || 1);
      measure.font = FONTS[word.font || 'display'].replace('{s}', fs);
      if (measure.letterSpacing !== undefined) measure.letterSpacing = word.font === 'accent' ? '-0.025em' : '-0.022em';
      const w = Math.ceil(measure.measureText(word.text).width + fs * .08);
      const space = measure.measureText(' ').width * .9;
      if (x && x + w > width) flush();
      row.push({ ...word, fs, x, w });
      x += w + space;
      rowMax = Math.max(rowMax, fs * leading * (word.font === 'accent' ? .98 : 1));
    });
    flush();
  });
  return { placed, height: y };
}
const drawerFor = (word, r) => c => {
  c.font = FONTS[word.font || 'display'].replace('{s}', word.fs * r);
  if (c.letterSpacing !== undefined) c.letterSpacing = word.font === 'accent' ? '-0.025em' : '-0.022em';
  c.fillStyle = '#000'; c.textBaseline = 'alphabetic';
  c.fillText(word.text, word.fs * .02 * r, word.fs * .9 * r);
};

export function mountRearrange(host, spec) {
  host.classList.add('ptype', 'rearrange');
  host.innerHTML = `<canvas aria-hidden="true"></canvas><div class="ptype-hits"></div>
    <button type="button" class="rearrange-replay" aria-label="Rearrange the pieces again"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10a6 6 0 1 0 2-4.5M4 3.5V7h3.5"/></svg></button>
    <p class="ptype-chip" aria-hidden="true" hidden></p>`;
  const canvas = host.querySelector('canvas'), hits = host.querySelector('.ptype-hits'), chip = host.querySelector('.ptype-chip'), replay = host.querySelector('.rearrange-replay');
  const ctx = canvas.getContext('2d');
  const buffer = document.createElement('canvas'), bctx = buffer.getContext('2d');
  const lens = document.createElement('canvas'), lctx = lens.getContext('2d');
  let src = [], dst = [], extras = [], words = [], mask2 = null, ghost = null, inkGhost = null, layoutKey = '', destroyed = false;
  let frame = 0, settleStart = 0, p = 0, pTarget = 1, pointer = null, hoverPiece = null, rewinding = false, lastT = 0;
  const dpr = () => Math.min(2, devicePixelRatio || 1);
  const SETTLE = 1400, HOLD = 700, MOVE = 1900;

  async function layout() {
    const width = host.clientWidth, size = spec.size(width), key = `${width}|${size}`;
    if (!width || key === layoutKey) return;
    layoutKey = key;
    const r = dpr(), measure = document.createElement('canvas').getContext('2d');
    const one = placeLines(spec.from, width, size, .92, measure);
    const two = placeLines(spec.to, width, size * (spec.toScale || .86), .9, measure);
    const gap = size * .12;
    two.placed.forEach(w => { w.baseline += one.height + gap; });
    const height = Math.ceil(one.height + gap + two.height + size * .22);
    [canvas, buffer, lens].forEach(c => { c.width = Math.ceil(width * r); c.height = Math.ceil(height * r); });
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`; host.style.height = `${height}px`;
    const built = await Promise.all(one.placed.map(async (word, i) => {
      const img = await load(word.photo);
      const top = word.baseline - word.fs * .9, h = Math.ceil(word.fs * 1.12);
      const layer = paintWord(img, Math.ceil(word.w * r), Math.ceil(h * r), drawerFor(word, r), word.tone || 'ink', word.focus);
      return { ...word, i, top, h, layer };
    }));
    if (destroyed) return;
    words = built;
    // line 2 mask and line 1 outline, full-canvas
    mask2 = document.createElement('canvas'); mask2.width = canvas.width; mask2.height = canvas.height;
    const m = mask2.getContext('2d');
    two.placed.forEach(w => { m.save(); m.translate(w.x * r, (w.baseline - w.fs * .9) * r); drawerFor(w, r)(m); m.restore(); });
    ghost = document.createElement('canvas'); ghost.width = canvas.width; ghost.height = canvas.height;
    const g = ghost.getContext('2d');
    words.forEach(w => { g.save(); g.translate(w.x * r, w.top * r); g.font = FONTS[w.font || 'display'].replace('{s}', w.fs * r); if (g.letterSpacing !== undefined) g.letterSpacing = w.font === 'accent' ? '-0.025em' : '-0.022em'; g.setLineDash([3 * r, 2.6 * r]); g.lineWidth = 1.2 * r; g.strokeStyle = '#173e40'; g.globalAlpha = .55; g.strokeText(w.text, w.fs * .02 * r, w.fs * .9 * r); g.restore(); });
    // Proposal: when the photographs move on, readable ink remains behind.
    // Geometry, tile sources, timing, rewind and photo inspection are unchanged.
    inkGhost = document.createElement('canvas'); inkGhost.width = canvas.width; inkGhost.height = canvas.height;
    const ink = inkGhost.getContext('2d');
    words.forEach(w => { ink.save(); ink.translate(w.x * r, w.top * r); ink.font = FONTS[w.font || 'display'].replace('{s}', w.fs * r); if (ink.letterSpacing !== undefined) ink.letterSpacing = w.font === 'accent' ? '-0.025em' : '-0.022em'; ink.fillStyle = '#173e40'; ink.fillText(w.text, w.fs * .02 * r, w.fs * .9 * r); ink.restore(); });
    // pieces
    const cell = Math.max(3, Math.round((spec.cell || size / 22) * r));
    cellSize = cell;
    const seeded = rand(41);
    src = [];
    words.forEach(word => {
      const lw = word.layer.duo.width, lh = word.layer.duo.height, md = word.layer.mask;
      for (let cy = 0; cy < lh; cy += cell) for (let cx = 0; cx < lw; cx += cell) {
        let on = false;
        for (let sy = 0; sy < cell && !on; sy += Math.max(1, cell >> 1)) for (let sx = 0; sx < cell && !on; sx += Math.max(1, cell >> 1)) {
          const px = Math.min(lw - 1, cx + sx), py = Math.min(lh - 1, cy + sy);
          if (md[(py * lw + px) * 4 + 3] > 40) on = true;
        }
        if (on) src.push({ word, sx: cx, sy: cy, x: word.x * r + cx, y: word.top * r + cy, delay: word.i * 170 + seeded() * 700, dy: -(16 + seeded() * 40) * r, dx: (seeded() - .5) * 12 * r, leave: Infinity });
      }
    });
    const md2 = m.getImageData(0, 0, mask2.width, mask2.height).data, W = mask2.width;
    dst = [];
    for (let cy = 0; cy < mask2.height; cy += cell) for (let cx = 0; cx < W; cx += cell) {
      let on = false;
      for (let sy = 0; sy < cell && !on; sy += Math.max(1, cell >> 1)) for (let sx = 0; sx < cell && !on; sx += Math.max(1, cell >> 1)) {
        const px = Math.min(W - 1, cx + sx), py = Math.min(mask2.height - 1, cy + sy);
        if (md2[(py * W + px) * 4 + 3] > 40) on = true;
      }
      if (on) dst.push({ x: cx, y: cy });
    }
    // assign each target a source piece: roughly left-to-right, deliberately mixed
    const bySrc = [...src.keys()].sort((a, b) => src[a].x - src[b].x);
    dst.sort((a, b) => a.x - b.x || a.y - b.y);
    const n = src.length, mixing = spec.mixing ?? .55;
    const maxX = Math.max(...dst.map(d => d.x)) || 1;
    dst.forEach((d, j) => {
      const base = Math.floor(j / dst.length * n);
      const k = Math.max(0, Math.min(n - 1, Math.round(base + (seeded() - .5) * n * mixing)));
      d.s = src[bySrc[k]];
      d.delay = (d.x / maxX) * MOVE * .55 + seeded() * MOVE * .2;
      d.lift = (30 + seeded() * 70) * r;
      d.s.leave = Math.min(d.s.leave, d.delay);
    });
    // every piece travels: spare pieces land on an occupied cell and merge into it
    extras = src.filter(t => t.leave === Infinity).map(t => {
      const d = dst[Math.floor(seeded() * dst.length)];
      const delay = (d.x / maxX) * MOVE * .55 + seeded() * MOVE * .2;
      t.leave = delay;
      return { s: t, x: d.x, y: d.y, delay, lift: (30 + seeded() * 70) * r };
    });
    if (!settleStart) settleStart = performance.now() + 100;
    if (!motionAllowed()) { settleStart = -1e6; p = 1; }
    hits.replaceChildren(...words.map(word => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'ptype-hit'; b.dataset.word = word.i;
      b.setAttribute('aria-label', `“${word.text}” — letters cut from a field photograph: ${photos[word.photo].caption} Open the photograph.`);
      Object.assign(b.style, { left: `${word.x}px`, top: `${word.top}px`, width: `${word.w}px`, height: `${word.h}px` });
      return b;
    }));
    host.classList.add('is-ready');
    kick();
  }

  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function draw(now) {
    frame = 0;
    if (destroyed || !words.length) return;
    const r = dpr(), dt = lastT ? Math.min(50, now - lastT) : 16; lastT = now;
    const settled = now - settleStart - SETTLE;
    // the rearrangement begins once line 1 has settled and held
    const canMove = settled > HOLD || !motionAllowed();
    if (canMove) p += Math.sign(pTarget - p) * Math.min(Math.abs(pTarget - p), dt / (MOVE * 1.2) * (rewinding ? 1.6 : 1));
    if (!motionAllowed()) p = pTarget;
    const clock = p * MOVE * 1.2;
    let busy = Math.abs(pTarget - p) > 1e-3 || settled < HOLD;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // line 1: pieces at home, until each departs; outline appears as they leave
    const leftFraction = Math.min(1, clock / (MOVE * .6));
    const strongerRest = document.documentElement.dataset.labStudy === 'title' && document.documentElement.dataset.labVariant === 'proposal';
    if (leftFraction > 0) { ctx.globalAlpha = Math.min(1, leftFraction * 1.4); ctx.drawImage(strongerRest ? inkGhost : ghost, 0, 0); ctx.globalAlpha = 1; }
    for (const t of src) {
      if (clock > t.leave) continue;
      const k = Math.min(1, Math.max(0, (now - settleStart - t.delay) / 640));
      if (k < 1) busy = true;
      if (k <= 0) continue;
      const e = 1 - Math.pow(1 - k, 3);
      ctx.globalAlpha = Math.min(1, k * 1.6);
      ctx.drawImage(t.word.layer.duo, t.sx, t.sy, cellOf(), cellOf(), t.x + t.dx * (1 - e), t.y + t.dy * (1 - e), cellOf() + .6, cellOf() + .6);
    }
    ctx.globalAlpha = 1;
    // line 2: arrived pieces are composited and cut to the letterforms
    bctx.clearRect(0, 0, buffer.width, buffer.height);
    const flying = [];
    for (const d of extras) { const k = Math.min(1, Math.max(0, (clock - d.delay) / 800)); if (k > 0 && k < 1) flying.push([d, k]); }
    for (const d of dst) {
      const k = Math.min(1, Math.max(0, (clock - d.delay) / 800));
      if (k >= 1) bctx.drawImage(d.s.word.layer.duo, d.s.sx, d.s.sy, cellOf(), cellOf(), d.x, d.y, cellOf() + .6, cellOf() + .6);
      else if (k > 0) flying.push([d, k]);
    }
    bctx.globalCompositeOperation = 'destination-in'; bctx.drawImage(mask2, 0, 0); bctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(buffer, 0, 0);
    for (const [d, k] of flying) {
      const e = ease(k), u = 1 - e;
      const x = d.s.x * u + d.x * e, y = d.s.y * u + d.y * e - Math.sin(Math.PI * e) * d.lift;
      ctx.drawImage(d.s.word.layer.duo, d.s.sx, d.s.sy, cellOf(), cellOf(), x, y, cellOf() * (1 - Math.sin(Math.PI * e) * .25), cellOf() * (1 - Math.sin(Math.PI * e) * .25));
    }
    // a lens of true colour under the pointer, over line 2
    if (pointer && p > .98) {
      lctx.clearRect(0, 0, lens.width, lens.height);
      const R = 46 * r, px = pointer[0] * r, py = pointer[1] * r;
      for (const d of dst) { const dd = Math.hypot(d.x - px, d.y - py); if (dd < R) lctx.drawImage(d.s.word.layer.colour, d.s.sx, d.s.sy, cellOf(), cellOf(), d.x, d.y, cellOf() + .6, cellOf() + .6); }
      lctx.globalCompositeOperation = 'destination-in'; lctx.drawImage(mask2, 0, 0); lctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(lens, 0, 0);
    }
    host.classList.toggle('is-rearranged', p > .98);
    if (busy) frame = requestAnimationFrame(draw);
  }
  let cellSize = 0;
  const cellOf = () => cellSize || (cellSize = Math.max(3, Math.round((spec.cell || spec.size(host.clientWidth) / 22) * dpr())));
  const kick = () => { if (!frame && !destroyed) { lastT = 0; frame = requestAnimationFrame(draw); } };

  function pieceAt(x, y) {
    const r = dpr(), c = cellOf();
    return dst.find(d => x * r >= d.x && x * r < d.x + c && y * r >= d.y && y * r < d.y + c) || null;
  }
  function showChip(html, top) {
    if (!html) { chip.hidden = true; return; }
    chip.innerHTML = html; chip.hidden = false;
    chip.style.left = '0px'; chip.style.top = `${top}px`;
  }
  host.addEventListener('pointermove', e => {
    const b = host.getBoundingClientRect();
    pointer = [e.clientX - b.left, e.clientY - b.top];
    const word = e.target.closest?.('.ptype-hit');
    if (word && p > .5) { rewinding = true; pTarget = 0; showChip(`<b>${esc(photos[words[word.dataset.word].photo].where)}</b> ${esc(photos[words[word.dataset.word].photo].caption)} <span>Open ↗</span>`, host.clientHeight + 6); kick(); return; }
    if (!word && rewinding) { rewinding = false; pTarget = 1; }
    hoverPiece = p > .98 ? pieceAt(...pointer) : null;
    host.classList.toggle('is-piece', Boolean(hoverPiece));
    if (hoverPiece) { const ph = photos[hoverPiece.s.word.photo]; showChip(`<b>This piece · ${esc(ph.where)}</b> ${esc(ph.caption)} <span>Open ↗</span>`, host.clientHeight + 6); }
    else if (!word) showChip(null);
    kick();
  });
  host.addEventListener('pointerleave', () => { pointer = null; hoverPiece = null; if (rewinding) { rewinding = false; pTarget = 1; } showChip(null); kick(); });
  host.addEventListener('click', e => {
    const word = e.target.closest('.ptype-hit');
    if (word) { openPhoto(words[word.dataset.word].photo, { from: word }); return; }
    if (e.target.closest('.rearrange-replay')) { pTarget = 1; p = 0; kick(); return; }
    if (hoverPiece) openPhoto(hoverPiece.s.word.photo, { from: replay });
  });
  hits.addEventListener('focusin', e => { const w = e.target.closest('.ptype-hit'); if (w) { const ph = photos[words[w.dataset.word].photo]; showChip(`<b>${esc(ph.where)}</b> ${esc(ph.caption)} <span>Open ↗</span>`, host.clientHeight + 6); } });
  hits.addEventListener('focusout', () => showChip(null));

  const fontsReady = Promise.all([document.fonts?.load('700 40px "Barlow Condensed"'), document.fonts?.load('italic 40px Instrument')].filter(Boolean));
  fontsReady.then(layout).catch(() => host.classList.add('is-failed'));
  const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(() => { cellSize = 0; fontsReady.then(layout); }) : null;
  resize?.observe(host.parentElement || host);
  document.addEventListener('crossing:motion', () => { if (!motionAllowed()) { settleStart = -1e6; p = pTarget; } kick(); });
  const changeStudy = () => kick();
  document.addEventListener('crossing:study', changeStudy);
  return { replay() { p = 0; pTarget = 1; kick(); }, getState: () => ({ p, pieces: dst.length, sources: src.length }), destroy() { destroyed = true; document.removeEventListener('crossing:study', changeStudy); resize?.disconnect(); cancelAnimationFrame(frame); host.replaceChildren(); } };
}
