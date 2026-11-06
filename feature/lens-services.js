/* Lens B — everyday services and navigation.
   Examples are grouped by practical need, with their places labelled. Observed
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
  { id: 'signs', zone: 'x', title: 'Signs toward the port', ev: 'observed', photo: 'crossing-hall', more: 'hsitp-sign',
    text: 'In a crossing hall, signs point toward Futian Port and an interchange for the Innovation and Technology Park—for authorised persons only.',
    limit: 'Wayfinding on display. The station and capture date are not verified; it does not show who uses the route.' },
  { id: 'arrival', zone: 'x', title: 'The arrival form', ev: 'observed',
    text: 'At Futian, immigration staff helped with the arrival form.',
    limit: 'One fieldwork experience of arrival assistance.' },
  { id: 'help', zone: 'x', title: 'A help point', ev: 'observed', photo: 'help-point',
    text: 'Near the exit, a separate help point offered everyday information and described referrals.',
    limit: 'Its operator wasn’t confirmed, and the referrals weren’t tested.' },
  { id: 'startup', zone: 'x', title: 'Start-up help', ev: 'observed', photo: 'help-kiosk',
    text: 'The same service centre advertised company registration and start-up support—and a poster invited Hong Kong people to volunteer.',
    limit: 'Advertised services, not evidence of uptake or outcomes. The operator wasn’t confirmed.' },
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
const NEEDS = [
  {title:'Arrange daily tasks', ids:['licence','delivery','tuition']},
  {title:'Navigate the crossing', ids:['signs','arrival','maps']},
  {title:'Find further support', ids:['help','startup','community']}
];

export function initServiceTrail(host) {
  const thumb = stop => {
    const photo = stop.photo && photos[stop.photo];
    return photo ? `<img src="${asset(photo.file)}" alt="" loading="lazy" decoding="async" width="${photo.width}" height="${photo.height}">` : evidenceGlyph(stop.ev);
  };
  const list = NEEDS.map((need,i) => `<li class="tr-zone tr-need"><p class="tr-zone-name"><span>0${i+1}</span>${need.title}</p><ol>${need.ids.map(id=>STOPS.find(s=>s.id===id)).map(s => `<li><button type="button" class="tr-stop${s.photo ? '' : ' is-text'}" data-stop="${s.id}" data-zone="${s.zone}" aria-pressed="false" aria-controls="trail-view"><span class="tr-thumb">${thumb(s)}</span><span class="tr-name">${esc(s.title)}</span><small class="tr-place">${ZONES[s.zone]}</small></button></li>`).join('')}</ol></li>`).join('');
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
        <figcaption><button type="button" class="tr-enlarge" data-photo="${stop.photo}">Enlarge ↗</button></figcaption>
      </figure>` : `<div class="tr-nophoto">${evidenceGlyph(stop.ev)}<p>${stop.ev === 'account' ? 'Reported in conversation' : 'Experienced at the crossing'}</p></div>`;
    const spots = photo?.spots?.length ? `<div class="tr-spots" role="group" aria-label="Inspect a detail">${['Whole view', ...photo.spots.map(s => s.label)].map((label, i) => `<button type="button" data-spot="${i - 1}" aria-pressed="${i === 0}">${esc(label)}</button>`).join('')}</div><p class="tr-spot-note"></p>` : '';
    const more = stop.more ? `<button type="button" class="tr-more" data-photo="${stop.more}">${evidenceGlyph('photo')}${esc(photos[stop.more].caption)}</button>` : '';
    view.innerHTML = `${figure}<div class="tr-text">
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
  renderStop('licence');
}

/* One documented pathway. The buildings illustrate providers, not actual
   architecture. Controls highlight programme steps, not a patient's journey. */
