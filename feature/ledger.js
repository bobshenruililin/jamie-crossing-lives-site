/* The ledger: every account in the study, side by side.
   Each row places the parts of one life on the Hong Kong or Shenzhen side of a
   central boundary. Hollow marks are what the account does not establish.
   Highlighting a part of life changes emphasis only, never the data. */
import { cast, FACETS, ARRANGEMENTS, EVIDENCE, tour } from './cast.js';
import { evidenceGlyph, facetGlyph, esc } from './grammar.js';

const ORDER = ['home', 'work', 'spend', 'ties'];

/* Readings of the pattern for each highlighted part of life. Each sentence is
   checked against the rows below; none generalises beyond these accounts. */
const READINGS = {
  all: 'Only one account describes moving home. More often, one part of life crosses: a repair, a meal, a school day, time with family.',
  home: 'One account moved home north; the schoolchildren live on the Mainland side; one resident rents in Hong Kong yet calls Shenzhen home. Four accounts do not say where home is.',
  work: 'Every workplace or school these accounts locate is in Hong Kong. The guide’s preferred work is not located.',
  spend: 'Purchases and services are what most often cross—a repair, meals, shopping and activities. The store manager still does most shopping in Hong Kong.',
  ties: 'Relationships and activities sit on both sides—for the guide and the resident, partly on the side opposite where they live.'
};

function mark(facet, text, side) {
  return `<li class="lmark" data-facet="${facet}" data-side="${side}">${facetGlyph(facet)}<span>${esc(text)}</span></li>`;
}

export function initLedger(host) {
  const rows = cast.map(person => {
    const hk = [], sz = [], unknown = [], notes = [];
    ORDER.forEach(facet => {
      const f = person.facets[facet] || {};
      if (f.hk) hk.push(mark(facet, f.hk, 'hk'));
      if (f.sz) sz.push(mark(facet, f.sz, 'sz'));
      if (!f.hk && !f.sz) {
        const covered = !(person.notCovered || []).includes(facet);
        unknown.push(`<li class="lmark is-unknown" data-facet="${facet}" title="${covered ? 'Not established' : 'Not covered by this record'}">${facetGlyph(facet)}<span class="visually-hidden">${esc(FACETS[facet].label)}: ${covered ? 'not established' : 'not covered by this record'}</span></li>`);
      }
      if (f.note) notes.push(`<li><b>${esc(FACETS[facet].label)}.</b> ${esc(f.note)}</li>`);
    });
    const arrangement = ARRANGEMENTS[person.arrangement];
    const inTour = tour.includes(person.id);
    return `<li class="lrow" data-person="${person.id}" data-evidence="${person.evidence}">
      <button type="button" class="lrow-who" aria-expanded="false" aria-controls="ledger-${person.id}">
        <span class="lrow-name">${esc(person.name)}</span>
        <span class="lrow-meta">${evidenceGlyph(person.evidence)}<span>${person.evidence === 'published' ? 'Published figure' : esc(arrangement.label)}</span></span>
        <svg class="lrow-toggle" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 8l5 5 5-5"/></svg>
      </button>
      <ul class="lrow-side lrow-hk" aria-label="Hong Kong">${hk.join('')}</ul>
      <span class="lrow-boundary" aria-hidden="true"></span>
      <ul class="lrow-side lrow-sz" aria-label="Shenzhen">${sz.join('')}</ul>
      <ul class="lrow-unknown" aria-label="Not established">${unknown.join('')}</ul>
      <div class="lrow-detail" id="ledger-${person.id}" hidden>
        <p>${esc(person.summary)}</p>
        ${notes.length ? `<ul class="lrow-notes">${notes.join('')}</ul>` : ''}
        <p class="lrow-limit">${esc(person.limit)}</p>
        <p class="lrow-source">${evidenceGlyph(person.evidence)}${esc(person.source)}${inTour ? ` · <a href="#step-${person.id}">See this account in the miniature ↑</a>` : ''}</p>
      </div>
    </li>`;
  }).join('');

  host.innerHTML = `<div class="ledger">
    <div class="ledger-controls" role="group" aria-label="Highlight a part of life">
      <button type="button" data-focus="all" aria-pressed="true">All parts</button>
      ${ORDER.map(f => `<button type="button" data-focus="${f}" aria-pressed="false">${facetGlyph(f)}<span>${esc(FACETS[f].label)}</span></button>`).join('')}
    </div>
    <p class="ledger-reading" aria-live="polite">${READINGS.all}</p>
    <div class="ledger-head" aria-hidden="true"><span></span><span class="lh-hk">Hong Kong</span><span class="lh-bd"></span><span class="lh-sz">Shenzhen</span><span class="lh-un">Not established</span></div>
    <ol class="ledger-rows">${rows}</ol>
    <p class="ledger-foot">${evidenceGlyph('account')} Accounts from conversations, paraphrased · ${evidenceGlyph('published')} the schoolchildren are an official count, not an interview · ${evidenceGlyph('unknown')} hollow marks: not established. Selected accounts, not a representative sample or population categories.</p>
  </div>`;

  const ledger = host.firstElementChild;
  const reading = ledger.querySelector('.ledger-reading');
  const focusButtons = [...ledger.querySelectorAll('[data-focus]')];
  function setFocus(id) {
    focusButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.focus === id)));
    ledger.dataset.focus = id;
    reading.textContent = READINGS[id];
  }
  ledger.addEventListener('click', event => {
    const focus = event.target.closest('[data-focus]');
    if (focus) { setFocus(focus.dataset.focus); return; }
    const who = event.target.closest('.lrow-who');
    if (who) {
      const open = who.getAttribute('aria-expanded') !== 'true';
      who.setAttribute('aria-expanded', String(open));
      who.closest('.lrow').classList.toggle('is-open', open);
      ledger.querySelector(`#${who.getAttribute('aria-controls')}`).hidden = !open;
    }
  });
  ledger.querySelector('.ledger-controls').addEventListener('keydown', event => {
    const i = focusButtons.indexOf(document.activeElement);
    if (i < 0 || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const next = focusButtons[(i + (event.key === 'ArrowRight' ? 1 : focusButtons.length - 1)) % focusButtons.length];
    next.focus(); setFocus(next.dataset.focus);
  });
  setFocus('all');
  return { setFocus };
}
