/* Lens B — everyday services and navigation.
   Stops are ordered along a crossing, from Hong Kong to Shenzhen. Observed
   provision and reported offerings are kept distinct (Script v3, slide 15).
   The care loop follows Script v3, slide 16 and the cited Health Bureau
   releases. Use, quality and outcomes are not assessed anywhere here. */
import { photos } from './cast.js';
import { evidenceGlyph, esc, asset } from './grammar.js';
import { openPhoto } from './photo-viewer.js';

const STOPS = [
  { id: 'licence', zone: 'hk', title: 'Licence conversion', ev: 'observed', photo: 'driving-school',
    text: 'A Sheung Shui driving school advertises conversion to Mainland and Hong Kong driving licences.',
    limit: 'Advertising, not completed applications. Licence conversion, not vehicle plates.' },
  { id: 'arrival', zone: 'x', title: 'The arrival form', ev: 'observed',
    text: 'At Futian, immigration staff helped with the arrival form.',
    limit: 'One fieldwork experience of arrival assistance.' },
  { id: 'help', zone: 'x', title: 'A help point', ev: 'observed', photo: 'help-point',
    text: 'Near the exit, a separate help point offered everyday information and described referrals.',
    limit: 'Arrival assistance and help-centre provision are distinct. The operator was not confirmed; referrals were not tested.' },
  { id: 'maps', zone: 'sz', title: 'Two networks, one display', ev: 'observed', photo: 'transit-maps',
    text: 'Shenzhen rail and Hong Kong MTR maps were displayed side by side at an information point.',
    limit: 'Information on display, not evidence of the help received.' },
  { id: 'delivery', zone: 'sz', title: 'Delivery', ev: 'observed', photo: 'service-street', more: 'parcels',
    text: 'Storefronts offering delivery, including cross-border delivery, were visible on Shenzhen streets—beside dental and mobile-phone services.',
    limit: 'Signs show what is offered, not who uses it, parcel volumes or destinations.' },
  { id: 'tuition', zone: 'sz', title: 'Tuition', ev: 'account',
    text: 'A property agent described tuition in Shenzhen for students following the Hong Kong curriculum.',
    limit: 'A reported offering. Use, quality and outcomes were not assessed.' },
  { id: 'community', zone: 'sz', title: 'Community services', ev: 'observed', photo: 'community-sign',
    text: 'A sign points toward a community public service centre in Lianhua Ercun.',
    limit: 'The sign identifies a place, not eligibility, staffing or users.' }
];
const ZONES = { hk: 'Hong Kong', x: 'The crossing', sz: 'Shenzhen' };

