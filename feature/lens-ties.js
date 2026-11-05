/* Lens C — relationships and support.
   Two accounts, placed by what each person described (Script v3, slide 18).
   City placement shows reported connections—not frequency, distance,
   relationship strength or a representative pattern. */
import { tieIcons } from './ties-icons.js';
import { esc, motionAllowed } from './grammar.js';

const PROFILES = [
  {
    id: 'resident', label: 'Resident with Shenzhen ties',
    hk: [{ icon: 'rental', label: 'Rented home', kind: 'base' }, { icon: 'work', label: 'Work', kind: 'base' }],
    sz: [{ icon: 'property', label: 'Property', kind: 'tie' }, { icon: 'family', label: 'Close family', kind: 'tie' }, { icon: 'friends', label: 'Friends', kind: 'tie' }, { icon: 'activities', label: 'Shopping and activities', kind: 'tie' }],
    reading: 'She works and rents in Hong Kong—but described Shenzhen as home.',
    note: 'Property is her explanation of home. A regular commute is not established.'
  },
  {
    id: 'guide', label: 'Guide who moved north',
    hk: [{ icon: 'home', label: 'Home, before the move', kind: 'former' }, { icon: 'family', label: 'Family visits', kind: 'tie' }],
    sz: [{ icon: 'home', label: 'Home', kind: 'base', arrives: true }, { icon: 'community', label: 'Community life', kind: 'tie' }, { icon: 'guiding', label: 'Guiding friendships', kind: 'tie' }],
    moved: true,
    reading: 'Moving home did not move every connection.',
    note: 'Her guiding workplace is not established in this account.'
  }
];

const tile = item => `<li class="tie tie-${item.kind}"${item.arrives ? ' data-arrives' : ''}><span class="tie-icon" aria-hidden="true"><svg viewBox="0 0 120 112" focusable="false">${tieIcons[item.icon]}</svg></span><span class="tie-label">${esc(item.label)}</span></li>`;

/* The guide's home travels from the outline it leaves in Hong Kong to Shenzhen.
   Family stays where it was. Motion only when the reader allows it. */
function fly(figure) {
  const from = figure.querySelector('.tie-former .tie-icon');
  const to = figure.querySelector('[data-arrives] .tie-icon');
  if (!from || !to || !motionAllowed()) return;
  const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
  const dx = a.left - b.left, dy = a.top - b.top;
  to.animate([{ transform: `translate(${dx}px, ${dy}px)`, offset: 0 }, { transform: `translate(${dx * .5}px, ${dy * .5 - 40}px)`, offset: .5 }, { transform: 'none' }], { duration: 1100, easing: 'cubic-bezier(.45,.05,.25,1)' });
  from.animate([{ opacity: 1, filter: 'none' }, { opacity: 1, offset: .25 }, { opacity: .35, filter: 'grayscale(1)' }], { duration: 1100, fill: 'none' });
}

export function initTies(host) {
  host.innerHTML = `<figure class="ties">
    <div class="ties-switch" role="group" aria-label="Choose whose ties to explore">${PROFILES.map((p, i) => `<button type="button" data-profile="${p.id}" aria-pressed="${i === 0}">${esc(p.label)}</button>`).join('')}</div>
    <div class="ties-board">
      <div class="ties-city city-hk"><h3>Hong Kong</h3><ul></ul></div>
      <span class="ties-boundary" aria-hidden="true"></span>
      <div class="ties-city city-sz"><h3>Shenzhen</h3><ul></ul></div>
    </div>
    <p class="ties-reading" aria-live="polite"></p>
  </figure>`;
  const figure = host.firstElementChild;
  const [hk, sz] = figure.querySelectorAll('.ties-city ul');
  const buttons = [...figure.querySelectorAll('[data-profile]')];
  function set(id) {
    const p = PROFILES.find(x => x.id === id);
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.profile === id)));
    hk.innerHTML = p.hk.map(tile).join('');
    sz.innerHTML = p.sz.map(tile).join('');
    hk.setAttribute('aria-label', `${p.label}: reported ties in Hong Kong`);
    sz.setAttribute('aria-label', `${p.label}: reported ties in Shenzhen`);
    if (p.moved) requestAnimationFrame(() => fly(figure));
    figure.querySelector('.ties-reading').textContent = p.reading;
    figure.dataset.profile = id;
    figure.classList.remove('is-swapping'); void figure.offsetWidth; figure.classList.add('is-swapping');
  }
  figure.addEventListener('click', event => { const b = event.target.closest('[data-profile]'); if (b) set(b.dataset.profile); });
  figure.querySelector('.ties-switch').addEventListener('keydown', event => {
    const i = buttons.indexOf(document.activeElement);
    if (i < 0 || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const next = buttons[(i + 1) % buttons.length];
    next.focus(); set(next.dataset.profile);
  });
  set('resident');
}
