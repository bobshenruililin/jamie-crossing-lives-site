/* One accessible photo inspector for the whole page.
   Shows the unchanged original; optional detail chips magnify a normalised
   region in place. Captions describe visible context, never participants. */
import { photos } from './cast.js';
import { asset, evidenceGlyph, make } from './grammar.js';

let dialog, parts, current = null, opener = null;

function build() {
  dialog = make('dialog', 'photo-viewer');
  dialog.setAttribute('aria-labelledby', 'photo-viewer-caption');
  const inner = make('div', 'pv-inner');
  const close = make('button', 'pv-close');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close photograph');
  close.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15"/></svg>';
  const frame = make('div', 'pv-frame');
  const img = make('img', 'pv-image');
  img.decoding = 'async';
  const box = make('span', 'pv-box');
  box.hidden = true;
  frame.append(img, box);
  const side = make('div', 'pv-side');
  const kicker = make('p', 'pv-kicker');
  kicker.innerHTML = `${evidenceGlyph('observed')}<span></span>`;
  const caption = make('h2', 'pv-caption');
  caption.id = 'photo-viewer-caption';
  const spots = make('div', 'pv-spots');
  spots.setAttribute('role', 'group');
  spots.setAttribute('aria-label', 'Inspect a detail');
  const note = make('p', 'pv-note');
  note.setAttribute('aria-live', 'polite');
  const limit = make('p', 'pv-limit');
  const credit = make('p', 'pv-credit', 'Field photograph supplied by Bob and Jamie · unchanged original');
  const original = make('a', 'pv-original', 'Open the full image ↗');
  original.target = '_blank';
  original.rel = 'noopener';
  side.append(kicker, caption, spots, note, limit, credit, original);
  inner.append(close, frame, side);
  dialog.append(inner);
  document.body.append(dialog);
  parts = { img, box, frame, kicker, caption, spots, note, limit, original };
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('has-dialog');
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });
  spots.addEventListener('click', event => {
    const button = event.target.closest('button[data-spot]');
    if (button) focusSpot(Number(button.dataset.spot));
  });
}

function focusSpot(index) {
  const photo = photos[current];
  const spot = photo.spots[index];
  [...parts.spots.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === index + 1)));
  if (!spot) {
    parts.box.hidden = true;
    parts.frame.style.removeProperty('--zoom');
    parts.frame.classList.remove('is-zoomed');
    parts.note.textContent = '';
    return;
  }
  const [x, y, w, h] = spot.rect;
  Object.assign(parts.box.style, { left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` });
  parts.box.hidden = false;
  parts.note.textContent = spot.note;
}

export function openPhoto(key, { from } = {}) {
  const photo = photos[key];
  if (!photo) return;
  if (!dialog) build();
  current = key;
  opener = from || document.activeElement;
  parts.img.src = asset(photo.file);
  parts.img.alt = photo.alt;
  parts.img.width = photo.width;
  parts.img.height = photo.height;
  parts.frame.dataset.format = photo.width < photo.height ? 'portrait' : 'landscape';
  parts.kicker.querySelector('span').textContent = `Observed · ${photo.where}`;
  parts.caption.textContent = photo.caption;
  parts.limit.textContent = photo.limit;
  parts.original.href = asset(photo.file);
  parts.spots.replaceChildren();
  if (photo.spots.length) {
    ['Whole view', ...photo.spots.map(s => s.label)].forEach((label, i) => {
      const button = make('button', 'pv-spot', label);
      button.type = 'button';
      button.dataset.spot = String(i - 1);
      button.setAttribute('aria-pressed', String(i === 0));
      parts.spots.append(button);
    });
  }
  parts.spots.hidden = !photo.spots.length;
  focusSpot(-1);
  document.documentElement.classList.add('has-dialog');
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else window.open(asset(photo.file), '_blank', 'noopener');
}
