/* Life signatures: one small glyph per account, drawn from cast.js.
   Four lanes, top to bottom — home, work, purchases, relationships — across a
   dashed boundary. Hong Kong: a half-disc to the left. Shenzhen: to the right.
   Both: a whole disc across the boundary. Mainland residence, city unspecified:
   the right half is hatched, without an arrow to a different city. Not established: a small
   dashed ghost on the boundary — the same grammar as the miniature. */
import { byId, FACETS } from './cast.js?v=20261108-v4';
import { esc } from './grammar.js';

const ORDER = ['home', 'work', 'spend', 'ties'];
const HK = '#c9512d', SZ = '#008c7a', INK = '#173e40';
let hatchId = 0;

export function placement(person, facet) {
  const f = person.facets[facet] || {};
  if (f.mainland) return 'mainland';
  if (f.hk && f.sz) return 'both';
  if (f.hk) return 'hk';
  if (f.sz) return 'sz';
  return 'unknown';
}

const WORDS = { hk: 'Hong Kong', sz: 'Shenzhen', both: 'both places', mainland: 'the Mainland, city unspecified', unknown: 'not established' };
export function describe(person) {
  return `${person.name}: ${ORDER.map(f => `${FACETS[f].short.toLowerCase()} ${person.facets[f]?.unplaced || WORDS[placement(person, f)]}`).join('; ')}.`;
}

const X = 22, R = 8.6, Y = i => 10 + i * 18;
const half = (y, side, fill, x = X) => `<path d="M${x} ${y - R}A${R} ${R} 0 0 ${side === 'left' ? 0 : 1} ${x} ${y + R}Z" fill="${fill}"/>`;
const ghost = y => `<circle cx="${X}" cy="${y}" r="4.4" fill="#f6f2e8" stroke="${INK}" stroke-opacity=".6" stroke-width="1.2" stroke-dasharray="2 1.7"/>`;
function laneMark(where, y, hid) {
  if (where === 'hk') return half(y, 'left', HK);
  if (where === 'sz') return half(y, 'right', SZ);
  if (where === 'both') return half(y, 'left', HK) + half(y, 'right', SZ);
  if (where === 'mainland') return `<path d="M${X} ${y - R}A${R} ${R} 0 0 1 ${X} ${y + R}Z" fill="url(#${hid})" stroke="${SZ}" stroke-width="1.3" stroke-dasharray="2.2 1.8"/>`;
  return ghost(y);
}
const frame = inner => `<line x1="${X}" y1="0" x2="${X}" y2="74" stroke="${INK}" stroke-width="1.1" stroke-dasharray="2.2 2.6" stroke-opacity=".5"/>${[0, 1, 2, 3].map(i => `<line x1="3" y1="${Y(i)}" x2="49" y2="${Y(i)}" stroke="${INK}" stroke-opacity=".1" stroke-width="1"/>`).join('')}${inner}`;

export function signatureSVG(id, { size = 36, title = true } = {}) {
  const person = byId[id];
  if (!person) return '';
  const hid = `sig-hatch-${++hatchId}`;
  const lanes = ORDER.map((facet, i) => { const where = placement(person, facet); return `<g class="sig-lane" data-facet="${facet}" data-where="${where}">${laneMark(where, Y(i), hid)}</g>`; }).join('');
  const label = esc(describe(person));
  return `<svg class="sig" viewBox="0 0 52 74" width="${size}" height="${Math.round(size * 74 / 52)}" role="img" aria-label="${label}" focusable="false">${title ? `<title>${label}</title>` : ''}
    <defs><pattern id="${hid}" width="3.6" height="3.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3.6" height="3.6" fill="#e3eee9"/><rect width="1.2" height="3.6" fill="${SZ}"/></pattern></defs>${frame(lanes)}</svg>`;
}

/* A once-only key: one annotated signature, lanes named. */
export function signatureKey() {
  const names = ['Home', 'Work', 'Purchases', 'Relationships'];
  const ex = laneMark('hk', Y(0)) + laneMark('sz', Y(1)) + laneMark('both', Y(2)) + laneMark('unknown', Y(3));
  return `<figure class="sig-key" aria-label="How to read a life signature: four lanes, home, work, purchases and relationships; a half-disc to the left is Hong Kong, to the right Shenzhen; a whole disc spans both; a hatched half-disc means Mainland, city unspecified; a dashed ghost is not established.">
    <svg viewBox="0 0 150 74" width="150" height="74" aria-hidden="true"><defs><pattern id="sig-key-hatch" width="3.6" height="3.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3.6" height="3.6" fill="#e3eee9"/><rect width="1.2" height="3.6" fill="${SZ}"/></pattern></defs>${frame(ex)}
      ${names.map((n, i) => `<text x="58" y="${Y(i) + 3.6}" class="sig-key-text">${n}</text>`).join('')}
    </svg>
    <figcaption>${[['hk', 'Hong Kong'], ['sz', 'Shenzhen'], ['both', 'both'], ['unknown', 'not established'], ['mainland', 'Mainland · city unspecified']].map(([w, t]) => `<span><svg viewBox="12 0 20 20" width="15" height="15" aria-hidden="true">${laneMark(w, 10, 'sig-key-hatch')}</svg>${t}</span>`).join('')}</figcaption>
  </figure>`;
}

export function hydrateSignatures(root = document, size) {
  root.querySelectorAll('[data-signature]').forEach(node => {
    node.innerHTML = signatureSVG(node.dataset.signature, { size: size || Number(node.dataset.size) || 36 });
  });
}