function clinic(tone) {
  const cross=[[-5,-17],[5,-17],[5,-5],[17,-5],[17,5],[5,5],[5,17],[-5,17],[-5,5],[-17,5],[-17,-5],[-5,-5]].map(([u,v])=>`${100+.9*u+.75*v},${28-.24*u+.4*v}`).join(' ');
  return `<ellipse cx="90" cy="159" rx="110" ry="17" fill="#173e4010"/>
    <path d="m-18 133 114-36 117 35-116 39Z" fill="#d7dccd" stroke="#173e4033"/>
    <path d="M24 26 123 1l55 30-97 28Z" fill="#fcf9f0" stroke="#173e40" stroke-width="2"/>
    <path d="M24 26v102l57 32V59Z" fill="#e6e4d7" stroke="#173e40" stroke-width="2"/>
    <path d="M81 59 178 31v101l-97 28Z" fill="#f9f6eb" stroke="#173e40" stroke-width="2"/>
    <path d="M24 78 81 110l97-28v15l-97 28L24 93Z" fill="${tone}"/>
    <path d="m27 29 54 30 95-27" fill="none" stroke="#fff" stroke-width="3"/>
    ${[0,1,2].map(i=>`<path d="m${98+i*23} ${66-i*6.6} 13-4v17l-13 4Z" fill="#a3bdb5" stroke="#173e40" stroke-width="1.5"/>`).join('')}
    ${[0,1].map(i=>`<path d="m${36+i*23} ${45+i*13} 13 7v17l-13-7Z" fill="#b7c9c1" stroke="#173e40" stroke-width="1.5"/>`).join('')}
    <path d="m119 123 22-6v26l-22 6Z" fill="#173e40"/><path d="m130 120v27" stroke="#f2eee3"/>
    <polygon points="${cross}" fill="${tone}"/>`;
}
const CARE_STEPS = [
  {label:'An eligible appointment', short:'Start in Hong Kong', body:'The pilot is for eligible Hospital Authority patients with follow-up appointments.'},
  {label:'Follow-up in Shenzhen', short:'Connect the care', body:'At HKU–Shenzhen Hospital, patients authorise access to their records through eHealth.'},
  {label:'A route back', short:'Return when needed', body:'Referral back to Hospital Authority follow-up is available on request, according to clinical need.'}
];
export function initCareLoop(host) {
  host.innerHTML = `<figure class="care" data-care-step="1">
    <div class="care-intro"><p class="eyebrow">${evidenceGlyph('published')} One documented programme</p><p>Explore the pathway <span aria-hidden="true">↓</span></p></div>
    <div class="care-layout">
      <div class="care-pathway">
        <div class="care-places"><span>Hong Kong</span><span class="care-boundary-label">The boundary</span><span>Shenzhen</span></div>
        <svg class="care-drawing" viewBox="0 0 900 350" role="img" aria-label="Illustrative care pathway between Hospital Authority follow-up in Hong Kong and HKU–Shenzhen Hospital, with a return route when needed. Not a geographic map.">
          <defs><marker id="care-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="m1 1 7 4-7 4" fill="none" stroke="context-stroke" stroke-width="1.5"/></marker></defs>
          <path d="M450 12V335" class="care-border"/>
          <path d="M265 147C370 60 540 60 647 147" class="care-route care-forward" pathLength="1" marker-end="url(#care-arrow)"/>
          <path d="M650 244C590 330 305 330 251 244" class="care-route care-return" pathLength="1" marker-end="url(#care-arrow)"/>
          <g class="care-building care-building-hk" transform="translate(90 85)">${clinic('#c9512d')}</g>
          <g class="care-building care-building-sz" transform="translate(610 85)">${clinic('#008c7a')}</g>
          <g class="care-record" transform="translate(423 104)"><rect x="4" y="5" width="51" height="68" rx="4" fill="#173e401b"/><path d="M0 3a3 3 0 0 1 3-3h34l14 14v49a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3Z" fill="#fbf8ef" stroke="#173e40" stroke-width="2"/><path d="M37 0v14h14" fill="#dbe6dc" stroke="#173e40" stroke-width="2"/><path d="M23 18v18m-9-9h18" stroke="#008c7a" stroke-width="6"/><path d="M12 46h27M12 54h20" stroke="#173e40" stroke-width="2"/></g>
          <g class="care-record-label" aria-hidden="true"><rect x="375" y="185" width="150" height="26" rx="13" fill="#f8f5ec"/><text x="450" y="203" text-anchor="middle">Records via eHealth</text></g>
          <g class="care-back-label" aria-hidden="true"><rect x="367" y="279" width="166" height="27" rx="13" fill="#f8f5ec"/><text x="450" y="298" text-anchor="middle">Back, if needed</text></g>
        </svg>
        <div class="care-providers"><span>Hospital Authority<br><b>Follow-up appointment</b></span><span>HKU–Shenzhen Hospital<br><b>Follow-up clinic</b></span></div>
      </div>
      <aside class="care-figure"><span class="care-stat-label">Programme participation</span><strong>&gt;5,900</strong><p>eligible patients had joined<br>by January 2026.</p><span class="care-later">Over 6,000 by end-February.</span><p class="care-stat-limit">Participation is recorded.<br>Clinical outcomes are not assessed here.</p></aside>
    </div>
    <ol class="care-steps" aria-label="Explore the care pathway">${CARE_STEPS.map((step,i)=>`<li><button type="button" data-care-go="${i+1}" aria-pressed="${i===0}" aria-controls="care-reading"><span class="care-step-number">0${i+1}</span><span><small>${step.short}</small><b>${step.label}</b></span><span class="care-step-arrow" aria-hidden="true">${i===2?'↶':'→'}</span></button></li>`).join('')}</ol>
    <p class="care-reading" id="care-reading" aria-live="polite">${CARE_STEPS[0].body}</p>
    <figcaption>Illustrated programme pathway, not a patient’s recorded journey. <a href="https://www.info.gov.hk/gia/general/202602/25/P2026022500444.htm" target="_blank" rel="noopener">25 Feb 2026 reply ↗</a><a href="https://www.info.gov.hk/gia/general/202603/31/P2026033100709.htm" target="_blank" rel="noopener">Health Bureau, 31 Mar 2026 ↗</a></figcaption>
  </figure>`;
  const figure=host.firstElementChild, buttons=[...host.querySelectorAll('[data-care-go]')];
  const select=(step)=>{figure.dataset.careStep=step; buttons.forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.careGo===step)));host.querySelector('.care-reading').textContent=CARE_STEPS[step-1].body;};
  host.addEventListener('click',event=>{const b=event.target.closest('[data-care-go]');if(b)select(+b.dataset.careGo);});
  host.querySelector('.care-steps').addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;const i=buttons.indexOf(document.activeElement);if(i<0)return;event.preventDefault();const n=event.key==='Home'?0:event.key==='End'?2:(i+(event.key==='ArrowRight'?1:2))%3;buttons[n].focus();select(n+1);});
}
