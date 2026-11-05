/* Type cut from field photographs.
   Each word's letterforms are filled with one field photograph, duotoned to
   the side of the boundary it belongs to, and broken into small tiles that
   settle one at a time — the title does not move all at once. Hover or focus
   shows a word in its true colour and names its photograph; activating it
   opens the photograph. The real text stays in the document for assistive
   technology, search and when canvas is unavailable. */
import { photos } from './cast.js';
import { asset, esc, motionAllowed } from './grammar.js';
import { openPhoto } from './photo-viewer.js';

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
