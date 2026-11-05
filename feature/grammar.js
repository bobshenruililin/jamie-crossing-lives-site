/* The visual grammar shared by every component.
   Evidence glyphs say what kind of claim a mark makes; facet glyphs say which
   part of life it concerns. Glyphs never carry meaning by colour alone. */
import { EVIDENCE, FACETS } from './cast.js';

const EVIDENCE_PATHS = {
  account: '<path class="g-fill" d="M3.2 3h9.6A1.7 1.7 0 0 1 14.5 4.7v5.1a1.7 1.7 0 0 1-1.7 1.7H7.4L4.3 14v-2.5H3.2A1.7 1.7 0 0 1 1.5 9.8V4.7A1.7 1.7 0 0 1 3.2 3Z"/>',
  observed: '<path class="g-line" d="M1.4 8S3.8 3.6 8 3.6 14.6 8 14.6 8 12.2 12.4 8 12.4 1.4 8 1.4 8Z"/><circle class="g-fill" cx="8" cy="8" r="2.3"/>',
  published: '<rect class="g-fill" x="1.8" y="8.5" width="3" height="5.5" rx=".6"/><rect class="g-fill" x="6.5" y="3" width="3" height="11" rx=".6"/><rect class="g-fill" x="11.2" y="6" width="3" height="8" rx=".6"/>',
  forecast: '<rect class="g-line" x="2" y="2" width="12" height="12" rx="1.2"/><path class="g-line" d="M2.5 9.5 9.5 2.5M2.5 14 14 2.5M7 14l7-7"/>',
  question: '<circle class="g-line g-dash" cx="8" cy="8" r="6.2"/><path class="g-line" d="M6.2 6.3a1.9 1.9 0 1 1 2.7 1.7c-.6.3-.9.7-.9 1.3v.4"/><circle class="g-fill" cx="8" cy="11.6" r=".85"/>',
  unknown: '<circle class="g-line g-dash" cx="8" cy="8" r="5.6"/>',
  photo: '<path class="g-line" d="M2 5.2h2.6L5.8 3.5h4.4l1.2 1.7H14v8H2Z"/><circle class="g-line" cx="8" cy="9" r="2.4"/>'
};

const FACET_PATHS = {
  home: '<path class="g-line" d="M3 9.2 10 3.4l7 5.8V17H3Z"/><path class="g-line" d="M8.2 17v-4.6h3.6V17"/>',
  work: '<rect class="g-line" x="2.6" y="6.4" width="14.8" height="10" rx="1.6"/><path class="g-line" d="M7.2 6.4V4.8c0-.6.4-1 1-1h3.6c.6 0 1 .4 1 1v1.6M2.6 10.8h14.8"/>',
  spend: '<path class="g-line" d="M4 7h12l-1 10H5Z"/><path class="g-line" d="M7.4 9V5.6a2.6 2.6 0 0 1 5.2 0V9"/>',
  ties: '<circle class="g-line" cx="7" cy="7" r="2.6"/><circle class="g-line" cx="13.6" cy="8" r="2.2"/><path class="g-line" d="M2.4 16.4a4.6 4.6 0 0 1 9.2 0M11 16.4a3.4 3.4 0 0 1 6.8 0"/>'
};

export function evidenceGlyph(type, className = '') {
  const paths = EVIDENCE_PATHS[type] || EVIDENCE_PATHS.unknown;
  return `<svg class="glyph glyph-${type} ${className}" viewBox="0 0 16 16" aria-hidden="true" focusable="false">${paths}</svg>`;
}

export function facetGlyph(facet, className = '') {
  const paths = FACET_PATHS[facet] || '';
  return `<svg class="glyph facet-glyph facet-${facet} ${className}" viewBox="0 0 20 20" aria-hidden="true" focusable="false">${paths}</svg>`;
}

/* A short inline label naming the evidence type. */
export function chip(type, text = EVIDENCE[type]?.label || '') {
  return `<span class="ev-chip ev-${type}">${evidenceGlyph(type)}<span>${esc(text)}</span></span>`;
}

export function facetLabel(facet) { return FACETS[facet]?.label || facet; }

export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

export const asset = file => new URL(`./assets/${file}`, import.meta.url).href;

export const motionAllowed = () => document.documentElement.dataset.motion !== 'off' && !matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Fill every [data-glyph] / [data-facet-glyph] placeholder in static markup. */
export function hydrateGlyphs(root = document) {
  root.querySelectorAll('[data-glyph]').forEach(node => { node.innerHTML = evidenceGlyph(node.dataset.glyph); node.removeAttribute('data-glyph'); });
  root.querySelectorAll('[data-facet-glyph]').forEach(node => { node.innerHTML = facetGlyph(node.dataset.facetGlyph); node.removeAttribute('data-facet-glyph'); });
}
