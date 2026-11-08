/* Reported connections, not a measured network. Stable rows keep the two
   accounts comparable and leave an unestablished workplace unplaced. */
import { tieIcons } from './ties-icons.js';
import { esc, motionAllowed, evidenceGlyph } from './grammar.js';
import { byId } from './cast.js';
const PROFILES = {
  resident: {
    label: byId.resident.name,
    home: {hk:[['rental','Rented home']],sz:[['property','Property']]},
    work: {hk:[['work','Work']],sz:[]},
    ties: {hk:[],sz:[['family','Close family'],['friends','Friends'],['activities','Shopping & activities']]},
    readings: {all:'She works and rents in Hong Kong—but described Shenzhen as home.',home:'A rented home in Hong Kong. Property in Shenzhen, where she felt at home.',work:'Her work is in Hong Kong. A regular commute is not established.',ties:'Close family, friends and activities connect her to Shenzhen.'},
    note:'Her account links a sense of home partly to owning property. It does not establish a regular commute.'
  },
  guide: {
    label: byId.guide.name,
    home: {hk:[['home','Home before the move','former']],sz:[['home','Home after the move','arrives']]},
    work: {unknown:'Guiding work · location not established'},
    ties: {hk:[['family','Family visits']],sz:[['community','Community life'],['guiding','Guiding friendships']]},
    readings:{all:'Moving home did not move every connection.',home:'Her home moved to Shenzhen. Family visits in Hong Kong continued.',work:'She took up guiding. The account does not place her guiding workplace.',ties:'Community life in Shenzhen. Continuing family visits in Hong Kong.'},
    note:'These are reported connections, not a full residence calendar. Her guiding workplace is not established.'
  }
};
const FACETS=[['home','Housing'],['work','Work'],['ties','Relationships']];
/* Original category symbols; neither a real credential nor a depicted encounter. */
const CONTACT_ICONS={
  qualification:`<ellipse class="ta-object-shadow" cx="61" cy="105" rx="42" ry="5"/><path d="M40 9 59 43 83 9" fill="none" stroke="#008c7a" stroke-width="8" stroke-linejoin="round"/><rect class="ta-object-soft" x="29" y="36" width="68" height="67" rx="7"/><rect class="ta-object-paper" x="24" y="32" width="68" height="67" rx="7"/><rect class="ta-object-soft" x="48" y="38" width="20" height="5" rx="2.5"/><circle class="ta-object-soft" cx="42" cy="61" r="8"/><path class="ta-object-soft" d="M29 82v-5a13 13 0 0 1 26 0v5Z"/><path class="ta-object-line" d="M64 55h17M64 63h14M32 90h24"/><circle class="ta-object-accent" cx="76" cy="84" r="11"/><path d="m70 84 4 4 8-9" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path class="ta-object-highlight" d="M30 43v7"/>`,
  support:`<ellipse class="ta-object-shadow" cx="61" cy="103" rx="45" ry="5"/><path class="ta-object-soft" d="m9 59 24-14 20 33-25 15Z"/><path class="ta-object-accent" d="m111 59-24-14-20 33 25 15Z"/><path class="ta-object-paper" d="m35 56 14-12a9 9 0 0 1 11 1l21 16-7 14-10 12a6 6 0 0 1-8 0L39 72Z"/><path class="ta-object-paper" d="m86 56-18-13a10 10 0 0 0-12 0L44 53a5 5 0 0 0 6 8l11-7 16 15Z"/><path class="ta-object-line" d="m48 67 15 13M56 62l15 12M41 73l13 12"/><path class="ta-object-highlight" d="m18 63 8-5M93 58l9 5"/><circle class="ta-object-paper" cx="29" cy="83" r="2"/><circle class="ta-object-paper" cx="92" cy="83" r="2"/>`
};
const icon=name=>`<svg viewBox="0 0 120 112" aria-hidden="true" focusable="false">${CONTACT_ICONS[name]||tieIcons[name]}</svg>`;
const tile=([name,label,kind])=>`<li class="tie ${kind==='former'?'tie-former':''}" ${kind==='arrives'?'data-arrives':''}><span class="tie-icon">${icon(name)}</span><span class="tie-label">${esc(label)}</span></li>`;
export function initTies(host){
  host.innerHTML=`<figure class="ties" data-focus="all" data-profile="resident">
    <div class="ties-toolbar"><p class="eyebrow">Two accounts · reported connections</p><div class="ties-switch" role="group" aria-label="Choose whose ties to explore">${Object.entries(PROFILES).map(([id,p])=>`<button type="button" data-profile="${id}" aria-pressed="${id==='resident'}">${esc(p.label)}</button>`).join('')}</div></div>
    <div class="ties-focus" role="group" aria-label="Trace one part of life"><span>Look at</span>${[['all','The whole picture'],...FACETS].map(([id,label])=>`<button type="button" data-focus="${id}" aria-pressed="${id==='all'}">${label}</button>`).join('')}</div>
    <div class="ties-board"><div class="ties-location-head"><h3>Hong Kong</h3><span>The boundary</span><h3>Shenzhen</h3></div><div class="ties-lanes"></div></div>
    <p class="ties-reading" aria-live="polite"></p><figcaption class="ties-note"></figcaption>
  </figure>`;
  const figure=host.firstElementChild;let current='resident',focus='all',animations=[];
  function stopMotion(){animations.forEach(a=>a.cancel());animations=[];}
  function fly(){
    stopMotion();if(!motionAllowed())return;
    const from=figure.querySelector('.tie-former .tie-icon'),to=figure.querySelector('[data-arrives] .tie-icon');if(!from||!to)return;
    const a=from.getBoundingClientRect(),b=to.getBoundingClientRect();
    animations.push(to.animate([{transform:`translate(${a.left-b.left}px,${a.top-b.top}px)`},{transform:`translate(${(a.left-b.left)*.48}px,${(a.top-b.top)*.48-32}px)`,offset:.5},{transform:'none'}],{duration:1200,easing:'cubic-bezier(.45,.05,.25,1)'}));
  }
  function applyFocus(id){
    focus=id;figure.dataset.focus=id;
    figure.querySelectorAll('button[data-focus]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.focus===id)));
    figure.querySelectorAll('.ties-lane').forEach(n=>n.classList.toggle('is-context',id!=='all'&&n.dataset.facet!==id));
    figure.querySelector('.ties-reading').textContent=PROFILES[current].readings[id];
  }
  function set(id){
    stopMotion();current=id;const p=PROFILES[id];figure.dataset.profile=id;
    figure.querySelectorAll('button[data-profile]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.profile===id)));
    figure.querySelector('.ties-lanes').innerHTML=FACETS.map(([facet,label])=>{
      const f=p[facet];
      if(f.unknown)return `<div class="ties-lane ties-lane-unknown" data-facet="${facet}"><span class="ties-lane-label">${label}</span><div class="ties-unplaced">${evidenceGlyph('unknown')}<span>${f.unknown}</span></div></div>`;
      const cell=side=>`<div class="ties-city city-${side}"><ul aria-label="${esc(p.label)}: ${label.toLowerCase()} in ${side==='hk'?'Hong Kong':'Shenzhen'}">${f[side].length?f[side].map(tile).join(''):'<li class="tie-unspecified"><span aria-hidden="true">—</span><small>Not specified here</small></li>'}</ul></div>`;
      return `<div class="ties-lane" data-facet="${facet}">${cell('hk')}<div class="ties-lane-label"><span>${label}</span>${facet==='home'&&id==='guide'?'<button class="ties-replay" type="button" data-replay aria-label="Replay the guide’s home moving from Hong Kong to Shenzhen">Replay move <span aria-hidden="true">→</span></button>':''}</div>${cell('sz')}</div>`;
    }).join('');
    figure.querySelector('.ties-note').textContent=p.note;
    applyFocus(focus);if(id==='guide'&&figure.getBoundingClientRect().top<innerHeight)requestAnimationFrame(fly);
  }
  figure.addEventListener('click',e=>{const p=e.target.closest('button[data-profile]'),f=e.target.closest('button[data-focus]');if(p)set(p.dataset.profile);else if(f)applyFocus(f.dataset.focus);else if(e.target.closest('[data-replay]'))fly();});
  figure.querySelectorAll('[role="group"]').forEach(group=>group.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const bs=[...group.querySelectorAll('button')],i=bs.indexOf(document.activeElement);if(i<0)return;e.preventDefault();const j=e.key==='Home'?0:e.key==='End'?bs.length-1:(i+(e.key==='ArrowRight'?1:bs.length-1))%bs.length;bs[j].focus();bs[j].click();}));
  document.addEventListener('crossing:motion',()=>{if(!motionAllowed())stopMotion();});set('guide');
  if(typeof IntersectionObserver!=='undefined'){const entry=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){if(current==='guide')fly();entry.disconnect();}},{threshold:.35});entry.observe(figure.querySelector('.ties-board'));}
}
const CONTACTS=[
  {icon:'friends',title:'Friends shared a lead',label:'An opportunity',detail:'Friends told her about an opportunity to qualify for the guiding work she wanted to do.'},
  {icon:'qualification',title:'She qualified',label:'A qualification',barrier:'Then: reluctance over her age',detail:'She obtained the qualification. Later, she reported age-related reluctance to offer her work.'},
  {icon:'support',title:'Someone helped',label:'Practical support',detail:'Someone at the organisation intervened. Her account shows a specific way a contact could help her access work.'}
];
export function initContacts(host){
  host.innerHTML=`<div class="contacts" data-contact="0"><p class="eyebrow">${evidenceGlyph('account')} The guide’s account · paraphrased</p><ol class="contact-chain">${CONTACTS.map((s,i)=>`<li><button type="button" data-contact="${i}" aria-pressed="${i===0}" aria-controls="contact-reading"><span class="contact-art">${icon(s.icon)}</span><span class="contact-label">0${i+1} · ${s.label}</span><b>${s.title}</b>${s.barrier?`<span class="contact-barrier">${s.barrier}</span>`:'<span class="contact-barrier-placeholder" aria-hidden="true"></span>'}</button>${i<2?'<span class="contact-arrow" aria-hidden="true">→</span>':''}</li>`).join('')}</ol><div class="contact-caption"><span class="contact-count" aria-hidden="true">01</span><p id="contact-reading" aria-live="polite">${CONTACTS[0].detail}</p></div><p class="fine">One reported experience, not a general rule about access to work. The order of her career and move events is not fully established.</p></div>`;
  const bs=[...host.querySelectorAll('button[data-contact]')];
  function choose(i){host.firstElementChild.dataset.contact=i;bs.forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));host.querySelector('#contact-reading').textContent=CONTACTS[i].detail;host.querySelector('.contact-count').textContent=`0${i+1}`;}
  host.addEventListener('click',e=>{const b=e.target.closest('button[data-contact]');if(b)choose(+b.dataset.contact);});
  host.querySelector('.contact-chain').addEventListener('keydown',e=>{const i=bs.indexOf(document.activeElement);if(i<0||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const j=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;bs[j].focus();choose(j);});
}
