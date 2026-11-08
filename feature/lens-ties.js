/* Reported connections, not a measured network. Stable rows keep the two
   accounts comparable and leave an unestablished workplace unplaced. */
import { tieIcons } from './ties-icons.js';
import { esc, evidenceGlyph } from './grammar.js';
import { byId } from './cast.js';
/* Original category symbols; neither a real credential nor a depicted encounter. */
const CONTACT_ICONS={
  qualification:`<ellipse class="ta-object-shadow" cx="61" cy="105" rx="42" ry="5"/><path d="M40 9 59 43 83 9" fill="none" stroke="#008c7a" stroke-width="8" stroke-linejoin="round"/><rect class="ta-object-soft" x="29" y="36" width="68" height="67" rx="7"/><rect class="ta-object-paper" x="24" y="32" width="68" height="67" rx="7"/><rect class="ta-object-soft" x="48" y="38" width="20" height="5" rx="2.5"/><circle class="ta-object-soft" cx="42" cy="61" r="8"/><path class="ta-object-soft" d="M29 82v-5a13 13 0 0 1 26 0v5Z"/><path class="ta-object-line" d="M64 55h17M64 63h14M32 90h24"/><circle class="ta-object-accent" cx="76" cy="84" r="11"/><path d="m70 84 4 4 8-9" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path class="ta-object-highlight" d="M30 43v7"/>`,
  support:`<ellipse class="ta-object-shadow" cx="61" cy="103" rx="45" ry="5"/><path class="ta-object-soft" d="m9 59 24-14 20 33-25 15Z"/><path class="ta-object-accent" d="m111 59-24-14-20 33 25 15Z"/><path class="ta-object-paper" d="m35 56 14-12a9 9 0 0 1 11 1l21 16-7 14-10 12a6 6 0 0 1-8 0L39 72Z"/><path class="ta-object-paper" d="m86 56-18-13a10 10 0 0 0-12 0L44 53a5 5 0 0 0 6 8l11-7 16 15Z"/><path class="ta-object-line" d="m48 67 15 13M56 62l15 12M41 73l13 12"/><path class="ta-object-highlight" d="m18 63 8-5M93 58l9 5"/><circle class="ta-object-paper" cx="29" cy="83" r="2"/><circle class="ta-object-paper" cx="92" cy="83" r="2"/>`
};
const icon=name=>`<svg viewBox="0 0 120 112" aria-hidden="true" focusable="false">${CONTACT_ICONS[name]||tieIcons[name]}</svg>`;
const tile=([name,label,kind])=>`<li class="tie ${kind==='former'?'tie-former':''}" ${kind==='arrives'?'data-arrives':''}><span class="tie-icon">${icon(name)}</span><span class="tie-label">${esc(label)}</span></li>`;
export function initTies(host) {
  const profiles = [
    {id:'guide', title:byId.guide.name, summary:'A move of home, with family connections continuing.', hk:[['family','Family visits']], sz:[['home','Home after the move'],['community','Community life'],['guiding','Guiding friendships']], note:'Home moved from Hong Kong to Shenzhen. This diagram focuses on housing and relationships, not a residence calendar or work itinerary.'},
    {id:'resident', title:byId.resident.name, summary:'A Hong Kong base, and a sense of home in Shenzhen.', hk:[['rental','Rented home'],['work','Work']], sz:[['property','Property'],['family','Close family'],['friends','Friends'],['activities','Activities']], note:'She described Shenzhen as home, partly because of property ownership. Her account does not establish a regular cross-border commute.'}
  ];
  host.innerHTML = `<div class="ties-static"><p class="eyebrow">Two accounts · reported connections · static comparison</p>${profiles.map(p=>`<figure class="ties-static-profile" data-profile="${p.id}"><header><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p></header><div class="ties-static-cities"><section><h4>Hong Kong</h4><ul>${p.hk.map(tile).join('')}</ul></section><section><h4>Shenzhen</h4><ul>${p.sz.map(tile).join('')}</ul></section></div><figcaption>${esc(p.note)}</figcaption></figure>`).join('')}</div>`;
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
  host.addEventListener('click',e=>{const b=e.target.closest('button[data-contact]');if(b){b.focus({preventScroll:true});choose(+b.dataset.contact);}});
  host.querySelector('.contact-chain').addEventListener('keydown',e=>{const i=bs.indexOf(document.activeElement);if(i<0||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const j=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;bs[j].focus();choose(j);});
}