export function initServiceTrail(host) {
  const list = Object.entries(ZONES).map(([zone, name]) => `<li class="tr-zone zone-${zone}"><p class="tr-zone-name">${name}</p><ol>${STOPS.filter(s => s.zone === zone).map(s => `<li><button type="button" class="tr-stop" data-stop="${s.id}" aria-pressed="false" aria-controls="trail-view">${evidenceGlyph(s.photo ? 'photo' : s.ev)}<span>${esc(s.title)}</span></button></li>`).join('')}</ol></li>`).join('');
  host.innerHTML = `<div class="trail">
    <ol class="tr-line" role="list">${list}</ol>
    <div class="tr-view" id="trail-view" aria-live="polite"></div>
  </div>`;
  const view = host.querySelector('.tr-view');
  const buttons = [...host.querySelectorAll('.tr-stop')];
  let spotIndex = -1;

  function renderStop(id) {
    const stop = STOPS.find(s => s.id === id);
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.stop === id)));
    const photo = stop.photo && photos[stop.photo];
    spotIndex = -1;
    const figure = photo ? `<figure class="tr-photo" data-format="${photo.width < photo.height ? 'portrait' : 'landscape'}">
        <div class="tr-frame" style="aspect-ratio:${photo.width}/${photo.height}"><img src="${asset(photo.file)}" alt="${esc(photo.alt)}" width="${photo.width}" height="${photo.height}" decoding="async"><span class="tr-box" hidden></span></div>
        <figcaption>${esc(photo.caption)} <button type="button" class="tr-enlarge" data-photo="${stop.photo}">Enlarge ↗</button></figcaption>
      </figure>` : `<div class="tr-nophoto">${evidenceGlyph(stop.ev)}<p>${stop.ev === 'account' ? 'Reported in conversation.' : 'Experienced during fieldwork.'} No photograph.</p></div>`;
    const spots = photo?.spots?.length ? `<div class="tr-spots" role="group" aria-label="Inspect a detail">${['Whole view', ...photo.spots.map(s => s.label)].map((label, i) => `<button type="button" data-spot="${i - 1}" aria-pressed="${i === 0}">${esc(label)}</button>`).join('')}</div><p class="tr-spot-note"></p>` : '';
    const more = stop.more ? `<button type="button" class="tr-more" data-photo="${stop.more}">${evidenceGlyph('photo')}${esc(photos[stop.more].caption)}</button>` : '';
    view.innerHTML = `${figure}<div class="tr-text">
      <p class="tr-kicker zone-${stop.zone}">${ZONES[stop.zone]}</p>
      <h3>${esc(stop.title)}</h3>
      <p class="tr-body">${evidenceGlyph(stop.ev)} ${esc(stop.text)}</p>
      ${spots}${more}
      <p class="tr-limit">${esc(stop.limit)}</p>
    </div>`;
    view.dataset.current = id;
  }
  function chooseSpot(index) {
    const stop = STOPS.find(s => s.id === view.dataset.current);
    const photo = photos[stop.photo];
    const spot = photo.spots[index];
    view.querySelectorAll('[data-spot]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.spot) === index)));
    const box = view.querySelector('.tr-box'), note = view.querySelector('.tr-spot-note');
    box.hidden = !spot;
    note.textContent = spot ? spot.note : '';
    if (spot) { const [x, y, w, h] = spot.rect; Object.assign(box.style, { left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` }); }
  }
  host.addEventListener('click', event => {
    const stop = event.target.closest('[data-stop]');
    if (stop) { renderStop(stop.dataset.stop); return; }
    const spot = event.target.closest('[data-spot]');
    if (spot) { chooseSpot(Number(spot.dataset.spot)); return; }
    const big = event.target.closest('[data-photo]');
    if (big) openPhoto(big.dataset.photo, { from: big });
  });
  host.querySelector('.tr-line').addEventListener('keydown', event => {
    const i = buttons.indexOf(document.activeElement);
    if (i < 0 || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const next = buttons[(i + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : buttons.length - 1)) % buttons.length];
    next.focus(); renderStop(next.dataset.stop);
  });
  renderStop('help');
}

/* Follow-up care: a documented loop across the boundary. */
export function initCareLoop(host) {
  host.innerHTML = `<figure class="care">
    <div class="care-flow" role="img" aria-label="An eligible Hospital Authority follow-up appointment can be taken at a corresponding clinic at HKU–Shenzhen Hospital. Patients authorise access to their records through eHealth. Referral back to Hospital Authority follow-up is available on request, according to clinical need.">
      <span class="care-boundary" aria-hidden="true"></span>
      <p class="care-head hk">Hong Kong</p><p class="care-head sz">Shenzhen</p>
      <div class="care-node n1"><b>1</b><p>Hospital Authority follow-up appointment</p><small>An eligible outpatient</small></div>
      <div class="care-link l1"><span>Patients authorise access to their records through eHealth</span><span class="care-line"></span></div>
      <div class="care-node n2"><b>2</b><p>Corresponding clinic at HKU–Shenzhen Hospital</p><small>Follow-up consultation</small></div>
      <div class="care-node n3"><b>3</b><p>Return to HA follow-up</p><small>On request, according to clinical need</small></div>
      <div class="care-link l2"><span class="care-line"></span><span>A referral route back</span></div>
    </div>
    <p class="care-note">Patients authorise access to their records through eHealth; a referral route leads back to HA follow-up, on request, according to clinical need.</p>
    <div class="care-figure">${evidenceGlyph('published')}<strong>&gt;5,900</strong><p>eligible HA patients had joined the follow-up pilot by January 2026.</p><small>A later release reported over 6,000 by end-February 2026.</small></div>
    <figcaption>Defined outpatient follow-up eligibility. Participation does not establish clinical outcomes or universal coverage. <a href="https://www.info.gov.hk/gia/general/202602/25/P2026022500444.htm" target="_blank" rel="noopener">25 Feb 2026 reply ↗</a><a href="https://www.info.gov.hk/gia/general/202603/31/P2026033100709.htm" target="_blank" rel="noopener">Health Bureau, 31 Mar 2026 ↗</a></figcaption>
  </figure>`;
}
